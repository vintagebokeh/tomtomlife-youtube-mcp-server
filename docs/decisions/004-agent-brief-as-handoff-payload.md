# 004 - Agent Brief As Handoff Payload

## Status

Accepted

## Context

n8n and AI agents need compact payloads. A raw transcript can be too noisy and too large.

The bridge should provide a structured handoff that another AI can use immediately.

## Decision

Add `create_agent_brief(url, goal)`.

The brief includes:

- goal
- metadata
- context availability
- summary
- timestamped evidence
- suggested agent tasks
- cache policy

## Consequences

Benefits:

- Better n8n integration path.
- Easier for ChatGPT, Codex, and agents to share the same context.
- Reduces transcript dumping.

Tradeoffs:

- The brief is only as good as the extracted timeline.
- Deeper reasoning still belongs to an LLM or agent above the MCP server.
