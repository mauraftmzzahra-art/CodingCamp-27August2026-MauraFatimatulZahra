# Design Document: To-Do List Dashboard

## Overview

To-Do List Dashboard adalah aplikasi web single-page yang berjalan sepenuhnya di sisi klien (client-side). Tidak ada server, tidak ada build tool, tidak ada dependency eksternal — hanya tiga file: `index.html`, `css/style.css`, dan `js/app.js`. Semua state disimpan di Browser Local Storage dan semua logika dieksekusi di browser.

Pendekatan arsitektur yang diambil adalah **module pattern berbasis namespace** di dalam satu file JavaScript. Setiap fitur dienkapsulasi dalam sebuah object literal (modul) dengan metode `init()`, sehingga tidak perlu ES Modules (yang membutuhkan server untuk CORS) dan tetap kompatibel dengan `file://` protocol.

Karena harus berjalan via `file://` tanpa bundler, seluruh kode JavaScript ditulis dalam satu file `js/app.js` yang mengekspos satu namespace global `App` untuk menghindari pencemaran global scope.

---

## Architecture

### High-Level Architecture

```
index.html
  └── <link> css/style.css
  └── <script> js/app.js
        └── App (global namespace)
              ├── Storage      — abstraksi Local Storage
              ├── Greeting     — jam, tanggal, sapaan
              ├── Timer        — Pomodoro countdown
              ├── TodoManager  — manajemen tugas
              ├── QuickLinks   — tautan favorit
              ├── Theme        — light/dark mode
              └── init()       — bootstrap semua modul
```

### Data Flow

```
User Interaction
      │
      ▼
DOM Event Handler (di setiap modul)
      │
      ├─── State Update (in-memory object)
      │
      ├─── Storage.save(key, data)  ──► Local Storage
      │
      └─── render() / DOM mutation  ──► Visible UI
```

State tidak disimpan di DOM — setiap modul menyimpan state-nya di variabel JavaScript. DOM hanya merupakan proyeksi dari state saat ini. Setiap perubahan state selalu diikuti dengan `render()` dan `Storage.save()`.

### Kompatibilitas `file://` Protocol

- Tidak menggunakan ES Modules (`import`/`export`) karena browser memblokir fetch lintas-origin di `file://`
- Tidak ada `fetch()` atau `XMLHttpRequest` ke endpoint eksternal
- Audio alert menggunakan Web Audio API (bukan file `.mp3` eksternal) agar tidak ada permintaan jaringan
- Semua resource (CSS, JS) direferensikan dengan path relatif

---

## Components and Interfaces

### File & Folder Structure

```
project-root/
├── index.html
├── css/
│   └── style.css
└── js/
    └── app.js
```

### HTML Structure (`index.html`)

