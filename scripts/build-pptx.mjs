import pptxgen from 'pptxgenjs';
import path from 'node:path';
import fs from 'node:fs';
import { BRAND, SLIDES, STATUS } from './lib/slides.mjs';

const C = BRAND.colors;
const FONT = 'Segoe UI';
const W = 13.333;
const H = 7.5;
const MX = 0.7;
const CW = 11.93;

const OUT_DIR = path.resolve('entrega');
const LOGO_ICON = path.resolve('entrega/logo/orbittrack-icon-512.png');
const LOGO_H = path.resolve('entrega/logo/orbittrack-logo-1200.png');
const LOGO_H_DARK = path.resolve('entrega/logo/orbittrack-logo-dark-1200.png');
const QR = path.resolve('entrega/logo/qr-exemplo.png');

fs.mkdirSync(OUT_DIR, { recursive: true });

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_WIDE';
pptx.author = 'OrbitTrack';
pptx.company = 'OrbitTrack';
pptx.subject = 'Apresentação comercial';
pptx.title = 'OrbitTrack — Apresentação Comercial';
pptx.lang = 'pt-PT';
pptx.theme = { headFontFace: FONT, bodyFontFace: FONT, lang: 'pt-PT' };
pptx.defineSlideMaster({
  title: 'BASE',
  background: { color: C.bg },
  objects: [],
});

const total = SLIDES.length;
let page = 0;

function addFooter(slide) {
  slide.addShape(pptx.ShapeType.line, {
    x: MX, y: 6.94, w: CW, h: 0,
    line: { color: C.line, width: 0.75 },
  });
  slide.addText('OrbitTrack  ·  Apresentação Comercial', {
    x: MX, y: 7.0, w: 6, h: 0.25, fontSize: 8, color: C.muted, fontFace: FONT,
  });
  slide.addText(`${String(page).padStart(2, '0')} / ${total}`, {
    x: 11.2, y: 7.0, w: 1.43, h: 0.25, fontSize: 8, color: C.muted,
    align: 'right', fontFace: FONT,
  });
}

function addHeader(slide, s) {
  slide.background = { color: C.bg };
  slide.addText(s.eyebrow, {
    x: MX, y: 0.4, w: s.status ? 9.6 : CW, h: 0.22,
    fontSize: 8.5, bold: true, color: C.indigo, charSpacing: 2.2, fontFace: FONT,
  });
  slide.addText(s.title, {
    x: MX, y: 0.64, w: s.status ? 9.9 : CW, h: 0.78,
    fontSize: 26, bold: true, color: C.ink, fontFace: FONT, valign: 'top',
    lineSpacingMultiple: 0.95,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MX, y: 1.47, w: 0.52, h: 0.045, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  if (s.status) addBadge(slide, s.status, 11.03, 0.45);
  addFooter(slide);
}

function addBadge(slide, statusKey, x = 11.03, y = 0.45, w = 1.6) {
  const st = STATUS[statusKey];
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.3, rectRadius: 0.14,
    fill: { color: st.bg }, line: { color: st.bg, width: 0 },
  });
  slide.addText(st.label, {
    x, y, w, h: 0.3, fontSize: 7.8, bold: true, color: st.fg,
    align: 'center', valign: 'middle', fontFace: FONT,
  });
}

function card(slide, x, y, w, h, fill = C.white, line = C.line) {
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h, rectRadius: 0.09,
    fill: { color: fill }, line: { color: line, width: 0.75 },
  });
}

function text(slide, str, x, y, w, h, opts = {}) {
  slide.addText(str, {
    x, y, w, h, fontFace: FONT, color: C.ink, fontSize: 11,
    valign: 'top', ...opts,
  });
}

function statusNote(slide, s) {
  if (!s.statusNote) return;
  slide.addText(s.statusNote, {
    x: MX, y: 6.42, w: CW, h: 0.35, fontSize: 8, italic: true, color: C.muted, fontFace: FONT,
  });
}

function buildCover(s) {
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };

  // órbitas decorativas
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 8.1, y: 0.5, w: 5.4, h: 2.1, fill: { color: C.ink, transparency: 100 },
    line: { color: '10B981', width: 1, transparency: 60 }, rotate: 338,
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 7.7, y: 1.1, w: 6.2, h: 2.5, fill: { color: C.ink, transparency: 100 },
    line: { color: '4F46E5', width: 1, transparency: 55 }, rotate: 338,
  });

  slide.addImage({ path: LOGO_ICON, x: 9.55, y: 1.05, w: 3.0, h: 3.0 });

  slide.addText(s.eyebrow, {
    x: MX, y: 1.0, w: 7.8, h: 0.3, fontSize: 9, bold: true,
    color: C.indigoLight, charSpacing: 2.6, fontFace: FONT,
  });
  slide.addText(s.title, {
    x: MX, y: 1.42, w: 8.2, h: 1.35, fontSize: 58, bold: true, color: C.white,
    fontFace: FONT, charSpacing: -1.5,
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: MX, y: 2.92, w: 1.1, h: 0.06, fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
  });
  slide.addText(s.subtitle, {
    x: MX, y: 3.2, w: 7.6, h: 1.1, fontSize: 18, color: 'CBD5E1',
    fontFace: FONT, lineSpacingMultiple: 1.15,
  });
  slide.addText(s.meta, {
    x: MX, y: 6.55, w: CW, h: 0.35, fontSize: 9.5, color: '94A3B8', fontFace: FONT,
  });
  slide.addNotes(s.note);
}

