# Instalação e deploy

## 1. Estado atual

| Item | Estado |
| --- | --- |
| `npm install` | Executável (dependências já instaladas no ambiente auditado) |
| `npm run dev` | Arranca o Vite; não valida dados nem autenticação |
| `npm run build` | **Falha** — TS5101 (`baseUrl`) e erros de tipos |
| `npx vite build` | **Falha** — `Cannot apply unknown utility class btn` |
| `npm run lint` | Termina com código 0, mas com cerca de 40 avisos |
| `npm audit` | 1 vulnerabilidade alta (`image-size` via `pptxgenjs`) |
| Deploy Vercel | **Não é possível** enquanto o build falhar; falta `vercel.json` |
| Repositório Git | Não existe `.git` no diretório auditado |

**Não apresentar este projeto como “pronto para Vercel”.** O artefacto de produção não
pode ser gerado e as rotas profundas devolveriam 404 sem rewrites.

## 2. Requisitos locais

- Node.js compatível com Vite 8 (o ambiente auditado usa Node 24).
- npm.
- Conta e projeto Supabase (para autenticação e dados).
- Word e PowerPoint apenas para regenerar os documentos e a apresentação; não são
  necessários para executar a aplicação.

## 3. Variáveis de ambiente

Criar `.env.local` na raiz com:

```env
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anon
VITE_APP_URL=http://localhost:5173
```

Regras:

- Usar apenas a chave `anon` no browser. **Nunca** colocar `service_role` em variáveis
  `VITE_*`.
- Não versionar `.env.local`.
- Sem estas variáveis, o cliente Supabase não inicializa corretamente.
- Em produção, configurar as mesmas variáveis no projeto Vercel.

## 4. Preparar o Supabase

1. Criar um projeto de ensaio (não usar produção).
2. Abrir o SQL Editor.
3. Executar `supabase/schema.sql`.
4. Confirmar que a extensão `pgcrypto` está disponível (o script só cria `uuid-ossp`;
   `gen_random_bytes` é usado em defaults).
5. Confirmar os buckets `empresas` e `encomendas`.
6. Configurar Authentication:
   - ativar email/palavra-passe;
   - definir redirect URLs, incluindo `/painel/redefinir-senha` (rota ainda inexistente);
   - decidir se a confirmação de email é obrigatória.
7. Registar um utilizador de teste e confirmar que foi criada uma linha em `empresas`.
8. **Não executar `seed.sql`** sem o corrigir: usa um `utilizador_id` inexistente e não
   fornece `numero_encomenda`.

### 4.1 Verificações SQL mínimas

```sql
-- Extensões
select extname from pg_extension;

-- Buckets
select id, public from storage.buckets;

-- RLS ativa
select relname, relrowsecurity
from pg_class
where relname in ('empresas','encomendas','itens_encomenda');

-- Empresa do utilizador
select id, utilizador_id, nome from empresas;

-- Políticas
select schemaname, tablename, policyname, roles, cmd
from pg_policies
where schemaname in ('public','storage');
```

Estas consultas não substituem testes de isolamento com dois utilizadores.

## 5. Executar localmente

```bash
npm install
npm run dev
```

O Vite indica o endereço local (por omissão `http://localhost:5173`). O modo de
desenvolvimento pode arrancar apesar dos erros de build, porque o Vite transforma os
módulos a pedido. Isso **não** significa que a aplicação esteja funcional.

## 6. Build de produção

```bash
npm run build
```

Resultado esperado no estado atual: falha. Causas confirmadas:

1. **TS5101** — a opção `baseUrl` está deprecated na versão de TypeScript usada.
2. **Tailwind** — `@apply` de classes personalizadas (`btn`) não é reconhecido no
   Tailwind 4.
3. **Tipos** — erros em `import.meta.env`, `index.css` e no ícone `Cube`.

Correções mínimas:

- remover ou substituir `baseUrl` por `paths` compatível;
- declarar `vite/client` nos tipos;
- substituir `@apply btn` por `@utility` ou CSS explícito;
- trocar `Cube` pelo ícone existente em `lucide-react`;
- voltar a correr `npm run build` até gerar `dist/`.

## 7. Deploy na Vercel (quando desbloqueado)

### 7.1 Pré-requisitos

- Build local verde e `dist/` gerado.
- Repositório Git com histórico (atualmente não existe `.git`).
- `vercel.json` com rewrite SPA para `index.html`.
- Variáveis de ambiente configuradas.
- Projeto Supabase de ensaio separado do de produção.

### 7.2 Configuração necessária

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

Este ficheiro **não existe** no repositório. Sem ele, abrir diretamente
`/acompanhar/:token`, `/peca/:tokenPeca` ou `/verificar/:codigo` devolve 404 na Vercel,
porque o servidor não conhece as rotas do React Router.

### 7.3 Passos

1. Criar projeto Vercel ligado ao repositório.
2. Framework preset: Vite; build command `npm run build`; output `dist`.
3. Adicionar `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
4. Adicionar `vercel.json`.
5. Fazer deploy de preview, não de produção.
6. Testar as rotas públicas diretamente, em janela anónima.
7. Testar login, criação de encomenda e portal com dados de ensaio.
8. Só promover após os critérios da secção 8.

### 7.4 Cabeçalhos recomendados

- `Content-Security-Policy` compatível com Supabase e o modelo 3D.
- `Strict-Transport-Security`.
- `X-Content-Type-Options: nosniff`.
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy` minimalista.

Não existe configuração de cabeçalhos no projeto.

## 8. Critérios de aceitação para deploy

| # | Critério | Estado atual |
| --- | --- | --- |
| 1 | `npm run build` termina com código 0 | Falha |
| 2 | `dist/` contém `index.html` e assets | Não gerado |
| 3 | `vercel.json` com rewrite SPA | Ausente |
| 4 | Rotas profundas abrem diretamente | Não testado |
| 5 | Portal público lê dados via RPC | Não implementado |
| 6 | Criação de encomenda funciona | Bloqueada |
| 7 | RLS testada com duas empresas | Não testada |
| 8 | Bucket de encomendas privado | Não |
| 9 | Recuperação de palavra-passe completa | Bloqueada |
| 10 | Testes automatizados em CI | Não existem |
| 11 | Política de privacidade e termos | Não existem |
| 12 | Lint sem erros e auditoria de dependências revista | 40 avisos, 1 alta |

## 9. Operação e rollback

Enquanto não existir versionamento, não há rollback fiável. Recomenda-se:

1. Criar repositório Git e proteger a branch principal.
2. Versionar migrações SQL, não apenas `schema.sql`.
3. Usar previews Vercel por pull request.
4. Manter um projeto Supabase de ensaio e outro de produção.
5. Antes de cada deploy, exportar um backup lógico.
6. Definir um procedimento de rollback (deploy anterior + migração reversível).
7. Monitorizar erros de browser e funções, com alertas para falhas de RLS e 5xx.

## 10. Custos e limites

Não foram apurados custos de Supabase, Vercel, armazenamento, tráfego ou email. Não
existe compromisso de SLA, suporte ou disponibilidade. Qualquer proposta comercial deve
ser precedida de medição real e de uma definição de âmbito.
