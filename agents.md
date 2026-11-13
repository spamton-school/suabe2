# Agent Guide & Project Documentation: SUABE 2

This document provides context, technical architecture, and feature specifications for SUABE 2. **Any AI agent or developer making changes to this codebase must update this file as they work.**

---

## 📁 Repository Structure

```text
suabe2/
├── .nojekyll                  # Bypasses Jekyll on GitHub Pages for static file serving
├── agents.md                  # Project reference and instructions for AI agents
├── index.html                 # Root GitHub Pages entrypoint & offline loader
├── releases.json              # Version catalog and metadata for downloadable builds
├── sw.js                      # Root Service Worker for offline PWA caching & DNS bypass
├── dev/
│   ├── suabe2_dev.html        # Experimental development fork
│   ├── suabe2_loader_dev.html # Primary HTML offline-capable loader for dev
│   └── suabe2_loader_dev.svg  # SVG foreignObject CDN loader (pulls dev)
├── releases/
│   ├── suabe2.html            # Production release mirror (v2.0)
│   └── suabe2_v2.0.html       # Archived release build v2.0
└── stable/
    ├── image.svg              # SVG foreignObject CDN loader (pulls stable)
    └── suabe2.html            # Production release build
```

---

## 🚀 Stable Build Features (`stable/suabe2.html`)

SUABE 2 is a single-file, zero-dependency client-side tab cloaker and content viewer.

1. **URL Mode**:
   - Accepts URLs (auto-prefixes `https://` if omitted).
   - Embeds target URL in a full-screen iframe (`width: 100%; height: 100vh; border: none`).
   - Cloaks the new tab as `about:blank` by default.
   - Injects title and favicon dynamically.
   - Prevents accidental tab closure via `beforeunload` prompt (`CONFIG.closePrompt`).

2. **File Mode**:
   - Supports uploading/viewing files (HTML, SVG, JS, CSS, JSON, Python, C++, etc.).
   - **HTML/SVG Files**: Injects chosen title and favicon directly into the `<head>` of the markup, then renders inside the tab.
   - **Plain Text / Code Files**: Injects content into a styled dark-theme code viewer (`<pre>`) with filename header and anti-close protection.

3. **Favicon & Title Cloaking**:
   - Switchable favicon profiles (defaults to Google).
   - Add custom favicon via icon URL (must contain `.ico`) and custom tab title.
   - Delete custom favicons.
   - Persists selected favicon across sessions.

4. **History System**:
   - Stores up to 50 recent items in `localStorage`.
   - Re-open past URLs or files with a single click.
   - Content of files under 5MB (`CONFIG.maxFileSizeBytes`) is cached in `localStorage` for instant re-opening without re-uploading.
   - Clear history individually or in bulk.

5. **Settings Panel**:
   - **Replace Current Page** (`replaceCurrentPage`): When enabled, writes content into the current document (`document.open()` / `document.write()`) instead of launching a new tab. Default: `false`.
   - **Data Export**: Downloads a JSON file (`suabe_YYYY-MM-DD.json`) containing history, custom favicons, and settings.
   - **Data Import**: Merges imported JSON history, favicons, and settings back into `localStorage` without duplicates.

6. **Loaders / Launchers (`stable/image.svg` & `dev/image.svg`)**:
   - `stable/image.svg`: Lightweight SVG loader fetching `stable/suabe2.html` from jsDelivr CDN (`https://cdn.jsdelivr.net/gh/spamton-school/suabe2@main/stable/suabe2.html`).
   - `dev/image.svg`: Lightweight SVG loader fetching `dev/suabe2_dev.html` from jsDelivr CDN (`https://cdn.jsdelivr.net/gh/spamton-school/suabe2@main/dev/suabe2_dev.html`).

---

## 🧪 Dev Build Features (`dev/suabe2_dev.html`)

The dev build contains experimental features and forward-looking additions.

