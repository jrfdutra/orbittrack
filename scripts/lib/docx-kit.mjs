// Construtor de DOCX com identidade OrbitTrack.
// Recebe um documento (meta + frontMatter + capítulos) e devolve um ficheiro .docx.
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import {
  AlignmentType, BorderStyle, Document, Footer, Header, HeadingLevel, ImageRun,
  LeaderType, PageBreak, PageNumber, Packer, Paragraph, SectionType, ShadingType,
  Table, TableCell, TableLayoutType, TableOfContents, TableRow, TextRun,
  VerticalAlignTable, WidthType,
} from 'docx';

const C = {
  slate900: '0F172A',
  slate800: '1E293B',
  slate700: '334155',
  slate600: '475569',
  slate500: '64748B',
  slate400: '94A3B8',
  slate300: 'CBD5E1',
  slate200: 'E2E8F0',
  slate100: 'F1F5F9',
  bg: 'F8FAFC',
  white: 'FFFFFF',
  indigo: '4F46E5',
  indigoDark: '3730A3',
  indigoLight: 'EEF2FF',
  emerald: '10B981',
  amber: 'F59E0B',
  red: 'DC2626',
  redLight: 'FEF2F2',
  amberLight: 'FFFBEB',
};

const FONT = 'Segoe UI';
const MONO = 'Consolas';
const PAGE_WIDTH = 11906;
const PAGE_HEIGHT = 16838;
const MARGIN_X = 1191;
const MARGIN_Y = 1247;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const CONTENT_HEIGHT = PAGE_HEIGHT - MARGIN_Y * 2;

const tone = {
  danger: { accent: C.red, bg: C.redLight },
  warn: { accent: C.amber, bg: C.amberLight },
  info: { accent: C.indigo, bg: C.indigoLight },
};

const imageCache = new Map();
async function imageInfo(file) {
  if (!imageCache.has(file)) {
    const abs = path.resolve(file);
    const meta = await sharp(abs).metadata();
    imageCache.set(file, { data: fs.readFileSync(abs), width: meta.width, height: meta.height });
  }
  return imageCache.get(file);
}

function run(text, options = {}) {
  return new TextRun({
    text: String(text ?? ''),
    font: options.font || FONT,
    size: options.size ?? 20,
    bold: options.bold,
    italics: options.italics,
    color: options.color || C.slate700,
    ...options.extra,
  });
}

function spacer(h = 80) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

function cellBorders(color = C.slate200, size = 2) {
  const b = { style: BorderStyle.SINGLE, size, color };
  return { top: b, bottom: b, left: b, right: b };
}

function noBorders() {
  const b = { style: BorderStyle.NONE, size: 0, color: C.white };
  return { top: b, bottom: b, left: b, right: b };
}

function tableCell({ text, width, header = false, fill, fontSize = 8.6, color, bold, align, borders }) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: { type: ShadingType.CLEAR, fill: fill || C.white, color: 'auto' },
    verticalAlign: VerticalAlignTable.CENTER,
    borders: borders || cellBorders(),
    margins: { top: 70, bottom: 70, left: 110, right: 110 },
    children: [
      new Paragraph({
        alignment: align || AlignmentType.LEFT,
        spacing: { before: 0, after: 0, line: 240 },
        children: [
          run(text, {
            size: fontSize * 2,
            bold: header ? true : bold,
            color: header ? C.white : (color || C.slate700),
          }),
        ],
      }),
    ],
  });
}

function makeTable(headers, rows, options = {}) {
  const cols = headers.length;
  let widths = options.widths && options.widths.length === cols
    ? options.widths
    : Array.from({ length: cols }, () => 100 / cols);
  const sum = widths.reduce((a, b) => a + b, 0) || 100;
  const pct = widths.map((w) => (w / sum) * 100);
  const twips = pct.map((w) => Math.round((CONTENT_WIDTH * w) / 100));
  const fontSize = options.fontSize || 8.6;

  const headerRow = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((h, i) => tableCell({
      text: h,
      width: pct[i],
      header: true,
      fill: C.slate900,
      fontSize: 8.2,
    })),
  });

  const bodyRows = rows.map((row, idx) => new TableRow({
    cantSplit: true,
    children: row.map((value, i) => tableCell({
      text: value,
      width: pct[i],
      fill: idx % 2 === 1 ? C.bg : C.white,
      fontSize,
    })),
  }));

  return new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: twips,
    layout: TableLayoutType.FIXED,
    margins: { top: 0, bottom: 0, left: 0, right: 0 },
  });
}

