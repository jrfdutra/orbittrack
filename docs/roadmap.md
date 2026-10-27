# Roadmap e lacunas

## 1. Ponto de partida

O OrbitTrack tem uma base de produto coerente — modelo de dados multiempresa, painel,
portal público, passaporte e certificação — mas o estado real é de **protótipo com
bloqueios críticos**. Não é um produto comercializável.

| Indicador | Valor |
| --- | ---: |
| Itens auditados | 40 |
| Implementados e validados | 0 |
| Implementados, não validados | 9 |
| Parciais | 9 |
| Bloqueados | 11 |
| Planeados | 10 |
| Não confirmados | 1 |

## 2. Princípios do roadmap

1. **Primeiro tornar observável e seguro, depois acrescentar funcionalidades.**
2. Nenhuma fase avança com build vermelho ou RLS não testada.
3. Cada entrega tem critério de saída verificável, não uma data otimista.
4. Durante a Fase 0 e 1, usar apenas dados sintéticos.
5. Não prometer documentos, certificados ou métricas antes de existirem.
6. O esforço é relativo (S/M/L), não uma estimativa de calendário.

## 3. Fase 0 — Estabilização (P0)

**Objetivo:** tornar o produto executável, minimamente seguro e demonstrável com dados
controlados.

| # | Entrega | Esforço | Depende de | Critério de saída |
| --- | --- | --- | --- | --- |
| 0.1 | Corrigir build de produção | M | — | `npm run build` código 0; `dist/` gerado |
| 0.2 | Corrigir tipos, Tailwind e ícone `Cube` | S | — | `tsc` sem erros; CSS compila |
| 0.3 | Criar projeto Supabase de ensaio e executar schema | S | — | Schema aplicado sem erros; `pgcrypto` disponível |
| 0.4 | Suite de testes RLS com duas empresas | M | 0.3 | Operações cruzadas negadas; evidência arquivada |
| 0.5 | Tornar bucket `encomendas` privado e reescrever políticas | M | 0.3 | Acesso anónimo negado; URLs assinadas funcionam |
| 0.6 | Ligar portal público às RPCs | M | 0.3, 0.4 | `/acompanhar/:token` mostra dados mínimos; token inválido tem erro |
| 0.7 | Ligar verificação de certificado à RPC e ao `:codigo` | S | 0.3, 0.4 | Código válido e inválido com resultados distintos |
| 0.8 | Criação de encomenda transacional com numeração | M | 0.1, 0.3 | Encomenda com 2 itens criada; número `AAAA-NNNN`; rollback em falha |
| 0.9 | Corrigir `PecaPassaporte` (`tokenPeca`) e consumir RPC | S | 0.3, 0.6 | Página abre com peça, empresa e certificado |
| 0.10 | Corrigir seed ou removê-lo do fluxo | S | 0.3 | Seed idempotente ou documentado como indisponível |
| 0.11 | `vercel.json` com rewrite SPA | S | 0.1 | Rotas profundas abrem em preview |

**Saída da Fase 0:** build verde, RLS provada, portal e criação de encomenda funcionais
em ambiente de ensaio, ficheiros de encomenda privados. Ainda **não** é um piloto
comercial: faltam recuperação de palavra-passe, validação de uploads, CI e conformidade.

## 4. Fase 1 — Piloto controlado (P1)

**Objetivo:** permitir um piloto assistido com uma oficina, dados sintéticos e âmbito
restrito.

| # | Entrega | Esforço | Depende de | Critério de saída |
| --- | --- | --- | --- | --- |
| 1.1 | Recuperação de palavra-passe completa | S | 0.1 | Email → nova palavra-passe → login |
| 1.2 | Validação de uploads (cliente + Storage) | S | 0.5 | `.exe` e excesso de tamanho rejeitados |
| 1.3 | Numeração concorrente segura | M | 0.8 | 50 criações simultâneas sem duplicados |
| 1.4 | UNIQUE e CHECKs em falta | S | 0.3 | Migração aplicada; dados inválidos rejeitados |
| 1.5 | Edição de encomenda | M | 0.8 | Carrega, altera e guarda com itens |
| 1.6 | Atualização de estado com mensagem e foto | M | 0.8 | Histórico e foto visíveis no portal |
| 1.7 | Dashboard com métricas reais | S | 0.8 | Remove literais; calcula ou mostra “sem dados” |
| 1.8 | CI com build, lint, testes e RLS | M | 0.1, 0.4 | Pipeline bloqueia merge com falha |
| 1.9 | Testes E2E dos fluxos críticos | M | 1.5–1.7 | E01–E15 verdes em preview |
| 1.10 | Política de privacidade, termos e retenção | L | Aconselhamento jurídico | Documentos publicados e aceites no registo |
| 1.11 | Acessibilidade base | M | 0.1 | `lang="pt-PT"`, `aria-label`, foco visível, axe sem críticos |
| 1.12 | Observabilidade mínima | S | 0.1 | Erros de browser e funções monitorizados |

**Saída da Fase 1:** um piloto assistido, com contrato de ensaio, dados sintéticos ou
autorizados, backup, rollback e suporte definido. Ainda sem prometer SLA ou autosserviço.

## 5. Fase 2 — MVP comercial (P2)

**Objetivo:** completar a proposta de valor e reduzir dependência de trabalho manual.

