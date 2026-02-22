# Phase 0 Research: Gallery Download Bundle

## Decision 1: Zip packaging approach

- Decision: Use a browser-side zip builder to create one zip per chunk and trigger download immediately after each chunk is finalized.
- Rationale: Chunk-level finalization bounds peak memory and aligns with the requirement to split large galleries.
- Alternatives considered:
  - Single monolithic zip for all pages (simpler but high memory risk on large galleries).
  - Server-assisted compression (out of scope for userscript runtime).

## Decision 2: YAML metadata generation

- Decision: Generate one YAML file per chunk including gallery-level fields and chunk context fields (`totalChunks`, `chunkIndex`).
- Rationale: Per-chunk metadata keeps each downloaded archive self-describing and independently usable.
- Alternatives considered:
  - One global YAML only in first chunk (inconvenient if users keep only later chunks).
  - JSON metadata (does not satisfy explicit YAML requirement).

## Decision 3: Filename sanitization policy

- Decision: Build zip base name from gallery title after cross-platform sanitization (strip/replace reserved characters, trim trailing dots/spaces, fallback to safe default when empty).
- Rationale: Prevents save/open failures across Windows, macOS, and Linux while preserving recognizable titles.
- Alternatives considered:
  - Raw title passthrough (breaks on reserved characters).
  - Hash-only filename (safe but poor readability for users).

## Decision 4: Retry and fallback sequencing

- Decision: For each retrieval stage, use initial attempt plus up to 2 retries; when source-switch auto-retry is enabled, stage order is `ChangeSource` then `Origin`.
- Rationale: Matches clarified requirement and improves success rate while keeping behavior deterministic and testable.
- Alternatives considered:
  - Unlimited retry (risks hanging tasks).
  - Origin-first fallback order (conflicts with requirement).

## Decision 5: Notification architecture

- Decision: Implement a reusable right-bottom floating notification stack with task-scoped items and progressive state updates (`fetching`, `compressing`, `completed`, `failed`).
- Rationale: Satisfies multi-task visibility and allows decoupled status updates from download orchestration logic.
- Alternatives considered:
  - Reuse dialog text as progress surface (insufficient for concurrent tasks).
  - Single global status line (cannot present multiple tasks clearly).

## Decision 6: Sequential processing and chunk memory controls

- Decision: Process images strictly in page order; append file to current chunk zip, and finalize/reset chunk buffer once chunk limit is reached.
- Rationale: Meets ordered-download requirement and provides predictable memory growth bounded by configured chunk size.
- Alternatives considered:
  - Parallel image fetches with ordered writeback (higher throughput but higher memory and complexity).
  - Preload all blobs before zip (highest memory risk).

## Decision 7: Required service boundary extensions

- Decision: Extend album service abstraction with intro URL getter needed by YAML metadata and reuse existing image retrieval API modes.
- Rationale: Keeps dialog/service layers platform-agnostic while enabling EH metadata export.
- Alternatives considered:
  - Access platform implementation directly from UI component (breaks abstraction).
  - Infer intro URL from window location every time (less reliable and less testable).