function buildCards3(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  text(slide, s.lead, MX, 1.72, 10.6, 0.5, { fontSize: 12, color: C.muted });
  const y = 2.35;
  const w = 3.75;
  const gap = 0.34;
  s.cards.forEach((c, i) => {
    const x = MX + i * (w + gap);
    card(slide, x, y, w, 2.95);
    text(slide, c.n, x + 0.28, y + 0.24, 0.8, 0.4, { fontSize: 20, bold: true, color: C.indigoLight });
    text(slide, c.title, x + 0.28, y + 0.78, w - 0.56, 0.5, { fontSize: 14.5, bold: true });
    text(slide, c.text, x + 0.28, y + 1.34, w - 0.56, 1.1, { fontSize: 10.2, color: C.muted, lineSpacingMultiple: 1.15 });
    text(slide, c.cost || '', x + 0.28, y + 2.5, w - 0.56, 0.22, {
      fontSize: 7.2, bold: true, color: C.indigo, charSpacing: 1.4,
    });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: MX, y: 5.62, w: CW, h: 0.62, rectRadius: 0.08,
    fill: { color: C.softIndigo }, line: { color: 'E0E7FF', width: 0.75 },
  });
  text(slide, s.footerNote, MX + 0.3, 5.76, CW - 0.6, 0.35, { fontSize: 10.5, color: '3730A3', bold: true });
  slide.addNotes(s.note);
}

function buildStatement(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  text(slide, s.lead, MX, 1.78, 10.9, 0.9, { fontSize: 14, color: C.inkSoft, lineSpacingMultiple: 1.2 });
  const y = 3.05;
  const w = 3.75;
  s.pillars.forEach((p, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, y, w, 2.55);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: y + 0.3, w: 0.38, h: 0.38, rectRadius: 0.12,
      fill: { color: C.softIndigo }, line: { color: C.softIndigo, width: 0 },
    });
    text(slide, String(i + 1), x + 0.28, y + 0.355, 0.38, 0.3, { fontSize: 11, bold: true, color: C.indigo, align: 'center' });
    text(slide, p.title, x + 0.28, y + 0.9, w - 0.56, 0.45, { fontSize: 14, bold: true });
    text(slide, p.text, x + 0.28, y + 1.38, w - 0.56, 0.9, { fontSize: 10.2, color: C.muted, lineSpacingMultiple: 1.15 });
  });
  slide.addNotes(s.note);
}

