import PptxGenJS from 'pptxgenjs';

/* ------------------------------------------------------------------ */
/*  OrbitTrack · Gerador da apresentação comercial v2.0                */
/*  Uso: node scripts/gerar-apresentacao.mjs                           */
/* ------------------------------------------------------------------ */

const pptx = new PptxGenJS();
pptx.layout = 'LAYOUT_WIDE'; // 13.333 x 7.5 in
pptx.author = 'OrbitTrack';
pptx.company = 'OrbitTrack';
pptx.subject = 'Plataforma white-label de rastreio e certificação para impressão 3D';
pptx.title = 'OrbitTrack v2.0';
pptx.lang = 'pt-PT';

const W = 13.333;
const H = 7.5;
const F = 'Segoe UI';
const M = 'Consolas';
const S = pptx.ShapeType;

const C = {
  bg: '0B1020',
  bg2: '151C33',
  ink: '0F172A',
  white: 'FFFFFF',
  s50: 'F8FAFC',
  s100: 'F1F5F9',
  s200: 'E2E8F0',
  s300: 'CBD5E1',
  s400: '94A3B8',
  s500: '64748B',
  s600: '475569',
  s700: '334155',
  indigo: '4F46E5',
  indigoDark: '3730A3',
  indigoSoft: 'EEF2FF',
  indigo200: 'C7D2FE',
  violet: '8B5CF6',
  amber: 'F59E0B',
  amberSoft: 'FEF3C7',
  amberDark: 'B45309',
  green: '10B981',
  greenSoft: 'D1FAE5',
  greenDark: '047857',
  red: 'EF4444',
  redSoft: 'FEE2E2',
};

// pptxgenjs muta o objeto de sombra (converte para EMU), por isso devolvemos
// sempre uma instância nova para evitar valores corrompidos a partir do 2.º uso.
const shadow = () => ({ type: 'outer', color: '94A3B8', blur: 8, offset: 2, angle: 90, opacity: 0.18 });

/* ----------------------------- helpers ---------------------------- */

const t = (slide, text, o = {}) =>
  slide.addText(text, { fontFace: F, color: C.ink, ...o });

function card(slide, x, y, w, h, o = {}) {
  const {
    fill = C.white,
    line = C.s200,
    radius = 0.12,
    sh = true,
    lineWidth = 1,
  } = o;
  slide.addShape(radius ? S.roundRect : S.rect, {
    x, y, w, h,
    rectRadius: radius || undefined,
    fill: { color: fill },
    line: { color: line, width: lineWidth },
    ...(sh ? { shadow: shadow() } : {}),
  });
}

function pill(slide, x, y, w, h, label, o = {}) {
  const { fill = C.indigoSoft, color = C.indigo, size = 9, bold = true } = o;
  slide.addShape(S.roundRect, {
    x, y, w, h, rectRadius: h / 2,
    fill: { color: fill }, line: { color: fill, width: 0 },
  });
  t(slide, label, {
    x, y, w, h, fontSize: size, bold, color, align: 'center', valign: 'middle',
  });
}

function lineShape(slide, a, b, color, width = 1.5) {
  const x = Math.min(a[0], b[0]);
  const y = Math.min(a[1], b[1]);
  const w = Math.max(Math.abs(b[0] - a[0]), 0.002);
  const h = Math.max(Math.abs(b[1] - a[1]), 0.002);
  const flipV = (b[0] - a[0]) * (b[1] - a[1]) < 0;
  slide.addShape(S.line, { x, y, w, h, flipV, line: { color, width } });
}

function cubeWire(slide, cx, cy, size, color = 'A5B4FC', width = 2) {
  const w = size * 0.5;
  const h = size * 0.29;
  const P1 = [cx, cy - h * 2];
  const P2 = [cx + w, cy - h];
  const P3 = [cx + w, cy + h];
  const P4 = [cx, cy + h * 2];
  const P5 = [cx - w, cy + h];
  const P6 = [cx - w, cy - h];
  const P0 = [cx, cy];
  [
    [P1, P2], [P2, P3], [P3, P4], [P4, P5], [P5, P6], [P6, P1],
    [P0, P2], [P0, P4], [P0, P6],
  ].forEach(([a, b]) => lineShape(slide, a, b, color, width));
}

function header(slide, kicker, title, sub) {
  t(slide, kicker.toUpperCase(), {
    x: 0.7, y: 0.5, w: 11.9, h: 0.24,
    fontSize: 9.5, bold: true, color: C.indigo, charSpacing: 2.2,
  });
  t(slide, title, {
    x: 0.7, y: 0.76, w: 11.9, h: 0.55,
    fontSize: 27, bold: true, color: C.ink,
  });
  if (sub) {
    t(slide, sub, {
      x: 0.7, y: 1.3, w: 11.6, h: 0.36,
      fontSize: 11.5, color: C.s500,
    });
  }
}

function footer(slide, dark = false) {
  slide.addShape(S.line, {
    x: 0.7, y: 6.98, w: W - 1.4, h: 0.002,
    line: { color: dark ? '243049' : C.s200, width: 0.75 },
  });
  t(slide, 'OrbitTrack · Plataforma de rastreio e certificação para impressão 3D', {
    x: 0.7, y: 7.05, w: 9, h: 0.3, fontSize: 8, color: dark ? '64748B' : C.s400,
  });
  t(slide, 'v2.0 · 2026', {
    x: W - 2.6, y: 7.05, w: 1.9, h: 0.3, fontSize: 8,
    color: dark ? '64748B' : C.s400, align: 'right',
  });
}

function newSlide(dark = false) {
  const s = pptx.addSlide();
  s.background = { color: dark ? C.bg : C.white };
  return s;
}

/* browser mock frame ------------------------------------------------- */
function browser(slide, x, y, w, h, url) {
  slide.addShape(S.roundRect, {
    x, y, w, h, rectRadius: 0.14,
    fill: { color: C.white }, line: { color: C.s200, width: 1.2 }, shadow: shadow(),
  });
  slide.addShape(S.roundRect, {
    x: x + 0.03, y: y + 0.03, w: w - 0.06, h: 0.34, rectRadius: 0.1,
    fill: { color: C.s100 }, line: { color: C.s100, width: 0 },
  });
  ['EF4444', 'F59E0B', '10B981'].forEach((c, i) => {
    slide.addShape(S.ellipse, {
      x: x + 0.2 + i * 0.16, y: y + 0.14, w: 0.1, h: 0.1,
      fill: { color: c }, line: { color: c, width: 0 },
    });
  });
  slide.addShape(S.roundRect, {
    x: x + 0.72, y: y + 0.11, w: w - 1.4, h: 0.19, rectRadius: 0.09,
    fill: { color: C.white }, line: { color: C.s200, width: 0.6 },
  });
  t(slide, url, {
    x: x + 0.72, y: y + 0.11, w: w - 1.4, h: 0.19,
    fontSize: 6.5, color: C.s400, align: 'center', valign: 'middle',
  });
}

function sidebarMock(slide, x, y, w, h) {
  slide.addShape(S.rect, {
    x, y, w, h, fill: { color: '0E1428' }, line: { color: '0E1428', width: 0 },
  });
  t(slide, 'OrbitTrack', { x: x + 0.22, y: y + 0.22, w: w - 0.3, h: 0.24, fontSize: 9, bold: true, color: C.white });
  const items = ['Dashboard', 'Encomendas', 'Produtos & Consumo', 'A Minha Empresa', 'Estados'];
  items.forEach((it, i) => {
    const iy = y + 0.72 + i * 0.42;
    const active = i === 1;
    if (active) {
      slide.addShape(S.roundRect, {
        x: x + 0.14, y: iy - 0.05, w: w - 0.28, h: 0.3, rectRadius: 0.07,
        fill: { color: '312E81' }, line: { color: '312E81', width: 0 },
      });
    }
    slide.addShape(S.roundRect, {
      x: x + 0.24, y: iy + 0.02, w: 0.12, h: 0.12, rectRadius: 0.03,
      fill: { color: active ? 'A5B4FC' : '475569' }, line: { color: active ? 'A5B4FC' : '475569', width: 0 },
    });
    t(slide, it, {
      x: x + 0.44, y: iy - 0.04, w: w - 0.6, h: 0.24,
      fontSize: 7, color: active ? C.white : '94A3B8', bold: active,
    });
  });
}

function kpi(slide, x, y, w, h, label, value, accent = C.indigo) {
  card(slide, x, y, w, h, { radius: 0.1 });
  slide.addShape(S.ellipse, {
    x: x + 0.22, y: y + 0.37, w: 0.09, h: 0.09,
    fill: { color: accent }, line: { color: accent, width: 0 },
  });
  t(slide, label, { x: x + 0.38, y: y + 0.29, w: w - 0.5, h: 0.2, fontSize: 7, color: C.s500 });
  t(slide, value, { x: x + 0.22, y: y + 0.51, w: w - 0.4, h: 0.36, fontSize: 18, bold: true, color: C.ink });
}

