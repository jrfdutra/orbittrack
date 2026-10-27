# Módulos funcionais

## 1. Distribuição dos 40 itens auditados

| Estado | Itens | Percentagem |
| --- | ---: | ---: |
| Implementada e validada | 0 | 0% |
| Implementada, mas não validada | 9 | 22,5% |
| Parcialmente implementada | 9 | 22,5% |
| Bloqueada ou com problemas | 11 | 27,5% |
| Planeada | 10 | 25% |
| Não confirmada | 1 | 2,5% |
| **Total** | **40** | **100%** |

A contagem é deliberadamente conservadora. Um ecrã com formulário não é uma
funcionalidade validada; um esqueleto de PDF não é um documento emitido.

## 2. Resumo por módulo

| Módulo | Itens | Estado dominante |
| --- | ---: | --- |
| Autenticação | 4 | 3 não validados, 1 bloqueado |
| Empresa | 2 | 1 não validado, 1 parcial |
| Estados | 1 | Não validado |
| Encomendas | 6 | 2 bloqueados, 2 planeados, 1 parcial, 1 não validado |
| Documentos | 4 | Todos parciais |
| Portal público | 4 | 1 bloqueado, 1 parcial, 1 planeado, 1 não validado |
| Passaporte | 2 | 1 bloqueado, 1 parcial |
| Certificação | 2 | 1 bloqueado, 1 planeado |
| QR | 1 | Planeado |
| Avaliações | 1 | Planeado |
| Dashboard | 3 | 1 bloqueado, 1 não validado, 1 planeado |
| Segurança | 4 | 2 bloqueados, 1 parcial, 1 não validado |
| Dados | 1 | Bloqueado |
| Build | 1 | Bloqueado |
| Qualidade | 2 | 1 planeado, 1 não confirmado |
| Conformidade | 1 | Planeado |
| Operações | 1 | Planeado |

## 3. Matriz completa

### 3.1 Autenticação

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Início de sessão com email e palavra-passe | Não validada | `src/pages/Login.tsx`; `src/contexts/AuthContext.tsx` (`signIn`) | Sem execução contra Supabase real; erro genérico |
| Registo de vendedor e criação automática da empresa | Não validada | `src/pages/Registar.tsx`; trigger `criar_empresa_para_utilizador` | Trigger frágil; `empresas.utilizador_id` sem UNIQUE |
| Recuperação de palavra-passe | **Bloqueada** | `AuthContext.resetPassword` → `/painel/redefinir-senha`; rota ausente em `src/App.tsx` | Link abre rota inexistente; não há formulário de nova palavra-passe |
| Proteção de rotas do painel | Não validada | `src/components/RotaProtegida.tsx`; `src/App.tsx` | Apenas cliente; sem testes de sessão expirada |

### 3.2 Empresa

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Perfil white-label: nome, descrição, contactos, cores e rodapé | Não validada | `src/pages/painel/EmpresaPerfil.tsx`; tabela `empresas` | Sem testes; validação só HTML; pré-visualização não é fiel |
| Upload de logótipo e foto de capa | Parcial | `EmpresaPerfil.tsx` (`handleFileUpload`); bucket `empresas` | Qualquer tipo/tamanho; bucket público; políticas por bucket |

### 3.3 Estados

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Configuração de estados por empresa (nome, cor, ordem, mensagem) | Não validada | `src/pages/painel/EstadosConfig.tsx`; `configuracao_estados`; trigger `criar_estados_padrao` | Sem UNIQUE; reordenação só persiste ao guardar; updates não transacionais |

