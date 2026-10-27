# Testes e qualidade

## 1. Estado atual

**Não existe qualquer teste automatizado no produto.** `package.json` não tem script
`test`, não há ficheiros `*.test.*` ou `*.spec.*`, não existe configuração de Vitest,
Playwright, Jest ou Testing Library, e não há pipeline de CI.

Consequência direta: **nenhuma funcionalidade atinge o estado “Implementada e
validada”**. A documentação distingue código existente de comportamento comprovado.

## 2. Verificações executadas na auditoria

| Comando | Resultado | Observação |
| --- | --- | --- |
| `npm run build` | **Falha** | `TS5101`: opção `baseUrl` deprecated |
| `npx vite build` | **Falha** | `Cannot apply unknown utility class 'btn'` |
| `npx tsc ... --ignoreDeprecations 6.0` | 3 erros | `import.meta.env`, `index.css`, ícone `Cube` |
| `npm run lint` | Código 0, ~40 avisos | Não bloqueia, mas há dívida de qualidade |
| `npm audit` | 1 vulnerabilidade alta | `image-size` via `pptxgenjs` (ferramenta de Materiais) |
| `node scripts/render-logo.mjs` | Sucesso | Logótipo e variantes gerados |
| `node scripts/render-qr.mjs` | Sucesso | QR de exemplo gerado |
| `node scripts/build-docs.mjs` | Sucesso | DOCX técnico e manual gerados |
| `scripts/export-docx.ps1` | Sucesso | PDFs exportados: 72 e 28 páginas |

As verificações de documentos e imagens validam os **entregáveis**, não o produto. Não
provam autenticação, RLS, criação de encomendas ou portal público.

## 3. O que não foi testado

- Execução contra um projeto Supabase real.
- Registo, confirmação de email, login, sessão expirada e logout.
- Isolamento de dados entre duas empresas.
- Criação, edição e listagem de encomendas.
- Atualização de estado, histórico e fotos.
- Portal público, passaporte e verificação de certificado.
- Emissão de recibo/certificado e leitura de QR.
- Uploads, limites, tipos e acesso a ficheiros.
- Dispositivos reais, navegadores antigos, teclado e leitores de ecrã.
- Desempenho, carga, concorrência, backups e recuperação.
- Configuração de Vercel, rewrites, CSP e cache.

## 4. Estratégia de testes a implementar

### 4.1 Pirâmide

| Nível | Ferramenta sugerida | Âmbito |
| --- | --- | --- |
| Unitário | Vitest | Funções puras, formatadores, validadores, geração de números |
| Componentes | Vitest + Testing Library | Formulários, estados de erro, loading e vazio |
| Integração | Vitest + Supabase de ensaio | Chamadas RPC, queries e políticas |
| RLS | SQL/pgTAP ou scripts Node | Isolamento com dois utilizadores e duas empresas |
| E2E | Playwright | Fluxos completos em browser real |
| Acessibilidade | axe-core / Lighthouse | Páginas principais, teclado e contraste |
| Contratos | Testes contra RPCs | Forma, campos, erros e limites |

### 4.2 Testes de RLS (obrigatórios antes de piloto)

Criar utilizadores A e B, empresas A e B, encomendas A e B. Para cada tabela, verificar:

| Operação | Ator | Resultado esperado |
| --- | --- | --- |
| SELECT | A sobre linha de A | Permitido |
| SELECT | A sobre linha de B | 0 linhas |
| INSERT | A com `empresa_id` de B | Negado |
| UPDATE | A sobre linha de B | 0 linhas afetadas |
| DELETE | A sobre linha de B | 0 linhas afetadas |
| RPC `obter_encomenda_publica` | `anon` com token de A | Devolve apenas dados mínimos de A |
| RPC `obter_encomenda_publica` | `anon` com token inválido | `null`/erro controlado |
| RPC `verificar_certificado` | `anon` com código válido | Dados esperados |
| RPC `verificar_certificado` | `anon` com código inválido | `{valido:false}` |
| Storage INSERT | A na pasta de B | Negado |
| Storage DELETE | A na pasta de B | Negado |
| Storage SELECT | `anon` em ficheiro privado | Negado |

