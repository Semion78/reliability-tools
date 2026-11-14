#!/usr/bin/env python3
"""Generate the ebook narration with ElevenLabs.

Reads narration/chNN/sNN.txt and writes audio/chNN/sNN.mp3 (the names the ebook player looks for).
Uses only the Python standard library. Your API key is read from the ELEVENLABS_API_KEY
environment variable or pasted at the prompt; it is never written to disk.

    python3 make_audio.py --test            one short section (ch01/s00) to check the voice
    python3 make_audio.py ch01              one chapter
    python3 make_audio.py                   everything not generated yet
    python3 make_audio.py --voice menu      pick a different voice from a list (default: the book voice)
    python3 make_audio.py --dry-run         show the plan and the credit cost, generate nothing
    python3 make_audio.py --redo ch02/s03   regenerate one section (overwrites its MP3)
"""
import argparse, json, os, shutil, subprocess, sys, tempfile, time, urllib.error, urllib.request

API = 'https://api.elevenlabs.io/v1'
HERE = os.path.dirname(os.path.abspath(__file__))
MODEL_LIMIT = {'eleven_multilingual_v2': 10000, 'eleven_v3': 5000, 'eleven_flash_v2_5': 40000, 'eleven_turbo_v2_5': 40000}


def curl(path, key, body):
    """Fallback for Macs where Python has no SSL certificates installed: use the system curl."""
    out = tempfile.NamedTemporaryFile(delete=False); out.close()
    cfg = 'header = "xi-api-key: %s"\nheader = "Content-Type: application/json"\n' % key
    cmd = ['curl', '-sS', '--config', '-', '-o', out.name, '-w', '%{http_code}', '--max-time', '600']
    if body is not None:
        bf = tempfile.NamedTemporaryFile(delete=False, suffix='.json'); bf.write(json.dumps(body).encode()); bf.close()
        cmd += ['--data-binary', '@' + bf.name]
    r = subprocess.run(cmd + [API + path], input=cfg, capture_output=True, text=True)
    data = open(out.name, 'rb').read(); os.unlink(out.name)
    if body is not None: os.unlink(bf.name)
    if r.returncode != 0: raise Fail(f'Could not reach ElevenLabs ({r.stderr.strip()}). Check your internet connection.')
    return int(r.stdout.strip() or 0), data


class Fail(Exception): pass
USE_CURL = [False]


def call(path, key, body=None, binary=False):
    for attempt in range(5):
        code, data = 0, b''
        if not USE_CURL[0]:
            req = urllib.request.Request(API + path, headers={'xi-api-key': key, 'Content-Type': 'application/json'},
                                         data=json.dumps(body).encode() if body is not None else None)
            try:
                with urllib.request.urlopen(req, timeout=600) as r: code, data = r.status, r.read()
            except urllib.error.HTTPError as e: code, data = e.code, e.read()
            except (urllib.error.URLError, OSError) as e:
                if shutil.which('curl'): USE_CURL[0] = True
                elif attempt < 4: time.sleep(5); continue
                else: raise Fail(f'Could not reach ElevenLabs: {e}')
        if USE_CURL[0]: code, data = curl(path, key, body)
        if code == 200: return data if binary else json.loads(data)
        if code in (429, 500, 502, 503, 504) and attempt < 4:
            wait = 5 * (attempt + 1); print(f'   server said {code}, retrying in {wait}s'); time.sleep(wait); continue
        msg = data.decode(errors='replace')[:500]
        hint = ''
        if code == 401: hint = '\n-> The API key was not accepted, or it lacks permission. In ElevenLabs, create a key with Text to Speech access (unrestricted is simplest) and paste it again.'
        elif 'voice_not_found' in msg or code == 404: hint = '\n-> This voice is not in your account. In ElevenLabs, add the voice to "My Voices" first, or run with --voice menu to pick one you have.'
        elif 'quota' in msg: hint = '\n-> Not enough credits left on your plan for this section.'
        elif 'free' in msg.lower() or code == 402 or 'subscription' in msg.lower(): hint = '\n-> Your plan may not allow this voice or API use. Library voices need a paid plan.'
        raise Fail(f'ElevenLabs returned an error ({code}): {msg}{hint}')


def sections(filters):
    out, root = [], os.path.join(HERE, 'narration')
    for ch in sorted(d for d in os.listdir(root) if os.path.isdir(os.path.join(root, d))):
        for f in sorted(os.listdir(os.path.join(root, ch))):
            if not f.endswith('.txt'): continue
            name = f'{ch}/{f[:-4]}'
            if filters and not any(name == x or ch == x for x in filters): continue
            text = open(os.path.join(root, ch, f), encoding='utf-8').read().strip()
            out.append((name, text, os.path.join(HERE, 'audio', ch, f[:-4] + '.mp3')))
    return out