### 3.4 Encomendas

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Listagem de encomendas | Não validada | `src/pages/painel/EncomendasLista.tsx` | Sem pesquisa, filtro, ordenação, paginação ou ações funcionais; carrega tudo |
| Criação de encomenda com itens | **Bloqueada** | `EncomendaForm.tsx`; `encomendas.numero_encomenda NOT NULL` | Formulário não envia o número; `gerar_numero_encomenda` não é chamada; inserção não transacional |
| Edição de encomenda | **Bloqueada** | `EncomendaForm.tsx` (`fetchEncomenda` vazio); rota `:id/editar` | A rota existe, mas não carrega nem atualiza dados |
| Atualização de estado com mensagem e fotos | Planeada | Tabelas `historico_estados` e `fotos_encomenda`; sem UI | Botões da lista sem handlers; histórico nunca é criado |
| Numeração sequencial de encomendas | Parcial | `gerar_numero_encomenda` em `schema.sql` | `MAX+1` inseguro sob concorrência; não usada |
| Pesquisa, filtros, ordenação e paginação | Planeada | `EncomendasLista.tsx` importa `Search`/`Filter` mas não os usa | Lista carrega todas as linhas |

### 3.5 Documentos

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Numeração de recibos | Parcial | `gerar_numero_recibo` em `schema.sql` | Sem UNIQUE em `numero_recibo`; sem UI de emissão |
| Código de verificação de certificado | Parcial | `gerar_codigo_verificacao`; tabela `certificados` | `RANDOM()` não criptográfico; sem retry; sem UI de emissão |
| Recibo em PDF | Parcial | `src/lib/pdfGenerators.ts` (`gerarReciboPDF`) | Esboço sem itens, marca, QR ou numeração; não é chamado |
| Certificado em PDF | Parcial | `src/lib/pdfGenerators.ts` (`gerarCertificadoPDF`) | Esboço sem marca, critérios, selo gráfico ou QR |

### 3.6 Portal público

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Página de acompanhamento por token | **Bloqueada** | `AcompanharEncomenda.tsx`; RLS sem políticas `anon` | Consulta tabelas diretamente; falha por RLS |
| RPC pública `obter_encomenda_publica` | Não validada | `schema.sql` (`SECURITY DEFINER`, grant a `anon`) | Não usada pela UI; sem `search_path`; sem rate limit; devolve IDs e URLs |
| Timeline, estado atual e previsão de entrega | Parcial | `AcompanharEncomenda.tsx` (UI); `historico_estados` | UI sem dados; previsão nula produz data inválida/1970 |
| Fotos, recibo, certificado, avaliação e contacto | Planeada | Tabelas e RPCs existem; UI não implementa | Página atual não mostra estas secções |

### 3.7 Passaporte

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Página pública da peça (`/peca/:tokenPeca`) | **Bloqueada** | `PecaPassaporte.tsx`; rota `:tokenPeca`, componente lê `token_peca` | Stub sem fetch; parâmetro incompatível; modelo placeholder |
| Visualizador 3D GLB/GLTF | Parcial | `src/components/viewer3d/Viewer3D.tsx` | Sem STL, fallback, loading ou integração funcional |

### 3.8 Certificação

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Verificação pública de certificado | **Bloqueada** | `VerificarCertificado.tsx`; RLS de `certificados`; RPC `verificar_certificado` | Consulta tabela como `anon`; ignora `:codigo`; não mostra empresa/data/selo |
| Emissão e template de certificado | Planeada | `certificados`; esboço em `pdfGenerators.ts` | Sem fluxo de emissão nem editor de template |

### 3.9 QR

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Geração de QR PNG/PDF e cartão de embalagem | Planeada | `qrcode.react` instalado; nenhuma importação | Sem geração nem download |

### 3.10 Avaliações

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Submissão pública de avaliação | Planeada | RPC `submeter_avaliacao`; tabela `avaliacoes` | Sem formulário; RPC não valida estado; sem rate limit; sem UNIQUE |

### 3.11 Dashboard

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Contagem total de encomendas | Não validada | `Dashboard.tsx` (`count: exact`) | Depende de sessão/RLS; sem testes ou filtro de período |
| Tempo médio de fabrico e avaliação média | **Bloqueada** | `Dashboard.tsx`: `tempoMedio: '3 dias'`, `avaliacaoMedia: 4.8` | Valores fixos, não calculados; não usar em demonstrações |
| Indicadores mensais e relatórios | Planeada | Sem código de agregação | Sem gráficos nem exportação |

