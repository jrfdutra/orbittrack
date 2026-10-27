// Esquemas de ecrã para o manual. São ilustrações, não capturas reais.
// Executar: node scripts/build-manual-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  slate900: '#0F172A', slate800: '#1E293B', slate700: '#334155', slate600: '#475569',
  slate500: '#64748B', slate400: '#94A3B8', slate300: '#CBD5E1', slate200: '#E2E8F0',
  slate100: '#F1F5F9', bg: '#F8FAFC', white: '#FFFFFF',
  indigo: '#4F46E5', indigoDark: '#3730A3', indigoLight: '#EEF2FF',
  emerald: '#10B981', emeraldDark: '#047857', emeraldLight: '#ECFDF5',
  amber: '#F59E0B', amberLight: '#FFFBEB', red: '#DC2626', redLight: '#FEF2F2',
  blue: '#3B82F6', blueLight: '#EFF6FF',
};
const FONT = 'Segoe UI, Inter, Arial, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const text = (x, y, v, size = 18, color = C.slate700, weight = 400, extra = '') =>
  `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(v)}</text>`;

const iconB64 = fs.readFileSync(path.join(ROOT, 'entrega/logo/orbittrack-icon-512.png')).toString('base64');
const icon = `data:image/png;base64,${iconB64}`;

function chrome(url) {
  return `
    <rect width="1600" height="1000" fill="${C.bg}"/>
    <rect width="1600" height="64" fill="${C.slate900}"/>
    <circle cx="32" cy="32" r="7" fill="#EF4444"/><circle cx="54" cy="32" r="7" fill="#F59E0B"/><circle cx="76" cy="32" r="7" fill="#10B981"/>
    <rect x="108" y="16" width="1320" height="32" rx="16" fill="#1E293B"/>
    <text x="132" y="38" font-family="${FONT}" font-size="14" fill="${C.slate400}">${esc(url)}</text>
    <rect x="1450" y="16" width="104" height="32" rx="16" fill="#312E81"/>
    <text x="1468" y="38" font-family="${FONT}" font-size="13" font-weight="700" fill="#C7D2FE">ESQUEMA</text>
    <rect x="0" y="64" width="1600" height="936" fill="${C.bg}"/>
  `;
}

function sidebar(active = 'Dashboard') {
  const items = ['Dashboard', 'Encomendas', 'A Minha Empresa', 'Estados'];
  let s = `<rect x="0" y="64" width="300" height="936" fill="${C.slate900}"/>`;
  s += `<image href="${icon}" x="36" y="100" width="44" height="44"/>`;
  s += text(92, 122, 'OrbitTrack', 23, C.white, 800);
  s += text(94, 144, 'GESTÃO DE IMPRESSÃO 3D', 8, C.slate400, 600, 'letter-spacing="2.2"');
  s += `<rect x="32" y="188" width="236" height="1" fill="#1E293B"/>`;
  let y = 220;
  for (const item of items) {
    const on = item === active;
    if (on) s += `<rect x="18" y="${y - 17}" width="264" height="46" rx="12" fill="#1E293B"/>`;
    s += `<circle cx="40" cy="${y + 5}" r="5" fill="${on ? C.emerald : C.slate600}"/>`;
    s += text(60, y + 11, item, 15, on ? C.white : C.slate400, on ? 700 : 400);
    y += 56;
  }
  s += `<rect x="18" y="880" width="264" height="46" rx="12" fill="#1E293B"/>`;
  s += text(40, 910, 'Sair', 15, C.slate400, 500);
  return s;
}

function annotation(x, y, w, label, lines = []) {
  const h = 54 + lines.length * 24;
  let s = `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="${C.redLight}" stroke="${C.red}" stroke-opacity="0.45"/>`;
  s += `<rect x="${x}" y="${y}" width="5" height="${h}" rx="2.5" fill="${C.red}"/>`;
  s += text(x + 20, y + 27, label, 14, C.red, 700);
  lines.forEach((line, i) => { s += text(x + 20, y + 52 + i * 22, line, 13, '#7F1D1D', 400); });
  return s;
}