```html
<!DOCTYPE html>
<html lang="id" data-theme="light">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>To-Do List Dashboard</title>
  <link rel="stylesheet" href="css/style.css" />
</head>
<body>
  <!-- Theme Toggle -->
  <header id="app-header">
    <button id="theme-toggle" aria-label="Toggle theme">
      <span id="theme-icon">☀️</span>
    </button>
  </header>

  <main id="dashboard">

    <!-- Greeting Module -->
    <section id="greeting-section" aria-label="Greeting">
      <div id="greeting-text"><!-- e.g. "Selamat Pagi ☀️" --></div>
      <div id="greeting-time"><!-- e.g. "07:30" --></div>
      <div id="greeting-date"><!-- e.g. "Rabu, 27 Agustus 2026" --></div>
    </section>

    <!-- Focus Timer -->
    <section id="timer-section" aria-label="Focus Timer">
      <div id="timer-display">25:00</div>
      <div id="timer-notification" role="alert" aria-live="assertive" hidden></div>
      <div id="timer-controls">
        <input id="timer-input" type="number" min="1" max="999" value="25" />
        <button id="timer-set-btn">Set Timer</button>
        <button id="timer-start-btn">Start</button>
        <button id="timer-stop-btn">Stop</button>
        <button id="timer-reset-btn">Reset</button>
      </div>
      <div id="timer-error" role="alert" aria-live="polite" hidden></div>
    </section>

    <!-- To-Do List -->
    <section id="todo-section" aria-label="To-Do List">
      <form id="todo-form" novalidate>
        <input id="todo-name" type="text" maxlength="100" placeholder="Nama tugas" />
        <span id="todo-name-error" class="field-error" hidden></span>
        <input id="todo-start" type="time" />
        <span id="todo-start-error" class="field-error" hidden></span>
        <input id="todo-end" type="time" />
        <span id="todo-end-error" class="field-error" hidden></span>
        <button type="submit">Tambah Tugas</button>
      </form>
      <button id="todo-sort-btn">Urutkan</button>
      <ul id="todo-list" aria-label="Daftar tugas"></ul>
    </section>

    <!-- Quick Links -->
    <section id="quicklinks-section" aria-label="Quick Links">
      <form id="link-form" novalidate>
        <input id="link-label" type="text" maxlength="100" placeholder="Label" />
        <span id="link-label-error" class="field-error" hidden></span>
        <input id="link-url" type="text" maxlength="2048" placeholder="https://..." />
        <span id="link-url-error" class="field-error" hidden></span>
        <button type="submit">Tambah Tautan</button>
      </form>
      <div id="link-limit-error" role="alert" hidden></div>
      <div id="quicklinks-list" role="list" aria-label="Daftar tautan cepat"></div>
    </section>

  </main>

  <!-- Browser Compatibility Warning (hidden by default, shown via JS if needed) -->
  <div id="compat-warning" role="alert" hidden>
    Browser Anda tidak mendukung fitur yang dibutuhkan oleh aplikasi ini.
  </div>

  <!-- Storage Unavailable Warning -->
  <div id="storage-warning" role="alert" aria-live="polite" hidden>
    Penyimpanan data tidak tersedia. Data tidak akan disimpan secara permanen.
  </div>

  <script src="js/app.js"></script>
</body>
</html>
```

### CSS Organization (`css/style.css`)

CSS diorganisasikan dalam urutan berikut:

1. **Custom Properties (CSS Variables)** — semua nilai tema (warna, transisi) didefinisikan di `:root` dan `[data-theme="dark"]`
2. **Reset & Base** — `box-sizing`, `margin`, `font-family`
3. **Layout** — `#dashboard` grid/flex layout
4. **Header** — `#app-header`, `#theme-toggle`
5. **Greeting Section** — tipografi salam
6. **Timer Section** — display jam besar, kontrol
7. **Todo Section** — form, daftar tugas, item selesai
8. **Quick Links Section** — form, grid tombol tautan
9. **Error & Notification Styles** — `.field-error`, `[role="alert"]`
10. **Animations** — `@keyframes` untuk ikon tema, notifikasi
11. **Responsive Breakpoints** — `@media` untuk 320px–2560px

### JavaScript Module Structure (`js/app.js`)

```javascript
const App = (() => {

  // --- Storage Module ---
  const Storage = { ... };

  // --- Greeting Module ---
  const Greeting = { ... };

  // --- Timer Module ---
  const Timer = { ... };

  // --- TodoManager Module ---
  const TodoManager = { ... };

  // --- QuickLinks Module ---
  const QuickLinks = { ... };

  // --- Theme Module ---
  const Theme = { ... };

  // --- Bootstrap ---
  function init() {
    if (!checkBrowserSupport()) return;
    Storage.init();
    Theme.init();
    Greeting.init();
    Timer.init();
    TodoManager.init();
    QuickLinks.init();
  }

  document.addEventListener('DOMContentLoaded', init);

  return { Storage, Greeting, Timer, TodoManager, QuickLinks, Theme };

})();
```

Setiap modul mengekspos minimal:
- `init()` — inisialisasi state, pasang event listener, render awal
- `render()` — re-render DOM dari state in-memory (pure DOM mutation, tanpa innerHTML yang rentan XSS)

---

## Data Models

### Local Storage Keys

| Key | Tipe Nilai | Modul Pemilik |
|---|---|---|
| `tld_tasks` | `Task[]` (JSON array) | TodoManager |
| `tld_links` | `Link[]` (JSON array) | QuickLinks |
| `tld_theme` | `"light"` \| `"dark"` (JSON string) | Theme |

Prefix `tld_` (todo-list-dashboard) digunakan untuk menghindari konflik dengan aplikasi lain di domain/origin yang sama.

### Task Schema

