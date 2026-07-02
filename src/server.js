#!/usr/bin/env node
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, "..");
const cacheRoot = process.env.YOUTUBE_MCP_CACHE_DIR || path.join(projectRoot, "cache");
const ffmpegPath = process.env.FFMPEG_PATH || "ffmpeg";
const ytDlpPath = process.env.YT_DLP_PATH || "yt-dlp";
const ytDlpPython = process.env.YT_DLP_PYTHON || "";
const ytDlpSourceDir = process.env.YT_DLP_SOURCE_DIR || "";
const defaultFrameStepSeconds = Number(process.env.YOUTUBE_MCP_FRAME_STEP_SECONDS || 60);

const tools = [
  {
    name: "inspect_video",
    description: "Read YouTube metadata without permanently downloading the video.",
    inputSchema: objectSchema({
      url: stringSchema("YouTube URL")
    }, ["url"])
  },
  {
    name: "get_transcript",
    description: "Return caption/transcript chunks with timestamps. Uses captions first, then optional audio fallback.",
    inputSchema: objectSchema({
      url: stringSchema("YouTube URL"),
      language: stringSchema("Preferred caption language, for example en, th, auto", "auto"),
      allowAudioFallback: booleanSchema("Allow temporary audio extraction when captions are missing", false)
    }, ["url"])
  },
  {
    name: "get_timeline",
    description: "Return chapters plus transcript chunks as a navigable timeline.",
    inputSchema: objectSchema({
      url: stringSchema("YouTube URL"),
      language: stringSchema("Preferred caption language", "auto")
    }, ["url"])
  },
  {
    name: "get_frame_at",
    description: "Extract one temporary frame thumbnail at a timestamp and cache only that image.",
    inputSchema: objectSchema({
      url: stringSchema("YouTube URL"),
      timestamp: stringSchema("Timestamp as seconds or HH:MM:SS")
    }, ["url", "timestamp"])
  },
  {
    name: "summarize_video",
    description: "Build a local extractive summary from metadata, chapters, and transcript.",
    inputSchema: objectSchema({
      url: stringSchema("YouTube URL"),
      language: stringSchema("Preferred caption language", "auto"),
      maxItems: numberSchema("Maximum summary bullets", 12)
    }, ["url"])
  },
  {
    name: "create_chat_context",
    description: "Create a reusable session_id so the AI can discuss timestamps from the same video context.",
    inputSchema: objectSchema({
      url: stringSchema("YouTube URL"),
      language: stringSchema("Preferred caption language", "auto"),
      includeKeyframes: booleanSchema("Extract keyframes every X seconds", false),
      frameStepSeconds: numberSchema("Spacing for keyframes when includeKeyframes is true", defaultFrameStepSeconds)
    }, ["url"])
  },
  {
    name: "create_agent_brief",
    description: "Package video context into a compact brief for ChatGPT, Codex, n8n, or another AI agent.",
    inputSchema: objectSchema({
      url: stringSchema("YouTube URL"),
      goal: stringSchema("What the agent should learn or produce from the video", "understand the useful ideas and steps"),
      language: stringSchema("Preferred caption language", "auto"),
      maxEvidenceItems: numberSchema("Maximum timestamped evidence items", 10)
    }, ["url"])
  }
];

function stringSchema(description, defaultValue) {
  const schema = { type: "string", description };
  if (defaultValue !== undefined) schema.default = defaultValue;
  return schema;
}

function booleanSchema(description, defaultValue) {
  return { type: "boolean", description, default: defaultValue };
}

function numberSchema(description, defaultValue) {
  return { type: "number", description, default: defaultValue };
}

function objectSchema(properties, required = []) {
  return {
    type: "object",
    properties,
    required,
    additionalProperties: false
  };
}

function videoIdFromUrl(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) return parsed.pathname.split("/").filter(Boolean)[0] || null;
    if (parsed.searchParams.has("v")) return parsed.searchParams.get("v");
    const parts = parsed.pathname.split("/").filter(Boolean);
    const marker = parts.findIndex((part) => ["shorts", "embed", "live"].includes(part));
    if (marker >= 0 && parts[marker + 1]) return parts[marker + 1];
  } catch {
    return null;
  }
  return null;
}