function footerNote() {
  return `<rect x="0" y="962" width="1600" height="38" fill="${C.white}"/>
    <text x="32" y="987" font-family="${FONT}" font-size="12" fill="${C.slate500}">Esquema ilustrativo, não é uma captura real. As anotações a vermelho indicam bloqueios ou limitações confirmadas no código.</text>
    <text x="1568" y="987" font-family="${FONT}" font-size="12" fill="${C.slate400}" text-anchor="end">OrbitTrack · Manual de avaliação</text>`;
}

function svg(body) {
  return `<svg width="1600" height="1000" viewBox="0 0 1600 1000" xmlns="http://www.w3.org/2000/svg">
  <defs><filter id="sh" x="-20%" y="-20%" width="140%" height="140%"><feDropShadow dx="0" dy="8" stdDeviation="14" flood-color="#0F172A" flood-opacity="0.08"/></filter></defs>
  ${body}</svg>`;
}

// ------------------------------------------------------------
// Login
// ------------------------------------------------------------
function login() {
  let s = chrome('orbittrack.pt/login');
  s += `<rect x="0" y="64" width="1600" height="936" fill="#EEF2FF"/>`;
  s += `<circle cx="250" cy="260" r="260" fill="${C.indigo}" opacity="0.08"/>`;
  s += `<circle cx="1370" cy="760" r="320" fill="${C.emerald}" opacity="0.08"/>`;
  s += `<rect x="560" y="160" width="480" height="660" rx="24" fill="${C.white}" filter="url(#sh)"/>`;
  s += `<image href="${icon}" x="712" y="206" width="72" height="72"/>`;
  s += text(800, 318, 'OrbitTrack', 30, C.slate900, 800, 'text-anchor="middle"');
  s += text(800, 346, 'Bem-vindo de volta', 17, C.slate500, 400, 'text-anchor="middle"');
  s += text(600, 402, 'Email', 13, C.slate600, 700);
  s += `<rect x="600" y="418" width="400" height="46" rx="10" fill="${C.slate100}" stroke="${C.slate200}"/>`;
  s += text(618, 447, 'vendedor@exemplo.pt', 14, C.slate400, 400);
  s += text(600, 498, 'Palavra-passe', 13, C.slate600, 700);
  s += `<rect x="600" y="514" width="400" height="46" rx="10" fill="${C.slate100}" stroke="${C.slate200}"/>`;
  s += text(618, 543, '••••••••', 14, C.slate400, 400);
  s += text(920, 543, 'Ver', 12, C.indigo, 700, 'text-anchor="end"');
  s += `<rect x="600" y="590" width="400" height="48" rx="12" fill="${C.indigo}"/>`;
  s += text(800, 621, 'Entrar', 15, C.white, 700, 'text-anchor="middle"');
  s += text(800, 672, 'Esqueceu-se da palavra-passe?', 13, C.indigo, 600, 'text-anchor="middle"');
  s += text(800, 728, 'Ainda não tem conta? Criar conta', 13, C.slate500, 400, 'text-anchor="middle"');
  s += annotation(1110, 420, 380, 'Autenticação real, não validada', [
    'Ligação ao Supabase Auth implementada.',
    'Não existe teste nem projeto de ensaio.',
    'A recuperação de palavra-passe termina',
    'numa rota que não existe.',
  ]);
  s += `<path d="M 1110 500 C 1060 500 1030 520 1005 540" stroke="${C.red}" stroke-width="2" fill="none" stroke-dasharray="6 5"/>`;
  s += footerNote();
  return svg(s);
}

