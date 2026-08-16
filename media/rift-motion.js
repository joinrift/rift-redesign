/* Rift motion pack — 3D tilt cards, magnetic CTAs, count-up stats, hero parallax.
   Vanilla port of 21st.dev-style interaction patterns. Fully disabled for reduced motion. */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var style = document.createElement('style');
  style.textContent = [
    '.rm-tilt { transform-style: preserve-3d; will-change: transform; position: relative; }',
    '.rm-tilt::after { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none;',
    '  background: radial-gradient(420px circle at var(--rm-gx,50%) var(--rm-gy,50%), rgba(255,255,255,0.22), transparent 55%);',
    '  opacity: 0; transition: opacity .35s ease; z-index: 3; }',
    '.rm-tilt:hover::after { opacity: 1; }',
    '.hh-hero-visual.rm-tilt, .hh-life-img.rm-tilt { border-radius: 28px; }',
    '.rm-mag { will-change: transform; }'
  ].join('\n');
  document.head.appendChild(style);

  /* ── 3D tilt + cursor glare ── */
  var TILT = 8;
  document.querySelectorAll('.cat-item, .hh-card, .hairline-card, .hh-hero-visual, .hh-life-img').forEach(function (el) {
    el.classList.add('rm-tilt');
    var raf = null;
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width;
      var py = (e.clientY - r.top) / r.height;
      el.style.setProperty('--rm-gx', (px * 100) + '%');
      el.style.setProperty('--rm-gy', (py * 100) + '%');
      if (raf) return;
      raf = requestAnimationFrame(function () {
        raf = null;
        el.style.transition = 'transform .12s ease-out';
        el.style.transform = 'perspective(900px) rotateX(' + ((0.5 - py) * TILT) + 'deg) rotateY(' + ((px - 0.5) * TILT) + 'deg) translateY(-4px)';
      });
    });
    el.addEventListener('mouseleave', function () {
      el.style.transition = 'transform .7s cubic-bezier(0.32, 0.72, 0, 1)';
      el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) translateY(0)';
    });
  });

  /* ── Magnetic CTAs ── */
  document.querySelectorAll('.rh-cta, .hh-cta, .hairline-cta, .nav-cta-btn').forEach(function (el) {
    el.classList.add('rm-mag');
    el.addEventListener('mousemove', function (e) {
      var r = el.getBoundingClientRect();
      var dx = e.clientX - (r.left + r.width / 2);
      var dy = e.clientY - (r.top + r.height / 2);
      el.style.transition = 'transform .15s ease-out';
      el.style.transform = 'translate(' + (dx * 0.16) + 'px, ' + (dy * 0.3) + 'px)';
    });
    el.addEventListener('mouseleave', function () {
      el.style.transition = 'transform .55s cubic-bezier(0.34, 1.56, 0.64, 1)';
      el.style.transform = 'translate(0, 0)';
    });
  });

  /* ── Count-up stats on first view ── */
  function countTarget(el) {
    var inner = el.querySelector('span');
    return inner && /\d/.test(inner.textContent) ? inner : el;
  }
  var seen = new WeakSet();
  var statIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (!en.isIntersecting || seen.has(en.target)) return;
      seen.add(en.target);
      statIO.unobserve(en.target);
      var el = countTarget(en.target);
      var original = el.textContent;
      var m = original.match(/^([^\d]*)([\d,]+(?:\.\d+)?)([\s\S]*)$/);
      if (!m) return;
      var target = parseFloat(m[2].replace(/,/g, ''));
      if (!isFinite(target) || target === 0) return;
      var dec = (m[2].split('.')[1] || '').length;
      var hasComma = m[2].indexOf(',') !== -1;
      var t0 = performance.now(), dur = 1300;
      (function tick(t) {
        var p = Math.min((t - t0) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        var v = target * eased;
        var txt = hasComma
          ? Math.round(v).toLocaleString('en-US')
          : v.toFixed(dec);
        el.textContent = m[1] + txt + m[3];
        if (p < 1) requestAnimationFrame(tick);
        else el.textContent = original;
      })(t0);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.hh-stat .num, .stat-number').forEach(function (el) { statIO.observe(el); });

  /* ── Hero cursor parallax (index) — takes over the CSS zoom ── */
  var bg = document.querySelector('#rift-hero .rh-bg');
  var stack = document.querySelector('#rift-hero .rh-stack');
  if (bg) {
    bg.style.animation = 'none';
    var mx = 0, my = 0, cx = 0, cy = 0;
    window.addEventListener('mousemove', function (e) {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    (function loop() {
      requestAnimationFrame(loop);
      var t = performance.now() / 1000;
      cx += (mx - cx) * 0.05;
      cy += (my - cy) * 0.05;
      var breathe = 1.05 + Math.sin(t * 0.16) * 0.025; // slow cinematic breathing
      bg.style.transform = 'scale(' + breathe + ') translate(' + (cx * -16) + 'px, ' + (cy * -10) + 'px)';
      if (stack) stack.style.transform = 'translate(' + (cx * 9) + 'px, ' + (cy * 6) + 'px)';
    })();
  }

  /* ── Staggered slide-in for card grids (timeline, products, quotes, tiles) ── */
  var slideCSS = document.createElement('style');
  slideCSS.textContent = [
    '.hh-tl-step.reveal:not(.visible) { transform: translateX(56px); }',
    '.hh-quote.reveal:not(.visible) { transform: translateY(34px) scale(0.97); }',
    '.hh-tl-month::before { animation: rmDot 2.4s ease-in-out infinite; }',
    '@keyframes rmDot { 0%,100% { opacity: .45; transform: scale(1);} 50% { opacity: 1; transform: scale(1.3);} }',
    '.hairline-card, .wu-tile { transition: opacity .7s cubic-bezier(0.32,0.72,0,1), transform .7s cubic-bezier(0.32,0.72,0,1); }'
  ].join('\n');
  document.head.appendChild(slideCSS);

  document.querySelectorAll('.hh-tl-grid, .hh-grid, .hh-quotes-grid, .hh-stats-grid, .wu-tiles, .hairline-grid, .steps-grid, .stats-inner').forEach(function (grid) {
    Array.prototype.forEach.call(grid.children, function (el, i) {
      el.style.transitionDelay = (i * 0.13) + 's';
    });
  });

  /* index grids without a reveal system: give them one */
  var needsReveal = document.querySelectorAll('.hairline-card');
  if (needsReveal.length) {
    var rvIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        rvIO.unobserve(en.target);
        en.target.style.opacity = '1';
        en.target.style.transform = 'none';
      });
    }, { threshold: 0.15 });
    needsReveal.forEach(function (el) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      rvIO.observe(el);
    });
  }

  /* ── Floating decision dock (line pages): CTA at every scroll depth ── */
  var lineHero = document.querySelector('.hh-hero');
  if (lineHero) {
    var priceEl = document.querySelector('.hh-hero-note strong');
    var price = priceEl ? priceEl.textContent.trim() : '';
    var dockCSS = document.createElement('style');
    dockCSS.textContent = [
      '.rm-dock { position: fixed; left: 50%; bottom: 22px; z-index: 300;',
      "  display: flex; align-items: center; gap: 18px; padding: 9px 9px 9px 24px;",
      '  border-radius: 100px; background: rgba(13,20,16,0.93); color: #F5F7F5;',
      '  backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);',
      '  box-shadow: 0 24px 48px rgba(0,0,0,0.35);',
      "  font-family: 'Outfit', sans-serif; font-size: 14px; white-space: nowrap;",
      '  transform: translate(-50%, 150%); transition: transform .6s cubic-bezier(0.32, 0.72, 0, 1); }',
      '.rm-dock.rm-dock-on { transform: translate(-50%, 0); }',
      '.rm-dock-info { color: rgba(245,247,245,0.75); }',
      '.rm-dock-info strong { color: #FFFFFF; font-weight: 600; }',
      '.rm-dock-btn { background: #DCFCE7; color: #0D1410; padding: 11px 22px; border-radius: 100px;',
      '  font-weight: 600; text-decoration: none; transition: transform .4s cubic-bezier(0.32,0.72,0,1); }',
      '.rm-dock-btn:hover { transform: translateY(-1px); }',
      '@media (max-width: 640px) { .rm-dock-info span { display: none; } }'
    ].join('\n');
    document.head.appendChild(dockCSS);

    var dock = document.createElement('div');
    dock.className = 'rm-dock';
    dock.innerHTML =
      '<span class="rm-dock-info"><strong>' + (price ? 'From ' + price : 'Rift') + '</strong><span> · provider review in 24h</span></span>' +
      '<a class="rm-dock-btn" href="' + (window.RIFT_START_URL || 'index.html#pricing') + '">Start free visit →</a>';
    document.body.appendChild(dock);

    var dockShown = false;
    window.addEventListener('scroll', function () {
      var show = window.scrollY > lineHero.offsetTop + lineHero.offsetHeight * 0.9;
      if (show !== dockShown) {
        dockShown = show;
        dock.classList.toggle('rm-dock-on', show);
      }
    }, { passive: true });
  }
})();


