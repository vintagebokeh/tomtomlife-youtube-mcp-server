# Vibe Coding Guide for TomTomLife YouTube MCP

This project started from a real problem:

> AI can talk about a YouTube link, but it does not truly share the same video context unless we give it metadata, transcript, visuals, timestamps, and tools.

Vibe coding works best when it starts exactly there: not from "what framework should I use?", but from "what pain do I feel, and what would feel magical if it existed?"

## The Main Pattern

```text
Problem
-> Friction
-> Desired feeling
-> Small useful tool
-> Real workflow
-> Repeatable system
-> App
```

For this project:

```text
Problem:
AI cannot really inspect a YouTube tutorial or visual demo.

Friction:
TomTom has to watch, remember, summarize, and explain the useful parts manually.

Desired feeling:
"Nong Ji saw the same clip context and can discuss minute 12:40 with me."

Small useful tool:
inspect_video(url), get_transcript(url), get_frame_at(url, timestamp)

Real workflow:
Feed one YouTube URL into ChatGPT, Codex, n8n, or another agent and receive a useful timeline.

Repeatable system:
Run the same process over many videos, rank learning value, extract project ideas, and generate briefs.

App:
A YouTube research cockpit for AI-assisted learning, workflow discovery, and project ideation.
```

## How an Idea Becomes an App

### 1. Name the job

Good apps do one job clearly before they become big.

For this project, the first job is:

> Turn a YouTube URL into AI-readable context.

That means the first app does not need login, fancy UI, subscriptions, dashboards, or a huge database. It needs to reliably answer:

- What is this video?
- What is said in it?
- What is shown in it?
- What happens at each important timestamp?
- What should an AI agent do with this context?

### 2. Build the smallest bridge

The first bridge is MCP tools:

- `inspect_video(url)`
- `get_transcript(url)`
- `get_timeline(url)`
- `get_frame_at(url, timestamp)`
- `summarize_video(url)`
- `create_chat_context(url)`

This is good because it gives the app a real capability before designing the full app.

### 3. Make the output useful to humans and agents

A future app should not only return raw JSON. It should produce:

- timestamped timeline
- key visual moments
- summary by chapter
- important tools mentioned
- workflow steps
- project ideas
- risks or missing context
- "watch these parts first" recommendation

### 4. Add memory carefully

Memory should not mean "store everything forever."

Good memory for this app:

- topics TomTom studies often
- repeated tools and workflows
- preferred output style
- accepted/rejected project ideas
- short summaries of analyzed videos

Avoid:

- permanent full video storage
- noisy transcripts with no use
- random scraped data without purpose

### 5. Turn repeated usage into UI

Do not start with a big UI. Let repeated usage reveal the UI.

When TomTom keeps asking the same thing, that becomes a button.

Examples:

- "Inspect URL" becomes an input box and Run button.
- "What happens at 12:40?" becomes timestamp search.
- "Find project ideas from this clip" becomes an action button.
- "Compare these 6 videos" becomes a research batch view.
- "Send to n8n" becomes an export/workflow button.

## The App Shape

The future app could have five main views:

### 1. Video Inspector

Paste a YouTube URL and get:

- metadata
- transcript
- chapters
- keyframes
- timeline summary

### 2. Timeline Chat

Ask questions like:

- "What is happening at 03:20?"
- "Where does he set up the API key?"
- "Which part should I watch again?"
- "Turn this demo into steps."

### 3. Visual Steps

Show keyframes with AI captions:

```text
00:30 - Opens n8n canvas
02:10 - Adds HTTP Request node
03:40 - Configures API credential
05:25 - Tests workflow output
```

This is the important part for silent demos and visual tutorials.

### 4. Research Batch

Give the app 3-10 URLs and ask:

- Which one is most useful?
- Which one has real steps?
- Which one is shallow?
- What new project ideas appear across all videos?

### 5. Agent Brief

Export context for:

- ChatGPT
- Codex
- n8n
- local AI agents
- future vision/agent systems

The output should be a compact brief, not a giant transcript dump.

## What TomTom Should Understand Next

These are the concepts worth becoming strong at, in order.

### 1. Context Engineering

This is the heart of the project.

You are not just sending prompts. You are shaping what the AI can know:

- metadata
- transcript
- images
- timestamps
- user goal
- previous decisions
- output format

Good context makes the AI feel much smarter.

### 2. Tool Design

MCP tools should be small and composable.

Bad tool:

```text
do_everything_with_youtube(url)
```

Better tools:

```text
inspect_video(url)
get_transcript(url)
get_frame_at(url, timestamp)
create_chat_context(url)
```

Small tools let many agents reuse the same bridge.

### 3. Data Shape

A good AI app depends on clean data shapes.

For this project, the key objects are:

- `VideoMetadata`
- `TranscriptChunk`
- `TimelineItem`
- `Keyframe`
- `ChatContext`
- `AgentBrief`

When these shapes are clear, UI, n8n, MCP, and agents can all connect.

### 4. Cache Strategy

Cache is not just performance. It is product behavior.

This project's cache rule:

- keep small context artifacts
- delete temporary media
- make repeated questions fast
- avoid turning the disk into a media archive

### 5. Multimodal Thinking

YouTube knowledge is not only text.

The app needs to combine:

- spoken words
- subtitles
- visual steps
- screen text
- UI state
- timing
- repeated patterns

This is where vision models become powerful.

### 6. Workflow Thinking

n8n fits naturally because YouTube research often has steps:

```text
trigger
-> collect URLs
-> inspect each video
-> score usefulness
-> summarize
-> extract workflows
-> send results to TomTom
```

The app should eventually export clean payloads that n8n can use.

### 7. Product Taste

A good app does not just expose every feature. It guides attention.

For TomTom, the best product questions are:

- What should I learn from this?
- Is this worth my time?
- What can I build from it?
- What workflow can I automate?
- What should I watch next?

## Practical Roadmap

### Phase 1: Make the bridge real

- Run `yt-dlp` from source
- Confirm `inspect_video(url)` works on a real URL
- Confirm transcript extraction
- Save timeline JSON
- Keep full video downloads out

### Phase 2: Add visual understanding

- Extract keyframes at fixed intervals
- Extract frame at exact timestamp
- Add scene-change mode later
- Add vision captions for keyframes
- Combine captions with transcript chunks

### Phase 3: Add agent-ready briefs

- Create `create_agent_brief(url, goal)`
- Include metadata, important timestamps, transcript highlights, visual steps, and suggested next actions
- Make output compact enough for ChatGPT, Codex, and n8n

### Phase 4: Add n8n workflows

- Workflow: inspect one URL
- Workflow: analyze 6 URLs
- Workflow: rank by learning value
- Workflow: extract use cases
- Workflow: generate project ideas

### Phase 5: Build the app UI

- URL input
- timeline viewer
- transcript viewer
- keyframe strip
- chat panel
- export to agent/n8n

## The Skill TomTom Is Building

The big skill is not only coding.

It is the ability to see a painful manual process, imagine the AI-native version, and then build the smallest bridge that makes the future visible.

That is the real vibe coding loop:

```text
feel the friction
name the job
build one useful tool
use it immediately
notice the next friction
repeat
```

This is how small experiments become real apps.
