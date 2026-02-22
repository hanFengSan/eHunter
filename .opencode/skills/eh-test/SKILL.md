---
name: eh-test
description: Execute end-to-end testing for eHunter on EH platform (exhentai.org)
license: MIT
compatibility: opencode
metadata:
  platform: exhentai
  type: e2e-test
---

## What I do

I automate the complete testing workflow for eHunter userscript on the EH platform:

1. **Build Production Bundle** - Run `npm run build-prod` and verify success
2. **Open Test Page** - Navigate to exhentai.org test gallery using chrome-devtools-mcp
3. **Wait for Injection** - Wait 3 seconds for userscript initialization
4. **Check Console Errors** - Detect JavaScript errors using `chrome-devtools-mcp_list_console_messages`
5. **Verify DOM Mounting** - Check if `ehunter-app` element exists using `chrome-devtools-mcp_take_snapshot`
6. **Run Functional Tests** - Execute platform-specific feature tests

## When to use me

Use this skill when:
- You need to verify eHunter works correctly on exhentai.org after code changes
- You want to run a complete E2E test before releasing
- You need to debug production build issues
- You want to validate DOM injection and console errors

## Prerequisites

Before running this skill, ensure:
- Development server is NOT running (conflicts with production build)
- Chrome DevTools MCP is available and configured
- **Tampermonkey is installed and configured** in the test browser
- **eHunter userscript is already installed** in Tampermonkey with dynamic loading enabled
- You have valid exhentai.org cookies for authentication
- Production build configuration (`vite.config.prod.ts`) is valid

**Important - Dynamic Script Loading:** 
The Tampermonkey script is configured to dynamically load `dist/ehunter.iife.js` from the local build output. This means:
- After running `npm run build-prod`, simply **refresh the image page** to see changes
- No manual script copying or Tampermonkey updates needed
- The script only loads on **image pages** (URLs matching `/s/` pattern like `https://exhentai.org/s/80813c92df/3482416-1`)
- Gallery list pages (`/g/` URLs) will NOT trigger the script injection

## Test Flow

### Step 0: Verify Tampermonkey Setup (Optional)

Before running the full test, you can verify Tampermonkey is properly configured:

Using `chrome-devtools-mcp_evaluate_script`:
```javascript
() => {
  return {
    hasTampermonkey: typeof GM_info !== 'undefined',
    tampermonkeyVersion: typeof GM_info !== 'undefined' ? GM_info.version : null,
    scriptsRunning: typeof GM_info !== 'undefined' ? GM_info.scriptHandler : null
  }
}
```

**Expected Result:** `hasTampermonkey: true` indicates Tampermonkey is active.

### Step 1: Build Production Bundle

```bash
npm run build-prod
```

I will:
- Execute the build command
- Check exit code is 0
- Verify `dist/ehunter.iife.js` exists and has content
- **STOP immediately if build fails** and report errors

**Note:** The Tampermonkey script will automatically load this file on the next page refresh.

### Step 2: Navigate to Image Page

I will use chrome-devtools-mcp to:
- Navigate to the test image page: `https://exhentai.org/s/80813c92df/3482416-1`
- **Important:** Must use a `/s/` URL (image page), NOT `/g/` URL (gallery list page)
- Wait for page load completion
- Handle authentication dialogs if needed

**Why image page?** The Tampermonkey script only injects on image pages where the reader UI is displayed. Gallery list pages (`/g/` URLs) will not trigger the script.

### Step 3: Refresh Page to Load New Build

After building, I will:
- Reload the gallery page using `chrome-devtools-mcp_navigate_page` with `type: "reload"` and `ignoreCache: true`
- This triggers Tampermonkey to load the latest `dist/ehunter.iife.js`
- Wait **3 seconds** for script injection and initialization

**What happens during injection:**
- Tampermonkey detects the gallery page URL pattern
- Loads `dist/ehunter.iife.js` dynamically
- eHunter initializes and mounts the `#ehunter-app` element
- Console logs show initialization progress

**Important:** After waiting, console logs may not appear immediately in the current navigation context. Use `includePreservedMessages: true` when calling `chrome-devtools-mcp_list_console_messages` to retrieve logs across recent navigations.

### Step 4: Console Error Detection

Using `chrome-devtools-mcp_list_console_messages`:
- **IMPORTANT:** Always use `includePreservedMessages: true` parameter to retrieve logs across recent navigations
- Filter for `types: ["error"]` to find errors
- Also check for `types: ["log", "info"]` to verify eHunter initialization
- Report any error messages found
- Categorize errors:
  - eHunter script errors (critical)
  - Page errors (informational)
  - Third-party errors (informational)

**Example Usage:**
```javascript
chrome-devtools-mcp_list_console_messages({
  includePreservedMessages: true,
  types: ["log", "info", "error"]
})
```

**Expected Console Logs:**
- `"eHunter: Platform detected: EH"` - Platform detection successful
- `"[EH Platform] initialized successfully"` - Initialization complete
- Initialization metadata object with title, pageCount, albumId, curPageIndex
- If these logs are missing, the script may not have been injected or failed to initialize

