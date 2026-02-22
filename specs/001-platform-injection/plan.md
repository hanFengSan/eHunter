# Implementation Plan: Platform-Based Injection System

**Branch**: `001-platform-injection` | **Date**: 2026-02-21 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-platform-injection/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Refactor the platform injection system to support host-based detection and initialization for EH, NH, and test platforms. The system will detect the platform based on browser URL (host + pathname), initialize only on album view pages, and use modern Vue 3 dependency injection patterns. All platform parsers will be rewritten from scratch to align with the new architecture, eliminating legacy initialization patterns.

## Technical Context

**Language/Version**: TypeScript 5.9  
**Primary Dependencies**: Vue 3.5.28, Vite 6.4.1, vite-svg-loader 5.1.0  
**Storage**: Browser localStorage (via userscript GM_* APIs with fallback)  
**Testing**: Manual browser testing via `chrome-devtools-mcp` (no automated test framework currently)  
**Target Platform**: Browser userscript (Tampermonkey/Violentmonkey) injected into e-hentai.org, exhentai.org, nhentai.net  
**Project Type**: Single-page application (SPA) with platform-specific injection  
**Performance Goals**: Platform detection <100ms, initialization <60s, no host page blocking  
**Constraints**: Must not break host page, must support book/scroll modes, EH platform priority over NH  
**Scale/Scope**: 3 platforms (EH, NH, Test), ~10 parser files to rewrite, shared utilities in platform/base/

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Principle I (Refactor-First Boundaries)**: ✅ PASS - All changes target `core/` and `src/` directories. Platform implementations in `src/platform/eh/` and `src/platform/nh/` will be rewritten. No changes to `core_old/` or `old/` except for reference during migration.

- **Principle II (Behavior-Preserving Changes)**: ✅ PASS - Refactored platforms must preserve existing book mode and scroll mode behavior. Parser rewrites will maintain same DOM extraction logic, just with new architecture. Async loading, page limits, and rapid user input handling will be preserved through existing shared utilities in `src/platform/base/`.

- **Principle III (Validation Before Completion)**: ✅ PASS - Plan includes explicit validation tasks: (1) Run `npm run dev`, (2) Use `chrome-devtools-mcp` to test on each platform (EH, NH, localhost), (3) Verify loading states, error handling, and reader features (book/scroll modes, thumbnails, page flipping).

- **Principle IV (Story-Independent Delivery)**: ✅ PASS - User stories are prioritized and independently testable:
  - P1: Host-based detection (can test platform detection without full refactor)
  - P2: Modernized architecture (can test EH/NH refactor independently)
  - P3: Clean abstraction (can test code structure independently)

- **Principle V (Built-in UI and Mode Consistency)**: ✅ PASS - No third-party UI libraries introduced. Loading animation and error display will use existing Vue components. Reader features (book mode, scroll mode, thumbnail navigation) must work identically across all platforms per FR-020.

**Additional Constraints Check**:
- ✅ EH path correctness prioritized (FR-002, FR-003 specify EH URLs first)
- ✅ Cross-platform impact review: Changes in `src/platform/base/` utilities will be documented
- ✅ Preference persistence: Not applicable (no new preferences in this feature)
- ✅ No destructive git operations planned

## Project Structure

### Documentation (this feature)

```text
specs/001-platform-injection/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
│   └── AlbumService.ts  # Service contract interface
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/
├── main.ts                          # Entry point - platform detection and initialization
├── platform/
│   ├── base/
│   │   ├── index.ts                 # BasePlatform abstract class (if needed)
│   │   ├── request/
│   │   │   ├── TextReq.ts           # HTTP request with retry (existing)
│   │   │   ├── ReqQueue.ts          # Concurrent request limiter (existing)
│   │   │   └── MultiAsyncReq.ts     # Multi-async request handler (existing)
│   │   └── service/
│   │       └── PlatformService.js   # Cross-platform storage/fetch adapter (existing)
│   ├── eh/
│   │   ├── index.ts                 # EH platform initialization
│   │   ├── service/
│   │   │   └── AlbumServiceImpl.ts  # EH AlbumService implementation (rewrite)
│   │   └── parser/
│   │       ├── ImgHtmlParser.ts     # Image page HTML parser (rewrite)
│   │       ├── IntroHtmlParser.ts   # Gallery intro parser (rewrite)
│   │       └── ImgUrlListParser.ts  # Image URL list parser (rewrite)
│   ├── nh/
│   │   ├── index.ts                 # NH platform initialization
│   │   ├── service/
│   │   │   └── AlbumServiceImpl.ts  # NH AlbumService implementation (rewrite)
│   │   └── parser/
│   │       ├── ImgHtmlParser.ts     # Image page HTML parser (rewrite)
│   │       └── IntroHtmlParser.ts   # Gallery intro parser (rewrite)
│   └── test/
│       └── AlbumService.ts          # Test platform (existing, reference implementation)

core/
├── TestApp.vue                      # Root Vue component (existing)
├── App.vue                          # Main app component (existing)
├── service/
│   └── AlbumService.ts              # AlbumService interface (existing)
└── model/
    └── model.ts                     # Type definitions (existing)
```