1. **Blob URL Cloaking Mode (`useBlobUrl`)**:
   - **Toggle in Settings**: "Open in Blob URL" toggle (`#blobUrlCheckbox`). Default: `off` (`false`).
   - **Behavior**:
     - When **enabled**, generates an in-memory `Blob([content], { type: 'text/html;charset=utf-8' })` and opens `URL.createObjectURL(blob)` in a new tab instead of `about:blank`.
     - Displays `blob:<origin>/<uuid>` in the address bar.
     - Operates across all modes: URL iframe embed, HTML file view, plain text file view, and Flash SWF view.
     - If both "Replace Current Page" and "Open in Blob URL" are checked, the current page navigates to the Blob URL via `window.location.replace(blobUrl)`.
     - When **disabled**, retains standard `about:blank` opening behavior.
   - **Storage & Sync**: Key `useBlobUrl` is saved to `suabe2_settings` and supported in JSON export/import.

2. **Viewer Navigation Topbar (URL & File Modes)**:
   - **Unified Interactive Topbar**: Injected into the opened content page when opening URLs (`openInIframe`) and files (`openFileAsHtml`, `openFileAsText`, `openFileAsSwf`). Redesigned with zero external dependencies and matching SUABE 2's dark aesthetic.
   - **Key Components**:
     - **URL Bar (`#navUrl`)**: Displays current URL or loaded filename, allows in-page navigation (with protocol autocomplete and search fallback), navigates on `Enter` or clicking the Go button (`#goBtn`).
     - **Upload File Button (`#topUpload` / `.top-upload-btn`)**: Positioned next to the URL bar, allows uploading and switching files directly within the viewer. Supports SWF Flash files, HTML-like files, and plain text/code files.
     - **Maximize (Fullscreen) (`#fullscreenBtn`)**: Toggles browser fullscreen via Fullscreen API (`requestFullscreen` / `exitFullscreen`). Automatically minimizes the navbar (`topbar-minimized`) upon entering fullscreen for an unobstructed full-screen view, and automatically restores the navbar upon exiting fullscreen. Dynamically swaps between expand and compress SVG icons on `fullscreenchange`.
     - **Minimize Topbar (`#minimizeBtn`)**: Collapses the topbar (`transform: translateY(-100%)`) and expands the iframe to full 100vh. Reveals a sleek floating restore pill (`#restoreBarBtn`, "Show Bar") at the top center to smoothly restore the bar.
     - **Reload Button (`#refreshBtn`)**: Refreshes the iframe (`contentWindow.location.reload()` with `iframe.src = iframe.src` cross-origin fallback) with a subtle spin animation.
     - **Inline SVGs**: Completely self-contained; zero external flaticon or image dependencies.
   - **Automatic History Logging in Viewer**:
     - Typed URLs entered in `#navUrl` are immediately saved to `suabe2_history` in `localStorage`.
     - Files uploaded via the topbar Upload button are parsed and saved to `suabe2_history` (with full content cached if `<= 5MB`).
     - Updates synchronize in real-time with the parent tab via `storage` event listeners and `window.opener.renderHistory()`.
   - **Settings Toggle (`showViewerTopbar`)**:
     - Toggle in Settings: "Viewer Navigation Bar" (`#topbarCheckbox`). Default: `on` (`true`).
     - If unchecked, falls back to the classic minimal full-screen iframe or direct file view without topbar.
   - **Storage & Sync**: Key `showViewerTopbar` is saved to `suabe2_settings` and supported in JSON export/import.

3. **Unified Favicon Disguises (`DEFAULT_FAVICONS` in `#faviconList`)**:
   - Disguise presets are integrated directly into the main favicon list beneath the default "Google" entry without a separate grid section:
     - Google (`https://www.google.com/favicon.ico`)
     - Canvas LMS (`https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico`)
     - Google Classroom (`https://ssl.gstatic.com/classroom/favicon.png`)
     - Google Drive (`https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png`)
     - Google Docs (`https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico`)
     - Wikipedia (`https://en.wikipedia.org/static/favicon/wikipedia.ico`)
   - Clicking any item applies the disguise immediately, updates `suabe2_lastSelectedFavicon`, and highlights the selected row. Default disguises cannot be deleted; custom favicons display delete buttons.
   - **Reordered Favicon Panel**: The selector (`#faviconList`) is positioned at the top of the panel, with the custom favicon input fields and add button below it separated by a clean top border.

4. **Iframe Game Permissions**:
   - Full permission policy injected into `contentIframe` across all viewer modes:
     `allow="fullscreen; autoplay; gamepad; pointer-lock; clipboard-write;" allowfullscreen="true"`.
   - Enables mouse capture (pointer lock) for 3D/FPS browser games, gamepad controller APIs, sound autoplay, and in-game full-screening.

