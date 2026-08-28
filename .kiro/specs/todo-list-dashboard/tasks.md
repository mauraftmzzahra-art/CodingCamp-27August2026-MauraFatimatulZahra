# Implementation Plan: To-Do List Dashboard

## Overview

Build a fully client-side single-page dashboard using plain HTML, CSS, and Vanilla JavaScript. The output is exactly three files: `index.html`, `css/style.css`, and `js/app.js`. All state is persisted via Browser Local Storage. JavaScript is organised as an IIFE-based namespace (`App`) containing six sub-modules: `Storage`, `Theme`, `Greeting`, `Timer`, `TodoManager`, and `QuickLinks`.

---

## Tasks

- [x] 1. Project scaffolding and file structure
  - Create the directory structure: project root contains `index.html`, `css/` directory with `style.css`, and `js/` directory with `app.js`
  - Each file starts as a valid but empty skeleton (DOCTYPE + head/body for HTML; empty ruleset for CSS; IIFE wrapper with `const App = (() => { ... })();` for JS)
  - _Requirements: 1.1, 1.2, 1.5_

- [x] 2. HTML structure
  - [x] 2.1 Write the complete `index.html` skeleton with all sections
    - `<html lang="id" data-theme="light">`, correct `<meta charset>` and viewport tags
    - `<header id="app-header">` with `#theme-toggle` and `#theme-icon`
    - `<section id="greeting-section">` with `#greeting-text`, `#greeting-time`, `#greeting-date`
    - `<section id="timer-section">` with `#timer-display`, `#timer-notification` (`role="alert"`, `aria-live="assertive"`, `hidden`), `#timer-controls` (input + 4 buttons), `#timer-error` (`role="alert"`, `aria-live="polite"`, `hidden`)
    - `<section id="todo-section">` with `#todo-form` (`novalidate`), the three inputs with matching error `<span>` elements (`hidden`), submit button, `#todo-sort-btn`, and `<ul id="todo-list" aria-label="Daftar tugas">`
    - `<section id="quicklinks-section">` with `#link-form` (`novalidate`), two inputs with error spans, submit button, `#link-limit-error` (`role="alert"`, `hidden`), and `<div id="quicklinks-list" role="list">`
    - `#compat-warning` and `#storage-warning` divs (both `hidden`, correct ARIA roles)
    - `<script src="js/app.js">` at end of body; no inline event handlers anywhere
    - _Requirements: 1.1, 1.2, 1.4, 1.6, 3.1–3.2, 4.1–4.3, 5.1, 6.1_

- [x] 3. CSS foundation
  - [x] 3.1 Write CSS custom properties and base reset
    - `:root` / `[data-theme="light"]` block with all colour tokens: `--color-bg`, `--color-surface`, `--color-text`, `--color-text-muted`, `--color-primary`, `--color-primary-hover`, `--color-border`, `--color-error`, `--color-done-opacity`, `--transition-theme`
    - `[data-theme="dark"]` block overriding every colour token
    - Universal `*, *::before, *::after { transition: var(--transition-theme); }` rule (max 350 ms, satisfying ≤ 400 ms)
    - `box-sizing: border-box` reset, base `font-family`, `margin: 0`
    - _Requirements: 7.4, 7.5_

  - [x] 3.2 Write layout and responsive grid
    - `#dashboard` as CSS Grid with `grid-template-columns: 1fr` at base
    - `@media (min-width: 768px)` → 2-column grid
    - `@media (min-width: 1200px)` → 3-column grid
    - `max-width: 1200px; margin: 0 auto; padding: 1rem` on `#dashboard`
    - No horizontal scrollbar from 320 px to 2560 px
    - _Requirements: 8.3_

- [x] 4. CSS theming and component styles
  - [x] 4.1 Write header, theme toggle, and icon animation CSS
    - `#app-header` and `#theme-toggle` styles using CSS variables
    - `@keyframes icon-flip` animation (rotate + scale, ≤ 350 ms)
    - `#theme-icon.animating` applying the animation
    - _Requirements: 7.1, 7.4, 7.5_

  - [x] 4.2 Write greeting, timer, todo, and quick-links component styles
    - Greeting: large `#greeting-time` text, muted `#greeting-date`
    - Timer: prominent `#timer-display` font size; control row layout
    - Todo: `#todo-form` flex layout; `#todo-list li` card style; `.done` rule (strikethrough + `opacity: var(--color-done-opacity)`)
    - Quick Links: `#quicklinks-list` grid of buttons
    - Error / notification: `.field-error` inline error style; `[role="alert"]` banner style
    - _Requirements: 5.4, 5.8, 6.4_

