// Gera os diagramas e as capas usadas na documentação técnica e no manual.
// Executar: node scripts/build-assets.mjs
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'assets');
fs.mkdirSync(OUT, { recursive: true });

const C = {
  slate900: '#0F172A',
  slate800: '#1E293B',
  slate700: '#334155',
  slate600: '#475569',
  slate500: '#64748B',
  slate400: '#94A3B8',
  slate300: '#CBD5E1',
  slate200: '#E2E8F0',
  slate100: '#F1F5F9',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  indigo: '#4F46E5',
  indigoDark: '#3730A3',
  indigoLight: '#EEF2FF',
  blue: '#3B82F6',
  emerald: '#10B981',
  emeraldDark: '#047857',
  emeraldLight: '#ECFDF5',
  amber: '#F59E0B',
  amberLight: '#FFFBEB',
  red: '#DC2626',
  redLight: '#FEF2F2',
};

const FONT = 'Segoe UI, Inter, Arial, sans-serif';
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const iconB64 = fs.readFileSync(path.join(ROOT, 'entrega/logo/orbittrack-icon-512.png')).toString('base64');
const iconData = `data:image/png;base64,${iconB64}`;

function text(x, y, value, size = 24, color = C.slate700, weight = 400, extra = '') {
  return `<text x="${x}" y="${y}" font-family="${FONT}" font-size="${size}" font-weight="${weight}" fill="${color}" ${extra}>${esc(value)}</text>`;
}

function pill(x, y, label, color, bg) {
  const w = label.length * 11 + 28;
  return `<g>
    <rect x="${x}" y="${y}" width="${w}" height="34" rx="17" fill="${bg}" stroke="${color}" stroke-opacity="0.25"/>
    <text x="${x + 14}" y="${y + 23}" font-family="${FONT}" font-size="15" font-weight="700" fill="${color}" letter-spacing="0.4">${esc(label)}</text>
  </g>`;
}

function svgDoc(w, h, body, bg = C.bg) {
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="#0F172A" flood-opacity="0.08"/>
    </filter>
    <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.slate400}"/>
    </marker>
    <marker id="arrowIndigo" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M 0 0 L 10 5 L 0 10 z" fill="${C.indigo}"/>
    </marker>
    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${C.slate200}" stroke-width="1" opacity="0.55"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="${bg}"/>
  <rect width="${w}" height="${h}" fill="url(#grid)"/>
  ${body}
