# 003 - Transcript First, Vision Second

## Status

Accepted

## Context

Many YouTube videos have useful captions or automatic subtitles. Transcript extraction is usually cheaper and faster than full visual analysis.

However, some tutorials are visual or silent, so transcript alone is not enough.

## Decision

Start with transcript-first extraction:

1. inspect metadata
2. pull captions/subtitles
3. normalize transcript into timestamp chunks
4. build timeline
5. add frame extraction for visual context
6. add future vision captioning for frames

## Consequences

Benefits:

- Fast first value.
- Lower dependency burden.
- Good enough for many educational videos.

Tradeoffs:

- Silent demos require later visual analysis.
- Caption quality varies by video and language.