// ------------------------------------------------------------
// Dashboard
// ------------------------------------------------------------
function dashboard() {
  let s = chrome('orbittrack.pt/painel');
  s += sidebar('Dashboard');
  s += text(340, 128, 'Dashboard', 30, C.slate900, 800);
  s += text(340, 158, 'Visão geral da atividade da sua oficina', 14, C.slate500, 400);

  const cards = [
    ['Total de Encomendas', '0', 'Calculado por count(*)', C.indigo],
    ['Tempo Médio de Fabrico', '3 dias', 'Valor fixo no código', C.blue],
    ['Avaliação Média', '4.8', 'Valor fixo no código', C.amber],
  ];
  let x = 340;
  for (const [label, value, note, color] of cards) {
    s += `<rect x="${x}" y="190" width="390" height="170" rx="18" fill="${C.white}" stroke="${C.slate200}" filter="url(#sh)"/>`;
    s += `<rect x="${x}" y="190" width="390" height="5" rx="2.5" fill="${color}"/>`;
    s += text(x + 24, 232, label, 13, C.slate500, 700, 'letter-spacing="1.1"');
    s += text(x + 24, 296, value, 40, color === C.amber ? C.amber : C.slate900, 800);
    s += text(x + 24, 330, note, 12, color === C.amber ? C.amberDark || C.amber : C.slate500, color === C.amber ? 700 : 400);
    x += 414;
  }

  s += annotation(340, 390, 1218, 'Apenas o total de encomendas é real', [
    'A consulta count(*) funciona com sessão iniciada. “3 dias” e “4.8” são literais no estado inicial do componente.',
    'Não existem encomendas do mês, tempo médio calculado, avaliação agregada, receita, gráficos nem filtros.',
  ]);

  s += `<rect x="340" y="528" width="1218" height="320" rx="18" fill="${C.white}" stroke="${C.slate300}" stroke-dasharray="10 8"/>`;
  s += text(364, 572, 'FIM DO DASHBOARD IMPLEMENTADO', 12, C.slate400, 700, 'letter-spacing="1.6"');
  s += text(364, 616, 'O código termina nos três cartões acima.', 24, C.slate900, 800);
  s += text(364, 650, 'Tudo o que aparece a tracejado é documentação, não interface existente.', 15, C.slate500, 400);
  const missing = [
    'Sem gráficos ou evolução mensal',
    'Sem lista de encomendas recentes',
    'Sem atalhos de navegação',
    'Sem estado de loading visível',
    'Sem tratamento de erro na UI',
    'Sem filtro por período',
  ];
  let mx = 364, my = 700;
  for (let i = 0; i < missing.length; i++) {
    s += `<circle cx="${mx + 5}" cy="${my - 5}" r="4" fill="${C.slate300}"/>`;
    s += text(mx + 20, my, missing[i], 14, C.slate400, 400);
    mx += 400;
    if ((i + 1) % 3 === 0) { mx = 364; my += 42; }
  }
  s += text(364, 812, 'Os cartões são apresentados sem skeleton; o erro de rede só é escrito na consola.', 13, C.amberDark || C.amber, 600);

  s += footerNote();
  return svg(s);
}