</svg>`;
}

// ------------------------------------------------------------
// Diagrama de arquitetura
// ------------------------------------------------------------
function buildArchitecture() {
  const W = 1800, H = 1120;
  let s = '';

  s += text(80, 86, 'Arquitetura lógica do OrbitTrack', 42, C.slate900, 800);
  s += text(80, 124, 'SPA React, Supabase e serviços executados no browser · auditoria de 27/10/2026', 19, C.slate500, 400);
  s += text(1540, 98, 'Estado dos componentes', 14, C.slate400, 700, 'letter-spacing="1.4" text-anchor="end"');
  s += text(1540, 122, 'Parcial · bloqueado · não validado', 13, C.slate400, 400, 'text-anchor="end"');

  // Painel Supabase
  s += `<rect x="1250" y="170" width="470" height="660" rx="26" fill="${C.white}" stroke="${C.indigo}" stroke-width="2" filter="url(#shadow)"/>`;
  s += `<rect x="1250" y="170" width="470" height="70" rx="26" fill="${C.indigo}"/>`;
  s += `<rect x="1250" y="214" width="470" height="26" fill="${C.indigo}"/>`;
  s += text(1280, 215, 'Supabase', 28, C.white, 800);
  s += text(1280, 258, 'Serviços geridos · sem backend próprio', 14, C.slate500, 500);

  const svc = [
    ['Auth', 'Sessão, JWT, email e recuperação', C.indigoLight, C.indigoDark, 'Parcial'],
    ['PostgREST', 'API automática sobre PostgreSQL', C.indigoLight, C.indigoDark, 'Ativo'],
    ['PostgreSQL + RLS', '9 tabelas · políticas por empresa', C.emeraldLight, C.emeraldDark, 'Não validado'],
    ['Storage', 'Logótipos, fotos e modelos 3D', C.amberLight, C.amber, 'Público'],
    ['RPC SECURITY DEFINER', '4 funções públicas previstas', C.redLight, C.red, 'Não usadas'],
  ];
  let yy = 270;
  for (const [name, desc, bg, color, badge] of svc) {
    const bw = badge.length * 8 + 18;
    const bx = 1280 + 410 - bw - 12;
    s += `<rect x="1280" y="${yy}" width="410" height="88" rx="16" fill="${bg}" stroke="${color}" stroke-opacity="0.18"/>`;
    s += text(1300, yy + 33, name, name.length > 18 ? 16 : 19, C.slate900, 700);
    s += text(1300, yy + 58, desc, 14, C.slate600, 400);
    s += `<rect x="${bx}" y="${yy + 15}" width="${bw}" height="24" rx="12" fill="${color}" fill-opacity="0.13"/>`;
    s += text(bx + 9, yy + 32, badge, 12, color, 700);
    yy += 102;
  }

  // Painel SPA
  s += `<rect x="620" y="170" width="540" height="660" rx="26" fill="${C.white}" stroke="${C.slate300}" stroke-width="2" filter="url(#shadow)"/>`;
  s += `<rect x="620" y="170" width="540" height="70" rx="26" fill="${C.slate900}"/>`;
  s += `<rect x="620" y="214" width="540" height="26" fill="${C.slate900}"/>`;
  s += text(650, 215, 'OrbitTrack SPA', 28, C.white, 800);
  s += text(650, 258, 'React 19 · Vite 8 · TypeScript · Tailwind 4', 14, C.slate500, 500);

  s += text(650, 292, 'Rotas e módulos', 15, C.slate500, 700, 'letter-spacing="1.4"');
  const mods = [
    ['Painel do vendedor', '/painel/** · protegido', C.emerald, 'Parcial'],
    ['Portal do comprador', '/acompanhar/:token · público', C.red, 'Bloqueado'],
    ['Passaporte da peça', '/peca/:tokenPeca · público', C.red, 'Stub'],
    ['Verificação', '/verificar/:codigo · público', C.red, 'Bloqueado'],
    ['Autenticação', '/login · /registar · /recuperar', C.amber, 'Parcial'],
  ];
  yy = 310;
  for (const [name, route, color, badge] of mods) {
    s += `<rect x="650" y="${yy}" width="480" height="70" rx="14" fill="${C.slate100}"/>`;
    s += `<rect x="650" y="${yy}" width="6" height="70" rx="3" fill="${color}"/>`;
    s += text(674, yy + 29, name, 17, C.slate900, 700);
    s += text(674, yy + 52, route, 13, C.slate500, 400);
    s += `<rect x="${1014}" y="${yy + 21}" width="${badge.length * 8 + 18}" height="24" rx="12" fill="${color}" fill-opacity="0.13"/>`;
    s += text(1023, yy + 38, badge, 12, color, 700);
    yy += 82;
  }

  s += `<rect x="650" y="740" width="480" height="62" rx="14" fill="${C.indigoLight}" stroke="${C.indigo}" stroke-opacity="0.2"/>`;
  s += text(670, 766, 'Bibliotecas no browser', 14, C.indigoDark, 700, 'letter-spacing="1.2"');
  s += text(670, 790, 'three.js · jsPDF · qrcode.react · date-fns', 13, C.slate600, 400);

  // Atores
  s += `<rect x="80" y="280" width="420" height="180" rx="22" fill="${C.white}" stroke="${C.slate300}" filter="url(#shadow)"/>`;
  s += `<rect x="80" y="280" width="420" height="6" rx="3" fill="${C.indigo}"/>`;
  s += `<circle cx="132" cy="350" r="26" fill="${C.indigoLight}"/>`;
  s += `<path d="M132 337a9 9 0 1 0 0 18a9 9 0 0 0 0-18Zm-16 34c0-9 7-14 16-14s16 5 16 14" stroke="${C.indigo}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += text(178, 344, 'Vendedor', 24, C.slate900, 800);
  s += text(178, 370, 'Browser com sessão Supabase', 14, C.slate500, 400);
  s += text(178, 394, 'Auth · JWT · CRUD', 13, C.slate600, 600);
  s += `<rect x="112" y="414" width="106" height="24" rx="12" fill="${C.emeraldLight}"/>`;
  s += text(123, 431, 'Não validado', 12, C.emeraldDark, 700);

  s += `<rect x="80" y="520" width="420" height="180" rx="22" fill="${C.white}" stroke="${C.slate300}" filter="url(#shadow)"/>`;
  s += `<rect x="80" y="520" width="420" height="6" rx="3" fill="${C.emerald}"/>`;
  s += `<circle cx="132" cy="590" r="26" fill="${C.emeraldLight}"/>`;
  s += `<path d="M132 577a9 9 0 1 0 0 18a9 9 0 0 0 0-18Zm-16 34c0-9 7-14 16-14s16 5 16 14" stroke="${C.emerald}" stroke-width="3" fill="none" stroke-linecap="round"/>`;
  s += text(178, 584, 'Comprador', 24, C.slate900, 800);
  s += text(178, 610, 'Browser sem conta', 14, C.slate500, 400);
  s += text(178, 634, 'Link secreto com token', 13, C.slate600, 600);
  s += `<rect x="112" y="654" width="106" height="24" rx="12" fill="${C.redLight}"/>`;
  s += text(123, 671, 'Bloqueado', 12, C.red, 700);

  // Setas
  const arrow = (d, color = C.slate400, marker = 'arrow', dashed = false, width = 2.4) =>
    `<path d="${d}" fill="none" stroke="${color}" stroke-width="${width}" ${dashed ? 'stroke-dasharray="9 8"' : ''} marker-end="url(#${marker})"/>`;

  s += arrow('M 500 370 L 620 370', C.indigo, 'arrowIndigo');
  s += text(506, 356, 'HTTPS + JWT', 13, C.indigoDark, 700);

  s += arrow('M 500 610 L 620 610', C.emerald, 'arrow');
  s += text(506, 596, 'link + token', 13, C.emeraldDark, 700);

  s += arrow('M 1160 340 L 1250 340', C.slate400);
  s += text(1168, 326, 'PostgREST', 13, C.slate600, 700);

  s += arrow('M 1160 470 L 1250 470', C.slate400);
  s += text(1168, 456, 'Auth', 13, C.slate600, 700);

  s += arrow('M 1160 620 L 1250 620', C.red, 'arrow', true);
  s += text(1168, 606, 'RPC (prevista)', 13, C.red, 700);

  s += arrow('M 1160 770 L 1250 770', C.amber, 'arrow', true);
  s += text(1168, 756, 'Storage', 13, C.amber, 700);

  // Nota RLS
  s += `<rect x="80" y="760" width="420" height="150" rx="20" fill="${C.white}" stroke="${C.slate300}" stroke-dasharray="8 6"/>`;
  s += text(104, 798, 'Fronteira de confiança', 15, C.slate500, 700, 'letter-spacing="1.2"');
  s += text(104, 830, 'A RLS é a única barreira', 18, C.slate900, 700);
  s += text(104, 856, 'real. Esconder rotas no React', 15, C.slate600, 400);
  s += text(104, 878, 'é apenas experiência de uso.', 15, C.slate600, 400);

  // Deploy
  s += `<rect x="80" y="950" width="1640" height="120" rx="20" fill="${C.white}" stroke="${C.slate300}" filter="url(#shadow)"/>`;
  s += `<rect x="80" y="950" width="6" height="120" rx="3" fill="${C.amber}"/>`;
  s += text(110, 990, 'Deploy previsto', 18, C.slate900, 700);
  s += text(110, 1018, 'Vercel CDN + Supabase gerido', 15, C.slate600, 400);
  s += text(110, 1044, 'Sem vercel.json, sem CI e com build de produção bloqueado.', 14, C.red, 600);
  s += text(900, 990, 'Fluxo público previsto', 18, C.slate900, 700);
  s += text(900, 1018, 'Token → RPC SECURITY DEFINER → JSON mínimo → página', 15, C.slate600, 400);
  s += text(900, 1044, 'A UI atual consulta tabelas e falha por RLS.', 14, C.red, 600);
  s += `<rect x="1450" y="975" width="236" height="70" rx="14" fill="${C.slate900}"/>`;
  s += text(1470, 1005, '9 tabelas · 4 RPCs', 16, C.white, 700);
  s += text(1470, 1029, '2 buckets públicos', 13, C.slate400, 400);

  return svgDoc(W, H, s);
}

