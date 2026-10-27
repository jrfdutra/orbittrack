# OrbitTrack — Roadmap e Lacunas

**Versão:** 1.0  
**Data:** 27 de outubro de 2026  
**Classificação:** Confidencial · uso interno e avaliação  
**Âmbito:** auditoria estática do repositório, esquema SQL, build, lint, tipos e dependências

---

## 1. Sumário executivo

O OrbitTrack é uma aplicação web SaaS white-label para oficinas de impressão 3D. O
vendedor gere encomendas num painel privado; o comprador acompanha o trabalho através de
um link secreto, sem criar conta. A visão inclui passaporte digital da peça, certificado
de autenticidade verificável, recibos em PDF e QR codes.

A auditoria encontrou uma base coerente — React, TypeScript, Tailwind, Supabase, modelo
multiempresa, RLS, RPCs públicas e ecrãs principais — mas também bloqueios que impedem
qualquer utilização comercial:

- O **build de produção falha** (TS5101, Tailwind e erros de tipos), pelo que não existe
  artefacto para Vercel.
- As **páginas públicas não conseguem ler dados**: consultam tabelas sujeitas a RLS com
  a chave `anon`, sem políticas para `anon`. As RPCs seguras existem, mas não são usadas.
- A **criação de encomendas falha**: `numero_encomenda` é `NOT NULL` e o formulário não o
  envia; a função de numeração não é chamada.
- Os **buckets de Storage são públicos** e as políticas só verificam `bucket_id`, pelo que
  ficheiros de encomendas ficam expostos e qualquer utilizador autenticado pode escrever
  ou apagar em qualquer pasta.
- **Não existe um único teste automatizado**, CI ou teste de isolamento entre empresas.
- A **recuperação de palavra-passe** redireciona para uma rota inexistente.

**Conclusão:** o OrbitTrack está num estado de protótipo avançado, não de produto
operacional. Nenhum dos 40 itens auditados atinge “Implementada e validada”. A comunicação
comercial deve ser de avaliação técnica, não de disponibilidade.

---

## 2. Método e limites

### 2.1 O que foi feito

- Leitura integral de `src/`, `supabase/schema.sql` e `supabase/seed.sql`.
- Revisão de rotas, chamadas Supabase, RLS, RPCs, triggers e políticas de Storage.
- Execução de `npm run build`, `npx vite build`, `npx tsc`, `npm run lint` e `npm audit`.
- Verificação dos documentos gerados (72 páginas técnicas, 28 páginas de manual).

### 2.2 O que não foi feito

- Nenhum projeto Supabase real foi executado.
- Nenhum teste de runtime, RLS, carga, segurança ofensiva ou dispositivo real.
- Nenhum dado de cliente, métrica de produção ou preço foi observado.
- Nenhuma correção de código foi aplicada: o âmbito é documentação.

Por isso, todas as afirmações descrevem o código e o esquema, não comportamento observado.

---

## 3. Estado em números

| Estado | Itens | Leitura |
| --- | ---: | --- |
| Implementada e validada | **0** | Não há testes nem validação em execução |
| Implementada, mas não validada | 9 | Código presente, sem prova ponta a ponta |
| Parcialmente implementada | 9 | Parte do fluxo existe; faltam peças essenciais |
| Bloqueada ou com problemas | 11 | Falha confirmada ou impede o fluxo |
| Planeada | 10 | Não existe implementação |
| Não confirmada | 1 | Evidência insuficiente (acessibilidade) |
| **Total** | **40** | — |

### Legenda

- **Validada** exige código, ambiente real e teste reproduzível.
- **Não validada** significa que o código existe, mas não foi provado.
- **Parcial** significa que só parte do fluxo existe.
- **Bloqueada** significa falha confirmada.
- **Planeada** significa que não há implementação.
- **Não confirmada** significa que falta evidência para classificar.

---

## 4. O que existe hoje