### 3.12 Segurança

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Isolamento entre empresas por RLS | Não validada | Políticas em `schema.sql` para 9 tabelas | Sem testes; Storage não segue o mesmo modelo |
| Bucket privado e URLs assinadas | **Bloqueada** | Buckets `empresas` e `encomendas` com `public=true` | Ficheiros acessíveis por URL |
| Validação de uploads (tipo e tamanho) | **Bloqueada** | `utils.ts` define validadores; não são usados | Aceita qualquer ficheiro; sem limites |
| Funções RPC endurecidas | Parcial | RPCs `SECURITY DEFINER` | Sem `search_path`, validação robusta ou rate limit |

### 3.13 Dados, build, qualidade, conformidade e operações

| Funcionalidade | Estado | Evidência | Limitação |
| --- | --- | --- | --- |
| Seed de demonstração | **Bloqueada** | `supabase/seed.sql` | `utilizador_id` inexistente; falta `numero_encomenda`; falha |
| Build de produção | **Bloqueada** | `npm run build`; `npx vite build` | TS5101, `@apply btn` e erros de tipos; sem `dist/` |
| Testes automatizados | Planeada | Sem framework ou ficheiros de teste | Nenhuma validação automatizada |
| Acessibilidade WCAG 2.2 AA | Não confirmada | Labels presentes; botões de ícone sem `aria-label` | Sem auditoria; foco, contraste e leitores não validados |
| RGPD, privacidade e termos | Planeada | Sem páginas legais, retenção ou direitos | Dados pessoais sem base documental |
| Deploy Vercel com rewrites SPA | Planeada | Sem `vercel.json`; build falha | Rotas profundas devolveriam 404 |

## 4. O que pode ser demonstrado

| Demonstração | Pode mostrar? | Condição |
| --- | --- | --- |
| Layout, navegação e identidade | Sim | Sessão ativa; dados estáticos |
| Ecrãs de login e registo | Sim, com ressalva | Sem prometer autenticação validada |
| Formulário de empresa | Sim, com ressalva | Não guardar dados reais |
| Dashboard | Com ressalva | Identificar “3 dias” e “4.8” como valores fixos |
| Lista de encomendas | Com ressalva | Sem clicar nas ações |
| Criação/edição de encomenda | **Não** | Falha por `numero_encomenda`; edição vazia |
| Portal do comprador | **Não** | Bloqueado por RLS |
| Passaporte da peça | **Não** | Stub e parâmetro incompatível |
| Verificação de certificado | **Não** | Consulta bloqueada e ignora o código |
| Recibos, certificados e QR | **Não** | Esqueletos ou planeados |
| Avaliações | **Não** | Sem UI |

## 5. Dependências entre correções

```
Build (R-01)
  ├─ permite deploy e CI
  └─ facilita testes de tipos

RPCs + portal (R-02)
  ├─ depende de RPCs endurecidas (R-08)
  └─ depende de ficheiros privados (R-04/R-05)

Criação de encomenda (R-03)
  ├─ depende de numeração transacional (R-09)
  └─ depende de build para validar (R-01)

Testes RLS (R-07)
  ├─ depende de projeto Supabase de ensaio
  └─ bloqueia qualquer piloto com dados reais
```

## 6. Regra de classificação

Um item só passa a “Implementada e validada” quando existir:

1. código integrado e revisto;
2. ambiente real (Supabase de ensaio) com dados controlados;
3. teste reproduzível, automatizado ou documentado com evidência;
4. comportamento observado igual ao esperado, incluindo erros e estados vazios;
5. registo da execução (data, versão, ambiente, resultado).

Sem estes cinco elementos, o estado máximo é “Implementada, mas não validada”.