```typescript
interface Task {
  id: string;          // UUID v4 — unik, tidak berubah (crypto.randomUUID() atau fallback)
  name: string;        // Nama tugas, max 100 karakter
  startTime: string;   // Format "HH:MM" (nilai dari <input type="time">)
  endTime: string;     // Format "HH:MM" (nilai dari <input type="time">)
  done: boolean;       // true jika sudah diselesaikan
  createdAt: number;   // timestamp Unix (Date.now()) — digunakan untuk tie-breaking saat sort
}
```

Contoh nilai tersimpan di Local Storage (`tld_tasks`):

```json
[
  {
    "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "name": "Review PR backend",
    "startTime": "09:00",
    "endTime": "10:00",
    "done": false,
    "createdAt": 1724720400000
  }
]
```

### Link Schema

```typescript
interface Link {
  id: string;      // UUID v4
  label: string;   // Teks tombol, max 100 karakter
  url: string;     // URL lengkap, max 2048 karakter
}
```

Contoh nilai tersimpan di Local Storage (`tld_links`):

```json
[
  {
    "id": "f1e2d3c4-b5a6-7890-fedc-ba9876543210",
    "label": "GitHub",
    "url": "https://github.com"
  }
]
```

### Theme Schema

Nilai tersimpan di Local Storage (`tld_theme`) berupa string JSON:

```json
"dark"
```

### Storage Module Interface

```javascript
const Storage = {
  isAvailable: false,

  init() {
    // Cek ketersediaan Local Storage dengan test read/write
    try {
      localStorage.setItem('__tld_test__', '1');
      localStorage.removeItem('__tld_test__');
      this.isAvailable = true;
    } catch (e) {
      this.isAvailable = false;
      showStorageWarning();
    }
  },

  save(key, data) {
    if (!this.isAvailable) return;
    // Serialisasi ke JSON dan simpan dalam 500ms (synchronous)
    localStorage.setItem(key, JSON.stringify(data));
  },

  load(key, defaultValue) {
    if (!this.isAvailable) return defaultValue;
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (e) {
      // Data korup — reset ke default dan tampilkan error
      localStorage.removeItem(key);
      showCorruptDataError(key);
      return defaultValue;
    }
  }
};
```

---

## Key Algorithms

### 1. Greeting Logic

```javascript
function getGreeting(hour) {
  // hour: 0–23 integer
  if (hour >= 5  && hour <= 11) return 'Selamat Pagi ☀️';
  if (hour >= 12 && hour <= 14) return 'Selamat Siang 🌤️';
  if (hour >= 15 && hour <= 17) return 'Selamat Sore 🌇';
  if (hour >= 18 && hour <= 20) return 'Selamat Malam 🌙';
  // hour 21–23 dan 0–4
  return 'Selamat Malam 🌃';
}

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, '0');
  const m = String(date.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

function formatDate(date) {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  // Output: "Rabu, 27 Agustus 2026"
}
```

Update loop menggunakan `setInterval` setiap 60.000ms. Saat `init()`, fungsi update dipanggil sekali secara sinkron sebelum interval dimulai.

### 2. Timer Countdown Algorithm

State timer disimpan in-memory:

```javascript
const Timer = {
  state: {
    totalSeconds: 1500, // default 25 menit × 60
    remainingSeconds: 1500,
    isRunning: false,
    intervalId: null,
    lastSetSeconds: 1500, // untuk Reset
  },

  tick() {
    if (this.state.remainingSeconds <= 0) {
      this.onComplete();
      return;
    }
    this.state.remainingSeconds--;
    this.renderDisplay();
  },

  start() {
    if (this.state.isRunning) return;
    if (this.state.remainingSeconds <= 0) {
      showTimerError('Reset timer terlebih dahulu sebelum memulai.');
      return;
    }
    this.state.isRunning = true;
    this.state.intervalId = setInterval(() => this.tick(), 1000);
  },

  stop() {
    clearInterval(this.state.intervalId);
    this.state.isRunning = false;
  },

  reset() {
    this.stop();
    this.state.remainingSeconds = this.state.lastSetSeconds;
    this.renderDisplay();
  },

  setTimer(minutes) {
    const mins = parseInt(minutes, 10);
    if (isNaN(mins) || mins < 1 || mins > 999) {
      showTimerError('Masukkan angka antara 1 sampai 999.');
      return;
    }
    const secs = mins * 60;
    this.state.lastSetSeconds = secs;
    this.state.remainingSeconds = secs;
    this.state.isRunning = false;
    clearInterval(this.state.intervalId);
    this.renderDisplay();
  },

  formatMMSS(totalSeconds) {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  },

  onComplete() {
    this.stop();
    this.renderDisplay(); // tampilkan 00:00
    playAlertSound();
    showTimerNotification('Waktu habis! Ambil istirahat sejenak.');
  }
};
```