5. **Built-in Flash (`.swf`) Player via Ruffle**:
   - Native support for Flash games (`.swf`) using the official Ruffle WebAssembly emulator from unpkg CDN (`https://unpkg.com/@ruffle-rs/ruffle`).
   - `.swf` files uploaded on the home screen or inside the viewer are converted to data URLs and loaded into an isolated Ruffle player container.
   - Seamlessly integrated with cloaking, topbar navigation, fullscreening, and history caching.

6. **Drag-and-Drop Anywhere**:
   - Users can drag and drop any supported file (SWF, HTML, text, code, images, SVG) directly onto the main page or into the viewer.
   - Main page displays an animated glow drag overlay (`#dragDropOverlay`) styled in orange/amber (`#ff9d3d`, `rgba(255, 157, 61, 0.08)`) matching the file mode theme. Dropping automatically switches to file mode and opens the file.
   - In-viewer drop handler automatically parses and displays the dropped file, refreshing the viewer without leaving cloaked mode.

7. **Auto-Hiding / Hover Navigation Bar (`autoHideTopbar`)**:
   - **Toggle in Settings**: "Auto-Hide Navigation Bar" (`#autoHideCheckbox`). Default: `off` (`false`).
   - When enabled, the viewer topbar automatically slides away after 2.5 seconds of inactivity.
   - Enhanced detection architecture:
     - An invisible fixed sensor strip (`#topHoverZone`, 14px at top of viewport, z-index 9998) detects cursor movement even when over cross-origin iframes.
     - Hovering the mouse near the top edge ($\le 25\text{px}$) smoothly reveals the navbar.
     - Topbar stays visible while cursor is hovering over `#suabeTopBar` (`isMouseOverBar`) or when the URL input is focused (`isInputFocused`).
     - Exiting fullscreen automatically restores the navbar cleanly.

8. **Starred / Pinned Favorites in History**:
   - Each item in the history dropdown features a star / pin button (`.history-item-star`).
   - Starred items are pinned to the top of the history list with a glowing amber badge.
   - Pinned entries are protected from automatic FIFO trimming when the history exceeds 50 items.
   - Toggling pin state updates `suabe2_history` in `localStorage` immediately.
   - Hover styling is isolated so star buttons never produce unwanted blue glow; on file items, the star glows with matching amber (`#ff9d3d`).

9. **Accidental Refresh Interception**:
   - Intercepts `F5` and `Ctrl+R` / `Cmd+R` keystrokes inside the viewer window and simple iframe wrapper.
   - Instead of refreshing the top-level tab and destroying the cloaked `about:blank` or Blob URL session, it triggers a reload of the inner iframe only.

10. **IndexedDB Offline Cache (`IDBStorage` / `suabe2_files_db`)**:
    - Overcomes `localStorage` 5MB quota limitations for large offline games and Flash ROMs.
    - Files $\le 5\text{MB}$ are stored in `suabe2_history` in `localStorage`.
    - Files $> 5\text{MB}$ are automatically saved into IndexedDB database `suabe2_files_db` (object store `files`).
    - History items indicate cached large files with a `💾` indicator and can be reopened without re-uploading.
    - Deleting history items or clearing history automatically purges corresponding files from IndexedDB.

11. **URL Protocol Autocomplete & Bing Search Fallback (`searchFallback`)**:
    - **Toggle in Settings**: "Bing Search Fallback" (`#searchFallbackCheckbox`). Default: `on` (`true`).
    - Intelligently evaluates URL bar input:
      - Explicit schemes (`https://`, `about:`, `blob:`, `data:`) are preserved.
      - Recognizable domains (`example.com`, `game.io/play`, `localhost:8080`, IPs) are auto-prefixed with `https://`.
      - Inputs containing spaces or non-domain keywords (e.g., `slope game`, `chess`) automatically route to `https://www.bing.com/search?q=...`.
      - Note: Replaced DuckDuckGo because DuckDuckGo transmits `X-Frame-Options: SAMEORIGIN` and blocks iframe embedding; Bing allows iframe embedding.

