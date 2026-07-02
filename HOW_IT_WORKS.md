# How the YouTube MCP Bridge Works

The bridge does not make an AI "watch YouTube" like a human sitting in front of a screen.

It does something more practical for agents:

```text
YouTube URL
-> small context artifacts
-> MCP tools
-> AI-readable payload
-> timestamp-aware reasoning and workflows
```

## What the AI Gets

When ChatGPT, Codex, n8n, or another agent connects through MCP, it gets tools it can call.

Those tools turn one YouTube URL into useful context:

- metadata: title, channel, duration, description, thumbnail
- transcript: timestamped subtitle chunks when captions exist
- timeline: chapters plus transcript chunks
- frame lookup: one image at a chosen timestamp
- chat context: session file for follow-up questions
- agent brief: compact package for another AI or workflow

The important idea:

> The AI does not need the whole video file. It needs the right context, grounded to timestamps.

## Why This Helps TomTom

Without the bridge:

```text
TomTom watches a video
-> remembers useful parts
-> explains them to AI
-> asks AI to help
```

With the bridge:

```text
TomTom gives a URL
-> MCP reads the video context
-> AI receives metadata, transcript, timeline, and frames
-> AI can discuss the video with timestamp references
```

This turns YouTube from "something TomTom has to manually watch first" into "a knowledge source agents can inspect."

## Why It Is Useful for Silent or Visual Tutorials

Some videos explain by showing, not speaking.

Examples:

- screen recordings
- n8n workflow demos
- ComfyUI node setup
- design or editing tutorials
- repair/cooking/building demonstrations
- before/after visual changes

For those videos, transcript alone is not enough.

That is why the bridge has visual tools:

- `get_frame_at(url, timestamp)` for exact moments
- future keyframe extraction
- future vision captions for frames

A future vision model can look at frames and produce notes like:

```text
03:20 - User opens credential settings
04:10 - HTTP Request node points to an API endpoint
05:45 - Test output shows a JSON response
```

Now the AI can understand silent steps, not only spoken words.

## The MCP Tool Flow

### `inspect_video(url)`

Answers:

- What is this video?
- Who made it?
- How long is it?
- What does the description say?
- Is it worth deeper analysis?

### `get_transcript(url)`

Answers:

- What was said?
- At what timestamp?
- Which parts might answer TomTom's question?

### `get_timeline(url)`

Answers:

- What are the chapters?
- What are the main transcript chunks?
- What is the rough structure of the video?

### `get_frame_at(url, timestamp)`

Answers:

- What is visible at this exact moment?
- Is this a visual setup step?
- Is the transcript missing something important?

### `summarize_video(url)`

Answers:

- What are the main points?
- Which timestamps are likely useful?

This is extractive for now. It uses the available timeline instead of pretending to be a full LLM.

### `create_chat_context(url)`

Answers:

- What session should future questions refer to?
- Which timeline and keyframes belong together?

This supports conversations like:

```text
TomTom: What happens at 12:40?
AI: At 12:40, the video is likely covering...
```

### `create_agent_brief(url, goal)`

Answers:

- What should another AI know before working on this video?
- What evidence is available?
- What timestamps should it inspect?
- What can n8n pass to the next step?

This is the first "handoff payload" tool.

## What n8n Can Do With It

n8n can call the MCP server as one step in a larger workflow:

```text
Trigger
-> receive topic or URL list
-> inspect each video
-> create agent brief
-> send brief to LLM/vision agent
-> score usefulness
-> extract use cases
-> send TomTom a report
```

For example:

```text
Goal: Find 6 useful videos about n8n AI agents.

Workflow:
1. collect candidate URLs
2. inspect metadata
3. skip weak videos
4. read transcript and timeline
5. inspect keyframes for visual demos
6. create project ideas
7. send ranked brief to TomTom
```

## What This Is Not

This is not:

- a permanent YouTube downloader
- a video archive
- a media hoarder
- a replacement for a vision model
- a guarantee that every video has captions

This is:

- a context bridge
- an MCP tool layer
- a timestamp-aware knowledge extractor
- a foundation for AI research workflows

## The Bigger Product Idea

The future app could feel like:

```text
Paste a YouTube URL
-> AI reads the context
-> AI sees important frames
-> AI extracts steps, tools, and ideas
-> TomTom asks follow-up questions
-> n8n turns the best findings into workflows
```

The magic is not downloading the clip.

The magic is making a video usable by agents.