function buildValue4(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 5.78;
  const h = 2.05;
  s.cards.forEach((c, i) => {
    const x = MX + (i % 2) * (w + 0.37);
    const y = 1.78 + Math.floor(i / 2) * (h + 0.24);
    card(slide, x, y, w, h);
    const accent = C[c.accent] || C.indigo;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: y + 0.32, w: 0.09, h: 0.62, rectRadius: 0.05,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    text(slide, c.title, x + 0.55, y + 0.3, w - 0.85, 0.4, { fontSize: 14.5, bold: true });
    text(slide, c.text, x + 0.55, y + 0.82, w - 0.85, 0.95, { fontSize: 10.4, color: C.muted, lineSpacingMultiple: 1.18 });
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildThree(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 3.75;
  s.columns.forEach((col, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, 1.8, w, 4.55);
    const accent = C[col.color] || C.indigo;
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.8, w, h: 0.12, rectRadius: 0.05,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    text(slide, col.tag, x + 0.28, 2.08, w - 0.56, 0.25, {
      fontSize: 8.5, bold: true, color: accent, charSpacing: 1.8,
    });
    text(slide, col.title, x + 0.28, 2.4, w - 0.56, 0.45, { fontSize: 15, bold: true });
    col.items.forEach((it, j) => {
      const yy = 3.0 + j * 0.66;
      slide.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.3, y: yy + 0.09, w: 0.09, h: 0.09,
        fill: { color: accent }, line: { color: accent, width: 0 },
      });
      text(slide, it, x + 0.52, yy, w - 0.8, 0.55, { fontSize: 9.8, color: C.inkSoft, lineSpacingMultiple: 1.05 });
    });
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildSteps(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 2.2;
  const gap = 0.233;
  const y = 2.55;
  slide.addShape(pptx.ShapeType.line, {
    x: MX + 0.35, y: y + 0.33, w: CW - 0.7, h: 0,
    line: { color: 'CBD5E1', width: 1.5 },
  });
  s.steps.forEach((st, i) => {
    const x = MX + i * (w + gap);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.72, y, w: 0.66, h: 0.66,
      fill: { color: i === 0 ? C.indigo : C.white },
      line: { color: i === 0 ? C.indigo : 'CBD5E1', width: 1.5 },
    });
    text(slide, st.n, x + 0.72, y + 0.16, 0.66, 0.3, {
      fontSize: 14, bold: true, color: i === 0 ? C.white : C.ink, align: 'center',
    });
    text(slide, st.title, x, y + 0.9, w, 0.35, { fontSize: 12.5, bold: true, align: 'center' });
    text(slide, st.text, x, y + 1.3, w, 0.9, { fontSize: 9.2, color: C.muted, align: 'center', lineSpacingMultiple: 1.1 });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: MX, y: 5.25, w: CW, h: 0.8, rectRadius: 0.08,
    fill: { color: C.ink }, line: { color: C.ink, width: 0 },
  });
  text(slide, 'Um único link substitui dezenas de mensagens de acompanhamento.', MX + 0.35, 5.44, CW - 0.7, 0.4, {
    fontSize: 12, bold: true, color: C.white,
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildSplitMock(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const y = 1.78;
  s.bullets.forEach((b, i) => {
    const yy = y + i * 0.72;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: MX, y: yy + 0.08, w: 0.13, h: 0.13, fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    });
    text(slide, b, MX + 0.3, yy, 5.3, 0.6, { fontSize: 10.8, color: C.inkSoft });
  });

  // mock do dashboard
  const x = 6.35;
  const w = 6.28;
  const h = 4.55;
  card(slide, x, y, w, h);
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y, w, h: 0.52, rectRadius: 0.09, fill: { color: C.ink }, line: { color: C.ink, width: 0 },
  });
  text(slide, 'Painel  ·  Visão geral', x + 0.22, y + 0.15, 3.5, 0.25, { fontSize: 8.5, color: 'CBD5E1', bold: true });

  const stats = [
    { v: '12', l: 'Encomendas', c: C.softIndigo, fg: C.indigo },
    { v: '4', l: 'Em produção', c: C.softAmber, fg: C.amberDark },
    { v: '4,8', l: 'Avaliação média', c: C.softEmerald, fg: C.emeraldDark },
  ];
  stats.forEach((st, i) => {
    const sx = x + 0.22 + i * 1.98;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: sx, y: y + 0.72, w: 1.82, h: 0.9, rectRadius: 0.07,
      fill: { color: st.c }, line: { color: st.c, width: 0 },
    });
    text(slide, st.v, sx + 0.15, y + 0.8, 1.5, 0.4, { fontSize: 18, bold: true, color: st.fg });
    text(slide, st.l, sx + 0.15, y + 1.22, 1.55, 0.25, { fontSize: 7.5, color: st.fg });
  });

  // gráfico de barras
  text(slide, 'Encomendas por mês', x + 0.22, y + 1.82, 3, 0.25, { fontSize: 8, bold: true, color: C.muted });
  const bars = [0.55, 0.9, 0.7, 1.25, 1.0, 1.45, 1.2];
  bars.forEach((bh, i) => {
    const bx = x + 0.3 + i * 0.78;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: bx, y: y + 3.55 - bh, w: 0.42, h: bh, rectRadius: 0.03,
      fill: { color: i === 5 ? C.indigo : 'C7D2FE' }, line: { color: i === 5 ? C.indigo : 'C7D2FE', width: 0 },
    });
  });
  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.22, y: y + 3.6, w: w - 0.44, h: 0, line: { color: C.line, width: 0.75 },
  });

  // lista de encomendas
  const rows = [
    ['2026-0001', 'A imprimir', C.blue],
    ['2026-0002', 'Acabamento', '8B5CF6'],
  ];
  rows.forEach((r, i) => {
    const ry = y + 3.75 + i * 0.34;
    text(slide, r[0], x + 0.25, ry, 1.2, 0.22, { fontSize: 7.5, color: C.muted });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 1.5, y: ry + 0.02, w: 1.0, h: 0.18, rectRadius: 0.05,
      fill: { color: r[2], transparency: 82 }, line: { color: r[2], width: 0 },
    });
    text(slide, r[1], x + 1.5, ry + 0.015, 1.0, 0.18, { fontSize: 6.5, bold: true, color: r[2], align: 'center' });
  });
  text(slide, 'Ilustração de evolução; o dashboard real tem três cartões.', x + w - 3.5, y + h - 0.28, 3.3, 0.2, {
    fontSize: 6.2, italic: true, color: '94A3B8', align: 'right',
  });

  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildTable(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const x = MX;
  const y = 1.85;
  const w = 8.05;
  const head = s.headers.map((h) => ({
    text: h,
    options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 8.5 },
  }));
  const rows = s.rows.map((r) => r.map((cell, ci) => ({
    text: cell,
    options: {
      fontSize: 8.5,
      color: ci === 2 ? C.indigo : C.inkSoft,
      bold: ci === 2,
      fill: { color: C.white },
    },
  })));
  slide.addTable([head, ...rows], {
    x, y, w,
    colW: [1.45, 1.75, 1.65, 1.35, 1.25],
    rowH: [0.38, 0.46, 0.46, 0.46],
    border: { type: 'solid', pt: 0.5, color: C.line },
    fontFace: FONT,
    valign: 'middle',
    margin: 0.08,
  });
  text(slide, s.caption, x, y + 1.95, w, 0.25, { fontSize: 7.5, italic: true, color: C.muted });

  const sx = 9.1;
  s.side.forEach((b, i) => {
    const yy = 1.9 + i * 0.92;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: sx, y: yy + 0.08, w: 0.1, h: 0.1, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
    });
    text(slide, b, sx + 0.25, yy, 3.3, 0.8, { fontSize: 9.4, color: C.inkSoft, lineSpacingMultiple: 1.12 });
  });

  // banda de síntese
  slide.addShape(pptx.ShapeType.roundRect, {
    x, y: 4.95, w, h: 0.9, rectRadius: 0.08,
    fill: { color: C.ink }, line: { color: C.ink, width: 0 },
  });
  [
    ['Ficha técnica completa', 0.25],
    ['Histórico planeado', 2.9],
    ['Notas separadas', 5.55],
  ].forEach(([label, dx]) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + dx, y: 5.36, w: 0.09, h: 0.09, fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    });
    text(slide, label, x + dx + 0.18, 5.27, 2.4, 0.28, { fontSize: 7.8, bold: true, color: 'E2E8F0' });
  });

  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildTimeline(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const x = 1.05;
  const y = 1.9;
  slide.addShape(pptx.ShapeType.line, {
    x: x + 0.11, y: y + 0.12, w: 0, h: 3.9, line: { color: 'CBD5E1', width: 1.5 },
  });
  s.states.forEach((st, i) => {
    const yy = y + i * 0.56;
    slide.addShape(pptx.ShapeType.ellipse, {
      x, y: yy, w: 0.24, h: 0.24, fill: { color: st.color }, line: { color: C.white, width: 2 },
    });
    text(slide, st.name, x + 0.42, yy - 0.02, 3.2, 0.28, { fontSize: 10, bold: i === 2, color: i === 2 ? C.ink : C.muted });
    if (i < s.states.length - 1) {
      text(slide, 'mensagem opcional e fotos', x + 0.42, yy + 0.2, 3.0, 0.2, { fontSize: 6.8, color: '94A3B8' });
    }
  });

  const bx = 5.45;
  card(slide, bx, 1.85, 6.95, 4.1);
  text(slide, 'Configuração por empresa', bx + 0.35, 2.1, 6.2, 0.3, { fontSize: 13, bold: true });
  s.bullets.forEach((b, i) => {
    const yy = 2.58 + i * 0.66;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: bx + 0.35, y: yy, w: 0.32, h: 0.32, rectRadius: 0.1,
      fill: { color: C.softIndigo }, line: { color: C.softIndigo, width: 0 },
    });
    text(slide, String(i + 1), bx + 0.35, yy + 0.045, 0.32, 0.22, { fontSize: 8.5, bold: true, color: C.indigo, align: 'center' });
    text(slide, b, bx + 0.82, yy, 5.8, 0.5, { fontSize: 9.6, color: C.inkSoft, lineSpacingMultiple: 1.08 });
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildPhone(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  s.bullets.forEach((b, i) => {
    const yy = 1.82 + i * 0.82;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: MX, y: yy + 0.07, w: 0.12, h: 0.12, fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    });
    text(slide, b, MX + 0.28, yy, 7.1, 0.7, { fontSize: 10.8, color: C.inkSoft, lineSpacingMultiple: 1.1 });
  });

  const px = 8.75;
  const py = 1.55;
  const pw = 3.35;
  const ph = 5.05;
  slide.addShape(pptx.ShapeType.roundRect, {
    x: px, y: py, w: pw, h: ph, rectRadius: 0.28,
    fill: { color: C.ink }, line: { color: C.ink, width: 0 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: px + 0.11, y: py + 0.11, w: pw - 0.22, h: ph - 0.22, rectRadius: 0.22,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  // cabeçalho com capa
  slide.addShape(pptx.ShapeType.roundRect, {
    x: px + 0.11, y: py + 0.11, w: pw - 0.22, h: 1.05, rectRadius: 0.22,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: px + 0.11, y: py + 0.86, w: pw - 0.22, h: 0.3,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: px + 0.28, y: py + 0.62, w: 0.52, h: 0.52, rectRadius: 0.1,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  text(slide, 'OT', px + 0.28, py + 0.73, 0.52, 0.25, { fontSize: 10, bold: true, color: C.indigo, align: 'center' });
  text(slide, 'A sua oficina', px + 0.9, py + 0.7, 2.0, 0.25, { fontSize: 9, bold: true, color: C.white });
  text(slide, 'Encomenda 2026-0001', px + 0.9, py + 0.92, 2.0, 0.22, { fontSize: 6.5, color: 'E0E7FF' });

  // estado
  slide.addShape(pptx.ShapeType.roundRect, {
    x: px + 0.28, y: py + 1.28, w: pw - 0.56, h: 0.85, rectRadius: 0.08,
    fill: { color: C.softIndigo }, line: { color: 'E0E7FF', width: 0.75 },
  });
  text(slide, 'ESTADO ATUAL', px + 0.42, py + 1.38, 2.2, 0.2, { fontSize: 5.8, bold: true, color: C.indigo, charSpacing: 1 });
  text(slide, 'A imprimir', px + 0.42, py + 1.56, 2.4, 0.32, { fontSize: 14, bold: true, color: C.indigo });
  text(slide, 'Previsão: 12/11/2026', px + 0.42, py + 1.88, 2.2, 0.2, { fontSize: 6.2, color: C.muted });

  // timeline
  const tl = [
    ['A imprimir', C.blue],
    ['Em fila', '94A3B8'],
    ['Recebida', '94A3B8'],
  ];
  tl.forEach((t, i) => {
    const yy = py + 2.38 + i * 0.62;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: px + 0.42, y: yy, w: 0.13, h: 0.13, fill: { color: t[1] }, line: { color: t[1], width: 0 },
    });
    if (i < 2) {
      slide.addShape(pptx.ShapeType.line, {
        x: px + 0.485, y: yy + 0.13, w: 0, h: 0.49, line: { color: 'E2E8F0', width: 1 },
      });
    }
    text(slide, t[0], px + 0.66, yy - 0.04, 1.4, 0.2, { fontSize: 7, bold: i === 0, color: i === 0 ? C.ink : C.muted });
    text(slide, '12/11/2026  ·  14:20', px + 0.66, yy + 0.16, 1.8, 0.18, { fontSize: 5.5, color: '94A3B8' });
  });

  // botão
  slide.addShape(pptx.ShapeType.roundRect, {
    x: px + 0.32, y: py + 4.35, w: pw - 0.64, h: 0.38, rectRadius: 0.08,
    fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
  });
  text(slide, 'Ver passaporte da peça', px + 0.32, py + 4.44, pw - 0.64, 0.22, {
    fontSize: 6.8, bold: true, color: C.white, align: 'center',
  });

  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildFeatures3(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 3.75;
  s.features.forEach((f, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, 1.82, w, 2.55);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: 2.08, w: 0.4, h: 0.4, rectRadius: 0.12,
      fill: { color: C.softIndigo }, line: { color: C.softIndigo, width: 0 },
    });
    text(slide, String(i + 1), x + 0.28, 2.14, 0.4, 0.28, { fontSize: 10, bold: true, color: C.indigo, align: 'center' });
    text(slide, f.title, x + 0.28, 2.62, w - 0.56, 0.4, { fontSize: 13.5, bold: true });
    text(slide, f.text, x + 0.28, 3.06, w - 0.56, 1.1, { fontSize: 9.8, color: C.muted, lineSpacingMultiple: 1.15 });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: MX, y: 4.72, w: CW, h: 1.35, rectRadius: 0.1,
    fill: { color: C.ink }, line: { color: C.ink, width: 0 },
  });
  text(slide, 'NÚMERO DE SÉRIE', MX + 0.4, 4.95, 3, 0.25, { fontSize: 7.5, bold: true, color: '94A3B8', charSpacing: 1.8 });
  text(slide, s.serial, MX + 0.4, 5.22, CW - 0.8, 0.45, { fontSize: 18, bold: true, color: C.white });
  text(slide, 'Ficha técnica, fotos, modelo 3D e certificado associados à peça.', MX + 0.4, 5.7, CW - 0.8, 0.25, {
    fontSize: 8.5, color: '94A3B8',
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildSeal(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);

  // selo
  const cx = 2.35;
  const cy = 3.55;
  slide.addShape(pptx.ShapeType.ellipse, {
    x: cx - 1.15, y: cy - 1.15, w: 2.3, h: 2.3,
    fill: { color: C.softAmber }, line: { color: C.amber, width: 2.5 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: cx - 0.9, y: cy - 0.9, w: 1.8, h: 1.8,
    fill: { color: C.white }, line: { color: C.amber, width: 1 },
  });
  text(slide, 'SELO', cx - 0.9, cy - 0.42, 1.8, 0.25, { fontSize: 8, bold: true, color: C.amberDark, align: 'center', charSpacing: 2 });
  text(slide, s.seal.level, cx - 0.9, cy - 0.2, 1.8, 0.4, { fontSize: 22, bold: true, color: C.amberDark, align: 'center' });
  text(slide, 'AUTENTICIDADE', cx - 0.9, cy + 0.22, 1.8, 0.2, { fontSize: 6, bold: true, color: C.muted, align: 'center', charSpacing: 1.2 });

  // código
  slide.addShape(pptx.ShapeType.roundRect, {
    x: 0.9, y: 5.05, w: 2.95, h: 0.75, rectRadius: 0.08,
    fill: { color: C.white }, line: { color: C.line, width: 0.75 },
  });
  text(slide, 'CÓDIGO DE VERIFICAÇÃO', 1.1, 5.15, 2.5, 0.2, { fontSize: 6.5, bold: true, color: C.muted, charSpacing: 1 });
  text(slide, s.seal.code, 1.1, 5.35, 2.5, 0.35, { fontSize: 16, bold: true, color: C.ink, charSpacing: 1.5 });

  // níveis
  s.levels.forEach((l, i) => {
    const y = 1.85 + i * 1.25;
    card(slide, 4.35, y, 3.1, 1.0);
    const colors = ['B45309', '64748B', 'A16207'];
    text(slide, l.name, 4.6, y + 0.18, 1.3, 0.35, { fontSize: 13, bold: true, color: colors[i] });
    text(slide, l.text, 4.6, y + 0.55, 2.6, 0.28, { fontSize: 8.5, color: C.muted });
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 6.95, y: y + 0.32, w: 0.32, h: 0.32, fill: { color: colors[i] }, line: { color: colors[i], width: 0 },
    });
  });

  // bullets
  s.bullets.forEach((b, i) => {
    const y = 1.95 + i * 0.88;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: 7.9, y: y + 0.07, w: 0.11, h: 0.11, fill: { color: C.emerald }, line: { color: C.emerald, width: 0 },
    });
    text(slide, b, 8.15, y, 3.9, 0.75, { fontSize: 9.8, color: C.inkSoft, lineSpacingMultiple: 1.12 });
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildDocs(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 3.75;
  s.items.forEach((it, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, 1.82, w, 2.35);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: 2.08, w: 0.55, h: 0.7, rectRadius: 0.04,
      fill: { color: C.white }, line: { color: C.line, width: 1 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.36, y: 2.2, w: 0.39, h: 0.05, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.36, y: 2.32, w: 0.28, h: 0.04, fill: { color: 'CBD5E1' }, line: { color: 'CBD5E1', width: 0 },
    });
    slide.addShape(pptx.ShapeType.rect, {
      x: x + 0.36, y: 2.42, w: 0.34, h: 0.04, fill: { color: 'CBD5E1' }, line: { color: 'CBD5E1', width: 0 },
    });
    text(slide, it.title, x + 0.28, 2.95, w - 0.56, 0.35, { fontSize: 14, bold: true });
    text(slide, it.text, x + 0.28, 3.35, w - 0.56, 0.7, { fontSize: 9.6, color: C.muted, lineSpacingMultiple: 1.12 });
  });

  // mock recibo
  card(slide, MX, 4.45, CW, 1.65);
  text(slide, 'RECIBO  ·  REC-2026-0007', MX + 0.35, 4.65, 4.5, 0.3, { fontSize: 7.5, bold: true, color: C.muted, charSpacing: 1.2 });
  text(slide, '84,90 €', MX + 0.35, 4.95, 2.0, 0.45, { fontSize: 22, bold: true, color: C.ink });
  text(slide, 'Ana Martins  ·  12/11/2026  ·  Transferência', MX + 2.6, 5.0, 5.2, 0.35, { fontSize: 9, color: C.muted });
  slide.addShape(pptx.ShapeType.line, {
    x: MX + 0.35, y: 5.55, w: CW - 0.7, h: 0, line: { color: C.line, width: 0.75 },
  });
  text(slide, 'Documento ilustrativo; a geração ainda não está ligada.', MX + 0.35, 5.68, CW - 0.7, 0.25, { fontSize: 7.5, italic: true, color: '94A3B8' });

  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildQr(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  slide.addImage({ path: QR, x: 0.95, y: 1.95, w: 2.75, h: 2.75 });
  text(slide, s.caption, 0.95, 4.8, 2.9, 0.4, { fontSize: 7.5, italic: true, color: C.muted, align: 'center' });

  s.steps.forEach((st, i) => {
    const x = 4.35;
    const y = 1.95 + i * 1.25;
    card(slide, x, y, 8.0, 1.0);
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.28, y: y + 0.28, w: 0.44, h: 0.44,
      fill: { color: C.softIndigo }, line: { color: C.softIndigo, width: 0 },
    });
    text(slide, String(i + 1), x + 0.28, y + 0.36, 0.44, 0.3, { fontSize: 11, bold: true, color: C.indigo, align: 'center' });
    text(slide, st.title, x + 0.92, y + 0.18, 2.0, 0.3, { fontSize: 13, bold: true });
    text(slide, st.text, x + 0.92, y + 0.52, 6.7, 0.3, { fontSize: 9.5, color: C.muted });
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildBrand(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);

  // swatches
  s.swatches.forEach((sw, i) => {
    const x = MX + i * 1.55;
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.9, w: 1.2, h: 0.95, rectRadius: 0.08,
      fill: { color: sw.hex.replace('#', '') }, line: { color: C.line, width: 0.75 },
    });
    text(slide, sw.name, x, 2.95, 1.2, 0.22, { fontSize: 7.5, color: C.muted });
    text(slide, sw.hex, x, 3.15, 1.2, 0.22, { fontSize: 7, color: '94A3B8' });
  });

  s.bullets.forEach((b, i) => {
    const y = 3.65 + i * 0.62;
    slide.addShape(pptx.ShapeType.ellipse, {
      x: MX, y: y + 0.07, w: 0.11, h: 0.11, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
    });
    text(slide, b, MX + 0.26, y, 6.5, 0.55, { fontSize: 9.8, color: C.inkSoft });
  });

  // mini portal
  const x = 8.35;
  card(slide, x, 1.8, 4.28, 4.55);
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.15, y: 1.95, w: 3.98, h: 0.95, rectRadius: 0.1,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: x + 0.32, y: 2.1, w: 0.6, h: 0.6, rectRadius: 0.1,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  text(slide, 'A sua marca', x + 1.05, 2.12, 2.7, 0.28, { fontSize: 10, bold: true, color: C.white });
  text(slide, 'Encomenda 2026-0001', x + 1.05, 2.4, 2.7, 0.22, { fontSize: 6.5, color: 'E0E7FF' });
  text(slide, 'A imprimir', x + 0.3, 3.2, 3.6, 0.5, { fontSize: 22, bold: true, color: C.ink });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.3, y: 3.85, w: 3.6, h: 0.1, rectRadius: 0.05,
    fill: { color: 'E2E8F0' }, line: { color: 'E2E8F0', width: 0 },
  });
  slide.addShape(pptx.ShapeType.rect, {
    x: x + 0.3, y: 3.85, w: 2.0, h: 0.1, rectRadius: 0.05,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  [0, 1, 2].forEach((i) => {
    slide.addShape(pptx.ShapeType.ellipse, {
      x: x + 0.3, y: 4.25 + i * 0.5, w: 0.14, h: 0.14,
      fill: { color: i === 0 ? C.indigo : 'CBD5E1' }, line: { color: i === 0 ? C.indigo : 'CBD5E1', width: 0 },
    });
    text(slide, ['A imprimir', 'Em fila', 'Recebida'][i], x + 0.55, 4.2 + i * 0.5, 2.5, 0.25, {
      fontSize: 8, bold: i === 0, color: i === 0 ? C.ink : C.muted,
    });
  });
  text(slide, 'Pré-visualização do portal do comprador', x + 0.3, 5.95, 3.6, 0.22, {
    fontSize: 6.8, italic: true, color: '94A3B8',
  });

  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildSecurity(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 3.75;
  s.pillars.forEach((p, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, 1.8, w, 1.55);
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.25, y: 2.02, w: 0.36, h: 0.36, rectRadius: 0.1,
      fill: { color: C.softEmerald }, line: { color: C.softEmerald, width: 0 },
    });
    text(slide, '✓', x + 0.25, 2.07, 0.36, 0.26, { fontSize: 10, bold: true, color: C.emeraldDark, align: 'center' });
    text(slide, p.title, x + 0.72, 2.02, w - 0.95, 0.35, { fontSize: 12.5, bold: true });
    text(slide, p.text, x + 0.25, 2.48, w - 0.5, 0.7, { fontSize: 9.2, color: C.muted, lineSpacingMultiple: 1.12 });
  });

  slide.addShape(pptx.ShapeType.roundRect, {
    x: MX, y: 3.62, w: CW, h: 2.2, rectRadius: 0.1,
    fill: { color: C.softAmber }, line: { color: 'FED7AA', width: 0.75 },
  });
  text(slide, 'RISCOS IDENTIFICADOS NA AUDITORIA', MX + 0.35, 3.85, 8, 0.25, {
    fontSize: 8, bold: true, color: C.amberDark, charSpacing: 1.6,
  });
  s.risks.forEach((r, i) => {
    const y = 4.2 + i * 0.48;
    slide.addShape(pptx.ShapeType.rect, {
      x: MX + 0.35, y: y + 0.09, w: 0.08, h: 0.08, fill: { color: C.amberDark }, line: { color: C.amberDark, width: 0 },
    });
    text(slide, r, MX + 0.58, y, 10.9, 0.4, { fontSize: 9.3, color: '78350F' });
  });
  statusNote(slide, s);
  slide.addNotes(s.note);
}

