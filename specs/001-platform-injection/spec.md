# Feature Specification: Platform-Based Injection System

**Feature Branch**: `001-platform-injection`  
**Created**: 2026-02-21  
**Status**: Draft  
**Input**: User description: "修改main.ts,只是EH和NH两个平台的实现注入。根据window.location.host的不同,来实现不同平台的注入（如果是localhost或者ip地址,则使用test实现）。EH和NH两个平台实现的需要完成重构,尽量适配新的实现,如有不能满足的再直接迁移。整体的平台实现支持的重构,需要简洁清晰易懂,有抽象,易维护。"

## User Scenarios & Testing *(mandatory)*

**Validation Note**: For each completed development cycle, run `npm run dev` and verify changed behavior in browser using `chrome-devtools-mcp` before marking work complete.

### User Story 1 - Host-Based Platform Detection (Priority: P1)

When a user visits e-hentai.org, exhentai.org, or nhentai.net, the application automatically detects the platform and initializes the appropriate reader implementation without manual configuration.

**Why this priority**: This is the core functionality that enables the application to work across different manga platforms. Without this, the application cannot function on any platform.

**Independent Test**: Can be fully tested by navigating to each supported domain and verifying that the correct platform-specific reader interface appears with platform-appropriate parsing and rendering.

**Acceptance Scenarios**:

1. **Given** user visits `e-hentai.org/g/[gallery-id]` or `e-hentai.org/s/[page-id]`, **When** page loads, **Then** EH platform implementation initializes with EH-specific DOM parsing and reader UI
2. **Given** user visits `exhentai.org/g/[gallery-id]` or `exhentai.org/s/[page-id]`, **When** page loads, **Then** EH platform implementation initializes (same as e-hentai.org)
3. **Given** user visits `nhentai.net/g/[gallery-id]/[page-number]/`, **When** page loads, **Then** NH platform implementation initializes with NH-specific DOM parsing and reader UI
4. **Given** user visits `localhost:5173` or `127.0.0.1:5173`, **When** page loads, **Then** test platform implementation initializes with mock data
5. **Given** user visits an unsupported domain or non-album page, **When** page loads, **Then** application does not initialize and no errors are thrown
6. **Given** platform is initializing, **When** user sees the page, **Then** loading animation is displayed
7. **Given** platform initialization fails, **When** error occurs, **Then** persistent error message is shown with user-friendly description, followed by clearly labeled technical details (stack trace, platform info, URL), and close button in top-right corner

---

### User Story 2 - Modernized Platform Architecture (Priority: P2)

The platform implementations (EH and NH) are refactored to use the current application architecture, replacing legacy initialization patterns with the modern approach used by the test platform.

**Why this priority**: This enables maintainability and consistency across the codebase. It's P2 because the application can technically work with the legacy pattern, but refactoring is essential for long-term health.

**Independent Test**: Can be tested by verifying that EH and NH platforms initialize using the same patterns as the test platform, and that all reader features (book mode, scroll mode, thumbnail navigation) work identically across all platforms.

**Acceptance Scenarios**:

1. **Given** EH platform is initialized, **When** reader application starts, **Then** platform services are provided using the same dependency injection pattern as test platform
2. **Given** NH platform is initialized, **When** reader application starts, **Then** platform services are provided using the same dependency injection pattern as test platform
3. **Given** any platform is initialized, **When** reader components need platform services, **Then** they receive the platform-specific implementation through dependency injection
4. **Given** platform initialization completes, **When** reader UI renders, **Then** no references to legacy initialization patterns exist in the codebase

---

### User Story 3 - Clean Platform Abstraction (Priority: P3)

The platform detection and initialization logic is abstracted into a clear, maintainable structure that makes it easy to add new platforms in the future.

**Why this priority**: This improves developer experience and reduces technical debt. It's P3 because the application can function without perfect abstraction, but it significantly improves maintainability.

**Independent Test**: Can be tested by reviewing the code structure and verifying that adding a hypothetical new platform (e.g., "hitomi.la") would require only creating a new platform directory and adding one line to the host detection logic.

**Acceptance Scenarios**:

1. **Given** a developer wants to add a new platform, **When** they create a new platform implementation, **Then** they only need to implement the platform service contract and add host detection logic
2. **Given** platform initialization code exists, **When** reviewing entry point, **Then** the host detection logic is centralized in a single, clear function
3. **Given** multiple platforms exist, **When** reviewing platform implementations, **Then** each platform directory follows the same consistent structure
4. **Given** platform-specific logic exists, **When** reviewing code, **Then** shared utilities (request handling, retry logic, storage) are in a common location and reused across platforms

---

### Edge Cases

