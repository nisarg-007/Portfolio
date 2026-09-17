/* ============================================================
   NISARG M SHAH — SECTIONAL
   Radar sweep · typing readout · acquire-on-scroll · crosshairs
   ============================================================ */

const REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ------------------------------------------------------------
   1. RADAR SWEEP
   A slow sweep over a coordinate field. Contacts light as the
   beam crosses them, then fade — the way a real scope decays.
------------------------------------------------------------ */
class RadarScope {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.angle = -Math.PI / 2;
    this.contacts = [];
    this.resize();
    this.seed();
    window.addEventListener('resize', () => { this.resize(); this.seed(); });
    this.loop();
  }
  resize() {
    const r = this.c.parentElement.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.w = r.width; this.h = r.height;
    this.c.width = this.w * this.dpr;
    this.c.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    // scope centred on the portrait, right side on desktop
    this.cx = this.w > 960 ? this.w * 0.655 : this.w * 0.5;
    this.cy = this.h * (this.w > 960 ? 0.5 : 0.34);
    this.R = Math.min(this.w, this.h) * (this.w > 960 ? 0.40 : 0.40);
  }
  seed() {
    const n = this.w > 960 ? 26 : 14;
    this.contacts = Array.from({ length: n }, () => {
      const a = Math.random() * Math.PI * 2;
      const d = (0.28 + Math.random() * 0.72) * this.R;
      return { a, d, lit: 0, size: 1 + Math.random() * 1.6 };
    });
  }
  loop() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);

    // range rings
    ctx.strokeStyle = 'rgba(22,25,26,.11)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 4; i++) {
      ctx.beginPath();
      ctx.arc(this.cx, this.cy, (this.R / 4) * i, 0, Math.PI * 2);
      ctx.stroke();
    }
    // radial bearings every 30°
    for (let i = 0; i < 12; i++) {
      const a = (i * Math.PI) / 6;
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.lineTo(this.cx + Math.cos(a) * this.R, this.cy + Math.sin(a) * this.R);
      ctx.stroke();
    }

    if (!REDUCED) this.angle += 0.0058;

    // sweep wedge
    const grad = ctx.createConicGradient
      ? ctx.createConicGradient(this.angle, this.cx, this.cy)
      : null;
    if (grad) {
      grad.addColorStop(0,    'rgba(192,23,92,.17)');
      grad.addColorStop(0.07, 'rgba(192,23,92,.015)');
      grad.addColorStop(1,    'rgba(192,23,92,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(this.cx, this.cy);
      ctx.arc(this.cx, this.cy, this.R, 0, Math.PI * 2);
      ctx.fill();
    }
    // leading edge
    ctx.strokeStyle = 'rgba(192,23,92,.42)';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(this.cx, this.cy);
    ctx.lineTo(this.cx + Math.cos(this.angle) * this.R, this.cy + Math.sin(this.angle) * this.R);
    ctx.stroke();

    // contacts
    const norm = (x) => ((x % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2);
    const beam = norm(this.angle);
    this.contacts.forEach(p => {
      if (Math.abs(norm(p.a) - beam) < 0.05) p.lit = 1;
      p.lit *= 0.988;
      if (p.lit < 0.01) return;
      const x = this.cx + Math.cos(p.a) * p.d;
      const y = this.cy + Math.sin(p.a) * p.d;
      ctx.fillStyle = `rgba(192,23,92,${p.lit * 0.8})`;
      ctx.beginPath();
      ctx.arc(x, y, p.size + p.lit * 1.6, 0, Math.PI * 2);
      ctx.fill();
    });

    requestAnimationFrame(() => this.loop());
  }
}

/* ------------------------------------------------------------
   2. TYPING READOUT
------------------------------------------------------------ */
class TypingEffect {
  constructor(el, words, type = 78, del = 38, pause = 1900) {
    this.el = el; this.words = words;
    this.type = type; this.del = del; this.pause = pause;
    this.w = 0; this.c = 0; this.deleting = false;
    this.tick();
  }
  tick() {
    const word = this.words[this.w];
    this.c += this.deleting ? -1 : 1;
    this.el.textContent = word.substring(0, this.c);
    let wait = this.deleting ? this.del : this.type;
    if (!this.deleting && this.c === word.length) { wait = this.pause; this.deleting = true; }
    else if (this.deleting && this.c === 0) { this.deleting = false; this.w = (this.w + 1) % this.words.length; wait = 420; }
    setTimeout(() => this.tick(), wait);
  }
}

/* ------------------------------------------------------------
   3. ACQUIRE ON SCROLL
------------------------------------------------------------ */
function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (REDUCED || !('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('visible'));
    document.querySelectorAll('.section-title').forEach(e => e.classList.add('visible'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => {
      if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
  els.forEach(e => io.observe(e));
}

/* ------------------------------------------------------------
   4. COUNTERS
------------------------------------------------------------ */
function initCounters() {
  const nums = document.querySelectorAll('.stat-number');
  const run = (el) => {
    const target = +el.dataset.target || 0;
    if (REDUCED) { el.textContent = target; return; }
    const dur = 1250; const t0 = performance.now();
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
  const io = new IntersectionObserver((es) => {
    es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } });
  }, { threshold: 0.5 });
  nums.forEach(n => io.observe(n));
}

/* ------------------------------------------------------------
   5. PROJECT CROSSHAIRS
------------------------------------------------------------ */
function initCrosshairs() {
  if (REDUCED) return;
  document.querySelectorAll('.project-card').forEach(card => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty('--cx', (e.clientX - r.left) + 'px');
      card.style.setProperty('--cy', (e.clientY - r.top) + 'px');
    });
  });
}

/* ------------------------------------------------------------
   6. FILTERS
------------------------------------------------------------ */
function initFilters() {
  const btns = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');
  btns.forEach(b => b.addEventListener('click', () => {
    btns.forEach(x => x.classList.remove('active'));
    b.classList.add('active');
    const f = b.dataset.filter;
    cards.forEach(c => {
      const show = f === 'all' || c.dataset.category === f;
      c.style.display = show ? '' : 'none';
    });
  }));
}

/* ------------------------------------------------------------
   7. NAV
------------------------------------------------------------ */
function initNav() {
  const toggle = document.getElementById('navToggle');
  const links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      links.classList.toggle('active');
    });
    links.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('active'); links.classList.remove('active');
    }));
  }
  const sections = [...document.querySelectorAll('section[id]')];
  const navLinks = [...document.querySelectorAll('.nav-link')];
  window.addEventListener('scroll', () => {
    const y = window.scrollY + 90;
    let cur = sections[0]?.id;
    sections.forEach(s => { if (s.offsetTop <= y) cur = s.id; });
    navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + cur));
  }, { passive: true });
}

/* ------------------------------------------------------------
   BOOT
------------------------------------------------------------ */
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('particles');
  if (canvas) new RadarScope(canvas);

  const typingEl = document.getElementById('typingText');
  if (typingEl) {
    new TypingEffect(typingEl, [
      'Data Scientist',
      'ML Engineer',
      'Software Engineer',
      'Cloud Builder'
    ]);
  }

  initReveal();
  initCounters();
  initCrosshairs();
  initFilters();
  initNav();

  document.querySelectorAll('.section-title').forEach(t => {
    if (REDUCED) { t.classList.add('visible'); return; }
    const io = new IntersectionObserver((es) => {
      es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); io.unobserve(e.target); } });
    }, { threshold: 0.4 });
    io.observe(t);
  });
});
