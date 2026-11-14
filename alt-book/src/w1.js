/* Chapter 1 interactive elements */
W.recall = r => {
  head(r, 'Recall campaigns, Germany 1998 → 2006', 'Figures quoted in the chapter (Kraftfahrt-Bundesamt, via Bertsche Fig. 1.2).');
  r.append(stats([['55', 'safety recall campaigns, 1998'], ['167', 'safety recall campaigns, 2006', 'r'], ['× 3', 'campaign count'], ['× 8', 'associated cost', 'r']]));
  const b = el('div', {}); r.append(b);
  barChart(b, [{ label: '1998 campaigns', value: 55, text: '55' }, { label: '2006 campaigns', value: 167, color: 'var(--rose)', text: '167' }]);
};
W.defmap = r => {
  head(r, 'Every word of the definition is a part of this book', 'Tap a highlighted phrase.');
  const D = [
    ['the probability', 'Parts IV and V — Defining Stresses, Test Program Design', 'Probability of failure is driven by the stresses the product actually experiences relative to its capability, which is why stress definition and test design are inseparable.'],
    ['does not fail', 'Part III — DFMEA and Risk Matrices', 'Before you can test for failure you have to enumerate what failure looks like, how it happens, and how bad each mode is.'],
    ['stated functional and environmental conditions', 'Part I — Requirements and Functional Definition', 'If you have not defined what the product must do and where it will live, you cannot define what failure means.'],
    ['a defined period of time', 'Part II — Duty Cycle Development', 'Time is almost never wall-clock hours; it is a duty cycle in the units that actually damage the product: cycles, miles, switch reversals, thermal excursions.']];
  const out = el('div', { class: 'out' }, 'Reliability is a moving target after launch too — that is Part VI, closing the loop.');
  const sp = D.map(d => el('span', { class: 'ph', onclick: e => { sp.forEach(s => s.classList.remove('on')); e.target.classList.add('on'); out.innerHTML = `<b>${d[1]}</b><br>${d[2]}`; } }, d[0]));
  r.append(el('p', { class: 'defs', style: 'font-size:1.15em;line-height:1.9' }, 'Reliability is ', sp[0], ' that a product ', sp[1], ' under ', sp[2], ' during ', sp[3], '.'), out);
};
W.warranty = r => {
  head(r, 'What 8–12% of turnover looks like', 'Move the slider to your own annual turnover.');
  const st = el('div', {});
  const f = v => '$' + (v >= 1000 ? (v / 1000).toFixed(v % 1000 ? 1 : 0) + ' bn' : v + ' M');
  const up = v => setStats(st, [[f(Math.round(v * .08)), 'warranty cost at 8%'], [f(Math.round(v * .12)), 'warranty cost at 12%', 'r'], [f(Math.round(v * .04)), 'width of that range', 't']]);
  const s = slider('Annual turnover', 10, 10000, 10, 500, f, up);
  r.append(presetBar([['Small manufacturer, $50 M', () => { s.set(50); up(50); }], ['Mid-size, $500 M', () => { s.set(500); up(500); }], ['Large OEM, $5 bn', () => { s.set(5000); up(5000); }]], 'Examples:'), s.el, stats([]));
  r.lastChild.replaceWith(st); st.className = 'stats'; up(500);
};
W.ruleoften = r => {
  head(r, 'The Rule of Ten — cost of the same defect by the phase it is found in', 'Logarithmic cost axis. Hover the chart; change the escalation factor to see how sensitive the argument is. Illustrative model of Bertsche Fig. 1.5.');
  const ph = ['Design', 'Development / validation', 'Production', 'Field'];
  const c = el('div', {}), st = el('div', { class: 'stats' });
  const ch = lineChart(c, { ylog: true, snap: true, ylab: 'Cost per defect', yfmt: v => '$' + num(v), tipHead: x => ph[x], aria: 'Rule of ten chart' });
  let s1, s2;
  const up = () => {
    const base = s1.v, k = s2.v, pts = ph.map((_, i) => [i, base * Math.pow(k, i)]);
    ch.draw({ x: [-0.3, 3.3], y: [10, 1e7], xticks: ph.map((p, i) => [i, p]), series: [{ name: 'Cost to correct', color: 'var(--amber)', pts, dots: true }], bands: [{ x0: -0.3, x1: 1.5, color: 'var(--teal)', label: 'failure prevention — chance to act' }, { x0: 1.5, x1: 3.3, color: 'var(--rose)', label: 'failure detection — need to react' }] });
    setStats(st, [['$' + num(base), 'caught in design', 't'], ['$' + num(pts[3][1]), 'caught in the field', 'r'], ['× ' + num(Math.pow(k, 3)), 'penalty for waiting']]);
  };
  s1 = slider('Cost if caught in design', 50, 5000, 50, 100, v => '$' + num(v), up);
  s2 = slider('Escalation per phase', 2, 15, 1, 10, v => '× ' + v, up);
  const set = (a, b) => () => { s1.set(a); s2.set(b); up(); };
  const pb = presetBar([['Rule of Ten (×10)', set(100, 10)], ['Milder escalation (×5)', set(100, 5)], ['Costly design change, ×10', set(2000, 10)]]);
  r.append(pb, s1.el, s2.el, c, st); pb.pick(0);
};
W.bathtub = r => {
  head(r, 'The bathtub curve — three failure populations added together', 'Hover the curve to see which region dominates and which kind of test finds it. Shapes are illustrative, not data.');
  const R = [['Region 1 — early failures', 'Assembly errors, production defects, material lot problems, latent design flaws', 'ESS / HASS, burn-in, production process control', 'var(--rose)'],
  ['Region 2 — random failures', 'Operational misuse, maintenance errors, contamination, externally induced events', 'Field monitoring, FRACAS, durability and performance testing under realistic conditions', 'var(--teal)'],
  ['Region 3 — wear-out failures', 'Fatigue, material aging, corrosion, wear', 'Accelerated life testing, durability testing, life-stress modeling', 'var(--amber)']];
  let a, l, n;
  const comp = t => [a.v * 0.5 * Math.pow(t, -0.5), l.v, 4 / n.v * Math.pow(t / n.v, 3)];
  const c = el('div', {});
  const ch = lineChart(c, {
    xlab: 'Product age (relative units)', ylab: 'Failure rate', yfmt: v => v.toFixed(2),
    tipExtra: x => { const k = comp(x), i = k.indexOf(Math.max(...k)); return `<br><b style="color:${R[i][3]}">${R[i][0]}</b><br>Causes: ${R[i][1]}<br>Found by: ${R[i][2]}`; }
  });
  const up = () => {
    const xs = []; for (let t = 0.05; t <= 10.001; t += 0.05) xs.push(t);
    const mk = j => xs.map(t => [t, comp(t)[j]]);
    ch.draw({ x: [0, 10], y: [0, 0.6], series: [{ name: 'Early failures', color: R[0][3], pts: mk(0), dash: '5 4', width: 1.5 }, { name: 'Random failures', color: R[1][3], pts: mk(1), dash: '5 4', width: 1.5 }, { name: 'Wear-out', color: R[2][3], pts: mk(2), dash: '5 4', width: 1.5 }, { name: 'Total failure rate', color: 'var(--ink)', pts: xs.map(t => [t, comp(t).reduce((p, q) => p + q, 0)]), width: 3 }] });
  };
  a = slider('Early-failure level', 0, 0.3, 0.01, 0.08, v => v.toFixed(2), up);
  l = slider('Random-failure level', 0, 0.2, 0.01, 0.06, v => v.toFixed(2), up);
  n = slider('Wear-out onset (characteristic life)', 5, 14, 0.5, 9, v => v.toFixed(1), up);
  const set = (x, y, z) => () => { a.set(x); l.set(y); n.set(z); up(); };
  const pb = presetBar([['Typical product', set(0.08, 0.06, 9)], ['Poor production quality', set(0.28, 0.06, 9)], ['Well screened, wears out early', set(0.01, 0.03, 6)], ['Electronics, long useful life', set(0.05, 0.04, 14)]]);
  r.append(pb, a.el, l.el, n.el, c,
    el('div', { class: 'cards' }, R.map((x, i) => el('div', { class: 'card', style: `border-top:3px solid ${x[3]};cursor:default` }, el('div', { class: 'n' }, 'Region ' + (i + 1)), el('h4', {}, x[0].split('— ')[1]), el('div', {}, x[1]), el('div', { style: 'margin-top:6px;color:var(--mute)' }, 'Found by: ' + x[2])))));
  pb.pick(0);
};
W.pipeline = r => {
  head(r, 'One pipeline, in order — what breaks when a step is skipped', 'Tap a part to skip it and read the consequence. Tap again to restore it.');
  const P = [['I', 'Requirements', 'No function-based failure definition: the test can be run flawlessly and still verify a requirement too vague to pass or fail.'],
  ['II', 'Duty cycle', 'Every acceleration factor, DFMEA occurrence rating and test specification now rests on a usage assumption nobody validated.'],
  ['III', 'DFMEA and risk', 'No ranked list of what can go wrong: the test targets a failure mode that was never flagged as high risk, and misses the one that was.'],
  ['IV', 'Stress definition', 'Stress level, life-stress model and acceleration factor are assumed rather than grounded in material properties.'],
  ['V', 'Test design', 'The wrong test type for the bathtub region: a HALT asked to find wear-out, or a six-month life test asked to find a workmanship defect.'],
  ['VI', 'Closing the loop', 'Field and warranty data never reach the DFMEA, so the same failure modes are rediscovered generation after generation.']];
  const out = el('div', { class: 'out' }, 'All six parts in place: each step hands a validated input to the next.');
  const cards = P.map((p, i) => el('div', { class: 'card', onclick: () => { const on = cards[i].classList.toggle('on'); cards.forEach((c, j) => { if (j !== i) c.classList.remove('on'); }); out.innerHTML = on ? `<b class="warn">Part ${p[0]} skipped.</b> ${p[2]}` : 'All six parts in place: each step hands a validated input to the next.'; } }, el('div', { class: 'n' }, 'Part ' + p[0]), el('h4', {}, p[1])));
  r.append(el('div', { class: 'cards', style: 'grid-template-columns:repeat(auto-fit,minmax(120px,1fr))' }, cards), out);
};
W.lifecycle = r => {
  head(r, 'Reliability methods across the product life cycle', 'Tap a stage to see the toolkit the chapter assigns to it (after Bertsche Fig. 1.4).');
  const L = [['Planning', 'Fuzzy data and accumulated know-how.'], ['Conception', 'Target-setting and specifications.'], ['Design', 'FMEA, FTA, and Weibull / exponential life modeling do the heavy lifting.'], ['Production', 'Statistical process control and quality audits.'], ['Field usage', 'Data collection and early-warning systems.'], ['Recycling', 'Recycling-potential and remaining-lifetime analysis.']];
  const out = el('div', { class: 'out' });
  const chips = L.map((x, i) => el('button', { class: 'chip', onclick: () => { chips.forEach(c => c.classList.remove('on')); chips[i].classList.add('on'); out.innerHTML = `<b>${x[0]}.</b> ${x[1]}` + (i > 0 && i < 5 ? ' <span class="good">Covered by this book\'s design-and-verification slice.</span>' : ''); } }, (i + 1) + ' · ' + x[0]));
  r.append(el('div', { class: 'chips' }, chips), out); chips[2].click();
};
W.resistor = r => {
  head(r, 'Same fix, growing blast radius — the resistor tolerance case', 'Step through the stage at which the problem is discovered. The engineering fix never changes; what has to be redone does.');
  const St = [['Feasibility', 'No effect on feasibility at all — a different resistor value is a paper change.'], ['Development / design', 'Mildly annoying; economic impact only slightly greater than at feasibility.'], ['Design validation', 'Not much worse than development — a few additional validation tests confirm the correction.'], ['Production ramp', 'Now significant: the design is revalidated and production tooling and process are reset.'], ['Production validation', 'Same as ramp, plus schedule loss and a missed production start; possible contractual penalties.'], ['Full production', 'Major emergency: lines stop or every unit is reworked, deliveries are missed.'], ['Field / service', 'Product is in customers\' hands: lost customers, service and repair cost — and product liability if the overcurrent causes harm.']];
  const C = ['Change the resistor value', 'Extra validation tests', 'Revalidate the design', 'Reset tooling / process', 'Schedule loss, penalties', 'Line stop or 100% rework', 'Service, lost customers, liability'];
  const out = el('div', { class: 'out' }), chips = el('div', { class: 'chips' });
  const up = v => { out.innerHTML = `<b>Discovered at: ${St[v][0]}.</b> ${St[v][1]}`; chips.replaceChildren(...C.map((c, i) => el('span', { class: 'chip ' + (i === 0 ? 'ok' : i <= v && (i !== 1 || v >= 2) ? 'bad' : 'off'), style: 'cursor:default' }, c))); };
  const s = slider('Stage discovered', 0, 6, 1, 0, v => (v + 1) + ' of 7', up);
  r.append(presetBar([['Caught at feasibility', () => { s.set(0); up(0); }], ['Caught at production ramp', () => { s.set(3); up(3); }], ['Escaped to the field', () => { s.set(6); up(6); }]]), s.el, out, el('div', { class: 'wh' }, 'What applying the fix now involves:'), chips); up(0);
};