- [x] 5. Storage module
  - [x] 5.1 Implement `Storage` module in `js/app.js`
    - `Storage.init()`: test read/write to detect availability; set `Storage.isAvailable`; if unavailable, make `#storage-warning` visible
    - `Storage.save(key, data)`: guard on `isAvailable`; `localStorage.setItem(key, JSON.stringify(data))`; synchronous (≤ 500 ms requirement met by sync API)
    - `Storage.load(key, defaultValue)`: guard on `isAvailable`; `JSON.parse`; on SyntaxError remove key and surface a per-module corrupt-data error; return `defaultValue` on any failure
    - Prefix all keys with `tld_` (`tld_tasks`, `tld_links`, `tld_theme`)
    - _Requirements: 2.1, 2.3, 2.4, 2.5, 2.6_

- [x] 6. Theme module
  - [x] 6.1 Implement `Theme` module in `js/app.js`
    - `Theme.init()`: call `Storage.load('tld_theme', null)`; if `'light'` or `'dark'` apply it; else check `window.matchMedia('(prefers-color-scheme: dark)')` and apply accordingly; fallback to `'light'`
    - `Theme.apply(theme)`: set `document.documentElement.setAttribute('data-theme', theme)`; update `#theme-icon` textContent (`☀️` / `🌙`); store `this.current`
    - `Theme.toggle()`: flip theme, call `apply()`, persist via `Storage.save`; add `.animating` class to `#theme-icon`, remove on `animationend`
    - Wire `#theme-toggle` `click` event in `Theme.init()`
    - `Theme.init()` must be called before any other module renders, preventing flash of incorrect theme
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7, 7.8, 7.9_

- [ ] 7. Greeting module
  - [-] 7.1 Implement `Greeting` module in `js/app.js`
    - `getGreeting(hour)`: five branches (5–11 → Pagi ☀️, 12–14 → Siang 🌤️, 15–17 → Sore 🌇, 18–20 → Malam 🌙, else → Malam 🌃)
    - `formatTime(date)`: zero-padded `HH:MM` via `padStart(2, '0')`
    - `formatDate(date)`: `date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })`
    - `Greeting.update()`: read `new Date()`, populate `#greeting-text`, `#greeting-time`, `#greeting-date`; on invalid Date show `--:--` and hide date/greeting
    - `Greeting.init()`: call `update()` once synchronously, then `setInterval(update, 60000)`
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

  - [ ]* 7.2 Write property test for Greeting — Property 5: exhaustive hour coverage
    - **Property 5: Greeting covers all 24 hours without gaps**
    - **Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7**
    - Use fast-check `fc.integer({ min: 0, max: 23 })` to confirm `getGreeting(hour)` returns a non-empty, non-null string for every valid hour

- [ ] 8. Timer module
  - [~] 8.1 Implement `Timer` state and display in `js/app.js`
    - Define in-memory state: `totalSeconds`, `remainingSeconds`, `isRunning`, `intervalId`, `lastSetSeconds` (default 1500)
    - `formatMMSS(totalSeconds)`: `Math.floor(s/60)` and `s % 60`, both zero-padded to 2 digits
    - `Timer.renderDisplay()`: write `formatMMSS(remainingSeconds)` to `#timer-display`
    - On `init()`, render default `25:00`
    - _Requirements: 4.1, 4.2, 4.10_

  - [ ]* 8.2 Write property test for Timer — Property 6: MM:SS format invariant
    - **Property 6: Timer MM:SS format invariant**
    - **Validates: Requirements 4.2, 4.10**
    - Use fast-check `fc.integer({ min: 0, max: 59940 })` to confirm `formatMMSS(n)` always matches `/^\d{2}:\d{2}$/` with correct minute and second parts

  - [~] 8.3 Implement Timer set, start, stop, reset, and completion logic
    - `Timer.setTimer(minutes)`: validate 1–999 (integer); on failure show `#timer-error`; on success compute seconds, store `lastSetSeconds`, update `remainingSeconds`, clear interval, call `renderDisplay()`
    - `Timer.start()`: guard `isRunning` and `remainingSeconds > 0` (show `#timer-error` if 0); set `isRunning = true`; `setInterval(tick, 1000)`
    - `Timer.tick()`: decrement `remainingSeconds`; call `renderDisplay()`; if reaches 0 call `onComplete()`
    - `Timer.stop()`: `clearInterval`, set `isRunning = false`
    - `Timer.reset()`: call `stop()`; restore `remainingSeconds = lastSetSeconds`; call `renderDisplay()`
    - `Timer.onComplete()`: call `stop()`, `renderDisplay()` (shows 00:00), `playAlertSound()`, show `#timer-notification`
    - `playAlertSound()`: Web Audio API sine oscillator at 880 Hz, 1.5 s, `exponentialRampToValueAtTime`; silent `catch` if unavailable
    - Wire all four buttons in `Timer.init()`
    - _Requirements: 4.3, 4.4, 4.5, 4.6, 4.7, 4.8, 4.9, 4.10, 4.11_

