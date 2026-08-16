/* Rift mobile — burger menu + small-screen optimizations (always on, all pages). */
(function () {
  var nav = document.querySelector('.nav-inner');
  if (!nav) return;

  var LINKS = [
    ['Home', 'index.html'],
    ['The Rift Journey', 'journey.html'],
    ['Weight Loss', 'weight.html'],
    ['Longevity', 'longevity.html'],
    ['Hair', 'hair.html'],
    ['Skin', 'skin.html'],
    ['How It Works', 'index.html#how'],
    ['Why Us', 'index.html#why-us'],
    ['Pricing', 'index.html#pricing']
  ];

  var css = document.createElement('style');
  css.textContent = [
    '.rmb-burger { display: none; width: 44px; height: 44px; border: none; background: transparent;',
    '  cursor: pointer; position: relative; z-index: 260; padding: 10px; flex-shrink: 0; }',
    '.rmb-burger span { display: block; width: 24px; height: 2px; background: #171D18; border-radius: 2px;',
    '  margin: 5px auto; transition: transform .35s cubic-bezier(0.32,0.72,0,1), opacity .25s ease; }',
    '.rmb-open .rmb-burger span:nth-child(1) { transform: translateY(7px) rotate(45deg); }',
    '.rmb-open .rmb-burger span:nth-child(2) { opacity: 0; }',
    '.rmb-open .rmb-burger span:nth-child(3) { transform: translateY(-7px) rotate(-45deg); }',
    '.rmb-panel { position: fixed; inset: 0; z-index: 250; background: rgba(247,243,236,0.97);',
    '  -webkit-backdrop-filter: blur(18px); backdrop-filter: blur(18px);',
    '  display: flex; flex-direction: column; justify-content: center; padding: 32px 36px;',
    '  opacity: 0; pointer-events: none; transition: opacity .35s ease; }',
    '.rmb-open .rmb-panel { opacity: 1; pointer-events: auto; }',
    '.rmb-panel a.rmb-link { font-family: "Playfair Display", Georgia, serif; font-size: 2rem; font-weight: 600;',
    '  color: #171D18; text-decoration: none; padding: 12px 0; opacity: 0; transform: translateY(16px);',
    '  transition: opacity .45s cubic-bezier(0.32,0.72,0,1), transform .45s cubic-bezier(0.32,0.72,0,1); }',
    '.rmb-open .rmb-panel a.rmb-link { opacity: 1; transform: none; }',
    '.rmb-panel a.rmb-cta { margin-top: 28px; display: inline-flex; align-self: flex-start;',
    '  background: #166534; color: #F5F7F5; font-family: "Outfit", sans-serif; font-weight: 600;',
    '  font-size: 16px; padding: 15px 30px; border-radius: 100px; text-decoration: none;',
    '  opacity: 0; transform: translateY(16px); transition: opacity .45s ease, transform .45s ease; }',
    '.rmb-open .rmb-panel a.rmb-cta { opacity: 1; transform: none; }',
    '@media (max-width: 900px) {',
    '  html, body { overflow-x: hidden; }',
    '  .rh-eyebrow { max-width: calc(100vw - 48px); white-space: normal; text-align: center; justify-content: center; letter-spacing: 0.18em; }',
    '  .rmb-burger { display: block; }',
    '  .nav-inner > nav, .nav-links { display: none !important; }',
    '  .nav-cta .btn-ghost { display: none; }',
    '  .announcement { font-size: 11px; padding: 8px 14px; line-height: 1.45; }',
    '}',
    '@media (max-width: 700px) {',
    '  .cat-menu-inner { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; overflow: visible; padding: 30px 10px 12px !important; }',
    '  .cat-item { width: auto; min-width: 0; padding: 25px 3px 8px; border-radius: 14px; gap: 1px; }',
    '  .cat-item img { height: 44px; top: -19px; }',
    '  .cat-item:hover img, .cat-soon-item:hover img { transform: translateX(-50%); }',
    '  .cat-name { font-size: 9.5px; line-height: 1.2; white-space: normal; }',
    '  .cat-price { display: none; }',
    '  .cat-soon-chip { top: -13px; right: -2px; font-size: 7px; padding: 2px 6px; box-shadow: none; }',
    '}',
    '@media (max-width: 390px) { .rh-swap-wrap { font-size: 2.55rem; } }',
    '.rmb-close { position: absolute; top: 16px; right: 16px; width: 48px; height: 48px;',
    '  border: 1px solid rgba(23,29,24,0.15); border-radius: 50%; background: #FFFFFF;',
    '  color: #171D18; font-size: 26px; line-height: 1; cursor: pointer;',
    '  display: flex; align-items: center; justify-content: center; }',
    'body.rmb-lock { overflow: hidden; }'
  ].join('\n');
  document.head.appendChild(css);

  var burger = document.createElement('button');
  burger.className = 'rmb-burger';
  burger.setAttribute('aria-label', 'Open menu');
  burger.setAttribute('aria-expanded', 'false');
  burger.innerHTML = '<span></span><span></span><span></span>';
  nav.appendChild(burger);

  var panel = document.createElement('div');
  panel.className = 'rmb-panel';
  panel.setAttribute('aria-hidden', 'true');
  var html = '';
  LINKS.forEach(function (l, i) {
    html += '<a class="rmb-link" style="transition-delay:' + (0.05 + i * 0.05) + 's" href="' + l[1] + '">' + l[0] + '</a>';
  });
  html += '<a class="rmb-cta" style="transition-delay:' + (0.05 + LINKS.length * 0.05) + 's" href="' + (window.RIFT_START_URL || 'index.html#pricing') + '">Start your free visit →</a>';
  panel.innerHTML = html;
  var closeBtn = document.createElement('button');
  closeBtn.className = 'rmb-close';
  closeBtn.setAttribute('aria-label', 'Close menu');
  closeBtn.innerHTML = '&times;';
  panel.appendChild(closeBtn);
  document.body.appendChild(panel);
  closeBtn.addEventListener('click', function () { setOpen(false); });

  function setOpen(open) {
    document.documentElement.classList.toggle('rmb-open', open);
    document.body.classList.toggle('rmb-lock', open);
    burger.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
  }
  burger.addEventListener('click', function () {
    setOpen(!document.documentElement.classList.contains('rmb-open'));
  });
  panel.addEventListener('click', function (e) {
    if (e.target.tagName === 'A') setOpen(false); // close on navigation (incl. same-page anchors)
  });
  window.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') setOpen(false);
  });
  if (location.hash === '#menu') setOpen(true);

  /* ── Responsive tables: stack rows on phones instead of side-scrolling ── */
  var tblCSS = document.createElement('style');
  tblCSS.textContent = [
    '@media (max-width: 700px) {',
    '  table.rmb-stack { min-width: 0 !important; width: 100%; }',
    '  table.rmb-stack thead { display: none; }',
    '  table.rmb-stack tr { display: block; padding: 14px 18px; border-bottom: 1px solid rgba(23,29,24,0.08); }',
    '  table.rmb-stack tr:last-child { border-bottom: none; }',
    '  table.rmb-stack td { display: block; padding: 3px 0 !important; border: none !important; text-align: left !important; }',
    '  table.rmb-stack td:first-child { font-weight: 700; font-size: 0.72rem !important; letter-spacing: 0.12em; text-transform: uppercase; opacity: 0.55; margin-bottom: 2px; }',
    '  table.rmb-stack td[data-label]::before { content: attr(data-label); display: inline-block; min-width: 86px; font-size: 0.68rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; opacity: 0.5; margin-right: 8px; }',
    '}'
  ].join('\n');
  document.head.appendChild(tblCSS);

  document.querySelectorAll('.hh-table-wrap table, .wu-table-wrap table, .wu-table').forEach(function (tbl) {
    tbl.classList.add('rmb-stack');
    var heads = Array.prototype.map.call(tbl.querySelectorAll('thead th'), function (th) {
      return th.textContent.trim();
    });
    tbl.querySelectorAll('tbody tr').forEach(function (tr) {
      Array.prototype.forEach.call(tr.children, function (td, i) {
        if (i > 0 && heads[i]) td.setAttribute('data-label', heads[i]);
      });
    });
  });
})();