12. **Unified Mode Slider & Switch Animation (`classicSwitcher`)**:
    - Replaced separate URL and File buttons with a single unified mode slider component (`#modeSlider`).
    - Interactive sliding glider (`#sliderGlider`) smoothly shifts between URL (cyan accent `#00d9ff`) and File (amber accent `#ff9d3d`) using cubic-bezier easing.
    - Added subtle fade and slide animation (`@keyframes modeFadeSlide`) when toggling between URL input and file chooser.
    - Standardized `#urlInput` and `#fileButtonUI` to exact `height: 52px; box-sizing: border-box; line-height: 20px; font-family: inherit;` to eliminate any sizing differences between modes.
    - Clicking anywhere on the mode slider toggles between URL and File modes smoothly.
    - **Toggle in Settings**: "Classic Mode Switcher" (`#classicSwitcherCheckbox`). Default: `off` (`false`). When enabled, restores the original two separate category buttons.
    - **Storage & Sync**: Key `classicSwitcher` is saved to `suabe2_settings` and supported in JSON export/import.

13. **HTML Data URI Generator (`#dataUriBtn` & `#dataUriPanel`)**:
    - Dedicated Data URI button (`#dataUriBtn`) with link icon and green theme (`#00ff88`) placed to the left of the cloak disguises button (`#faviconBtn`).
    - Panel `#dataUriPanel` generates an HTML Data URI (`data:text/html;base64,...`) from `image.svg` embedded HTML content (compressed and base64-encoded).
    - Includes:
      - Selectable readonly output textbox (`#dataUriOutput`) with `autocomplete="off"`.
      - "Copy Data URI" button (`#copyDataUriBtn`) with clipboard copy and visual feedback.
      - Usage guide and hint (`#dataUriHint`) for pasting the copied Data URI directly into a new tab's omnibox (`Ctrl+T` / `Ctrl+V`).
      - "Cache Data URI in browser" toggle (`#cacheDataUriCheckbox`, default: `off`) inside the panel to persist the generated data URI in `localStorage` under `suabe2_cached_data_uri`. When unchecked, existing cache is purged and the output textarea is reset.

14. **Organized Settings Menu**:
    - Cleanly structured into four distinct categories:
      - **Cloaking & Tab Mode**: *Replace Current Page*, *Open in Blob URL*.
      - **Viewer Navigation**: *Viewer Navigation Bar*, *Auto-Hide Navigation Bar*, *Bing Search Fallback*.
      - **Controls & Appearance**: *Classic Mode Switcher*.
      - **Data & Storage**: *Export Data*, *Import Data* (seamless layout without divider line).

15. **Action Row & Layout Shift Prevention**:
    - `#confirmBtn` and `#statusMsg` are encapsulated inside a shared `.action-row` with fixed vertical constraints (`48px` row height, `24px` line-height status text).
    - Prevents "opened" or "file loaded from cache" status messages from shifting input elements above or history items below.

16. **Visual DEV Indicator & Export Identifier**:
    - Amber `DEV` badge on header to differentiate from stable release.
    - Exports data as `suabe_dev_YYYY-MM-DD.json`.

17. **Draggable & Reorderable Cloaks (`suabe2_cloak_order`)**:
    - Cloak items in `#faviconList` can be freely dragged and reordered.
    - Each row includes a subtle 6-dot grip icon (`.favicon-item-grip`) and responsive drag styling (`.dragging`).
    - Smooth GPU-accelerated live translation: As a cloak is dragged over the list, neighboring items glide up or down out of the way using `transform: translateY(...)` with `cubic-bezier(0.2, 0.8, 0.2, 1)`, visually opening a slot for the dragged item.
    - FLIP animation on drop smoothly slides elements into their resting positions with zero layout thrashing or sudden teleportation.
    - Container scrolling is stabilized by locking `.favicon-panel` to `overflow: hidden;` and isolating scrolling to `#faviconList` with `overscroll-behavior: contain;`, eliminating erratic auto-scroll jumps.
    - The custom order of both default disguises and user custom cloaks is persisted in `localStorage` under `suabe2_cloak_order` (array of IDs) and synced in JSON export/import.
    - Segregated drag events (`isExternalFileDrag`) ensure dragging cloaks inside `#faviconList` never triggers the full-screen file drop overlay (`#dragDropOverlay`).

18. **Persistent Submenu State Across Reloads (`suabe2_active_submenu`)**:
    - Remembers which panel was open last (*Settings*, *Cloaks*, or *Data URI*) under `suabe2_active_submenu`.
    - Automatically restores the active panel on reload via `restoreActiveSubmenu()`; if all panels were closed, none open on reload.
    - Included in JSON export/import.