def main():
    ap = argparse.ArgumentParser(description='Generate ebook narration MP3s with ElevenLabs.')
    ap.add_argument('only', nargs='*', help='chapters or sections to do, e.g. ch01 or ch02/s03 (default: all)')
    ap.add_argument('--voice', default='DNmwMXfojnBmPpvBIyld', help='ElevenLabs voice ID (default: the book voice; pass --voice menu to choose from a list)')
    ap.add_argument('--model', default='eleven_multilingual_v2')
    ap.add_argument('--test', action='store_true', help='generate only ch01/s00')
    ap.add_argument('--redo', action='store_true', help='regenerate even if the MP3 already exists')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--stability', type=float, default=0.5)
    ap.add_argument('--similarity', type=float, default=0.75)
    ap.add_argument('--speed', type=float, default=1.0)
    a = ap.parse_args()

    todo = sections(['ch01/s00'] if a.test else a.only)
    if not todo: sys.exit('No matching narration files found. Run this from the ebook folder, next to the narration folder.')
    skipped = [s for s in todo if os.path.exists(s[2]) and not a.redo and not a.test]
    todo = [s for s in todo if s not in skipped]
    need = sum(len(t) for _, t, _ in todo)
    print(f'{len(todo)} section(s) to generate, {need:,} characters. {len(skipped)} already done and skipped.')
    limit = MODEL_LIMIT.get(a.model)
    too_long = [n for n, t, _ in todo if limit and len(t) > limit]
    if too_long: sys.exit(f'These sections are longer than the {limit:,}-character limit of {a.model}: {", ".join(too_long)}')
    if not todo: return
    if a.dry_run:
        for n, t, _ in todo: print(f'   {n}  {len(t):>6,} characters')
        return

    key = os.environ.get('ELEVENLABS_API_KEY') or input('Paste your ElevenLabs API key and press Return: ').strip()
    if not key: sys.exit('No API key given.')

    try:
        sub = call('/user/subscription', key)
        left = sub.get('character_limit', 0) - sub.get('character_count', 0)
        print(f'Plan: {sub.get("tier", "?")}. Credits left this period: {left:,}.')
    except Fail:
        left = None; print('Could not read your credit balance with this key (that is fine); continuing.')
    if left is not None and need > left:
        fit, run = [], 0
        for s in todo:
            if run + len(s[1]) > left: break
            fit.append(s); run += len(s[1])
        print(f'Not enough credits for everything ({need:,} needed). {len(fit)} section(s) fit now ({run:,} characters); run the script again after your credits renew and it will continue where it stopped.')
        todo, need = fit, run
        if not todo: return

    voice = a.voice
    if voice == 'menu':
        vs = call('/voices', key).get('voices', [])
        vs.sort(key=lambda v: (v.get('category') not in ('cloned', 'professional'), v.get('name', '')))
        print('\nYour voices:')
        for i, v in enumerate(vs, 1): print(f'  {i:>2}. {v.get("name")}  [{v.get("category", "")}]')
        pick = input('Number of the voice to use: ').strip()
        if not pick.isdigit() or not 1 <= int(pick) <= len(vs): sys.exit('Not a valid choice.')
        voice = vs[int(pick) - 1]['voice_id']
        print(f'Using {vs[int(pick) - 1]["name"]} ({voice}).')

    print(f'Voice ID: {voice}')
    if input(f'\nGenerate {len(todo)} section(s) for about {need:,} credits? [y/N] ').strip().lower() != 'y': return
    for i, (name, text, dest) in enumerate(todo, 1):
        print(f'[{i}/{len(todo)}] {name}  ({len(text):,} characters) ...', end=' ', flush=True)
        audio = call(f'/text-to-speech/{voice}?output_format=mp3_44100_128', key, binary=True, body={
            'text': text, 'model_id': a.model,
            'voice_settings': {'stability': a.stability, 'similarity_boost': a.similarity, 'speed': a.speed}})
        os.makedirs(os.path.dirname(dest), exist_ok=True)
        with open(dest + '.part', 'wb') as f: f.write(audio)
        os.replace(dest + '.part', dest)
        print(f'saved {os.path.relpath(dest, HERE)} ({len(audio) / 1e6:.1f} MB)')
    print('\nDone. Open the chapter in your browser: the player badge should read "Studio audio".')


if __name__ == '__main__':
    try: main()
    except Fail as e: print('\nSTOPPED: ' + str(e))
    except KeyboardInterrupt: print('\nCancelled.')
    except Exception as e: print(f'\nSTOPPED with an unexpected error: {type(e).__name__}: {e}\nCopy this message to Claude.')
