#!/usr/bin/env python3
"""Builds self-contained chapter HTML files + index + narration scripts from src/chNN.md.
Directives (one line each):  @@widget name | spoken description   @@formula text || spoken text
                             @@say spoken text (replaces narration of the next block)   @@note text"""
import re, json, html, os
SRC = os.path.dirname(os.path.abspath(__file__)); OUT = os.path.join(SRC, '..')
BOOK = 'Designing Accelerated Reliability Tests for New Hardware'
CH = [dict(n=1, id='ch01', part='Part 0 · Introduction', title='Why Accelerated Reliability Testing Matters', blurb='Rule of Ten, the bathtub curve, and why the six topics are one pipeline.', mins=0),
      dict(n=2, id='ch02', part='Part I · Requirements & Functional Definition', title='From Customer Needs to Testable Requirements', blurb='Turning "must last the life of the vehicle" into five numbers five engineers can be held to.'),
      dict(n=3, id='ch03', part='Part I · Requirements & Functional Definition', title='Functional Decomposition & System Structure', blurb='FMEA tree, reliability block diagrams, and the interface nobody owned.'),
      dict(n=4, id='ch04', part='Part I · Requirements & Functional Definition', title='Tools for Requirements Definition', blurb='House of Quality, the P-diagram, and design reviews that are not ceremonial.')]
SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹'; SC = '[' + SUP + ']'
supnum = lambda s: ''.join(str(SUP.index(c)) for c in s)

def inline(t, srcs):
    t = html.escape(t, quote=False)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?!\w)', r'<em>\1</em>', t)
    def fn(m):
        n = int(supnum(m.group(1)))
        return '<sup class="fn"><a href="#src-%d" title="%s">%d</a></sup>' % (n, html.escape(srcs.get(n, ''), quote=True), n)
    return re.sub(r'(?<![0-9⁻' + SUP + r'])(' + SC + r'+)', fn, t) if srcs else t

REP = [(r'Parts I–IV', 'Parts one to four'), (r'(\d)\s?–\s?(\d)', r'\1 to \2'), (r'(\d|X)\s?%', r'\1 percent'), (r'\$(\d+)\b', r'\1 dollars'), (r'fail/op-hr', 'failures per operating hour'), (r'failures/operating-hr', 'failures per operating hour'), (r'operating-hrs', 'operating hours'), (r'\be\.g\.,?', 'for example,'), (r'\bi\.e\.,?', 'that is,'),
       (r'\bvs\.?(?=\s)', 'versus'), (r'\bhrs\b', 'hours'), (r'\byrs\b', 'years'), (r'\bhr\b', 'hour'), (r'\bkm\b', 'kilometres'), (r'\bdB\b', 'decibels'), (r'\bkg\b', 'kilograms'),
       (r'\bFigs?\.', 'Figure'), (r'\bCh\.', 'Chapter'), (r'\bEq\.', 'Equation'), (r'§', 'section '), (r'DVP&amp;R|DVP&R', 'D V P and R'), (r'\bDFMEA', 'D F M E A'), (r'\bFMEA', 'F M E A'), (r'\bDRBFM\b', 'D R B F M'),
       (r'\bALT\b', 'A L T'), (r'\bESS\b', 'E S S'), (r'\bRBDs\b', 'R B Ds'), (r'\bRBD\b', 'R B D'), (r'\bQFD\b', 'Q F D'), (r'\bECU\b', 'E C U'), (r'\bB10\b', 'B ten'), (r'\bBX\b', 'B X'),
       (r'R_S\(t\)', 'R system of t'), (r'R([₁₂ₙ])\(t\)', lambda m: 'R ' + {'₁': '1', '₂': '2', 'ₙ': 'n'}[m.group(1)] + ' of t'), (r'\bR\(([^)]+)\)', r'R of \1'), (r'λ_(\w+)', r'lambda \1'), (r'λ', 'lambda'), (r'μ', 'mu'), (r'σ', 'sigma'),
       (r'exp\(', 'e to the power of ('), (r'−ln\(', 'minus the natural log of ('), (r'\bln\(', 'the natural log of ('), (r'≥', ' is at least '), (r'≤', ' is at most '), (r'≈', ' approximately '), (r'×', ' times '), (r'÷', ' divided by '),
       (r'\s*→\s*', ', then '), (r'−(?=\d)', 'minus '), (r'−', ' minus '), (r'\s=\s', ' equals '), (r'(\d)/(\w)', r'\1 over \2'), (r'(\w)/(day|year|hour|hr)\b', r'\1 per \2'), (r'(\w)\s?/\s?(\w)', r'\1 or \2'),
       (r'\s—\s', ', '), (r'—', ', '), (r'[“”"]', ''), (r'\s+', ' ')]
