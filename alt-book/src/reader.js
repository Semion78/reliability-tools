/* Reader shell: table of contents, progress, theme, and hybrid narration (MP3 if present, browser voice otherwise). */
(function () {
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const LS = { get(k, d) { try { const v = localStorage.getItem('alt.' + k); return v == null ? d : v; } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem('alt.' + k, v); } catch (e) { } } };

  // widgets
  $$('.widget[data-w]').forEach(r => { try { W[r.dataset.w](r); } catch (e) { r.append('Interactive element failed to load: ' + e.message); console.error(e); } });

  // theme + font size
  const setTheme = t => { document.documentElement.classList.toggle('light', t === 'light'); LS.set('theme', t); };
  setTheme(LS.get('theme', 'dark'));
  $('#theme').onclick = () => setTheme(document.documentElement.classList.contains('light') ? 'dark' : 'light');
  let fs = +LS.get('fs', 18);
  const setFs = v => { fs = Math.min(24, Math.max(14, v)); document.documentElement.style.setProperty('--fs', fs + 'px'); LS.set('fs', fs); };
  setFs(fs); $('#fminus').onclick = () => setFs(fs - 1); $('#fplus').onclick = () => setFs(fs + 1);
  $('#menu').onclick = () => $('.toc').classList.toggle('open');

  // table of contents + scroll progress
  const secs = $$('main section'), toc = $('.toc');
  secs.forEach((s, i) => { const h = s.querySelector('h2'); const a = el('a', { href: '#' + s.id, onclick: () => toc.classList.remove('open') }, h ? h.textContent : 'Opening'); toc.append(a); s._a = a; });
  function onScroll() {
    const h = document.documentElement, p = h.scrollTop / Math.max(1, h.scrollHeight - h.clientHeight);
    $('#bar').style.width = (100 * p) + '%'; LS.set('pct.' + CH.id, Math.round(100 * p));
    let c = secs[0]; secs.forEach(s => { if (s.getBoundingClientRect().top < 140) c = s; });
    secs.forEach(s => s._a.classList.toggle('cur', s === c));
  }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // ---------- narration ----------
  const segs = $$('.seg'), N = NARR.length, synth = window.speechSynthesis;
  const bPlay = $('#pp'), lbl = $('#plbl'), badge = $('#pbadge'), selV = $('#pvoice'), selR = $('#prate');
  let cur = -1, playing = false, token = 0, mode = 'tts', audio = null, chunks = [], ci = 0, rate = +LS.get('rate', 1);
  selR.value = String(rate); selR.onchange = () => { rate = +selR.value; LS.set('rate', rate); if (audio) audio.playbackRate = rate; if (playing && mode === 'tts') { token++; synth.cancel(); playing = true; speakChunk(); } };
  const secSegs = {}; NARR.forEach((n, i) => (secSegs[n.s] = secSegs[n.s] || []).push(i));
  const mp3 = {};
  function probe(sec) {
    if (mp3[sec] !== undefined) return Promise.resolve(mp3[sec]);
    return new Promise(res => {
      const a = new Audio(); let done = false;
      const fin = ok => { if (done) return; done = true; mp3[sec] = ok ? a : false; res(mp3[sec]); };
      a.preload = 'metadata'; a.addEventListener('loadedmetadata', () => fin(true)); a.addEventListener('error', () => fin(false)); setTimeout(() => fin(false), 2500);
      a.src = 'audio/' + CH.id + '/s' + String(sec).padStart(2, '0') + '.mp3';
    });
  }
  const NOVELTY = /^(albert|bad news|bahh|bells|boing|bubbles|cellos|deranged|good news|hysterical|jester|organ|pipe organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph|eddy|flo|grandma|grandpa|reed|rocko|sandy|shelley|princess)\b/i;
  const tier = v => /natural|neural|online/i.test(v.name) ? 4 : /premium/i.test(v.name) ? 3 : /enhanced|google/i.test(v.name) ? 2 : 1;
  const TIER = { 4: 'Natural', 3: 'Premium', 2: 'Enhanced', 1: 'Basic' };
  let best = 0;
  function voices() {
    if (!synth) return;
    const vs = synth.getVoices().filter(v => /^en/i.test(v.lang) && !NOVELTY.test(v.name));
    const score = v => tier(v) * 10 + (/samantha|ava|zoe|evan|nathan|allison|daniel|serena|aria|jenny|guy|andrew|emma|brian/i.test(v.name) ? 4 : 0) + (/en[-_](US|GB)/i.test(v.lang) ? 2 : 0) + (v.default ? 1 : 0);
    vs.sort((a, b) => score(b) - score(a));
    best = vs.length ? tier(vs[0]) : 0;
    const saved = LS.get('voice', '');
    selV.replaceChildren(...vs.map(v => el('option', { value: v.name }, (tier(v) > 1 ? '★ ' : '') + v.name.replace(/Microsoft |Online |\(Natural\) ?|- English.*$|\((Premium|Enhanced)\)/g, '').trim() + ' · ' + TIER[tier(v)] + ' · ' + v.lang.replace('_', '-'))));
    if (vs.some(v => v.name === saved)) selV.value = saved;
    const tb = $('#ptips'); if (tb) tb.classList.toggle('amber', best < 2);
  }
  if (synth) { voices(); synth.onvoiceschanged = voices; }
  selV.onchange = () => { LS.set('voice', selV.value); if (playing && mode === 'tts') { token++; synth.cancel(); playing = true; speakChunk(); } };
  function split(t) {
    const out = [];
    t.replace(/([.!?]["')\]]*)\s+(?=[A-Z0-9(])/g, '$1\u0001').split('\u0001').forEach(sn => {
      if (sn.length <= 240) return out.push(sn);
      let b = ''; sn.replace(/([,;:])\s/g, '$1\u0001').split('\u0001').forEach(p => { if ((b + ' ' + p).length > 200 && b) { out.push(b); b = p; } else b = b ? b + ' ' + p : p; }); if (b) out.push(b);
    });
    const m = []; out.forEach(x => { if (m.length && (m[m.length - 1] + ' ' + x).length < 60) m[m.length - 1] += ' ' + x; else m.push(x); });
    return m.filter(x => x.trim());
  }
  function mark(scroll) {
    segs.forEach((s, i) => s.classList.toggle('now', i === cur));
    if (cur < 0) return;
    const sec = secs[NARR[cur].s], h = sec && sec.querySelector('h2');
    lbl.textContent = (h ? h.textContent : 'Opening') + ' · ' + (cur + 1) + ' / ' + N;
    if (scroll !== false) segs[cur].scrollIntoView({ block: 'center', behavior: 'smooth' });
    LS.set('seg.' + CH.id, cur);
  }
  function ui() { bPlay.textContent = playing ? '❚❚' : '▶'; bPlay.setAttribute('aria-label', playing ? 'Pause' : 'Play'); badge.textContent = mode === 'mp3' ? 'Studio audio' : 'Browser voice'; badge.classList.toggle('s', mode === 'mp3'); selV.style.display = mode === 'mp3' ? 'none' : ''; }
  function halt() { token++; if (audio) { audio.pause(); audio.ontimeupdate = audio.onended = null; } if (synth) synth.cancel(); }
  function stop() { halt(); playing = false; ui(); }
  function playFrom(i) {
    if (i < 0 || i >= N) return stop();
    halt(); cur = i; playing = true; mark(); const my = token, sec = NARR[i].s;
    probe(sec).then(a => {
      if (my !== token) return;
      if (a) {
        mode = 'mp3'; audio = a; ui();
        const idx = secSegs[sec], len = idx.map(k => NARR[k].t.length), tot = len.reduce((x, y) => x + y, 0);
        let before = 0; for (const k of idx) { if (k === i) break; before += NARR[k].t.length; }
        a.playbackRate = rate; a.currentTime = a.duration * before / tot;
        a.ontimeupdate = () => { let f = a.currentTime / a.duration * tot, k = 0; while (k < idx.length - 1 && f > len[k]) { f -= len[k]; k++; } if (idx[k] !== cur) { cur = idx[k]; mark(); } };
        a.onended = () => { const nx = idx[idx.length - 1] + 1; nx < N ? playFrom(nx) : stop(); };
        a.play().catch(() => { mp3[sec] = false; playFrom(i); });
      } else {
        mode = 'tts'; ui();
        if (!synth) { lbl.textContent = 'This browser has no built-in voice. Add MP3 files to the audio folder to enable narration.'; playing = false; ui(); return; }
        chunks = split(NARR[i].t); ci = 0; speakChunk();
      }
    });
  }
  function speakChunk() {
    if (ci >= chunks.length) { const my2 = token, hd = /^H\d$/.test(segs[cur].tagName); return setTimeout(() => { if (my2 === token && playing) playFrom(cur + 1); }, hd ? 650 : 380); }
    const u = new SpeechSynthesisUtterance(chunks[ci]), my = token;
    const v = synth.getVoices().find(x => x.name === selV.value); if (v) { u.voice = v; u.lang = v.lang; } else u.lang = 'en-US';
    u.rate = rate; u.pitch = 1;
    const t0 = Date.now(), fail = () => { stop(); lbl.textContent = 'The browser voice is not available here. Try another voice, or add MP3 files to the audio folder.'; };
    u.onend = () => { if (my !== token || !playing) return; if (Date.now() - t0 < 80 && chunks[ci].length > 40) return fail(); ci++; speakChunk(); };
    u.onerror = e => { if (my !== token) return; if (e.error === 'interrupted' || e.error === 'canceled') return; fail(); };
    window._u = u; synth.speak(u);
  }
  function firstVisible() { const i = segs.findIndex(s => s.getBoundingClientRect().top > 60); return i < 0 ? 0 : i; }
  bPlay.onclick = () => {
    if (playing) { halt(); playing = false; ui(); return; }
    if (cur < 0) return playFrom(firstVisible());
    if (mode === 'mp3' || !chunks.length) return playFrom(cur);
    playing = true; ui(); speakChunk();
  };
  $('#pprev').onclick = () => playFrom(Math.max(0, (cur < 0 ? firstVisible() : cur) - 1));
  $('#pnext').onclick = () => playFrom(Math.min(N - 1, (cur < 0 ? firstVisible() : cur) + 1));
  const tips = $('#tips'); $('#ptips').onclick = () => { tips.style.display = tips.style.display === 'block' ? 'none' : 'block'; }; $('#tipsx').onclick = () => { tips.style.display = 'none'; };
  $('#phere').onclick = () => playFrom(firstVisible());
  $('#pscript').onclick = () => {
    let t = CH.title + ' — narration script\nOne block per audio file. Save each as MP3 with the file name shown and upload to the audio folder.\n';
    Object.keys(secSegs).forEach(s => { const h = secs[s] && secs[s].querySelector('h2'); t += '\n\n===== audio/' + CH.id + '/s' + String(s).padStart(2, '0') + '.mp3 — ' + (h ? h.textContent : 'Opening') + ' =====\n\n' + secSegs[s].map(k => NARR[k].t).join('\n\n'); });
    const a = el('a', { href: URL.createObjectURL(new Blob([t], { type: 'text/plain' })), download: CH.id + '-narration.txt' }); document.body.append(a); a.click(); a.remove();
  };
  // start reading from any paragraph: hover button or double-click
  const hov = $('#hov'); let hi = -1;
  segs.forEach((s, i) => {
    s.addEventListener('mouseenter', () => { hi = i; const r = s.getBoundingClientRect(); hov.style.display = 'block'; hov.style.top = (r.top + scrollY + 2) + 'px'; hov.style.left = Math.max(2, r.left + scrollX - 36) + 'px'; });
    s.addEventListener('dblclick', e => { if (e.target.closest('.widget')) return; playFrom(i); });
  });
  hov.onclick = () => { if (hi >= 0) playFrom(hi); };
  addEventListener('keydown', e => { if (e.target.matches('input,select,textarea,button')) return; if (e.code === 'Space') { e.preventDefault(); bPlay.click(); } });
  addEventListener('beforeunload', () => { if (synth) synth.cancel(); });
  ui();
})();