/* ================================================================== */
/* 01 · CAPA                                                          */
/* ================================================================== */
{
  const s = newSlide(true);
  s.addShape(S.ellipse, { x: 8.0, y: -1.8, w: 7.2, h: 7.2, fill: { color: '161E3A' }, line: { color: '161E3A', width: 0 } });
  s.addShape(S.ellipse, { x: 9.4, y: -0.4, w: 4.6, h: 4.6, fill: { color: '221F52' }, line: { color: '221F52', width: 0 } });
  cubeWire(s, 11.15, 3.35, 3.3, 'A5B4FC', 2.25);
  s.addShape(S.ellipse, {
    x: 10.0, y: 5.72, w: 2.3, h: 0.22, fill: { color: '312E81' }, line: { color: '312E81', width: 0 },
  });

  pill(s, 0.95, 0.95, 2.75, 0.34, 'V2.0  ·  OUTUBRO 2026', {
    fill: '1E2749', color: C.indigo200, size: 9,
  });

  t(s, 'OrbitTrack', {
    x: 0.92, y: 1.42, w: 7.6, h: 1.0, fontSize: 54, bold: true, color: C.white,
  });
  t(s, 'Rastreio em tempo real, certificação digital\ne visualização 3D / AR para estúdios de impressão 3D.', {
    x: 0.95, y: 2.48, w: 6.9, h: 0.95, fontSize: 16, color: 'C7D2FE', lineSpacing: 26,
  });

  s.addShape(S.line, { x: 0.98, y: 3.72, w: 1.5, h: 0.002, line: { color: C.indigo, width: 3 } });

  const chips = [
    ['Portal mobile-first', 2.05],
    ['Passaporte 3D + AR', 2.05],
    ['Certificado verificável', 2.3],
  ];
  let cx = 0.95;
  chips.forEach(([label, w]) => {
    pill(s, cx, 4.12, w, 0.34, label, { fill: '1E2749', color: 'A5B4FC', size: 8.5 });
    cx += w + 0.15;
  });

  t(s, 'WHITE-LABEL SAAS', {
    x: 0.95, y: 5.05, w: 3, h: 0.22, fontSize: 8.5, bold: true, color: '64748B', charSpacing: 2,
  });
  t(s, 'React 19  ·  TypeScript  ·  Supabase  ·  Tailwind v4  ·  Vercel', {
    x: 0.95, y: 5.3, w: 6.6, h: 0.3, fontSize: 10, color: '94A3B8',
  });

  t(s, 'Apresentação da plataforma e simulação das funcionalidades', {
    x: 0.95, y: 6.55, w: 8, h: 0.3, fontSize: 9, color: '64748B', italic: true,
  });
}

/* ================================================================== */
/* 02 · NOVIDADES DESTA VERSÃO                                        */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Novidades', 'O que mudou nesta versão',
    'Quatro frentes de evolução: mobilidade, operação, stock e experiência imersiva do cliente.');

  const items = [
    ['01', 'Portal público mobile-first', 'Rastreio, peças e certificados redesenhados para ecrãs de telemóvel, com timeline e cartões de leitura imediata.', C.indigo],
    ['02', 'Gestão de encomendas adaptativa', 'A tabela do painel transforma-se em cartões touch-friendly abaixo de 768 px — sem scroll horizontal nem zoom.', C.violet],
    ['03', 'Catálogo de produtos & consumo', 'Produtos pré-definidos com peso, tempo e preço; carretéis de filamento com barra de stock e abate rápido de consumo.', C.green],
    ['04', 'Passaporte 3D com AR em ecrã inteiro', 'A câmara abre em modo imersivo (fixed inset-0) com o modelo sobreposto ao ambiente real e escala 1:1.', C.amber],
  ];

  items.forEach(([num, title, desc, accent], i) => {
    const x = 0.7 + (i % 2) * 6.02;
    const y = 1.9 + Math.floor(i / 2) * 2.28;
    card(s, x, y, 5.85, 2.05, { radius: 0.14 });
    s.addShape(S.roundRect, {
      x: x + 0.22, y: y + 0.22, w: 0.5, h: 0.5, rectRadius: 0.12,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    t(s, num, { x: x + 0.22, y: y + 0.22, w: 0.5, h: 0.5, fontSize: 12, bold: true, color: C.white, align: 'center', valign: 'middle' });
    t(s, title, { x: x + 0.86, y: y + 0.22, w: 4.8, h: 0.3, fontSize: 13, bold: true, color: C.ink });
    t(s, desc, { x: x + 0.86, y: y + 0.58, w: 4.72, h: 1.2, fontSize: 9.5, color: C.s600, lineSpacing: 15 });
  });

  footer(s);
  s.addNotes('Quatro frentes: responsividade do portal e do painel, nova área de produtos/consumo e o modo AR imersivo do passaporte digital.');
}

/* ================================================================== */
/* 03 · PROBLEMA / SOLUÇÃO                                            */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Contexto', 'O problema que a plataforma resolve',
    'Oficinas de impressão 3D vendem por WhatsApp e perdem tempo a responder "como está a minha encomenda?".');

  card(s, 0.7, 1.95, 5.35, 4.05, { fill: C.s50, line: C.s200, sh: false });
  pill(s, 0.95, 2.18, 1.55, 0.3, 'ANTES', { fill: C.redSoft, color: 'B91C1C', size: 8 });
  const dores = [
    ['Sem visibilidade', 'O cliente pergunta o estado por mensagem; a resposta é manual e repetitiva.'],
    ['Provas frágeis', 'Nada comprova que a peça é original nem quem a produziu.'],
    ['Sem contexto visual', 'O comprador só vê a peça quando a recebe — não sabe escala nem acabamento.'],
  ];
  dores.forEach(([tt, d], i) => {
    const y = 2.68 + i * 1.05;
    s.addShape(S.ellipse, { x: 0.98, y: y + 0.07, w: 0.16, h: 0.16, fill: { color: C.red }, line: { color: C.red, width: 0 } });
    t(s, tt, { x: 1.28, y, w: 4.4, h: 0.26, fontSize: 12, bold: true, color: '991B1B' });
    t(s, d, { x: 1.28, y: y + 0.26, w: 4.4, h: 0.55, fontSize: 9.5, color: C.s600, lineSpacing: 14 });
  });

  s.addShape(S.rightArrow, {
    x: 6.15, y: 3.62, w: 0.95, h: 0.42,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });

  card(s, 7.2, 1.95, 5.45, 4.05, { fill: C.indigoSoft, line: C.indigo200, sh: false });
  pill(s, 7.45, 2.18, 1.75, 0.3, 'COM ORBITTRACK', { fill: C.indigo, color: C.white, size: 8 });
  const sol = [
    ['Link secreto por encomenda', 'Um URL único mostra estado, previsão, histórico e peças — sem login.'],
    ['Certificado com código 8 dígitos', 'Verificação pública e independente da autenticidade de cada peça.'],
    ['Passaporte 3D + AR', 'O cliente vê o modelo na câmara do telemóvel, em tamanho real.'],
  ];
  sol.forEach(([tt, d], i) => {
    const y = 2.68 + i * 1.05;
    s.addShape(S.ellipse, { x: 7.48, y: y + 0.07, w: 0.16, h: 0.16, fill: { color: C.green }, line: { color: C.green, width: 0 } });
    t(s, tt, { x: 7.78, y, w: 4.5, h: 0.26, fontSize: 12, bold: true, color: C.indigoDark });
    t(s, d, { x: 7.78, y: y + 0.26, w: 4.5, h: 0.55, fontSize: 9.5, color: C.s600, lineSpacing: 14 });
  });

  footer(s);
  s.addNotes('Enquadramento: reduzir suporte manual, criar prova de autenticidade e dar contexto visual antes da entrega.');
}