| Área | O que está no código | Limite principal |
| --- | --- | --- |
| Autenticação | Login, registo, logout, contexto de sessão | Não validado; recuperação bloqueada |
| Empresa | Perfil, contactos, cores, logótipo e capa | Uploads sem validação; bucket público |
| Estados | Editor de estados com nome, cor, ordem e mensagem | Sem unicidade; persistência não transacional |
| Encomendas | Lista e formulário de criação/edição | Criação falha; edição vazia; ações inertes |
| Dashboard | Três cartões | “3 dias” e “4.8” são valores fixos |
| Portal público | Interface de acompanhamento | Consulta bloqueada por RLS; sem dados |
| Passaporte | Página e visualizador GLB/GLTF | Stub; parâmetro incompatível; sem STL |
| Certificação | Tabela, RPC e página de verificação | Página bloqueada e ignora o código |
| Documentos | Esqueletos jsPDF | Sem emissão, marca, numeração ou QR |
| QR | Biblioteca instalada | Não é usada |
| Avaliações | Tabela e RPC | Sem formulário |
| Segurança | RLS em 9 tabelas, RPCs `SECURITY DEFINER` | Sem testes; Storage permissivo |
| Dados | Esquema com 9 tabelas e funções | Sem `pgcrypto` explícito; seed inválido |
| Build/operações | Vite, scripts | Build falha; sem CI, rewrites ou Git |

---

## 5. Lacunas críticas (P0)

Estas lacunas impedem qualquer piloto, mesmo assistido.

### 5.1 Build de produção bloqueado

- **Evidência:** `npm run build` falha com TS5101 (`baseUrl`); `npx vite build` falha com
  `Cannot apply unknown utility class 'btn'`; `tsc` reporta erros em `import.meta.env`,
  `index.css` e no ícone `Cube`.
- **Impacto:** não há `dist/`, não há deploy fiável, não há verificação de tipos.
- **Critério de conclusão:** `npm run build` termina com código 0 e gera `dist/`.

### 5.2 Portal público bloqueado pela RLS

- **Evidência:** `AcompanharEncomenda.tsx` e `VerificarCertificado.tsx` consultam tabelas
  como `anon`; não existem políticas `anon`. As RPCs `obter_encomenda_publica`,
  `obter_peca_publica` e `verificar_certificado` existem, mas não são chamadas.
- **Impacto:** o comprador não vê a encomenda nem confirma certificados.
- **Critério de conclusão:** link válido mostra dados mínimos via RPC; token inválido
  mostra erro controlado.

### 5.3 Criação de encomenda falha

- **Evidência:** `EncomendaForm.tsx` não envia `numero_encomenda`; a coluna é `NOT NULL`;
  `gerar_numero_encomenda()` não é usada. A inserção de encomenda e itens não é
  transacional.
- **Impacto:** o fluxo central do vendedor não funciona e podem ficar encomendas sem itens.
- **Critério de conclusão:** criar encomenda com duas peças, com número `AAAA-NNNN` e
  rollback em caso de falha.

### 5.4 Ficheiros de encomendas expostos

- **Evidência:** buckets `empresas` e `encomendas` com `public=true`; políticas de Storage
  apenas com `bucket_id`; sem validação de tipo/tamanho.
- **Impacto:** fotos, modelos 3D e documentos acessíveis por URL; escrita e eliminação
  cruzadas entre empresas.
- **Critério de conclusão:** acesso anónimo a ficheiro de encomenda devolve 400/403;
  segundo utilizador não escreve na pasta do primeiro; `.exe` e excesso de tamanho
  rejeitados.

### 5.5 Isolamento entre empresas não provado

- **Evidência:** RLS ativa nas 9 tabelas, mas sem testes com dois utilizadores; sem CI.
- **Impacto:** não é possível afirmar que os dados estão isolados. É o risco mais grave
  para um SaaS multiempresa.
- **Critério de conclusão:** suite com dois utilizadores e duas empresas cobre SELECT,
  INSERT, UPDATE, DELETE e Storage, toda verde.

### 5.6 Sem build, sem testes, sem CI

- **Evidência:** `package.json` sem script `test`; sem `.github/workflows`; lint com ~40
  avisos; `npm audit` com 1 vulnerabilidade alta (`image-size` via `pptxgenjs`).
- **Impacto:** regressões entram sem deteção; o build já está quebrado.
- **Critério de conclusão:** pipeline bloqueia merge com build, lint, testes ou RLS
  falhados.

---

## 6. Lacunas importantes (P1)