// ------------------------------------------------------------
// Diagrama entidade-relação simplificado
// ------------------------------------------------------------
function entity(x, y, w, title, rows, accent = C.indigo, note = '') {
  const header = 58;
  const rowH = 33;
  const h = header + rows.length * rowH + (note ? 38 : 16);
  let out = `<g filter="url(#shadow)">
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${C.white}" stroke="${C.slate300}"/>
    <rect x="${x}" y="${y}" width="${w}" height="${header}" rx="16" fill="${C.slate900}"/>
    <rect x="${x}" y="${y + header - 10}" width="${w}" height="10" fill="${C.slate900}"/>
    <rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="${accent}"/>
    <text x="${x + 22}" y="${y + 37}" font-family="${FONT}" font-size="19" font-weight="700" fill="${C.white}">${esc(title)}</text>
  </g>`;
  let ry = y + header + 26;
  for (const row of rows) {
    const isKey = row.startsWith('PK') || row.startsWith('FK') || row.startsWith('UQ');
    out += `<text x="${x + 22}" y="${ry}" font-family="${FONT}" font-size="14" font-weight="${isKey ? 700 : 400}" fill="${isKey ? C.slate900 : C.slate600}">${esc(row)}</text>`;
    ry += rowH;
  }
  if (note) {
    out += `<text x="${x + 22}" y="${ry + 8}" font-family="${FONT}" font-size="12" font-style="italic" fill="${C.slate400}">${esc(note)}</text>`;
  }
  return out;
}