19. **Content-Aware Favicons Panel & Scroll Affordance (`#faviconScrollHint`)**:
    - `#faviconPanel` naturally hugs its content when few cloaks are present, while capping its maximum expansion at `max-height: calc(100vh - 54px)` (`top: 30px`, `width: 320px`, resting 24px above screen bottom, `display: flex`, `flex-direction: column`, `overflow: hidden`).
    - `#faviconList` is nested inside `.favicon-list-container` (`flex: 0 1 auto`, `min-height: 0`, `max-height: calc(100vh - 290px)`).
    - Dynamic scroll affordance: When scrolling is possible (`scrollHeight > clientHeight + 6`), a subtle bottom gradient shadow and bouncing purple arrow indicator (`#faviconScrollHint`, SVG `#9d4edd`) appear at the bottom of the list.
    - The indicator is only visible when at the top of the list (`scrollTop <= 12`), smoothly fading out (`opacity: 0`, `visibility: hidden`) upon scrolling down so it takes away zero space.
    - Re-evaluates dynamically on list scroll, window resize, cloak addition/deletion, or panel opening via `updateFaviconScrollHint()`.

20. **Network & Offline Build Manager (`#networkBtn` & `#networkPanel`)**:
    - Dedicated Network button (`#networkBtn`) styled in cyan/blue theme (`#00d9ff`) positioned immediately to the left of `#dataUriBtn`.
    - Includes an animated notification dot (`#networkUpdateBadge`) and pulsing ring animation (`@keyframes updatePulse`) that triggers when updates to cached builds are detected.
    - Network Panel (`#networkPanel`) features:
      - Live connection indicator displaying online/offline state via `navigator.onLine` and `online`/`offline` window events.
      - Update detection notification banner (`#networkUpdateBanner`) informing the user of available build updates.
      - "Check for Updates" manual trigger button.
      - Downloadable builds list (`#buildsList`) populated dynamically from `releases.json`.
      - Build action cards allowing users to download builds for offline use (`Download`), launch cached builds (`Launch`), or remove them from local storage (`Delete`).
      - Updates are **never automatically installed**; users are notified and choose when to update.
      - **Live Service Worker Visual Indicator (`#swStatusBar`)**:
        - Displays live status of the Service Worker:
          - **Active & Offline-Ready** (`.sw-dot.active`, glowing green): Confirms the Service Worker is controlling the page and caching requests so navigating to the site works with zero network/Wi-Fi connection. Includes a "Check SW" button.
          - **Installing** (`.sw-dot.installing`, amber): Indicates active installation of the Service Worker cache.
          - **Inactive** (`.sw-dot.inactive`, red): Prompts with a "Register" button to activate the worker.
          - **Unavailable on file://** (`.sw-dot.unsupported`, gray): Explains that Service Workers require HTTPS (e.g. GitHub Pages) or localhost.
    - **GitHub Pages & PWA Service Worker (`sw.js` & `index.html`)**:
      - Root `index.html` provides the primary landing page and PWA entrypoint for GitHub Pages (`https://<username>.github.io/<repo>/`).
      - Root `sw.js` implements a Stale-While-Revalidate caching strategy with an offline navigation fallback to `index.html` or `dev/suabe2_loader_dev.html`.
      - `.nojekyll` in repository root bypasses Jekyll preprocessing to serve all static assets cleanly.
    - **Primary Loaders (`dev/suabe2_loader_dev.html` & `dev/suabe2_loader_dev.svg`)**:
      - `suabe2_loader_dev.html` is the primary HTML entrypoint loader.
      - Zero parser-blocking execution scripts in `<head>` and zero `window.stop()` calls, ensuring the document parser never terminates prematurely or leaves a blank screen.
      - The loader container (`.loader-box`) is styled with `display: none;` by default. When cached in `localStorage` (`suabe2_cached_build_dev`), SUABE 2 launches immediately via `document.open('text/html', 'replace'); document.write(safeHtml); document.close();` with zero visual flash, zero stuck loading elements, and full interactivity.
      - If not cached or offline without cache, reveals the dark-themed loader box (`display: flex`) with spinner and "Downloading SUABE 2..." status text, fetches the build from jsDelivr CDN, caches it locally, and launches it. If fetch fails (or offline), presents a clear error message and a "Retry" button.
      - Automatically wraps incoming script contents in an IIFE scope (`/* suabe-scope */`) to eliminate `SyntaxError: redeclaration of let/const` collisions when switching builds in the same window.
      - `dev/suabe2_loader_dev.svg` operates inside SVG XML `<foreignObject>` using an isolated, styled full-screen `<iframe>` (`iframe.srcdoc = html`) with full game permissions (`allow="fullscreen; autoplay; gamepad; pointer-lock;"`), checking `localStorage` cache first and falling back to CDN fetch with offline error handling.
      - `generateDataUri` uses a self-contained, robust HTML loader template with full-screen `iframe`, `srcdoc`, instant `localStorage` cache check, and offline Retry error handling. `compressHtml` safely strips `//` comments without disturbing `https://` URLs, preventing single-line comment truncation in Base64 Data URIs.