/* ================================================================== */
/* 04 · ARQUITETURA                                                   */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Arquitetura', 'Como a plataforma está montada',
    'Front-end estático na Vercel, autenticação e dados no Supabase, exposição pública controlada por RPC.');

  const boxes = [
    ['Vendedor', 'Painel autenticado\nReact + Tailwind', C.indigo],
    ['Base de dados', 'PostgreSQL + RLS\nStorage de .glb e fotos', C.violet],
    ['Camada pública', 'RPC security definer\n3 funções seguras', C.amber],
    ['Cliente final', 'Portal por link secreto\nSem conta, sem login', C.green],
  ];

  boxes.forEach(([tt, d, accent], i) => {
    const x = 0.75 + i * 3.1;
    card(s, x, 2.35, 2.55, 1.85, { radius: 0.14 });
    s.addShape(S.roundRect, {
      x: x + 0.2, y: 2.52, w: 1.55, h: 0.09, rectRadius: 0.045,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    t(s, tt, { x: x + 0.2, y: 2.72, w: 2.15, h: 0.3, fontSize: 12.5, bold: true, color: C.ink });
    t(s, d, { x: x + 0.2, y: 3.05, w: 2.15, h: 0.9, fontSize: 9, color: C.s500, lineSpacing: 14 });
  });

  for (let i = 0; i < 3; i++) {
    s.addShape(S.rightArrow, {
      x: 3.38 + i * 3.1, y: 3.15, w: 0.42, h: 0.24,
      fill: { color: C.s300 }, line: { color: C.s300, width: 0 },
    });
  }

  card(s, 0.75, 4.55, 11.85, 2.05, { fill: C.s50, line: C.s200, sh: false });
  const cols = [
    ['Autenticação', 'Supabase Auth com triggers de criação de empresa e perfis white-label por utilizador.'],
    ['Isolamento', 'Row Level Security garante que cada vendedor só vê os seus próprios registos.'],
    ['Distribuição', 'Deploy automático: push para main → build Vite → CDN global da Vercel.'],
  ];
  cols.forEach(([tt, d], i) => {
    const x = 1.02 + i * 3.9;
    t(s, `0${i + 1}`, { x, y: 4.78, w: 0.5, h: 0.24, fontSize: 9, bold: true, color: C.indigo, charSpacing: 1 });
    t(s, tt, { x, y: 5.02, w: 3.5, h: 0.26, fontSize: 11.5, bold: true, color: C.ink });
    t(s, d, { x, y: 5.3, w: 3.55, h: 1.0, fontSize: 9, color: C.s600, lineSpacing: 14 });
  });

  footer(s);
  s.addNotes('O cliente final nunca toca nas tabelas: apenas nas três RPC públicas (encomenda, peça e certificado).');
}

/* ================================================================== */
/* 05 · PAINEL · DASHBOARD                                            */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Painel do vendedor', 'Visão geral do negócio',
    'Indicadores de volume, tempo de fabrico e reputação, com acesso imediato às encomendas recentes.');

  const bx = 0.7, by = 1.85, bw = 11.95, bh = 4.95;
  browser(s, bx, by, bw, bh, 'orbittrack.vercel.app/painel');
  sidebarMock(s, bx + 0.04, by + 0.38, 2.25, bh - 0.42);

  const cx0 = bx + 2.45;
  t(s, 'Dashboard', { x: cx0, y: by + 0.55, w: 4, h: 0.3, fontSize: 14, bold: true, color: C.ink });
  t(s, 'Bem-vindo de volta · Outubro 2026', { x: cx0, y: by + 0.85, w: 5, h: 0.22, fontSize: 8, color: C.s500 });

  const kx = cx0;
  kpi(s, kx, by + 1.18, 2.85, 1.05, 'Total de encomendas', '148', C.indigo);
  kpi(s, kx + 3.02, by + 1.18, 2.85, 1.05, 'Tempo médio de fabrico', '3 dias', C.violet);
  kpi(s, kx + 6.04, by + 1.18, 2.85, 1.05, 'Avaliação média', '4,8 / 5', C.amber);

  card(s, kx, by + 2.42, 8.9, 1.95, { radius: 0.1 });
  t(s, 'Encomendas recentes', { x: kx + 0.2, y: by + 2.58, w: 4, h: 0.24, fontSize: 9.5, bold: true, color: C.ink });
  const rows = [
    ['2026-0148', 'Ana Ribeiro', 'A imprimir', C.indigoSoft, C.indigo],
    ['2026-0147', 'Miguel Costa', 'Acabamento', C.amberSoft, C.amberDark],
    ['2026-0146', 'Sofia Alves', 'Enviada', C.greenSoft, C.greenDark],
  ];
  rows.forEach(([num, nome, est, bg, fg], i) => {
    const ry = by + 2.92 + i * 0.46;
    t(s, num, { x: kx + 0.2, y: ry, w: 1.2, h: 0.24, fontSize: 8, bold: true, color: C.indigo, fontFace: M });
    t(s, nome, { x: kx + 1.45, y: ry, w: 2.3, h: 0.24, fontSize: 8, color: C.s700 });
    pill(s, kx + 7.55, ry - 0.03, 1.1, 0.24, est.toUpperCase(), { fill: bg, color: fg, size: 6.5 });
    s.addShape(S.line, { x: kx + 0.2, y: ry + 0.36, w: 8.5, h: 0.002, line: { color: C.s100, width: 0.75 } });
  });

  footer(s);
  s.addNotes('Dashboard: KPIs ligados por contagem exata na tabela de encomendas, com estados padrão configuráveis.');
}

