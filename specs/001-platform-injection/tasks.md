# Tasks: Platform-Based Injection System

**Input**: Design documents from `/specs/001-platform-injection/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: No automated tests requested in specification. Manual browser testing via `chrome-devtools-mcp` is required per Constitution Principle III.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `- [ ] [ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Single project structure: `src/`, `core/` at repository root
- Platform implementations: `src/platform/{eh,nh,test}/`
- Shared utilities: `src/platform/base/`
- Core services: `core/service/`, `core/model/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and TypeScript configuration

- [x] T001 Update tsconfig.json to include src/platform/eh and src/platform/nh in compilation (remove from exclude list)
- [x] T002 [P] Verify Vite 6.4.1 and Vue 3.5.28 dependencies are correctly installed per package.json
- [x] T003 [P] Create Platform enum in src/platform/types.ts with values EH, NH, TEST

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create PlatformDetectionResult interface in src/platform/types.ts with fields: platform, host, pathname, isAlbumPage
- [x] T005 Create InitializationError class in src/platform/types.ts with fields: message, stack, platform, url, timestamp
- [x] T006 Create InitializationState enum in src/platform/types.ts with values: UNINITIALIZED, INITIALIZING, READY, ERROR
- [x] T007 [P] Create LoadingErrorWrapper.vue component in core/components/ for loading animation and error display
- [x] T008 [P] Implement loading animation UI in LoadingErrorWrapper.vue per FR-016
- [x] T009 [P] Implement error display UI in LoadingErrorWrapper.vue with user-friendly message, technical details section, and close button per FR-017 and FR-018
- [x] T010 Verify existing shared utilities in src/platform/base/ (TextReq, ReqQueue, MultiAsyncReq, PlatformService) are functional

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Host-Based Platform Detection (Priority: P1) 🎯 MVP

**Goal**: Detect platform based on browser URL and initialize appropriate reader implementation

**Independent Test**: Navigate to e-hentai.org/g/*, exhentai.org/s/*, nhentai.net/g/*/1/, localhost:5173 and verify correct platform initializes with reader UI

**Acceptance Scenarios**:
1. EH platform initializes on e-hentai.org/g/* and e-hentai.org/s/*
2. EH platform initializes on exhentai.org/g/* and exhentai.org/s/*
3. NH platform initializes on nhentai.net/g/[id]/[page]/
4. Test platform initializes on localhost and IP addresses
5. No initialization on non-album pages (no errors thrown)
6. Loading animation displays during initialization
7. Error message with technical details displays on failure

### Implementation Tasks

- [x] T011 [US1] Implement detectPlatform() function in src/platform/detector.ts using regex patterns from research.md
- [x] T012 [US1] Add EH platform detection logic: check host (e-hentai.org OR exhentai.org) AND pathname (/g/* OR /s/*) per FR-002, FR-003
- [x] T013 [US1] Add NH platform detection logic: check host (nhentai.net) AND pathname regex /^\/g\/\d+\/\d+\/$/ per FR-004
- [x] T014 [US1] Add Test platform detection logic: check host (localhost OR IP pattern /^\d+\.\d+\.\d+\.\d+/) per FR-005
- [x] T015 [US1] Return null for non-album pages per FR-006 (no initialization, no errors)
- [x] T016 [US1] Implement createPlatformService() factory function in src/platform/factory.ts that returns AlbumService based on Platform enum
- [x] T017 [US1] Add switch case for Platform.EH → return new EHAlbumServiceImpl() (stub implementation for now)
- [x] T018 [US1] Add switch case for Platform.NH → return new NHAlbumServiceImpl() (stub implementation for now)
- [x] T019 [US1] Add switch case for Platform.TEST → return new TestAlbumService('')
- [x] T020 [US1] Implement initializeWithTimeout() function in src/platform/initializer.ts that wraps albumService.init() with 60s timeout per FR-020
- [x] T021 [US1] Use Promise.race() to race init() against timeout promise
- [x] T022 [US1] On timeout, reject with InitializationError containing timeout message
- [x] T023 [US1] Refactor src/main.ts to use detectPlatform() instead of hardcoded TestAlbumService
- [x] T024 [US1] Add early return in main.ts if detectPlatform() returns null (non-album page)
- [x] T025 [US1] Call createPlatformService() to get AlbumService instance
- [x] T026 [US1] Wrap TestApp with LoadingErrorWrapper component
- [x] T027 [US1] Set loading state to true before calling initializeWithTimeout()
- [x] T028 [US1] Call initializeWithTimeout() and handle success/error
- [x] T029 [US1] On success: set loading to false, mount Vue app to #ehunter-app container
- [x] T030 [US1] On error: set loading to false, display error in LoadingErrorWrapper with technical details per FR-017, FR-018, FR-019
- [x] T031 [US1] Log detailed error to console (stack trace, platform, URL) per FR-019
- [x] T032 [US1] Provide AlbumService via app.provide(NameAlbumService, albumService)

### Validation Tasks

- [x] T033 [US1] Run `npm run dev` and start development server in background per AGENTS.md testing requirements
- [x] T034 [US1] Use chrome-devtools-mcp to navigate to localhost:5175 and verify test platform initializes with mock data
- [x] T035 [US1] Verify loading animation displays during initialization
- [x] T036 [US1] Verify reader UI renders after initialization completes
- [ ] T037 [US1] Test non-album page: navigate to localhost:5173/search and verify no initialization occurs (no errors in console)
- [ ] T038 [US1] Test initialization timeout: modify init() to delay 65s, verify timeout error displays with technical details and close button
- [ ] T039 [US1] Verify error message includes: user-friendly description, stack trace, platform info, URL per FR-017, FR-018
- [ ] T040 [US1] Verify error is logged to browser console per FR-019
- [ ] T041 [US1] Verify close button in top-right corner dismisses error UI per FR-018
- [ ] T042 [US1] Document test results in specs/001-platform-injection/validation-us1.md

**Checkpoint**: User Story 1 complete and independently validated. Test platform works on localhost.

---

## Phase 4: User Story 2 - Modernized Platform Architecture (Priority: P2)

**Goal**: Refactor EH and NH platforms to use modern Vue 3 dependency injection, rewriting all parsers from scratch

**Independent Test**: Navigate to e-hentai.org and nhentai.net album pages, verify reader features (book mode, scroll mode, thumbnails) work identically to test platform

**Acceptance Scenarios**:
1. EH platform uses dependency injection pattern (no legacy core.launcher)
2. NH platform uses dependency injection pattern (no legacy core.launcher)
3. Reader components receive platform services via inject()
4. No legacy initialization patterns in codebase

### EH Platform Implementation

- [ ] T043 [P] [US2] Create EH ImgHtmlParser class in src/platform/eh/parser/ImgHtmlParser.ts (rewrite from scratch per clarification Q4)
- [ ] T044 [P] [US2] Implement parseImageUrl() method in EH ImgHtmlParser to extract full-size image URL from EH page DOM
- [ ] T045 [P] [US2] Implement parseImageDimensions() method in EH ImgHtmlParser to extract width/height from EH page DOM
- [ ] T046 [P] [US2] Add error handling for missing DOM elements in EH ImgHtmlParser
- [ ] T047 [P] [US2] Create EH IntroHtmlParser class in src/platform/eh/parser/IntroHtmlParser.ts (rewrite from scratch)
- [ ] T048 [P] [US2] Implement parseTitle() method in EH IntroHtmlParser to extract album title from EH gallery page
- [ ] T049 [P] [US2] Implement parseAlbumId() method in EH IntroHtmlParser to extract gallery ID from EH URL
- [ ] T050 [P] [US2] Implement parsePageCount() method in EH IntroHtmlParser to extract total page count from EH gallery page
- [ ] T051 [P] [US2] Implement parseCurPageIndex() method in EH IntroHtmlParser to extract current page index from EH URL
- [ ] T052 [P] [US2] Add error handling for missing metadata in EH IntroHtmlParser
- [ ] T053 [P] [US2] Create EH ImgUrlListParser class in src/platform/eh/parser/ImgUrlListParser.ts (rewrite from scratch)
- [ ] T054 [P] [US2] Implement parseThumbnails() method in EH ImgUrlListParser to extract thumbnail URLs and sprite positions
- [ ] T055 [P] [US2] Implement parseImagePageUrls() method in EH ImgUrlListParser to extract all image page URLs
- [ ] T056 [P] [US2] Add caching logic in EH ImgUrlListParser using PlatformService.storageGet/storageSet
- [ ] T057 [US2] Create EHAlbumServiceImpl class in src/platform/eh/service/AlbumServiceImpl.ts implementing AlbumService interface
- [ ] T058 [US2] Implement isSupportOriginImg() in EHAlbumServiceImpl returning true (EH supports original images)
- [ ] T059 [US2] Implement isSupportImgChangeSource() in EHAlbumServiceImpl returning true (EH supports source switching)
- [ ] T060 [US2] Implement isSupportThumbView() in EHAlbumServiceImpl returning true (EH supports thumbnails)
- [ ] T061 [US2] Implement getTitle() in EHAlbumServiceImpl using IntroHtmlParser
- [ ] T062 [US2] Implement getAlbumId() in EHAlbumServiceImpl using IntroHtmlParser
- [ ] T063 [US2] Implement getPageCount() in EHAlbumServiceImpl using IntroHtmlParser
- [ ] T064 [US2] Implement getCurPageIndex() in EHAlbumServiceImpl using IntroHtmlParser
- [ ] T065 [US2] Implement init() in EHAlbumServiceImpl: parse DOM using IntroHtmlParser and ImgUrlListParser
- [ ] T066 [US2] Add error handling in EHAlbumServiceImpl.init() for DOM parsing failures
- [ ] T067 [US2] Implement getThumbInfos() in EHAlbumServiceImpl using ImgUrlListParser with cache support
- [ ] T068 [US2] Implement getImgPageInfos() in EHAlbumServiceImpl returning placeholder ImgPageInfo array
- [ ] T069 [US2] Implement getImgSrc() in EHAlbumServiceImpl: fetch image page HTML, parse with ImgHtmlParser, return ImgPageInfo
- [ ] T070 [US2] Add retry logic in EHAlbumServiceImpl.getImgSrc() using TextReq from platform/base/
- [ ] T071 [US2] Implement getPreviewThumbnailStyle() in EHAlbumServiceImpl returning CSS styles for thumbnail sprites
- [ ] T072 [US2] Update src/platform/factory.ts to return actual EHAlbumServiceImpl instance (remove stub)

### NH Platform Implementation

- [ ] T073 [P] [US2] Create NH ImgHtmlParser class in src/platform/nh/parser/ImgHtmlParser.ts (rewrite from scratch per clarification Q4)
- [ ] T074 [P] [US2] Implement parseImageUrl() method in NH ImgHtmlParser to extract full-size image URL from NH page DOM
- [ ] T075 [P] [US2] Implement parseImageDimensions() method in NH ImgHtmlParser to extract width/height from NH page DOM
- [ ] T076 [P] [US2] Add error handling for missing DOM elements in NH ImgHtmlParser
- [ ] T077 [P] [US2] Create NH IntroHtmlParser class in src/platform/nh/parser/IntroHtmlParser.ts (rewrite from scratch)
- [ ] T078 [P] [US2] Implement parseTitle() method in NH IntroHtmlParser to extract album title from NH gallery page
- [ ] T079 [P] [US2] Implement parseAlbumId() method in NH IntroHtmlParser to extract gallery ID from NH URL
- [ ] T080 [P] [US2] Implement parsePageCount() method in NH IntroHtmlParser to extract total page count from NH gallery page
- [ ] T081 [P] [US2] Implement parseCurPageIndex() method in NH IntroHtmlParser to extract current page index from NH URL
- [ ] T082 [P] [US2] Add error handling for missing metadata in NH IntroHtmlParser
- [x] T083 [US2] Create NHAlbumServiceImpl class in src/platform/nh/service/AlbumServiceImpl.ts implementing AlbumService interface
- [x] T084 [US2] Implement isSupportOriginImg() in NHAlbumServiceImpl returning false (NH does not support original images)
- [x] T085 [US2] Implement isSupportImgChangeSource() in NHAlbumServiceImpl returning false (NH does not support source switching)
- [x] T086 [US2] Implement isSupportThumbView() in NHAlbumServiceImpl returning true (NH supports thumbnails)
- [x] T087 [US2] Implement getTitle() in NHAlbumServiceImpl using IntroHtmlParser
- [x] T088 [US2] Implement getAlbumId() in NHAlbumServiceImpl using IntroHtmlParser
- [x] T089 [US2] Implement getPageCount() in NHAlbumServiceImpl using IntroHtmlParser
- [x] T090 [US2] Implement getCurPageIndex() in NHAlbumServiceImpl using IntroHtmlParser
- [x] T091 [US2] Implement init() in NHAlbumServiceImpl: parse DOM using IntroHtmlParser
- [x] T092 [US2] Add error handling in NHAlbumServiceImpl.init() for DOM parsing failures
- [x] T093 [US2] Implement getThumbInfos() in NHAlbumServiceImpl parsing thumbnail URLs from NH gallery page
- [x] T094 [US2] Implement getImgPageInfos() in NHAlbumServiceImpl returning placeholder ImgPageInfo array
- [x] T095 [US2] Implement getImgSrc() in NHAlbumServiceImpl: fetch image page HTML, parse with ImgHtmlParser, return ImgPageInfo
- [x] T096 [US2] Add retry logic in NHAlbumServiceImpl.getImgSrc() using TextReq from platform/base/
- [x] T097 [US2] Implement getPreviewThumbnailStyle() in NHAlbumServiceImpl returning CSS styles for individual thumbnails
- [ ] T098 [US2] Update src/platform/factory.ts to return actual NHAlbumServiceImpl instance (remove stub)

### Validation Tasks

- [ ] T099 [US2] Run `npm run dev` and start development server in background
- [ ] T100 [US2] Use chrome-devtools-mcp to navigate to e-hentai.org/g/[real-gallery-id] (use actual EH gallery URL)
- [ ] T101 [US2] Verify EH platform initializes with loading animation
- [ ] T102 [US2] Verify EH reader UI renders with correct album title, page count
- [ ] T103 [US2] Verify EH book mode displays pages correctly
- [ ] T104 [US2] Verify EH scroll mode displays pages correctly
- [ ] T105 [US2] Verify EH thumbnail navigation works (click thumbnail, page changes)
- [ ] T106 [US2] Verify EH page flipping works (keyboard arrows, click navigation)
- [ ] T107 [US2] Test EH error handling: navigate to invalid gallery URL, verify error displays with technical details
- [ ] T108 [US2] Use chrome-devtools-mcp to navigate to nhentai.net/g/[real-gallery-id]/1/ (use actual NH gallery URL)
- [ ] T109 [US2] Verify NH platform initializes with loading animation
- [ ] T110 [US2] Verify NH reader UI renders with correct album title, page count
- [ ] T111 [US2] Verify NH book mode displays pages correctly
- [ ] T112 [US2] Verify NH scroll mode displays pages correctly
- [ ] T113 [US2] Verify NH thumbnail navigation works (click thumbnail, page changes)
- [ ] T114 [US2] Verify NH page flipping works (keyboard arrows, click navigation)
- [ ] T115 [US2] Test NH error handling: navigate to invalid gallery URL, verify error displays with technical details
- [ ] T116 [US2] Compare EH and NH reader behavior: verify book mode, scroll mode, thumbnails work identically per FR-022
- [ ] T117 [US2] Search codebase for legacy patterns: grep for "core.launcher", "core.createAppView", verify none found per FR-010, SC-007
- [ ] T118 [US2] Document test results in specs/001-platform-injection/validation-us2.md

**Checkpoint**: User Story 2 complete and independently validated. EH and NH platforms work with modern architecture.

---

## Phase 5: User Story 3 - Clean Platform Abstraction (Priority: P3)

**Goal**: Abstract platform detection and initialization into clear, maintainable structure

**Independent Test**: Review code structure, verify adding new platform requires only new directory + one line in detector

**Acceptance Scenarios**:
1. Adding new platform requires implementing AlbumService interface + adding detection logic
2. Platform detection logic centralized in single function
3. All platform directories follow consistent structure
4. Shared utilities in common location

### Implementation Tasks

- [ ] T119 [P] [US3] Extract platform detection logic into src/platform/detector.ts if not already done (should be from T011)
- [ ] T120 [P] [US3] Extract platform factory logic into src/platform/factory.ts if not already done (should be from T016)
- [ ] T121 [P] [US3] Extract initialization logic into src/platform/initializer.ts if not already done (should be from T020)
- [ ] T122 [US3] Add JSDoc comments to detectPlatform() function explaining URL patterns and return values
- [ ] T123 [US3] Add JSDoc comments to createPlatformService() function explaining factory pattern
- [ ] T124 [US3] Add JSDoc comments to initializeWithTimeout() function explaining timeout behavior
- [ ] T125 [US3] Create src/platform/README.md documenting platform structure and how to add new platforms
- [ ] T126 [US3] Document in README: platform directory structure (service/, parser/, index.ts)
- [ ] T127 [US3] Document in README: AlbumService interface requirements
- [ ] T128 [US3] Document in README: URL pattern detection requirements
- [ ] T129 [US3] Document in README: shared utilities in platform/base/ (TextReq, ReqQueue, MultiAsyncReq, PlatformService)
- [ ] T130 [US3] Add code example in README showing how to add hypothetical new platform (e.g., hitomi.la)

### Validation Tasks

- [ ] T131 [US3] Review src/platform/detector.ts: verify detection logic is centralized in single function per acceptance scenario 2
- [ ] T132 [US3] Review platform directories: verify eh/, nh/, test/ follow consistent structure (service/, parser/) per acceptance scenario 3
- [ ] T133 [US3] Review src/platform/base/: verify shared utilities (request/, service/) are in common location per acceptance scenario 4
- [ ] T134 [US3] Code review: verify adding new platform requires only (1) new directory with AlbumService impl, (2) one line in detectPlatform() per acceptance scenario 1
- [ ] T135 [US3] Verify no platform-specific logic leaked into main.ts (should only call detector, factory, initializer)
- [ ] T136 [US3] Document code review results in specs/001-platform-injection/validation-us3.md

**Checkpoint**: User Story 3 complete and independently validated. Platform abstraction is clean and maintainable.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, documentation, and cross-platform validation

- [ ] T137 [P] Update AGENTS.md "Recent Changes" section with 001-platform-injection summary
- [ ] T138 [P] Add inline code comments for complex parser logic (DOM selectors, regex patterns)
- [ ] T139 [P] Verify all error messages are user-friendly (no raw stack traces without context)
- [ ] T140 Run final cross-platform validation: test EH, NH, Test platforms in sequence
- [ ] T141 Verify platform detection performance: measure detectPlatform() execution time, confirm <100ms per SC-002
- [ ] T142 Verify initialization timeout: test with slow network, confirm 60s timeout works per SC-003
- [ ] T143 Verify error handling: test various failure scenarios (network error, DOM parsing error, timeout), confirm no uncaught errors per SC-005
- [ ] T144 Verify host page integrity: test on real EH/NH pages, confirm host page functionality not broken per FR-015
- [ ] T145 Run `npm run build-prod` and verify production build succeeds
- [ ] T146 Test production build on real EH/NH pages using Tampermonkey
- [ ] T147 Document final validation results in specs/001-platform-injection/final-validation.md
- [ ] T148 Create pull request with all changes, reference spec.md and validation docs

---

## Dependencies & Execution Order

### Story Completion Order

```
Phase 1 (Setup) → Phase 2 (Foundational) → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6 (Polish)
                                              ↓              ↓              ↓
                                           MVP Ready    Full Refactor   Clean Code
```

### Critical Path

1. **Setup** (T001-T003): TypeScript configuration
2. **Foundational** (T004-T010): Core types, loading/error UI, shared utilities
3. **US1 Core** (T011-T032): Platform detection, factory, initialization, main.ts refactor
4. **US1 Validation** (T033-T042): Browser testing on localhost
5. **US2 EH** (T043-T072): EH parsers and service implementation
6. **US2 NH** (T073-T098): NH parsers and service implementation
7. **US2 Validation** (T099-T118): Browser testing on real EH/NH pages
8. **US3** (T119-T136): Code organization and documentation
9. **Polish** (T137-T148): Final validation and production build

### Parallel Opportunities

**Within Phase 2 (Foundational)**:
- T007, T008, T009 (LoadingErrorWrapper component) can run in parallel with T004-T006 (type definitions)

**Within Phase 4 (US2)**:
- EH parsers (T043-T056) can run in parallel with NH parsers (T073-T082)
- EH service (T057-T072) depends on EH parsers completing
- NH service (T083-T098) depends on NH parsers completing
- EH and NH services can run in parallel once their respective parsers are done

**Within Phase 5 (US3)**:
- T119, T120, T121 (code extraction) can run in parallel
- T122, T123, T124 (JSDoc comments) can run in parallel after extraction

**Within Phase 6 (Polish)**:
- T137, T138, T139 (documentation and comments) can run in parallel

---

## Implementation Strategy

### MVP Scope (Minimum Viable Product)

**Goal**: Get platform detection working on localhost for development

**Tasks**: Phase 1 + Phase 2 + Phase 3 (T001-T042)

**Deliverable**: Test platform works on localhost with loading/error states

**Validation**: Navigate to localhost:5173, verify reader initializes with mock data

### Incremental Delivery

1. **Iteration 1** (MVP): Complete Phase 1-3 → Test platform works
2. **Iteration 2** (EH Platform): Complete Phase 4 EH tasks (T043-T072, T099-T107) → EH platform works
3. **Iteration 3** (NH Platform): Complete Phase 4 NH tasks (T073-T098, T108-T118) → NH platform works
4. **Iteration 4** (Clean Code): Complete Phase 5 → Code is maintainable
5. **Iteration 5** (Production): Complete Phase 6 → Ready for deployment

### Parallel Team Strategy

With multiple developers:

1. **Team completes Phase 1-2 together** (foundational work)
2. **Once Phase 2 done**:
   - Developer A: Phase 3 (US1 - platform detection)
   - Developer B: Phase 4 EH (T043-T072 - EH implementation)
   - Developer C: Phase 4 NH (T073-T098 - NH implementation)
3. **Integration**: Merge US1 first, then EH, then NH
4. **Final**: Team completes Phase 5-6 together

---

## Notes

- **[P] tasks**: Different files, no dependencies, can run in parallel
- **[Story] label**: Maps task to specific user story for traceability
- **Parser Rewrite**: All parsers MUST be rewritten from scratch per clarification Q4 (no legacy code reuse)
- **URL Patterns**: EH uses /g/* and /s/*, NH uses /g/[id]/[page]/ per FR-002 to FR-004
- **Timeout**: 60 seconds per FR-020
- **Error Display**: User-friendly message + technical details per FR-017, FR-018
- **Validation**: Every phase MUST include browser testing via `chrome-devtools-mcp` per Constitution Principle III
- **EH Priority**: EH platform correctness prioritized over NH per Constitution Additional Constraints
- **No Legacy Code**: Verify no references to core.launcher or core.createAppView per FR-010, SC-007
- **Commit Strategy**: Commit after each logical group of tasks (e.g., after completing all EH parsers)
- **Stop at Checkpoints**: Validate each user story independently before proceeding to next

---

## Task Summary

**Total Tasks**: 148

**Tasks by Phase**:
- Phase 1 (Setup): 3 tasks
- Phase 2 (Foundational): 7 tasks
- Phase 3 (US1): 32 tasks (20 implementation + 12 validation)
- Phase 4 (US2): 76 tasks (60 implementation + 16 validation)
- Phase 5 (US3): 18 tasks (12 implementation + 6 validation)
- Phase 6 (Polish): 12 tasks

**Tasks by User Story**:
- US1 (Platform Detection): 32 tasks
- US2 (Modernized Architecture): 76 tasks
- US3 (Clean Abstraction): 18 tasks
- Shared (Setup + Foundational + Polish): 22 tasks

**Parallel Opportunities**: 35 tasks marked with [P]

**Independent Test Criteria**:
- US1: Test platform works on localhost with loading/error states
- US2: EH and NH platforms work on real pages with all reader features
- US3: Code structure is clean and maintainable (code review)

**Suggested MVP Scope**: Phase 1-3 (T001-T042) - Test platform on localhost
