# 05 · Deploy e operação

Do repositório vazio ao site em produção, e o que fazer quando algo falha.

---

## 1. Pré-requisitos

| Ferramenta | Versão | Nota |
| --- | --- | --- |
| Node.js | 20 LTS ou superior | Vite 8 exige Node 20.19+ / 22.12+ |
| npm | 10+ | Vem com o Node |
| Git | qualquer versão recente | |
| Conta Supabase | plano gratuito serve | |
| Conta Vercel | plano gratuito serve | |
| Conta GitHub | para CI/CD | |

---

## 2. Instalação local

```bash
git clone https://github.com/jrfdutra/orbittrack.git
cd orbittrack
npm install
cp .env.example .env      # Windows: copy .env.example .env
npm run dev
```

O servidor arranca em `http://localhost:5173`.

### 2.1 Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Sim | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Sim | Chave `anon` pública do projeto |

Exemplo (`.env.example`):

```env
VITE_SUPABASE_URL=https://uftvtlgckyilcqaswtia.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...ElQ
```

Notas:

- O prefixo `VITE_` é obrigatório: só variáveis com esse prefixo são injetadas no bundle.
- `src/lib/supabase.ts` tem **fallback embutido** para as credenciais do projeto de
  desenvolvimento. Sem `.env`, a aplicação continua a funcionar contra esse projeto. Em
  produção, define sempre as variáveis na Vercel para não depender do fallback.
- A chave `anon` é pública por desenho. **Nunca** coloques a `service_role` no front-end.
- O `.env` está listado no `.gitignore` — confirma que não aparece em `git status` antes de
  fazer commit. Se precisares de variantes, usa `.env.local` (também ignorado).

---

## 3. Base de dados

### 3.1 Criar o projeto

