/* =====================================================================
   Salim Sadman · shared behaviour for every page.
   Content (photos, videos, build logs, certificates) lives in
   data/content.js — you don't need to edit this file.
   ===================================================================== */
(() => {
  'use strict';
  const d = document, root = d.documentElement, body = d.body, NS = 'http://www.w3.org/2000/svg';
  const $ = (s, c = d) => c.querySelector(s);
  const $$ = (s, c = d) => Array.from(c.querySelectorAll(s));
  const mqReduce = matchMedia('(prefers-reduced-motion: reduce)');
  let reduce = mqReduce.matches;
  const SITE = window.SITE || {};
  const PROJECTS = SITE.projects || {};
  const CERTS = (SITE.certificates || []).filter(c => c && c.id && c.image);
  const ROOT = body.dataset.root || '';
  const url = p => !p ? '' : (/^([a-z]+:)?\/\//i.test(p) || /^(data|mailto|blob):/i.test(p) || p[0] === '/' || p[0] === '#') ? p : ROOT + p;
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
  const svgEl = (tag, attrs, parent) => {
    const n = d.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };
  const icon = id => `<svg class="ic" aria-hidden="true"><use href="#${id}"/></svg>`;
  const PLAY = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z"/></svg>';
  const ytId = v => {
    v = (v || '').trim(); if (!v) return '';
    const m = v.match(/(?:youtu\.be\/|[?&]v=|embed\/|shorts\/|live\/|\/video\/)([\w-]{11})/);
    return m ? m[1] : (/^[\w-]{11}$/.test(v) ? v : '');
  };
  const ytThumb = id => `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
  const certCaption = c => [c.title, c.issuer, c.date].filter(Boolean).join(' · ');

  /* ---------------- Toast + clipboard ---------------- */
  const toastEl = $('.toast');
  let toastTimer;
  function toast(msg) {
    if (!toastEl) return;
    toastEl.innerHTML = icon('i-check') + '<span></span>';
    toastEl.lastChild.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2000);
  }
  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; }
    catch (e) {
      const ta = d.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;opacity:0';
      d.body.appendChild(ta); ta.select();
      let ok = false; try { ok = d.execCommand('copy'); } catch (_) {}
      ta.remove(); return ok;
    }
  }

  /* ---------------- Lightbox (photos, certificates, videos) ---------------- */
  const lb = $('#lightbox'), lbBody = lb && $('.lb-body', lb), lbCap = lb && $('.lb-cap', lb), lbLink = lb && $('.lb-link', lb);
  function openLightbox({ src, alt, video, caption, cc, pdf }) {
    if (!lb) return;
    lbBody.textContent = '';
    lb.classList.toggle('is-image', !video);
    if (video) {
      const w = d.createElement('div'); w.className = 'lb-video';
      const f = d.createElement('iframe');
      /* Same permissions as YouTube's own embed code: clipboard-write makes "Copy link" work */
      f.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
      f.setAttribute('referrerpolicy', 'strict-origin-when-cross-origin');
      f.allowFullscreen = true;
      f.title = caption || 'YouTube video player';
      f.src = `https://www.youtube.com/embed/${video}?autoplay=1&rel=0&playsinline=1` + (cc ? `&cc_load_policy=1&cc_lang_pref=${encodeURIComponent(cc)}` : '');
      w.appendChild(f); lbBody.appendChild(w);
      lbLink.href = `https://youtu.be/${video}`;
      lbLink.innerHTML = 'Watch in full quality on YouTube' + icon('i-ext');
      lbLink.hidden = false;
    } else {
      const i = new Image(); i.src = src; i.alt = alt || ''; lbBody.appendChild(i);
      if (pdf) { lbLink.href = pdf; lbLink.innerHTML = 'Open the PDF' + icon('i-ext'); lbLink.hidden = false; }
      else lbLink.hidden = true;
    }
    lbCap.textContent = caption || alt || '';
    if (typeof lb.showModal === 'function') lb.showModal(); else lb.setAttribute('open', '');
  }
  if (lb) {
    lb.addEventListener('close', () => { lbBody.textContent = ''; });
    lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
    $('.lb-close', lb).addEventListener('click', () => lb.close());
  }

  /* =================================================================
     1. Content from data/content.js (rendered before anything else)
     ================================================================= */
  const sectionsHidden = [];
  function hideSection(sec) {
    if (!sec || sec.hidden) return;
    sec.hidden = true;
    sectionsHidden.push(sec.id);
    $$(`a[href="#${sec.id}"]`).forEach(a => { a.hidden = true; });
    renumber();
  }
  function renumber() {
    let n = 0;
    $$('main > section').forEach(s => {
      const num = $('.sec-num', s);
      if (!num || s.hidden) return;
      n += 1; num.textContent = String(n).padStart(2, '0');
    });
    $$('.mobile-menu a').forEach(a => {
      const id = (a.getAttribute('href') || '').split('#')[1];
      const s = id && d.getElementById(id), num = s && $('.sec-num', s), sp = $('span', a);
      if (sp && num) sp.textContent = num.textContent;
    });
  }

  /* Project covers: one photo or video per project, shared by the home card and the project page */
  $$('[data-cover]').forEach(slot => {
    const p = PROJECTS[slot.dataset.cover]; if (!p) return;
    const c = p.cover || {}, vid = ytId(c.video);
    if (!slot.dataset.alt) slot.dataset.alt = c.alt || p.title || '';
    slot.dataset.title = p.title || '';
    if (c.image) {
      slot.dataset.src = url(c.image);
      if (vid) { const host = slot.closest('article, .p-cover, figure') || slot.parentElement; host.dataset.video = c.video; }
    } else if (vid) {
      slot.dataset.src = ytThumb(vid);
      slot.dataset.play = vid;
    }
    const capEl = slot.closest('figure') && slot.closest('figure').querySelector('[data-photo-caption]');
    if (capEl && c.caption) capEl.dataset.photoCaption = c.caption;
  });

  /* Build log */
  function renderMedia(m) {
    if (!m) return null;
    if (m.video) {
      const id = ytId(m.video); if (!id) return null;
      const fig = d.createElement('figure'); fig.className = 'log-fig is-video';
      fig.innerHTML = `<a class="yt-card js-yt" href="https://youtu.be/${id}" target="_blank" rel="noopener"${m.captions ? ` data-captions="${esc(m.captions)}"` : ''}${m.caption ? ` data-title="${esc(m.caption)}"` : ''}>
        <span class="yt-thumb"><img src="${ytThumb(id)}" alt="" width="480" height="360" loading="lazy" decoding="async"><span class="yt-play" aria-hidden="true"><i>${PLAY}</i></span>${m.length ? `<span class="yt-dur">${esc(m.length)}</span>` : ''}</span>
        ${m.caption ? `<span class="yt-meta"><b>${esc(m.caption)}</b></span>` : ''}</a>`;
      return fig;
    }
    let src = m.image, cap = m.caption || '', pdf = m.pdf || '';
    if (m.certificate) {
      const c = CERTS.find(x => x.id === m.certificate); if (!c) return null;
      src = c.image; cap = cap || certCaption(c); pdf = pdf || c.pdf || '';
    }
    if (!src) return null;
    const fig = d.createElement('figure'); fig.className = 'log-fig' + (m.certificate ? ' is-cert' : '');
    fig.innerHTML = `<button class="log-thumb" type="button" aria-label="Enlarge: ${esc(cap || 'photo')}"><img src="${esc(url(src))}" alt="${esc(cap)}" loading="lazy" decoding="async"></button>${cap ? `<figcaption>${esc(cap)}</figcaption>` : ''}`;
    const img = $('img', fig);
    img.addEventListener('error', () => {
      const g = fig.parentElement; fig.remove();
      if (g && !g.children.length) g.remove(); else if (g && g.children.length === 1) g.classList.add('one');
    });
    $('button', fig).addEventListener('click', () => openLightbox({ src: img.currentSrc || img.src, alt: cap, caption: cap, pdf: pdf ? url(pdf) : '' }));
    return fig;
  }
  $$('[data-log]').forEach(list => {
    const p = PROJECTS[list.dataset.log] || {}, entries = (p.log || []).filter(Boolean);
    if (!entries.length) { hideSection(list.closest('section')); return; }
    entries.forEach(e => {
      const li = d.createElement('li'); li.className = 'log-entry reveal';
      const paras = (Array.isArray(e.text) ? e.text : [e.text]).filter(Boolean).map(t => `<p>${t}</p>`).join('');
      li.innerHTML = `<div class="log-when">${esc(e.date)}</div><div class="log-body"><h3>${esc(e.title)}</h3>${paras}</div>`;
      const media = (e.media || []).map(renderMedia).filter(Boolean);
      if (media.length) {
        const g = d.createElement('div'); g.className = 'log-media' + (media.length === 1 ? ' one' : '');
        media.forEach(x => g.appendChild(x));
        $('.log-body', li).appendChild(g);
      }
      list.appendChild(li);
    });
  });

  /* Certificates & crests: each one entered once, shown wherever it is referenced */
  function certCard(c, grid) {
    const el = d.createElement('article');
    const kind = c.kind === 'crest' ? 'crest' : 'certificate';
    el.className = 'cert'; el.dataset.kind = kind;
    const links = (c.projects || []).filter(pid => PROJECTS[pid] && PROJECTS[pid].page && pid !== body.dataset.project)
      .map(pid => `<a href="${esc(url(PROJECTS[pid].page))}">${esc(PROJECTS[pid].short || PROJECTS[pid].title)}</a>`).join('');
    el.innerHTML = `<button class="cert-thumb" type="button" aria-label="View full size: ${esc(c.title)}"><img src="${esc(url(c.image))}" alt="${esc(c.title)}" loading="lazy" decoding="async"><span class="cert-kind">${kind === 'crest' ? 'Crest' : 'Certificate'}</span></button>
      <div class="cert-body"><h3>${esc(c.title)}</h3><p class="cert-meta">${esc([c.issuer, c.date].filter(Boolean).join(' · '))}</p>${links ? `<p class="cert-links">${links}</p>` : ''}</div>`;
    const img = $('img', el);
    img.addEventListener('error', () => { el.remove(); if (grid._apply) grid._apply(false); });
    $('.cert-thumb', el).addEventListener('click', () => openLightbox({ src: img.currentSrc || img.src, alt: c.title, caption: certCaption(c), pdf: c.pdf ? url(c.pdf) : '' }));
    return el;
  }
  $$('[data-certs]').forEach(grid => {
    const sec = grid.closest('section');
    const onProject = grid.dataset.certs === 'project';
    const list = onProject ? CERTS.filter(c => (c.projects || []).includes(body.dataset.project)) : CERTS.slice();
    if (!list.length) { hideSection(sec); return; }
    list.forEach(c => grid.appendChild(certCard(c, grid)));
    const LIMIT = onProject ? 999 : +(grid.dataset.limit || 8);
    let filter = 'all', expanded = false, moreBtn = null;
    const tools = sec && $('.cert-tools', sec);
    const kinds = ['certificate', 'crest'].filter(k => list.some(c => (c.kind === 'crest' ? 'crest' : 'certificate') === k));
    if (tools && kinds.length > 1) {
      const labels = { all: 'All', certificate: 'Certificates', crest: 'Crests' };
      ['all'].concat(kinds).forEach(k => {
        const b = d.createElement('button');
        b.type = 'button'; b.className = 'chip'; b.dataset.filter = k;
        b.setAttribute('aria-pressed', String(k === 'all'));
        const n = k === 'all' ? list.length : list.filter(c => (c.kind === 'crest' ? 'crest' : 'certificate') === k).length;
        b.innerHTML = `${labels[k]} <small>${n}</small>`;
        b.addEventListener('click', () => {
          filter = k; expanded = false;
          $$('.chip', tools).forEach(x => x.setAttribute('aria-pressed', String(x === b)));
          apply(true);
        });
        tools.appendChild(b);
      });
    } else if (tools) tools.remove();
    if (!onProject) {
      const wrapM = d.createElement('div'); wrapM.className = 'cert-more';
      moreBtn = d.createElement('button'); moreBtn.type = 'button'; moreBtn.className = 'btn btn-ghost btn-sm';
      moreBtn.addEventListener('click', () => { expanded = !expanded; apply(true); });
      wrapM.appendChild(moreBtn); grid.after(wrapM);
    }
    function apply(animate) {
      const cards = $$('.cert', grid);
      if (!cards.length) { hideSection(sec); return; }
      let shown = 0, total = 0;
      cards.forEach(el => {
        const match = filter === 'all' || el.dataset.kind === filter;
        if (match) total += 1;
        const on = match && (expanded || shown < LIMIT);
        if (on) shown += 1;
        el.classList.toggle('is-off', !on);
        if (on && animate && !reduce) { el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop'); }
      });
      if (moreBtn) { moreBtn.hidden = total <= LIMIT; moreBtn.textContent = expanded ? 'Show fewer' : `Show all ${total}`; }
    }
    grid._apply = apply;
    apply(false);
  });

  /* Award rows get a "View certificate" / "View crest" button for each matching item whose image exists */
  const awardRows = $$('[data-award]');
  if (awardRows.length && CERTS.length) {
    const aio = new IntersectionObserver(entries => entries.forEach(en => {
      if (!en.isIntersecting) return;
      aio.unobserve(en.target);
      const row = en.target, host = $('div', row) || row;
      const items = CERTS.filter(x => x.award === row.dataset.award);
      if (!items.length) return;
      const wrapB = d.createElement('span'); wrapB.className = 'award-certs'; wrapB.hidden = true;
      host.appendChild(wrapB);
      items.forEach((c, i) => {
        const probe = new Image();
        probe.onload = () => {
          const b = d.createElement('button');
          b.type = 'button'; b.className = 'award-cert'; b.style.order = i;
          b.innerHTML = icon('i-award') + (c.kind === 'crest' ? 'View crest' : 'View certificate');
          b.addEventListener('click', () => openLightbox({ src: probe.src, alt: c.title, caption: certCaption(c), pdf: c.pdf ? url(c.pdf) : '' }));
          wrapB.appendChild(b); wrapB.hidden = false;
        };
        probe.src = url(c.image);
      });
    }), { rootMargin: '300px 0px' });
    awardRows.forEach(r => aio.observe(r));
  }

  /* "More projects" on project pages */
  $$('[data-more]').forEach(more => {
    const here = body.dataset.project;
    Object.keys(PROJECTS).filter(id => id !== here).forEach(id => {
      const p = PROJECTS[id]; if (!p || !p.page) return;
      const cov = p.cover || {}, vid = ytId(cov.video);
      const src = cov.image ? url(cov.image) : (vid ? ytThumb(vid) : '');
      const a = d.createElement('a');
      a.className = 'more-card reveal'; a.href = url(p.page); a.dataset.tone = p.tone || 'ink';
      a.innerHTML = `<span class="more-cover"><span class="glyph">${icon(p.icon || 'i-gear')}</span>${src ? `<img src="${esc(src)}" alt="" loading="lazy" decoding="async">` : ''}</span>
        <span class="more-body"><span class="eyebrow">${esc(p.kicker || '')}</span><b>${esc(p.title)}</b><span class="more-go">Build log ${icon('i-arrow')}</span></span>`;
      const img = $('img', a); if (img) img.addEventListener('error', () => img.remove());
      /* Same name as that project's cover, so the picture glides into place on the next page */
      $('.more-cover', a).style.viewTransitionName = 'cover-' + id;
      more.appendChild(a);
    });
    if (!more.children.length) hideSection(more.closest('section'));
  });
  renumber();

  /* =================================================================
     2. Page behaviour
     ================================================================= */

  /* ---------------- Theme (circular reveal where supported) ---------------- */
  const themeBtn = $('.theme-toggle'), themeMeta = $('meta[name="theme-color"]');
  let activeId = '';
  function applyTheme(t) {
    root.setAttribute('data-theme', t);
    try { localStorage.setItem('theme', t); } catch (e) {}
    if (themeBtn) themeBtn.setAttribute('aria-label', t === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
    if (themeMeta) themeMeta.setAttribute('content', t === 'dark' ? '#0a1120' : '#f6f5f0');
    if (activeId) setTone(activeId);
  }
  if (themeBtn) {
    applyTheme(root.getAttribute('data-theme') || 'light');
    themeBtn.addEventListener('click', e => {
      const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      if (!d.startViewTransition || reduce) { applyTheme(next); return; }
      const r = themeBtn.getBoundingClientRect();
      const x = e.clientX || r.left + r.width / 2, y = e.clientY || r.top + r.height / 2;
      const end = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
      root.classList.add('vt-theme');
      const vt = d.startViewTransition(() => applyTheme(next));
      vt.ready.then(() => {
        root.animate({ clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${end}px at ${x}px ${y}px)`] },
          { duration: 600, easing: 'cubic-bezier(.2,.7,.2,1)', pseudoElement: '::view-transition-new(root)' });
      }).catch(() => {});
      vt.finished.finally(() => root.classList.remove('vt-theme'));
    });
  }

  /* ---------------- Nav: shadow, progress bar, back-to-top ring, timelines ---------------- */
  const nav = $('.nav'), bar = $('.progress span'), toTop = $('.to-top'), ring = toTop && $('.ring circle', toTop);
  const RING = 2 * Math.PI * 23;
  const lines = $$('.timeline, .log').map(el => ({ el, items: $$('.tl-item, .log-entry', el) }));
  let ticking = false;
  function updateLines() {
    lines.forEach(({ el, items }) => {
      const r = el.getBoundingClientRect(); if (!r.height) return;
      const p = Math.max(0, Math.min(1, (innerHeight * 0.62 - r.top) / r.height));
      el.style.setProperty('--p', p.toFixed(4));
      const reach = p * r.height;
      items.forEach(it => it.classList.toggle('passed', reach >= it.offsetTop + 12));
    });
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const y = scrollY, h = root.scrollHeight - innerHeight;
      const p = h > 0 ? Math.min(1, y / h) : 0;
      if (bar) bar.style.transform = `scaleX(${p.toFixed(4)})`;
      if (nav) nav.classList.toggle('scrolled', y > 8);
      if (toTop) { toTop.classList.toggle('show', y > 700); ring.style.strokeDashoffset = (RING * (1 - p)).toFixed(2); }
      updateLines();
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll);
  onScroll();
  if (toTop) toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));

  /* ---------------- Scrollspy: sliding indicator in the active section's colour ---------------- */
  const links = $$('.nav-links a'), mLinks = $$('.mobile-menu a'), indicator = $('.nav-indicator');
  function setTone(id) {
    const sec = id && d.getElementById(id);
    const t = sec ? getComputedStyle(sec).getPropertyValue('--t').trim() : '';
    if (t) root.style.setProperty('--nav-accent', t); else root.style.removeProperty('--nav-accent');
  }
  function setActive(id) {
    activeId = id;
    let hit = null;
    links.forEach(a => { const on = a.getAttribute('href') === '#' + id; a.classList.toggle('active', on); if (on) hit = a; });
    mLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
    if (indicator) {
      if (hit && hit.offsetParent) {
        indicator.style.left = (hit.offsetLeft + 9) + 'px';
        indicator.style.width = (hit.offsetWidth - 18) + 'px';
        indicator.style.opacity = '1';
      } else indicator.style.opacity = '0';
    }
    setTone(id);
  }
  const spy = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) setActive(en.target.id); });
  }, { rootMargin: '-45% 0px -50% 0px' });
  $$('main section[id]').forEach(s => spy.observe(s));

  /* ---------------- Mobile menu ---------------- */
  const menuBtn = $('.menu-toggle'), menu = $('#mobile-menu');
  function setMenu(open) {
    if (!menu) return;
    menu.classList.toggle('open', open);
    menu.inert = !open;
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (menuBtn && menu) {
    menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
    menu.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
    addEventListener('resize', () => { if (innerWidth > 1100) setMenu(false); });
  }

  /* ---------------- Count-up numbers ---------------- */
  function countUp(el) {
    if (el.dataset.done) return;
    el.dataset.done = '1';
    const to = +el.dataset.to, suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = to + suf; return; }
    const dur = 1500, t0 = performance.now();
    const step = t => {
      const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(to * e) + suf;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  if (!reduce) $$('.count').forEach(el => { el.textContent = '0' + (el.dataset.suffix || ''); });

  /* ---------------- Reveal on scroll ---------------- */
  const revealIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      if (!en.isIntersecting) return;
      const el = en.target;
      el.classList.add('in');
      revealIO.unobserve(el);
      $$('.count', el).forEach(countUp);
      const done = ev => {
        if (ev.target !== el) return;
        el.removeEventListener('transitionend', done);
        el.classList.add('done');
        el.classList.remove('reveal', 'in');
        el.style.removeProperty('--i');
      };
      el.addEventListener('transitionend', done);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
  $$('.reveal').forEach(el => {
    const sibs = Array.from(el.parentElement.children).filter(c => c.classList.contains('reveal'));
    el.style.setProperty('--i', Math.max(0, sibs.indexOf(el)));
    if (root.classList.contains('motion')) revealIO.observe(el);
    else $$('.count', el).forEach(countUp);
  });

  /* ---------------- Photos: show a photo when the file exists, else keep the schematic ---------------- */
  function loadSlot(slot) {
    if (slot.dataset.state) return;
    slot.dataset.state = 'loading';
    const img = new Image();
    img.decoding = 'async';
    img.alt = slot.dataset.alt || '';
    img.onload = () => {
      slot.dataset.state = 'ok';
      img.className = 'media-img';
      slot.prepend(img);
      slot.classList.add('has-img');
      slot.tabIndex = 0;
      slot.setAttribute('role', 'button');
      const vid = slot.dataset.play;
      let open;
      if (vid) {
        slot.classList.add('is-video');
        const ov = d.createElement('span'); ov.className = 'cover-play'; ov.innerHTML = `<i>${PLAY}</i>`;
        slot.appendChild(ov);
        slot.setAttribute('aria-label', 'Play video: ' + (slot.dataset.title || img.alt));
        open = () => openLightbox({ video: vid, caption: slot.dataset.title || img.alt });
      } else {
        slot.setAttribute('aria-label', 'Enlarge photo: ' + img.alt);
        open = () => openLightbox({ src: img.src, alt: img.alt });
      }
      slot._open = open;
      const cap = slot.closest('figure') && slot.closest('figure').querySelector('[data-photo-caption]');
      if (cap && !vid) cap.textContent = cap.dataset.photoCaption;
      if (slot.hasAttribute('data-optional')) {
        const fig = slot.closest('figure'); if (fig) fig.hidden = false;
        const strip = slot.closest('.photo-strip'); if (strip) strip.hidden = false;
      }
    };
    img.onerror = () => { slot.dataset.state = 'none'; };
    img.src = slot.dataset.src;
  }
  const lazyIO = new IntersectionObserver(entries => {
    entries.forEach(en => { if (en.isIntersecting) { lazyIO.unobserve(en.target); loadSlot(en.target); } });
  }, { rootMargin: '600px 0px' });
  $$('[data-src]').forEach(s => {
    /* A video cover plays even if it is clicked before its thumbnail has arrived */
    const run = () => { const f = s._open || (s.dataset.play && (() => openLightbox({ video: s.dataset.play, caption: s.dataset.title }))); if (f) f(); };
    s.addEventListener('click', e => { if (!e.target.closest('.video-btn')) run(); });
    s.addEventListener('keydown', e => { if (e.target === s && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); run(); } });
    s.hasAttribute('data-optional') ? loadSlot(s) : lazyIO.observe(s);
  });

  /* ---------------- YouTube: "Watch video" buttons and click-to-play cards ---------------- */
  $$('[data-video]').forEach(host => {
    const id = ytId(host.dataset.video); if (!id) return;
    const media = $('.media', host); if (!media || $('.video-btn', media)) return;
    const b = d.createElement('button');
    b.type = 'button'; b.className = 'video-btn';
    b.innerHTML = PLAY + 'Watch video';
    const title = ($('h3, h1', host) || {}).textContent || 'Video';
    b.addEventListener('click', e => { e.stopPropagation(); openLightbox({ video: id, caption: title.trim() }); });
    media.appendChild(b);
  });
  $$('.js-yt').forEach(a => {
    const id = ytId(a.getAttribute('href')); if (!id) return;
    const img = $('img', a), thumb = ytThumb(id);
    if (img && img.getAttribute('src') !== thumb) img.src = thumb;
    const title = a.dataset.title || (($('b', a) || {}).textContent || 'Video').trim();
    a.addEventListener('click', e => {
      if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      e.preventDefault();
      openLightbox({ video: id, caption: title, cc: a.dataset.captions });
    });
  });

  /* ---------------- Email (assembled here so scrapers don't see it) ---------------- */
  $$('.js-email').forEach(a => {
    const addr = a.dataset.u + '@' + a.dataset.d;
    a.href = 'mailto:' + addr + (a.dataset.subject ? '?subject=' + encodeURIComponent(a.dataset.subject) : '');
    if (a.hasAttribute('data-show')) a.textContent = addr;
  });
  $$('.js-copy-email').forEach(b => b.addEventListener('click', async () => {
    const addr = b.dataset.u + '@' + b.dataset.d;
    if (await copyText(addr)) toast('Email copied: ' + addr);
  }));

  /* ---------------- BibTeX panel + copy buttons ---------------- */
  $$('.js-bib-toggle').forEach(btn => {
    const panel = d.getElementById(btn.getAttribute('aria-controls'));
    panel.inert = true;
    btn.addEventListener('click', () => {
      const open = !panel.classList.contains('open');
      panel.classList.toggle('open', open);
      panel.inert = !open;
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  $$('.js-copy').forEach(b => b.addEventListener('click', async () => {
    const t = (d.getElementById(b.dataset.copyTarget) || {}).textContent;
    if (t && await copyText(t.trim())) toast(b.dataset.msg || 'Copied');
  }));

  /* ---------------- Hero: cursor spotlight on the grid + highlighted words ---------------- */
  const hero = $('.hero');
  if (hero && matchMedia('(pointer: fine)').matches && !reduce) {
    hero.addEventListener('pointermove', e => {
      const r = hero.getBoundingClientRect();
      hero.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      hero.style.setProperty('--my', (e.clientY - r.top) + 'px');
      hero.classList.add('spot-on');
    });
    hero.addEventListener('pointerleave', () => hero.classList.remove('spot-on'));
  }
  $$('.hero-lede .hl').forEach((s, i) => reduce ? s.classList.add('on') : setTimeout(() => s.classList.add('on'), 1100 + i * 300));

  /* =================================================================
     3. Animations: one loop, runs only what is on screen, pauses in hidden tabs
     ================================================================= */
  const loops = new Set();
  let raf = 0, last = 0;
  function tick(t) {
    const dt = Math.min(0.05, (t - last) / 1000 || 0);
    last = t;
    loops.forEach(l => l.step(dt, t));
    raf = loops.size ? requestAnimationFrame(tick) : 0;
  }
  function play(l, force) { if (reduce && !force) return; loops.add(l); if (!raf && !d.hidden) { last = performance.now(); raf = requestAnimationFrame(tick); } }
  function pause(l) { loops.delete(l); }
  d.addEventListener('visibilitychange', () => {
    if (d.hidden) { cancelAnimationFrame(raf); raf = 0; }
    else if (loops.size && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
  });

  /* ---------------- Hero drawing: a working cycloidal reducer ---------------- */
  function initReducer() {
    const svg = $('#reducer'); if (!svg) return;
    const N = 11, Z = N - 1, R = 100, RR = 8.5, E = 6.5, M = 6, RH = 52, ROP = 9, BORE = 24;
    const TAU = Math.PI * 2, DEG = 180 / Math.PI;
    const core = $('#rd-core', svg);
    const circ = (cx, cy, r) => `M${(cx + r).toFixed(2)} ${cy.toFixed(2)}a${r} ${r} 0 1 0 ${-2 * r} 0a${r} ${r} 0 1 0 ${2 * r} 0Z`;
    let p = '';
    const S = 600;
    for (let i = 0; i <= S; i++) {
      const b = i / S * TAU;
      const px = R * Math.cos(b) - E * Math.cos(N * b), py = R * Math.sin(b) - E * Math.sin(N * b);
      const tx = -R * Math.sin(b) + E * N * Math.sin(N * b), ty = R * Math.cos(b) - E * N * Math.cos(N * b);
      const L = Math.hypot(tx, ty);
      p += (i ? 'L' : 'M') + (px - RR * ty / L).toFixed(2) + ' ' + (py + RR * tx / L).toFixed(2);
    }
    p += 'Z';
    for (let j = 0; j < M; j++) { const a = j / M * TAU; p += circ(RH * Math.cos(a), RH * Math.sin(a), ROP + E); }
    p += circ(0, 0, BORE);
    $('#rd-disc-path', svg).setAttribute('d', p);
    const pins = $('#rd-pins', svg);
    for (let k = 0; k < N; k++) { const a = k / N * TAU; svgEl('circle', { class: 'rd-pin', cx: (R * Math.cos(a)).toFixed(2), cy: (R * Math.sin(a)).toFixed(2), r: RR, style: '--k:' + k }, pins); }
    const bolts = $('#rd-bolts', svg);
    for (let k = 0; k < 6; k++) { const a = (k + 0.5) / 6 * TAU; svgEl('circle', { class: 'rd-bolt', cx: (119 * Math.cos(a)).toFixed(2), cy: (119 * Math.sin(a)).toFixed(2), r: 3.6 }, bolts); }
    const outF = $('#rd-out-front', svg);
    for (let j = 0; j < M; j++) { const a = j / M * TAU; svgEl('circle', { class: 'rd-opin', cx: (RH * Math.cos(a)).toFixed(2), cy: (RH * Math.sin(a)).toFixed(2), r: ROP }, outF); }
    const balls = $('#rd-balls', svg);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; svgEl('circle', { class: 'rd-ball', cx: (21.75 * Math.cos(a)).toFixed(2), cy: (21.75 * Math.sin(a)).toFixed(2), r: 2.05 }, balls); }
    const disc = $('#rd-disc', svg), input = $('#rd-input', svg), outB = $('#rd-out-back', svg);
    const nIn = $('#rd-needle-in', svg), nOut = $('#rd-needle-out', svg), tIn = $('#rd-tin', svg), tOut = $('#rd-tout', svg);
    const THETA0 = 0.9;
    let theta = THETA0;
    const sign = (v, n) => (v < -0.0005 ? '−' : '+') + Math.abs(v).toFixed(n);
    function render() {
      const ex = E * Math.cos(theta), ey = E * Math.sin(theta), a = -theta / Z;
      const aD = (a * DEG).toFixed(3), tD = (theta * DEG).toFixed(3), tr = `translate(${ex.toFixed(3)} ${ey.toFixed(3)})`;
      disc.setAttribute('transform', `${tr} rotate(${aD})`);
      outB.setAttribute('transform', `rotate(${aD})`);
      outF.setAttribute('transform', `rotate(${aD})`);
      input.setAttribute('transform', `rotate(${tD})`);
      balls.setAttribute('transform', `${tr} rotate(${((theta + a) / 2 * DEG).toFixed(3)})`);
      nIn.setAttribute('transform', `rotate(${tD})`);
      nOut.setAttribute('transform', `rotate(${aD})`);
      const rev = (theta - THETA0) / TAU;
      tIn.textContent = sign(rev, 2) + ' rev';
      tOut.textContent = sign(-rev / Z, 3) + ' rev';
    }
    render();
    const wrapEl = svg.closest('.drawing'), btn = $('.drawing-toggle', wrapEl);
    const OMEGA = TAU * 0.3;
    let speed = 0, dragging = false, lastAng = 0, userPaused = reduce, userStarted = false, visible = true;
    const loop = { step(dt) { if (dragging) return; speed = Math.min(1, speed + dt / 1.4); theta += dt * OMEGA * (speed * speed * (3 - 2 * speed)); render(); } };
    const sync = () => { (visible && !userPaused) ? play(loop, userStarted) : pause(loop); };
    function setPaused(v) {
      userPaused = v;
      btn.setAttribute('aria-pressed', String(v));
      btn.setAttribute('aria-label', v ? 'Play animation' : 'Pause animation');
      if (!v) speed = Math.min(speed, 0.2);
      sync();
    }
    btn.setAttribute('aria-pressed', String(userPaused));
    btn.setAttribute('aria-label', userPaused ? 'Play animation' : 'Pause animation');
    btn.addEventListener('click', e => { e.stopPropagation(); if (userPaused) userStarted = true; setPaused(!userPaused); });
    btn.addEventListener('pointerdown', e => e.stopPropagation());
    const angleAt = e => {
      const m = core.getScreenCTM(); if (!m) return 0;
      const q = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
      return Math.atan2(q.y, q.x);
    };
    svg.addEventListener('pointerdown', e => {
      if (e.button !== 0) return;
      dragging = true; lastAng = angleAt(e);
      try { svg.setPointerCapture(e.pointerId); } catch (_) {}
      wrapEl.classList.add('dragging');
    });
    svg.addEventListener('pointermove', e => {
      if (!dragging) return;
      const a = angleAt(e);
      let da = a - lastAng;
      if (da > Math.PI) da -= TAU; else if (da < -Math.PI) da += TAU;
      theta += da; lastAng = a; render();
    });
    const endDrag = () => { if (!dragging) return; dragging = false; speed = 0; wrapEl.classList.remove('dragging'); };
    svg.addEventListener('pointerup', endDrag);
    svg.addEventListener('pointercancel', endDrag);
    wrapEl.addEventListener('keydown', e => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { theta += TAU / 12; render(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { theta -= TAU / 12; render(); e.preventDefault(); }
      else if (e.key === ' ' || e.key === 'Enter') { if (userPaused) userStarted = true; setPaused(!userPaused); e.preventDefault(); }
    });
    new IntersectionObserver(en => { visible = en[0].isIntersecting; sync(); }, { threshold: 0.05 }).observe(wrapEl);
    if (!reduce) setTimeout(() => { svg.classList.remove('intro'); }, 3200);
    else svg.classList.remove('intro');
  }

  /* ---------------- Figure animations ---------------- */
  function packetFlow(svg, specs) {
    const layer = svgEl('g', { class: 'pk-layer' }, svg);
    const flows = specs.map(s => {
      const path = svg.querySelector(s.path);
      return { path, len: path.getTotalLength(), every: s.every, speed: s.speed, cls: s.cls || '', t: s.offset || 0, items: [], onArrive: s.onArrive };
    });
    return {
      step(dt) {
        flows.forEach(f => {
          f.t += dt;
          if (f.t >= f.every) { f.t -= f.every; f.items.push({ c: svgEl('circle', { r: 2.6, class: 'pk ' + f.cls }, layer), s: 0 }); }
          for (let i = f.items.length - 1; i >= 0; i--) {
            const it = f.items[i];
            it.s += f.speed * dt;
            if (it.s >= f.len) { it.c.remove(); f.items.splice(i, 1); if (f.onArrive) f.onArrive(); continue; }
            const pt = f.path.getPointAtLength(it.s);
            it.c.setAttribute('cx', pt.x.toFixed(1)); it.c.setAttribute('cy', pt.y.toFixed(1));
          }
        });
      },
      still() {
        flows.forEach(f => [0.35, 0.75].forEach(fr => { const pt = f.path.getPointAtLength(f.len * fr); svgEl('circle', { r: 2.6, class: 'pk ' + f.cls, cx: pt.x, cy: pt.y }, layer); }));
      }
    };
  }
  const flash = (el, cls = 'hit', ms = 380) => { if (!el) return; el.classList.add(cls); setTimeout(() => el.classList.remove(cls), ms); };

  const figAnims = {
    quad(svg) {
      const joints = $$('.q-j', svg).sort((a, b) => a.dataset.o - b.dataset.o), n = $('.q-n', svg);
      let started = false;
      if (!reduce) { joints.forEach(j => j.classList.remove('on')); n.textContent = '00'; }
      return {
        enter() {
          if (started || reduce) return; started = true;
          joints.forEach((j, i) => setTimeout(() => {
            j.classList.add('on');
            n.textContent = String(i + 1).padStart(2, '0');
            const b = j.getBBox();
            const ring = svgEl('circle', { class: 'q-pulse', cx: b.x + b.width / 2, cy: b.y + b.height / 2, r: Math.max(b.width, b.height) / 2 + 1 }, j.parentNode);
            setTimeout(() => ring.remove(), 950);
          }, 300 + i * 170));
        }
      };
    },
    bench(svg) {
      const logger = $('.b-logger', svg), rows = $$('.b-row', svg);
      let r = 0;
      const arrive = () => { flash(logger); flash(rows[r++ % rows.length], 'hit', 600); };
      const pf = packetFlow(svg, [
        { path: '.b-l1', every: 0.7, speed: 55 },
        { path: '.b-l2', every: 1.1, speed: 50, cls: 'warm', offset: 0.4 },
        { path: '.b-l3', every: 0.55, speed: 70, onArrive: arrive },
        { path: '.b-l4', every: 1.1, speed: 60, cls: 'warm', offset: 0.2, onArrive: arrive }
      ]);
      if (reduce) pf.still();
      return { step: pf.step };
    },
    agro(svg) {
      const gw = $('.i-gw', svg), cloud = $('.i-cloud', svg), relay = $('.i-relay', svg);
      const pf = packetFlow(svg, [
        { path: '.i-l1', every: 1.5, speed: 70, onArrive: () => flash(gw) },
        { path: '.i-l2', every: 1.5, speed: 60, offset: 0.75, onArrive: () => flash(gw) },
        { path: '.i-l3', every: 1.2, speed: 55, offset: 0.3, onArrive: () => flash(cloud) },
        { path: '.i-l4', every: 2.2, speed: 45, cls: 'warm', offset: 1.1, onArrive: () => flash(relay, 'hit', 600) }
      ]);
      if (reduce) pf.still();
      return { step: pf.step };
    },
    glider(svg) {
      const path = $('.g-path', svg), g = $('.g-glider', svg), state = $('.g-state', svg), samples = $('.g-samples', svg);
      const L = path.getTotalLength();
      let s = L * 0.12, lastDrop = s, dive = null;
      function place() {
        const pt = path.getPointAtLength(s), a = path.getPointAtLength(Math.max(0, s - 1.5)), b = path.getPointAtLength(Math.min(L, s + 1.5));
        const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
        g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)}) rotate(${ang.toFixed(1)})`);
        g.style.opacity = Math.max(0, Math.min(1, s / 14, (L - s) / 14)).toFixed(2);
        const down = b.y - a.y > 0;
        if (down !== dive) { dive = down; state.textContent = dive ? 'BUOYANCY − · DIVE' : 'BUOYANCY + · CLIMB'; svg.classList.toggle('climb', !dive); }
        return pt;
      }
      if (reduce) {
        s = L * 0.36;
        for (let x = 8; x < s; x += 12) { const q = path.getPointAtLength(x); svgEl('circle', { class: 'g-sample static', cx: q.x.toFixed(1), cy: q.y.toFixed(1), r: 1.7 }, samples); }
      }
      place();
      return {
        step(dt) {
          s += dt * 34;
          if (s >= L) { s = 0; lastDrop = 0; }
          const pt = place();
          if (s - lastDrop >= 12) {
            lastDrop = s;
            const c = svgEl('circle', { class: 'g-sample', cx: pt.x.toFixed(1), cy: pt.y.toFixed(1), r: 1.7 }, samples);
            setTimeout(() => c.remove(), 6100);
          }
        }
      };
    },
    rover(svg) {
      const line = $('.r-ground-line', svg), fill = $('.r-ground-fill', svg), hatch = $('pattern', svg), rocker = $('.r-rocker', svg);
      const w1 = $('.r-w1', svg), w2 = $('.r-w2', svg), bodyG = $('.r-body', svg), a1 = $('.r-a1', svg), a2 = $('.r-a2', svg), leader = $('.r-leader', svg);
      const P = 420, Y0 = 206, RW = 17, XC = 200, HALF = 55, H = 30, DEG = 180 / Math.PI;
      const bumps = [[0.16, 11, 24], [0.5, 17, 19], [0.8, 7, 36]];
      const f = u => { let y = Y0; for (const [c, h, w] of bumps) { let dx = ((u - c * P) % P + P) % P; if (dx > P / 2) dx -= P; y -= h * Math.exp(-(dx / w) * (dx / w)); } return y; };
      const wheelY = x => { let best = Infinity; for (let i = -8; i <= 8; i++) { const dx = i / 8 * RW, cy = f(x + dx) - Math.sqrt(RW * RW - dx * dx); if (cy < best) best = cy; } return best; };
      let off = reduce ? 150 : 40, t = 0;
      function draw() {
        let dl = '';
        for (let x = 0; x <= 400; x += 5) dl += (x ? 'L' : 'M') + x + ' ' + f(x + off).toFixed(1);
        line.setAttribute('d', dl);
        fill.setAttribute('d', dl + 'L400 250L0 250Z');
        hatch.setAttribute('patternTransform', `translate(${(-(off % 8)).toFixed(2)} 0) rotate(45)`);
        const x1 = XC - HALF, x2 = XC + HALF, y1 = wheelY(x1 + off), y2 = wheelY(x2 + off);
        const phi = Math.atan2(y2 - y1, x2 - x1), mx = (x1 + x2) / 2, my = (y1 + y2) / 2;
        const px = mx + H * Math.sin(phi), py = my - H * Math.cos(phi);
        rocker.setAttribute('d', `M${x1} ${y1.toFixed(1)}L${px.toFixed(1)} ${py.toFixed(1)}L${x2} ${y2.toFixed(1)}`);
        w1.setAttribute('transform', `translate(${x1} ${y1.toFixed(1)}) rotate(${(((x1 + off) / RW) * DEG % 360).toFixed(1)})`);
        w2.setAttribute('transform', `translate(${x2} ${y2.toFixed(1)}) rotate(${(((x2 + off) / RW) * DEG % 360).toFixed(1)})`);
        const bAng = phi / 2;
        bodyG.setAttribute('transform', `translate(${px.toFixed(1)} ${py.toFixed(1)}) rotate(${(bAng * DEG).toFixed(2)})`);
        const q1 = Math.sin(t * 0.9) * 6, q2 = Math.sin(t * 0.9 + 1.2) * 7;
        a1.setAttribute('transform', `rotate(${q1.toFixed(2)})`);
        a2.setAttribute('transform', `translate(12 -32) rotate(${q2.toFixed(2)})`);
        const r1 = q1 / DEG, ex = 40 + 12 * Math.cos(r1) + 32 * Math.sin(r1), ey = -42 + 12 * Math.sin(r1) - 32 * Math.cos(r1);
        const wx = px + ex * Math.cos(bAng) - ey * Math.sin(bAng), wy = py + ex * Math.sin(bAng) + ey * Math.cos(bAng);
        leader.setAttribute('d', `M352 35L${(wx + 3).toFixed(1)} ${(wy - 3).toFixed(1)}`);
      }
      draw();
      return { step(dt) { off += dt * 22; t += dt; draw(); } };
    }
  };

  const figIO = new IntersectionObserver(entries => {
    entries.forEach(en => {
      const svg = en.target, a = svg._anim;
      svg.classList.toggle('is-playing', en.isIntersecting && !reduce);
      if (!a) return;
      if (en.isIntersecting) { if (a.enter) a.enter(); if (a.step) play(a); }
      else if (a.step) pause(a);
    });
  }, { threshold: 0.2 });
  $$('.schem').forEach(svg => {
    const kind = svg.dataset.anim;
    if (kind && figAnims[kind]) { try { svg._anim = figAnims[kind](svg); } catch (err) { console.warn(err); } }
    figIO.observe(svg);
  });

  initReducer();

  if (mqReduce.addEventListener) mqReduce.addEventListener('change', e => {
    reduce = e.matches;
    if (reduce) { loops.clear(); cancelAnimationFrame(raf); raf = 0; $$('.schem').forEach(s => s.classList.remove('is-playing')); }
  });

  window.__siteReady = true;
})();