- [ ] 9. TodoManager module
  - [~] 9.1 Implement helper functions and data loading
    - `generateId()`: prefer `crypto.randomUUID()`; fallback to `'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2)`
    - `isValidTask(obj)`: type-check all six Task fields
    - Load `tld_tasks` via `Storage.load`; filter with `isValidTask`; store as `TodoManager.tasks`
    - _Requirements: 2.5, 5.11_

  - [~] 9.2 Implement `TodoManager.render()` using safe DOM construction
    - Clear `#todo-list`; for each task in `TodoManager.tasks` create `<li>` with `data-task-id`
    - Populate name, start time, end time via `textContent` only (no `innerHTML`)
    - Apply `done` class (strikethrough + 50 % opacity) when `task.done === true`
    - Add edit, done-toggle, and delete buttons with `data-action` attributes
    - _Requirements: 5.4, 5.8_

  - [ ]* 9.3 Write property test for TodoManager — Property 3: sort preserves all tasks
    - **Property 3: Sort by start time preserves all tasks**
    - **Validates: Requirements 5.10**
    - Use fast-check arrays of task-like objects to confirm `sortTasksByStartTime` output has same length, same IDs, and ascending `startTime` order with `createdAt` tie-breaking

  - [~] 9.4 Implement add-task form, validation, and sort
    - `validateTaskForm(name, start, end)`: show/hide `#todo-name-error`, `#todo-start-error`, `#todo-end-error`; return `false` if any field empty
    - On `#todo-form` submit: validate; create Task object (all six fields); push to `tasks`; call `Storage.save('tld_tasks', tasks)`; call `render()`; reset form
    - `sortTasksByStartTime(tasks)`: stable sort using `startTime` string comparison, `createdAt` as tie-break (see design §Key Algorithms)
    - `#todo-sort-btn` click: `tasks = sortTasksByStartTime(tasks)`; `Storage.save`; `render()`
    - _Requirements: 5.2, 5.3, 5.10_

  - [ ]* 9.5 Write property test for TodoManager — Property 1: task addition persists to storage
    - **Property 1: Task addition persists to storage**
    - **Validates: Requirements 2.4, 5.2**
    - Generate random valid tasks; call add logic; parse `localStorage.getItem('tld_tasks')`; assert the array contains an item with matching `name`, `startTime`, `endTime`

  - [~] 9.6 Implement edit, delete, and done-toggle via event delegation
    - Attach single `click` listener on `#todo-list` using `e.target.closest('[data-task-id]')` and `e.target.matches('[data-action="..."]')`
    - `deleteTask(id)`: filter `tasks`; `Storage.save`; `render()`
    - `toggleDone(id)`: flip `task.done`; `Storage.save`; `render()`
    - `startEdit(id)`: populate form fields with existing task values; switch submit handler to update mode (or use an in-progress edit flag); on save validate, update task, persist, render
    - _Requirements: 5.5, 5.6, 5.7, 5.8, 5.9_

  - [ ]* 9.7 Write property test for TodoManager — Property 10: done/undone status persists round-trip
    - **Property 10: Task done/undone status persists round-trip**
    - **Validates: Requirements 5.8, 2.4**
    - For any task: toggle done → serialize → deserialize → assert `done === true`; toggle again → serialize → deserialize → assert `done === false`