### 3. Audible Alert (Web Audio API)

Menggunakan Web Audio API agar tidak bergantung pada file audio eksternal:

```javascript
function playAlertSound() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, ctx.currentTime); // A5
    gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + 1.5);
  } catch (e) {
    // Web Audio API tidak tersedia — notifikasi visual sudah cukup
  }
}
```

### 4. Task Sort by Start Time

Sort stabil berdasarkan `startTime` (string "HH:MM"), dengan tie-breaking menggunakan `createdAt`:

```javascript
function sortTasksByStartTime(tasks) {
  // Salin array agar tidak mutasi original
  return [...tasks].sort((a, b) => {
    if (a.startTime < b.startTime) return -1;
    if (a.startTime > b.startTime) return 1;
    // Tie-break: insertion order (createdAt ascending)
    return a.createdAt - b.createdAt;
  });
}
```

Karena `startTime` berformat `"HH:MM"` dengan zero-padding, perbandingan string lexicographic identik dengan perbandingan waktu numerik.

### 5. UUID Generator

`crypto.randomUUID()` tersedia di browser modern. Untuk fallback:

```javascript
function generateId() {
  if (crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback sederhana — masih cukup unik untuk penggunaan lokal
  return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
}
```

### 6. URL Validation

```javascript
function isValidUrl(str) {
  // Requirement: scheme://host format, scheme harus http atau https
  try {
    const url = new URL(str);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.host.length > 0;
  } catch {
    return false;
  }
}
```

### 7. Theme Toggle & OS Preference

```javascript
const Theme = {
  current: 'light',

  init() {
    const saved = Storage.load('tld_theme', null);
    if (saved === 'light' || saved === 'dark') {
      this.apply(saved);
    } else {
      // Cek OS-level preference
      const prefersDark = window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.apply(prefersDark ? 'dark' : 'light');
    }
  },

  toggle() {
    this.apply(this.current === 'light' ? 'dark' : 'light');
    Storage.save('tld_theme', this.current);
  },

  apply(theme) {
    this.current = theme;
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('theme-icon').textContent =
      theme === 'light' ? '☀️' : '🌙';
  }
};
```

Penerapan tema dilakukan di `<html data-theme="...">` **sebelum** elemen body dirender, sehingga tidak ada flash of incorrect theme (FOIT).

---

## CSS Theming Strategy

### CSS Custom Properties

Semua nilai warna dan transisi didefinisikan sebagai variabel CSS pada selector `[data-theme]`:

```css
:root,
[data-theme="light"] {
  --color-bg: #fefce8;
  --color-surface: #ffffff;
  --color-text: #1c1917;
  --color-text-muted: #78716c;
  --color-primary: #f59e0b;
  --color-primary-hover: #d97706;
  --color-border: #e7e5e4;
  --color-error: #dc2626;
  --color-done-opacity: 0.5;
  --transition-theme: background-color 0.35s ease, color 0.35s ease, border-color 0.35s ease;
}

[data-theme="dark"] {
  --color-bg: #0f172a;
  --color-surface: #1e293b;
  --color-text: #f1f5f9;
  --color-text-muted: #94a3b8;
  --color-primary: #f59e0b;
  --color-primary-hover: #fbbf24;
  --color-border: #334155;
  --color-error: #f87171;
}
```

Semua komponen menggunakan variabel ini, bukan nilai warna hardcoded. Transisi tema diterapkan via:

```css
*, *::before, *::after {
  transition: var(--transition-theme);
}
```

Durasi transisi 350ms masih di bawah batas 400ms sesuai requirement 7.4 dan 7.5.

### Icon Transition Animation

```css
@keyframes icon-flip {
  0%   { transform: rotate(0deg) scale(1); }
  50%  { transform: rotate(180deg) scale(0.5); }
  100% { transform: rotate(360deg) scale(1); }
}

#theme-icon.animating {
  animation: icon-flip 0.35s ease-in-out;
}
```

Class `animating` ditambahkan via JS saat toggle, lalu dihapus setelah animasi selesai via `animationend` event.

### Responsive Layout

