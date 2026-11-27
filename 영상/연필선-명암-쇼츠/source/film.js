// "연필 선을 겹치면 명암이 생긴다" — Whiteboard Explainer, 9:16, 30 s. All times are seconds.
import * as W from './engine/wb.js';
import { clamp, mulberry } from '/core/lib.js';

const { INK, VIEW } = W;
export const END = 30.0;
// narration start times (seconds); lengths come from voices/dur.json
export const VO = { v1: 0.35, v2: 3.4, v3: 6.85, v4: 10.2, v5: 14.0, v6: 19.2, v7: 26.0 };
const GRAPHITE = INK.black, PENCIL_A = .3;          // one pencil layer = low alpha; overlaps darken (multiply)

export async function build() {
  await W.loadFont('tech', 'fonts/EMSTech.json');
  const dur = await (await fetch('voices/dur.json')).json();
  const tl = new W.Timeline();
  const park = (y) => [VIEW.w * 1.3, y];
  const K = new W.Pen('black', GRAPHITE, { park: park(1750) });
  const B = new W.Pen('blue', INK.blue, { park: park(1400) });
  const O = new W.Pen('orange', INK.orange, { park: park(1050) });
  const T = W.text, R = mulberry(2024);

  // ───────── board layout (world units; board 2400 × 7000, everything near x = 1200)
  const QX = 1200, QBASE = 1450, QH = 820;                 // the big "?"
  const L1 = [1200, 1455, 850, 2480], L2 = [650, 1740, 1400, 2170];
  const CROSS = [1025, 1968];                              // where L1 and L2 meet
  const SW = { x: 760, w: 760, h: 170, y: [3300, 3600, 3900, 4200] };
  const BALL = { x: 1200, y: 5700, r: 340 };
  const LIGHT = [-.62, -.78];                              // light comes from the upper left

  // faint ghosts of old lessons (wiped marks)
  const ghosts = [];
  for (let i = 0; i < 26; i++) {
    const x = R() * 2200 + 100, y = R() * 6600 + 200, k = R();
    const o = { w: 12, alpha: .05 + R() * .04, color: R() < .25 ? '#8aa0c8' : '#9aa0a8' };
    if (k < .3) ghosts.push(...T(['3+4', '1/2', 'sketch', '?', '4B', 'Fri', 'p.12'][i % 7], x, y, { h: 60 + R() * 40, ...o }));
    else if (k < .6) ghosts.push(W.circle(x, y, 40 + R() * 90, o));
    else if (k < .8) ghosts.push(...W.arrow(x, y, x + (R() - .5) * 400, y + (R() - .5) * 260, o));
    else ghosts.push(W.line(x, y, x + 200 + R() * 400, y + (R() - .5) * 80, o));
  }

  // ───────── hatching helpers (a "layer" of pencil = parallel strokes at low alpha)
  const pencil = { w: 36, alpha: PENCIL_A, jitter: .5, bow: .004 };
  const rectLayer = (x, y, w, h, ang, sp = 54) => {      // one zig-zag scribble over a rectangle
    const rect = [[x + 14, y + 12], [x + w - 14, y + 12], [x + w - 14, y + h - 12], [x + 14, y + h - 12]];
    return W.hatch(rect, { angle: ang, spacing: sp, w: pencil.w, alpha: PENCIL_A });
  };
  const ballLayer = (c, r, shift, ang, sp = 46) => {     // disk minus the same disk moved toward the light → crescent
    const ca = Math.cos(ang), sa = Math.sin(ang), segs = [];
    const sx = LIGHT[0] * shift, sy = LIGHT[1] * shift;
    const iu = sx * ca + sy * sa, iv = -sx * sa + sy * ca;   // inner-disk centre in the hatch frame
    let flip = 0;
    for (let v = -r + sp * .5; v < r; v += sp) {
      const h = Math.sqrt(r * r - v * v); let iv_ = [[-h + 6, h - 6]];
      const dv = v - iv;
      if (shift > 0 && Math.abs(dv) < r) {
        const hi = Math.sqrt(r * r - dv * dv), a = iu - hi, b = iu + hi, out = [];
        for (const [lo, up] of iv_) { if (a - lo > 20) out.push([lo, Math.min(up, a)]); if (up - b > 20) out.push([Math.max(lo, b), up]); }
        iv_ = out;
      }
      for (const [lo, up] of iv_) {
        const p = [lo, up]; if (flip) p.reverse();
        segs.push(W.line(c[0] + p[0] * ca - v * sa, c[1] + p[0] * sa + v * ca, c[0] + p[1] * ca - v * sa, c[1] + p[1] * sa + v * ca, { ...pencil, w: 44 }));
      }
      flip ^= 1;
    }
    return segs;
  };

  // ───────── the film, shot by shot
  // 1. the big question mark
  tl.draw(K, T('?', QX, QBASE, { h: QH, w: 56, align: 'center', jitter: .6 }), 0.45, { by: 2.1 });
  // 2. one pencil line, led from the dot of the question mark (pen leads the camera)
  tl.draw(K, W.line(...L1, { ...pencil, w: 30, bow: .01 }), 2.5, { by: 5.3, tag: 'L1' });
  // 3. the second layer crosses it, then the camera dives into the crossing
  tl.draw(K, W.line(...L2, { ...pencil, w: 30, bow: .01 }), 7.05, { by: 8.9, tag: 'L2' });
  tl.draw(O, W.circle(CROSS[0], CROSS[1], 46, { w: 9, lap: .3 }), 10.6, { by: 11.9, tag: 'ring' });
  // 4. four value swatches: 1, 2, 3, 4 layers
  const ANG = [-.75, .75, .1, 1.45];
  const swTimes = [[13.15, 13.95], [14.0, 15.0], [15.0, 16.1], [16.1, 17.55]];
  SW.y.forEach((y, k) => {
    const [a, b] = swTimes[k];
    tl.draw(K, W.rect(SW.x, y, SW.w, SW.h, { w: 7, alpha: .8 }), a, { by: a + .35, tag: `box${k}` });
    const layers = []; for (let j = 0; j <= k; j++) layers.push(rectLayer(SW.x, y, SW.w, SW.h, ANG[j]));
    tl.draw(K, layers, a + .38, { by: b, tag: `sw${k}` });
    tl.draw(B, T(String(k + 1), SW.x - 120, y + SW.h * .72, { h: 120, w: 11 }), a + .1, { by: a + .75, tag: `num${k}` });
  });
  // 5. the same trick builds a ball: outline, then crescents with more and more layers
  tl.draw(K, W.circle(BALL.x, BALL.y, BALL.r, { w: 11, alpha: .92, lap: .25 }), 18.95, { by: 19.9, tag: 'ballline' });
  const SH = [0, .28 * BALL.r, .55 * BALL.r, .85 * BALL.r], BA = [-.75, .75, .1, 1.45], bt = [[19.95, 21.3], [21.3, 22.4], [22.4, 23.5], [23.5, 24.7]];
  SH.forEach((s, k) => tl.draw(K, ballLayer([BALL.x, BALL.y], BALL.r, s, BA[k]), bt[k][0], { by: bt[k][1], tag: `ball${k}` }));
  // 6. light arrow + a little sun (accent colour)
  const SUN = [BALL.x - 560, BALL.y - 560];
  tl.draw(O, [W.circle(SUN[0], SUN[1], 46, { w: 9 }),
    ...[0, 1, 2, 3, 4, 5, 6, 7].map(i => { const a = i * Math.PI / 4; return W.line(SUN[0] + Math.cos(a) * 74, SUN[1] + Math.sin(a) * 74, SUN[0] + Math.cos(a) * 112, SUN[1] + Math.sin(a) * 112, { w: 9 }); }),
    W.arrow(SUN[0] + 90, SUN[1] + 90, BALL.x - 300, BALL.y - 290, { w: 10 })], 24.85, { by: 25.85, tag: 'sun' });
  tl.end();

  // ───────── camera (the +130/z offset keeps the picture in the upper 85 %, clear of the subtitle label)
  const C = (t, x, y, z, e) => [t, x, y + 130 / z, z, 0, e || 'io'];
  const cam = new W.Camera([
    C(0, QX, 1000, .95), C(1.9, QX, 1000, .95, 'io'),
    C(2.5, 1180, 1550, 1.05), C(3.6, 1100, 1850, 1.0), C(5.2, CROSS[0], 2000, .95), C(7.0, CROSS[0], 2000, .95),
    C(9.0, CROSS[0], 2000, .95), C(11.0, CROSS[0], CROSS[1], 4.2),   // push into the crossing
    C(12.8, CROSS[0], CROSS[1], 4.2, 'l'), C(13.7, 1150, 3450, .92, 'io'),   // whip to the swatches
    C(14.9, 1150, 3600, .92), C(16.2, 1150, 3950, .92), C(17.6, 1150, 4050, .92),
    C(18.7, 1200, BALL.y + 20, 1.12, 'io'), C(24.6, 1200, BALL.y + 20, 1.12), C(29.4, 1200, 5010, .55, 'io'), C(30, 1200, 5010, .55)
  ]);
  const board = new W.Board(tl, { W: 2400, H: 7000, ghosts });
  const pens = [K, B, O];
  board.objs.push({ draw: (ctx, t, c) => { for (const p of pens) W.drawMarker(ctx, p, W.penPose(p, t, cam), c, t); } });

  // ───────── subtitles (burned in; ≤ 14 chars per row)
  const subs = [
    { t0: VO.v1 - .05, t1: 3.35, rows: ['그림자는', '어떻게 만들까요?'] },
    { t0: VO.v2 - .05, t1: 6.6, rows: ['연필 선 하나는', '아주 연해요.'] },
    { t0: VO.v3 - .05, t1: 10.15, rows: ['같은 자리에 한 번 더', '겹쳐 그으면,'] },
    { t0: VO.v4 - .05, t1: 13.85, rows: ['종이 위에 흑연이 쌓여서', '더 어두워져요.'] },
    { t0: VO.v5 - .05, t1: 18.5, rows: ['두 번, 세 번, 네 번.', '겹칠수록 진해지죠.'] },
    { t0: VO.v6 - .05, t1: 23.1, rows: ['이 겹침이 모이면', '공 하나가 입체가 돼요.'] },
    { t0: VO.v7 - .05, t1: 29.7, rows: ['우리도 선을 겹쳐서', '그려 볼까요?'] },
  ].map(s => ({ ...s, text: s.rows.join(' ') }));
  const FS = 86, LH = 110;
  const subBox = (s) => { const w = 1000, h = 44 + s.rows.length * LH, y0 = VIEW.h - 118 - h; return { x0: (VIEW.w - w) / 2, y0, x1: (VIEW.w + w) / 2, y1: y0 + h, w, h }; };
  board.overlays.push({
    draw: (ctx, t) => {
      const s = subs.find(s => t >= s.t0 && t < s.t1); if (!s) return;
      const a = Math.min(1, (t - s.t0) / .12, (s.t1 - t) / .12), b = subBox(s);
      ctx.font = `${FS}px GG`;
      const w = Math.max(...s.rows.map(r => ctx.measureText(r).width)) + 90, x = (VIEW.w - w) / 2;
      ctx.globalAlpha = a * .92; ctx.fillStyle = '#fdfcf8'; ctx.shadowColor = 'rgba(30,30,40,.2)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 5;
      ctx.beginPath(); ctx.roundRect(x, b.y0, w, b.h, 28); ctx.fill();
      ctx.shadowColor = 'transparent'; ctx.globalAlpha = a;
      ctx.fillStyle = INK.orange; ctx.fillRect(x + 34, b.y1 - 20, 54, 6);
      ctx.fillStyle = '#23262c'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      s.rows.forEach((r, i) => ctx.fillText(r, VIEW.w / 2, b.y0 + 24 + LH * (i + .5)));
    }
  });
  const TEXTS = (t) => { const s = subs.find(s => t >= s.t0 && t < s.t1); if (!s) return []; const b = subBox(s); return [{ id: 'sub' + s.t0, text: s.text, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1 }]; };

  // ───────── render with camera motion blur on whips
  const off = new OffscreenCanvas(VIEW.w, VIEW.h), oc = off.getContext('2d');
  const q = new URLSearchParams(location.search);
  if (q.has('nosubs')) board.overlays.length = 0;
  function render(ctx, t) {
    const dt = 1 / 24, a = cam.at(t), b = cam.at(Math.max(0, t - dt));
    const sp = Math.hypot((a.x - b.x) * a.z, (a.y - b.y) * a.z) + Math.abs(Math.log(a.z / b.z)) * 900;
    const N = sp > 14 ? Math.min(12, Math.ceil(sp * .5 / 4)) : 1;
    if (N === 1) { board.render(ctx, t, cam); return; }
    const ov = board.overlays; board.overlays = [];
    for (let i = 0; i < N; i++) { board.render(oc, t - dt * .5 * i / (N - 1), cam); ctx.globalAlpha = 1 / (i + 1); ctx.drawImage(off, 0, 0); }
    ctx.globalAlpha = 1; board.overlays = ov;
    for (const o of ov) { ctx.save(); o.draw(ctx, t); ctx.restore(); }
  }

  const ev = [...tl.ev, ...Object.entries(VO).map(([id, t]) => ({ t, type: 'vo', id, dur: dur[id] }))].sort((a, b) => a.t - b.t);
  return { dur: END, render, ev, subs, cam, tl, TEXTS, VO };
}