**Structure Decision**: Single project structure with platform-specific modules. The `src/platform/` directory contains platform implementations (EH, NH, Test) that all implement the `core/service/AlbumService` interface. Shared utilities in `src/platform/base/` are reused across platforms. Entry point `src/main.ts` handles platform detection and initialization.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All principles pass.

---

## Phase 0: Research & Technical Decisions

**Status**: Ready to execute

### Research Tasks

1. **URL Pattern Matching Strategy**
   - Research: Best practices for URL pattern matching in userscript context
   - Decision needed: Regex vs string matching for platform detection
   - Alternatives: pathname.startsWith() vs regex test vs URL parsing

2. **Platform Detection Architecture**
   - Research: Factory pattern vs strategy pattern for platform initialization
   - Decision needed: How to structure platform detector and initializer
   - Alternatives: Single factory class vs separate detector/initializer vs functional approach

3. **Parser Rewrite Approach**
   - Research: DOM parsing best practices in TypeScript
   - Decision needed: querySelector patterns, error handling, type safety
   - Alternatives: Direct DOM access vs wrapper utilities vs parsing library

4. **Error Handling & Logging**
   - Research: Best practices for error display in userscript UI
   - Decision needed: Error component structure, stack trace formatting
   - Alternatives: Modal vs inline error, full stack vs sanitized stack

5. **Loading State Management**
   - Research: Loading animation patterns in Vue 3
   - Decision needed: Component structure for loading overlay
   - Alternatives: Global loading state vs per-platform loading component

6. **Initialization Timeout Implementation**
   - Research: Promise timeout patterns in TypeScript
   - Decision needed: AbortController vs Promise.race vs manual timeout
   - Alternatives: Global timeout vs per-operation timeout

**Output**: `research.md` with decisions, rationale, and alternatives for each task

---

## Phase 1: Design & Contracts

**Status**: Blocked by Phase 0

### Deliverables

1. **data-model.md**: Entity definitions
   - Platform (name, urlPatterns, serviceFactory)
   - PlatformDetector (detectPlatform method)
   - PlatformInitializer (initialize method, timeout handling)
   - AlbumService (interface already exists in core/service/AlbumService.ts)
   - ErrorInfo (message, stack, platform, url)

2. **contracts/AlbumService.ts**: Service contract interface
   - Copy from core/service/AlbumService.ts
   - Document expected behavior for each method
   - Add JSDoc comments for parser implementations

3. **quickstart.md**: Developer guide
   - How to add a new platform
   - Platform detection flow diagram
   - Parser implementation checklist
   - Testing checklist (npm run dev + chrome-devtools-mcp)

4. **Agent context update**:
   - Run `.specify/scripts/bash/update-agent-context.sh opencode`
   - Add TypeScript 5.9, Vue 3.5, Vite 6 to active technologies
   - Add userscript context and platform detection patterns

**Output**: data-model.md, contracts/, quickstart.md, updated agent context

---

## Phase 2: Task Breakdown

**Status**: Not started (handled by `/speckit.tasks` command)

This phase is executed by the `/speckit.tasks` command and will generate `tasks.md` with:
- Detailed implementation tasks for each user story
- Validation tasks (npm run dev + chrome-devtools-mcp)
- Acceptance criteria verification tasks
- Code review checklist

---

## Notes

- **Parser Rewrite Scope**: All parsers in `src/platform/eh/parser/` and `src/platform/nh/parser/` must be rewritten from scratch per clarification Q4. No legacy code or adapters allowed.
- **URL Patterns**: EH uses `/g/*` and `/s/*`, NH uses `/g/[id]/[page]/` per clarification Q1 and spec FR-002 to FR-004.
- **Error Display**: Must show user-friendly message + technical details (stack trace, platform, URL) per clarification Q5 and FR-017.
- **Timeout**: 60 seconds per clarification Q3 and FR-019.
- **Validation**: Every task must include browser testing via `chrome-devtools-mcp` per Principle III.