| # | Entrega | Esforço | Depende de | Critério de saída |
| --- | --- | --- | --- | --- |
| 2.1 | QR PNG/PDF e cartão de embalagem | M | 0.6 | QR legível abre o portal correto |
| 2.2 | Recibo PDF com marca e numeração | M | 1.3, 1.4 | PDF com itens, totais, marca e número único |
| 2.3 | Emissão de certificado com código seguro | M | 1.4, 2.2 | Código CSPRNG, único, com retry |
| 2.4 | Template de certificado por empresa | L | 2.3 | Cores, logótipo, critérios e selo |
| 2.5 | PDF de certificado com QR de verificação | M | 2.3, 2.4 | PDF verificável por leitura do QR |
| 2.6 | Avaliações com UI e regras | M | 1.6 | Uma avaliação por encomenda; moderação |
| 2.7 | Pesquisa, filtros, ordenação e paginação | M | 1.5 | Lista server-side com 1.000 registos |
| 2.8 | Rate limiting nas RPCs | M | 0.6 | Limite por IP/token testado |
| 2.9 | Auditoria de negócio | M | 1.6 | Eventos críticos registados e consultáveis |
| 2.10 | Backups, restauro e runbook | M | 0.3 | Restauro testado e documentado |
| 2.11 | Painel de indicadores mensais | M | 1.7 | Receita, volume, tempo médio e avaliação |
| 2.12 | Revisão de segurança independente | L | 0.4, 0.5, 2.8 | Relatório sem críticos abertos |

**Saída da Fase 2:** MVP comercial com documentos, certificação, avaliações e operação
suportada. Preço, SLA e contrato dependem de validação comercial e jurídica.

## 6. Mapa de riscos para entregas

| Risco | Entrega que o resolve | Fase |
| --- | --- | --- |
| R-01 Build bloqueado | 0.1, 0.2 | 0 |
| R-02 Portal bloqueado por RLS | 0.6, 0.7 | 0 |
| R-03 Criação de encomenda falha | 0.8 | 0 |
| R-04 Buckets públicos | 0.5 | 0 |
| R-05 Storage permissivo | 0.5 | 0 |
| R-06 Recuperação bloqueada | 1.1 | 1 |
| R-07 Sem testes RLS | 0.4 | 0 |
| R-08 RPCs sem `search_path` | 0.6, 2.8 | 0/2 |
| R-09 Numeração concorrente | 1.3 | 1 |
| R-10 Código de certificado fraco | 2.3 | 2 |
| R-11 Seed inválido | 0.10 | 0 |
| R-12 Métricas fixas | 1.7 | 1 |
| R-13 Uploads sem validação | 1.2 | 1 |
| R-14 Sem rate limiting | 2.8 | 2 |
| R-15 Sem testes/CI | 1.8, 1.9 | 1 |
| R-16 Sem rewrites SPA | 0.11 | 0 |
| R-17 Sem conformidade RGPD | 1.10 | 1 |
| R-18 Sem auditoria | 2.9 | 2 |
| R-19 Sem paginação | 2.7 | 2 |
| R-20 Acessibilidade não validada | 1.11 | 1 |

## 7. O que não fazer agora

- Não construir editor de templates antes de existir emissão de certificados.
- Não investir em gráficos de dashboard antes de corrigir as métricas e a criação de
  encomendas.
- Não abrir registo público sem rate limiting, confirmação de email e política de
  privacidade.
- Não prometer STL no visualizador sem `STLLoader`, fallback e testes.
- Não migrar para multi-tenant avançado (equipas, permissões, faturação) antes de a RLS
  estar provada.
- Não contratar infraestrutura ou tráfego pago antes de um piloto assistido.

## 8. Decisões necessárias

| Decisão | Responsável | Impacto |
| --- | --- | --- |
| Âmbito do piloto: uma empresa ou várias? | Produto | Complexidade de RLS, suporte e onboarding |
| Certificado: classificação da oficina ou selo independente? | Produto/Jurídico | Comunicação e responsabilidade |
| Preço e modelo comercial | Direção | Proposta, contrato e custos |
| Alojamento de ficheiros e retenção | Técnico/Jurídico | RGPD, custos e backups |
| Política de palavras-passe e MFA | Segurança | Experiência e risco |
| Nível de suporte e SLA | Operações | Custos e expectativas |
| Idioma e mercados iniciais | Produto | Conteúdo, fiscalidade e suporte |

## 9. Critérios de release

### Gate 0 — Demonstrável

- Build verde.
- RLS testada com duas empresas.
- Portal, passaporte, verificação e criação de encomenda funcionam em ensaio.
- Bucket de encomendas privado.

### Gate 1 — Piloto

- Recuperação de palavra-passe completa.
- Uploads validados.
- CI e E2E verdes.
- Privacidade, termos e retenção publicados.
- Backup e rollback testados.
- Suporte e âmbito escrito.

### Gate 2 — Comercial

- Documentos e certificados emitidos com marca.
- QR verificado.
- Avaliações e paginação.
- Rate limiting e auditoria.
- Revisão de segurança independente.
- SLA, preço e contrato definidos.

## 10. Nota final

Este roadmap não tem datas porque não existe equipa, velocidade medida, orçamento ou
disponibilidade confirmados. Qualquer prazo apresentado sem essas variáveis seria
invenção. O esforço S/M/L é relativo e deve ser reestimado após a Fase 0, quando o
ambiente real revelar problemas que a análise estática não deteta.