def speak(t):
    t = re.sub(r'\*+', '', t)
    t = re.sub(r'×\s*10⁻(' + SC + '+)', lambda m: ' times ten to the minus ' + supnum(m.group(1)), t)
    t = re.sub(r'10⁻(' + SC + '+)', lambda m: 'ten to the minus ' + supnum(m.group(1)), t)
    t = re.sub(SC + '+', '', t)
    for a, b in REP: t = re.sub(a, b, t)
    return t.strip()

def parse(md, meta):
    lines = md.split('\n')
    srcs = {}
    for i, l in enumerate(lines):
        if re.match(r'#+ Sources', l):
            for s in lines[i + 1:]:
                m = re.match(r'(\d+)\. (.*)', s)
                if m: srcs[int(m.group(1))] = re.sub(r'\*', '', m.group(2))
    out, narr, sec, say, i = [], [], [-1], [None], 0
    def seg(tag, inner, spoken, cls='', extra=''):
        if say[0] is not None: spoken, say[0] = say[0], None
        narr.append(dict(s=max(sec[0], 0), t=speak(spoken)))
        return '<%s class="seg %s" %s>%s</%s>' % (tag, cls, extra, inner, tag)
    def open_sec(title=None):
        if sec[0] >= 0: out.append('</section>')
        sec[0] += 1
        cls = 'ex' if title and title.startswith('Real-World') else 'pit' if title and 'Pitfalls' in title else 'src' if title and title.startswith('Sources') else ''
        out.append('<section id="s%d" class="%s">' % (sec[0], cls))
    open_sec()
    in_src = False
    while i < len(lines):
        l = lines[i].rstrip()
        if not l or l == '---' or l.startswith('# ') or re.match(r'\*Part .*\*$', l): i += 1; continue
        if l.startswith('@@say '): say[0] = l[6:]; i += 1; continue
        if l.startswith('@@widget '):
            name, _, desc = l[9:].partition('|')
            out.append(seg('div', '', 'Interactive figure. ' + desc.strip(), 'widget', 'data-w="%s"' % name.strip())); i += 1; continue
        if l.startswith('@@formula '):
            f, _, sp = l[10:].partition('||')
            out.append(seg('div', re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', f.strip()), sp.strip() or f, 'formula')); i += 1; continue
        if l.startswith('@@note '): out.append('<div class="note">%s</div>' % inline(l[7:], None)); i += 1; continue
        m = re.match(r'(#{2,3}) (.*)', l)
        if m:
            t = m.group(2)
            if re.match(r'Sources', t): in_src = True
            if len(m.group(1)) == 2 or in_src: open_sec(t); tag = 'h2'
            else: tag = 'h3'
            if in_src: out.append('<h2>%s</h2>' % html.escape(t))
            else: out.append(seg(tag, inline(t, None), re.sub(r'^(\d+\.\d+)\s', r'Section \1. ', t) + '.'))
            i += 1; continue
        if l.startswith('|'):
            rows = []
            while i < len(lines) and lines[i].startswith('|'):
                rows.append([c.strip() for c in lines[i].strip().strip('|').split('|')]); i += 1
            hd, body = rows[0], rows[2:]
            h = '<table><tr>' + ''.join('<th>%s</th>' % inline(c, srcs) for c in hd) + '</tr>' + ''.join('<tr>' + ''.join('<td>%s</td>' % inline(c, srcs) for c in r) + '</tr>' for r in body) + '</table>'
            sp = 'Table with %d rows. ' % len(body) + ' '.join('. '.join('%s: %s' % (a, b) for a, b in zip(hd, r) if b) + '.' for r in body)
            out.append(seg('div', h, sp, 'tw')); continue
        m = re.match(r'(-|\d+\.) ', l)
        if m:
            ol = m.group(1) != '-'; items = []
            while i < len(lines):
                x = lines[i].rstrip()
                if x.startswith('@@say '): say[0] = x[6:]; i += 1; continue
                mm = re.match(r'(-|\d+\.) (.*)', x)
                if not mm:
                    if not x and i + 1 < len(lines) and re.match(r'(-|\d+\.) |@@say ', lines[i + 1]): i += 1; continue
                    break
                txt = mm.group(2)
                if in_src: items.append('<li id="src-%d">%s</li>' % (len(items) + 1, inline(txt, None)))
                else: items.append(seg('li', inline(txt, srcs), txt))
                i += 1
            out.append('<%s>%s</%s>' % ('ol' if ol else 'ul', ''.join(items), 'ol' if ol else 'ul')); continue
        buf = [l]; i += 1
        while i < len(lines) and lines[i].strip() and not re.match(r'[#|@-]|\d+\. |---', lines[i]): buf.append(lines[i].strip()); i += 1
        t = ' '.join(buf)
        out.append(seg('p', inline(t, srcs), t))
    out.append('</section>')
    return '\n'.join(out), narr

def read(f): return open(os.path.join(SRC, f), encoding='utf-8').read()
def page(c, body, narr):
    prev = next((x for x in CH if x['n'] == c['n'] - 1), None); nxt = next((x for x in CH if x['n'] == c['n'] + 1), None)
    link = lambda x, lab: '<a class="btn" href="chapter-%02d.html">%s</a>' % (x['n'], lab) if x else '<span></span>'
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Chapter {c['n']} — {html.escape(c['title'])} | {BOOK}</title>
<style>{read('style.css')}</style></head><body>
<div id="bar"></div>
<header class="top"><button class="btn" id="menu" aria-label="Contents">☰</button><a class="btn" href="index.html">Library</a>
<span class="ttl"><b>Chapter {c['n']}</b> · {html.escape(c['title'])}</span>
<button class="btn" id="fminus" aria-label="Smaller text">A−</button><button class="btn" id="fplus" aria-label="Larger text">A+</button><button class="btn" id="theme" aria-label="Light or dark">◐</button></header>
<div class="wrap"><nav class="toc" aria-label="Sections"></nav><main>
<div class="kicker">{html.escape(c['part'])}</div><h1>Chapter {c['n']} — {html.escape(c['title'])}</h1>
{body}
<div class="navf">{link(prev, '← Chapter %d' % (c['n'] - 1))}{link(nxt, 'Chapter %d →' % (c['n'] + 1))}</div>
</main></div>
<div id="tips" class="ui" role="dialog" aria-label="Getting a more natural voice"><button class="btn" id="tipsx" style="float:right">Close</button>
<b>Getting a more natural voice</b><p>The player uses the voices installed in your browser, best first. Voices marked ★ sound much closer to a human reader than Basic ones.</p>
<p><b>Mac.</b> System Settings → Accessibility → Spoken Content → System Voice → Manage Voices. Under English, download a voice marked Premium or Enhanced (Ava, Zoe, Evan, Nathan, Allison, Samantha, Daniel, Serena). Quit and reopen the browser, then choose it in the voice list.</p>
<p><b>iPhone / iPad.</b> Settings → Accessibility → Spoken Content → Voices → English, download a Premium or Enhanced voice, then reload this page.</p>
<p><b>Microsoft Edge</b> (Mac or Windows) includes free Natural voices such as Aria, Jenny, Guy and Andrew, with nothing to install. They need an internet connection.</p>
<p><b>Chrome.</b> The Google voices are a step above Basic; downloaded Mac voices also appear here.</p>
<p>If a ★ voice still sounds rushed, set the speed to 0.9×.</p></div>
<button class="btn amber" id="hov" title="Read aloud from here" aria-label="Read aloud from here">▶</button>
<div class="player ui" role="region" aria-label="Audio narration">
<button class="btn" id="pprev" aria-label="Previous passage">⏮</button><button class="btn amber pp" id="pp" aria-label="Play">▶</button><button class="btn" id="pnext" aria-label="Next passage">⏭</button>
<span class="lbl" id="plbl">Listen to this chapter — formulas and figures are described in words</span>
<span class="badge" id="pbadge">Browser voice</span>
<select id="prate" aria-label="Speed"><option value="0.8">0.8×</option><option value="0.9">0.9×</option><option value="1" selected>1×</option><option value="1.1">1.1×</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option></select>
<select id="pvoice" aria-label="Voice"></select><button class="btn" id="ptips" title="How to get a more natural voice">Better voice</button>
<button class="btn" id="phere" title="Start reading at the passage on screen">Read from here</button><button class="btn" id="pscript" title="Download the narration script for studio text-to-speech">Script</button></div>
<script>const CH={json.dumps(dict(id=c['id'], title='Chapter %d — %s' % (c['n'], c['title'])))};const NARR={json.dumps(narr, ensure_ascii=False)};</script>
<script>{read('lib.js')}
{read('w%d.js' % c['n'])}
{read('reader.js')}</script></body></html>'''

def index():
    cards = ''.join(f'''<a class="card" href="chapter-{c['n']:02d}.html" style="text-decoration:none;color:inherit;padding:18px"><div class="n">{html.escape(c['part'])}</div><h4 style="font-size:1.15em">Chapter {c['n']} — {html.escape(c['title'])}</h4><div style="color:var(--mute)">{html.escape(c['blurb'])}</div><div class="bars" style="margin-top:12px"><div class="trk" style="height:6px"><div class="fill" data-pct="{c['id']}" style="width:0;background:var(--amber)"></div></div></div><div class="v" data-lab="{c['id']}" style="font-size:.8em;color:var(--mute);margin-top:4px">Not started</div></a>''' for c in CH)
    parts = [('II', 'Duty Cycle Development', '5–8'), ('III', 'Risk Identification — DFMEA & Risk Matrices', '9–13'), ('IV', 'Defining Stresses', '14–18'), ('V', 'Test Program Design', '19–25'), ('VI', 'Closing the Loop', '26–29')]
    soon = ''.join(f'<div class="card" style="cursor:default;opacity:.6"><div class="n">Part {a} · chapters {c}</div><h4>{html.escape(b)}</h4>In preparation</div>' for a, b, c in parts)
    return f'''<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>{BOOK} — interactive edition</title>
<style>{read('style.css')}</style></head><body>
<header class="top"><a class="btn" href="../">← All tools</a><span class="ttl"><b>ALT Book</b> · interactive edition</span><button class="btn" id="theme" aria-label="Light or dark">◐</button></header>
<main style="max-width:1000px;margin:0 auto;padding:40px 22px 80px"><div class="kicker">A practical engineering guide</div><h1>{BOOK}</h1>
<p style="max-width:700px">An interactive edition: every chapter carries the full text, charts you can drive with your own numbers, worked examples preloaded from the text, and audio narration in which formulas and figures are explained in words.</p>
<h2 style="border:0">Available chapters</h2><div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">{cards}</div>
<h2 style="border:0">Coming next</h2><div class="cards">{soon}</div></main>
<script>(function(){{const g=k=>{{try{{return localStorage.getItem('alt.'+k)}}catch(e){{return null}}}};
document.querySelectorAll('[data-pct]').forEach(e=>{{const p=+g('pct.'+e.dataset.pct)||0;e.style.width=p+'%';const l=document.querySelector('[data-lab="'+e.dataset.pct+'"]');if(p>0)l.textContent=p>=97?'Finished':p+'% read';}});
const t=()=>document.documentElement.classList.contains('light');if(g('theme')==='light')document.documentElement.classList.add('light');
document.getElementById('theme').onclick=()=>{{document.documentElement.classList.toggle('light');try{{localStorage.setItem('alt.theme',t()?'light':'dark')}}catch(e){{}}}};}})();</script></body></html>'''

os.makedirs(os.path.join(OUT, 'narration'), exist_ok=True)
for c in CH:
    body, narr = parse(read('ch%d.md' % c['n']), c)
    open(os.path.join(OUT, 'chapter-%02d.html' % c['n']), 'w', encoding='utf-8').write(page(c, body, narr))
    secs = {}
    for n in narr: secs.setdefault(n['s'], []).append(n['t'])
    txt = ''.join('\n\n===== audio/%s/s%02d.mp3 =====\n\n%s' % (c['id'], s, '\n\n'.join(v)) for s, v in secs.items())
    open(os.path.join(OUT, 'narration', c['id'] + '-narration.txt'), 'w', encoding='utf-8').write(txt.strip() + '\n')
    os.makedirs(os.path.join(OUT, 'narration', c['id']), exist_ok=True)
    for sx, v in secs.items(): open(os.path.join(OUT, 'narration', c['id'], 's%02d.txt' % sx), 'w', encoding='utf-8').write('\n\n'.join(v) + '\n')
    for s in secs: os.makedirs(os.path.join(OUT, 'audio', c['id']), exist_ok=True)
    print(c['id'], len(narr), 'segments', len(secs), 'sections', sum(len(n['t'].split()) for n in narr), 'spoken words')
open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(index())