/* ── Motion v2: 3D scroll entrances, image depth parallax, kinetic marquee ── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var css = document.createElement('style');
  css.textContent = [
    /* 3D perspective entrances — upgrade both existing reveal systems */
    '.fade-up { opacity: 0; transform: perspective(1000px) translateY(46px) rotateX(9deg) scale(0.985);',
    '  transform-origin: 50% 100%;',
    '  transition: opacity .9s cubic-bezier(0.16,1,0.3,1), transform .9s cubic-bezier(0.16,1,0.3,1); }',
    '.fade-up.visible { opacity: 1; transform: none; }',
    '.reveal { transform: perspective(1000px) translateY(42px) rotateX(8deg); transform-origin: 50% 100%;',
    '  transition: opacity .85s cubic-bezier(0.16,1,0.3,1), transform .85s cubic-bezier(0.16,1,0.3,1); }',
    '.reveal.visible { transform: none; }',
    '.hh-tl-step.reveal:not(.visible) { transform: perspective(1000px) translateX(52px) rotateY(-7deg); }',
    '.hh-quote.reveal:not(.visible) { transform: perspective(1000px) translateY(36px) rotateX(9deg) scale(0.97); }',
    '.rm-para { will-change: transform; }',
    /* kinetic marquee (one per page) */
    '.rm-marq { overflow: hidden; }',
    '.rm-marq p { display: inline-flex; white-space: nowrap; font-size: 12px; letter-spacing: 0.2em;',
    '  animation: rmMarq 30s linear infinite; will-change: transform; }',
    '.rm-marq p > span { padding-right: 56px; }'
  ].join('\n') + '\n@keyframes rmMarq { from { transform: translateX(0); } to { transform: translateX(-50%); } }';
  document.head.appendChild(css);

  /* ── Depth parallax: large imagery drifts against scroll while in view ── */
  var paraTargets = document.querySelectorAll(
    '.hairline-card-img img, .hh-life-img img, .hh-hero-visual img'
  );
  if (paraTargets.length) {
    var active = [];
    var pIO = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var i = active.indexOf(en.target);
        if (en.isIntersecting && i === -1) active.push(en.target);
        if (!en.isIntersecting && i !== -1) active.splice(i, 1);
      });
    }, { rootMargin: '80px 0px' });
    paraTargets.forEach(function (img) {
      img.classList.add('rm-para');
      pIO.observe(img);
    });
    (function pLoop() {
      requestAnimationFrame(pLoop);
      var vh = window.innerHeight;
      for (var i = 0; i < active.length; i++) {
        var img = active[i];
        var r = img.getBoundingClientRect();
        var prog = (r.top + r.height / 2 - vh / 2) / vh; /* -0.5..0.5 around center */
        img.style.transform = 'translateY(' + (prog * -24).toFixed(1) + 'px)';
      }
    })();
  }

  /* ── Kinetic marquee: the treatments label bar scrolls endlessly ── */
  var bar = document.querySelector('.ra-label-bar p');
  if (bar) {
    bar.parentElement.classList.add('rm-marq');
    var seg = '<span>' + bar.innerHTML + '</span>';
    bar.innerHTML = seg + seg + seg + seg;
  }

  /* ── Deeper grid stagger for pricing + FAQ (index) ── */
  document.querySelectorAll('.pr-grid, .faq-grid, .why-grid').forEach(function (grid) {
    Array.prototype.forEach.call(grid.children, function (el, i) {
      el.style.transitionDelay = (i * 0.11) + 's';
    });
  });
})();
/* ── Motion v3: scroll-scrub scenes (kinetic rows, curtain reveal, fill text) + deck slider ── */
(function () {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  function clamp01(v) { return Math.max(0, Math.min(1, v)); }

  /* shared scrub ticker: progress 0..1 as the element crosses the viewport */
  var scrubs = [];
  function addScrub(el, fn) { scrubs.push({ el: el, fn: fn }); }
  (function sTick() {
    requestAnimationFrame(sTick);
    if (!scrubs.length) return;
    var vh = window.innerHeight;
    for (var i = 0; i < scrubs.length; i++) {
      var r = scrubs[i].el.getBoundingClientRect();
      if (r.bottom < -120 || r.top > vh + 120) continue;
      scrubs[i].fn(clamp01((vh - r.top) / (vh + r.height)), r);
    }
  })();

  /* kinetic type rows: counter-sliding giant category names */
  var kin = document.querySelector('.rk-kinetic');
  if (kin) {
    var rowA = kin.querySelector('.rk-row-a');
    var rowB = kin.querySelector('.rk-row-b');
    addScrub(kin, function (p) {
      var t = (p - 0.5) * 22;
      if (rowA) rowA.style.transform = 'translateX(' + (-10 - t) + '%)';
      if (rowB) rowB.style.transform = 'translateX(' + (-10 + t) + '%)';
    });
  }

  /* curtain reveal: clipped banner opens as it crosses the viewport */
  var curtain = document.querySelector('.rk-curtain-clip');
  if (curtain) {
    var cImg = curtain.querySelector('img');
    var cCap = curtain.querySelector('.rk-curtain-cap');
    addScrub(curtain, function (p) {
      var q = clamp01((p - 0.12) / 0.42);
      var e = 1 - Math.pow(1 - q, 3);
      curtain.style.clipPath = 'inset(' + (16 * (1 - e)) + '% ' + (22 * (1 - e)) + '% round ' + (32 * (1 - e) + 6) + 'px)';
      if (cImg) cImg.style.transform = 'scale(' + (1.18 - 0.16 * e) + ')';
      if (cCap) cCap.classList.toggle('on', e > 0.85);
    });
  }

  /* fill-on-scroll manifesto: words ink in one by one */
  var fillEl = document.getElementById('rk-fill-text');
  if (fillEl) {
    var accentStart = -1, parts = [];
    var src = fillEl.querySelector('.rk-accent-src');
    var lead = fillEl.childNodes[0] ? fillEl.childNodes[0].textContent : fillEl.textContent;
    var leadWords = lead.trim().split(/\s+/);
    var accWords = src ? src.textContent.trim().split(/\s+/) : [];
    fillEl.innerHTML = leadWords.map(function (w) { return '<span class="rk-w">' + w + '</span>'; }).join(' ') +
      (accWords.length ? ' ' + accWords.map(function (w) { return '<span class="rk-w rk-accent">' + w + '</span>'; }).join(' ') : '');
    var words = fillEl.querySelectorAll('.rk-w');
    addScrub(fillEl, function (p) {
      var q = clamp01((p - 0.25) / 0.4);
      var lit = Math.round(q * words.length);
      for (var i = 0; i < words.length; i++) words[i].classList.toggle('on', i < lit);
    });
  }

  /* ── Deck slider: testimonial grids become an auto-advancing stacked deck ── */
  var deckCSS = document.createElement('style');
  deckCSS.textContent = [
    'html, body { overflow-x: clip; }',
    '.rk-deck { position: relative; display: block !important; }',
    '.rk-deck > * { position: absolute; top: 0; left: 50%; width: min(560px, 92%);',
    '  cursor: pointer; will-change: transform, opacity; }',
    '.how-steps.rk-deck::before { display: none; }',
    '.rk-deck-hint { text-align: center; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase;',
    '  color: rgba(13,20,16,0.4); margin-top: 18px; }'
  ].join('\n');
  document.head.appendChild(deckCSS);

  function deckify(sel, hintText) {
    var grid = document.querySelector(sel);
    if (!grid || grid.children.length < 3) return;
    var cards = Array.prototype.slice.call(grid.children);
    var h = 0;
    cards.forEach(function (c) { h = Math.max(h, c.offsetHeight); });
    if (!h) return;
    grid.classList.add('rk-deck');
    grid.style.minHeight = (h + 64) + 'px';
    cards.forEach(function (c) {
      c.classList.add('visible');
      c.style.opacity = '';
      c.style.transition = 'transform .75s cubic-bezier(0.32,0.72,0,1), opacity .55s ease';
    });
    var order = cards.slice();
    function layout() {
      order.forEach(function (c, i) {
        c.style.zIndex = order.length - i;
        var rot = (i % 2 ? 1 : -1) * i * 2.2;
        c.style.transform = 'translateX(-50%) translateY(' + (i * 18) + 'px) scale(' + (1 - i * 0.055) + ') rotate(' + rot + 'deg)';
        c.style.opacity = i > 2 ? 0 : String(1 - i * 0.06);
      });
    }
    layout();
    var busy = false;
    function advance() {
      if (busy) return;
      busy = true;
      var front = order.shift();
      order.push(front);
      front.style.transform = 'translateX(-160%) rotate(-11deg)';
      front.style.opacity = '0';
      setTimeout(function () { layout(); busy = false; }, 520);
    }
    var timer = null, inView = false, hovering = false;
    function play() { if (!timer && inView && !hovering) timer = setInterval(advance, 4200); }
    function stop() { clearInterval(timer); timer = null; }
    /* start cycling only once the deck is on screen, so card 1 is always what you arrive to */
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      inView ? play() : stop();
    }, { threshold: 0.35 }).observe(grid);
    grid.addEventListener('mouseenter', function () { hovering = true; stop(); });
    grid.addEventListener('mouseleave', function () { hovering = false; play(); });
    grid.addEventListener('click', advance);
    window.addEventListener('resize', function () {
      var mh = 0;
      order.forEach(function (c) { mh = Math.max(mh, c.offsetHeight); });
      if (mh) grid.style.minHeight = (mh + 64) + 'px';
    });
    var hint = document.createElement('p');
    hint.className = 'rk-deck-hint';
    hint.textContent = hintText || 'Tap to see the next story';
    grid.parentElement.insertBefore(hint, grid.nextSibling);
  }
  if (document.readyState === 'complete') { deckify('.testimonials-grid'); deckify('.hh-quotes-grid'); deckify('.how-steps', 'Tap for the next step'); }
  else window.addEventListener('load', function () { deckify('.testimonials-grid'); deckify('.hh-quotes-grid'); deckify('.how-steps', 'Tap for the next step'); });
})();
/* ── Motion v4: orbital hero cards, SVG curtain page transition, mosaic scrub ── */
(function () {
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── Orbital hero: cards bob, sway and follow the cursor at different depths ── */
  var heroCards = document.querySelectorAll('.rh2-card');
  if (heroCards.length && !reduce) {
    var meta = [
      { ry: 26, rz: -7, d: 1.15, ph: 0.0 },
      { ry: 18, rz: 6, d: 0.7, ph: 1.7 },
      { ry: -26, rz: 8, d: 1.0, ph: 3.1 },
      { ry: -18, rz: -6, d: 0.8, ph: 4.4 },
      { ry: -12, rz: 5, d: 1.35, ph: 2.2 },
      { ry: 12, rz: -5, d: 1.25, ph: 5.3 }
    ];
    var hmx = 0, hmy = 0, hcx = 0, hcy = 0;
    window.addEventListener('mousemove', function (e) {
      hmx = e.clientX / window.innerWidth - 0.5;
      hmy = e.clientY / window.innerHeight - 0.5;
    }, { passive: true });
    (function hLoop() {
      requestAnimationFrame(hLoop);
      var t = performance.now() / 1000;
      hcx += (hmx - hcx) * 0.045;
      hcy += (hmy - hcy) * 0.045;
      for (var i = 0; i < heroCards.length; i++) {
        var m = meta[i] || meta[0];
        heroCards[i].style.transform =
          'translate3d(' + (hcx * m.d * 26) + 'px,' + (hcy * m.d * 16 + Math.sin(t * 0.55 + m.ph) * 9) + 'px,0)' +
          ' rotateY(' + (m.ry + Math.sin(t * 0.4 + m.ph) * 5 + hcx * m.d * 8) + 'deg)' +
          ' rotateZ(' + (m.rz + Math.sin(t * 0.3 + m.ph * 1.3) * 1.6) + 'deg)';
      }
    })();
  }

  /* ── Mosaic scrub: tiles drift at their own depth while the title holds center ── */
  var mosaics = document.querySelectorAll('.rk-mosaic');
  if (mosaics.length && !reduce) {
    mosaics.forEach(function (sec) {
      var tiles = Array.prototype.map.call(sec.querySelectorAll('.rk-mo-tile'), function (t) {
        return { el: t, d: parseFloat(t.getAttribute('data-depth')) || 0.5 };
      });
      var title = sec.querySelector('.rk-mo-title');
      (function mLoop() {
        requestAnimationFrame(mLoop);
        var vh = window.innerHeight;
        var r = sec.getBoundingClientRect();
        if (r.bottom < -100 || r.top > vh + 100) return;
        var p = (vh - r.top) / (vh + r.height) - 0.5; /* -0.5 .. 0.5 */
        for (var i = 0; i < tiles.length; i++) {
          tiles[i].el.style.transform = 'translateY(' + (p * tiles[i].d * -320) + 'px)';
        }
        if (title) title.style.transform = 'translate(-50%, -50%) translateY(' + (p * 40) + 'px)';
      })();
    });
  }

  /* ── SVG curtain page transition (animmaster "Animated SVG Path" recreation) ── */
  var PT_MS = 520;
  function buildOverlay(covered) {
    var wrap = document.createElement('div');
    wrap.id = 'rk-pt';
    wrap.setAttribute('aria-hidden', 'true');
    wrap.style.cssText = 'position:fixed;inset:0;z-index:900;pointer-events:none;';
    wrap.innerHTML =
      '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;">' +
      '<path id="rk-pt-back" fill="#A7D3B4" d="M0,120 L100,120 L100,120 Q50,120 0,120 Z"/>' +
      '<path id="rk-pt-front" fill="#14532D" d="M0,120 L100,120 L100,120 Q50,120 0,120 Z"/>' +
      '</svg>' +
      '<img src="product-images/rift-logo.png" alt="" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);height:34px;filter:invert(1);opacity:0;transition:opacity .25s ease;">';
    document.body.appendChild(wrap);
    if (covered) {
      wrap.querySelector('#rk-pt-back').setAttribute('d', 'M0,-20 L100,-20 L100,120 L0,120 Z');
      wrap.querySelector('#rk-pt-front').setAttribute('d', 'M0,-20 L100,-20 L100,120 L0,120 Z');
    }
    return wrap;
  }
  function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  /* curtain rising from the bottom: leading edge bulges upward mid-flight */
  function curtainUp(path, t) {
    var y = 110 - 130 * t;               /* 110 -> -20 */
    var b = 22 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    path.setAttribute('d', 'M0,' + y + ' Q50,' + (y - b) + ' 100,' + y + ' L100,120 L0,120 Z');
  }
  /* curtain lifting away upward: trailing edge bulges downward */
  function curtainAway(path, t) {
    var y = 110 - 130 * t;               /* bottom edge 110 -> -20 */
    var b = 22 * Math.sin(Math.PI * Math.min(1, Math.max(0, t)));
    path.setAttribute('d', 'M0,-20 L100,-20 L100,' + y + ' Q50,' + (y + b) + ' 0,' + y + ' Z');
  }
  function animatePaths(wrap, mode, done) {
    var back = wrap.querySelector('#rk-pt-back');
    var front = wrap.querySelector('#rk-pt-front');
    var logo = wrap.querySelector('img');
    var t0 = performance.now();
    var fn = mode === 'cover' ? curtainUp : curtainAway;
    (function step(now) {
      var q = Math.min(1, (now - t0) / PT_MS);
      var lag = Math.min(1, Math.max(0, q * 1.25 - 0.25));
      if (mode === 'cover') { fn(back, q); fn(front, lag); }
      else { fn(front, q); fn(back, lag); }
      if (logo) logo.style.opacity = (mode === 'cover' ? q > 0.6 : q < 0.3) ? '1' : '0';
      if (q < 1 || lag < 1) requestAnimationFrame(step);
      else done && done();
    })(t0);
  }
  var navigating = false;
  if (!reduce) {
    /* arriving on a page mid-transition: start covered, lift away */
    var arrived = false;
    try { arrived = sessionStorage.getItem('riftPT') === '1'; } catch (e) {}
    if (arrived) {
      try { sessionStorage.removeItem('riftPT'); } catch (e) {}
      var w = buildOverlay(true);
      setTimeout(function () {
        animatePaths(w, 'reveal', function () { w.remove(); });
      }, 60);
    }
    document.addEventListener('click', function (e) {
      if (navigating || e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest ? e.target.closest('a') : null;
      if (!a || a.target === '_blank') return;
      var href = a.getAttribute('href') || '';
      if (!/^[a-z0-9-]+\.html(#[a-z0-9-]*)?$/i.test(href)) return; /* internal pages only */
      e.preventDefault();
      navigating = true;
      try { sessionStorage.setItem('riftPT', '1'); } catch (e2) {}
      var w = buildOverlay(false);
      animatePaths(w, 'cover', function () { location.href = href; });
    }, true);
    window.addEventListener('pageshow', function (ev) {
      if (ev.persisted) { /* bfcache return: clear any stuck overlay */
        navigating = false;
        var w = document.getElementById('rk-pt');
        if (w) w.remove();
      }
    });
  }
})();