| Lacuna | Evidência | Impacto | Critério de conclusão |
| --- | --- | --- | --- |
| Recuperação de palavra-passe incompleta | Redireciona para `/painel/redefinir-senha`, rota ausente | Utilizador bloqueado | Email → nova palavra-passe → login |
| Numeração concorrente insegura | `MAX+1` em `gerar_numero_encomenda` e `gerar_numero_recibo` | Duplicados sob carga | 50 criações simultâneas sem duplicados |
| Recibos sem UNIQUE | `numero_recibo` sem constraint | Documentos duplicados | Constraint e fluxo de emissão |
| Código de certificado fraco | `RANDOM()`, sem retry | Menor entropia e colisões | CSPRNG e retry |
| Edição de encomenda vazia | `fetchEncomenda` stub | Não corrige nem atualiza | Carrega e guarda com itens |
| Estado não atualizável | Sem UI; botões sem handlers | Portal nunca recebe histórico | Atualização transacional com mensagem/foto |
| Dashboard com métricas fixas | “3 dias” e “4.8” literais | Decisões com dados falsos | Métricas calculadas ou “sem dados” |
| Seed inválido | `utilizador_id` inexistente; falta número | Demonstração não reproduzível | Seed idempotente |
| Sem rewrites SPA | Sem `vercel.json` | 404 em rotas profundas | Rewrite e teste em preview |
| Sem conformidade RGPD | Sem privacidade, termos ou retenção | Risco jurídico e de confiança | Documentos publicados e aceites |
| Acessibilidade não validada | `lang="en"`, ícones sem `aria-label` | Barreiras e incumprimento | axe/Lighthouse sem críticos |
| Sem observabilidade | Apenas `console.error` e `alert()` | Incidentes invisíveis | Erros monitorizados com alertas |

---

## 7. Planeado e ainda não iniciado (P2)

- QR PNG/PDF e cartão de embalagem.
- Recibo PDF com marca, itens, totais e numeração única.
- Emissão de certificado e template por empresa.
- PDF de certificado com QR de verificação.
- Formulário público de avaliação com regras.
- Pesquisa, filtros, ordenação e paginação.
- Rate limiting nas RPCs.
- Auditoria de negócio.
- Backups, restauro e runbook.
- Indicadores mensais e relatórios.
- Revisão de segurança independente.

Nada nesta lista deve ser comunicado como disponível.

---

## 8. Roadmap por fases

### Fase 0 — Estabilização

**Objetivo:** tornar o produto executável, minimamente seguro e demonstrável com dados
controlados.

| Entrega | Esforço | Critério de saída |
| --- | --- | --- |
| Corrigir build e tipos | M | `npm run build` verde; `dist/` gerado |
| Projeto Supabase de ensaio | S | Schema aplicado; `pgcrypto` disponível |
| Testes RLS com duas empresas | M | Operações cruzadas negadas; evidência |
| Bucket privado e políticas por empresa | M | Acesso anónimo negado; URLs assinadas |
| Portal, passaporte e verificação via RPC | M | Dados mínimos; erros controlados |
| Criação de encomenda transacional | M | Número e itens corretos; rollback |
| Seed corrigido | S | Idempotente ou removido |
| Rewrites SPA | S | Rotas profundas em preview |

**Saída:** build verde, RLS provada, fluxo central demonstrável em ensaio. Ainda não é
piloto comercial.

### Fase 1 — Piloto controlado

**Objetivo:** permitir um piloto assistido com uma oficina, dados sintéticos e âmbito
restrito.

| Entrega | Esforço | Critério de saída |
| --- | --- | --- |
| Recuperação de palavra-passe | S | Fluxo completo |
| Validação de uploads | S | Tipo/tamanho rejeitados |
| Numeração concorrente segura | M | 50 criações sem duplicados |
| Constraints e CHECKs | S | Dados inválidos rejeitados |
| Edição de encomenda | M | Carrega e guarda |
| Atualização de estado com foto | M | Histórico visível no portal |
| Dashboard real | S | Sem literais |
| CI + E2E | M | Pipeline bloqueia regressões |
| RGPD, termos e retenção | L | Documentos publicados |
| Acessibilidade base | M | Sem críticos axe |
| Observabilidade | S | Erros monitorizados |