```css
#dashboard {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  padding: 1rem;
  max-width: 1200px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  #dashboard {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1200px) {
  #dashboard {
    grid-template-columns: 1fr 1fr 1fr;
  }
}
```

---

## Event Handling Patterns

Semua event listener dipasang di `init()` setiap modul menggunakan `addEventListener`. Tidak ada inline event handler di HTML (`onclick="..."`) untuk menjaga separasi antara HTML dan JS.

### Delegasi Event untuk Daftar Dinamis

Karena item tugas dan tautan dibuat secara dinamis, event listener dipasang pada **container parent** (bukan item individual) menggunakan event delegation:

```javascript
document.getElementById('todo-list').addEventListener('click', (e) => {
  const item = e.target.closest('[data-task-id]');
  if (!item) return;
  const taskId = item.dataset.taskId;

  if (e.target.matches('[data-action="delete"]')) {
    TodoManager.deleteTask(taskId);
  } else if (e.target.matches('[data-action="done"]')) {
    TodoManager.toggleDone(taskId);
  } else if (e.target.matches('[data-action="edit"]')) {
    TodoManager.startEdit(taskId);
  }
});
```

Pola yang sama diterapkan pada `#quicklinks-list`.

### Pencegahan XSS

Semua konten dinamis (nama tugas, label tautan) dimasukkan ke DOM via `textContent`, bukan `innerHTML`, untuk mencegah XSS injection:

```javascript
// BENAR — aman dari XSS
taskNameEl.textContent = task.name;

// SALAH — rentan XSS
taskNameEl.innerHTML = task.name;
```

---

## Error Handling

### Hierarki Error

| Kondisi | Respon |
|---|---|
| Local Storage tidak tersedia | Tampilkan `#storage-warning`, jalankan dengan data in-memory |
| Data Local Storage korup (JSON invalid / schema mismatch) | Reset key ke default, tampilkan pesan error inline per-modul |
| Input validasi gagal (form kosong, nilai di luar range) | Tampilkan pesan error di elemen `<span class="field-error">` yang berdekatan dengan field |
| Timer distart saat waktu 00:00 | Tampilkan `#timer-error`, tidak mulai countdown |
| Quick Links mencapai batas 50 | Tampilkan `#link-limit-error`, tidak tambah link baru |
| Browser tidak mendukung API yang dibutuhkan | Tampilkan `#compat-warning`, hentikan init() |
| Web Audio API tidak tersedia | Silent catch, lanjutkan tanpa suara |
| `crypto.randomUUID()` tidak tersedia | Gunakan fallback ID generator |

### Browser Compatibility Check

```javascript
function checkBrowserSupport() {
  const required = [
    typeof localStorage !== 'undefined',
    typeof JSON !== 'undefined',
    typeof Date !== 'undefined',
    typeof Array.prototype.sort !== 'undefined',
  ];
  const supported = required.every(Boolean);
  if (!supported) {
    document.getElementById('compat-warning').hidden = false;
    document.getElementById('dashboard').hidden = true;
  }
  return supported;
}
```

### Schema Validation saat Load

Setelah `Storage.load()`, setiap modul memvalidasi struktur data yang dimuat:

```javascript
function isValidTask(obj) {
  return obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.startTime === 'string' &&
    typeof obj.endTime === 'string' &&
    typeof obj.done === 'boolean' &&
    typeof obj.createdAt === 'number';
}

// Saat load tasks:
const raw = Storage.load('tld_tasks', []);
const tasks = Array.isArray(raw) ? raw.filter(isValidTask) : [];
// Item yang tidak valid dibuang secara diam-diam, sisanya tetap dimuat
```

---

## Testing Strategy

### Dual Testing Approach

Strategi pengujian menggunakan dua pendekatan yang saling melengkapi:

- **Unit tests (example-based)**: memverifikasi perilaku spesifik dengan input konkret — ideal untuk edge case, error path, dan interaksi UI yang tidak bergantung pada variasi input luas.
- **Property-based tests (PBT)**: memverifikasi properti universal yang harus berlaku untuk semua input valid — ideal untuk fungsi murni seperti format waktu, validasi, serialisasi, dan logika bisnis.

### Unit Test Targets