// ------------------------------------------------------------
// Lista de encomendas
// ------------------------------------------------------------
function list() {
  let s = chrome('orbittrack.pt/painel/encomendas');
  s += sidebar('Encomendas');
  s += text(340, 128, 'Encomendas', 30, C.slate900, 800);
  s += text(340, 158, 'Todas as encomendas da empresa', 14, C.slate500, 400);
  s += `<rect x="1370" y="108" width="190" height="42" rx="12" fill="${C.indigo}"/>`;
  s += text(1465, 135, '+ Nova encomenda', 13, C.white, 700, 'text-anchor="middle"');
  s += `<rect x="340" y="190" width="1220" height="700" rx="18" fill="${C.white}" stroke="${C.slate200}" filter="url(#sh)"/>`;
  s += `<rect x="340" y="190" width="1220" height="58" rx="18" fill="${C.slate100}"/>`;
  s += `<rect x="340" y="228" width="1220" height="20" fill="${C.slate100}"/>`;
  const cols = [['Número', 368], ['Comprador', 590], ['Estado', 880], ['Previsão', 1080], ['Ações', 1400]];
  for (const [label, x] of cols) s += text(x, 226, label, 12, C.slate500, 700, 'letter-spacing="1"');
  const rows = [
    ['2026-0001', 'João Silva', 'A imprimir', '15/11/2026'],
    ['2026-0002', 'Maria Costa', 'Recebida', '22/11/2026'],
    ['2026-0003', 'Empresa Exemplo', 'Entregue', '03/10/2026'],
  ];
  let y = 280;
  for (const [num, buyer, state, date] of rows) {
    s += `<rect x="360" y="${y}" width="1180" height="1" fill="${C.slate100}"/>`;
    s += text(368, y + 38, num, 14, C.slate900, 700);
    s += text(590, y + 38, buyer, 14, C.slate700, 400);
    const color = state === 'Entregue' ? C.emerald : state === 'Recebida' ? C.slate500 : C.indigo;
    s += `<rect x="880" y="${y + 18}" width="${state.length * 9 + 26}" height="28" rx="14" fill="${color}" fill-opacity="0.12"/>`;
    s += text(893, y + 37, state, 12, color, 700);
    s += text(1080, y + 38, date, 14, C.slate600, 400);
    s += `<rect x="1380" y="${y + 16}" width="30" height="30" rx="8" fill="${C.slate100}"/>`;
    s += `<rect x="1422" y="${y + 16}" width="30" height="30" rx="8" fill="${C.slate100}"/>`;
    s += `<rect x="1464" y="${y + 16}" width="30" height="30" rx="8" fill="${C.slate100}"/>`;
    s += text(1395, y + 38, '✎', 13, C.slate400, 400, 'text-anchor="middle"');
    s += text(1437, y + 38, '▦', 13, C.slate400, 400, 'text-anchor="middle"');
    s += text(1479, y + 38, '▤', 13, C.slate400, 400, 'text-anchor="middle"');
    y += 78;
  }
  s += annotation(1050, 580, 460, 'Ações sem comportamento', [
    'Os botões de editar, QR e documento não têm',
    'handlers. Não existe pesquisa, filtro, ordenação,',
    'paginação nem estado vazio explícito.',
  ]);
  s += `<path d="M 1400 560 C 1370 570 1320 580 1280 590" stroke="${C.red}" stroke-width="2" fill="none" stroke-dasharray="6 5"/>`;
  s += footerNote();
  return svg(s);
}