function buildER() {
  const W = 2000, H = 1620;
  let s = '';

  s += text(80, 84, 'Modelo de dados do OrbitTrack', 42, C.slate900, 800);
  s += text(80, 122, '9 tabelas de negócio · chaves, relações principais e estado de integridade', 19, C.slate500, 400);
  s += pill(1540, 62, 'RLS ativa em 9 tabelas', C.emeraldDark, C.emeraldLight);

  s += entity(80, 200, 420, 'empresas', [
    'PK  id  uuid',
    'FK  utilizador_id  uuid',
    '      nome  text',
    '      email  text',
    '      cor_primaria  text',
    '      criada_em  timestamptz',
  ], C.indigo, 'Sem UNIQUE(utilizador_id)');

  s += entity(80, 580, 420, 'configuracao_estados', [
    'PK  id  uuid',
    'FK  empresa_id  uuid',
    '      nome  text',
    '      ordem  integer',
    '      cor  text',
  ], C.indigo, 'Sem UNIQUE(empresa_id, nome)');

  s += entity(600, 200, 480, 'encomendas', [
    'PK  id  uuid',
    'FK  empresa_id  uuid',
    'UQ  token_publico  text',
    '      numero_encomenda  text',
    '      nome_comprador  text',
    '      estado  text',
    '      previsao_entrega  date',
    '      criada_em  timestamptz',
  ], C.emerald, 'UNIQUE(empresa_id, numero_encomenda)');

  s += entity(600, 640, 480, 'historico_estados', [
    'PK  id  uuid',
    'FK  encomenda_id  uuid',
    '      estado  text',
    '      mensagem  text',
    '      criado_em  timestamptz',
  ], C.blue, 'Sem autor nem associação a fotos');

  s += entity(600, 960, 480, 'fotos_encomenda', [
    'PK  id  uuid',
    'FK  encomenda_id  uuid',
    'FK  item_id  uuid (opcional)',
    '      url  text',
    '      legenda  text',
  ], C.blue, 'Bucket público · sem validação de upload');

  s += entity(1180, 200, 460, 'itens_encomenda', [
    'PK  id  uuid',
    'FK  encomenda_id  uuid',
    '      nome_peca  text',
    '      material / cor  text',
    'UQ  token_peca  text',
    '      numero_serie  text',
  ], C.emerald, 'Ficha técnica completa no schema');

  s += entity(1180, 600, 460, 'certificados', [
    'PK  id  uuid',
    'FK  encomenda_id  uuid',
    'FK  item_id  uuid (opcional)',
    'UQ  codigo_verificacao  text',
    '      nivel_selo  text',
    '      criterios  jsonb',
    '      prazo_garantia_meses  integer',
  ], C.amber, 'CHECK bronze/prata/ouro');

  s += entity(1180, 1000, 460, 'recibos', [
    'PK  id  uuid',
    'FK  encomenda_id  uuid',
    '      numero_recibo  text',
    '      valor_total  numeric(10,2)',
  ], C.blue, 'Sem UNIQUE(numero_recibo)');

  s += entity(1180, 1300, 460, 'avaliacoes', [
    'PK  id  uuid',
    'FK  encomenda_id  uuid',
    '      estrelas  integer',
    '      comentario  text',
  ], C.amber, 'Sem UNIQUE(encomenda_id)');

  // Ligações
  const line = (d, label = '', lx = 0, ly = 0, color = C.slate400, dashed = false) => {
    let out = `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.4" ${dashed ? 'stroke-dasharray="8 7"' : ''} marker-end="url(#arrow)"/>`;
    if (label) out += text(lx, ly, label, 12, C.slate500, 700);
    return out;
  };

  // empresas -> encomendas
  s += line('M 500 350 L 600 350', '1:N', 522, 338, C.indigo);
  // empresas -> configuracao
  s += line('M 290 494 L 290 580', '1:N', 302, 544, C.indigo);
  // encomendas -> historico
  s += line('M 840 560 L 840 640', '1:N', 852, 606, C.blue);
  // encomendas -> fotos (corredor esquerdo)
  s += line('M 600 520 L 540 520 L 540 1040 L 600 1040', '1:N', 550, 1028, C.blue);
  // encomendas -> itens
  s += line('M 1080 300 L 1180 300', '1:N', 1104, 288, C.emerald);
  // encomendas -> certificados / recibos / avaliacoes (corredor direito)
  s += `<path d="M 1080 520 L 1120 520 L 1120 1380" fill="none" stroke="${C.slate400}" stroke-width="2.4"/>`;
  s += line('M 1120 720 L 1180 720', '1:N', 1128, 708, C.amber);
  s += line('M 1120 1080 L 1180 1080', '1:N', 1128, 1068, C.blue);
  s += line('M 1120 1380 L 1180 1380', '1:N', 1128, 1368, C.amber);
  // itens -> certificados
  s += line('M 1410 494 L 1410 600', '1:N item_id', 1422, 552, C.emerald, true);

  // Nota
  s += `<rect x="80" y="900" width="420" height="250" rx="18" fill="${C.white}" stroke="${C.slate300}" stroke-dasharray="8 6"/>`;
  s += text(106, 938, 'Como ler', 15, C.slate500, 700, 'letter-spacing="1.2"');
  s += text(106, 972, 'PK · chave primária', 14, C.slate700, 400);
  s += text(106, 996, 'FK · chave estrangeira', 14, C.slate700, 400);
  s += text(106, 1020, 'UQ · restrição UNIQUE', 14, C.slate700, 400);
  s += text(106, 1044, 'Tracejado · relação opcional', 14, C.slate700, 400);
  s += text(106, 1084, 'ON DELETE CASCADE em todas as', 13, C.slate500, 400);
  s += text(106, 1104, 'relações, exceto item_id em fotos', 13, C.slate500, 400);
  s += text(106, 1124, 'e certificados (SET NULL).', 13, C.slate500, 400);

  // Rodapé de leitura
  s += text(80, 1560, 'Fonte: supabase/schema.sql · 9 tabelas, 10 funções e 4 triggers · sem migrações versionadas', 13, C.slate400, 400);

  return svgDoc(W, H, s);
}

