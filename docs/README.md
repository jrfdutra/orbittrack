# Documentação OrbitTrack

Ponto de entrada da documentação em Markdown do OrbitTrack. Os documentos desta pasta
resumem a auditoria estática de 27 de outubro de 2026 ao repositório local, ao esquema
SQL e aos comandos de build, lint e tipos. Servem para orientar correção, avaliação e
planeamento — não substituem os documentos formatados entregues em `../entrega/`.

> **Estado do produto:** versão de avaliação. Nenhuma funcionalidade atinge o estado
> “Implementada e validada”. O build de produção falha, as páginas públicas estão
> bloqueadas pela RLS, a criação de encomendas viola uma coluna `NOT NULL` e não existe
> qualquer teste automatizado. O produto **não** deve ser apresentado como operacional,
> pronto para produção ou “pronto para Vercel”.

## Como foi produzida esta documentação

- Leitura integral de `src/`, `supabase/schema.sql` e `supabase/seed.sql`.
- Execução de `npm run build`, `npx vite build`, `npx tsc` com opções de compatibilidade,
  `npm run lint` e `npm audit`.
- Revisão de rotas em `src/App.tsx`, chamadas ao Supabase, políticas RLS, RPCs, triggers
  e políticas de Storage.
- **Não** houve acesso a um projeto Supabase em execução, a dados reais, a clientes ou a
  métricas de produção. Nenhum resultado descreve comportamento observado em runtime.

## Legenda de estados

| Estado | Significado |
| --- | --- |
| Implementada e validada | Código, ambiente real e teste reproduzível. **Nenhum item.** |
| Implementada, mas não validada | O código existe, mas não foi provado ponta a ponta. |
| Parcialmente implementada | Existe parte do fluxo; faltam peças essenciais. |
| Planeada | Não existe implementação; apenas modelo, dependência ou intenção. |
| Bloqueada ou com problemas | O código existe, mas falha de forma confirmada ou impede o fluxo. |
| Não confirmada | Evidência insuficiente para classificar. |

Distribuição dos 40 itens auditados: **0 validadas**, **9 não validadas**, **9 parciais**,
**11 bloqueadas**, **10 planeadas** e **1 não confirmada**.

## Documentos

| Documento | Conteúdo |
| --- | --- |
| [architecture.md](architecture.md) | Stack, rotas, fluxo de autenticação, organização do código, dependências e limites arquiteturais. |
| [database.md](database.md) | Nove tabelas, relações, RPCs, triggers, Storage e problemas de integridade. |
| [security.md](security.md) | RLS, exposição de ficheiros, validação de uploads, RPCs, autenticação e conformidade. |
| [functional-modules.md](functional-modules.md) | Matriz completa dos 40 itens, agrupada por módulo, com evidência e limitações. |
| [deployment.md](deployment.md) | Setup local, Supabase, build, Vercel, checklist e bloqueios atuais. |
| [testing.md](testing.md) | Estado dos testes, verificações executadas, estratégia e critérios de aceitação. |
| [roadmap.md](roadmap.md) | Fases P0/P1/P2, dependências, esforço e critérios de saída. |

Documento autónomo para partilha externa:
[`../entrega/OrbitTrack_Roadmap_e_Lacunas.md`](../entrega/OrbitTrack_Roadmap_e_Lacunas.md).

## Entregáveis formatados

- `../entrega/OrbitTrack_Apresentacao_Comercial.pptx` e `.pdf` — 21 slides, 16:9, com
  notas do orador.
- `../entrega/OrbitTrack_Documentacao_Tecnica.docx` e `.pdf` — 72 páginas, 18 capítulos.
- `../entrega/OrbitTrack_Manual_de_Utilizador.docx` e `.pdf` — 28 páginas, guia de avaliação.
- `../entrega/OrbitTrack_Roadmap_e_Lacunas.md` — este roadmap em formato autónomo.
- `../entrega/logo/` — ícone, logótipo, variantes escuras, PNGs e QR de exemplo.

## Regras de comunicação

1. Não afirmar que o comprador “acompanha em tempo real”: a página pública não lê dados.
2. Não afirmar que existem recibos, certificados ou QR funcionais: são esqueletos ou
   estão planeados.
3. Não usar “3 dias” nem “4.8” como métricas: são literais no código.
4. Não dizer que o produto está “pronto para Vercel”: o build falha e não há rewrites SPA.
5. Não afirmar isolamento entre empresas: a RLS não foi testada e o Storage é permissivo.
6. Não inventar clientes, preços, parcerias, certificações ou resultados.

## Manutenção

Sempre que uma correção for integrada, atualizar primeiro `../scripts/lib/audit-data.mjs`
(fonte de verdade), voltar a gerar os DOCX/PDF com `node scripts/build-docs.mjs` e
`scripts/export-docx.ps1`, e só depois alterar estes Markdown. Qualquer item só passa a
“Implementada e validada” com evidência de execução reproduzível.
