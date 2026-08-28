const App = (() => {

  /* ========================================================================
     Storage Module
     ======================================================================== */
  const Storage = {
    isAvailable: false,

    init() {
      try {
        localStorage.setItem('__tld_test__', '1');
        localStorage.removeItem('__tld_test__');
        this.isAvailable = true;
      } catch (e) {
        this.isAvailable = false;
        const warn = document.getElementById('storage-warning');
        if (warn) warn.hidden = false;
      }
    },

    save(key, data) {
      if (!this.isAvailable) return;
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch (e) {
        // Fail silently for this session; data stays in-memory.
      }
    },

    load(key, defaultValue) {
      if (!this.isAvailable) return defaultValue;
      try {
        const raw = localStorage.getItem(key);
        if (raw === null) return defaultValue;
        return JSON.parse(raw);
      } catch (e) {
        localStorage.removeItem(key);
        this.showCorruptDataWarning(key);
        return defaultValue;
      }
    },

    showCorruptDataWarning(key) {
      const warn = document.getElementById('storage-warning');
      if (warn) {
        warn.hidden = false;
        warn.textContent = `Sebagian data tersimpan (${key}) tidak dapat dibaca dan telah direset.`;
      }
    }
  };

  /* ========================================================================
     Greeting Module
     ======================================================================== */
  const Greeting = {
    intervalId: null,

    init() {
      this.update();
      this.intervalId = setInterval(() => this.update(), 60000);
    },

    getGreeting(hour) {
      if (hour >= 5 && hour <= 11) return 'Selamat Pagi ☀️';
      if (hour >= 12 && hour <= 14) return 'Selamat Siang 🌤️';
      if (hour >= 15 && hour <= 17) return 'Selamat Sore 🌇';
      if (hour >= 18 && hour <= 20) return 'Selamat Malam 🌙';
      return 'Selamat Malam 🌃';
    },

    formatTime(date) {
      const h = String(date.getHours()).padStart(2, '0');
      const m = String(date.getMinutes()).padStart(2, '0');
      return `${h}:${m}`;
    },

    formatDate(date) {
      return date.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    },

    update() {
      const textEl = document.getElementById('greeting-text');
      const timeEl = document.getElementById('greeting-time');
      const dateEl = document.getElementById('greeting-date');

      let now;
      try {
        now = new Date();
        if (isNaN(now.getTime())) throw new Error('invalid date');
      } catch (e) {
        timeEl.textContent = '--:--';
        textEl.textContent = '';
        dateEl.textContent = '';
        return;
      }

      textEl.textContent = this.getGreeting(now.getHours());
      timeEl.textContent = this.formatTime(now);
      dateEl.textContent = this.formatDate(now);
    }
  };

  /* ========================================================================
     Timer Module
     ======================================================================== */
  const Timer = {
    state: {
      remainingSeconds: 1500,
      isRunning: false,
      intervalId: null,
      lastSetSeconds: 1500
    },

    els: {},

    init() {
      this.els = {
        display: document.getElementById('timer-display'),
        input: document.getElementById('timer-input'),
        setBtn: document.getElementById('timer-set-btn'),
        startBtn: document.getElementById('timer-start-btn'),
        stopBtn: document.getElementById('timer-stop-btn'),
        resetBtn: document.getElementById('timer-reset-btn'),
        error: document.getElementById('timer-error'),
        notification: document.getElementById('timer-notification')
      };

      this.els.setBtn.addEventListener('click', () => this.setTimer(this.els.input.value));
      this.els.startBtn.addEventListener('click', () => this.start());
      this.els.stopBtn.addEventListener('click', () => this.stop());
      this.els.resetBtn.addEventListener('click', () => this.reset());

      this.renderDisplay();
    },

    formatMMSS(totalSeconds) {
      const m = Math.floor(totalSeconds / 60);
      const s = totalSeconds % 60;
      return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    },

    renderDisplay() {
      this.els.display.textContent = this.formatMMSS(this.state.remainingSeconds);
    },

    clearError() {
      this.els.error.hidden = true;
      this.els.error.textContent = '';
    },

    showError(msg) {
      this.els.error.hidden = false;
      this.els.error.textContent = msg;
    },

    setTimer(minutesInput) {
      this.clearError();
      const mins = parseInt(minutesInput, 10);
      const isWholeNumber = /^\d+$/.test(String(minutesInput).trim());
      if (!isWholeNumber || isNaN(mins) || mins < 1 || mins > 999) {
        this.showError('Masukkan angka bulat antara 1 sampai 999.');
        return;
      }
      const secs = mins * 60;
      this.state.lastSetSeconds = secs;
      this.state.remainingSeconds = secs;
      this.state.isRunning = false;
      clearInterval(this.state.intervalId);
      this.renderDisplay();
    },

    start() {
      this.clearError();
      if (this.state.isRunning) return;
      if (this.state.remainingSeconds <= 0) {
        this.showError('Reset timer terlebih dahulu sebelum memulai.');
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
      this.clearError();
      this.els.notification.hidden = true;
      this.state.remainingSeconds = this.state.lastSetSeconds;
      this.renderDisplay();
    },

    tick() {
      if (this.state.remainingSeconds <= 0) {
        this.onComplete();
        return;
      }
      this.state.remainingSeconds--;
      this.renderDisplay();
      if (this.state.remainingSeconds <= 0) {
        this.onComplete();
      }
    },

    onComplete() {
      this.stop();
      this.renderDisplay();
      this.playAlertSound();
      this.els.notification.hidden = false;
      this.els.notification.textContent = 'Waktu habis! Ambil istirahat sejenak.';
    },

    playAlertSound() {
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);
        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, ctx.currentTime);
        gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.5);
        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + 1.5);
      } catch (e) {
        // Web Audio API unavailable — visual notification is sufficient.
      }
    }
  };

  /* ========================================================================
     Utility: ID generator
     ======================================================================== */
  function generateId() {
    if (window.crypto && crypto.randomUUID) {
      return crypto.randomUUID();
    }
    return 'id-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2);
  }

  /* ========================================================================
     TodoManager Module
     ======================================================================== */
  const TodoManager = {
    tasks: [],
    editingId: null,
    els: {},

    init() {
      this.els = {
        form: document.getElementById('todo-form'),
        nameInput: document.getElementById('todo-name'),
        startInput: document.getElementById('todo-start'),
        endInput: document.getElementById('todo-end'),
        nameError: document.getElementById('todo-name-error'),
        startError: document.getElementById('todo-start-error'),
        endError: document.getElementById('todo-end-error'),
        list: document.getElementById('todo-list'),
        empty: document.getElementById('todo-empty'),
        sortBtn: document.getElementById('todo-sort-btn')
      };

      const raw = Storage.load('tld_tasks', []);
      this.tasks = Array.isArray(raw) ? raw.filter(this.isValidTask) : [];

      this.els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      this.els.sortBtn.addEventListener('click', () => this.sortTasks());

      this.els.list.addEventListener('click', (e) => {
        const item = e.target.closest('[data-task-id]');
        if (!item) return;
        const taskId = item.dataset.taskId;
        const action = e.target.closest('[data-action]');
        if (!action) return;

        if (action.dataset.action === 'delete') {
          this.deleteTask(taskId);
        } else if (action.dataset.action === 'done') {
          this.toggleDone(taskId);
        } else if (action.dataset.action === 'edit') {
          this.startEdit(taskId);
        }
      });

      this.render();
    },

    isValidTask(obj) {
      return obj &&
        typeof obj.id === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.startTime === 'string' &&
        typeof obj.endTime === 'string' &&
        typeof obj.done === 'boolean' &&
        typeof obj.createdAt === 'number';
    },

    clearErrors() {
      [this.els.nameError, this.els.startError, this.els.endError].forEach(el => {
        el.hidden = true;
        el.textContent = '';
      });
    },

    validate(name, start, end) {
      let valid = true;
      this.clearErrors();

      if (!name || !name.trim()) {
        this.els.nameError.hidden = false;
        this.els.nameError.textContent = 'Nama tugas tidak boleh kosong.';
        valid = false;
      }
      if (!start) {
        this.els.startError.hidden = false;
        this.els.startError.textContent = 'Jam mulai wajib diisi.';
        valid = false;
      }
      if (!end) {
        this.els.endError.hidden = false;
        this.els.endError.textContent = 'Jam selesai wajib diisi.';
        valid = false;
      }
      return valid;
    },

    handleSubmit() {
      const name = this.els.nameInput.value;
      const start = this.els.startInput.value;
      const end = this.els.endInput.value;

      if (!this.validate(name, start, end)) return;

      if (this.editingId) {
        const task = this.tasks.find(t => t.id === this.editingId);
        if (task) {
          task.name = name.trim();
          task.startTime = start;
          task.endTime = end;
        }
        this.editingId = null;
        this.els.form.querySelector('button[type="submit"]').textContent = 'Tambah Tugas';
      } else {
        this.tasks.push({
          id: generateId(),
          name: name.trim(),
          startTime: start,
          endTime: end,
          done: false,
          createdAt: Date.now()
        });
      }

      Storage.save('tld_tasks', this.tasks);
      this.els.form.reset();
      this.render();
    },

    startEdit(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      this.editingId = taskId;
      this.els.nameInput.value = task.name;
      this.els.startInput.value = task.startTime;
      this.els.endInput.value = task.endTime;
      this.els.form.querySelector('button[type="submit"]').textContent = 'Simpan Perubahan';
      this.els.nameInput.focus();
    },

    toggleDone(taskId) {
      const task = this.tasks.find(t => t.id === taskId);
      if (!task) return;
      task.done = !task.done;
      Storage.save('tld_tasks', this.tasks);
      this.render();
    },

    deleteTask(taskId) {
      this.tasks = this.tasks.filter(t => t.id !== taskId);
      Storage.save('tld_tasks', this.tasks);
      this.render();
    },

    sortTasksByStartTime(tasks) {
      return [...tasks].sort((a, b) => {
        if (a.startTime < b.startTime) return -1;
        if (a.startTime > b.startTime) return 1;
        return a.createdAt - b.createdAt;
      });
    },

    sortTasks() {
      this.tasks = this.sortTasksByStartTime(this.tasks);
      Storage.save('tld_tasks', this.tasks);
      this.render();
    },

    render() {
      this.els.list.innerHTML = '';

      if (this.tasks.length === 0) {
        this.els.empty.hidden = false;
      } else {
        this.els.empty.hidden = true;
      }

      this.tasks.forEach(task => {
        const li = document.createElement('li');
        li.className = 'todo-item' + (task.done ? ' done' : '');
        li.dataset.taskId = task.id;

        const info = document.createElement('div');
        info.className = 'todo-item-info';

        const nameEl = document.createElement('div');
        nameEl.className = 'todo-item-name';
        nameEl.textContent = task.name;

        const timeEl = document.createElement('div');
        timeEl.className = 'todo-item-time';
        timeEl.textContent = `${task.startTime} – ${task.endTime}`;

        info.appendChild(nameEl);
        info.appendChild(timeEl);

        const actions = document.createElement('div');
        actions.className = 'todo-item-actions';

        const doneBtn = document.createElement('button');
        doneBtn.className = 'icon-btn';
        doneBtn.dataset.action = 'done';
        doneBtn.setAttribute('aria-label', task.done ? 'Tandai belum selesai' : 'Tandai selesai');
        doneBtn.textContent = task.done ? '↺' : '✓';

        const editBtn = document.createElement('button');
        editBtn.className = 'icon-btn';
        editBtn.dataset.action = 'edit';
        editBtn.setAttribute('aria-label', 'Edit tugas');
        editBtn.textContent = '✎';

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'icon-btn danger';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.setAttribute('aria-label', 'Hapus tugas');
        deleteBtn.textContent = '✕';

        actions.appendChild(doneBtn);
        actions.appendChild(editBtn);
        actions.appendChild(deleteBtn);

        li.appendChild(info);
        li.appendChild(actions);
        this.els.list.appendChild(li);
      });
    }
  };

  /* ========================================================================
     QuickLinks Module
     ======================================================================== */
  const QuickLinks = {
    links: [],
    els: {},
    MAX_LINKS: 50,

    init() {
      this.els = {
        form: document.getElementById('link-form'),
        labelInput: document.getElementById('link-label'),
        urlInput: document.getElementById('link-url'),
        labelError: document.getElementById('link-label-error'),
        urlError: document.getElementById('link-url-error'),
        limitError: document.getElementById('link-limit-error'),
        list: document.getElementById('quicklinks-list'),
        empty: document.getElementById('quicklinks-empty')
      };

      const raw = Storage.load('tld_links', []);
      this.links = Array.isArray(raw) ? raw.filter(this.isValidLink) : [];

      this.els.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleSubmit();
      });

      this.els.list.addEventListener('click', (e) => {
        const item = e.target.closest('[data-link-id]');
        if (!item) return;
        const linkId = item.dataset.linkId;
        const action = e.target.closest('[data-action]');
        if (!action) return;

        if (action.dataset.action === 'delete') {
          this.deleteLink(linkId);
        }
        // Opening links is handled via native <a> target=_blank, no JS needed.
      });

      this.render();
    },

    isValidLink(obj) {
      return obj &&
        typeof obj.id === 'string' &&
        typeof obj.label === 'string' &&
        typeof obj.url === 'string';
    },

    isValidUrl(str) {
      try {
        const url = new URL(str);
        return (url.protocol === 'http:' || url.protocol === 'https:') && url.host.length > 0;
      } catch {
        return false;
      }
    },

    clearErrors() {
      [this.els.labelError, this.els.urlError, this.els.limitError].forEach(el => {
        el.hidden = true;
        el.textContent = '';
      });
    },

    handleSubmit() {
      this.clearErrors();
      const label = this.els.labelInput.value.trim();
      const url = this.els.urlInput.value.trim();
      let valid = true;

      if (!label || label.length > 100) {
        this.els.labelError.hidden = false;
        this.els.labelError.textContent = label.length > 100
          ? 'Label maksimal 100 karakter.'
          : 'Label tidak boleh kosong.';
        valid = false;
      }
      if (!url || !this.isValidUrl(url)) {
        this.els.urlError.hidden = false;
        this.els.urlError.textContent = 'URL harus diawali http:// atau https://';
        valid = false;
      }
      if (!valid) return;

      if (this.links.length >= this.MAX_LINKS) {
        this.els.limitError.hidden = false;
        this.els.limitError.textContent = `Maksimal ${this.MAX_LINKS} tautan tercapai.`;
        return;
      }

      this.links.push({ id: generateId(), label, url });
      Storage.save('tld_links', this.links);
      this.els.form.reset();
      this.render();
    },

    deleteLink(linkId) {
      this.links = this.links.filter(l => l.id !== linkId);
      Storage.save('tld_links', this.links);
      this.render();
    },

    render() {
      this.els.list.innerHTML = '';
      this.els.empty.hidden = this.links.length !== 0;

      this.links.forEach(link => {
        const wrapper = document.createElement('div');
        wrapper.className = 'quicklink-item';
        wrapper.dataset.linkId = link.id;
        wrapper.setAttribute('role', 'listitem');

        const anchor = document.createElement('a');
        anchor.className = 'quicklink-btn';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.textContent = link.label;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'quicklink-delete';
        deleteBtn.dataset.action = 'delete';
        deleteBtn.setAttribute('aria-label', `Hapus tautan ${link.label}`);
        deleteBtn.textContent = '✕';

        wrapper.appendChild(anchor);
        wrapper.appendChild(deleteBtn);
        this.els.list.appendChild(wrapper);
      });
    }
  };

  /* ========================================================================
     Theme Module
     ======================================================================== */
  const Theme = {
    current: 'light',
    els: {},

    init() {
      this.els = {
        toggle: document.getElementById('theme-toggle'),
        icon: document.getElementById('theme-icon')
      };

      const saved = Storage.load('tld_theme', null);
      if (saved === 'light' || saved === 'dark') {
        this.apply(saved, false);
      } else {
        const prefersDark = window.matchMedia &&
          window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.apply(prefersDark ? 'dark' : 'light', false);
      }

      this.els.toggle.addEventListener('click', () => this.toggle());
    },

    toggle() {
      this.apply(this.current === 'light' ? 'dark' : 'light', true);
      Storage.save('tld_theme', this.current);
    },

    apply(theme, animate) {
      this.current = theme;
      document.documentElement.setAttribute('data-theme', theme);
      this.els.icon.textContent = theme === 'light' ? '☀️' : '🌙';

      if (animate) {
        this.els.icon.classList.add('animating');
        this.els.icon.addEventListener('animationend', () => {
          this.els.icon.classList.remove('animating');
        }, { once: true });
      }
    }
  };

  /* ========================================================================
     Bootstrap
     ======================================================================== */
  function checkBrowserSupport() {
    const required = [
      typeof localStorage !== 'undefined',
      typeof JSON !== 'undefined',
      typeof Date !== 'undefined',
      typeof Array.prototype.sort !== 'undefined'
    ];
    const supported = required.every(Boolean);
    if (!supported) {
      document.getElementById('compat-warning').hidden = false;
      document.getElementById('dashboard').hidden = true;
    }
    return supported;
  }

  function init() {
    try {
      if (!checkBrowserSupport()) return;
      Storage.init();
      Theme.init();
      Greeting.init();
      Timer.init();
      TodoManager.init();
      QuickLinks.init();
    } catch (e) {
      const err = document.getElementById('load-error');
      if (err) err.hidden = false;
    }
  }

  document.addEventListener('DOMContentLoaded', init);

  return { Storage, Greeting, Timer, TodoManager, QuickLinks, Theme };

})();
