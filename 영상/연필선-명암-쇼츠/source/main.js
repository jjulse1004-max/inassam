const mod = await import('./film.js');
await document.fonts.load('86px GG');
const F = await mod.build();
const ctx = document.getElementById('c').getContext('2d');
window.DUR = F.dur; window.EV = F.ev; window.SUBS = F.subs || []; window.TEXTS = F.TEXTS;
window.render = t => F.render(ctx, t);
window.READY = true;
