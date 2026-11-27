"""Foley + narration + a few kalimba notes → out/mix.wav  (48 kHz stereo). Board sounds follow the engine's strokes."""
import sys, os, json, numpy as np, soundfile as sf, soxr
HERE = os.path.dirname(os.path.abspath(__file__))
LIB = os.environ.get('LIB') or os.path.abspath(os.path.join(HERE, '..', '..'))
sys.path.insert(0, LIB)
from core.audio.sfx import SR, bp, lp, hp, noise, add, compress, limit, whoosh
ev = json.load(open(os.path.join(HERE, 'events.json'))); E = ev['ev']; DUR = ev['dur']
dur = json.load(open(os.path.join(HERE, 'voices', 'dur.json')))
rng = np.random.default_rng(7)
NS = int((DUR + 1.2) * SR)
tt = lambda d: np.arange(int(d * SR)) / SR
db = lambda x: 10 ** (x / 20)
fol, room, vo, mus = (np.zeros((NS, 2), np.float32) for _ in range(4))

# ── room tone: soft brown-ish noise + faint mains hum
n = rng.standard_normal(NS); br = lp(np.cumsum(n) / 400, 300, 2); br = br / (np.abs(br).max() + 1e-9)
t = np.arange(NS) / SR
tone = (br * .5 + .12 * np.sin(2 * np.pi * 100 * t) + lp(n, 900, 2) * .05) * .05
room[:, 0] = room[:, 1] = tone

# ── marker on a glossy board (felt hiss + body + stick-slip + occasional squeak), shaped by the hand-speed curve
_band = {}
def band(n, lo, hi):
    k = (lo, hi)
    if k not in _band: _band[k] = bp(rng.standard_normal(SR * 8), lo, hi, 2).astype(np.float32)
    b = _band[k]; i = int(rng.integers(0, len(b) - n - 1)); return b[i:i + n]
def marker(d, length, kind, pen):
    d = max(.03, d); n = int(d * SR); u = np.linspace(0, 1, n)
    v = 1 - .8 * np.cos(2 * np.pi * u)
    a = (v / 1.8) ** .8 * np.minimum(1, u * d / .006) * np.minimum(1, (1 - u) * d / .012)
    br = {'black': 1.0, 'orange': 1.12, 'blue': .92}.get(pen, 1.)
    x = (band(n, 2200 * br, 7500 * br) * (.55 + .45 * v / 1.8) + band(n, 500 * br, 1500 * br) * .45
         + bp((rng.random(n) < .004 * (1 + v)) * rng.standard_normal(n) * .8, 1500, 6000)) * a
    if kind != 'dash' and length > 140 and rng.random() < .22:
        s0 = rng.uniform(.15, .55) * d; sd = min(d - s0, rng.uniform(.06, .16))
        if sd > .03:
            m = int(sd * SR); ts = np.arange(m) / SR; f0 = rng.uniform(1500, 2600) * br
            f = f0 * (1 + .03 * np.sin(2 * np.pi * rng.uniform(7, 13) * ts))
            sq = (np.sin(2 * np.pi * np.cumsum(f) / SR) + .3 * np.sin(4 * np.pi * np.cumsum(f) / SR)) * np.sin(np.pi * ts / sd) ** 1.5 * .3
            i0 = int(s0 * SR); x[i0:i0 + m] += sq[:len(x) - i0]
    k = int(.004 * SR); x[:k] += bp(rng.standard_normal(k), 2500, 6500) * np.linspace(1, 0, k) * 1.4
    return x * .3
SOFT = lambda x, a, b: x  # placeholder for readability

for e in E:
    if e['type'] in ('stroke', 'write', 'dash', 'tap'):
        pan = float(np.clip((e['x'] - 1200) / 1500, -.4, .4))
        d = e.get('dur', .05)
        # silence 1: nothing from the board between 5.7 and 6.95
        if 5.7 <= e['t'] < 6.95: continue  # near-silence before the second layer
        x = marker(d, e.get('len', 0), e['type'], e['pen'])
        add(fol, x, e['t'], db(-3), pan)

# ── whooshes on the two whips (camera moves)
for t0, d in [(12.95, .75), (18.0, .8)]:
    add(fol, whoosh(d, .6) * .5, t0, db(-4), 0)

# ── kalimba-like notes: a pluck with a short bright partial
def midi(n): return 440 * 2 ** ((n - 69) / 12)
def kal(f, d=1.4, v=1.0):
    ts = tt(d); x = np.sin(2 * np.pi * f * ts) * np.exp(-ts / .45) + .35 * np.sin(2 * np.pi * f * 4.01 * ts) * np.exp(-ts / .09) + .12 * np.sin(2 * np.pi * f * 2 * ts) * np.exp(-ts / .3)
    k = int(.003 * SR); x[:k] *= np.linspace(0, 1, k)
    return x * v * .5
for tn, nn in [(13.9, 72), (14.75, 76), (15.75, 79), (16.85, 84)]:     # 1, 2, 3, 4 layers: one note added per layer
    add(mus, kal(midi(nn)), tn, db(-17), 0)
add(mus, kal(midi(91), 1.8), 11.95, db(-19), 0)                          # the ring around the crossing, after a near-silence
add(mus, kal(midi(88), 1.8), 25.85, db(-20), 0)                          # the light arrow
for i, nn in enumerate([72, 76, 79, 84, 88]):                            # closing arpeggio
    add(mus, kal(midi(nn), 2.2), 28.3 + i * .22, db(-18 - i * .5 + i * .4), 0)

# ── narration: compressed, centred
VO = {'v1': .35, 'v2': 3.4, 'v3': 6.85, 'v4': 10.2, 'v5': 14.0, 'v6': 19.2, 'v7': 26.0}
for k, t0 in VO.items():
    a, sr = sf.read(os.path.join(HERE, 'voices', k + '.wav'), dtype='float32')
    if a.ndim > 1: a = a.mean(1)
    a = soxr.resample(a, sr, SR).astype(np.float32); a = compress(a); a = a / (np.abs(a).max() + 1e-9) * .5
    add(vo, a, t0, 1.0, 0)

# duck the music under speech
duck = np.ones(NS, np.float32)
for k, t0 in VO.items():
    i0, i1 = int((t0 - .1) * SR), int((t0 + dur[k] + .25) * SR); duck[i0:i1] = .45
duck = lp(duck, 6, 1).astype(np.float32); mus *= duck[:, None]

mix = vo * 1.0 + fol * db(-6) + mus * 1.0 + room
mix = limit(mix.T if mix.shape[0] == 2 else mix, .92) if False else mix
mix = np.clip(mix, -.98, .98)
os.makedirs(os.path.join(HERE, 'out'), exist_ok=True)
sf.write(os.path.join(HERE, 'out', 'mix.wav'), mix[:int((DUR + .6) * SR)], SR)
print('mix.wav', round(len(mix) / SR, 2), 's  peak', round(float(np.abs(mix).max()), 3))
