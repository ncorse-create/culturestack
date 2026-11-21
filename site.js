(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const A = './assets/';

  /* ---------- covers ---------- */
  const C = {
    music: [['c00'],['c01'],['c02'],['c03','The Thief Next to Jesus'],['c04','Ironman'],['c05'],['c06'],['c07','Nina Hagen Band'],['c08']],
    games: [['c09'],['c10'],['c11','Mario Party'],['c12','Call of Duty: Advanced Warfare'],['c13','Castlevania Dominus Collection'],['c14','Super Bomberman R 2'],['c15','Wii Sports Resort'],['c16','Devil Survivor 2'],['c17','Senran Kagura'],['c18','Dirt 5']],
    books: [['c42','Dune'],['c43','The Hero of Ages'],['c44'],['c45','The Grace of Kings'],['c46'],['c47','The Sword of Kaigen'],['c48','The Two Towers']],
    film: [['c19','Gone with the Wind'],['c20','The Trial of the Chicago 7'],['c21','Galaxy Quest'],['c22','Munich'],['c23','Scarface']],
    tv: [['c24','Louie'],['c25','Pride and Prejudice'],['c26',"Foyle's War"],['c27','Assassination Classroom'],['c28','Africa'],['c29','The Muppet Show'],['c30','Whose Line Is It Anyway?'],['c31','Still Game'],['c32','El Chavo del Ocho'],['c33','Inside Job'],['c34','Hannibal'],['c35','Yeh Meri Family'],['c36','Long Way Round'],['c38','Fleabag'],['c39','Lonesome Dove'],['c40','Beavis and Butt-Head'],['c41','Castlevania: Nocturne']]
  };
  const src = id => `${A}covers/${id}.webp`;

  /* ---------- nav ---------- */
  const nav = $('.nav');
  const onScroll = () => nav.classList.toggle('is-scrolled', scrollY > 12);
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- counters ---------- */
  const countUp = el => {
    if (el.dataset.done) return; el.dataset.done = 1;
    const to = parseFloat(el.dataset.to), dec = +(el.dataset.dec || 0);
    const fmt = v => dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-US');
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now(), dur = 1400 + Math.min(to, 2000) * 0.2;
    const step = t => { const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(to * e); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };

  /* ---------- reveal ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target; el.classList.add('is-in'); io.unobserve(el);
    $$('.count', el).forEach(countUp); if (el.classList.contains('count')) countUp(el);
    setTimeout(() => el.classList.add('done'), 1300);
  }), { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
  $$('.reveal, .card, .count').forEach(el => io.observe(el));

  /* ---------- drifting rows (mural + hero + cta) ---------- */
  const rows = new Set();
  const visible = new WeakMap();
  const vio = new IntersectionObserver(es => es.forEach(e => visible.set(e.target, e.isIntersecting)), { rootMargin: '100px' });
  function buildRow(el, name, h) {
    el.innerHTML = ''; el.style.setProperty('--h', h + 'px');
    const strip = document.createElement('div'); strip.className = 'mrow__strip'; el.appendChild(strip);
    const img = new Image(); img.alt = ''; img.decoding = 'async'; img.src = `${A}app/${name}.webp`;
    const rec = { el, strip, w: 0, x: 0, dir: +(el.dataset.dir || 1), speed: +(el.dataset.speed || 60) / 4 };
    const fill = () => {
      rec.w = img.naturalWidth * (h / img.naturalHeight);
      const n = Math.ceil((innerWidth * 1.4) / rec.w) + 2;
      strip.innerHTML = ''; for (let i = 0; i < n; i++) { const c = img.cloneNode(); c.style.height = h + 'px'; c.width = Math.round(rec.w); c.height = h; strip.appendChild(c); }
      rec.x = rec.dir > 0 ? -rec.w : 0; rec.ready = true;
    };
    img.complete && img.naturalWidth ? fill() : img.addEventListener('load', fill, { once: true });
    rows.add(rec); vio.observe(el); return rec;
  }
  $$('.hero__mural .mrow, .cta-mural .mrow').forEach(el => buildRow(el, el.dataset.row, innerWidth < 700 ? 110 : 150));

  let last = performance.now();
  const tick = t => {
    const dt = Math.min(64, t - last) / 1000; last = t;
    rows.forEach(r => {
      if (!r.ready || !r.el.isConnected) { if (!r.el.isConnected) rows.delete(r); return; }
      if (!visible.get(r.el)) return;
      r.x += r.dir * r.speed * dt;
      if (r.x > 0) r.x -= r.w; if (r.x < -r.w) r.x += r.w;
      r.strip.style.transform = `translate3d(${r.x.toFixed(2)}px,0,0)`;
    });
    marquees.forEach(m => {
      if (!m.w || !visible.get(m.el)) return;
      m.x += m.dir * 22 * dt; if (m.x > 0) m.x -= m.w; if (m.x < -m.w) m.x += m.w;
      m.el.style.transform = `translate3d(${m.x.toFixed(2)}px,0,0)`;
    });
    requestAnimationFrame(tick);
  };

  /* ---------- mural wall + shelf tabs ---------- */
  const WALL = {
    music: ['row-music-0', 'row-music-1', 'row-music-2'],
    games: ['row-games-0', 'row-games-1', 'row-games-2'],
    books: ['row-books-0', 'row-books-1'],
    film: ['row-film-0', 'row-film-1'],
    tv: ['row-tv-0', 'row-tv2-0', 'row-tv-1']
  };
  const SHOT = { music: 'mural-music', games: 'mural-games', books: 'mural-books', film: 'mural-film', tv: 'mural-tv' };
  const ALT = { music: 'Music', games: 'Games', books: 'Books', film: 'Film', tv: 'TV' };
  const wall = $('#muralWall'), shot = $('#muralShot'), msec = $('#mural');
  function setWall(shelf, animate) {
    const draw = () => {
      wall.innerHTML = '';
      const list = WALL[shelf]; const total = innerWidth < 700 ? 300 : 420;
      const h = Math.round((total - (list.length - 1) * 5) / list.length);
      list.forEach((name, i) => { const d = document.createElement('div'); d.className = 'mrow'; d.dataset.dir = i % 2 ? -1 : 1; d.dataset.speed = 70; wall.appendChild(d); buildRow(d, name, h); });
      shot.src = `${A}app/${SHOT[shelf]}.webp`;
      shot.alt = `The ${ALT[shelf]} queue in Culture Stack, opening on a mural of its cover art`;
      msec.style.setProperty('--c', `var(--${shelf})`);
      wall.classList.remove('is-swapping');
    };
    if (animate && !reduce) { wall.classList.add('is-swapping'); setTimeout(draw, 320); } else draw();
  }
  const mtabs = $$('.mural-tabs [role=tab]');
  const selectShelf = (shelf, animate = true) => { mtabs.forEach(b => b.setAttribute('aria-selected', b.dataset.shelf === shelf)); setWall(shelf, animate); };
  mtabs.forEach(b => b.addEventListener('click', () => selectShelf(b.dataset.shelf)));
  tabKeys(mtabs);
  $$('.shelf[data-cat]').forEach(a => a.addEventListener('click', () => selectShelf(a.dataset.cat, false)));
  setWall('music', false);
  // preload other mural shots
  addEventListener('load', () => Object.values(SHOT).forEach(n => { const i = new Image(); i.src = `${A}app/${n}.webp`; }));

  function tabKeys(tabs) {
    tabs.forEach((b, i) => b.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0; if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length]; n.focus(); n.click();
    }));
  }

  /* ---------- marquee ---------- */
  const marquees = [];
  const all = Object.values(C).flat().map(c => c[0]);
  [['#mq1', 1, all.filter((_, i) => i % 2 === 0)], ['#mq2', -1, all.filter((_, i) => i % 2)]].forEach(([sel, dir, ids]) => {
    const el = $(sel); if (!el) return;
    const make = () => ids.forEach(id => { const i = new Image(); i.src = src(id); i.alt = ''; i.loading = 'lazy'; i.decoding = 'async'; el.appendChild(i); });
    make(); make();
    const m = { el, dir, x: 0, w: 0 };
    const measure = () => { m.w = el.scrollWidth / 2; if (dir > 0) m.x = -m.w; };
    addEventListener('load', measure); addEventListener('resize', measure);
    marquees.push(m); vio.observe(el);
  });

  /* ---------- spin ---------- */
  const STYLE = { music: 'Record platter', games: 'Arcade carousel', books: 'Flipped stack', film: 'Film gate', tv: 'Channel surf' };
  const VERB = { music: 'album', games: 'game', books: 'book', film: 'film', tv: 'show' };
  const win = $('#spinWindow'), track = $('#spinTrack'), pickEl = $('#spinPick'), styleEl = $('#spinStyle'), btn = $('#spinBtn'), ssec = $('#spin');
  let shelf = 'music', pos = 0, spinning = false, cards = [];
  function buildSpin() {
    track.innerHTML = ''; cards = [];
    const list = C[shelf];
    for (let r = 0; r < 8; r++) list.forEach(([id, title]) => {
      const d = document.createElement('div'); d.className = 'spin-card'; d.dataset.title = title || '';
      const i = new Image(); i.src = src(id); i.alt = title || ''; i.decoding = 'async'; d.appendChild(i);
      track.appendChild(d); cards.push(d);
    });
    win.dataset.shelf = shelf; ssec.style.setProperty('--c', `var(--${shelf})`);
    styleEl.textContent = STYLE[shelf];
    pickEl.textContent = `Tap spin to pick tonight's ${VERB[shelf]}`;
    pos = centerOn(Math.floor(list.length * 1.5));
    track.style.transform = `translate3d(${pos}px,-50%,0)`;
  }
  const step = () => { const a = cards[0].getBoundingClientRect(), b = cards[1].getBoundingClientRect(); return b.left - a.left; };
  const centerOn = idx => { const s = step(), cw = cards[0].offsetWidth; return win.clientWidth / 2 - (idx * s + cw / 2); };
  function spin() {
    if (spinning) return; spinning = true; btn.disabled = true;
    cards.forEach(c => c.classList.remove('is-pick'));
    const list = C[shelf], titled = list.map((c, i) => c[1] ? i : -1).filter(i => i >= 0);
    const target = list.length * 5 + titled[Math.floor(Math.random() * titled.length)];
    const from = pos, to = centerOn(target);
    const finish = () => {
      pos = to; spinning = false; btn.disabled = false; win.classList.remove('is-spinning');
      const c = cards[target]; c.classList.add('is-pick');
      if (shelf === 'tv' && !reduce) { win.classList.remove('is-static'); void win.offsetWidth; win.classList.add('is-static'); }
      pickEl.textContent = `Tonight: ${c.dataset.title}`; pickEl.classList.remove('pop'); void pickEl.offsetWidth; pickEl.classList.add('pop');
      // reset quietly to the same card in an earlier copy so the next spin has room
      setTimeout(() => { if (spinning) return; const back = target - list.length * 3; cards[target].classList.remove('is-pick'); cards[back].classList.add('is-pick'); pos = centerOn(back); track.style.transform = `translate3d(${pos}px,-50%,0)`; }, 1600);
    };
    if (reduce) { track.style.transform = `translate3d(${to}px,-50%,0)`; finish(); return; }
    win.classList.add('is-spinning');
    const dur = 3200, t0 = performance.now();
    const ease = p => 1 - Math.pow(1 - p, 4);
    const frame = t => {
      const p = Math.min(1, (t - t0) / dur), x = from + (to - from) * ease(p);
      track.style.transform = `translate3d(${x}px,-50%,0) rotateY(${((1 - p) * (to - from) / 900) * (shelf === 'games' ? 6 : 0)}deg)`;
      p < 1 ? requestAnimationFrame(frame) : finish();
    };
    requestAnimationFrame(frame);
  }
  const stabs = $$('.spin-tabs [role=tab]');
  stabs.forEach(b => b.addEventListener('click', () => { if (spinning) return; stabs.forEach(x => x.setAttribute('aria-selected', x === b)); shelf = b.dataset.spin; buildSpin(); }));
  tabKeys(stabs);
  btn.addEventListener('click', spin);
  buildSpin();
  addEventListener('resize', () => { if (!spinning) buildSpin(); });

  /* ---------- score picker ---------- */
  const sv = $('#scoreValue'), badge = $('.score-badge');
  $$('.score-picker button').forEach((b, i, arr) => b.addEventListener('click', () => {
    arr.forEach(x => x.setAttribute('aria-checked', x === b)); sv.dataset.done = 1; sv.textContent = i + 1;
    badge.classList.remove('bump'); void badge.offsetWidth; badge.classList.add('bump');
  }));

  /* ---------- tilt ---------- */
  if (fine && !reduce) $$('.tilt').forEach(el => {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.style.setProperty('--ry', (x * 10).toFixed(2) + 'deg'); el.style.setProperty('--rx', (-y * 8).toFixed(2) + 'deg');
    });
    el.addEventListener('pointerleave', () => { el.style.setProperty('--ry', '0deg'); el.style.setProperty('--rx', '0deg'); });
  });

  /* ---------- parallax ---------- */
  const px = $$('[data-parallax]');
  if (!reduce && px.length) {
    let queued = false;
    const run = () => {
      queued = false; const vh = innerHeight;
      px.forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom < -200 || r.top > vh + 200) return; const c = r.top + r.height / 2 - vh / 2; el.style.translate = `0 ${(c * parseFloat(el.dataset.parallax)).toFixed(1)}px`; });
    };
    addEventListener('scroll', () => { if (!queued) { queued = true; requestAnimationFrame(run); } }, { passive: true }); run();
  }

  if (!reduce) requestAnimationFrame(tick);
  else { // still frames
    rows.forEach(r => r.strip && (r.strip.style.transform = 'translate3d(0,0,0)'));
  }
})();
