# YouTube Bridge Vision

Goal: let ChatGPT, Codex, n8n agents, and future AI agents understand a YouTube video as usable context, not as a permanent download.

This project treats YouTube as a knowledge and demonstration layer. Some videos teach through speech, some through screen recordings, some through visual steps with little or no narration. The MCP server should help an AI see enough of the same context that a human sees when watching.

## Core Principle

Do not build a YouTube downloader.

Build a context bridge:

```text
YouTube URL
-> metadata
-> transcript when available
-> audio transcription only when needed
-> visual timeline and keyframes
-> chat/session context
-> agent-ready use cases, summaries, workflows, and ideas
```

The server should cache small reusable context artifacts, not keep full video files.

## Context Levels

### Level 1: Metadata

- title
- channel
- duration
- description
- thumbnail
- upload date
- source URL

Purpose: quickly decide what the video is and whether it is worth deeper analysis.

### Level 2: Transcript

- pull official captions first
- fall back to automatic captions
- normalize into timestamp chunks
- keep language metadata

Purpose: let the AI answer questions like "what did they say around 12:40?"

### Level 3: Audio Fallback

- only if captions are missing or poor
- temporarily extract audio
- transcribe with Whisper or another local/cloud speech model
- delete the audio file after transcription

Purpose: recover knowledge from videos without subtitles while avoiding permanent media storage.

### Level 4: Visual Context

- extract keyframes every X seconds
- support frame at exact timestamp
- later: scene-change detection
- later: vision model captions for each keyframe

Purpose: handle tutorials, demos, UI walkthroughs, repair clips, cooking, design work, and silent visual instruction.

### Level 5: Chat Session

- create `session_id`
- keep video metadata, timeline, transcript, and keyframe references together
- allow follow-up prompts like "นาที 12:40 เขาทำอะไร"
- let the AI cite timestamps back to the user

Purpose: make the video feel like shared working context between the user and the AI.

## Agent Workflow Direction

This MCP server should eventually support n8n and agent workflows like:

```text
1. receive a topic or goal from TomTom
2. search or receive candidate YouTube URLs
3. inspect metadata
4. rank which videos are worth deeper analysis
5. read transcript and visual timeline
6. extract use cases, project ideas, tools, workflows, and risks
7. compare across several videos
8. produce a useful proposal for TomTom's current focus
```

The agent should be able to learn patterns such as:

- topics TomTom repeatedly studies
- work styles and tool preferences
- project ideas that fit TomTom's ecosystem
- workflows that combine MCP, n8n, vision, LLM reasoning, and local tools

## Future Tool Ideas

- `analyze_visual_steps(url)` - explain non-verbal steps from keyframes
- `compare_videos(urls)` - compare several videos on the same topic
- `extract_workflow(url)` - turn tutorial/demo videos into an n8n-style workflow outline
- `extract_project_ideas(url)` - find possible projects inspired by a video
- `rank_learning_value(urls, goal)` - pick which videos are worth watching deeply
- `create_agent_brief(url, goal)` - package timeline, transcript, visuals, and suggested actions for any AI agent
- `ask_video(session_id, question)` - answer timestamp-aware questions from a saved session

## Storage Rule

Allowed cache:

- metadata JSON
- transcript JSON
- timeline JSON
- selected keyframe JPGs
- embeddings
- session files

Avoid permanent storage:

- full MP4 files
- full audio files after transcription
- unnecessary duplicate media

## Why MCP Matters Here

MCP turns video understanding into a tool layer. That means the same YouTube context can be used by:

- ChatGPT
- Codex
- n8n
- local agents
- future multimodal agents
- future platform bridges beyond YouTube

The long-term skill is not just "watching YouTube with AI." The skill is building bridges between human context, platform knowledge, agent tools, and useful action.