// ------------------------------------------------------------
// Capas
// ------------------------------------------------------------
function cover({ kicker, title, subtitle, badges, bullets, footer, accent = C.indigo }) {
  const W = 1240, H = 1754;
  let s = '';

  s += `<rect width="${W}" height="${H}" fill="${C.bg}"/>`;
  s += `<rect width="${W}" height="1080" fill="${C.slate900}"/>`;
  s += `<circle cx="1060" cy="190" r="430" fill="${accent}" opacity="0.10"/>`;
  s += `<circle cx="1060" cy="190" r="300" fill="${accent}" opacity="0.10"/>`;
  s += `<circle cx="1060" cy="190" r="170" fill="${accent}" opacity="0.12"/>`;
  s += `<path d="M -80 1010 C 300 900 620 1060 1320 920" stroke="${C.emerald}" stroke-width="3" fill="none" opacity="0.35"/>`;
  s += `<path d="M -80 1052 C 300 942 620 1102 1320 962" stroke="${C.emerald}" stroke-width="1.6" fill="none" opacity="0.22"/>`;

  s += `<image href="${iconData}" x="88" y="78" width="112" height="112"/>`;
  s += text(216, 128, 'OrbitTrack', 34, C.white, 800);
  s += text(218, 158, 'GESTÃO DE IMPRESSÃO 3D', 12, C.slate400, 600, 'letter-spacing="5"');

  s += text(88, 360, kicker, 18, '#A5B4FC', 700, 'letter-spacing="4"');
  s += text(88, 438, title[0], 66, C.white, 800);
  if (title[1]) s += text(88, 512, title[1], 66, C.white, 800);
  s += text(88, 574, subtitle, 21, C.slate300, 400);

  let bx = 88;
  for (const b of badges) {
    const w = b.label.length * 10 + 34;
    s += `<rect x="${bx}" y="628" width="${w}" height="38" rx="19" fill="${b.bg}" stroke="${b.color}" stroke-opacity="0.35"/>`;
    s += text(bx + 17, 653, b.label, 14, b.color, 700);
    bx += w + 12;
  }

  s += `<rect x="88" y="744" width="580" height="1" fill="${C.slate700}"/>`;
  s += text(88, 800, 'O que este documento cobre', 15, C.slate400, 700, 'letter-spacing="2"');
  let yy = 846;
  for (const b of bullets) {
    s += `<circle cx="96" cy="${yy - 6}" r="3" fill="${C.emerald}"/>`;
    s += text(114, yy, b, 16, C.slate300, 400);
    yy += 36;
  }

  s += `<rect x="88" y="1130" width="546" height="2" fill="${accent}"/>`;
  s += text(88, 1190, 'Estado do produto', 14, C.slate500, 700, 'letter-spacing="2"');
  s += text(88, 1232, 'Versão de avaliação', 24, C.slate900, 800);
  s += text(88, 1262, 'Auditoria estática do código, sem validação em execução', 14, C.slate500, 400);

  s += text(88, 1330, 'Data', 12, C.slate400, 700, 'letter-spacing="1.6"');
  s += text(88, 1356, '27 de outubro de 2026', 16, C.slate800, 600);
  s += text(420, 1330, 'Versão', 12, C.slate400, 700, 'letter-spacing="1.6"');
  s += text(420, 1356, '1.0', 16, C.slate800, 600);

  s += `<rect x="88" y="1480" width="1064" height="120" rx="16" fill="${C.white}" stroke="${C.slate200}"/>`;
  s += text(112, 1518, 'Nota de rigor', 13, C.slate500, 700, 'letter-spacing="1.6"');
  s += text(112, 1548, 'Documento produzido a partir do código e do esquema SQL reais.', 15, C.slate700, 400);
  s += text(112, 1574, 'Sem clientes, métricas, preços ou certificações inventados.', 15, C.slate700, 400);
  s += text(112, 1668, footer, 12, C.slate400, 400);
  s += text(1024, 1668, 'orbittrack.pt', 12, C.slate400, 600);

  return svgDoc(W, H, s, C.bg);
}