- [ ] 10. QuickLinks module
  - [~] 10.1 Implement URL validation and data loading
    - `isValidUrl(str)`: use `new URL(str)` inside try/catch; return `true` only when `url.protocol` is `'http:'` or `'https:'` and `url.host.length > 0`
    - Load `tld_links` via `Storage.load`; filter valid Link objects; store as `QuickLinks.links`
    - _Requirements: 6.2, 6.3, 6.6_

  - [ ]* 10.2 Write property test for QuickLinks — Property 7: URL validation
    - **Property 7: URL validation accepts valid and rejects invalid URLs**
    - **Validates: Requirements 6.2, 6.3**
    - Use fast-check to generate valid `http://`/`https://` URLs and assert `isValidUrl` returns `true`; generate strings without valid scheme/host and assert `false`

  - [~] 10.3 Implement `QuickLinks.render()` using safe DOM construction
    - Clear `#quicklinks-list`; for each link create a `div[role="listitem"]` containing a `<button>` (opens URL in new tab via `window.open`) and a delete button; all text via `textContent`
    - _Requirements: 6.4, 6.6_

  - [~] 10.4 Implement add-link form, validation, and limit enforcement
    - `validateLinkForm(label, url)`: show/hide `#link-label-error`, `#link-url-error`; enforce max-length 100 and 2048; validate URL with `isValidUrl`; return `false` on any failure
    - On `#link-form` submit: check `links.length >= 50` → show `#link-limit-error` and abort; validate; create Link object; push; `Storage.save('tld_links', links)`; `render()`; reset form
    - _Requirements: 6.1, 6.2, 6.3, 6.7_

  - [ ]* 10.5 Write property test for QuickLinks — Property 8: add link round-trip
    - **Property 8: Quick Links addition round-trip**
    - **Validates: Requirements 6.2, 2.4**
    - Generate valid links for lists with length < 50; add link; parse `tld_links` from localStorage; assert last element matches `label` and `url`

  - [~] 10.6 Implement delete via event delegation
    - Attach single `click` listener on `#quicklinks-list`; detect delete action; remove from `links`; `Storage.save`; `render()`; complete within 500 ms (sync, satisfies requirement)
    - _Requirements: 6.5_

- [ ] 11. App bootstrap and browser compatibility check
  - [~] 11.1 Implement `checkBrowserSupport()` and `App.init()`
    - `checkBrowserSupport()`: test `typeof localStorage`, `typeof JSON`, `typeof Date`, `Array.prototype.sort`; if any fail, show `#compat-warning`, hide `#dashboard`, return `false`
    - `App.init()`: call `checkBrowserSupport()`; then in order: `Storage.init()`, `Theme.init()`, `Greeting.init()`, `Timer.init()`, `TodoManager.init()`, `QuickLinks.init()`
    - Register `document.addEventListener('DOMContentLoaded', App.init)`
    - Expose `{ Storage, Greeting, Timer, TodoManager, QuickLinks, Theme }` as the IIFE return value
    - _Requirements: 1.3, 1.5, 1.6, 2.2, 8.1_

- [~] 12. Checkpoint — end-to-end integration pass
  - Open `index.html` via `file://` in Chrome, Firefox, Edge, and Safari
  - Verify: greeting updates after clock change; timer counts down and plays alert at 00:00; tasks add/edit/delete/sort/persist across reload; quick links open in new tab, persist, delete; theme toggles with animation and persists across reload; all validation errors appear and clear correctly; no `innerHTML` usage for user-supplied content; no network requests; no horizontal scroll from 320 px to 2560 px
  - Ensure all tests pass, ask the user if questions arise.
  - _Requirements: 1.3, 1.4, 1.5, 2.2, 2.6, 8.1, 8.2, 8.3_

---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Property tests require **fast-check** (load via CDN in a separate `tests/index.html` or via npm + Vitest/Jest for Node.js; test files are not part of the production distribution)
- All user-supplied content must be inserted via `textContent`, never `innerHTML`, to prevent XSS (design §Event Handling Patterns)
- `Theme.init()` must execute before any other module to avoid flash of incorrect theme (Requirement 7.7)
- The IIFE/namespace pattern is required because `file://` protocol blocks ES Module imports (design §Architecture)
- `tld_` key prefix prevents Local Storage collisions with other apps on the same origin (design §Data Models)
- Each task references the specific requirement clause numbers it satisfies for full traceability

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1"] },
    { "id": 1, "tasks": ["2.1"] },
    { "id": 2, "tasks": ["3.1", "3.2"] },
    { "id": 3, "tasks": ["4.1", "4.2"] },
    { "id": 4, "tasks": ["5.1"] },
    { "id": 5, "tasks": ["6.1"] },
    { "id": 6, "tasks": ["7.1"] },
    { "id": 7, "tasks": ["7.2", "8.1"] },
    { "id": 8, "tasks": ["8.2", "8.3"] },
    { "id": 9, "tasks": ["9.1"] },
    { "id": 10, "tasks": ["9.2"] },
    { "id": 11, "tasks": ["9.3", "9.4"] },
    { "id": 12, "tasks": ["9.5", "9.6"] },
    { "id": 13, "tasks": ["9.7", "10.1"] },
    { "id": 14, "tasks": ["10.2", "10.3"] },
    { "id": 15, "tasks": ["10.4"] },
    { "id": 16, "tasks": ["10.5", "10.6"] },
    { "id": 17, "tasks": ["11.1"] }
  ]
}
```