/* ================================================================== */
/* 06 · ENCOMENDAS · DESKTOP                                          */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Operação', 'Gestão de encomendas em desktop',
    'Cada linha concentra estado, previsão, edição, certificado, link público e envio por WhatsApp.');

  const bx = 0.55, by = 1.8, bw = 12.2, bh = 4.95;
  browser(s, bx, by, bw, bh, 'orbittrack.vercel.app/painel/encomendas');

  t(s, 'Gestão de Encomendas', { x: bx + 0.35, y: by + 0.58, w: 5, h: 0.3, fontSize: 14, bold: true, color: C.ink });
  t(s, 'Edite, emita certificados, atualize estados e comunique com clientes.', {
    x: bx + 0.35, y: by + 0.9, w: 6.5, h: 0.22, fontSize: 7.5, color: C.s500,
  });
  s.addShape(S.roundRect, {
    x: bx + bw - 2.15, y: by + 0.62, w: 1.75, h: 0.34, rectRadius: 0.09,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  t(s, '+  Nova Encomenda', {
    x: bx + bw - 2.15, y: by + 0.62, w: 1.75, h: 0.34, fontSize: 8, bold: true, color: C.white, align: 'center', valign: 'middle',
  });

  // table surface
  slideTable: {
    const tx = bx + 0.35, ty = by + 1.28, tw = bw - 0.7;
    card(s, tx, ty, tw, 3.15, { radius: 0.1, sh: false, line: C.s200 });
    s.addShape(S.roundRect, {
      x: tx + 0.02, y: ty + 0.02, w: tw - 0.04, h: 0.36, rectRadius: 0.08,
      fill: { color: C.s50 }, line: { color: C.s50, width: 0 },
    });
    const heads = ['Nº ENCOMENDA', 'COMPRADOR', 'ESTADO DE FABRICO', 'PREVISÃO', 'AÇÕES & CERTIFICADO'];
    const xs = [0.18, 1.9, 4.1, 6.4, 8.1];
    const ws = [1.6, 2.1, 2.2, 1.6, 3.3];
    heads.forEach((h, i) => {
      t(s, h, {
        x: tx + xs[i], y: ty + 0.1, w: ws[i], h: 0.2, fontSize: 6.2, bold: true, color: C.s500,
        align: i === 4 ? 'right' : 'left',
      });
    });
    const rows = [
      ['2026-0148', 'Ana Ribeiro', 'A imprimir', '12/11/2026'],
      ['2026-0147', 'Miguel Costa', 'Acabamento', '09/11/2026'],
      ['2026-0146', 'Sofia Alves', 'Enviada', '05/11/2026'],
      ['2026-0145', 'Tiago Nunes', 'Entregue', '28/10/2026'],
    ];
    rows.forEach(([num, nome, est, prev], i) => {
      const ry = ty + 0.48 + i * 0.62;
      s.addShape(S.line, { x: tx + 0.02, y: ry + 0.56, w: tw - 0.04, h: 0.002, line: { color: C.s100, width: 0.75 } });
      t(s, num, { x: tx + xs[0], y: ry + 0.16, w: 1.6, h: 0.24, fontSize: 8, bold: true, color: C.indigo, fontFace: M });
      t(s, nome, { x: tx + xs[1], y: ry + 0.16, w: 2.0, h: 0.24, fontSize: 8, bold: true, color: C.s700 });
      s.addShape(S.roundRect, {
        x: tx + xs[2], y: ry + 0.14, w: 1.5, h: 0.28, rectRadius: 0.06,
        fill: { color: C.white }, line: { color: C.s200, width: 0.75 },
      });
      t(s, est, { x: tx + xs[2] + 0.1, y: ry + 0.14, w: 1.3, h: 0.28, fontSize: 7, bold: true, color: C.s600, valign: 'middle' });
      t(s, prev, { x: tx + xs[3], y: ry + 0.16, w: 1.5, h: 0.24, fontSize: 7.5, color: C.s500 });
      // action chips
      const ax = tx + tw - 0.2 - 5 * 0.42;
      ['E', 'C', 'L', 'W', 'X'].forEach((lbl, j) => {
        const fills = [C.s100, C.amberSoft, C.indigoSoft, C.greenSoft, C.redSoft];
        const fgs = [C.s600, C.amberDark, C.indigo, C.greenDark, 'B91C1C'];
        s.addShape(S.roundRect, {
          x: ax + j * 0.42, y: ry + 0.14, w: 0.36, h: 0.28, rectRadius: 0.06,
          fill: { color: fills[j] }, line: { color: fills[j], width: 0 },
        });
        t(s, lbl, {
          x: ax + j * 0.42, y: ry + 0.14, w: 0.36, h: 0.28,
          fontSize: 6.5, bold: true, color: fgs[j], align: 'center', valign: 'middle',
        });
      });
    });
  }

  s.addShape(S.line, { x: bx + 0.35, y: by + 4.44, w: bw - 0.7, h: 0.002, line: { color: C.s200, width: 0.75 } });
  t(s, 'E  Editar   ·   C  Certificado   ·   L  Ligação pública   ·   W  WhatsApp   ·   X  Eliminar', {
    x: bx + 0.35, y: by + 4.51, w: bw - 0.7, h: 0.22, fontSize: 6.5, color: C.s400,
  });

  footer(s);
  s.addNotes('Cada ação é otimista na UI e confirmada no servidor: estado grava em encomendas e em historico_estados.');
}

/* ================================================================== */
/* 07 · ENCOMENDAS · MOBILE                                           */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Responsividade', 'A mesma gestão, em telemóvel',
    'Abaixo de 768 px a tabela dá lugar a cartões com estado e ações ao alcance do polegar.');

  const px = 1.15, py = 1.66, pw = 3.0, ph = 5.1;
  s.addShape(S.roundRect, {
    x: px, y: py, w: pw, h: ph, rectRadius: 0.32,
    fill: { color: '0B1020' }, line: { color: '0B1020', width: 0 }, shadow: shadow(),
  });
  s.addShape(S.roundRect, {
    x: px + 0.08, y: py + 0.08, w: pw - 0.16, h: ph - 0.16, rectRadius: 0.26,
    fill: { color: C.s50 }, line: { color: C.s50, width: 0 },
  });
  s.addShape(S.roundRect, {
    x: px + pw / 2 - 0.42, y: py + 0.16, w: 0.84, h: 0.12, rectRadius: 0.06,
    fill: { color: '0B1020' }, line: { color: '0B1020', width: 0 },
  });

  const ix = px + 0.2, iw = pw - 0.4;
  t(s, 'Encomendas', { x: ix, y: py + 0.42, w: iw, h: 0.26, fontSize: 11, bold: true, color: C.ink });
  s.addShape(S.roundRect, {
    x: ix, y: py + 0.72, w: iw, h: 0.3, rectRadius: 0.08,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  t(s, '+  Nova Encomenda', {
    x: ix, y: py + 0.72, w: iw, h: 0.3, fontSize: 7.5, bold: true, color: C.white, align: 'center', valign: 'middle',
  });

  const cardsData = [
    ['2026-0148', 'Ana Ribeiro', 'A imprimir', C.indigoSoft, C.indigo],
    ['2026-0147', 'Miguel Costa', 'Acabamento', C.amberSoft, C.amberDark],
    ['2026-0146', 'Sofia Alves', 'Enviada', C.greenSoft, C.greenDark],
    ['2026-0145', 'Tiago Nunes', 'Entregue', C.greenSoft, C.greenDark],
  ];
  cardsData.forEach(([num, nome, est, bg, fg], i) => {
    const cy = py + 1.05 + i * 0.95;
    card(s, ix, cy, iw, 0.86, { radius: 0.1, sh: false });
    t(s, num, { x: ix + 0.12, y: cy + 0.08, w: 1.3, h: 0.2, fontSize: 7.5, bold: true, color: C.indigo, fontFace: M });
    pill(s, ix + iw - 1.15, cy + 0.06, 1.0, 0.22, est, { fill: bg, color: fg, size: 5.8 });
    t(s, nome, { x: ix + 0.12, y: cy + 0.29, w: 1.6, h: 0.2, fontSize: 7.2, bold: true, color: C.ink });
    ['Editar', 'Selo', 'Link', 'Wpp'].forEach((lbl, j) => {
      s.addShape(S.roundRect, {
        x: ix + 0.1 + j * 0.58, y: cy + 0.55, w: 0.52, h: 0.22, rectRadius: 0.05,
        fill: { color: j === 1 ? C.amberSoft : j === 3 ? C.greenSoft : C.s100 },
        line: { color: j === 1 ? C.amberSoft : j === 3 ? C.greenSoft : C.s100, width: 0 },
      });
      t(s, lbl, {
        x: ix + 0.1 + j * 0.58, y: cy + 0.55, w: 0.52, h: 0.22,
        fontSize: 4.8, bold: true, color: j === 1 ? C.amberDark : j === 3 ? C.greenDark : C.s600,
        align: 'center', valign: 'middle',
      });
    });
  });

  // right side explanation
  const rx = 4.85;
  const notes = [
    ['Sem scroll horizontal', 'A tabela de 5 colunas deixa de forçar zoom; cada encomenda passa a um cartão de leitura vertical.'],
    ['Alvos de toque ≥ 32 px', 'Editar, certificado, link e WhatsApp ficam em botões separados, com área de toque confortável.'],
    ['Ações destrutivas isoladas', 'Eliminar fica no extremo oposto, reduzindo toques acidentais numa operação real.'],
  ];
  notes.forEach(([tt, d], i) => {
    const y = 2.0 + i * 1.55;
    card(s, rx, y, 7.85, 1.3, { radius: 0.12, sh: false, fill: C.s50, line: C.s200 });
    s.addShape(S.roundRect, {
      x: rx + 0.22, y: y + 0.2, w: 0.34, h: 0.34, rectRadius: 0.09,
      fill: { color: C.green }, line: { color: C.green, width: 0 },
    });
    t(s, '✓', { x: rx + 0.22, y: y + 0.2, w: 0.34, h: 0.34, fontSize: 10, bold: true, color: C.white, align: 'center', valign: 'middle' });
    t(s, tt, { x: rx + 0.7, y: y + 0.18, w: 6.9, h: 0.26, fontSize: 11.5, bold: true, color: C.ink });
    t(s, d, { x: rx + 0.7, y: y + 0.48, w: 6.85, h: 0.7, fontSize: 9, color: C.s600, lineSpacing: 14 });
  });

  footer(s);
  s.addNotes('Breakpoint md: tabela escondida, cards visíveis. Mesma fonte de dados, sem duplicar lógica.');
}

/* ================================================================== */
/* 08 · PRODUTOS & CONSUMO                                            */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Novo módulo', 'Catálogo de produtos & consumo de filamento',
    'Dois separadores: produtos pré-definidos para orçamentar e carretéis com stock e abate de consumo.');

  const bx = 0.6, by = 1.78, bw = 12.1, bh = 4.7;
  browser(s, bx, by, bw, bh, 'orbittrack.vercel.app/painel/produtos');

  t(s, 'Catálogo de Produtos & Consumo', { x: bx + 0.35, y: by + 0.55, w: 6, h: 0.28, fontSize: 13, bold: true, color: C.ink });
  t(s, 'Registe produtos frequentes e acompanhe o stock de filamentos e resina.', {
    x: bx + 0.35, y: by + 0.85, w: 7, h: 0.22, fontSize: 7.5, color: C.s500,
  });

  // tabs
  s.addShape(S.line, { x: bx + 0.35, y: by + 1.32, w: bw - 0.7, h: 0.002, line: { color: C.s200, width: 0.75 } });
  t(s, 'Produtos Pré-Definidos (2)', { x: bx + 0.4, y: by + 1.12, w: 2.6, h: 0.24, fontSize: 8, bold: true, color: C.indigo });
  s.addShape(S.rect, { x: bx + 0.4, y: by + 1.3, w: 2.35, h: 0.035, fill: { color: C.indigo }, line: { color: C.indigo, width: 0 } });
  t(s, 'Stock de Filamentos & Consumo', { x: bx + 3.0, y: by + 1.12, w: 2.8, h: 0.24, fontSize: 8, bold: true, color: C.s400 });

  // product cards
  const prod = [
    ['Suporte Headset Premium', 'PLA · Preto Matte', '120 g', '240 min', '15,00 €'],
    ['Cubo Calibração 20mm', 'PETG · Cinza', '15 g', '35 min', '3,50 €'],
  ];
  prod.forEach(([nome, sub, peso, tempo, preco], i) => {
    const px = bx + 0.35 + i * 3.2;
    card(s, px, by + 1.5, 3.0, 2.3, { radius: 0.1, sh: false });
    s.addShape(S.roundRect, {
      x: px + 0.15, y: by + 1.65, w: 0.42, h: 0.42, rectRadius: 0.1,
      fill: { color: C.indigoSoft }, line: { color: C.indigoSoft, width: 0 },
    });
    t(s, '◈', { x: px + 0.15, y: by + 1.65, w: 0.42, h: 0.42, fontSize: 11, color: C.indigo, align: 'center', valign: 'middle' });
    t(s, nome, { x: px + 0.66, y: by + 1.64, w: 2.2, h: 0.2, fontSize: 7.5, bold: true, color: C.ink });
    t(s, sub, { x: px + 0.66, y: by + 1.84, w: 2.2, h: 0.18, fontSize: 6.2, color: C.s500 });
    [['Peso', peso], ['Tempo', tempo], ['Preço', preco]].forEach(([l, v], j) => {
      const mx = px + 0.15 + j * 0.92;
      s.addShape(S.roundRect, {
        x: mx, y: by + 2.3, w: 0.86, h: 0.62, rectRadius: 0.07,
        fill: { color: C.s50 }, line: { color: C.s50, width: 0 },
      });
      t(s, l, { x: mx, y: by + 2.34, w: 0.86, h: 0.16, fontSize: 5.4, color: C.s400, align: 'center' });
      t(s, v, { x: mx, y: by + 2.5, w: 0.86, h: 0.22, fontSize: 6.8, bold: true, color: j === 2 ? C.indigo : C.s700, align: 'center' });
    });
    t(s, 'Custo estimado de material: ' + (i === 0 ? '2,64 €' : '0,38 €'), {
      x: px + 0.15, y: by + 3.1, w: 2.7, h: 0.2, fontSize: 6, color: C.s400,
    });
  });

  // filament panel
  const fx = bx + 6.75;
  card(s, fx, by + 1.5, 5.0, 3.15, { radius: 0.1, sh: false });
  t(s, 'Carretéis em stock', { x: fx + 0.18, y: by + 1.62, w: 3, h: 0.22, fontSize: 8.5, bold: true, color: C.ink });

  const fil = [
    ['eSUN PLA+ · Preto Matte', 750, 1000, C.green],
    ['Bambu PETG · Cinza', 400, 1000, C.amber],
    ['Sunlu PLA · Branco', 120, 1000, C.red],
  ];
  fil.forEach(([nome, rest, total, cor], i) => {
    const y = by + 2.05 + i * 0.95;
    t(s, nome, { x: fx + 0.18, y, w: 3.2, h: 0.2, fontSize: 6.8, bold: true, color: C.s700 });
    t(s, `${rest} g / ${total} g`, { x: fx + 3.4, y, w: 1.3, h: 0.2, fontSize: 6.2, color: C.s400, align: 'right' });
    s.addShape(S.roundRect, {
      x: fx + 0.18, y: y + 0.26, w: 4.55, h: 0.13, rectRadius: 0.065,
      fill: { color: C.s100 }, line: { color: C.s100, width: 0 },
    });
    s.addShape(S.roundRect, {
      x: fx + 0.18, y: y + 0.26, w: 4.55 * (rest / total), h: 0.13, rectRadius: 0.065,
      fill: { color: cor }, line: { color: cor, width: 0 },
    });
    ['-50 g', '-100 g', '-250 g'].forEach((lbl, j) => {
      s.addShape(S.roundRect, {
        x: fx + 3.15 + j * 0.55, y: y + 0.44, w: 0.5, h: 0.18, rectRadius: 0.04,
        fill: { color: C.s100 }, line: { color: C.s100, width: 0 },
      });
      t(s, lbl, { x: fx + 3.15 + j * 0.55, y: y + 0.44, w: 0.5, h: 0.18, fontSize: 4.6, bold: true, color: C.s600, align: 'center', valign: 'middle' });
    });
  });

  footer(s);
  s.addNotes('Produtos servem de base ao formulário de encomenda; os carretéis permitem abater consumo em segundos após cada impressão.');
}