- Non-album pages: Application does not initialize on homepage, search results, or gallery list pages
- IP addresses with non-standard ports (e.g., `192.168.1.100:8080`): Port numbers are ignored; test platform initializes based on IP pattern
- Platform initialization failures (e.g., DOM parsing error, network timeout): System shows loading animation during initialization, displays persistent error message with user-friendly description and technical details (stack trace, platform info, URL) on failure, logs to console, and provides close button for user to dismiss
- Switching between e-hentai.org and exhentai.org: Each page load independently detects and initializes appropriate platform
- Multiple tabs on different platforms: Each tab operates independently with its own platform instance

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST detect platform based on browser URL (host + pathname) and initialize only on album view pages
- **FR-002**: System MUST support EH platform for URLs matching `e-hentai.org/g/*` or `e-hentai.org/s/*`
- **FR-003**: System MUST support EH platform for URLs matching `exhentai.org/g/*` or `exhentai.org/s/*`
- **FR-004**: System MUST support NH platform for URLs matching `nhentai.net/g/[gallery-id]/[page-number]/` pattern
- **FR-005**: System MUST use test platform implementation for `localhost` and IP address hosts (e.g., `127.0.0.1`, `192.168.x.x`)
- **FR-006**: System MUST NOT initialize on non-album pages (homepage, search results, gallery lists)
- **FR-007**: EH platform implementation MUST be refactored to use current application architecture (not legacy patterns)
- **FR-008**: NH platform implementation MUST be refactored to use current application architecture (not legacy patterns)
- **FR-009**: Platform parsers MUST be rewritten from scratch to match the new architecture (no legacy parser code or adapters)
- **FR-010**: Platform initialization MUST use modern dependency injection pattern (not legacy initialization pattern)
- **FR-011**: Platform implementations MUST provide album services through dependency injection
- **FR-012**: Shared platform utilities (request handling, retry, storage) MUST be reused across all platforms
- **FR-013**: Each platform implementation MUST follow consistent directory structure
- **FR-014**: Platform initialization MUST mount reader application to a platform-specific container element
- **FR-015**: System MUST handle platform initialization failures gracefully without breaking the host page
- **FR-016**: System MUST display loading animation during platform initialization
- **FR-017**: System MUST show persistent error message when initialization fails, with option for user to close the reader UI
- **FR-018**: Error message MUST include user-friendly description followed by clearly labeled technical error details (stack trace, platform info, URL) to facilitate user bug reports
- **FR-019**: System MUST log detailed initialization errors to browser console (stack trace, platform info, URL)
- **FR-020**: System MUST timeout platform initialization after 60 seconds and display error message
- **FR-021**: Reader UI MUST provide a close button (top-right corner) allowing user to dismiss the application
- **FR-022**: Platform implementations MUST support all reader features (book mode, scroll mode, thumbnail navigation, page flipping)
- **FR-023**: Platform implementations MUST support platform-specific capabilities (original image loading, source switching) where available

### Key Entities

- **Platform**: Represents a manga hosting site (EH, NH, Test) with specific DOM structure, URL patterns, and content parsing logic
- **AlbumService**: Service contract providing album metadata (title, page count, current page) and image loading capabilities
- **PlatformDetector**: Logic that maps browser URL to the appropriate platform implementation
- **PlatformInitializer**: Orchestrates platform-specific service creation, application setup, and DOM mounting

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can access manga reader on e-hentai.org, exhentai.org, and nhentai.net without manual configuration
- **SC-002**: Platform detection completes in under 100ms on page load
- **SC-003**: Platform initialization completes within 60 seconds or displays timeout error
- **SC-004**: All reader features (book mode, scroll mode, thumbnail navigation) work identically across EH and NH platforms
- **SC-005**: Platform initialization failures do not break the host page or throw uncaught errors
- **SC-006**: Adding a new platform requires modifying only the entry point (for detection) and creating a new platform directory (for implementation)
- **SC-007**: Code review confirms no references to legacy initialization patterns in platform implementations
- **SC-008**: Test platform works on localhost and IP addresses for development and testing
- **SC-009**: Platform-specific features (original image, source switching) are available when supported by the platform

## Clarifications

### Session 2026-02-21

- Q: When a user visits a supported platform domain (e.g., e-hentai.org) but NOT an album page (homepage, search, gallery list), what should the application do? → A: Do not initialize at all; wait for user to navigate to an album page
- Q: When platform initialization fails (e.g., DOM parsing error, network timeout), what should the user experience be? → A: Show error notification that persists until user dismisses it (with loading animation during initialization, error message on failure, and close button in top-right corner)
- Q: What is the maximum time allowed for platform initialization before showing an error? → A: 60 seconds
- Q: When refactoring EH/NH platforms, how should existing parser code that doesn't fit the new architecture be handled? → A: Rewrite all parsers from scratch to perfectly match new architecture
- Q: Should initialization errors be logged to browser console for debugging, and what information should be included? → A: Log detailed error with stack trace, platform info, and URL to console; also display technical error details on user-facing error page (with clear labeling to distinguish initialization error message from technical details)

## Assumptions

- The current application architecture (used by test platform) is stable and ready for production use
- The reader application component is ready to receive platform-specific services through dependency injection
- Platform parsers will be rewritten from scratch to align with the new architecture (no legacy code reuse)
- Shared platform utilities (request handling, retry logic, storage adapters) are stable and sufficient
- Platform detection based on browser URL (host + pathname) is sufficient for identifying album pages
- IP address detection can use simple pattern matching (e.g., checking for numeric octets)
- Port numbers in localhost/IP addresses should be ignored for platform detection purposes