function calloutBlock(block) {
  const t = tone[block.tone] || tone.info;
  const paragraphs = [new Paragraph({
    spacing: { before: 0, after: 50 },
    children: [run(block.title, { size: 19, bold: true, color: t.accent })],
  })];
  const lines = String(block.text || '').split(/\r?\n/);
  for (const line of lines) {
    paragraphs.push(new Paragraph({
      spacing: { before: 0, after: 30, line: 250 },
      children: [run(line, { size: 19, color: C.slate700 })],
    }));
  }
  return new Table({
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: t.bg, color: 'auto' },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: t.bg },
          bottom: { style: BorderStyle.NONE, size: 0, color: t.bg },
          right: { style: BorderStyle.NONE, size: 0, color: t.bg },
          left: { style: BorderStyle.SINGLE, size: 30, color: t.accent },
        },
        margins: { top: 150, bottom: 150, left: 220, right: 180 },
        children: paragraphs,
      })],
    })],
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [CONTENT_WIDTH],
    layout: TableLayoutType.FIXED,
  });
}

function codeBlock(block) {
  const lines = String(block.text || '').replace(/\t/g, '    ').split(/\r?\n/);
  return new Table({
    rows: [new TableRow({
      cantSplit: false,
      children: [new TableCell({
        width: { size: 100, type: WidthType.PERCENTAGE },
        shading: { type: ShadingType.CLEAR, fill: C.slate100, color: 'auto' },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: C.slate200 },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: C.slate200 },
          right: { style: BorderStyle.SINGLE, size: 2, color: C.slate200 },
          left: { style: BorderStyle.SINGLE, size: 18, color: C.indigo },
        },
        margins: { top: 140, bottom: 140, left: 180, right: 140 },
        children: lines.map((line) => new Paragraph({
          spacing: { before: 0, after: 0, line: 220 },
          children: [run(line || ' ', { font: MONO, size: 15, color: C.slate800 })],
        })),
      })],
    })],
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [CONTENT_WIDTH],
    layout: TableLayoutType.FIXED,
  });
}

function heading1(block) {
  const number = block.number == null ? '' : `${block.number}. `;
  const title = `${number}${block.title}`;
  const children = [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      keepNext: true,
      spacing: { before: 0, after: 90 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.indigo, space: 8 } },
      children: [run(title, { size: 42, bold: true, color: C.slate900 })],
    }),
  ];
  if (block.lead) {
    children.push(new Paragraph({
      spacing: { before: 40, after: 180, line: 280 },
      children: [run(block.lead, { size: 21, color: C.slate500 })],
    }));
  }
  return children;
}

function heading2(block) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    keepNext: true,
    spacing: { before: 240, after: 80 },
    children: [run(block.text, { size: 27, bold: true, color: C.slate900 })],
  });
}

function heading3(block) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_3,
    keepNext: true,
    spacing: { before: 200, after: 60 },
    children: [run(block.text, { size: 22, bold: true, color: C.indigoDark })],
  });
}