**Saída:** piloto com contrato de ensaio, backup, rollback e suporte definido.

### Fase 2 — MVP comercial

**Objetivo:** completar a proposta de valor e reduzir trabalho manual.

| Entrega | Esforço | Critério de saída |
| --- | --- | --- |
| QR e cartão de embalagem | M | QR abre o portal correto |
| Recibo PDF | M | Itens, totais, marca e número único |
| Emissão de certificado | M | Código CSPRNG, único, com retry |
| Template de certificado | L | Marca, critérios e selo |
| PDF de certificado com QR | M | Verificação por leitura |
| Avaliações com UI | M | Uma por encomenda |
| Pesquisa e paginação | M | 1.000 registos com desempenho aceitável |
| Rate limiting | M | Limite testado |
| Auditoria de negócio | M | Eventos consultáveis |
| Backups e runbook | M | Restauro testado |
| Revisão de segurança | L | Sem críticos abertos |

**Saída:** MVP comercial com documentos, certificação e operação suportada. Preço, SLA e
contrato dependem de validação comercial e jurídica.

---

## 9. Sequência e dependências

```
Build verde
  ├─ permite deploy e CI
  └─ permite validar tipos

Supabase de ensaio
  ├─ testes RLS
  ├─ RPCs e portal
  └─ criação de encomenda

RLS provada + Storage privado
  └─ condição para qualquer dado real

Criação de encomenda
  ├─ numeração segura
  ├─ edição
  └─ atualização de estado

Documentos
  ├─ recibo
  ├─ certificado
  └─ QR
```

Nenhuma fase deve avançar com build vermelho ou RLS não testada. A ordem não é
negociável: segurança e observabilidade antes de funcionalidades visíveis.

---

## 10. Critérios de release

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

---

## 11. Riscos principais

| ID | Risco | Prioridade | Critério de conclusão |
| --- | --- | --- | --- |
| R-01 | Build bloqueado | P0 | `npm run build` verde |
| R-02 | Portal bloqueado por RLS | P0 | Dados via RPC; erros controlados |
| R-03 | Criação de encomenda falha | P0 | Número e itens corretos |
| R-04 | Buckets públicos | P0 | Acesso anónimo negado |
| R-05 | Storage permissivo | P0 | Sem escrita cruzada |
| R-07 | Sem testes RLS | P0 | Suite com duas empresas |
| R-06 | Recuperação bloqueada | P1 | Fluxo completo |
| R-08 | RPCs sem `search_path` | P1 | Linter e testes verdes |
| R-09 | Numeração concorrente | P1 | 50 criações sem duplicados |
| R-10 | Código de certificado fraco | P2 | CSPRNG e retry |
| R-11 | Seed inválido | P1 | Idempotente |
| R-12 | Métricas fixas | P1 | Cálculo real ou “sem dados” |
| R-13 | Uploads sem validação | P1 | Tipo/tamanho rejeitados |
| R-14 | Sem rate limiting | P2 | Limite testado |
| R-15 | Sem testes/CI | P1 | Pipeline bloqueia regressões |
| R-16 | Sem rewrites SPA | P1 | Rotas profundas funcionam |
| R-17 | Sem RGPD | P1 | Documentos publicados |
| R-18 | Sem auditoria | P2 | Eventos registados |
| R-19 | Sem paginação | P2 | 1.000 registos |
| R-20 | Acessibilidade | P2 | Sem críticos |

---

## 12. Decisões necessárias

| Decisão | Impacto |
| --- | --- |
| Piloto com uma ou várias empresas | Complexidade de RLS, suporte e onboarding |
| Certificado da oficina ou selo independente | Comunicação, responsabilidade e jurídico |
| Preço e modelo comercial | Proposta, contrato e custos |
| Alojamento e retenção de ficheiros | RGPD, custos e backups |
| Política de palavras-passe e MFA | Segurança e experiência |
| Nível de suporte e SLA | Custos e expectativas |
| Mercados e idiomas iniciais | Conteúdo, fiscalidade e suporte |

---

## 13. O que não afirmar