function buildArchitecture(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 3.75;
  s.layers.forEach((l, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, 1.85, w, 3.35);
    const accent = C[l.color] || C.indigo;
    slide.addShape(pptx.ShapeType.roundRect, {
      x, y: 1.85, w, h: 0.1, rectRadius: 0.04,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    text(slide, String(i + 1).padStart(2, '0'), x + 0.28, 2.1, 0.6, 0.3, { fontSize: 9, bold: true, color: accent, charSpacing: 1 });
    text(slide, l.title, x + 0.28, 2.42, w - 0.56, 0.4, { fontSize: 15, bold: true });
    l.items.forEach((it, j) => {
      const y = 3.05 + j * 0.5;
      text(slide, it, x + 0.28, y, w - 0.56, 0.35, { fontSize: 9.5, color: C.inkSoft });
      if (j < l.items.length - 1) {
        slide.addShape(pptx.ShapeType.line, {
          x: x + 0.28, y: y + 0.38, w: w - 0.56, h: 0, line: { color: 'F1F5F9', width: 0.75 },
        });
      }
    });
  });
  slide.addShape(pptx.ShapeType.roundRect, {
    x: MX, y: 5.45, w: CW, h: 0.65, rectRadius: 0.08,
    fill: { color: C.ink }, line: { color: C.ink, width: 0 },
  });
  text(slide, s.footer, MX + 0.3, 5.62, CW - 0.6, 0.3, { fontSize: 9.5, color: 'CBD5E1' });
  slide.addNotes(s.note);
}

function buildMatrix(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const rows = s.rows.map(([label, st]) => {
    const meta = STATUS[st];
    return [
      { text: label, options: { fontSize: 8.6, color: C.inkSoft, bold: false } },
      { text: `■  ${meta.label}`, options: { fontSize: 8.4, bold: true, color: meta.fg } },
    ];
  });
  const head = [
    { text: 'Módulo / funcionalidade', options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 8.5 } },
    { text: 'Estado', options: { bold: true, color: C.white, fill: { color: C.ink }, fontSize: 8.5 } },
  ];
  slide.addTable([head, ...rows], {
    x: MX, y: 1.72, w: CW,
    colW: [8.5, 3.43],
    rowH: 0.35,
    border: { type: 'solid', pt: 0.5, color: C.line },
    fontFace: FONT,
    valign: 'middle',
    margin: 0.07,
  });
  text(slide, 'Nenhum item está validado ponta a ponta. Matriz detalhada na documentação técnica.', MX, 6.55, CW, 0.25, {
    fontSize: 7.2, italic: true, color: C.muted,
  });
  slide.addNotes(s.note);
}