function cacheKey(url) {
  const id = videoIdFromUrl(url);
  if (id) return id.replace(/[^a-zA-Z0-9_-]/g, "");
  return createHash("sha256").update(url).digest("hex").slice(0, 24);
}

function cachePath(url, name) {
  return path.join(cacheRoot, cacheKey(url), name);
}

async function readJsonIfExists(file) {
  if (!existsSync(file)) return null;
  return JSON.parse(await readFile(file, "utf8"));
}

async function writeJson(file, data) {
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      windowsHide: true,
      stdio: ["ignore", "pipe", "pipe"],
      ...options
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", (error) => reject(new Error(`${command} failed to start: ${error.message}`)));
    child.on("close", (code) => {
      if (code === 0) resolve({ stdout, stderr });
      else reject(new Error(`${command} exited ${code}: ${stderr.trim() || stdout.trim()}`));
    });
  });
}

function ytDlpInvocation(args) {
  if (ytDlpPython && ytDlpSourceDir) {
    return {
      command: ytDlpPython,
      args: [path.join(ytDlpSourceDir, "yt_dlp", "__main__.py"), ...args]
    };
  }
  return { command: ytDlpPath, args };
}

async function runYtDlp(args) {
  const invocation = ytDlpInvocation(args);
  return runCommand(invocation.command, invocation.args);
}

async function getYtDlpJson(url) {
  const cached = await readJsonIfExists(cachePath(url, "metadata.json"));
  if (cached) return cached.raw || cached;

  const { stdout } = await runYtDlp([
    "--dump-json",
    "--skip-download",
    "--no-warnings",
    url
  ]);
  const raw = JSON.parse(stdout.trim().split(/\r?\n/).at(-1));
  await writeJson(cachePath(url, "metadata.json"), {
    cached_at: new Date().toISOString(),
    source: "yt-dlp",
    raw
  });
  return raw;
}

function compactMetadata(raw, url) {
  return {
    url,
    video_id: raw.id || videoIdFromUrl(url),
    title: raw.title || null,
    channel: raw.channel || raw.uploader || null,
    duration_seconds: raw.duration || null,
    description: raw.description || "",
    thumbnail: raw.thumbnail || raw.thumbnails?.at(-1)?.url || null,
    upload_date: raw.upload_date || null,
    webpage_url: raw.webpage_url || url
  };
}

async function inspectVideo({ url }) {
  const raw = await getYtDlpJson(url);
  const metadata = compactMetadata(raw, url);
  await writeJson(cachePath(url, "inspect_video.json"), metadata);
  return metadata;
}

function pickSubtitle(raw, language = "auto") {
  const groups = [];
  if (language && language !== "auto") {
    groups.push([language, raw.subtitles?.[language]], [language, raw.automatic_captions?.[language]]);
  }
  for (const [lang, entries] of Object.entries(raw.subtitles || {})) groups.push([lang, entries]);
  for (const [lang, entries] of Object.entries(raw.automatic_captions || {})) groups.push([lang, entries]);

  for (const [lang, entries] of groups) {
    const usable = (entries || []).find((entry) =>
      ["json3", "srv3", "vtt", "ttml"].includes(entry.ext) && entry.url
    );
    if (usable) return { language: lang, entry: usable };
  }
  return null;
}

function parseJson3Transcript(json, language) {
  const chunks = [];
  for (const event of json.events || []) {
    if (!event.segs || event.tStartMs === undefined) continue;
    const text = event.segs.map((seg) => seg.utf8 || "").join("").replace(/\s+/g, " ").trim();
    if (!text) continue;
    const start = event.tStartMs / 1000;
    const duration = (event.dDurationMs || 0) / 1000;
    chunks.push({
      start,
      end: duration ? start + duration : null,
      timestamp: formatTimestamp(start),
      text,
      language
    });
  }
  return mergeTranscriptChunks(chunks);
}

