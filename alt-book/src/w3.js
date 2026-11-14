/* Chapter 3 interactive elements */
W.half = r => {
  head(r, 'Where field problems occur', 'Each dot is one field problem out of a hundred.');
  r.append(el('div', { class: 'row', style: 'gap:24px;align-items:flex-start' }, dotGrid(100, 10, i => i < 50 ? 'a' : 't'),
    el('div', { style: 'flex:1;min-width:200px' }, stats([['≥ 50%', 'at interfaces between components and subsystems'], ['≤ 50%', 'inside the components themselves', 't']]), el('div', { class: 'wh' }, 'Most teams assign a DFMEA owner per block — and nobody to the joints, where at least half the problems are.'))));
};
W.tree = r => {
  head(r, 'The tree underneath every FMEA', 'Open the branches: system → element → function → failure mode → effect and cause. Example drawn from this chapter\'s infusion pump.');
  const T = ['System', 'Ambulatory infusion pump', [
    ['Element', 'Fluidics — tubing set, valves, occlusion sensor', []],
    ['Element', 'Motor / Drive — motor, gear train, rotary encoder', []],
    ['Element', 'Drive-to-Fluidics Interface — the drive coupling', [
      ['Function', 'Transmit rotational motion to the peristaltic rotor without slip or misalignment', [
        ['Failure mode', 'Partial disengagement or slip under vibration', [
          ['Effect', 'Under-infusion without triggering the occlusion sensor, which detects blockage, not slippage — therapy-critical', []],
          ['Cause', 'Coupling wear and slip under vibration', []]]]]]]],
    ['Element', 'Electronics — control board, power supply, safety-monitoring circuit', []],
    ['Element', 'User Interface — display, keypad', []]]];
  const mk = (n, open) => n[2].length ? el('details', Object.assign({ class: 'tree' }, open ? { open: '' } : {}), el('summary', {}, el('span', { class: 'lv' }, n[0]), n[1]), n[2].map(k => mk(k, false))) : el('div', { class: 'tree', style: 'margin:4px 0 4px 16px;border-left:2px solid var(--line);padding-left:10px' }, el('span', { class: 'lv', style: 'font-size:.72em;color:var(--teal);text-transform:uppercase;letter-spacing:.08em;margin-right:6px' }, n[0]), n[1]);
  r.append(mk(T, true), el('div', { class: 'wh', style: 'margin-top:8px' }, 'A failure mode can only be found inside a box, or at a joint that has been drawn as a box.'));
};
W.scope = r => {
  head(r, 'Scoping: 28 elements screened down to 12', 'Automotive transmission example (Bertsche §3.1.3).');
  r.append(el('div', { class: 'row', style: 'gap:24px;align-items:flex-start' }, dotGrid(28, 7, i => i < 12 ? 'a' : ''),
    el('div', { style: 'flex:1;min-width:200px' }, stats([['12', 'reliability-relevant: shafts, gears, fitting-key connections, bearings, radial seal rings'], ['16', 'screened out of the detailed analysis by ABC classification, pre-calculation and experience', 't']]))));
};
W.rbd = r => {
  head(r, 'Series versus parallel — system reliability calculator', 'Same blocks, two logical structures. Hover the chart.');
  const c = el('div', {}), st = el('div', { class: 'stats' });
  const ch = lineChart(c, { xlab: 'Number of blocks', ylab: 'System reliability', yfmt: v => v.toFixed(3), snap: true, h: 260, tipHead: x => x + ' block' + (x > 1 ? 's' : '') });
  let n, R;
  const up = () => {
    const s = [], p = []; for (let k = 1; k <= 12; k++) { s.push([k, Math.pow(R.v, k)]); p.push([k, 1 - Math.pow(1 - R.v, k)]); }
    const rs = Math.pow(R.v, n.v), rp = 1 - Math.pow(1 - R.v, n.v);
    ch.draw({ x: [1, 12], y: [0, 1], series: [{ name: 'Series: product of R', color: 'var(--rose)', pts: s }, { name: 'Parallel: 1 − product of (1 − R)', color: 'var(--teal)', pts: p }], marks: [{ x: n.v, y: rs, color: 'var(--rose)' }, { x: n.v, y: rp, color: 'var(--teal)' }] });
    setStats(st, [[rs.toFixed(4), `series system of ${n.v} blocks`, 'r'], [rp >= 0.99995 ? '> 0.9999' : rp.toFixed(4), `parallel group of ${n.v} blocks`, 't'], [num((1 - rs) / (1 - R.v), 3) + ' ×', 'series unreliability versus one block']]);
  };
  n = slider('Number of blocks', 1, 12, 1, 5, v => String(v), up); R = slider('Reliability of each block', 0.5, 0.999, 0.001, 0.99, v => v.toFixed(3), up);
  const set = (a, b) => () => { n.set(a); R.set(b); up(); };
  const pb = presetBar([['5 blocks at 0.99', set(5, 0.99)], ['12 blocks at 0.99', set(12, 0.99)], ['2 redundant blocks at 0.90', set(2, 0.9)], ['4 mediocre blocks at 0.80', set(4, 0.8)]]);
  r.append(pb, n.el, R.el, c, st); pb.pick(0);
};
W.clutch = r => {
  head(r, 'One piece of hardware, two block diagrams — the free-wheel clutch', 'Switch the failure mode being analysed and the logical structure changes.');
  const svg = S('svg', { viewBox: '0 0 520 150', style: 'width:100%;max-width:520px;display:block' }), out = el('div', { class: 'out' }), st = el('div', { class: 'stats' });
  let mode = 0, qi, qc;
  const box = (x, y, t, col) => [S('rect', { x, y, width: 110, height: 44, rx: 8, fill: 'var(--bg)', stroke: col, 'stroke-width': 2 }), S('text', { x: x + 55, y: y + 27, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 14 }, t)];
  const ln = (x1, y1, x2, y2) => S('line', { x1, y1, x2, y2, stroke: 'var(--mute)', 'stroke-width': 2 });
  const up = () => {
    svg.replaceChildren();
    if (mode === 0) svg.append(ln(20, 75, 90, 75), ...box(90, 53, 'Clutch 1', 'var(--rose)'), ln(200, 75, 300, 75), ...box(300, 53, 'Clutch 2', 'var(--rose)'), ln(410, 75, 500, 75));
    else svg.append(ln(20, 75, 110, 75), ln(110, 35, 110, 115), ln(110, 35, 200, 35), ln(110, 115, 200, 115), ...box(200, 13, 'Clutch 1', 'var(--teal)'), ...box(200, 93, 'Clutch 2', 'var(--teal)'), ln(310, 35, 400, 35), ln(310, 115, 400, 115), ln(400, 35, 400, 115), ln(400, 75, 500, 75));
    const pi = 1 - Math.pow(1 - qi.v, 2), pc = qc.v * qc.v;
    out.innerHTML = mode === 0 ? '<b>Failure mode "interruption"</b> — a clutch stops transmitting torque. The system fails if <b>either</b> clutch fails: a <b class="warn">series</b> structure.' : '<b>Failure mode "clamping"</b> — a clutch locks up when it should not. The system fails only if <b>both</b> clamp, because the other still carries the torque: a <b class="good">parallel</b> structure.';
    setStats(st, [[pi.toFixed(4), 'P(system interruption) = 1 − (1 − q)²', 'r'], [pc.toFixed(4), 'P(system clamping) = q²', 't'], [((1 - pi) * (1 - pc)).toFixed(4), 'system reliability: both partial structures in series']]);
  };
  qi = slider('P(interruption), each clutch', 0, 0.2, 0.005, 0.05, v => v.toFixed(3), up); qc = slider('P(clamping), each clutch', 0, 0.2, 0.005, 0.05, v => v.toFixed(3), up);
  const pb = presetBar([['Failure mode: interruption', () => { mode = 0; up(); }], ['Failure mode: clamping', () => { mode = 1; up(); }]], 'Analyse:');
  r.append(pb, svg, out, qi.el, qc.el, st); pb.pick(0);
};
W.brake = r => {
  head(r, 'The audit finding: three analysed items, two unowned joints', 'Bicycle-brake DFMEA from the chapter.');
  const svg = S('svg', { viewBox: '0 0 560 120', style: 'width:100%;max-width:560px;display:block' });
  ['Brake lever', 'Brake pad', 'Brake caliper'].forEach((t, i) => svg.append(S('rect', { x: 20 + i * 190, y: 30, width: 130, height: 50, rx: 8, fill: 'var(--bg)', stroke: 'var(--teal)', 'stroke-width': 2 }), S('text', { x: 85 + i * 190, y: 60, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 14 }, t), S('text', { x: 85 + i * 190, y: 100, 'text-anchor': 'middle', fill: 'var(--teal)', 'font-size': 11 }, 'own functions, own failure modes')));
  [0, 1].forEach(i => svg.append(S('line', { x1: 150 + i * 190, y1: 55, x2: 210 + i * 190, y2: 55, stroke: 'var(--rose)', 'stroke-width': 3, 'stroke-dasharray': '6 5' }), S('text', { x: 180 + i * 190, y: 22, 'text-anchor': 'middle', fill: 'var(--rose)', 'font-size': 11, 'font-weight': 700 }, 'interaction never analysed')));
  r.append(svg);
};
W.pump = r => {
  head(r, 'Infusion pump — block diagram and budget, before and after the interface review', 'Switch between the two states, then drag the interface share to see what it takes from the other blocks.');
  const svg = S('svg', { viewBox: '0 0 640 70', style: 'width:100%;display:block;margin:6px 0' });
  const draw = five => {
    svg.replaceChildren();
    const B = five ? ['User Interface', 'Electronics', 'Motor/Drive', 'Interface', 'Fluidics'] : ['User Interface', 'Electronics', 'Motor/Drive', 'Fluidics'], w = five ? 104 : 130, g = (640 - B.length * w) / (B.length + 1);
    B.forEach((t, i) => { const x = g + i * (w + g), hot = t === 'Interface'; svg.append(S('line', { x1: x - g, y1: 35, x2: x, y2: 35, stroke: 'var(--mute)', 'stroke-width': 2 }), S('rect', { x, y: 13, width: w, height: 44, rx: 8, fill: 'var(--bg)', stroke: hot ? 'var(--amber)' : 'var(--teal)', 'stroke-width': hot ? 3 : 2 }), S('text', { x: x + w / 2, y: 40, 'text-anchor': 'middle', fill: hot ? 'var(--amber)' : 'var(--ink)', 'font-size': 13, 'font-weight': hot ? 700 : 400 }, hot ? 'Drive coupling' : t)); });
    svg.append(S('line', { x1: 640 - g, y1: 35, x2: 640, y2: 35, stroke: 'var(--mute)', 'stroke-width': 2 }));
  };
  r.append(svg);
  apportion(r, { total: -Math.log(0.9) / 5000, start: 1, presets: [
    { name: 'Before review: four blocks', on: () => draw(false), items: [['Fluidics', 30], ['Motor/Drive', 25], ['Electronics', 30], ['User Interface', 15], ['Drive-to-Fluidics Interface', 0, 1]] },
    { name: 'After review: interface owns 8%', on: () => draw(true), items: [['Fluidics', 27.6], ['Motor/Drive', 23], ['Electronics', 27.6], ['User Interface', 13.8], ['Drive-to-Fluidics Interface', 8, 1]] }] });
};
