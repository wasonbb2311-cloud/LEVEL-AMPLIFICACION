/* ============================================
   LEVEL — NEON BRUTAL
   Sliders por fundido (sin movimiento: imposible que
   se asome la foto vecina)
   ============================================ */

/* ===== EQUIPO (con descripción por foto) ===== */
const eqIdx = {};

function eqPaint(id) {
  const view = document.getElementById(id);
  if (!view) return;
  const slides = Array.from(view.querySelectorAll('.eq-slide'));
  const n = slides.length;
  if (!n) return;
  if (eqIdx[id] == null) eqIdx[id] = 0;
  const i = ((eqIdx[id] % n) + n) % n;
  eqIdx[id] = i;
  slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
  const card = view.closest('.eq-card');
  if (!card) return;
  const cur = slides[i];
  const t = card.querySelector('.eq-body h3');
  const d = card.querySelector('.eq-body p');
  const g = card.querySelector('.eq-tag');
  if (t && cur.dataset.title) t.textContent = cur.dataset.title;
  if (d && cur.dataset.desc) d.innerHTML = cur.dataset.desc;
  if (g && cur.dataset.tag) g.textContent = cur.dataset.tag;
}

function eqPrev(id) {
  const view = document.getElementById(id);
  if (!view) return;
  const n = view.querySelectorAll('.eq-slide').length;
  if (!n) return;
  if (eqIdx[id] == null) eqIdx[id] = 0;
  eqIdx[id] = (eqIdx[id] - 1 + n) % n;
  eqPaint(id);
}

/* ===== PAQUETES (solo fotos) ===== */
const pkIdx = {};

function pkPaint(id) {
  const view = document.getElementById(id);
  if (!view) return;
  const slides = Array.from(view.querySelectorAll('.pk-slide'));
  const n = slides.length;
  if (!n) return;
  if (pkIdx[id] == null) pkIdx[id] = 0;
  const i = ((pkIdx[id] % n) + n) % n;
  pkIdx[id] = i;
  slides.forEach((s, k) => s.classList.toggle('is-on', k === i));
}

function pkNext(id) {
  const view = document.getElementById(id);
  if (!view) return;
  const n = view.querySelectorAll('.pk-slide').length;
  if (!n) return;
  if (pkIdx[id] == null) pkIdx[id] = 0;
  pkIdx[id] = (pkIdx[id] + 1) % n;
  pkPaint(id);
}

document.addEventListener('DOMContentLoaded', () => {
  ['eq-melo', 'eq-sub', 'eq-beam', 'eq-humo'].forEach(eqPaint);
  ['pk-house', 'pk-after', 'pk-festival'].forEach(pkPaint);

  /* Contador a fin de mes */
  const fin = new Date(); fin.setMonth(fin.getMonth() + 1, 0); fin.setHours(23, 59, 59, 0);
  const dEl = document.getElementById('cd-d');
  if (dEl) {
    const pad = (n) => (n < 10 ? '0' : '') + n;
    const tick = () => {
      const d = Math.max(0, fin - Date.now());
      dEl.textContent = pad(Math.floor(d / 864e5));
      document.getElementById('cd-h').textContent = pad(Math.floor(d / 36e5) % 24);
      document.getElementById('cd-m').textContent = pad(Math.floor(d / 6e4) % 60);
      document.getElementById('cd-s').textContent = pad(Math.floor(d / 1e3) % 60);
    };
    tick(); setInterval(tick, 1000);
  }

  /* Tilt en tarjetas de paquetes (solo mouse) */
  if (window.matchMedia('(hover:hover)').matches) {
    document.querySelectorAll('.p-ticket').forEach((t) => {
      t.addEventListener('mousemove', (e) => {
        const r = t.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        t.style.transform = 'perspective(700px) rotateY(' + (x * 7) + 'deg) rotateX(' + (-y * 7) + 'deg)';
      });
      t.addEventListener('mouseleave', () => { t.style.transform = ''; });
    });
  }

  /* Lightbox con carrusel: JBL con su encuadre, resto a tamaño completo */
  const lb = document.getElementById('lb-jbl');
  const lbFrame = document.getElementById('lb-frame');
  const lbImg = document.getElementById('lb-img');
  const lbCap = document.getElementById('lb-cap');
  const x = document.getElementById('lb-x');
  const lbP = document.getElementById('lb-prev');
  const lbN = document.getElementById('lb-next');
  let lbList = [];
  let lbPos = 0;
  const lbRender = () => {
    if (!lbList.length || !lbImg) return;
    const fig = lbList[((lbPos % lbList.length) + lbList.length) % lbList.length];
    lbPos = lbList.indexOf(fig);
    const im = fig.querySelector('img');
    if (!im) return;
    const esJbl = fig.id === 'foto-jbl' && !fig.dataset.full;
    if (lbFrame) lbFrame.classList.toggle('full', !esJbl);
    lbImg.src = fig.dataset.full || im.src;
    lbImg.alt = im.alt || 'Foto en grande';
    if (lbCap) {
      if (fig.classList.contains('eq-slide') && fig.dataset.title) {
        const t = fig.dataset.title;
        const d = (fig.dataset.desc || '').replace(/<br\s*\/?>/gi, ' - ');
        lbCap.innerHTML = d ? ('<strong>' + t + '</strong><span>' + d + '</span>') : ('<strong>' + t + '</strong>');
        lbCap.hidden = false;
      } else {
        lbCap.hidden = true;
      }
    }
  };
  if (lb && lbFrame && lbImg) {
    const open = () => { lb.classList.add('open'); lb.setAttribute('aria-hidden', 'false'); };
    const close = () => { lb.classList.remove('open'); lb.setAttribute('aria-hidden', 'true'); };
    document.querySelectorAll('.pk-slide, .eq-slide').forEach((fig) => {
      fig.style.cursor = 'zoom-in';
      fig.addEventListener('click', (e) => {
        const view = fig.closest('.pk-view, .eq-view');
        lbList = view ? Array.from(view.querySelectorAll('.pk-slide, .eq-slide')) : [fig];
        lbList.sort((a, b) => {
          const A = a.dataset.lb, B = b.dataset.lb;
          if (A === undefined || B === undefined) return 0;
          return (+A) - (+B);
        });
        lbPos = Math.max(0, lbList.indexOf(fig));
        e.stopPropagation();
        lbRender();
        open();
      });
    });
    const nav = (d) => (e) => { if (e) e.stopPropagation(); if (!lbList.length) return; lbPos = (lbPos + d + lbList.length) % lbList.length; lbRender(); };
    if (lbP) lbP.addEventListener('click', nav(-1));
    if (lbN) lbN.addEventListener('click', nav(1));
    if (x) x.addEventListener('click', (e) => { e.stopPropagation(); close(); });
    lb.addEventListener('click', close);
    document.addEventListener('keydown', (e) => {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') { lbPos = (lbPos - 1 + lbList.length) % lbList.length; lbRender(); }
      if (e.key === 'ArrowRight') { lbPos = (lbPos + 1) % lbList.length; lbRender(); }
    });
  }
});