// ------------------------------------------------------------
// Portal do comprador (telemóvel)
// ------------------------------------------------------------
function portal() {
  let s = `<rect width="1600" height="1000" fill="${C.bg}"/>`;
  s += `<rect width="1600" height="64" fill="${C.slate900}"/>`;
  s += `<circle cx="32" cy="32" r="7" fill="#EF4444"/><circle cx="54" cy="32" r="7" fill="#F59E0B"/><circle cx="76" cy="32" r="7" fill="#10B981"/>`;
  s += `<rect x="108" y="16" width="1320" height="32" rx="16" fill="#1E293B"/>`;
  s += text(132, 38, 'orbittrack.pt/acompanhar/9f2c…', 14, C.slate400, 400);
  s += `<rect x="1450" y="16" width="104" height="32" rx="16" fill="#312E81"/>`;
  s += text(1468, 38, 'ESQUEMA', 13, C.slate200, 700);

  // Phone
  s += `<rect x="600" y="100" width="400" height="820" rx="38" fill="${C.slate900}"/>`;
  s += `<rect x="612" y="112" width="376" height="796" rx="28" fill="${C.white}"/>`;
  s += `<rect x="755" y="124" width="90" height="18" rx="9" fill="${C.slate900}"/>`;

  // Brand header
  s += `<rect x="612" y="150" width="376" height="140" fill="${C.slate900}"/>`;
  s += `<circle cx="650" cy="196" r="22" fill="${C.indigo}"/>`;
  s += text(684, 192, 'Orbit3D Prints', 16, C.white, 700);
  s += text(684, 212, 'Encomenda 2026-0001', 11, C.slate400, 400);
  s += `<rect x="636" y="238" width="110" height="26" rx="13" fill="${C.emerald}" fill-opacity="0.18"/>`;
  s += text(648, 256, 'A imprimir', 11, '#6EE7B7', 700);

  // Status card
  s += `<rect x="636" y="316" width="328" height="112" rx="14" fill="${C.indigoLight}"/>`;
  s += text(656, 344, 'ESTADO ATUAL', 9, C.indigoDark, 700, 'letter-spacing="1.4"');
  s += text(656, 376, 'A imprimir', 22, C.slate900, 800);
  s += text(656, 402, 'Previsão de entrega: 15/11/2026', 11, C.slate600, 400);
  s += `<rect x="840" y="344" width="104" height="50" rx="10" fill="${C.white}"/>`;
  s += text(892, 365, '3', 20, C.indigo, 800, 'text-anchor="middle"');
  s += text(892, 383, 'peças', 9, C.slate500, 600, 'text-anchor="middle"');

  // Timeline
  s += text(636, 470, 'Progresso', 13, C.slate900, 700);
  const steps = [
    ['Recebida', '03/10 · 09:12', true],
    ['Em produção', '04/10 · 14:30', true],
    ['A imprimir', '05/10 · 08:05', true],
    ['Enviada', 'Aguardando', false],
    ['Entregue', 'Aguardando', false],
  ];
  let y = 500;
  for (let i = 0; i < steps.length; i++) {
    const [label, date, done] = steps[i];
    if (i < steps.length - 1) s += `<rect x="648" y="${y + 10}" width="2" height="42" fill="${done ? C.emerald : C.slate200}"/>`;
    s += `<circle cx="649" cy="${y + 5}" r="7" fill="${done ? C.emerald : C.white}" stroke="${done ? C.emerald : C.slate300}" stroke-width="2"/>`;
    s += text(668, y + 9, label, 12, done ? C.slate900 : C.slate400, done ? 700 : 400);
    s += text(668, y + 26, date, 10, C.slate400, 400);
    y += 52;
  }

  // Parts
  s += `<rect x="636" y="770" width="328" height="74" rx="12" fill="${C.slate100}"/>`;
  s += text(654, 797, 'Suporte Monitor', 13, C.slate900, 700);
  s += text(654, 818, 'PLA · Preto · 0,2 mm · 20%', 10, C.slate500, 400);
  s += text(944, 806, '›', 24, C.slate400, 400, 'text-anchor="end"');

  // Annotations
  s += annotation(1040, 250, 500, 'Consulta bloqueada pela RLS', [
    'A página consulta as tabelas diretamente',
    'com a chave anon. Não existem políticas',
    'de leitura para anon, pelo que a consulta',
    'é rejeitada antes de chegar ao ecrã.',
  ]);
  s += `<path d="M 1040 330 C 1010 330 1000 340 976 350" stroke="${C.red}" stroke-width="2" fill="none" stroke-dasharray="6 5"/>`;

  s += annotation(1040, 500, 500, 'Funcionalidades ainda ausentes', [
    'Fotos, recibo, certificado, avaliação e',
    'botão de contacto não são apresentados.',
    'A RPC obter_encomenda_publica existe,',
    'mas a interface não a utiliza.',
  ]);

  s += annotation(1040, 700, 500, 'Passaporte e 3D', [
    'A rota /peca/:tokenPeca lê token_peca,',
    'um parâmetro diferente. A página é um',
    'stub e o visualizador só suporta GLB/GLTF.',
  ]);

  s += `<rect x="1040" y="852" width="500" height="62" rx="12" fill="${C.white}" stroke="${C.slate200}"/>`;
  s += text(1060, 878, 'O que o comprador deve ver', 12, C.slate500, 700, 'letter-spacing="1"');
  s += text(1060, 900, 'Estado, datas, peças, fotos e documentos — sem conta.', 12, C.slate700, 400);

  s += footerNote();
  return svg(s);
}

async function main() {
  const jobs = [
    ['manual-login.png', login()],
    ['manual-dashboard.png', dashboard()],
    ['manual-encomendas.png', list()],
    ['manual-portal.png', portal()],
  ];
  for (const [name, svgString] of jobs) {
    const file = path.join(OUT, name);
    await sharp(Buffer.from(svgString), { density: 144 }).png({ compressionLevel: 9 }).toFile(file);
    const meta = await sharp(file).metadata();
    console.log(`${name}: ${meta.width}x${meta.height} (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