/* ================================================================== */
/* 09 · PORTAL PÚBLICO MOBILE                                         */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Portal do cliente', 'Rastreio por link secreto',
    'Sem registo nem palavra-passe: o cliente abre o URL recebido por WhatsApp e acompanha tudo em tempo real.');

  // phone
  const px = 0.95, py = 1.78, pw = 3.15, ph = 4.95;
  s.addShape(S.roundRect, {
    x: px, y: py, w: pw, h: ph, rectRadius: 0.34,
    fill: { color: '0B1020' }, line: { color: '0B1020', width: 0 }, shadow: shadow(),
  });
  s.addShape(S.roundRect, {
    x: px + 0.08, y: py + 0.08, w: pw - 0.16, h: ph - 0.16, rectRadius: 0.28,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });

  const ix = px + 0.08, iw = pw - 0.16;
  // hero
  s.addShape(S.rect, { x: ix, y: py + 0.08, w: iw, h: 1.45, fill: { color: '312E81' }, line: { color: '312E81', width: 0 } });
  // notch (desenhado por cima do hero para não desaparecer)
  s.addShape(S.roundRect, {
    x: px + pw / 2 - 0.42, y: py + 0.15, w: 0.84, h: 0.1, rectRadius: 0.05,
    fill: { color: '0B1020' }, line: { color: '0B1020', width: 0 },
  });
  s.addShape(S.roundRect, {
    x: ix + 0.16, y: py + 0.8, w: 0.48, h: 0.48, rectRadius: 0.08,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  t(s, '◈', { x: ix + 0.16, y: py + 0.8, w: 0.48, h: 0.48, fontSize: 12, color: C.indigo, align: 'center', valign: 'middle' });
  t(s, 'Atelier Camada', { x: ix + 0.74, y: py + 0.84, w: 1.9, h: 0.22, fontSize: 8.5, bold: true, color: C.white });
  t(s, 'Encomenda #2026-0148', { x: ix + 0.74, y: py + 1.06, w: 1.9, h: 0.2, fontSize: 6.5, color: 'C7D2FE' });

  // status card
  card(s, ix + 0.14, py + 1.35, iw - 0.28, 0.95, { radius: 0.12, sh: false });
  pill(s, ix + 0.3, py + 1.45, 0.95, 0.2, 'ESTADO ATUAL', { fill: C.indigoSoft, color: C.indigo, size: 5 });
  t(s, 'A IMPRIMIR', { x: ix + 0.28, y: py + 1.67, w: 2.4, h: 0.3, fontSize: 13, bold: true, color: C.ink });
  t(s, 'Previsão de entrega: 12/11/2026', { x: ix + 0.28, y: py + 2.0, w: 2.5, h: 0.2, fontSize: 6, color: C.s500 });

  // timeline
  card(s, ix + 0.14, py + 2.42, iw - 0.28, 1.62, { radius: 0.12, sh: false });
  t(s, 'Histórico de Fabrico', { x: ix + 0.3, y: py + 2.52, w: 2.4, h: 0.2, fontSize: 7, bold: true, color: C.ink });
  const steps = [
    ['Recebida', true],
    ['Em fila', true],
    ['A imprimir', true],
    ['Acabamento', false],
    ['Enviada', false],
  ];
  s.addShape(S.rect, { x: ix + 0.37, y: py + 2.82, w: 0.012, h: 1.02, fill: { color: C.s200 }, line: { color: C.s200, width: 0 } });
  steps.forEach(([lbl, done], i) => {
    const y = py + 2.8 + i * 0.245;
    s.addShape(S.ellipse, {
      x: ix + 0.3, y, w: 0.15, h: 0.15,
      fill: { color: done ? C.indigo : C.s200 },
      line: { color: C.white, width: 1.2 },
    });
    t(s, lbl, { x: ix + 0.55, y: y - 0.03, w: 1.8, h: 0.2, fontSize: 6.2, bold: done, color: done ? C.s700 : C.s400 });
  });

  // peça row
  card(s, ix + 0.14, py + 4.15, iw - 0.28, 0.7, { radius: 0.12, sh: false });
  t(s, 'Suporte Headset Premium', { x: ix + 0.3, y: py + 4.24, w: 1.6, h: 0.2, fontSize: 6.4, bold: true, color: C.ink });
  t(s, 'PLA · 0.2 mm · 120 g', { x: ix + 0.3, y: py + 4.44, w: 1.6, h: 0.18, fontSize: 5.4, color: C.s400 });
  s.addShape(S.roundRect, {
    x: ix + 1.8, y: py + 4.31, w: 0.78, h: 0.28, rectRadius: 0.06,
    fill: { color: C.indigoSoft }, line: { color: C.indigo200, width: 0.6 },
  });
  t(s, 'Ver 3D', { x: ix + 1.8, y: py + 4.31, w: 0.78, h: 0.28, fontSize: 5.4, bold: true, color: C.indigo, align: 'center', valign: 'middle' });

  // right side: flow
  const rx = 4.75;
  t(s, 'Jornada do cliente', { x: rx, y: 1.8, w: 6, h: 0.3, fontSize: 13, bold: true, color: C.ink });
  const flow = [
    ['1', 'Recebe o link', 'Enviado automaticamente por WhatsApp com o estado atual e o URL único.'],
    ['2', 'Abre sem login', 'O token de 24 caracteres identifica a encomenda; nenhuma conta é necessária.'],
    ['3', 'Vê estado e peças', 'Timeline, previsão, notas públicas, especificações e certificados.'],
    ['4', 'Abre o passaporte 3D', 'Botão "Ver 3D & VR" leva ao modelo com Realidade Aumentada.'],
  ];
  flow.forEach(([n, tt, d], i) => {
    const y = 2.28 + i * 0.98;
    s.addShape(S.ellipse, {
      x: rx, y: y + 0.03, w: 0.38, h: 0.38,
      fill: { color: C.indigoSoft }, line: { color: C.indigo200, width: 1 },
    });
    t(s, n, { x: rx, y: y + 0.03, w: 0.38, h: 0.38, fontSize: 9, bold: true, color: C.indigo, align: 'center', valign: 'middle' });
    t(s, tt, { x: rx + 0.55, y, w: 5.6, h: 0.3, fontSize: 11, bold: true, color: C.ink });
    t(s, d, { x: rx + 0.55, y: y + 0.34, w: 5.7, h: 0.34, fontSize: 8.8, color: C.s500, lineSpacing: 12 });
  });

  footer(s);
  s.addNotes('O portal é 100% público e alimentado por obter_encomenda_publica(token), que devolve apenas os dados expostos.');
}

/* ================================================================== */
/* 10 · PASSAPORTE 3D / AR                                            */
/* ================================================================== */
{
  const s = newSlide(true);
  t(s, 'EXPERIÊNCIA IMERSIVA', { x: 0.7, y: 0.5, w: 8, h: 0.24, fontSize: 9.5, bold: true, color: '818CF8', charSpacing: 2.2 });
  t(s, 'Passaporte 3D com Realidade Aumentada', { x: 0.7, y: 0.76, w: 9, h: 0.55, fontSize: 27, bold: true, color: C.white });
  t(s, 'O modelo .glb do vendedor é exibido no navegador e projetado sobre a câmara do telemóvel, em escala real.', {
    x: 0.7, y: 1.3, w: 8.6, h: 0.36, fontSize: 11.5, color: '94A3B8',
  });

  // viewer mock
  const vx = 0.7, vy = 1.85, vw = 7.1, vh = 4.55;
  s.addShape(S.roundRect, {
    x: vx, y: vy, w: vw, h: vh, rectRadius: 0.16,
    fill: { color: '0F172A' }, line: { color: '1E293B', width: 1.2 },
  });
  // camera gradient hint
  s.addShape(S.roundRect, {
    x: vx + 0.05, y: vy + 0.05, w: vw - 0.1, h: vh - 0.1, rectRadius: 0.13,
    fill: { color: '1E293B' }, line: { color: '1E293B', width: 0 },
  });
  // "chão" sob o modelo — alinhado com o vértice inferior do cubo
  s.addShape(S.ellipse, {
    x: vx + vw / 2 - 1.1, y: vy + 3.74, w: 2.2, h: 0.18,
    fill: { color: '312E81' }, line: { color: '312E81', width: 0 },
  });
  cubeWire(s, vx + vw / 2, vy + 2.25, 2.6, 'A5B4FC', 2.25);

  // UI buttons inside viewer
  const bchip = (x, y, w, label, fill, fg) => {
    s.addShape(S.roundRect, {
      x, y, w, h: 0.34, rectRadius: 0.1,
      fill: { color: fill }, line: { color: fill, width: 0 },
    });
    t(s, label, { x, y, w, h: 0.34, fontSize: 7, bold: true, color: fg, align: 'center', valign: 'middle' });
  };
  bchip(vx + 0.25, vy + 0.25, 1.62, '●  Ver na Câmara (AR)', C.indigo, C.white);
  bchip(vx + 1.97, vy + 0.25, 1.35, '◐  Tamanho Real', '1E293B', 'E2E8F0');
  bchip(vx + 3.42, vy + 0.25, 1.1, '1:1 ativo', 'F59E0B', '0B1020');

  s.addShape(S.roundRect, {
    x: vx + 1.35, y: vy + vh - 0.62, w: 4.4, h: 0.42, rectRadius: 0.1,
    fill: { color: '0B1020', transparency: 20 }, line: { color: '334155', width: 0.75 },
  });
  t(s, 'Modo Realidade Aumentada · aponte para a secretária', {
    x: vx + 1.35, y: vy + vh - 0.62, w: 4.4, h: 0.42, fontSize: 6.5, color: 'E2E8F0', align: 'center', valign: 'middle',
  });

  // right column: specs card
  const rx = 8.15, rw = 4.45;
  s.addShape(S.roundRect, {
    x: rx, y: vy, w: rw, h: 2.05, rectRadius: 0.14,
    fill: { color: '131C33' }, line: { color: '243049', width: 1 },
  });
  pill(s, rx + 0.25, vy + 0.22, 1.55, 0.26, 'PEÇA CERTIFICADA', { fill: '312E81', color: C.indigo200, size: 6.5 });
  t(s, 'Suporte Headset Premium', { x: rx + 0.25, y: vy + 0.58, w: 3.9, h: 0.3, fontSize: 13, bold: true, color: C.white });
  const specs = [['Material', 'PLA'], ['Cor', 'Preto Matte'], ['Camada', '0,20 mm'], ['Preenchimento', '25 %']];
  specs.forEach(([l, v], i) => {
    const sx = rx + 0.25 + (i % 2) * 2.0;
    const sy = vy + 1.0 + Math.floor(i / 2) * 0.5;
    t(s, l, { x: sx, y: sy, w: 1.8, h: 0.16, fontSize: 6, color: '64748B' });
    t(s, v, { x: sx, y: sy + 0.16, w: 1.8, h: 0.2, fontSize: 8, bold: true, color: 'E2E8F0' });
  });

  // certificate strip
  s.addShape(S.roundRect, {
    x: rx, y: vy + 2.2, w: rw, h: 1.15, rectRadius: 0.14,
    fill: { color: '1C1A12' }, line: { color: '78350F', width: 1 },
  });
  t(s, 'CERTIFICADO DE AUTENTICIDADE', { x: rx + 0.25, y: vy + 2.32, w: 3.9, h: 0.2, fontSize: 6.5, bold: true, color: 'FCD34D', charSpacing: 1.2 });
  t(s, '7K2P-9XQ4', { x: rx + 0.25, y: vy + 2.55, w: 2.4, h: 0.3, fontSize: 15, bold: true, color: 'FDE68A', fontFace: M });
  t(s, 'Selo prata · emitido em 28/10/2026', { x: rx + 0.25, y: vy + 2.9, w: 3.2, h: 0.2, fontSize: 6.2, color: 'B45309' });
  s.addShape(S.roundRect, {
    x: rx + rw - 1.25, y: vy + 2.62, w: 1.0, h: 0.3, rectRadius: 0.08,
    fill: { color: C.amber }, line: { color: C.amber, width: 0 },
  });
  t(s, 'Verificar', { x: rx + rw - 1.25, y: vy + 2.62, w: 1.0, h: 0.3, fontSize: 6.5, bold: true, color: '1C1917', align: 'center', valign: 'middle' });

  // ar explanation
  s.addShape(S.roundRect, {
    x: rx, y: vy + 3.45, w: rw, h: 1.1, rectRadius: 0.14,
    fill: { color: '131C33' }, line: { color: '243049', width: 1 },
  });
  t(s, 'Câmara em ecrã inteiro', { x: rx + 0.25, y: vy + 3.56, w: 3.9, h: 0.22, fontSize: 8.5, bold: true, color: 'A5B4FC' });
  t(s, 'fixed inset-0 · sem barras, sem scroll.\nO objeto fica sobreposto ao vídeo real.', {
    x: rx + 0.25, y: vy + 3.8, w: 3.9, h: 0.6, fontSize: 7, color: '94A3B8', lineSpacing: 11,
  });

  footer(s, true);
  s.addNotes('Fluxo: upload .glb na encomenda → useGLTF no Canvas → botão AR abre getUserMedia com facingMode environment e expande o viewer para ecrã inteiro.');
}

/* ================================================================== */
/* 11 · CERTIFICADOS                                                  */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Confiança', 'Certificação e verificação pública',
    'Cada peça recebe um código de 8 caracteres verificável por qualquer pessoa, sem conta.');

  // emit card
  card(s, 0.7, 1.95, 5.6, 4.15, { radius: 0.14 });
  pill(s, 0.95, 2.15, 1.5, 0.28, 'NO PAINEL', { fill: C.indigoSoft, color: C.indigo, size: 7 });
  t(s, 'Emissão em um clique', { x: 0.95, y: 2.55, w: 5, h: 0.3, fontSize: 13.5, bold: true, color: C.ink });
  const passos = [
    ['Selecionar a encomenda', 'O vendedor clica no selo na linha da encomenda.'],
    ['Gerar por peça', 'Cada item recebe um código único: 4 caracteres, hífen, 4 caracteres.'],
    ['Registar critérios', 'Nível do selo e critérios de qualidade ficam guardados no certificado.'],
  ];
  passos.forEach(([tt, d], i) => {
    const y = 3.0 + i * 0.95;
    s.addShape(S.ellipse, { x: 0.98, y: y + 0.03, w: 0.26, h: 0.26, fill: { color: C.indigoSoft }, line: { color: C.indigo200, width: 1 } });
    t(s, `${i + 1}`, { x: 0.98, y: y + 0.03, w: 0.26, h: 0.26, fontSize: 7.5, bold: true, color: C.indigo, align: 'center', valign: 'middle' });
    t(s, tt, { x: 1.36, y, w: 4.6, h: 0.24, fontSize: 10.5, bold: true, color: C.ink });
    t(s, d, { x: 1.36, y: y + 0.24, w: 4.6, h: 0.5, fontSize: 8.5, color: C.s500, lineSpacing: 12.5 });
  });

  // verification mock
  card(s, 6.65, 1.95, 5.95, 4.15, { radius: 0.14, fill: C.s50, line: C.s200, sh: false });
  t(s, 'VERIFICAÇÃO PÚBLICA', { x: 6.9, y: 2.15, w: 4, h: 0.2, fontSize: 7, bold: true, color: C.s400, charSpacing: 1.5 });
  t(s, 'orbittrack.vercel.app/verificar', { x: 6.9, y: 2.38, w: 5, h: 0.22, fontSize: 8, color: C.s500, fontFace: M });

  card(s, 6.9, 2.72, 5.45, 1.35, { radius: 0.12, fill: C.white, line: C.amber, lineWidth: 1.2, sh: false });
  s.addShape(S.ellipse, { x: 7.12, y: 2.92, w: 0.42, h: 0.42, fill: { color: C.amberSoft }, line: { color: C.amberSoft, width: 0 } });
  t(s, '★', { x: 7.12, y: 2.92, w: 0.42, h: 0.42, fontSize: 12, color: C.amberDark, align: 'center', valign: 'middle' });
  t(s, 'Certificado válido', { x: 7.66, y: 2.93, w: 2.8, h: 0.24, fontSize: 11, bold: true, color: '92400E' });
  t(s, 'Código 7K2P-9XQ4', { x: 7.66, y: 3.17, w: 2.8, h: 0.2, fontSize: 7.5, color: 'B45309', fontFace: M });
  t(s, 'Peça: Suporte Headset Premium', { x: 7.12, y: 3.48, w: 4.9, h: 0.2, fontSize: 7.5, color: C.s600 });
  t(s, 'Atelier Camada · emitido 28/10/2026', { x: 7.12, y: 3.68, w: 4.9, h: 0.2, fontSize: 7.5, color: C.s400 });

  const crit = ['Impressão 3D validada', 'Controlo dimensional OK', 'Acabamento verificado'];
  crit.forEach((c, i) => {
    const y = 4.25 + i * 0.42;
    s.addShape(S.roundRect, {
      x: 6.9, y, w: 5.45, h: 0.34, rectRadius: 0.08,
      fill: { color: C.greenSoft }, line: { color: 'A7F3D0', width: 0.6 },
    });
    t(s, '✓', { x: 7.05, y, w: 0.24, h: 0.34, fontSize: 8, bold: true, color: C.greenDark, align: 'center', valign: 'middle' });
    t(s, c, { x: 7.34, y, w: 4.8, h: 0.34, fontSize: 8, color: '065F46', valign: 'middle' });
  });

  t(s, 'A função verificar_certificado() corre com security definer e devolve apenas campos públicos.', {
    x: 6.9, y: 5.6, w: 5.45, h: 0.35, fontSize: 7, color: C.s400, italic: true, lineSpacing: 10,
  });

  footer(s);
  s.addNotes('A verificação é independente do vendedor: qualquer pessoa com o código confirma autenticidade e origem.');
}

