# tomtomlife-youtube-mcp-server

TomTomLife YouTube MCP Bridge turns a YouTube URL into AI-readable context for ChatGPT, Codex, n8n, and future agents.

It is not a permanent video downloader. It is a context bridge.

## 1. What Is This Project?

This project is an MCP server that lets an AI client inspect a YouTube video through tools:

- read metadata
- read captions/transcripts
- build a timestamped timeline
- extract a frame at a timestamp
- create chat context
- create an agent-ready brief

The goal is to help an AI discuss a video with grounded timestamp context instead of guessing from a URL.

## 2. What Problem Created It?

TomTom often learns from videos where the important knowledge is spread across:

- spoken explanation
- subtitles
- screen recordings
- silent visual steps
- workflow demonstrations
- tool setup screens

Without a bridge, TomTom has to watch the video, remember the useful parts, and explain them back to the AI manually.

This server lets the AI receive useful video context directly through MCP.

## 3. Who Uses It?

Primary users:

- TomTom, as a human operator and builder
- ChatGPT or Codex, as an AI collaborator
- n8n workflows, as automation pipelines
- future multimodal agents, as video-understanding workers

The project is also a seed for a larger TomTomLife AI workspace where each platform has its own bridge.

## 4. How Does It Work?

```text
YouTube URL
-> yt-dlp metadata
-> captions/transcript when available
-> timeline and chapters
-> optional frame extraction through ffmpeg
-> compact MCP tool response
-> AI/n8n/agent uses the context
```

The bridge caches small context artifacts:

- metadata JSON
- transcript chunks
- timeline JSON
- selected keyframe JPGs
- chat session JSON
- agent brief JSON

Temporary audio for fallback transcription is deleted after use. Full video files are not kept.

For a plain-language explanation, see [HOW_IT_WORKS.md](./HOW_IT_WORKS.md).

## 5. How Do I Install Or Run It?

Requirements:

- Node.js 20+
- `yt-dlp` in PATH for real YouTube reads
- or a cloned `yt-dlp` repo plus `YT_DLP_PYTHON` and `YT_DLP_SOURCE_DIR`
- `ffmpeg` in PATH, or set `FFMPEG_PATH`, for frame extraction
- optional `whisper` CLI, or set `WHISPER_CLI`, for audio fallback

Run:

```powershell
node .\src\server.js
```

Quick self-test:

```powershell
node .\src\selftest.js
```

Expected output:

```text
OK tools=inspect_video,get_transcript,get_timeline,get_frame_at,summarize_video,create_chat_context,create_agent_brief
```

MCP config example:

```json
{
  "mcpServers": {
    "tomtomlife-youtube": {
      "command": "node",
      "args": [
        "C:\\Users\\TomTomLife\\Documents\\Codex\\2026-07-03\\comfyui-mcp-workspace-youtube-mcp-youtube\\outputs\\tomtomlife-youtube-mcp-server\\src\\server.js"
      ],
      "env": {
        "YOUTUBE_MCP_CACHE_DIR": "C:\\Users\\TomTomLife\\Documents\\Codex\\2026-07-03\\comfyui-mcp-workspace-youtube-mcp-youtube\\outputs\\tomtomlife-youtube-mcp-server\\cache",
        "YT_DLP_PYTHON": "C:\\Users\\TomTomLife\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe",
        "YT_DLP_SOURCE_DIR": "C:\\Users\\TomTomLife\\Documents\\Codex\\2026-07-03\\comfyui-mcp-workspace-youtube-mcp-youtube\\work\\yt-dlp",
        "FFMPEG_PATH": "C:\\Users\\TomTomLife\\AppData\\Local\\com.debpalash.omnivoice-studio\\tools\\ffmpeg.exe"
      }
    }
  }
}
```

## 6. What Is The Current Status?

Current status: early working seed.

Implemented:

- MCP stdio server
- tool listing and tool calls
- metadata inspection path through `yt-dlp`
- transcript extraction from captions
- timeline construction
- frame extraction at timestamp
- chat context creation
- agent brief creation
- cache policy documentation
- decision log seed

Still needs real-world hardening:

- run against several real YouTube URLs
- improve caption language selection
- add better error handling for unavailable videos
- add scene-change keyframes
- add vision captions for visual steps
- add n8n workflow examples

## 7. What Is Next?

Next useful steps:

- test `inspect_video(url)` with a real YouTube URL
- add `docs/decisions/` entries as architecture choices become stable
- add GitHub Issues for features, research, security, and architecture questions
- implement `analyze_visual_steps(url)`
- create n8n workflow examples for one URL and batch research
- later, connect this repo to a central `tomtomlife-system-blueprint` repo

## Tools

- `inspect_video(url)` - title, channel, duration, description, thumbnail
- `get_transcript(url)` - captions/subtitles as timestamp chunks
- `get_timeline(url)` - metadata, chapters, transcript chunks
- `get_frame_at(url, timestamp)` - one thumbnail image at a timestamp
- `summarize_video(url)` - local extractive timeline summary
- `create_chat_context(url)` - returns `session_id` for timestamp-aware chat
- `create_agent_brief(url, goal)` - compact payload for ChatGPT, Codex, n8n, or another agent

## Project Memory

- [VISION.md](./VISION.md) - product and system vision
- [HOW_IT_WORKS.md](./HOW_IT_WORKS.md) - plain-language bridge explanation
- [VIBE_CODING_GUIDE.md](./VIBE_CODING_GUIDE.md) - problem-to-app building guide
- [docs/system/SYSTEM_MAP.md](./docs/system/SYSTEM_MAP.md) - how this bridge fits TomTomLife systems
- [docs/system/PROJECT_INDEX.md](./docs/system/PROJECT_INDEX.md) - related project map
- [docs/decisions/](./docs/decisions/) - architecture decision records