- “O comprador acompanha em tempo real.” — a página pública não lê dados.
- “Já emitimos recibos e certificados.” — são esqueletos.
- “Está pronto para a Vercel.” — o build falha e faltam rewrites.
- “Temos testes.” — não existe um único teste.
- “O tempo médio é de 3 dias.” — é um literal no código.
- “Os dados estão isolados entre empresas.” — a RLS não foi testada.
- “Temos certificação de autenticidade.” — o selo é atribuído pela oficina.

---

## 14. Próximo passo recomendado

1. Corrigir o build e criar o projeto Supabase de ensaio.
2. Escrever a suite RLS com duas empresas e fechar os buckets.
3. Ligar portal, passaporte e verificação às RPCs.
4. Tornar a criação de encomendas transacional.
5. Só depois planear o piloto, com âmbito, suporte e contrato escritos.

**Mensagem recomendada:** “O OrbitTrack está em avaliação técnica. O painel e o conceito
de acompanhamento já têm interface, mas os fluxos públicos, a criação de encomendas e os
documentos estão a ser concluídos. Não usamos dados reais nem prometemos disponibilidade
nesta fase.”

---

## Anexo — Matriz dos 40 itens

| # | Módulo | Item | Estado |
| ---: | --- | --- | --- |
| 1 | Autenticação | Login com email e palavra-passe | Não validada |
| 2 | Autenticação | Registo e criação automática da empresa | Não validada |
| 3 | Autenticação | Recuperação de palavra-passe | Bloqueada |
| 4 | Autenticação | Proteção de rotas do painel | Não validada |
| 5 | Empresa | Perfil white-label | Não validada |
| 6 | Empresa | Upload de logótipo e capa | Parcial |
| 7 | Estados | Configuração de estados | Não validada |
| 8 | Encomendas | Listagem | Não validada |
| 9 | Encomendas | Criação com itens | Bloqueada |
| 10 | Encomendas | Edição | Bloqueada |
| 11 | Encomendas | Atualização de estado com mensagem e fotos | Planeada |
| 12 | Encomendas | Numeração sequencial | Parcial |
| 13 | Encomendas | Pesquisa, filtros, ordenação e paginação | Planeada |
| 14 | Documentos | Numeração de recibos | Parcial |
| 15 | Documentos | Código de verificação | Parcial |
| 16 | Documentos | Recibo PDF | Parcial |
| 17 | Documentos | Certificado PDF | Parcial |
| 18 | Portal público | Acompanhamento por token | Bloqueada |
| 19 | Portal público | RPC `obter_encomenda_publica` | Não validada |
| 20 | Portal público | Timeline, estado e previsão | Parcial |
| 21 | Portal público | Fotos, recibo, certificado, avaliação e contacto | Planeada |
| 22 | Passaporte | Página da peça | Bloqueada |
| 23 | Passaporte | Visualizador 3D GLB/GLTF | Parcial |
| 24 | Certificação | Verificação pública | Bloqueada |
| 25 | Certificação | Emissão e template | Planeada |
| 26 | QR | QR PNG/PDF e cartão | Planeada |
| 27 | Avaliações | Submissão pública | Planeada |
| 28 | Dashboard | Contagem total | Não validada |
| 29 | Dashboard | Tempo médio e avaliação média | Bloqueada |
| 30 | Dashboard | Indicadores mensais | Planeada |
| 31 | Segurança | Isolamento por RLS | Não validada |
| 32 | Segurança | Bucket privado e URLs assinadas | Bloqueada |
| 33 | Segurança | Validação de uploads | Bloqueada |
| 34 | Segurança | RPCs endurecidas | Parcial |
| 35 | Dados | Seed de demonstração | Bloqueada |
| 36 | Build | Build de produção | Bloqueada |
| 37 | Qualidade | Testes automatizados | Planeada |
| 38 | Qualidade | Acessibilidade WCAG 2.2 AA | Não confirmada |
| 39 | Conformidade | RGPD, privacidade e termos | Planeada |
| 40 | Operações | Deploy Vercel com rewrites | Planeada |

---

*Documento produzido a partir de código e esquema reais. Não foram inventados clientes,
métricas, preços, certificações ou resultados de testes. As funcionalidades planeadas
estão identificadas como tal e as limitações não foram suavizadas.*