function parseVttTranscript(text, language) {
  const chunks = [];
  const blocks = text.split(/\r?\n\r?\n/);
  for (const block of blocks) {
    const lines = block.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const timing = lines.find((line) => line.includes("-->"));
    if (!timing) continue;
    const [startRaw, endRaw] = timing.split("-->").map((part) => part.trim().split(/\s+/)[0]);
    const body = lines.slice(lines.indexOf(timing) + 1).join(" ").replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (!body) continue;
    const start = parseTimestamp(startRaw);
    const end = parseTimestamp(endRaw);
    chunks.push({ start, end, timestamp: formatTimestamp(start), text: body, language });
  }
  return mergeTranscriptChunks(chunks);
}

function mergeTranscriptChunks(chunks, targetSeconds = 30) {
  const merged = [];
  let current = null;
  for (const chunk of chunks) {
    if (!current) {
      current = { ...chunk };
      continue;
    }
    if ((chunk.start - current.start) <= targetSeconds) {
      current.end = chunk.end;
      current.text = `${current.text} ${chunk.text}`.replace(/\s+/g, " ").trim();
    } else {
      merged.push(current);
      current = { ...chunk };
    }
  }
  if (current) merged.push(current);
  return merged;
}

async function getTranscript({ url, language = "auto", allowAudioFallback = false }) {
  const transcriptFile = cachePath(url, `transcript-${language}.json`);
  const cached = await readJsonIfExists(transcriptFile);
  if (cached) return cached;

  const raw = await getYtDlpJson(url);
  const selected = pickSubtitle(raw, language);
  if (!selected) {
    if (allowAudioFallback) return transcribeAudioFallback(url, language);
    return {
      url,
      source: "none",
      language,
      chunks: [],
      note: "No captions were found. Retry with allowAudioFallback=true after installing yt-dlp plus a local Whisper CLI."
    };
  }

  const response = await fetch(selected.entry.url);
  if (!response.ok) throw new Error(`caption fetch failed: HTTP ${response.status}`);
  const body = await response.text();
  let chunks;
  if (selected.entry.ext === "json3") chunks = parseJson3Transcript(JSON.parse(body), selected.language);
  else chunks = parseVttTranscript(body, selected.language);

  const result = {
    url,
    source: selected.entry.ext,
    language: selected.language,
    chunks
  };
  await writeJson(transcriptFile, result);
  return result;
}

async function transcribeAudioFallback(url, language) {
  const sessionDir = path.join(cacheRoot, cacheKey(url), "tmp");
  const audioPath = path.join(sessionDir, "audio.m4a");
  await mkdir(sessionDir, { recursive: true });
  try {
    await runYtDlp([
      "-f", "bestaudio[ext=m4a]/bestaudio",
      "--no-playlist",
      "-o", audioPath,
    url
    ]);
    const whisper = process.env.WHISPER_CLI || "whisper";
    const { stdout } = await runCommand(whisper, [
      audioPath,
      "--output_format", "json",
      "--output_dir", sessionDir,
      ...(language && language !== "auto" ? ["--language", language] : [])
    ]);
    const jsonPath = path.join(sessionDir, "audio.json");
    const whisperJson = existsSync(jsonPath) ? JSON.parse(await readFile(jsonPath, "utf8")) : { text: stdout };
    const chunks = (whisperJson.segments || []).map((seg) => ({
      start: seg.start,
      end: seg.end,
      timestamp: formatTimestamp(seg.start),
      text: seg.text.trim(),
      language
    }));
    const result = { url, source: "whisper_audio_fallback", language, chunks };
    await writeJson(cachePath(url, `transcript-${language}.json`), result);
    return result;
  } finally {
    await rm(sessionDir, { recursive: true, force: true });
  }
}

async function getTimeline({ url, language = "auto" }) {
  const raw = await getYtDlpJson(url);
  const transcript = await getTranscript({ url, language });
  const chapters = (raw.chapters || []).map((chapter) => ({
    start: chapter.start_time,
    end: chapter.end_time,
    timestamp: formatTimestamp(chapter.start_time),
    title: chapter.title
  }));
  const result = {
    metadata: compactMetadata(raw, url),
    chapters,
    transcript_chunks: transcript.chunks
  };
  await writeJson(cachePath(url, "timeline.json"), result);
  return result;
}

