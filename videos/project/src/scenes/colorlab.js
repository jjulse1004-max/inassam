// colorlab.js: 색 탐구 놀이터 소개 영상 (30 s). 5 shots, Lulu & Kuri explain the four activities of the color web app.
(() => {
  const CAP = [
    [0.6, 3.6, '색 탐구 놀이터에 놀러 오세요!', { pos: 'top' }],
    [4.0, 5.6, '오늘은 색을 가지고 놀아 볼까요?', { pos: 'top' }],
    [6.6, 9.4, '색상환을 눌러 보세요', { pos: 'top' }],
    [9.8, 13.2, '반대편에 있는 색이 보색이에요', { pos: 'top' }],
    [14.2, 17.4, '색상·채도·명도를 움직여 색을 만들어요', { pos: 'top' }],
    [18.0, 21.0, '채도를 0으로 내리면? 회색이 돼요!', { pos: 'top' }],
    [22.0, 25.2, '보색을 나란히 놓으면 더 선명해요', { pos: 'top' }],
    [26.2, 29.4, '색 퀴즈도 풀어 봐요!', { pos: 'top' }],
  ];
  captions(CAP);
  window.EXTRA_FONTS.push([`700 60px ${HAND_FONT}`, '색상환 채도 명도 보색 색 만들기 퀴즈 오늘은 놀이터 반대편 회색 선명 휴대폰 1학년 미술']);

  const hex = (r, g, b) => '#' + [r, g, b].map(v => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  function hsl(h, s, l) {   // h 0..360, s,l 0..1
    h = ((h % 360) + 360) % 360; const a = s * Math.min(l, 1 - l), f = n => { const k = (n + h / 30) % 12; return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    return hex(f(0) * 255, f(8) * 255, f(4) * 255);
  }
  const WHEEL = i => hsl(i * 30, .62, .62);   // crayon-soft wheel colours
  function wedge(cx, cy, r0, r1, a0, a1) {
    const P = []; for (let k = 0; k <= 5; k++) P.push([cx + Math.cos(a0 + (a1 - a0) * k / 5) * r1, cy + Math.sin(a0 + (a1 - a0) * k / 5) * r1]);
    for (let k = 5; k >= 0; k--) P.push([cx + Math.cos(a0 + (a1 - a0) * k / 5) * r0, cy + Math.sin(a0 + (a1 - a0) * k / 5) * r0]);
    return P;
  }
  function wheel(cx, cy, R, sel, selK, t) {
    for (let i = 0; i < 12; i++) {
      const a0 = -Math.PI / 2 + (i - .5) * Math.PI / 6, a1 = a0 + Math.PI / 6;
      const on = sel >= 0 && (i === sel || i === (sel + 6) % 12), pop = on ? 28 * selK * (1 + .12 * Math.sin(t * 9)) : 0;
      boilSeed('wedge' + i);
      colorIn(wedge(cx, cy, R * .32, R + pop, a0, a1), { col: WHEEL(i), gap: 15, ang: a0 + .9, line: mixCol(WHEEL(i), PAL.ink, .5), lw: on ? 1.5 : 1, w: 1.1 });
    }
    boilSeed('hub'); colorIn(ellPts(cx, cy, R * .3, R * .3, 20), { col: PAL.cream, fill: 'flat', line: PAL.inkSoft, lw: 1 });
  }
  function bar(x, y, w, h, knobK, col, key) {   // slider: track + knob
    boilSeed('bar' + key); colorIn(rrPts(x, y, w, h, h / 2), { col: PAL.skyLt, fill: 'flat', line: PAL.inkSoft, lw: 1 });
    const kx = x + 20 + (w - 40) * knobK; boilSeed('knob' + key);
    colorIn(ellPts(kx, y + h / 2, h * .85, h * .85, 18), { col, gap: 9, line: PAL.ink, lw: 1.3, w: 1 });
  }
  const swatch = (x, y, w, h, col, key) => { boilSeed('sw' + key); colorIn(rrPts(x, y, w, h, 28), { col, gap: 13, ang: .6, line: mixCol(col, PAL.ink, .55), lw: 1.4, w: 1.2 }); };
  const fadeIO = (lt, dur) => { if (lt < .5) flash(1 - easeOut(lt / .5), PAL.paper); if (lt > dur - .4) flash(easeIn(seg(lt, dur - .4, dur - .02)), PAL.paper); };

  // ---------- A: 인사 (0–6.2) ----------
  const GA = 860;
  function intro(t, lt, dur) {
    camBegin(kf(lt, [[0, 900], [dur, 960]]), kf(lt, [[0, 360], [2, 520], [dur, 540]], ease), kf(lt, [[0, 1.1], [2.4, 1.0], [dur, 1.05]]));
    sky(PAL.sky, PAL.cream, { y1: GA - 100 });
    sun(1560, 160, 72, t, { face: true });
    cloud(420 + lt * 12, 190, .9, { key: 'c1' }); cloud(1100 + lt * 8, 100, .6, { key: 'c2' });
    hill(420, GA + 140, 800, 300, mixCol(PAL.sage, PAL.skyLt, .35));
    hill(1500, GA + 170, 900, 330, mixCol(PAL.leaf, PAL.skyLt, .25), { ang: .15 });
    ground(GA, PAL.sage); tufts(-300, 2200, () => GA + 6, 26, PAL.sageDk, t, 'tA');
    // a rainbow of crayon flowers
    for (let i = 0; i < 9; i++) flower(-150 + i * 270 + hash(i) * 80, GA + 40 + hash(i + 4) * 90, 1.1, WHEEL(i * 4 % 12), t);
    const lw = stroll(lt, .2, 2.4, -150, 780, 32, 3), kw = stroll(lt, .5, 2.7, -420, 1060, 27, 2.2);
    const lm = emotions(lt, [[0, 'happy'], [3.3, 'excited']]);
    lulu(lw.x, GA + 4, 32, lt < 2.4 ? pose(lm, walkCycle(lw.walk || 0, true), { view: 'side', seed: 1 }) : pose(lm, { view: 'front', seed: 1, aR: kf(lt, [[2.6, -1.2], [3.0, 1.2], [3.4, .7], [3.8, 1.2], [4.2, -1]], ease), bR: .3 }));
    kuri(kw.x, GA + 10, 27, lt < 2.7 ? pose(emotions(lt, [[0, 'happy']]), walkCycle(kw.walk || 0, true), { view: 'side', seed: 2 }) : pose(emotions(lt, [[0, 'happy'], [3.3, 'excited']]), { view: 'q', seed: 2 }));
    camEnd(); fadeIO(lt, dur);
  }

  // ---------- B: 색상환 / 보색 (6.2–13.8) ----------
  const GB = 930;
  function wheelShot(t, lt, dur) {
    paperWash(t, PAL.skyLt); ground(GB, PAL.peach, { gap: 50 });
    const sel = lt > 2.4 ? 1 : -1, selK = backOut(seg(lt, 2.4, 3.0)), opp = backOut(seg(lt, 3.6, 4.2));
    wheel(640, 480, 330, sel, lt > 2.4 ? 1 : 0, t);
    if (lt > 2.4) { letter('선택한 색', 640, 900, 56, PAL.ink, {}); }
    // the tapped colour and its complement shown as two little swatches
    if (lt > 2.4) swatch(1180, 250, 150, 150, WHEEL(1), 'a');
    if (lt > 3.6) swatch(1380, 250, 150, 150, WHEEL(7), 'b');
    if (lt > 2.4) letter('고른 색', 1255, 440, 48, PAL.ink);
    if (lt > 3.6) { letter('보색', 1455, 440, 48, PAL.ink); const p = opp; if (p > 0) { inkLine([[1335, 325], [1360, 325]], 1.2, PAL.ink, 'cpen'); } }
    const lm = emotions(lt, [[0, 'curious'], [2.3, 'excited'], [3.6, 'surprised'], [4.6, 'happy']]);
    // Lulu points at the wheel; her arm swings up to tap
    lulu(1460, GB + 4, 36, pose(lm, { view: 'q', flip: true, seed: 1, aR: kf(lt, [[1.6, -1.1], [2.2, .6], [2.4, .35], [3.2, .6], [4.4, -.5]], ease), bR: .3 }));
    kuri(1170, GB + 10, 28, pose(emotions(lt, [[0, 'curious'], [3.7, 'surprised'], [4.8, 'excited']]), { view: 'q', flip: true, seed: 2 }));
    if (lt > 2.4 && lt < 3.1) emote('spark', 640 + 270, 480 - 120, 40, selK, lt - 2.4);
    if (lt > 3.8 && lt < 5) emote('spark', 640 - 270, 480 + 120, 40, opp, lt - 3.8);
    bookPage(ease(seg(lt, .3, 1))); vignette(.3); fadeIO(lt, dur);
  }

  // ---------- C: 색 만들기 (13.8–21.4) ----------
  function mixShot(t, lt, dur) {
    paperWash(t, PAL.butter); ground(GB, PAL.sage, { gap: 50 });
    const h = kf(lt, [[0, 20], [2.2, 20], [4.0, 200], [5, 200]], ease),
      s = kf(lt, [[0, .75], [4.2, .75], [5.0, .75], [5.4, .75], [6.6, 0]], ease), l = .55;
    const hK = h / 360, sK = s, lK = l;
    const col = hsl(h, Math.max(s, 0), l);
    bar(260, 330, 760, 52, hK, hsl(h, .8, .55), 'h'); letter('색상', 140, 356, 56, PAL.ink);
    bar(260, 480, 760, 52, sK, hsl(h, Math.max(s, .15), .55), 's'); letter('채도', 140, 506, 56, PAL.ink);
    bar(260, 630, 760, 52, lK, PAL.cream, 'l'); letter('명도', 140, 656, 56, PAL.ink);
    swatch(1180, 300, 400, 400, col, 'big');
    letter(s < .08 ? '회색!' : '내가 만든 색', 1380, 760, 56, PAL.ink);
    const lm = emotions(lt, [[0, 'thinking'], [1.8, 'curious'], [4.1, 'surprised'], [5.4, 'laugh']]);
    lulu(1660, GB + 4, 34, pose(lm, { view: 'q', flip: true, seed: 1, aR: kf(lt, [[1, -1.1], [1.8, .6], [4.0, .5], [5.4, .3], [6.6, -1]], ease), bR: .3 }));
    kuri(1000, GB + 10, 30, pose(emotions(lt, [[0, 'curious'], [4.2, 'surprised'], [5.6, 'love']]), { view: 'q', seed: 2 }));
    bookPage(ease(seg(lt, .3, 1))); vignette(.3); fadeIO(lt, dur);
  }

  // ---------- D: 보색 대비 (21.4–26.0) ----------
  function contrastShot(t, lt, dur) {
    paperWash(t, PAL.lilac); ground(GB, PAL.peach, { gap: 50 });
    const gap = kf(lt, [[0, 300], [1.6, 300], [2.6, 0]], ease);
    const cA = WHEEL(0), cB = WHEEL(6), sat = kf(lt, [[2.4, 0], [3.0, 1]], easeOut);
    swatch(560 - gap / 2, 300, 400, 400, cA, 'ca'); swatch(960 + gap / 2, 300, 400, 400, cB, 'cb');
    if (sat > 0) { glow(960, 500, 420 * sat, '#FFE9B0', .6); emote('spark', 960, 300, 60, sat, lt - 2.6); emote('spark', 620, 340, 40, sat, lt - 2.7); emote('spark', 1300, 700, 40, sat, lt - 2.8); }
    letter('보색 대비', 960, 790, 64, PAL.ink);
    const lm = emotions(lt, [[0, 'curious'], [2.5, 'surprised'], [3.4, 'excited']]);
    lulu(280, GB + 4, 34, pose(lm, { view: 'q', seed: 1 }));
    kuri(1580, GB + 10, 30, pose(emotions(lt, [[0, 'curious'], [2.6, 'love']]), { view: 'q', flip: true, seed: 2 }));
    bookPage(ease(seg(lt, .3, 1))); vignette(.3); fadeIO(lt, dur);
  }

  // ---------- E: 퀴즈 & 마무리 (26.0–30) ----------
  function quizShot(t, lt, dur) {
    sky(PAL.skyLt, PAL.cream, { y1: GA - 100 }); sun(1560, 160, 72, t, { face: true });
    hill(1100, GA + 200, 1300, 360, mixCol(PAL.leaf, PAL.skyLt, .3)); ground(GA, PAL.sage); tufts(-300, 2200, () => GA + 6, 24, PAL.sageDk, t, 'tE');
    for (let i = 0; i < 12; i++) { boilSeed('b' + i); const p = [160 + i * 150, 330 + Math.sin(t * 1.3 + i) * 18 + hash(i) * 120]; ellPts; colorIn(ellPts(p[0], p[1], 38, 46, 18), { col: WHEEL(i), gap: 11, line: mixCol(WHEEL(i), PAL.ink, .5), lw: 1.1 }); }
    boilSeed('qs'); starProp(960, 520 + Math.sin(t * 2) * 8, 90, PAL.butter);
    emote('?', 960, 410, 60, backOut(seg(lt, .4, 1)), lt);
    lulu(700, GA + 4, 36, pose(emotions(lt, [[0, 'excited'], [2, 'happy']]), { view: 'front', seed: 1, aL: kf(lt, [[0, -1.2], [.5, 1.2], [1, .8], [1.5, 1.2]], ease), aR: kf(lt, [[0, -1.2], [.5, 1.2], [1, .8], [1.5, 1.2]], ease) }));
    kuri(1220, GA + 10, 30, pose(emotions(lt, [[0, 'happy'], [1.2, 'excited']]), { view: 'q', flip: true, seed: 2 }));
    bookPage(ease(seg(lt, .2, .8))); vignette(.3 + .4 * seg(lt, dur - 1, dur)); fadeIO(lt, dur);
  }

  shots([[0, intro], [6.2, wheelShot, { turn: 1.0 }], [13.8, mixShot, { turn: 1.0 }], [21.4, contrastShot, { turn: 1.0 }], [26.0, quizShot, { turn: 1.0 }]]);
})();