async function main() {
  const architecture = buildArchitecture();
  const er = buildER();

  const coverTechnical = cover({
    kicker: 'DOCUMENTAÇÃO TÉCNICA',
    title: ['OrbitTrack', 'Documentação técnica'],
    subtitle: 'Arquitetura, dados, segurança e roadmap do produto',
    badges: [
      { label: '18 capítulos', color: '#C7D2FE', bg: 'rgba(79,70,229,0.18)' },
      { label: 'Auditoria real', color: '#6EE7B7', bg: 'rgba(16,185,129,0.14)' },
      { label: 'Sem métricas inventadas', color: '#FCD34D', bg: 'rgba(245,158,11,0.14)' },
    ],
    bullets: [
      'Requisitos, arquitetura e estrutura do código',
      'Base de dados, RLS, Storage e riscos',
      'Estado honesto de cada funcionalidade',
      'Roadmap, testes, deploy e anexos',
    ],
    footer: 'Documento confidencial · uso interno e avaliação',
    accent: C.indigo,
  });

  const coverManual = cover({
    kicker: 'MANUAL DE UTILIZADOR',
    title: ['OrbitTrack', 'Manual de utilizador'],
    subtitle: 'Guia de avaliação para vendedores e compradores',
    badges: [
      { label: 'Versão de avaliação', color: '#FCD34D', bg: 'rgba(245,158,11,0.14)' },
      { label: 'Fluxos bloqueados sinalizados', color: '#FCA5A5', bg: 'rgba(220,38,38,0.14)' },
    ],
    bullets: [
      'Criar conta e configurar a empresa',
      'Perceber o painel e a lista de encomendas',
      'Ler o portal público e o passaporte',
      'Evitar promessas que o produto ainda não cumpre',
    ],
    footer: 'Manual de avaliação · não substitui formação ou suporte',
    accent: C.emerald,
  });

  const jobs = [
    ['arquitetura.png', architecture, 2],
    ['er.png', er, 2],
    ['capa-documentacao-tecnica.png', coverTechnical, 2],
    ['capa-manual-utilizador.png', coverManual, 2],
  ];

  for (const [name, svg, scale] of jobs) {
    const file = path.join(OUT, name);
    await sharp(Buffer.from(svg), { density: 72 * scale }).png({ compressionLevel: 9 }).toFile(file);
    const meta = await sharp(file).metadata();
    console.log(`${name}: ${meta.width}x${meta.height} (${(fs.statSync(file).size / 1024).toFixed(0)} KB)`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
