# 001 - Use MCP As The Context Bridge

## Status

Accepted

## Context

TomTom wants AI systems such as ChatGPT, Codex, n8n agents, and future multimodal agents to understand YouTube videos as working context.

Direct one-off scripts would work for a single experiment, but they would not create a reusable tool layer.

## Decision

Use MCP as the interface between AI clients and YouTube context extraction.

The server exposes small tools instead of one large "do everything" operation.

## Consequences

Benefits:

- ChatGPT, Codex, n8n, and future agents can reuse the same bridge.
- Tools can stay small and composable.
- The architecture can grow from text context to visual context.

Tradeoffs:

- The MCP server must keep tool schemas stable.
- Some clients may need configuration before they can call the server.
- Richer synthesis still needs an LLM or vision model above the bridge.