async function renderBlock(block) {
  switch (block.type) {
    case 'h1':
      return heading1(block);
    case 'h2':
      return heading2(block);
    case 'h3':
      return heading3(block);
    case 'p':
      return new Paragraph({
        spacing: { before: 0, after: 110, line: 276 },
        children: [run(block.text, { size: 20, color: C.slate700 })],
      });
    case 'bullets':
      return block.items.map((item) => new Paragraph({
        bullet: { level: 0 },
        spacing: { before: 0, after: 45, line: 264 },
        children: [run(item, { size: 19.5, color: C.slate700 })],
      }));
    case 'numbered':
      return block.items.map((item, i) => new Paragraph({
        indent: { left: 400, hanging: 280 },
        spacing: { before: 0, after: 45, line: 264 },
        children: [
          run(`${String(i + 1).padStart(2, '0')}`, { size: 18, bold: true, color: C.indigo }),
          run(`   ${item}`, { size: 19.5, color: C.slate700 }),
        ],
      }));
    case 'table':
      return [
        makeTable(block.headers, block.rows, block),
        spacer(120),
      ];
    case 'callout':
      return [calloutBlock(block), spacer(140)];
    case 'code':
      return [codeBlock(block), spacer(120)];
    case 'figure': {
      const info = await imageInfo(block.src);
      const widthPx = Math.round((block.widthCm * 96) / 2.54);
      const heightPx = Math.round((info.height / info.width) * widthPx);
      return [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          keepNext: true,
          spacing: { before: 80, after: 40 },
          children: [new ImageRun({
            type: 'png',
            data: info.data,
            transformation: { width: widthPx, height: heightPx },
            altText: { title: block.caption || 'Figura', description: block.caption || '', name: 'Figura OrbitTrack' },
          })],
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 220 },
          children: [run(block.caption || '', { size: 16, italics: true, color: C.slate500 })],
        }),
      ];
    }
    case 'pagebreak':
      return new Paragraph({ children: [new PageBreak()] });
    default:
      return [];
  }
}

async function renderBlocks(blocks) {
  const out = [];
  for (const block of blocks) {
    const rendered = await renderBlock(block);
    if (Array.isArray(rendered)) out.push(...rendered);
    else if (rendered) out.push(rendered);
  }
  return out;
}

function metaTable(meta) {
  const rows = meta.kind === 'manual'
    ? [
      ['Tipo de documento', 'Manual de utilizador'],
      ['Produto', `${meta.product} — ${meta.productLine}`],
      ['Público', 'Vendedores (painel) e compradores (portal público)'],
      ['Versão', meta.version],
      ['Data', meta.date],
      ['Estado do produto', 'Versão de avaliação · sem fluxos validados em execução'],
      ['Classificação', meta.classification],
      ['Autor', meta.author],
      ['Âmbito', 'Registo, sessão, empresa, dashboard, encomendas, estados, portal, documentos e avaliação'],
      ['Fontes', 'Código em src/, supabase/schema.sql e auditoria estática de 27/10/2026'],
    ]
    : [
      ['Tipo de documento', 'Documentação técnica de produto'],
      ['Produto', `${meta.product} — ${meta.productLine}`],
      ['Versão', meta.version],
      ['Data', meta.date],
      ['Estado do produto', 'Versão de avaliação · nenhuma funcionalidade validada'],
      ['Classificação', meta.classification],
      ['Autor', meta.author],
      ['Âmbito', 'Arquitetura, base de dados, segurança, módulos, deploy, testes, riscos e roadmap'],
      ['Fontes', 'Repositório local, supabase/schema.sql, build, lint, tipos e npm audit'],
      ['Revisão', '1.0 · emissão inicial'],
    ];
  return makeTable(['Campo', 'Detalhe'], rows, { widths: [24, 76], fontSize: 8.6 });
}