function buildPersonas(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 3.75;
  s.personas.forEach((p, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, 1.82, w, 4.25);
    text(slide, p.tag, x + 0.28, 2.05, w - 0.56, 0.45, {
      fontSize: 7.5, bold: true, color: C.indigo, charSpacing: 1.2,
    });
    text(slide, p.title, x + 0.28, 2.55, w - 0.56, 0.9, { fontSize: 13, bold: true, lineSpacingMultiple: 1.05 });
    text(slide, p.text, x + 0.28, 3.55, w - 0.56, 1.2, { fontSize: 9.4, color: C.muted, lineSpacingMultiple: 1.15 });
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: 4.95, w: w - 0.56, h: 0.85, rectRadius: 0.06,
      fill: { color: C.softEmerald }, line: { color: 'D1FAE5', width: 0.75 },
    });
    text(slide, p.gain, x + 0.42, 5.08, w - 0.84, 0.6, { fontSize: 8.2, bold: true, color: C.emeraldDark });
  });
  slide.addNotes(s.note);
}

function buildRoadmap(s) {
  const slide = pptx.addSlide();
  addHeader(slide, s);
  const w = 3.75;
  s.phases.forEach((p, i) => {
    const x = MX + i * (w + 0.34);
    card(slide, x, 1.82, w, 4.35);
    const accent = C[p.color] || C.indigo;
    slide.addShape(pptx.ShapeType.roundRect, {
      x: x + 0.28, y: 2.05, w: 1.0, h: 0.3, rectRadius: 0.14,
      fill: { color: accent, transparency: 85 }, line: { color: accent, width: 0.75 },
    });
    text(slide, p.tag, x + 0.28, 2.1, 1.0, 0.22, { fontSize: 7, bold: true, color: accent, align: 'center', charSpacing: 1 });
    text(slide, p.title, x + 0.28, 2.5, w - 0.56, 0.6, { fontSize: 14, bold: true });
    p.items.forEach((it, j) => {
      const y = 3.22 + j * 0.65;
      slide.addShape(pptx.ShapeType.ellipse, {
        x: x + 0.3, y: y + 0.08, w: 0.09, h: 0.09, fill: { color: accent }, line: { color: accent, width: 0 },
      });
      text(slide, it, x + 0.52, y, w - 0.8, 0.55, { fontSize: 9.2, color: C.inkSoft, lineSpacingMultiple: 1.08 });
    });
    text(slide, p.criterion, x + 0.28, 5.55, w - 0.56, 0.5, {
      fontSize: 7.2, italic: true, color: C.muted, lineSpacingMultiple: 1.1,
    });
  });
  slide.addNotes(s.note);
}