**Why `includePreservedMessages: true` is required:**
- By default, `list_console_messages()` only returns messages from the current navigation
- eHunter logs may be printed during script injection, which could be in a previous navigation context
- Using `includePreservedMessages: true` retrieves logs across the last 3 navigations
- This ensures you capture all initialization logs even if they occurred before the current navigation state

### Step 5: DOM Mounting Check

Using `chrome-devtools-mcp_take_snapshot`:
- Search for element with `id="ehunter-app"`
- Verify the element exists and is visible
- Check if element has child nodes (not empty)
- **Report mounting failure if not found**

**Expected Behavior:** Since Tampermonkey is pre-configured, the `ehunter-app` element should be present in the DOM with child elements rendered by Vue. If the element is empty or missing, this indicates an initialization failure.

### Step 6: Functional Testing

Execute these default test cases:

**Core Functionality:**
- [ ] Album metadata loaded (title, page count, current page)
- [ ] Thumbnail grid rendered with correct layout
- [ ] Reader mode can be opened (Book/Scroll mode)
- [ ] Image loading works in reader
- [ ] Navigation controls functional (prev/next page, jump to page)
- [ ] Settings panel accessible and interactive
- [ ] Cache service operational (check localStorage/GM storage)

**User can specify custom tests** via arguments:
```
Use skill eh-test with tests: book-mode, scroll-mode, thumbnail-expand
```

### Step 7: Test Report

I will generate a structured report:

```markdown
## eHunter EH Platform Test Report

**Timestamp:** [ISO 8601 timestamp]
**Test URL:** https://exhentai.org/g/3482416/a3e66d7d79/

### Build Status
✅ Success / ❌ Failed
[Build output summary]

### Page Load
✅ Success / ❌ Failed / ⚠️ Timeout
[Load time, status code]

### Console Errors
Found X errors:
- [Error 1 details]
- [Error 2 details]

### DOM Mounting
✅ Mounted / ❌ Not Found
Element ID: ehunter-app
Children count: X

### Functional Tests
Passed: X/Y

- ✅ Album metadata loaded
- ✅ Thumbnail grid rendered
- ❌ Reader mode failed to open
- ...

### Screenshots
[Attach relevant screenshots at key steps]

### Recommendations
[Actionable suggestions based on failures]
```

## Error Handling

| Error Type | Action |
|------------|--------|
| Build failure | Stop immediately, report build errors with full output |
| Page load timeout | Retry once with 10s timeout, then report failure |
| Authentication required | Prompt user to check exhentai cookies |
| DOM not found | Check if script was injected, verify userscript manager is active |
| Console errors | Distinguish between eHunter errors and page errors, prioritize eHunter errors |

## Usage Examples

### Basic test with default gallery
```
Use skill eh-test
```

### Test with custom gallery URL
```
Use skill eh-test with url: https://exhentai.org/g/1234567/abcdef1234/
```

### Test specific features only
```
Use skill eh-test with tests: reader-open, image-load, settings-panel
```

### Skip functional tests (build + injection only)
```
Use skill eh-test with mode: quick
```

## Notes

- This skill follows testing requirements in `AGENTS.md`
- Always runs production build (no dev server)
- **Tampermonkey is pre-configured** - userscript auto-loads on page navigation
- Wait time may need adjustment based on network conditions
- Some tests require specific gallery features (e.g., multi-page albums)
- Screenshots are taken at key steps for visual verification
- Test results are saved to `.opencode/test-reports/eh-test-[timestamp].md`

## Troubleshooting

**Build fails with TypeScript errors:**
- Run `npm run type-check` first to identify issues
- Check `tsconfig.json` and `vite.config.prod.ts`

**Tampermonkey script auto-updates:**
- The script dynamically loads `dist/ehunter.iife.js` on each page load
- After running `npm run build-prod`, simply refresh the gallery page
- No manual copying or Tampermonkey editing required
- Changes take effect immediately on next page load

**Script only loads on image pages:**
- Image URLs: `https://exhentai.org/s/[token]/[id]-[page]` ✅
- Gallery list URLs: `https://exhentai.org/g/[id]/[token]/` ❌
- Always test on image pages to see the reader UI and thumbnail view

**Page shows "Sad Panda" (403 error):**
- Exhentai requires valid cookies
- User needs to log in to e-hentai.org first
- Check browser cookie storage

**DOM element not found:**
- **First, verify you're on an image page** (`/s/` URL, not `/g/` URL)
- Check console for eHunter initialization logs
- Verify Tampermonkey is enabled in the test browser
- Check if `dist/ehunter.iife.js` exists and was built successfully
- Increase wait time if network is slow
- Check for JavaScript errors that may have prevented initialization

**Console shows "GM_* is not defined":**
- Tampermonkey not properly configured in test browser
- Script may be running in wrong context
- Check `@grant` directives in script header
- Verify the userscript is installed in Tampermonkey (not just the browser)

**Cannot see console logs / logs appear empty:**
- **Always use `includePreservedMessages: true`** when calling `chrome-devtools-mcp_list_console_messages`
- Default behavior only shows logs from current navigation, missing initialization logs
- eHunter logs are printed during script injection and may be in a previous navigation context
- Example: `chrome-devtools-mcp_list_console_messages({ includePreservedMessages: true })`
- Wait at least 3 seconds after navigation before checking console logs
