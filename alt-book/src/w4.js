/* Chapter 4 interactive elements */
W.hoq = r => {
  head(r, 'House of Quality — small electric motor', 'Change an importance rating, or tap a cell to cycle the relationship score 0 → 1 → 3 → 9. Customer requirements and engineering characteristics are those named in the chapter; the scores are illustrative, not the figures printed in the source.');
  const WH = ['Adequate starting torque', 'Low noise (under 40 dB)', 'Low cost (under $15)', '5,000-hour durability', 'High reliability', 'Low weight (under 0.3 kg)', 'Short replacement time (under 10 min)'];
  const HW = ['Magnet material', 'Bearing type', 'Brush spring pressure', 'Housing construction', 'Stator winding design', 'Terminal attachment', 'Mounting design'];
  const M0 = [[9, 0, 1, 0, 9, 0, 0], [0, 9, 3, 9, 0, 0, 9], [3, 3, 0, 3, 3, 1, 1], [0, 9, 9, 1, 0, 1, 0], [0, 9, 3, 3, 3, 3, 3], [3, 0, 0, 9, 1, 0, 3], [0, 0, 0, 3, 0, 3, 9]];
  let M, imp;
  const tw = el('div', { class: 'tw' }), bars = el('div', {}), out = el('div', { class: 'out' });
  const render = () => {
    const tot = HW.map((_, j) => WH.reduce((a, _, i) => a + imp[i] * M[i][j], 0));
    const t = el('table', { class: 'hoq' }, el('tr', {}, el('th', {}, 'Customer requirement'), el('th', {}, 'Imp.'), HW.map(h => el('th', {}, h))),
      WH.map((w, i) => el('tr', {}, el('td', {}, w), el('td', {}, (() => { const s = el('select', { onchange: e => { imp[i] = +e.target.value; pb.clear(); render(); } }, [1, 2, 3, 4, 5].map(v => el('option', Object.assign({ value: v }, v === imp[i] ? { selected: '' } : {}), v))); return s; })()),
        HW.map((_, j) => el('td', { class: 'c c' + M[i][j], onclick: () => { M[i][j] = { 0: 1, 1: 3, 3: 9, 9: 0 }[M[i][j]]; render(); } }, M[i][j] || '·')))),
      el('tr', { class: 'tot' }, el('td', {}, 'Importance-weighted total'), el('td', {}, ''), tot.map(v => el('td', {}, v))));
    tw.replaceChildren(t);
    const rk = HW.map((h, j) => ({ label: h, value: tot[j] })).sort((a, b) => b.value - a.value);
    rk.forEach((k, i) => k.color = i < 3 ? 'var(--amber)' : 'var(--teal)');
    barChart(bars, rk);
    out.innerHTML = `Highest-scoring characteristics: <b>${rk.slice(0, 3).map(k => k.label).join(', ')}</b>. These are where to spend engineering effort and test budget, and the natural candidates for a tighter reliability allocation. <span style="color:var(--mute)">Roof conflict to keep in view: a thicker housing wall helps stiffness and noise but costs weight and money.</span>`;
  };
  const set = v => () => { imp = v.slice(); M = M0.map(x => x.slice()); render(); };
  const pb = presetBar([['Balanced customer', set([5, 4, 3, 4, 5, 2, 2])], ['Noise-sensitive customer', set([3, 5, 2, 3, 3, 2, 1])], ['Cost-driven customer', set([4, 2, 5, 2, 3, 3, 1])], ['Service-driven customer', set([3, 2, 2, 3, 4, 1, 5])]]);
  r.append(pb, tw, bars, out); pb.pick(0);
};
W.boundary = r => {
  head(r, 'Gearbox boundary diagram — five interfaces crossing the boundary', 'Tap an interface.');
  const I = [['Input shaft / coupling', 'Motor output shaft', 'Torque and rotational speed transfer'], ['Output shaft / coupling', 'Driven load (conveyor, pump)', 'Torque and rotational speed transfer'], ['Mounting feet / bolts', 'Machine frame', 'Structural load path, vibration transmission'], ['Breather / vent', 'Ambient atmosphere', 'Pressure equalization; moisture and contaminant ingress path'], ['Lubricant fill and drain ports', 'Maintenance access', 'Lubricant condition and level']];
  const svg = S('svg', { viewBox: '0 0 600 300', style: 'width:100%;max-width:600px;display:block' }), out = el('div', { class: 'out' });
  const P = [[90, 150], [510, 150], [300, 270], [190, 34], [410, 34]], gs = [];
  svg.append(S('rect', { x: 215, y: 105, width: 170, height: 90, rx: 12, fill: 'var(--bg)', stroke: 'var(--amber)', 'stroke-width': 3, 'stroke-dasharray': '8 5' }), S('text', { x: 300, y: 155, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 16, 'font-weight': 700 }, 'Gearbox'));
  I.forEach((x, i) => {
    const [px, py] = P[i], g = S('g', { style: 'cursor:pointer' });
    g.append(S('line', { x1: px, y1: py, x2: 300 + (px - 300) * 0.32, y2: 150 + (py - 150) * 0.42, stroke: 'var(--teal)', 'stroke-width': 2 }), S('rect', { x: px - 82, y: py - 18, width: 164, height: 36, rx: 8, fill: 'var(--panel2)', stroke: 'var(--teal)', 'stroke-width': 1.5 }), S('text', { x: px, y: py + 5, 'text-anchor': 'middle', fill: 'var(--ink)', 'font-size': 12 }, x[1]));
    g.addEventListener('click', () => { gs.forEach(k => k.querySelector('rect').setAttribute('stroke', 'var(--teal)')); g.querySelector('rect').setAttribute('stroke', 'var(--amber)'); out.innerHTML = `<b>${x[0]}</b> connects to <b>${x[1]}</b>.<br>${x[2]}.`; });
    gs.push(g); svg.append(g);
  });
  r.append(svg, out); gs[0].dispatchEvent(new Event('click'));
};
W.pdiag = r => {
  head(r, 'Gearbox P-diagram — and what each test plan actually covers', 'Switch between the original and the revised test plan; tap any factor to see how it is verified.');
  const CF = ['Gear material and heat treatment', 'Tooth profile and module', 'Bearing type and preload', 'Lubricant type and fill level', 'Housing wall thickness and stiffness', 'Seal design and material', 'Manufacturing tolerances'];
  const NF = [['Torque spikes and shock loading from driven equipment', 1, 'Cyclic and shock-overload segment: repeated torque transients above nominal, superimposed on the endurance run.'], ['Contamination ingress (dust, moisture)', 2, 'Combined dust/moisture ingress test during the endurance run.'], ['Lubricant degradation between maintenance intervals', 2, 'Lubricant charge deliberately contaminated and aged partway through the endurance run.'], ['Ambient temperature range at the site', 0, ''], ['Unit-to-unit tooth-profile variation', 0, ''], ['Installation misalignment', 0, '']];
  const ES = ['Tooth pitting or breakage', 'Bearing spalling', 'Seal leakage', 'Backlash growth', 'Overheating'];
  let rev = false; const out = el('div', { class: 'out' }), grid = el('div', { class: 'pd' }), st = el('div', { class: 'stats' });
  const up = () => {
    const chip = (t, cls, msg) => el('span', { class: 'chip ' + cls, onclick: () => { out.innerHTML = msg; } }, t);
    const bx = (h, kids, style) => el('div', { class: 'bx', style: style || '' }, el('h5', {}, h), el('div', { class: 'chips' }, kids));
    grid.replaceChildren(
      bx('Signal / intent', [chip('Input speed and torque at the motor coupling, at the specified ratio', 'ok', '<b>Signal.</b> The fixed-torque endurance test exercises exactly this nominal operating point — and only this.')]),
      el('div', { style: 'display:grid;gap:10px' },
        bx('Control factors — what the design specifies', CF.map(c => chip(c, 'ok', `<b>${c}</b> is a control factor. Verification is a design-review and drawing-check activity: was it implemented as specified? The nominal endurance test then confirms the as-built unit survives its rated point.`))),
        el('div', { class: 'bx mid' }, 'Gearbox'),
        bx('Noise factors — what the design must survive', NF.map(n => { const cov = rev && n[1] > 0; return chip(n[0], cov ? 'ok' : 'bad', cov ? `<b>${n[0]}</b> — now bounded. ${n[2]}` : n[1] ? `<b>${n[0]}</b> — not represented anywhere in a constant-nominal-torque test run with fresh lubricant in a clean laboratory.` : `<b>${n[0]}</b> — listed on the P-diagram but not addressed by ${rev ? 'the two added test segments' : 'the original test'}. It carries forward as an input to the duty-cycle work in Part II.`); }))),
      el('div', { style: 'display:grid;gap:10px' },
        bx('Ideal function', [chip('Accurate torque and speed transfer, low noise and vibration, stable temperature', 'ok', '<b>Ideal function.</b> What the gearbox is supposed to do.')]),
        bx('Error states', ES.map(e => chip(e, 'on', `<b>${e}</b> — an error state: one of the ways the gearbox can fail to deliver the ideal function. Each becomes a failure mode in the DFMEA.`)))));
    const cov = rev ? NF.filter(n => n[1]).length : 0;
    setStats(st, [[cov + ' of ' + NF.length, 'noise factors bounded by a test', cov ? 't' : 'r'], [rev ? '3' : '1', 'test segments in the plan'], [CF.length + ' of ' + CF.length, 'control factors correctly specified on the drawing', 't']]);
    out.innerHTML = rev ? 'Revised plan: the endurance run now carries a shock-overload segment and a contamination / degraded-lubricant segment.' : 'Original plan: one fixed-torque endurance test. The gearbox is not under-designed against its nominal signal — it is under-tested against noise factors nobody had written down.';
  };
  const pb = presetBar([['Original plan: fixed-torque endurance only', () => { rev = false; up(); }], ['Revised plan: after the P-diagram review', () => { rev = true; up(); }]], 'Test plan:');
  r.append(pb, grid, st, out); pb.pick(0);
};
W.review = r => {
  head(r, 'Design reviews — vague question versus specific question, and when reviews happen', 'Tap the question card to flip it; tap a milestone.');
  let f = false;
  const card = el('div', { class: 'card', style: 'font-size:1.05em;padding:16px' });
  const flip = () => { card.innerHTML = f ? '<div class="n" style="color:var(--teal)">Specific — forces a checkable answer</div><h4>"What access is provided for lubrication?"</h4>The answer can be checked against the actual drawing.' : '<div class="n" style="color:var(--rose)">Vague — anyone can answer yes</div><h4>"Has maintenance been considered?"</h4>Can be ticked off without having considered anything specific.'; f = !f; };
  card.onclick = flip; flip();
  const Ms = [['Initial design review', 'Before detailed design is released.'], ['Post-development-test review', 'At the completion of development testing.'], ['Final review', 'Production-standard drawings, before tooling commitment.']];
  const out = el('div', { class: 'out' });
  const chips = Ms.map((m, i) => el('button', { class: 'chip', onclick: () => { chips.forEach(c => c.classList.remove('on')); chips[i].classList.add('on'); out.innerHTML = `<b>${m[0]}.</b> ${m[1]} A natural point to re-verify that the P-diagram's control factors were implemented as specified and that the noise factors still match the intended use.`; } }, (i + 1) + ' · ' + m[0]));
  r.append(card, el('div', { class: 'cards' }, ['Use checklists as working tools in the design office, not only in review meetings.', 'Keep checklists relevant and current.', 'Ask specific questions, not vague generic ones.'].map((t, i) => el('div', { class: 'card', style: 'cursor:default' }, el('div', { class: 'n' }, 'Rule ' + (i + 1)), t))), el('div', { class: 'chips' }, chips), out); chips[0].click();
};
