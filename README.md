# tomtomlife-youtube-mcp-server

YouTube Bridge for AI context. The server reads video context for an MCP client without keeping permanent MP4 downloads.

## What It Caches

- Metadata
- Transcript/subtitle chunks
- Timeline JSON
- Optional keyframe JPG thumbnails
- Optional chat session JSON

Temporary audio used for fallback transcription is deleted after the transcription step. Full video files are not kept.

## Tools

- `inspect_video(url)` - title, channel, duration, description, thumbnail
- `get_transcript(url)` - captions/subtitles as timestamp chunks
- `get_timeline(url)` - metadata, chapters, transcript chunks
- `get_frame_at(url, timestamp)` - one thumbnail image at a timestamp
- `summarize_video(url)` - local extractive timeline summary
- `create_chat_context(url)` - returns `session_id` for timestamp-aware chat

## Requirements

- Node.js 20+
- `yt-dlp` in PATH for real YouTube reads
- Or a cloned `yt-dlp` repo plus `YT_DLP_PYTHON` and `YT_DLP_SOURCE_DIR`
- `ffmpeg` in PATH, or set `FFMPEG_PATH`, for frame extraction
- Optional `whisper` CLI, or set `WHISPER_CLI`, for audio fallback when captions are unavailable

This workspace currently has Node available. If `yt-dlp` is not installed, the server still starts and lists tools, but real YouTube inspection will report a `yt-dlp` startup error.

## Run

```powershell
cd work\tomtomlife-youtube-mcp-server
node .\src\server.js
```

## MCP Config Example

```json
{
  "mcpServers": {
    "tomtomlife-youtube": {
      "command": "node",
      "args": [
        "C:\\Users\\TomTomLife\\Documents\\Codex\\2026-07-03\\comfyui-mcp-workspace-youtube-mcp-youtube\\work\\tomtomlife-youtube-mcp-server\\src\\server.js"
      ],
      "env": {
        "YOUTUBE_MCP_CACHE_DIR": "C:\\Users\\TomTomLife\\Documents\\Codex\\2026-07-03\\comfyui-mcp-workspace-youtube-mcp-youtube\\work\\tomtomlife-youtube-mcp-server\\cache",
        "YT_DLP_PYTHON": "C:\\Users\\TomTomLife\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\python\\python.exe",
        "YT_DLP_SOURCE_DIR": "C:\\Users\\TomTomLife\\Documents\\Codex\\2026-07-03\\comfyui-mcp-workspace-youtube-mcp-youtube\\work\\yt-dlp",
        "FFMPEG_PATH": "C:\\Users\\TomTomLife\\AppData\\Local\\com.debpalash.omnivoice-studio\\tools\\ffmpeg.exe"
      }
    }
  }
}
```

## Quick Self-Test

```powershell
node .\src\selftest.js
```

Expected output:

```text
OK tools=inspect_video,get_transcript,get_timeline,get_frame_at,summarize_video,create_chat_context
```

## Next Practical Step

Install or point to `yt-dlp`, then call `inspect_video` with a YouTube URL. After that, add Whisper only if a target video has no captions.

For the bigger direction, see [VISION.md](./VISION.md).

For the product-building path from problem to app, see [VIBE_CODING_GUIDE.md](./VIBE_CODING_GUIDE.md).
