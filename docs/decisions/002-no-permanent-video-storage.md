# 002 - No Permanent Video Storage

## Status

Accepted

## Context

The goal is to help AI understand video context, not to build a video archive.

Keeping full video files would create disk bloat, unclear ownership, and unnecessary operational risk.

## Decision

Do not permanently store full video files.

Allowed cache:

- metadata JSON
- transcript JSON
- timeline JSON
- selected frame JPGs
- session JSON
- agent brief JSON
- future embeddings

Temporary audio may be created only for fallback transcription and must be deleted after use.

## Consequences

Benefits:

- Keeps the system lightweight.
- Avoids turning the workspace into a media dump.
- Makes the bridge easier to reason about and back up.

Tradeoffs:

- Some visual or audio operations may need to fetch temporary streams again.
- Offline re-analysis may be limited unless enough context artifacts were cached.
