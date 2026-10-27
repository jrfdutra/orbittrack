// Conteúdo completo da documentação técnica.
// Junta o front matter (capa, controlo, resumo) aos 18 capítulos dos quatro módulos.
import {
  h1, h2, p, bullets, table, callout, pagebreak,
} from './blocks.mjs';
import { chapters as parte1 } from './doc-part1.mjs';
import { chapters as parte2 } from './doc-part2.mjs';
import { chapters as parte3 } from './doc-part3.mjs';
import { chapters as parte4 } from './doc-part4.mjs';
import { FEATURES, RISKS } from './audit-data.mjs';

const STATUS_LABEL = {
  validated: 'Implementada e validada',
  unvalidated: 'Implementada, não validada',
  partial: 'Parcialmente implementada',
  planned: 'Planeada',
  blocked: 'Bloqueada ou com problemas',
  unconfirmed: 'Não confirmada',
};

const counts = Object.keys(STATUS_LABEL).reduce((acc, key) => {
  acc[key] = FEATURES.filter((f) => f.status === key).length;
  return acc;
}, {});

const criticos = RISKS.filter((r) => r.priority === 'P0').slice(0, 8);

export const technicalMeta = {
  kind: 'technical',
  slug: 'OrbitTrack_Documentacao_Tecnica',
  title: 'Documentação técnica',
  subtitle: 'Arquitetura, dados, segurança e roadmap do produto',
  cover: 'assets/capa-documentacao-tecnica.png',
  version: '1.0',
  date: '27 de outubro de 2026',
  classification: 'Confidencial · uso interno e avaliação',
  author: 'Equipa de produto OrbitTrack',
  product: 'OrbitTrack',
  productLine: 'Gestão de impressão 3D',
  footer: 'Documento confidencial · uso interno e avaliação',
  subject: 'Auditoria técnica, arquitetura, base de dados, segurança, módulos, deploy e roadmap do OrbitTrack',
  keywords: 'OrbitTrack, impressão 3D, SaaS, Supabase, React, auditoria, documentação técnica',
};

export const technicalFrontMatter = [
  h1(null, 'Resumo executivo', 'A conclusão essencial em duas páginas: o que o produto é, o que está comprovado e o que impede a comercialização.'),
  p('O OrbitTrack é uma aplicação web SaaS white-label para oficinas de impressão 3D. O vendedor gere encomendas num painel privado e o comprador acompanha o trabalho através de um link secreto, sem criar conta. A visão inclui ainda passaporte digital da peça, certificado de autenticidade verificável, recibos em PDF e QR codes.'),
  p('Esta documentação foi produzida a partir de uma auditoria estática ao repositório local, ao esquema SQL e aos comandos de build, lint e tipos. Não houve acesso a um projeto Supabase em execução, pelo que nenhuma conclusão descreve comportamento observado em produção. As afirmações referem-se ao código existente e à sua leitura, não a resultados de testes.'),
  h2('O que existe de facto'),
  bullets(
    'Estrutura React, Vite, TypeScript e Tailwind com rotas públicas e protegidas, contexto de autenticação e layout do painel.',
    'Ecrãs de login, registo, recuperação de palavra-passe, perfil de empresa, dashboard, lista de encomendas, criação de encomenda e configuração de estados.',
    'Esquema PostgreSQL com nove tabelas de negócio, RLS ativa, quatro RPCs públicas, dois buckets de Storage e funções de numeração.',
    'Páginas públicas de acompanhamento, passaporte e verificação de certificado, todas com problemas de ligação a dados.',
    'Geradores de PDF e visualizador 3D em esqueleto, sem fluxo completo de emissão ou download.',
  ),
  h2('O que impede a comercialização'),
  table(
    ['ID', 'Problema confirmado', 'Impacto direto'],
    criticos.map((r) => [r.id, r.problem, r.impact]),
    { widths: [8, 38, 54], fontSize: 7.6 },
  ),
  callout(
    'danger',
    'Não apresentar como produto operacional',
    'O build de produção falha, as páginas públicas não conseguem ler dados por RLS, a criação de encomendas viola uma coluna NOT NULL e não existe qualquer teste automatizado. Nenhuma funcionalidade atinge o estado “Implementada e validada”. A expressão “pronto para Vercel” não é sustentada pelo código atual.',
  ),
  h2('Distribuição dos 40 itens auditados'),
  table(
    ['Estado', 'Itens', 'Leitura correta'],
    [
      ['Implementada e validada', String(counts.validated), 'Nenhum item. Não existe suite de testes nem validação em execução.'],
      ['Implementada, não validada', String(counts.unvalidated), 'Código presente, mas sem prova de funcionamento ponta a ponta.'],
      ['Parcialmente implementada', String(counts.partial), 'Existe uma parte do fluxo; faltam peças essenciais ou estão incompletas.'],
      ['Bloqueada ou com problemas', String(counts.blocked), 'O código existe, mas falha de forma confirmada ou impede o fluxo.'],
      ['Planeada', String(counts.planned), 'Não existe implementação; apenas modelo, dependência ou intenção.'],
      ['Não confirmada', String(counts.unconfirmed), 'Sem evidência suficiente para classificar.'],
    ],
    { widths: [27, 8, 65] },
  ),
  p('A matriz completa, com evidência, limitações e próximo passo para cada item, está no Capítulo 6. Os riscos detalhados, com probabilidade, prioridade, esforço e critério de conclusão, estão no Capítulo 14 e no anexo de riscos.'),
  h2('Como usar este documento'),
  bullets(
    'Decisores: ler o resumo executivo, o Capítulo 1, o Capítulo 14 e o roadmap do Capítulo 16.',
    'Equipa técnica: usar os Capítulos 3 a 12 como base de correção e os critérios de aceitação do Capítulo 15.',
    'Comercial: consultar o Capítulo 2 e o Capítulo 13 antes de qualquer proposta; não prometer fluxos bloqueados.',
    'Operação: seguir o Capítulo 17 para deploy e suporte, respeitando os bloqueios de segurança.',
  ),
  callout(
    'info',
    'Convenção de estados',
    '“Implementada e validada” exige código, ambiente real e teste reproduzível. “Implementada, não validada” significa que o código existe mas não foi provado. “Parcial” significa que só parte do fluxo existe. “Bloqueada” significa falha confirmada. “Planeada” significa que não há implementação.',
  ),
  pagebreak(),
];

export const technicalChapters = [...parte1, ...parte2, ...parte3, ...parte4];

export const technicalDocument = {
  meta: technicalMeta,
  frontMatter: technicalFrontMatter,
  chapters: technicalChapters,
};
