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
     - Operates across all modes: URL iframe embed, HTML file view, and plain text file view.
     - If both "Replace Current Page" and "Open in Blob URL" are checked, the current page navigates to the Blob URL via `window.location.replace(blobUrl)`.
     - When **disabled**, retains standard `about:blank` opening behavior.
   - **Storage & Sync**: Key `useBlobUrl` is saved to `suabe2_settings` and supported in JSON export/import.

2. **Viewer Navigation Topbar (URL & File Modes)**:
   - **Unified Interactive Topbar**: Injected into the opened content page when opening URLs (`openInIframe`) and files (`openFileAsHtml`, `openFileAsText`). Redesigned with zero external dependencies and matching SUABE 2's dark aesthetic.
   - **Key Components**:
     - **URL Bar (`#navUrl`)**: Displays current URL or loaded filename, allows in-page navigation (auto-prefixes `https://`), navigates on `Enter` or clicking the Go button (`#goBtn`).
     - **Upload File Button (`#topUpload` / `.top-upload-btn`)**: Positioned next to the URL bar, allows uploading and switching files directly within the viewer. Supports HTML-like files and plain text/code files.
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

3. **Visual DEV Indicator**:
   - Features an amber/orange `DEV` tag (`.dev-badge`) alongside the header `SUABE 2` title to prevent confusion with the stable build.

4. **Export Identifier**:
   - Exports data with the filename format `suabe_dev_YYYY-MM-DD.json`.

---

## 🛠️ Technical Details & Architecture for Future Agents

- **Single-File Design**: Both `suabe2.html` and `suabe2_dev.html` are self-contained single-page applications (HTML + CSS in `<style>` + JS in `<script>`). Do not introduce external npm/build dependencies unless explicitly instructed.
- **LocalStorage Schema**:
  - `suabe2_settings`: JSON object `{ replaceCurrentPage: boolean, useBlobUrl?: boolean, showViewerTopbar?: boolean }`.
  - `suabe2_history`: JSON array of entries `{ id, type, url, filename, display, timestamp, isSaved, isLargeFile, content }`.
  - `suabe2_favicons`: JSON array of `{ id, title, url }`.
  - `suabe2_lastSelectedFavicon`: JSON object `{ id, title, url }`.
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