Karena aplikasi ini berjalan di browser tanpa build tool, unit test dapat dijalankan menggunakan **QUnit** atau **Jasmine** yang dimuat via CDN di file HTML terpisah `tests/index.html` (tidak termasuk dalam distribusi produksi). Alternatifnya, logika murni (pure functions) dapat diekstrak dan diuji di Node.js environment dengan **Vitest** atau **Jest** tanpa DOM.

**Target utama unit test:**
- `getGreeting(hour)` — semua 5 cabang kondisi (pagi, siang, sore, malam awal, malam akhir)
- `formatTime(date)` — zero-padding jam dan menit
- `formatDate(date)` — format locale Indonesia
- `formatMMSS(seconds)` — konversi detik ke MM:SS
- `isValidUrl(str)` — berbagai kasus URL valid/invalid
- `Storage.load()` dengan data korup
- Timer state transitions (start → stop → reset)

### Property-Based Test Library

Menggunakan **[fast-check](https://github.com/dubzzz/fast-check)** (dapat dimuat via CDN untuk browser atau via npm untuk Node.js test environment).

Minimum 100 iterasi per property test.

Setiap property test diberi tag komentar:
```javascript
// Feature: todo-list-dashboard, Property N: <teks properti>
```

---

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system — essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Task addition persists to storage

*For any* task list state and any valid task (non-empty name, valid HH:MM start time, valid HH:MM end time), after adding the task the data serialized to Local Storage must be parseable JSON whose resulting array contains an object with the same `name`, `startTime`, and `endTime` as the added task.

**Validates: Requirements 2.4, 5.2**

---

### Property 2: Whitespace-only task names are rejected

*For any* string composed entirely of whitespace characters (spaces, tabs, newlines), submitting it as a task name must be rejected, the task list must remain unchanged, and a validation error must be indicated.

**Validates: Requirements 5.3**

---

### Property 3: Sort by start time preserves all tasks

*For any* non-empty array of tasks, sorting by start time must produce an array that: (a) has the same length as the original, (b) contains every task from the original (same IDs), and (c) is ordered such that `tasks[i].startTime <= tasks[i+1].startTime` for all adjacent pairs, with ties broken by `createdAt` ascending.

**Validates: Requirements 5.10**

---

### Property 4: Storage serialization round-trip

*For any* valid array of Task objects, serializing to JSON via `JSON.stringify` and then deserializing via `JSON.parse` must produce an array where each element is structurally equivalent (same `id`, `name`, `startTime`, `endTime`, `done`, `createdAt`) to the original.

**Validates: Requirements 2.4, 2.5**

---

### Property 5: Greeting covers all 24 hours without gaps

*For any* integer hour value in the range [0, 23], `getGreeting(hour)` must return a non-empty string, and the mapping must be exhaustive — every valid hour produces exactly one greeting with no undefined or null result.

**Validates: Requirements 3.3, 3.4, 3.5, 3.6, 3.7**

---

### Property 6: Timer MM:SS format invariant

*For any* non-negative integer `seconds` in the range [0, 59940] (i.e., 0 to 999 minutes × 60), `formatMMSS(seconds)` must return a string matching the pattern `^\d{2}:\d{2}$` where the minute part equals `Math.floor(seconds / 60)` and the second part equals `seconds % 60`, both zero-padded to two digits.

**Validates: Requirements 4.2, 4.10**

---

### Property 7: URL validation accepts valid and rejects invalid URLs

*For any* string that contains a valid `http://` or `https://` scheme followed by a non-empty host, `isValidUrl` must return `true`. *For any* string that lacks an `http`/`https` scheme or has an empty host, `isValidUrl` must return `false`.

**Validates: Requirements 6.2, 6.3**

---

### Property 8: Quick Links addition round-trip

*For any* valid link (non-empty label ≤ 100 chars, valid URL), adding it to an existing list of fewer than 50 links must result in Local Storage containing a JSON array where the last element has the same `label` and `url` as the added link.

**Validates: Requirements 6.2, 2.4**

---

### Property 9: Theme toggle is an involution

*For any* current theme value (`"light"` or `"dark"`), toggling the theme twice must return the application to its original theme — i.e., `toggle(toggle(theme)) === theme`.

**Validates: Requirements 7.2, 7.3**

---

### Property 10: Task done/undone status persists round-trip

*For any* task, marking it as done then serializing and deserializing from storage must yield a task with `done === true`; and if subsequently marked as not done, the round-trip must yield `done === false`.

**Validates: Requirements 5.8, 2.4**