1. Em [supabase.com/dashboard](https://supabase.com/dashboard), cria um projeto.
2. Guarda o `project-ref`, a URL e a chave `anon` (Settings → API).
3. Anota a palavra-passe da base de dados.

### 3.2 Aplicar o esquema

No SQL Editor do Supabase, cola e executa **todo** o conteúdo de `supabase/schema.sql`.

O ficheiro está organizado por secções e é idempotente na maior parte das instruções
(`CREATE TABLE` sem `IF NOT EXISTS` falha se já existir — numa base limpa corre de uma vez).

O que fica criado:

| Secção | Objetos |
| --- | --- |
| Extensões | `uuid-ossp` |
| Tabelas | 9 (`empresas` … `avaliacoes`) |
| Índices | 8, incluindo `token_publico` e `codigo_verificacao` |
| Funções auxiliares | numeração, códigos, timestamps, triggers de registo |
| RLS | políticas em todas as tabelas |
| RPC públicas | 4 + `GRANT` para `anon` |
| Storage | buckets `empresas` e `encomendas` + políticas |

Opcionalmente, `supabase/seed.sql` cria dados de demonstração.

### 3.3 Verificação rápida

No SQL Editor:

```sql
-- As quatro funções devem existir
select proname, prosecdef
from pg_proc
where proname in ('obter_encomenda_publica','obter_peca_publica',
                  'verificar_certificado','submeter_avaliacao');
-- prosecdef = true em todas (SECURITY DEFINER)

-- RLS ligada em todas as tabelas de negócio
select relname, relrowsecurity
from pg_class
where relname in ('empresas','encomendas','itens_encomenda','certificados')
order by relname;

-- Buckets públicos
select id, public from storage.buckets;
```

### 3.4 Autenticação

Em Authentication → Providers, mantém **Email** ativo. Para testar sem servidor de email,
desativa «Confirm email». Para produção, configura SMTP próprio em Authentication → Emails —
o serviço por omissão tem limite baixo de envios por hora.

Define também **Site URL** e **Redirect URLs** com o domínio de produção
(`https://oteudominio.pt/**`), senão os links de recuperação de palavra-passe apontam para
`localhost`.

---

## 4. Build de produção

```bash
npm run build
```

Equivale a:

```bash
tsc -b && vite build
```

Resultado em `dist/`. Para inspecionar localmente:

```bash
npm run preview
```

### 4.1 Verificações antes de publicar

```bash
npm run lint     # oxlint
npm run build    # 0 erros de TypeScript
```

O repositório inclui `tsconfig.tsbuildinfo` versionado. Se o build se comportar de forma
estranha após mudanças de tipos, apaga-o e repete:

```powershell
Remove-Item tsconfig.tsbuildinfo
npm run build
```

---

## 5. Deploy na Vercel

### 5.1 Importar

1. [vercel.com/new](https://vercel.com/new) → importa `jrfdutra/orbittrack`.
2. Framework preset: **Vite** (deteta automaticamente).
3. Build command: `npm run build`.
4. Output directory: `dist`.
5. Adiciona `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em Environment Variables
   (Production, Preview e Development).
6. Deploy.

### 5.2 `vercel.json`

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

Sem esta regra, abrir `https://dominio.pt/acompanhar/<token>` diretamente devolve 404: o
servidor procura um ficheiro físico com esse caminho. O rewrite entrega sempre o
`index.html` e deixa o React Router resolver a rota.

**Consequência:** o link de rastreio enviado por WhatsApp só funciona se o rewrite estiver
presente. É a primeira coisa a confirmar quando «o site abre, mas o link não».

### 5.3 Domínio próprio

1. Vercel → Domains → Add.
2. Cria o registo DNS indicado (CNAME para `cname.vercel-dns.com`).
3. Espera pela emissão do certificado TLS (automático).
4. Atualiza o **Site URL** no Supabase para o domínio novo.

HTTPS não é opcional: sem ele o modo AR (`getUserMedia`) não funciona em telemóveis.

### 5.4 Pipeline

```
git push origin main
   ↓
Vercel build (npm run build)
   ↓
dist/ publicado na CDN
   ↓
https://<domínio>
```

Cada push para `main` gera um deploy de produção; cada pull request gera um preview URL.

---

## 6. Operação do dia a dia

### 6.1 Onde estão os dados

| Dado | Onde vive | Como consultar |
| --- | --- | --- |
| Empresas, encomendas, peças | PostgreSQL (Supabase) | Table Editor ou SQL Editor |
| Logótipos, capas, modelos 3D | Storage (`empresas`, `encomendas`) | Storage → bucket |
| Utilizadores e sessões | Supabase Auth | Authentication → Users |
| Logs de build/deploy | Vercel | Deployments → Functions/Logs |

### 6.2 Backups

O plano gratuito do Supabase **não** inclui backups automáticos de longo prazo. Para um
estúdio em produção:

- ativa o backup diário do plano pago, ou
- agenda um `pg_dump` semanal para armazenamento externo:

```bash
pg_dump "postgresql://postgres:<password>@db.<ref>.supabase.co:5432/postgres" \
  --no-owner --no-privileges -f backup-$(date +%F).sql
```

O Storage **não** é coberto pelo `pg_dump`: copia os buckets separadamente pela API ou pelo
dashboard.

### 6.3 Rotação de chaves

Se a chave `anon` for comprometida (por exemplo, publicada com permissões indevidas):

1. Supabase → Settings → API → Rotate `anon`.
2. Atualiza `VITE_SUPABASE_ANON_KEY` na Vercel.
3. Remove o fallback em `src/lib/supabase.ts` se já não for necessário.
4. Redeploy.

Como a RLS está ativa e nenhuma política autoriza `anon` diretamente, a exposição da chave
`anon` não dá acesso a dados de outras empresas — mas permite invocar as RPC públicas e
consumir quota.

---

## 7. Resolução de problemas

| Sintoma | Diagnóstico | Correção |
| --- | --- | --- |
| Página em branco após deploy | Base path errado ou build antigo | Confirmar `dist/` e refazer deploy |
| Rotas 404 ao recarregar | `vercel.json` ausente ou ignorado | Verificar o rewrite para `index.html` |
| «Encomenda não encontrada» num link válido | Token truncado, ou projeto Supabase errado nas env vars | Comparar `VITE_SUPABASE_URL` com o dashboard |
| Login falha com «Invalid login credentials» | Utilizador não confirmado, ou email/senha errados | Authentication → Users; desativar confirmação em dev |
| Email de recuperação não chega | SMTP por omissão limitado | Configurar SMTP próprio |
| Portal sem identidade visual | Empresa sem logótipo/capa, ou cor não guardada | `/painel/empresa` → Guardar |
| Modelo 3D não carrega | Ficheiro > 10 MB, `.gltf` com texturas em falta, ou CORS | Reexportar como `.glb`, aligeirar o modelo |
| AR não abre no telemóvel | Sem HTTPS, ou permissão de câmara negada | Domínio com TLS; autorizar câmara no navegador |
| `npm run build` falha em `tsc` | Tipos desatualizados | Apagar `tsconfig.tsbuildinfo`, rever o erro indicado |
| Upload para Storage devolve 403 | Sem sessão ativa, ou bucket errado | Confirmar login; bucket `empresas`/`encomendas` |
| Estado muda mas o histórico não | Erro silencioso na segunda escrita | Ver consola e logs do PostgREST |

### 7.1 Logs úteis

- **Vercel** → Deployments → Build Logs (erros de `tsc`/`vite`).
- **Supabase** → Logs → Postgres / API / Auth.
- **Browser** → DevTools → Network, filtrando `rpc/` para ver o payload exato das funções.
- **Supabase** → Logs → Postgres, para erros de política RLS (procuram `permission denied`).

---

## 8. Checklist de go-live

**Base de dados**

- [ ] `schema.sql` executado sem erros no projeto de produção
- [ ] Quatro RPC com `prosecdef = true`
- [ ] RLS ativa nas 9 tabelas
- [ ] Buckets `empresas` e `encomendas` criados e públicos
- [ ] Pelo menos uma empresa de teste criada via `/registar`

**Aplicação**

- [ ] `npm run build` sem erros
- [ ] `npm run lint` sem avisos bloqueantes
- [ ] `vercel.json` com rewrite para `index.html`
- [ ] `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` definidas na Vercel
- [ ] `.env` fora do repositório

**Fluxo ponta a ponta**

- [ ] Registar conta → empresa criada automaticamente
- [ ] Preencher identidade (logo, capa, cor) e confirmar no portal
- [ ] Criar encomenda com peça e `.glb`
- [ ] Abrir `/acompanhar/<token>` em telemóvel, sem sessão
- [ ] Mudar estado e confirmar que a cronologia cresce
- [ ] Emitir certificado e verificar o código em `/verificar`
- [ ] Abrir o passaporte 3D e ativar AR com a câmara

**Pós-lançamento**

- [ ] Backup agendado
- [ ] Domínio com TLS válido
- [ ] Site URL do Supabase a apontar para produção
- [ ] Sem credenciais `service_role` no bundle (`grep -r service_role dist/`)

---

## 9. Custos esperados

| Serviço | Plano gratuito | Quando cresce |
| --- | --- | --- |
| Vercel | 100 GB de tráfego/mês | Tráfego alto ou equipas |
| Supabase | 500 MB de BD, 1 GB de Storage | Modelos 3D e fotos enchem o Storage depressa |
| Domínio | — | ~10–15 €/ano |

O Storage é o primeiro limite a ser atingido: cada `.glb` pode pesar vários MB. Recomenda-se
compressão dos modelos e limpeza periódica de ficheiros órfãos (modelos de peças apagadas).