/* ================================================================== */
/* 12 · WHITE-LABEL                                                   */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'White-label', 'A plataforma com a identidade do vendedor',
    'Logótipo, capa, cores e contactos definem todo o portal público que o cliente vê.');

  card(s, 0.7, 1.9, 6.1, 4.25, { radius: 0.14, fill: C.s50, line: C.s200, sh: false });
  t(s, 'A Minha Empresa', { x: 0.95, y: 2.08, w: 4, h: 0.28, fontSize: 12.5, bold: true, color: C.ink });

  const fields = [
    ['Nome da empresa', 'Atelier Camada'],
    ['Email', 'geral@ateliercamada.pt'],
    ['Telefone', '+351 912 000 000'],
    ['Instagram', '@ateliercamada'],
  ];
  fields.forEach(([l, v], i) => {
    const y = 2.45 + i * 0.62;
    t(s, l, { x: 0.98, y, w: 2.6, h: 0.16, fontSize: 6.2, color: C.s500 });
    s.addShape(S.roundRect, {
      x: 0.98, y: y + 0.17, w: 5.55, h: 0.32, rectRadius: 0.07,
      fill: { color: C.white }, line: { color: C.s200, width: 0.75 },
    });
    t(s, v, { x: 1.1, y: y + 0.17, w: 5.2, h: 0.32, fontSize: 7.5, color: C.s700, valign: 'middle' });
  });

  t(s, 'Cor primária', { x: 0.98, y: 5.05, w: 2, h: 0.16, fontSize: 6.2, color: C.s500 });
  [C.indigo, C.violet, C.green, C.amber, '0EA5E9'].forEach((c, i) => {
    s.addShape(S.ellipse, {
      x: 0.98 + i * 0.42, y: 5.24, w: 0.3, h: 0.3,
      fill: { color: c }, line: { color: i === 0 ? C.ink : C.white, width: i === 0 ? 1.5 : 1 },
    });
  });
  s.addShape(S.roundRect, {
    x: 3.2, y: 5.22, w: 1.3, h: 0.34, rectRadius: 0.08,
    fill: { color: C.indigo }, line: { color: C.indigo, width: 0 },
  });
  t(s, 'Guardar', { x: 3.2, y: 5.22, w: 1.3, h: 0.34, fontSize: 7.5, bold: true, color: C.white, align: 'center', valign: 'middle' });

  // portal preview
  const px = 7.2, py = 1.9, pw = 5.4, ph = 4.25;
  card(s, px, py, pw, ph, { radius: 0.16 });
  t(s, 'PRÉ-VISUALIZAÇÃO DO PORTAL', { x: px + 0.3, y: py + 0.18, w: 4, h: 0.2, fontSize: 6.5, bold: true, color: C.s400, charSpacing: 1.4 });
  s.addShape(S.rect, { x: px + 0.3, y: py + 0.48, w: pw - 0.6, h: 1.45, fill: { color: '312E81' }, line: { color: '312E81', width: 0 } });
  // decoração contida dentro do hero (nunca sai do retângulo roxo)
  s.addShape(S.ellipse, { x: px + 3.55, y: py + 0.62, w: 1.4, h: 1.2, fill: { color: '4338CA' }, line: { color: '4338CA', width: 0 } });
  s.addShape(S.roundRect, {
    x: px + 0.5, y: py + 1.32, w: 0.55, h: 0.55, rectRadius: 0.09,
    fill: { color: C.white }, line: { color: C.white, width: 0 },
  });
  t(s, '◈', { x: px + 0.5, y: py + 1.32, w: 0.55, h: 0.55, fontSize: 14, color: C.indigo, align: 'center', valign: 'middle' });
  t(s, 'Atelier Camada', { x: px + 1.15, y: py + 1.4, w: 3, h: 0.26, fontSize: 10, bold: true, color: C.white });
  t(s, 'Encomenda #2026-0148', { x: px + 1.15, y: py + 1.66, w: 3, h: 0.2, fontSize: 7, color: 'C7D2FE' });

  card(s, px + 0.3, py + 2.08, pw - 0.6, 0.9, { radius: 0.1, sh: false });
  t(s, 'EM FABRICO', { x: px + 0.5, y: py + 2.2, w: 2, h: 0.2, fontSize: 7.5, bold: true, color: C.indigo });
  t(s, 'Previsão 12/11/2026', { x: px + 0.5, y: py + 2.42, w: 3, h: 0.2, fontSize: 7, color: C.s500 });
  s.addShape(S.roundRect, {
    x: px + pw - 1.75, y: py + 2.28, w: 1.35, h: 0.32, rectRadius: 0.08,
    fill: { color: C.indigoSoft }, line: { color: C.indigo200, width: 0.6 },
  });
  t(s, 'Ver 3D & VR', { x: px + pw - 1.75, y: py + 2.28, w: 1.35, h: 0.32, fontSize: 6.5, bold: true, color: C.indigo, align: 'center', valign: 'middle' });

  card(s, px + 0.3, py + 3.08, pw - 0.6, 0.85, { radius: 0.1, sh: false, fill: C.amberSoft, line: 'FDE68A' });
  t(s, 'CERTIFICADO · 7K2P-9XQ4', { x: px + 0.5, y: py + 3.2, w: 3.4, h: 0.2, fontSize: 6.5, bold: true, color: '92400E' });
  t(s, 'Verificação pública disponível', { x: px + 0.5, y: py + 3.42, w: 3.4, h: 0.2, fontSize: 6.2, color: 'B45309' });

  footer(s);
  s.addNotes('As cores escolhidas alimentam a variável corPrimaria usada no portal, no cabeçalho e nos selos.');
}