function controlPage(doc) {
  const { meta, chapters } = doc;
  const totalChapters = chapters.filter((c) => c.number != null).length;
  return [
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [run('CONTROLO DO DOCUMENTO', { size: 15, bold: true, color: C.indigo })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [run(meta.title, { size: 46, bold: true, color: C.slate900 })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 260 },
      children: [run(meta.subtitle, { size: 23, color: C.slate500 })],
    }),
    metaTable(meta),
    spacer(240),
    new Paragraph({
      spacing: { before: 0, after: 100 },
      children: [run('HISTÓRICO DE REVISÕES', { size: 15, bold: true, color: C.slate900 })],
    }),
    makeTable(
      ['Versão', 'Data', 'Alteração', 'Responsável'],
      [['1.0', '27/10/2026', 'Emissão inicial para avaliação', meta.author]],
      { widths: [10, 16, 48, 26], fontSize: 8.4 },
    ),
    spacer(240),
    calloutBlock({
      tone: 'info',
      title: meta.kind === 'manual' ? 'Nota de rigor' : 'Nota de rigor',
      text: meta.kind === 'manual'
        ? 'As imagens deste manual são esquemas ilustrativos, não capturas reais. As anotações a vermelho assinalam bloqueios ou limitações confirmadas no código. O manual não substitui formação, suporte ou validação num ambiente real.'
        : 'Documento produzido a partir do código e do esquema SQL reais. Não foram inventados clientes, métricas, preços, certificações ou resultados de testes. As funcionalidades planeadas estão identificadas como tal e as limitações não foram suavizadas.',
    }),
    spacer(120),
    new Paragraph({
      spacing: { before: 0, after: 80 },
      children: [run('ESTRUTURA', { size: 15, bold: true, color: C.slate900 })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 100, line: 260 },
      children: [run(
        meta.kind === 'manual'
          ? `Manual organizado em ${chapters.length} blocos, incluindo glossário e guião de teste. Cada capítulo distingue o que está disponível, o que é condicional e o que está bloqueado.`
          : `Documento organizado em ${totalChapters} capítulos e anexos. Os capítulos 1 a 5 enquadram o produto e a experiência; os capítulos 6 a 12 cobrem módulos, dados e segurança; os capítulos 13 a 18 tratam qualidade, riscos, roadmap, operação e glossário.`,
        { size: 19, color: C.slate600 },
      )],
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function tocPage(doc) {
  return [
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [run('NAVEGAÇÃO', { size: 15, bold: true, color: C.indigo })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 60 },
      children: [run('Índice', { size: 40, bold: true, color: C.slate900 })],
    }),
    new Paragraph({
      spacing: { before: 0, after: 240 },
      children: [run('Os números de página são atualizados no Word e correspondem ao documento final.', { size: 18, color: C.slate500 })],
    }),
    new TableOfContents('Índice', {
      headingStyleRange: '1-1',
      hyperlink: true,
      tabLeader: LeaderType.DOT,
      beginDirty: true,
    }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function headerBlock(meta) {
  const iconFile = 'entrega/logo/favicon-64.png';
  const iconData = fs.existsSync(iconFile) ? fs.readFileSync(iconFile) : null;
  const left = [];
  if (iconData) {
    left.push(new ImageRun({
      type: 'png',
      data: iconData,
      transformation: { width: 18, height: 18 },
      altText: { title: 'OrbitTrack', description: 'Ícone OrbitTrack', name: 'OrbitTrack' },
    }));
    left.push(new TextRun({ text: '  ', font: FONT, size: 18 }));
  }
  left.push(run('OrbitTrack', { size: 18, bold: true, color: C.slate900 }));
  left.push(run(`  ·  ${meta.title}`, { size: 15, color: C.slate500 }));

  return new Header({
    children: [new Table({
      rows: [new TableRow({
        children: [
          new TableCell({
            width: { size: 78, type: WidthType.PERCENTAGE },
            borders: { top: noBorders().top, left: noBorders().left, right: noBorders().right, bottom: { style: BorderStyle.SINGLE, size: 4, color: C.slate200 } },
            margins: { top: 0, bottom: 40, left: 0, right: 0 },
            children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: left })],
          }),
          new TableCell({
            width: { size: 22, type: WidthType.PERCENTAGE },
            borders: { top: noBorders().top, left: noBorders().left, right: noBorders().right, bottom: { style: BorderStyle.SINGLE, size: 4, color: C.slate200 } },
            margins: { top: 0, bottom: 40, left: 0, right: 0 },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 0 },
              children: [run(`v${meta.version}  ·  27/10/2026`, { size: 14, color: C.slate500 })],
            })],
          }),
        ],
      })],
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [Math.round(CONTENT_WIDTH * 0.78), Math.round(CONTENT_WIDTH * 0.22)],
      layout: TableLayoutType.FIXED,
    })],
  });
}

function footerBlock(meta) {
  return new Footer({
    children: [new Table({
      rows: [new TableRow({
        children: [
          new TableCell({
            width: { size: 72, type: WidthType.PERCENTAGE },
            borders: { bottom: noBorders().bottom, left: noBorders().left, right: noBorders().right, top: { style: BorderStyle.SINGLE, size: 4, color: C.slate200 } },
            margins: { top: 40, bottom: 0, left: 0, right: 0 },
            children: [new Paragraph({
              spacing: { before: 0, after: 0 },
              children: [run(meta.footer, { size: 14, color: C.slate500 })],
            })],
          }),
          new TableCell({
            width: { size: 28, type: WidthType.PERCENTAGE },
            borders: { bottom: noBorders().bottom, left: noBorders().left, right: noBorders().right, top: { style: BorderStyle.SINGLE, size: 4, color: C.slate200 } },
            margins: { top: 40, bottom: 0, left: 0, right: 0 },
            children: [new Paragraph({
              alignment: AlignmentType.RIGHT,
              spacing: { before: 0, after: 0 },
              children: [new TextRun({
                children: ['Página ', PageNumber.CURRENT, ' de ', PageNumber.TOTAL_PAGES],
                font: FONT,
                size: 14,
                color: C.slate500,
              })],
            })],
          }),
        ],
      })],
      width: { size: 100, type: WidthType.PERCENTAGE },
      columnWidths: [Math.round(CONTENT_WIDTH * 0.72), Math.round(CONTENT_WIDTH * 0.28)],
      layout: TableLayoutType.FIXED,
    })],
  });
}