---

## 🛠️ Technical Details & Architecture for Future Agents

- **Single-File Design & Lexical Scope Protection**: Both `suabe2.html` and `suabe2_dev.html` are self-contained single-page applications. The main `<script>` blocks are encapsulated inside an IIFE `(function() { /* suabe-scope */ ... })();` to ensure that document replacements or build switches in the same window never trigger `SyntaxError: redeclaration of let/const` on top-level bindings. Public APIs required by external viewers (such as `renderHistory`) are explicitly assigned to `window`. Do not introduce external npm/build dependencies unless explicitly instructed.
- **LocalStorage Schema**:
  - `suabe2_settings`: JSON object `{ replaceCurrentPage: boolean, useBlobUrl?: boolean, showViewerTopbar?: boolean, autoHideTopbar?: boolean, searchFallback?: boolean, classicSwitcher?: boolean }`.
  - `suabe2_history`: JSON array of entries `{ id, type, url, filename, display, timestamp, isSaved, isLargeFile, isPinned?: boolean, inIndexedDB?: boolean, isFlash?: boolean, content?: string }`.
  - `suabe2_favicons`: JSON array of `{ id, title, url }`.
  - `suabe2_cloak_order`: JSON array of string IDs representing custom cloak order.
  - `suabe2_active_submenu`: String (`'settings'`, `'favicon'`, `'dataUri'`, `'network'`) or null indicating the last open submenu.
  - `suabe2_lastSelectedFavicon`: JSON object `{ id, title, url }`.
  - `suabe2_cached_data_uri`: Base64 string of the generated HTML Data URI.
  - `suabe2_cache_data_uri_pref`: String (`'true'` / `'false'`) indicating whether to cache the generated Data URI.
  - `suabe2_cached_build_<id>`: HTML string of build `<id>` cached locally in browser for offline loading (e.g. `suabe2_cached_build_dev`, `suabe2_cached_build_v2.0`).
  - `suabe2_cached_build_<id>_meta`: JSON metadata `{ id, version, cachedAt }` for version comparison.
  - `suabe2_releases_cache`: Cached copy of `releases.json` data for offline build listings.
- **IndexedDB Schema**:
  - Database: `suabe2_files_db` (version 1)
  - Object Store: `files` (keyPath: `id`) -> `{ id, name, size, type, isFlash, data }`
- **Popup Handling**: `window.open` calls must stay attached to direct user interaction events (`click`, `Enter` keypress) to avoid browser popup blockers.
- **CDN Dependency for Loaders**: Ensure that the jsDelivr CDN endpoints in `stable/image.svg` and `dev/image.svg` point to the correct release paths in `spamton-school/suabe2`.

---

## 📋 Instructions for Future Agents & Assistants

1. **Keep this File Updated**:
   - Whenever you add, modify, or remove features in either `stable/` or `dev/`, update this `agents.md` file in the same turn.
   - Record new settings keys, UI toggles, or structural modifications under their respective sections.
2. **Preserve Isolation**:
   - Experimental features must be developed and tested in `dev/` first.
   - Never overwrite or break `stable/suabe2.html` unless the user explicitly requests promoting dev changes to stable.
3. **Maintain Backward Compatibility**:
   - New settings must provide safe default fallbacks (e.g., `false` or existing defaults) so that existing user `localStorage` data and JSON export files do not crash the application.
