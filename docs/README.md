# Documentação OrbitTrack

> ⚠️ **Documentação histórica — 27 de outubro de 2026.**
> Esta pasta regista uma auditoria estática feita nessa data e **não descreve o estado atual
> do produto**. Várias afirmações abaixo já não são verdadeiras (o build de produção passa, a
> criação de encomendas funciona, as páginas públicas usam RPC em vez de tabelas e o SPA tem
> rewrites na Vercel). Para a documentação atual, usa **[`manual/`](manual/README.md)**:
>
> - [Visão geral](manual/01-visao-geral.md)
> - [Guia do vendedor](manual/02-guia-vendedor.md)
> - [Guia do cliente](manual/03-guia-cliente.md)
> - [Referência das RPC](manual/04-referencia-rpc.md)
> - [Deploy e operação](manual/05-deploy-e-operacao.md)
>
> Os ficheiros seguintes mantêm-se como registo do processo de auditoria e da evolução do
> produto. Não devem ser citados como documentação operacional.

Ponto de entrada da documentação em Markdown do OrbitTrack. Os documentos desta pasta
resumem a auditoria estática de 27 de outubro de 2026 ao repositório local, ao esquema
SQL e aos comandos de build, lint e tipos. Servem para orientar correção, avaliação e
planeamento — não substituem os documentos formatados entregues em `../entrega/`.

> **Estado do produto à data da auditoria (histórico):** versão de avaliação. Nenhuma
> funcionalidade atingia o estado “Implementada e validada”. Na altura, o build de produção
> falhava, as páginas públicas estavam bloqueadas pela RLS, a criação de encomendas violava
> uma coluna `NOT NULL` e não existia qualquer teste automatizado.
>
> **Estado atual:** ver [`manual/01-visao-geral.md`](manual/01-visao-geral.md). O build
> (`tsc -b && vite build`) passa, o portal público consome quatro RPC `SECURITY DEFINER`, as
> encomendas são criadas com `gerar_numero_encomenda` e existe `vercel.json` com rewrite SPA.


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
| [manual/README.md](manual/README.md) | **Documentação atual da plataforma** (funcional, RPC, deploy). Começa aqui. |
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

> Aplicáveis ao conjunto de auditoria. A documentação atual em [`manual/`](manual/README.md)
> substitui estas regras e descreve o comportamento real do código.

1. Não afirmar que o comprador “acompanha em tempo real”: a página pública não lê dados.
2. Não afirmar que existem recibos, certificados ou QR funcionais: são esqueletos ou
   estão planeados.
3. Não usar “3 dias” nem “4.8” como métricas: são literais no código.
4. Não dizer que o produto está “pronto para Vercel”: o build falha e não há rewrites SPA.
5. Não afirmar isolamento entre empresas: a RLS não foi testada e o Storage é permissivo.
6. Não inventar clientes, preços, parcerias, certificações ou resultados.

## Manutenção

O conjunto de ficheiros desta pasta está **congelado** à data de 27/10/2026 e mantém-se por
valor histórico. Correções e evolução do produto passam a ser documentadas em `manual/`.

Sempre que uma correção for integrada, atualizar primeiro `../scripts/lib/audit-data.mjs`
(fonte de verdade), voltar a gerar os DOCX/PDF com `node scripts/build-docs.mjs` e
`scripts/export-docx.ps1`, e só depois alterar estes Markdown. Qualquer item só passa a
“Implementada e validada” com evidência de execução reproduzível.