function normalizeChapters(chapters) {
  const out = [];
  chapters.forEach((chapter, index) => {
    let blocks = chapter.blocks.slice();
    while (blocks.length && blocks[blocks.length - 1].type === 'pagebreak') blocks.pop();
    if (index > 0) out.push({ type: 'pagebreak' });
    out.push(...blocks);
  });
  return out;
}

export async function buildDocx(doc) {
  const { meta, frontMatter, chapters } = doc;
  const cover = await imageInfo(meta.cover);

  // Estes blocos já são parágrafos/tabelas construídos; não passam pelo
  // renderizador de blocos, que espera descritores com "type".
  const prebuiltChildren = [...controlPage(doc), ...tocPage(doc)];

  const bodyBlocks = [];
  bodyBlocks.push(...(frontMatter || []));
  if (frontMatter && frontMatter.length && frontMatter[frontMatter.length - 1].type !== 'pagebreak') {
    bodyBlocks.push({ type: 'pagebreak' });
  }
  bodyBlocks.push(...normalizeChapters(chapters));

  const bodyChildren = [...prebuiltChildren, ...(await renderBlocks(bodyBlocks))];

  const document = new Document({
    creator: meta.author,
    title: `${meta.product} — ${meta.title}`,
    subject: meta.subject,
    description: meta.subtitle,
    keywords: meta.keywords,
    lastModifiedBy: meta.author,
    settings: { updateFields: true },
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 20, color: C.slate700 },
          paragraph: { spacing: { line: 276, after: 110 } },
        },
        heading1: {
          run: { font: FONT, size: 42, bold: true, color: C.slate900 },
          paragraph: { spacing: { before: 0, after: 120 }, keepNext: true },
        },
        heading2: {
          run: { font: FONT, size: 27, bold: true, color: C.slate900 },
          paragraph: { spacing: { before: 240, after: 80 }, keepNext: true },
        },
        heading3: {
          run: { font: FONT, size: 22, bold: true, color: C.indigoDark },
          paragraph: { spacing: { before: 200, after: 60 }, keepNext: true },
        },
        caption: {
          run: { font: FONT, size: 16, italics: true, color: C.slate500 },
          paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 0, after: 160 } },
        },
      },
    },
    sections: [
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: { top: 0, bottom: 0, left: 0, right: 0, header: 0, footer: 0 },
          },
        },
        children: [
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 0, after: 0, line: 1 },
            children: [new ImageRun({
              type: 'png',
              data: cover.data,
              transformation: { width: 793, height: 1122 },
              altText: { title: `${meta.product} — ${meta.title}`, description: 'Capa do documento', name: 'Capa' },
            })],
          }),
        ],
      },
      {
        properties: {
          type: SectionType.NEXT_PAGE,
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: { top: MARGIN_Y, bottom: MARGIN_Y, left: MARGIN_X, right: MARGIN_X, header: 567, footer: 567 },
            pageNumbers: { start: 1 },
          },
        },
        headers: { default: headerBlock(meta) },
        footers: { default: footerBlock(meta) },
        children: bodyChildren,
      },
    ],
  });

  return Packer.toBuffer(document);
}

export async function writeDocx(doc, outFile) {
  const buffer = await buildDocx(doc);
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, buffer);
  return { file: outFile, bytes: buffer.length };
}

export const docxLayout = { PAGE_WIDTH, PAGE_HEIGHT, MARGIN_X, MARGIN_Y, CONTENT_WIDTH, CONTENT_HEIGHT };