function buildClosing(s) {
  const slide = pptx.addSlide();
  slide.background = { color: C.ink };
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 8.4, y: -1.2, w: 6.5, h: 6.5, fill: { color: '111C33' }, line: { color: '1E293B', width: 1 },
  });
  slide.addShape(pptx.ShapeType.ellipse, {
    x: 9.3, y: -0.3, w: 4.7, h: 4.7, fill: { color: '0F172A' }, line: { color: '334155', width: 1 },
  });
  slide.addImage({ path: LOGO_ICON, x: 10.0, y: 0.7, w: 3.3, h: 3.3 });

  slide.addText(s.eyebrow, {
    x: MX, y: 1.55, w: 7.5, h: 0.3, fontSize: 9, bold: true, color: C.emerald, charSpacing: 2.4, fontFace: FONT,
  });
  slide.addText(s.title, {
    x: MX, y: 1.95, w: 7.8, h: 1.8, fontSize: 34, bold: true, color: C.white, fontFace: FONT, lineSpacingMultiple: 1.0,
  });
  slide.addText(s.subtitle, {
    x: MX, y: 3.85, w: 7.2, h: 1.2, fontSize: 13, color: 'CBD5E1', fontFace: FONT, lineSpacingMultiple: 1.2,
  });
  slide.addShape(pptx.ShapeType.line, {
    x: MX, y: 5.45, w: 7.2, h: 0, line: { color: '334155', width: 0.75 },
  });
  slide.addText(s.footer, {
    x: MX, y: 5.6, w: 7.4, h: 0.35, fontSize: 8.5, color: '94A3B8', fontFace: FONT,
  });
  slide.addText('Obrigado.', {
    x: MX, y: 6.3, w: 3, h: 0.4, fontSize: 14, bold: true, color: C.white, fontFace: FONT,
  });
  slide.addNotes(s.note);
}

const builders = {
  cover: buildCover,
  cards3: buildCards3,
  statement: buildStatement,
  value4: buildValue4,
  three: buildThree,
  steps: buildSteps,
  splitMock: buildSplitMock,
  table: buildTable,
  timeline: buildTimeline,
  phone: buildPhone,
  features3: buildFeatures3,
  seal: buildSeal,
  docs: buildDocs,
  qr: buildQr,
  brand: buildBrand,
  security: buildSecurity,
  architecture: buildArchitecture,
  matrix: buildMatrix,
  personas: buildPersonas,
  roadmap: buildRoadmap,
  closing: buildClosing,
};

for (const s of SLIDES) {
  page += 1;
  const fn = builders[s.type];
  if (!fn) throw new Error(`Tipo de slide desconhecido: ${s.type}`);
  fn(s);
}

const out = path.join(OUT_DIR, 'OrbitTrack_Apresentacao_Comercial.pptx');
await pptx.writeFile({ fileName: out });
console.log('PPTX:', out, fs.statSync(out).size, 'bytes,', total, 'diapositivos');
