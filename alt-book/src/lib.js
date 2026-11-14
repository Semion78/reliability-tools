/* Shared helpers: DOM, formatting, charts, controls. No dependencies. */
const W = {};
function el(tag, attrs, ...kids) {
  const e = document.createElement(tag);
  for (const k in (attrs || {})) {
    if (k === 'class') e.className = attrs[k];
    else if (k === 'html') e.innerHTML = attrs[k];
    else if (k.startsWith('on')) e.addEventListener(k.slice(2), attrs[k]);
    else e.setAttribute(k, attrs[k]);
  }
  kids.flat().forEach(c => { if (c != null) e.append(c.nodeType ? c : document.createTextNode(c)); });
  return e;
}
function S(tag, attrs, text) {
  const e = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const k in (attrs || {})) e.setAttribute(k, attrs[k]);
  if (text != null) e.textContent = text;
  return e;
}
const SUPS = '⁰¹²³⁴⁵⁶⁷⁸⁹';
function sci(v, d) {
  if (!isFinite(v) || v === 0) return String(v);
  const e = Math.floor(Math.log10(Math.abs(v)));
  let m = (v / Math.pow(10, e)).toFixed(d == null ? 2 : d), ex = e;
  if (+m >= 10) { m = (+m / 10).toFixed(d == null ? 2 : d); ex++; }
  const s = String(Math.abs(ex)).split('').map(c => SUPS[+c]).join('');
  return m + ' × 10' + (ex < 0 ? '⁻' : '') + s;
}
function num(v, p) {
  if (!isFinite(v)) return '–';
  const a = Math.abs(v);
  if (a >= 1000) return Math.round(v).toLocaleString('en-US');
  if (a === 0) return '0';
  if (a < 0.001) return sci(v);
  return String(+v.toPrecision(p || 3));
}
function head(root, title, hint) { root.append(el('div', { class: 'wt' }, title), el('div', { class: 'wh' }, hint || '')); }
function slider(label, min, max, step, val, fmt, cb) {
  const b = el('b', {}, ''), inp = el('input', { type: 'range', min, max, step, value: val, 'aria-label': label });
  const root = el('label', { class: 'sl' }, el('span', {}, label), inp, b);
  const show = () => { b.textContent = (fmt || num)(+inp.value); };
  inp.addEventListener('input', () => { show(); cb && cb(+inp.value); });
  show();
  return { el: root, get v() { return +inp.value; }, set(v) { inp.value = v; show(); } };
}
function presetBar(list, label) {
  const row = el('div', { class: 'row' }, el('span', { style: 'color:var(--mute);font-size:.85em' }, label || 'Worked examples:'));
  const btns = list.map(([name, fn]) => {
    const b = el('button', { class: 'btn', onclick: () => { btns.forEach(x => x.classList.remove('on')); b.classList.add('on'); fn(); } }, name);
    row.append(b); return b;
  });
  row.pick = i => btns[i].click();
  row.clear = () => btns.forEach(x => x.classList.remove('on'));
  return row;
}
function stats(items) { return el('div', { class: 'stats' }, items.map(([v, l, c]) => el('div', { class: 'stat ' + (c || '') }, el('b', {}, v), el('span', {}, l)))); }
function setStats(host, items) { host.replaceChildren(...stats(items).children); }
function barChart(host, items, o) {
  o = o || {};
  const max = o.max || Math.max(...items.map(i => i.value), 1e-300);
  host.classList.add('bars');
  host.replaceChildren(...items.map(i => el('div', { class: 'br', title: i.note || '' },
    el('span', {}, i.label),
    el('div', { class: 'trk' }, el('div', { class: 'fill', style: `width:${Math.max(1, 100 * i.value / max)}%;background:${i.color || 'var(--teal)'}` })),
    el('span', { class: 'v' }, i.text != null ? i.text : (o.fmt || num)(i.value)))));
}
function dotGrid(n, cols, cls) {
  const g = el('div', { class: 'dots', style: `grid-template-columns:repeat(${cols},1fr)` });
  for (let i = 0; i < n; i++) g.append(el('i', { class: cls(i) || '' }));
  return g;
}
/* Interactive SVG line chart with hover read-out. draw({series,x:[a,b],y:[a,b],bands,marks,vlines,xticks}) */
function lineChart(host, o) {
  o = o || {};
  const Wd = o.w || 680, H = o.h || 320, m = { l: 62, r: 18, t: 18, b: 46 };
  host.classList.add('chartbox');
  const svg = S('svg', { viewBox: `0 0 ${Wd} ${H}`, role: 'img', 'aria-label': o.aria || 'chart' });
  const tip = el('div', { class: 'tip' });
  host.append(svg, tip);
  let d = null, cursor = null;
  const fx = v => o.xlog ? Math.log10(v) : v, fy = v => o.ylog ? Math.log10(v) : v;
  const X = v => m.l + (fx(v) - fx(d.x[0])) / (fx(d.x[1]) - fx(d.x[0])) * (Wd - m.l - m.r);
  const Y = v => { v = Math.min(Math.max(v, d.y[0]), d.y[1]); return H - m.b - (fy(v) - fy(d.y[0])) / (fy(d.y[1]) - fy(d.y[0])) * (H - m.t - m.b); };
  const invX = px => { const f = (px - m.l) / (Wd - m.l - m.r), v = fx(d.x[0]) + f * (fx(d.x[1]) - fx(d.x[0])); return o.xlog ? Math.pow(10, v) : v; };
  function ticks(a, b, log) {
    const r = [];
    if (log) { for (let e = Math.ceil(Math.log10(a) - 1e-9); e <= Math.log10(b) + 1e-9; e++) r.push(Math.pow(10, e)); return r; }
    const span = b - a, st = Math.pow(10, Math.floor(Math.log10(span / 5))), k = [1, 2, 5, 10].find(q => span / (st * q) <= 6) || 10, s = st * k;
    for (let v = Math.ceil(a / s - 1e-9) * s; v <= b + 1e-9; v += s) r.push(+v.toPrecision(10));
    return r;
  }
  function yAt(s, xv) {
    const p = s.pts; if (xv < p[0][0] || xv > p[p.length - 1][0]) return null;
    for (let i = 1; i < p.length; i++) if (xv <= p[i][0]) { const f = (xv - p[i - 1][0]) / (p[i][0] - p[i - 1][0] || 1); return p[i - 1][1] + f * (p[i][1] - p[i - 1][1]); }
    return null;
  }
  function draw(nd) {
    d = nd; svg.replaceChildren();
    (d.bands || []).forEach(b => {
      svg.append(S('rect', { x: X(b.x0), y: m.t, width: Math.max(0, X(b.x1) - X(b.x0)), height: H - m.t - m.b, fill: b.color, opacity: .12 }));
      if (b.label) svg.append(S('text', { x: (X(b.x0) + X(b.x1)) / 2, y: m.t + 14, 'text-anchor': 'middle', class: 'bandl', fill: b.color }, b.label));
    });
    const xt = d.xticks || ticks(d.x[0], d.x[1], o.xlog).map(v => [v, (o.xfmt || num)(v)]);
    xt.forEach(([v, l]) => svg.append(S('line', { x1: X(v), x2: X(v), y1: m.t, y2: H - m.b, class: 'grid' }), S('text', { x: X(v), y: H - m.b + 16, 'text-anchor': 'middle', class: 'tick' }, l)));
    ticks(d.y[0], d.y[1], o.ylog).forEach(v => svg.append(S('line', { x1: m.l, x2: Wd - m.r, y1: Y(v), y2: Y(v), class: 'grid' }), S('text', { x: m.l - 8, y: Y(v) + 4, 'text-anchor': 'end', class: 'tick' }, (o.yfmt || num)(v))));
    if (o.xlab) svg.append(S('text', { x: (m.l + Wd - m.r) / 2, y: H - 8, 'text-anchor': 'middle', class: 'axl' }, o.xlab));
    if (o.ylab) svg.append(S('text', { x: 14, y: (m.t + H - m.b) / 2, 'text-anchor': 'middle', class: 'axl', transform: `rotate(-90 14 ${(m.t + H - m.b) / 2})` }, o.ylab));
    d.series.forEach(s => {
      const path = s.pts.map((p, i) => (i ? 'L' : 'M') + X(p[0]).toFixed(1) + ' ' + Y(p[1]).toFixed(1)).join('');
      if (s.fill) svg.append(S('path', { d: path + `L${X(s.pts[s.pts.length - 1][0])} ${H - m.b}L${X(s.pts[0][0])} ${H - m.b}Z`, fill: s.color, opacity: .15 }));
      svg.append(S('path', { d: path, fill: 'none', stroke: s.color, 'stroke-width': s.width || 2.5, 'stroke-dasharray': s.dash || '', 'stroke-linejoin': 'round' }));
      if (s.dots) s.pts.forEach(p => svg.append(S('circle', { cx: X(p[0]), cy: Y(p[1]), r: 5, fill: s.color })));
    });
    (d.vlines || []).forEach(v => { svg.append(S('line', { x1: X(v.x), x2: X(v.x), y1: m.t, y2: H - m.b, stroke: v.color || 'var(--amber)', 'stroke-width': 2, 'stroke-dasharray': '5 4' })); if (v.label) svg.append(S('text', { x: X(v.x) + 5, y: m.t + 28, class: 'bandl', fill: v.color || 'var(--amber)' }, v.label)); });
    (d.marks || []).forEach(k => { svg.append(S('circle', { cx: X(k.x), cy: Y(k.y), r: 6, fill: k.color || 'var(--amber)', stroke: 'var(--bg)', 'stroke-width': 2 })); if (k.label) svg.append(S('text', { x: X(k.x) + 9, y: Y(k.y) - 8, class: 'bandl', fill: k.color || 'var(--amber)' }, k.label)); });
    cursor = S('line', { y1: m.t, y2: H - m.b, stroke: 'var(--ink)', 'stroke-width': 1, opacity: 0 }); svg.append(cursor);
  }
  function move(e) {
    if (!d) return;
    const r = svg.getBoundingClientRect(), px = (e.clientX - r.left) / r.width * Wd;
    if (px < m.l || px > Wd - m.r) return leave();
    let xv = invX(px); if (o.snap) xv = Math.round(xv);
    cursor.setAttribute('x1', X(xv)); cursor.setAttribute('x2', X(xv)); cursor.setAttribute('opacity', .5);
    let h = '<b>' + (o.tipHead ? o.tipHead(xv) : (o.xlab || 'x') + ': ' + (o.xfmt || num)(xv)) + '</b>';
    d.series.forEach(s => { if (s.noTip) return; const y = yAt(s, xv); if (y != null) h += `<br><span style="color:${s.color}">●</span> ${s.name}: ${(o.yfmt || num)(y)}`; });
    if (o.tipExtra) h += o.tipExtra(xv);
    tip.innerHTML = h; tip.style.display = 'block';
    const lx = e.clientX - r.left;
    tip.style.left = (lx > r.width * .6 ? lx - tip.offsetWidth - 12 : lx + 12) + 'px'; tip.style.top = '10px';
  }
  function leave() { tip.style.display = 'none'; if (cursor) cursor.setAttribute('opacity', 0); }
  svg.addEventListener('pointermove', move); svg.addEventListener('pointerdown', move); svg.addEventListener('pointerleave', leave);
  return { draw };
}
/* Reliability-budget apportionment (series system, exponential): used in chapters 2 and 3 */
function apportion(root, cfg) {
  const LN = -Math.log(0.9);
  const out = el('div', {}), bars = el('div', {}), sls = el('div', {});
  let items = [];
  function render() {
    const tot = items.reduce((a, i) => a + i.s.v, 0);
    barChart(bars, items.map(i => { const lam = cfg.total * i.s.v / 100; return { label: i.name, value: i.s.v, color: i.hot ? 'var(--amber)' : 'var(--teal)', text: i.s.v > 0 ? `λ ${sci(lam)} · B10 ≈ ${num(Math.round(LN / lam / 10) * 10)} h` : 'no budget' }; }), { max: 40 });
    const ok = Math.abs(tot - 100) < 0.05;
    out.innerHTML = `Shares total <b class="${ok ? 'good' : 'warn'}">${tot.toFixed(1)}%</b> of the system budget λ = <b>${sci(cfg.total)}</b> failures per operating hour (system B10 ≈ ${num(Math.round(LN / cfg.total / 10) * 10)} h). ` +
      (ok ? 'In a series system the block failure rates add up to the system rate, so every share given to one block is taken from the others.' : `<span class="warn">${tot > 100 ? 'The blocks together are allowed more failures than the system target permits — the system would miss its B10.' : 'Part of the budget is unallocated — some block could be given an easier target.'}</span>`);
  }
  function load(list) {
    items = list.map(([name, share, hot]) => ({ name, hot, s: slider(name, 0, 50, 0.1, share, v => v.toFixed(1) + '%', render) }));
    sls.replaceChildren(...items.map(i => i.s.el)); render();
  }
  const pb = presetBar(cfg.presets.map(p => [p.name, () => { load(p.items); p.on && p.on(); }]));
  root.append(pb, sls, bars, el('div', { class: 'out' }, out));
  pb.pick(cfg.start || 0);
}
/* inverse standard normal (Acklam) */
function invNorm(p) {
  const a = [-39.69683028665376, 220.9460984245205, -275.9285104469687, 138.3577518672690, -30.66479806614716, 2.506628277459239],
    b = [-54.47609879822406, 161.5858368580409, -155.6989798598866, 66.80131188771972, -13.28068155288572],
    c = [-0.007784894002430293, -0.3223964580411365, -2.400758277161838, -2.549732539343734, 4.374664141464968, 2.938163982698783],
    dd = [0.007784695709041462, 0.3224671290700398, 2.445134137142996, 3.754408661907416];
  let q, r;
  if (p < 0.02425) { q = Math.sqrt(-2 * Math.log(p)); return (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) / ((((dd[0] * q + dd[1]) * q + dd[2]) * q + dd[3]) * q + 1); }
  if (p > 1 - 0.02425) return -invNorm(1 - p);
  q = p - 0.5; r = q * q;
  return (((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * q / (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1);
}
