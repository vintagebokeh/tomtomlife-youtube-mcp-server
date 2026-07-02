# Project Index

This file is a seed map for related TomTomLife projects.

It should eventually move or sync into a central system-blueprint repo. For now, it helps this repo remember how it fits the larger workspace.

## Active Or Important Repos

| Project | Role | Current Meaning |
| --- | --- | --- |
| `tomtomlife-youtube-mcp-server` | YouTube context bridge | Gives AI timestamped video context through MCP |
| `tomtom-comfyui-mcp-server` | ComfyUI workflow bridge | Lets AI inspect, plan, copy, edit, and validate ComfyUI workflows |
| `content_factory` | content production system | Likely sits above generation, automation, and publishing flows |
| `vmix-panel` | live/media control UI | Production control surface |
| `midi_bridge` | hardware/control adapter | Connects physical or MIDI-style control into workflows |

## GitHub Repo Rule

Every repo should answer seven questions in its README:

1. What is this project?
2. What problem created it?
3. Who uses it?
4. How does it work?
5. How do I install or run it?
6. What is the current status?
7. What is next?

## Issue Rule

Use Issues as the problem notebook:

- `[Feature]` for a capability that should exist
- `[Research]` for unanswered investigation
- `[Security]` for trust, auth, allowlist, or data safety
- `[Architecture]` for design choices
- `[Bug]` for broken behavior

Issue = unsolved problem.

Commit = changed reality.

Pull request = review gate for whether the changed reality should enter the system.
