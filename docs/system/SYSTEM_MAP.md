# TomTomLife System Map

This repo is one adapter in a larger AI workspace.

```text
Human Intent
     |
     v
AI Agent
     |
     v
MCP Workspace Adapters
     |
     +-- YouTube MCP: video knowledge and visual context
     +-- ComfyUI MCP: media-generation workflow inspection and editing
     +-- n8n MCP/Workflows: automation process execution
     +-- vMix tools: live production control
     +-- future adapters: Drive, NAS, Supabase, other platforms
     |
     v
Content / Automation / Media / Knowledge
```

## Shared Truth Model

TomTomLife should not force every kind of truth into one center.

Use the right center for each kind of reality:

| Space | Truth Type | Metaphor |
| --- | --- | --- |
| GitHub | code, architecture, issues, decisions | factory blueprint |
| Google Drive | documents, media, human-readable drafts | document room |
| Supabase/PostgreSQL | app data and operational records | central registry |
| n8n | running automation processes | conveyor belt |
| ComfyUI | media-generation workflows | production machine |
| NAS | source files and long-term archive | warehouse |

## This Repo's Role

`tomtomlife-youtube-mcp-server` is the YouTube adapter.

It should answer:

- What is in this video?
- What was said?
- What was shown?
- What happened at a timestamp?
- What should an AI or n8n workflow do next?

It should not become:

- a permanent MP4 archive
- a catch-all database
- a UI project before the bridge works
- a replacement for the central system blueprint repo

## Data Movement

```text
YouTube URL
-> this MCP server
-> metadata/transcript/timeline/keyframes/brief
-> AI agent or n8n workflow
-> project ideas, workflow steps, learning notes, media tasks
```

## Future Central Repo

A future central repo should act as the front door:

```text
tomtomlife-system-blueprint
├── README.md
├── SYSTEM_MAP.md
├── CAPABILITY_MATRIX.md
├── PROJECT_INDEX.md
├── ARCHITECTURE.md
├── ROADMAP.md
└── docs/decisions/
```

This YouTube repo should later be linked from that central map.