/* ================================================================== */
/* 13 · RESPONSIVIDADE                                                */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Responsividade', 'Uma plataforma, três ecrãs',
    'Layouts fluidos com Tailwind: nada de scroll horizontal nem elementos cortados.');

  // Linha de base comum: os três dispositivos "assentam" no mesmo plano.
  const BASE = 4.45;
  const devs = [
    { nome: 'Desktop', range: '≥ 1024 px', cx: 2.85, w: 3.30, h: 1.90, r: 0.10, nota: 'Tabela completa + sidebar fixa', rows: 4 },
    { nome: 'Tablet', range: '768 – 1023 px', cx: 6.60, w: 2.10, h: 2.35, r: 0.16, nota: 'Grelha de 2 colunas', rows: 5 },
    { nome: 'Telemóvel', range: '< 768 px', cx: 10.45, w: 1.30, h: 2.60, r: 0.20, nota: 'Cartões + menu drawer', rows: 6 },
  ];

  devs.forEach(({ nome, range, cx, w, h, r, nota, rows }) => {
    const x = cx - w / 2;
    const y = BASE - h;

    // sombra de apoio no "chão"
    s.addShape(S.ellipse, {
      x: cx - w / 2 - 0.12, y: BASE + 0.02, w: w + 0.24, h: 0.11,
      fill: { color: C.s200 }, line: { color: C.s200, width: 0 },
    });

    // moldura
    s.addShape(S.roundRect, {
      x, y, w, h, rectRadius: r,
      fill: { color: C.white }, line: { color: C.s300, width: 1.5 }, shadow: shadow(),
    });

    // ecrã
    const sx = x + 0.09, sy = y + 0.09, sw = w - 0.18, sh2 = h - 0.18;
    s.addShape(S.roundRect, {
      x: sx, y: sy, w: sw, h: sh2, rectRadius: Math.max(r * 0.55, 0.04),
      fill: { color: C.s50 }, line: { color: C.s200, width: 0.75 },
    });

    // barra de topo (menu)
    s.addShape(S.roundRect, {
      x: sx + 0.07, y: sy + 0.08, w: sw - 0.14, h: 0.13, rectRadius: 0.03,
      fill: { color: C.s200 }, line: { color: C.s200, width: 0 },
    });

    // conteúdo: uma faixa + linhas, com densidade diferente por ecrã
    const innerX = sx + 0.07;
    const innerW = sw - 0.14;
    s.addShape(S.roundRect, {
      x: innerX, y: sy + 0.27, w: innerW, h: 0.3, rectRadius: 0.04,
      fill: { color: C.indigoSoft }, line: { color: C.indigo200, width: 0.5 },
    });
    for (let k = 0; k < rows; k++) {
      s.addShape(S.roundRect, {
        x: innerX, y: sy + 0.65 + k * 0.26, w: innerW, h: 0.18, rectRadius: 0.03,
        fill: { color: C.white }, line: { color: C.s200, width: 0.5 },
      });
    }

    // etiquetas — sempre abaixo da base, nunca por baixo do cartão
    t(s, nome, { x: cx - 1.6, y: BASE + 0.2, w: 3.2, h: 0.26, fontSize: 10.5, bold: true, color: C.ink, align: 'center' });
    t(s, range, { x: cx - 1.6, y: BASE + 0.45, w: 3.2, h: 0.2, fontSize: 7.5, color: C.indigo, align: 'center', fontFace: M });
    t(s, nota, { x: cx - 1.75, y: BASE + 0.66, w: 3.5, h: 0.26, fontSize: 7.5, color: C.s500, align: 'center' });
  });

  card(s, 0.7, 5.6, 11.95, 1.15, { radius: 0.12, fill: C.indigoSoft, line: C.indigo200, sh: false });
  const bullets = [
    'Breakpoint md: tabela → cartões',
    'Menu lateral vira drawer',
    'Alvos de toque ≥ 32 px',
    'Texto mínimo 7 px na mock, 14 px real',
  ];
  bullets.forEach((b, i) => {
    const bx = 0.95 + i * 2.95;
    t(s, '✓', { x: bx, y: 5.9, w: 0.22, h: 0.55, fontSize: 8, bold: true, color: C.green });
    t(s, b, { x: bx + 0.24, y: 5.9, w: 2.5, h: 0.55, fontSize: 7.5, color: C.indigoDark, lineSpacing: 11 });
  });

  footer(s);
  s.addNotes('Testado em 375×667, 390×844 e 768×1024; o painel usa drawer com overlay e o portal empilha secções.');
}

