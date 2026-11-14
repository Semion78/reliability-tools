/* Chapter 2 interactive elements */
W.speccards = r => {
  head(r, 'The four components of a reliability specification', 'Tap a card. A missing card is a hole that surfaces later, usually in a dispute.');
  const C = [['Failure definition', 'Tied to function. Is a leaking seal a failure? It depends on leak rate, on whether a routine adjustment corrects it, on the condition it occurs in. Settle it in writing, in advance.', 'Feeds Part III — DFMEA needs failure already defined.'],
  ['Environments', 'Not just in service: storage, transport, handling, maintenance and foreseeable misuse. If the designer is not told about a condition, the designer is not designing against it.', 'Feeds Part IV — stress definition needs a complete environmental description.'],
  ['Reliability requirement', 'A stated number in a verifiable form — R(t), B10 life, failure rate — in the currency that matches how the product accumulates damage.', 'Section 2.3 below.'],
  ['Verification method', 'Test bench conditions, duration, sample size, pass/fail criteria. Without it the requirement is an aspiration.', 'Feeds Part V — test design needs the method specified up front.']];
  const out = el('div', { class: 'out' });
  const cards = C.map((c, i) => el('div', { class: 'card', onclick: () => { cards.forEach(x => x.classList.remove('on')); cards[i].classList.add('on'); out.innerHTML = `<b>${i + 1}. ${c[0]}.</b> ${c[1]}<br><span class="good">${c[2]}</span>`; } }, el('div', { class: 'n' }, 'Component ' + (i + 1)), el('h4', {}, c[0])));
  r.append(el('div', { class: 'cards' }, cards), out); cards[0].click();
};
W.convert = r => {
  head(r, 'Requirement currency converter — B-life, MTTF and failure rate', 'Exponential (constant failure rate) assumption, as in the chapter. Hover the survival curve.');
  const X = el('input', { type: 'number', min: 1, max: 60, step: 1, value: 10, style: 'width:70px' }), L = el('input', { type: 'number', min: 0.1, step: 'any', value: 12, style: 'width:100px' });
  const U = el('select', {}, el('option', { value: 'y' }, 'calendar years'), el('option', { value: 'h' }, 'operating hours')), HY = el('input', { type: 'number', min: 1, max: 8760, step: 1, value: 400, style: 'width:90px' });
  const st = el('div', { class: 'stats' }), out = el('div', { class: 'out' }), c = el('div', {}), hyrow = el('span', {}, ' · powered ', HY, ' hours per year');
  const ch = lineChart(c, { ylab: 'Reliability R(t)', yfmt: v => v.toFixed(2), h: 260 });
  const up = () => {
    const x = Math.min(60, Math.max(1, +X.value || 10)) / 100, life = Math.max(1e-9, +L.value || 1), hy = Math.min(8760, Math.max(1, +HY.value || 8760)), k = -Math.log(1 - x), yrs = U.value === 'y';
    hyrow.style.display = yrs ? '' : 'none';
    const mttf = life / k, lam = k / life, unit = yrs ? 'years' : 'h';
    const items = [[num(mttf, 4) + ' ' + unit, 'MTTF = life ÷ −ln(R)'], [yrs ? num(lam, 3) : sci(lam), yrs ? 'λ, failures per calendar year' : 'λ, failures per operating hour', 't']];
    if (yrs) {
      items.push([sci(lam / hy), 'λ, failures per operating hour', 'r']);
      const ratio = 8760 / hy;
      out.innerHTML = hy >= 8760 ? 'Unit runs 24 hours a day: calendar and operating time are the same currency.' : `Reusing a 24-hour/day assumption would give λ = <b>${sci(lam / 8760)}</b> per hour and pretend the unit accumulates ${num(Math.round(8760 * life))} operating hours over ${num(life)} years. It really sees only <b>${num(Math.round(hy * life))} h</b>, so that target is about <b class="warn">${num(ratio, 3)} times too lenient</b> for the hours the unit actually runs.`;
    } else out.innerHTML = `Requirement already stated in operating hours: R(${num(life)} h) = ${(1 - x).toFixed(2)}.`;
    setStats(st, items);
    const pts = []; for (let i = 0; i <= 100; i++) { const t = 3 * life * i / 100; pts.push([t, Math.exp(-lam * t)]); }
    ch.draw({ x: [0, 3 * life], y: [0, 1], series: [{ name: 'R(t) = exp(−λt)', color: 'var(--teal)', pts, fill: true }], marks: [{ x: life, y: 1 - x, label: `B${Math.round(x * 100)} = ${num(life)} ${unit}` }], vlines: [{ x: mttf <= 3 * life ? mttf : -1, label: 'MTTF', color: 'var(--rose)' }].filter(v => v.x > 0) });
  };
  [X, L, U, HY].forEach(i => i.addEventListener('input', up));
  const set = (x, l, u, h) => () => { X.value = x; L.value = l; U.value = u; HY.value = h; up(); };
  const pb = presetBar([['§2.3: B10 = 5 years, always on', set(10, 5, 'y', 8760)], ['ECU: B10 = 12 years, 400 h/year', set(10, 12, 'y', 400)], ['Infusion pump: B10 = 5,000 h', set(10, 5000, 'h', 8760)]]);
  r.append(pb, el('div', { class: 'row' }, 'B', X, '% life = ', L, U, hyrow), st, out, c); pb.pick(1);
};
W.lognormal = r => {
  head(r, 'Annual driving distance — why the specification uses the 95th percentile', 'Lognormal population from the chapter\'s European passenger-car case. Drag the percentile.');
  const mu = Math.log(17.2), sg = 0.603, c = el('div', {}), st = el('div', { class: 'stats' });
  const pdf = x => Math.exp(-Math.pow(Math.log(x) - mu, 2) / (2 * sg * sg)) / (x * sg * Math.sqrt(2 * Math.PI));
  const ch = lineChart(c, { xlab: 'Annual distance, thousand km', ylab: 'Share of drivers (density)', yfmt: v => v.toFixed(3), h: 270 });
  const pts = []; for (let x = 0.5; x <= 80; x += 0.5) pts.push([x, pdf(x)]);
  let p, y;
  const up = () => {
    const q = Math.exp(mu + sg * invNorm(p.v / 100));
    ch.draw({ x: [0, 80], y: [0, 0.05], series: [{ name: 'All drivers', color: 'var(--teal)', pts, width: 2 }, { name: 'Covered by requirement', color: 'var(--amber)', pts: pts.filter(k => k[0] <= q), fill: true, width: 0.1, noTip: true }], vlines: [{ x: q, label: p.v + 'th percentile' }] });
    setStats(st, [[num(Math.round(q * 100) * 10) + ' km', `annual distance of the ${p.v}th-percentile driver`], [num(Math.round(q * y.v / 10) * 10000) + ' km', `over ${y.v} years at that rate`, 't'], [(100 - p.v) + '%', 'of customers drive more than the requirement assumes', 'r']]);
  };
  p = slider('Design percentile', 5, 99, 1, 95, v => v + 'th', up); y = slider('Ownership period', 5, 20, 1, 12, v => v + ' years', up);
  const pb = presetBar([['Median driver (50th)', () => { p.set(50); up(); }], ['Mean distance (≈ 62nd)', () => { p.set(62); up(); }], ['Chapter choice (95th)', () => { p.set(95); up(); }]]);
  r.append(pb, p.el, y.el, c, st, el('div', { class: 'note' }, 'Editor\'s check: the curve uses μ = ln(17.2) = 2.845 (distance in thousand km) with σ = 0.603, which reproduces the median of 17,200 km, the mean of 20,600 km and the 95th percentile of about 46,000 km stated in the text. The μ = 3.867 printed in the text does not reproduce those three figures and should be checked against the source.')); pb.pick(2);
};
W.ecuapp = r => {
  head(r, 'Apportioning the ECU budget across five subsystems', 'Drag a share and watch the allocated failure rate and equivalent B10. The preset reproduces the chapter table.');
  apportion(r, { total: -Math.log(0.9) / 12 / 400, presets: [
    { name: 'Chapter split 25/20/20/25/10', items: [['Power supply / regulation', 25], ['MCU / digital core', 20], ['Sensor interface', 20], ['Output driver / relay stage', 25], ['Connector / harness interface', 10]] },
    { name: 'Equal split', items: [['Power supply / regulation', 20], ['MCU / digital core', 20], ['Sensor interface', 20], ['Output driver / relay stage', 20], ['Connector / harness interface', 20]] },
    { name: 'Connector under-budgeted', items: [['Power supply / regulation', 27], ['MCU / digital core', 22], ['Sensor interface', 22], ['Output driver / relay stage', 27], ['Connector / harness interface', 2, 1]] }] });
};