async function getFrameAt({ url, timestamp }) {
  const seconds = typeof timestamp === "number" ? timestamp : parseTimestamp(String(timestamp));
  const safeStamp = String(Math.floor(seconds)).padStart(6, "0");
  const outFile = cachePath(url, `frame-${safeStamp}.jpg`);
  if (!existsSync(outFile)) {
    await mkdir(path.dirname(outFile), { recursive: true });
    const raw = await getYtDlpJson(url);
    const videoUrl = raw.url || raw.requested_downloads?.[0]?.url;
    if (!videoUrl) {
      throw new Error("No direct stream URL found for frame extraction. Install/update yt-dlp and retry.");
    }
    await runCommand(ffmpegPath, [
      "-y",
      "-ss", String(seconds),
      "-i", videoUrl,
      "-frames:v", "1",
      "-vf", "scale=480:-1",
      outFile
    ]);
  }
  return {
    url,
    timestamp: formatTimestamp(seconds),
    frame_path: outFile,
    note: "Only this thumbnail is cached; the video file is not kept."
  };
}

async function summarizeVideo({ url, language = "auto", maxItems = 12 }) {
  const timeline = await getTimeline({ url, language });
  const bullets = [];
  for (const chapter of timeline.chapters) {
    bullets.push(`${chapter.timestamp} ${chapter.title}`);
    if (bullets.length >= maxItems) break;
  }
  if (bullets.length < maxItems) {
    const stride = Math.max(1, Math.ceil(timeline.transcript_chunks.length / Math.max(1, maxItems - bullets.length)));
    for (let i = 0; i < timeline.transcript_chunks.length && bullets.length < maxItems; i += stride) {
      const chunk = timeline.transcript_chunks[i];
      bullets.push(`${chunk.timestamp} ${truncate(chunk.text, 180)}`);
    }
  }
  return {
    metadata: timeline.metadata,
    summary: bullets,
    note: "Extractive local summary from chapters/transcript. Connect an LLM client for richer synthesis."
  };
}

async function createChatContext({ url, language = "auto", includeKeyframes = false, frameStepSeconds = defaultFrameStepSeconds }) {
  const timeline = await getTimeline({ url, language });
  const sessionId = `yt_${cacheKey(url)}_${Date.now().toString(36)}`;
  const keyframes = [];
  if (includeKeyframes && timeline.metadata.duration_seconds) {
    for (let seconds = 0; seconds < timeline.metadata.duration_seconds; seconds += frameStepSeconds) {
      try {
        keyframes.push(await getFrameAt({ url, timestamp: seconds }));
      } catch (error) {
        keyframes.push({ timestamp: formatTimestamp(seconds), error: error.message });
      }
    }
  }
  const context = {
    session_id: sessionId,
    created_at: new Date().toISOString(),
    url,
    metadata: timeline.metadata,
    timeline_path: cachePath(url, "timeline.json"),
    keyframes,
    rules: {
      permanent_video_downloads: false,
      cached_artifacts: ["metadata", "transcript", "timeline", "keyframes"],
      temporary_audio_deleted_after_transcription: true
    }
  };
  await writeJson(path.join(cacheRoot, "sessions", `${sessionId}.json`), context);
  return context;
}

async function createAgentBrief({ url, goal = "understand the useful ideas and steps", language = "auto", maxEvidenceItems = 10 }) {
  const timeline = await getTimeline({ url, language });
  const summary = await summarizeVideo({ url, language, maxItems: maxEvidenceItems });
  const evidence = selectEvidenceItems(timeline, maxEvidenceItems);
  const brief = {
    brief_type: "youtube_context_bridge_agent_brief",
    created_at: new Date().toISOString(),
    goal,
    metadata: timeline.metadata,
    context_available: {
      metadata: true,
      chapters: timeline.chapters.length > 0,
      transcript_chunks: timeline.transcript_chunks.length,
      visual_frames: "available through get_frame_at(url, timestamp)"
    },
    how_to_use: [
      "Use metadata to decide whether the video matches the goal.",
      "Use chapters and evidence timestamps to ground claims.",
      "Call get_frame_at for visual or silent-demo moments.",
      "Ask follow-up questions against timestamps instead of guessing.",
      "For n8n, pass this brief as the compact payload and fetch deeper context only when needed."
    ],
    summary: summary.summary,
    timestamped_evidence: evidence,
    suggested_agent_tasks: [
      "Extract concrete steps or workflow actions.",
      "Identify tools, APIs, screens, and decisions shown in the video.",
      "Mark which timestamps deserve visual inspection.",
      "Generate use cases or project ideas that fit the user's goal.",
      "List missing context that needs another source or another video."
    ],
    cache_policy: {
      permanent_video_downloads: false,
      cached_artifacts: ["metadata", "transcript", "timeline", "selected keyframes", "brief"],
      temporary_audio_deleted_after_transcription: true
    }
  };
  await writeJson(cachePath(url, "agent-brief.json"), brief);
  return brief;
}