/* ================================================================== */
/* 14 · SEGURANÇA                                                     */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Segurança', 'Acesso público sem expor a base de dados',
    'O portal do cliente não lê tabelas: consome apenas três funções SQL controladas.');

  const itens = [
    ['Row Level Security', 'Todas as tabelas de negócio têm políticas por empresa; um vendedor nunca vê dados de outro.', C.indigo],
    ['RPC security definer', 'obter_encomenda_publica, obter_peca_publica e verificar_certificado devolvem só o necessário.', C.violet],
    ['Tokens não sequenciais', '24 caracteres hexadecimais por encomenda e por peça; o link é a credencial.', C.green],
    ['Storage isolado', 'Buckets separados para empresas e encomendas, com leitura pública apenas de objetos referenciados.', C.amber],
  ];
  itens.forEach(([tt, d, accent], i) => {
    const x = 0.7 + (i % 2) * 6.02;
    const y = 1.95 + Math.floor(i / 2) * 1.5;
    card(s, x, y, 5.85, 1.3, { radius: 0.12, sh: false, fill: C.s50, line: C.s200 });
    s.addShape(S.roundRect, {
      x: x + 0.22, y: y + 0.22, w: 0.36, h: 0.36, rectRadius: 0.09,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    t(s, ['▣', 'ƒ', '#', '⛁'][i], {
      x: x + 0.22, y: y + 0.22, w: 0.36, h: 0.36, fontSize: 11, bold: true, color: C.white, align: 'center', valign: 'middle',
    });
    t(s, tt, { x: x + 0.72, y: y + 0.2, w: 4.9, h: 0.26, fontSize: 11.5, bold: true, color: C.ink });
    t(s, d, { x: x + 0.72, y: y + 0.5, w: 4.9, h: 0.7, fontSize: 8.5, color: C.s600, lineSpacing: 13 });
  });

  s.addShape(S.roundRect, {
    x: 0.7, y: 5.1, w: 11.85, h: 1.55, rectRadius: 0.12,
    fill: { color: '0B1020' }, line: { color: '0B1020', width: 0 },
  });
  t(s, '// função exposta ao cliente', { x: 1.0, y: 5.25, w: 5, h: 0.2, fontSize: 7, color: '64748B', fontFace: M });
  t(s, "select * from obter_encomenda_publica('a3f9c1...');", {
    x: 1.0, y: 5.48, w: 10.8, h: 0.26, fontSize: 9, color: 'A5B4FC', fontFace: M,
  });
  t(s, '→ devolve estado, previsão, notas públicas, peças e certificados — nunca notas internas, NIF ou contactos privados.', {
    x: 1.0, y: 5.82, w: 10.9, h: 0.5, fontSize: 7.5, color: '94A3B8', lineSpacing: 11,
  });

  footer(s);
  s.addNotes('Sem service_role no front-end: a anon key só executa funções marcadas como públicas e as políticas RLS.');
}

/* ================================================================== */
/* 15 · STACK & DEPLOY                                                */
/* ================================================================== */
{
  const s = newSlide();
  header(s, 'Tecnologia', 'Stack, build e distribuição',
    'Código aberto, tipado e com deploy contínuo a cada push na branch principal.');

  const stack = [
    ['React 19', 'Interface'],
    ['TypeScript', 'Tipagem'],
    ['Vite 8', 'Build'],
    ['Tailwind v4', 'Estilos'],
    ['Supabase', 'Auth + DB + Storage'],
    ['Three.js', 'Modelos 3D'],
    ['Vercel', 'CDN global'],
    ['GitHub', 'CI/CD'],
  ];
  stack.forEach(([tt, sub], i) => {
    const x = 0.7 + (i % 4) * 3.02;
    const y = 1.95 + Math.floor(i / 4) * 1.0;
    card(s, x, y, 2.85, 0.84, { radius: 0.1, sh: false, fill: C.s50, line: C.s200 });
    t(s, tt, { x: x + 0.2, y: y + 0.17, w: 2.45, h: 0.26, fontSize: 11, bold: true, color: C.ink });
    t(s, sub, { x: x + 0.2, y: y + 0.45, w: 2.45, h: 0.22, fontSize: 7.5, color: C.s500 });
  });

  // pipeline
  t(s, 'PIPELINE DE ENTREGA', { x: 0.7, y: 4.12, w: 4, h: 0.2, fontSize: 7, bold: true, color: C.s400, charSpacing: 1.5 });
  const steps = [
    ['git push', 'main'],
    ['build', 'tsc + vite'],
    ['deploy', 'Vercel'],
    ['live', 'orbittrack.app'],
  ];
  steps.forEach(([a, b], i) => {
    const x = 0.7 + i * 3.02;
    card(s, x, 4.38, 2.45, 0.86, { radius: 0.1, sh: false });
    t(s, a, { x: x + 0.18, y: 4.52, w: 2.1, h: 0.24, fontSize: 10, bold: true, color: C.indigo, fontFace: M });
    t(s, b, { x: x + 0.18, y: 4.79, w: 2.1, h: 0.22, fontSize: 7, color: C.s500 });
    if (i < 3) {
      s.addShape(S.rightArrow, {
        x: x + 2.52, y: 4.68, w: 0.42, h: 0.26,
        fill: { color: C.s300 }, line: { color: C.s300, width: 0 },
      });
    }
  });

  card(s, 0.7, 5.55, 11.95, 0.9, { radius: 0.1, fill: C.indigoSoft, line: C.indigo200, sh: false });
  t(s, 'Build de produção validado: 0 erros de TypeScript · SPA rewrites configurados · credenciais com fallback resiliente.', {
    x: 0.95, y: 5.55, w: 11.4, h: 0.9, fontSize: 9, color: C.indigoDark, valign: 'middle',
  });

  footer(s);
  s.addNotes('Vercel serve dist/ com rewrite para index.html, garantindo que /acompanhar/:token e /peca/:token funcionam em refresh direto.');
}

/* ================================================================== */
/* 16 · ROADMAP / FECHO                                               */
/* ================================================================== */
{
  const s = newSlide(true);
  t(s, 'PRÓXIMOS PASSOS', { x: 0.7, y: 0.55, w: 8, h: 0.24, fontSize: 9.5, bold: true, color: '818CF8', charSpacing: 2.2 });
  t(s, 'Roadmap', { x: 0.7, y: 0.82, w: 8, h: 0.55, fontSize: 27, bold: true, color: C.white });
  t(s, 'Da base sólida atual para a operação completa da oficina.', {
    x: 0.7, y: 1.36, w: 8, h: 0.34, fontSize: 11.5, color: '94A3B8',
  });

  const cols = [
    ['AGORA', 'Consolidar', [
      ['Persistir produtos e consumos', 'Catálogo e stock em tabelas Supabase'],
      ['Histórico de consumo por encomenda', 'Gramas gastas, carretel e custo'],
      ['Orçamento em PDF', 'Exportação com preços e prazos'],
    ], C.green],
    ['SEGUINTE', 'Automatizar', [
      ['Notificações automáticas', 'Email e WhatsApp a cada mudança'],
      ['Recibos e faturação', 'Numeração sequencial por empresa'],
      ['Portal multi-idioma', 'PT · EN · ES no link público'],
    ], C.indigo],
    ['DEPOIS', 'Escalar', [
      ['Subdomínio por oficina', 'atelier.orbittrack.app'],
      ['WebAR com ancoragem', 'Modelo fixo na superfície real'],
      ['Avaliações por peça', 'Reputação pública verificada'],
    ], C.amber],
  ];
  cols.forEach(([kicker, tt, items, accent], i) => {
    const x = 0.7 + i * 4.02;
    s.addShape(S.roundRect, {
      x, y: 1.95, w: 3.82, h: 3.5, rectRadius: 0.16,
      fill: { color: '131C33' }, line: { color: '243049', width: 1 },
    });
    s.addShape(S.roundRect, {
      x: x + 0.28, y: 2.2, w: 0.95, h: 0.24, rectRadius: 0.12,
      fill: { color: accent }, line: { color: accent, width: 0 },
    });
    t(s, kicker, { x: x + 0.28, y: 2.2, w: 0.95, h: 0.24, fontSize: 6.5, bold: true, color: '0B1020', align: 'center', valign: 'middle' });
    t(s, tt, { x: x + 0.28, y: 2.56, w: 3.2, h: 0.3, fontSize: 13, bold: true, color: C.white });
    items.forEach(([titulo, sub], j) => {
      const y = 3.1 + j * 0.74;
      s.addShape(S.roundRect, {
        x: x + 0.28, y: y + 0.09, w: 0.13, h: 0.05, rectRadius: 0.02,
        fill: { color: accent }, line: { color: accent, width: 0 },
      });
      t(s, titulo, { x: x + 0.52, y, w: 3.05, h: 0.24, fontSize: 9, bold: true, color: 'E2E8F0' });
      t(s, sub, { x: x + 0.52, y: y + 0.24, w: 3.05, h: 0.22, fontSize: 7.5, color: '71809A' });
    });
  });

  s.addShape(S.line, { x: 0.7, y: 5.85, w: 11.95, h: 0.002, line: { color: '243049', width: 1 } });
  t(s, 'OrbitTrack', { x: 0.7, y: 6.05, w: 5, h: 0.4, fontSize: 20, bold: true, color: C.white });
  t(s, 'Obrigado. Perguntas e próximos passos.', { x: 0.7, y: 6.45, w: 6, h: 0.3, fontSize: 10, color: '94A3B8' });
  t(s, 'github.com/jrfdutra/orbittrack', {
    x: 8.0, y: 6.2, w: 4.65, h: 0.3, fontSize: 9.5, color: 'A5B4FC', align: 'right', fontFace: M,
  });

  s.addNotes('Fecho: pedir decisão sobre persistência de produtos/consumos e sobre subdomínio por oficina.');
}

/* ------------------------------------------------------------------ */

await pptx.writeFile({ fileName: 'OrbitTrack-Apresentacao-v2.pptx' });
console.log('Apresentação gerada: OrbitTrack-Apresentacao-v2.pptx');