Estes testes devem correr em CI contra um projeto de ensaio efémero ou uma base local
com Supabase CLI.

### 4.3 E2E mínimos

| # | Fluxo | Critério |
| --- | --- | --- |
| E01 | Registo → confirmação → login | Entra em `/painel` e vê a empresa |
| E02 | Login inválido | Mensagem clara, sem entrada |
| E03 | Recuperação de palavra-passe | Define nova palavra-passe e entra |
| E04 | Guardar perfil e logótipo | Dados persistem após reload |
| E05 | Criar encomenda com 2 peças | Número e token gerados; lista mostra |
| E06 | Editar encomenda | Alterações persistem |
| E07 | Atualizar estado com mensagem e foto | Histórico e foto visíveis |
| E08 | Abrir link público em anónimo | Dados mínimos corretos |
| E09 | Link com token inválido | Erro controlado, sem stack trace |
| E10 | Passaporte da peça | Ficha técnica e certificado |
| E11 | Verificar certificado válido/inválido | Resultado correto |
| E12 | Gerar QR e ler | URL correta |
| E13 | Emitir recibo e certificado | PDF com marca, valores e código |
| E14 | Submeter avaliação | Persiste uma única vez |
| E15 | Acesso cruzado entre empresas | Negado em todas as operações |

### 4.4 Testes de regressão visual

Guardar capturas das páginas principais em desktop e mobile. Comparar com baseline em CI
para detetar quebras de layout. Não substituem testes funcionais.

## 5. Critérios de aceitação por funcionalidade

Uma funcionalidade só é “validada” quando:

1. tem pelo menos um teste feliz e um teste de erro;
2. o teste de erro verifica a mensagem visível ao utilizador;
3. o caminho passa em CI, não apenas na máquina local;
4. o comportamento foi observado num ambiente com RLS ativa;
5. existe evidência arquivada (relatório, captura ou log).

Para fluxos críticos (login, criação de encomenda, portal, certificado), exigir também
teste E2E e teste de autorização.

## 6. Pipeline de CI proposto

```yaml
# .github/workflows/ci.yml (exemplo, não existe no repositório)
name: ci
on: [push, pull_request]
jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22, cache: npm }
      - run: npm ci
      - run: npm run lint
      - run: npm run build
      - run: npm test -- --run
      - run: npx playwright test
```

Requisitos:

- `npm run build` tem de estar verde antes de ativar o pipeline.
- Os testes RLS precisam de um projeto Supabase de ensaio ou Supabase local.
- Segredos nunca no repositório; usar secrets do CI.
- Bloquear merge com falhas de build, testes ou RLS.

## 7. Dívida de qualidade conhecida

| Área | Problema | Impacto |
| --- | --- | --- |
| Build | TS5101, `@apply btn`, tipos | Não há artefacto de produção |
| Lint | ~40 avisos | Ruído e padrões inconsistentes |
| Dependências | 1 alta (`image-size` via `pptxgenjs`) | Ferramenta de Materiais, não runtime |
| Acessibilidade | `lang="en"`, botões sem `aria-label`, tabelas sem `scope` | Barreiras e incumprimento |
| Erros | `console.error` e `alert()` | Má experiência e pouca observabilidade |
| Estado | Sem loading/erro/vazio em várias páginas | Perceção de bloqueio |
| Testes | Zero | Regressões invisíveis |
| CI | Inexistente | Nenhuma barreira automática |

## 8. Limites

A auditoria foi estática e não executou o produto. Os resultados de build, lint e tipos
são reais e reproduzíveis no ambiente local; os restantes juízos derivam da leitura do
código. Nenhum teste descrito neste documento foi executado.
