# Agent Guide & Project Documentation: SUABE 2

This document provides context, technical architecture, and feature specifications for SUABE 2. **Any AI agent or developer making changes to this codebase must update this file as they work.**

---

## 📁 Repository Structure

```text
suabe2/
├── agents.md            # Project reference and instructions for AI agents
├── dev/
│   ├── image.svg        # SVG foreignObject CDN loader (pulls dev)
│   └── suabe2_dev.html  # Experimental development fork
└── stable/
    ├── image.svg        # SVG foreignObject CDN loader (pulls stable)
    └── suabe2.html      # Production release build
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

3. **One-Click Cloak Presets (`#presetFaviconGrid`)**:
   - Quick cloaking preset cards in the Favicon / Cloaking panel for popular disguises:
     - Google (`https://www.google.com/favicon.ico`)
     - Google Classroom (`https://ssl.gstatic.com/classroom/favicon.png`)
     - Google Drive (`https://ssl.gstatic.com/images/branding/product/1x/drive_2020q4_32dp.png`)
     - Google Docs (`https://ssl.gstatic.com/docs/documents/images/kix-favicon7.ico`)
     - Canvas LMS (`https://du11hjcvx0uqb.cloudfront.net/br/dist/images/favicon-e10d657a73.ico`)
     - Wikipedia (`https://en.wikipedia.org/static/favicon/wikipedia.ico`)
   - Clicking any preset applies the disguise immediately, updates `suabe2_lastSelectedFavicon`, and highlights the selected card.

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
   - Main page displays an animated glow drag overlay (`#dragDropOverlay`). Dropping automatically switches to file mode and opens the file.
   - In-viewer drop handler automatically parses and displays the dropped file, refreshing the viewer without leaving cloaked mode.

7. **Auto-Hiding / Hover Navigation Bar (`autoHideTopbar`)**:
   - **Toggle in Settings**: "Auto-Hide Navigation Bar" (`#autoHideCheckbox`). Default: `off` (`false`).
   - When enabled, the viewer topbar automatically slides away after 2.5 seconds of inactivity.
   - Hovering the mouse near the top edge ($\le 35\text{px}$) smoothly reveals the navbar.
   - Fullscreen mode continues to auto-minimize independently.

8. **Starred / Pinned Favorites in History**:
   - Each item in the history dropdown features a star / pin button (`.history-item-star`).
   - Starred items are pinned to the top of the history list with a glowing amber badge.
   - Pinned entries are protected from automatic FIFO trimming when the history exceeds 50 items.
   - Toggling pin state updates `suabe2_history` in `localStorage` immediately.

9. **Accidental Refresh Interception**:
   - Intercepts `F5` and `Ctrl+R` / `Cmd+R` keystrokes inside the viewer window and simple iframe wrapper.
   - Instead of refreshing the top-level tab and destroying the cloaked `about:blank` or Blob URL session, it triggers a reload of the inner iframe only.

10. **IndexedDB Offline Cache (`IDBStorage` / `suabe2_files_db`)**:
    - Overcomes `localStorage` 5MB quota limitations for large offline games and Flash ROMs.
    - Files $\le 5\text{MB}$ are stored in `suabe2_history` in `localStorage`.
    - Files $> 5\text{MB}$ are automatically saved into IndexedDB database `suabe2_files_db` (object store `files`).
    - History items indicate cached large files with a `💾` indicator and can be reopened without re-uploading.
    - Deleting history items or clearing history automatically purges corresponding files from IndexedDB.

11. **URL Protocol Autocomplete & DuckDuckGo Search Fallback (`searchFallback`)**:
    - **Toggle in Settings**: "DuckDuckGo Search Fallback" (`#searchFallbackCheckbox`). Default: `on` (`true`).
    - Intelligently evaluates URL bar input:
      - Explicit schemes (`https://`, `about:`, `blob:`, `data:`) are preserved.
      - Recognizable domains (`example.com`, `game.io/play`, `localhost:8080`, IPs) are auto-prefixed with `https://`.
      - Inputs containing spaces or non-domain keywords (e.g., `slope game`, `chess`) automatically route to `https://duckduckgo.com/?q=...`.

12. **Organized Settings Menu**:
    - Cleanly structured into three distinct categories:
      - **Cloaking & Tab Mode**: *Replace Current Page*, *Open in Blob URL*.
      - **Viewer Navigation**: *Viewer Navigation Bar*, *Auto-Hide Navigation Bar*, *DuckDuckGo Search Fallback*.
      - **Data & Storage**: *Export Data*, *Import Data*.

13. **Visual DEV Indicator & Export Identifier**:
    - Amber `DEV` badge on header to differentiate from stable release.
    - Exports data as `suabe_dev_YYYY-MM-DD.json`.

---

## 🛠️ Technical Details & Architecture for Future Agents

- **Single-File Design**: Both `suabe2.html` and `suabe2_dev.html` are self-contained single-page applications (HTML + CSS in `<style>` + JS in `<script>`). Do not introduce external npm/build dependencies unless explicitly instructed.
- **LocalStorage Schema**:
  - `suabe2_settings`: JSON object `{ replaceCurrentPage: boolean, useBlobUrl?: boolean, showViewerTopbar?: boolean, autoHideTopbar?: boolean, searchFallback?: boolean }`.
  - `suabe2_history`: JSON array of entries `{ id, type, url, filename, display, timestamp, isSaved, isLargeFile, isPinned?: boolean, inIndexedDB?: boolean, isFlash?: boolean, content?: string }`.
  - `suabe2_favicons`: JSON array of `{ id, title, url }`.
  - `suabe2_lastSelectedFavicon`: JSON object `{ id, title, url }`.
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