function selectEvidenceItems(timeline, maxItems) {
  const items = [];
  for (const chapter of timeline.chapters) {
    items.push({
      type: "chapter",
      timestamp: chapter.timestamp,
      start: chapter.start,
      end: chapter.end,
      text: chapter.title
    });
    if (items.length >= maxItems) return items;
  }

  const chunks = timeline.transcript_chunks || [];
  const stride = Math.max(1, Math.ceil(chunks.length / Math.max(1, maxItems - items.length)));
  for (let i = 0; i < chunks.length && items.length < maxItems; i += stride) {
    const chunk = chunks[i];
    items.push({
      type: "transcript",
      timestamp: chunk.timestamp,
      start: chunk.start,
      end: chunk.end,
      text: truncate(chunk.text, 240)
    });
  }
  return items;
}

function truncate(text, max) {
  if (text.length <= max) return text;
  return `${text.slice(0, max - 1).trim()}...`;
}

function parseTimestamp(value) {
  if (/^\d+(\.\d+)?$/.test(value)) return Number(value);
  const parts = value.replace(",", ".").split(":").map(Number);
  if (parts.some(Number.isNaN)) throw new Error(`Invalid timestamp: ${value}`);
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function formatTimestamp(seconds = 0) {
  const safe = Math.max(0, Math.floor(seconds));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
    : `${m}:${String(s).padStart(2, "0")}`;
}

async function callTool(name, args) {
  switch (name) {
    case "inspect_video":
      return inspectVideo(args);
    case "get_transcript":
      return getTranscript(args);
    case "get_timeline":
      return getTimeline(args);
    case "get_frame_at":
      return getFrameAt(args);
    case "summarize_video":
      return summarizeVideo(args);
    case "create_chat_context":
      return createChatContext(args);
    case "create_agent_brief":
      return createAgentBrief(args);
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

function resultContent(data) {
  return {
    content: [
      {
        type: "text",
        text: JSON.stringify(data, null, 2)
      }
    ]
  };
}

async function handleMessage(message) {
  if (message.method === "initialize") {
    return {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: {
        name: "tomtomlife-youtube-mcp-server",
        version: "0.1.0"
      }
    };
  }
  if (message.method === "tools/list") return { tools };
  if (message.method === "tools/call") {
    const { name, arguments: args = {} } = message.params || {};
    return resultContent(await callTool(name, args));
  }
  if (message.method === "notifications/initialized") return null;
  throw new Error(`Unsupported method: ${message.method}`);
}

let input = "";
process.stdin.setEncoding("utf8");
process.stdin.on("data", async (chunk) => {
  input += chunk;
  const lines = input.split(/\r?\n/);
  input = lines.pop() || "";
  for (const line of lines) {
    if (!line.trim()) continue;
    let message;
    try {
      message = JSON.parse(line);
      const result = await handleMessage(message);
      if (message.id !== undefined && result !== null) {
        process.stdout.write(`${JSON.stringify({ jsonrpc: "2.0", id: message.id, result })}\n`);
      }
    } catch (error) {
      const id = message?.id ?? null;
      process.stdout.write(`${JSON.stringify({
        jsonrpc: "2.0",
        id,
        error: { code: -32000, message: error.message }
      })}\n`);
    }
  }
});
