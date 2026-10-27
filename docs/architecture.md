# Arquitetura

## 1. Resumo

O OrbitTrack é uma aplicação web de página única (SPA) em React e TypeScript, servida
por Vite, que fala diretamente com o Supabase (PostgreSQL, Auth e Storage). Não existe
backend próprio, camada de API intermédia, servidor de renderização ou fila de tarefas.
O browser recebe a chave `anon` e todas as autorizações dependem de RLS e de RPCs
`SECURITY DEFINER`.

**Consequência arquitetural:** qualquer regra de negócio que não esteja no PostgreSQL ou
no Storage pode ser contornada no cliente. A validação de formulários é apenas de
experiência de utilizador.

## 2. Stack

| Camada | Tecnologia | Versão declarada |
| --- | --- | --- |
| UI | React + React DOM | 19.3 |
| Linguagem | TypeScript | 6.0 |
| Build/dev server | Vite | 8.3 |
| Estilos | Tailwind CSS + `@tailwindcss/vite` | 4.3 |
| Routing | React Router DOM | 7.18 |
| Backend | Supabase JS | 2.118 |
| Base de dados | PostgreSQL gerido pelo Supabase | — |
| 3D | three.js + `@react-three/fiber` + `@react-three/drei` | 0.186 / 9.8 / 10.7 |
| PDF | jsPDF + `jspdf-autotable` | 4.2 / 5.0 |
| QR | `qrcode.react` (instalado, não usado) | 4.0 |
| Ícones | lucide-react | 0.468 |
| Lint | oxlint | 1.88 |

As versões acima vêm de `package.json`. O projeto usa `type: module`, alias `@` para
`src/` e `tsc -b && vite build` no script de produção.

## 3. Vista de execução

```
Browser
  ├─ React SPA (Vite)
  │    ├─ React Router: rotas públicas e /painel
  │    ├─ AuthContext: sessão Supabase, empresa do utilizador
  │    ├─ Páginas → chamadas supabase-js diretas
  │    ├─ Viewer3D (GLB/GLTF via useGLTF)
  │    └─ jsPDF (esqueletos de recibo/certificado)
  │
  └─ HTTPS → Supabase
       ├─ Auth (email/palavra-passe)
       ├─ PostgREST (tabelas + RPCs)
       └─ Storage (buckets empresas e encomendas, ambos públicos)
```

Diagrama detalhado: [`../assets/arquitetura.png`](../assets/arquitetura.png). Modelo de
dados: [`../assets/er.png`](../assets/er.png).

## 4. Rotas

| Rota | Componente | Acesso | Estado real |
| --- | --- | --- | --- |
| `/login` | `Login.tsx` | Público | Interface e `signIn`; não validado |
| `/registar` | `Registar.tsx` | Público | Interface e `signUp`; trigger de empresa não validado |
| `/recuperar-senha` | `RecuperarSenha.tsx` | Público | Envia email; destino `/painel/redefinir-senha` não existe |
| `/acompanhar/:token` | `AcompanharEncomenda.tsx` | Público | Consulta tabelas como `anon`; bloqueada por RLS |
| `/peca/:tokenPeca` | `PecaPassaporte.tsx` | Público | Stub; lê `token_peca` em vez de `tokenPeca`; sem fetch |
| `/verificar/:codigo` | `VerificarCertificado.tsx` | Público | Consulta tabela, ignora `:codigo`; bloqueada por RLS |
| `/verificar` | `VerificarCertificado.tsx` | Público | Formulário de código; mesma limitação |
| `/painel` | `Dashboard.tsx` | Protegido | Três cartões; dois valores fixos |
| `/painel/encomendas` | `EncomendasLista.tsx` | Protegido | Lista; botões de ação sem handlers |
| `/painel/encomendas/nova` | `EncomendaForm.tsx` | Protegido | Criação falha por `numero_encomenda` |
| `/painel/encomendas/:id/editar` | `EncomendaForm.tsx` | Protegido | `fetchEncomenda` vazio; não edita |
| `/painel/empresa` | `EmpresaPerfil.tsx` | Protegido | Formulário e uploads; não validado |
| `/painel/estados` | `EstadosConfig.tsx` | Protegido | CRUD em memória + updates individuais |
| `*` | — | — | Redireciona para `/login` |

A rota de redefinição de palavra-passe **não** está definida. O wildcard envia o
utilizador para `/login`, pelo que o link de recuperação não cumpre o objetivo.

## 5. Autenticação e sessão

`src/contexts/AuthContext.tsx` cria o cliente Supabase, observa `onAuthStateChange`,
expõe `user`, `session`, `empresa`, `signIn`, `signUp`, `signOut` e `resetPassword`.
Depois do login, procura a linha em `empresas` pelo `utilizador_id`.

Problemas confirmados:

- `AuthProvider` está montado em `src/main.tsx` **e** em `src/App.tsx`, duplicando o
  contexto e as subscrições.
- A proteção de `/painel` é apenas cliente (`RotaProtegida`). A barreira efetiva teria de
  ser a RLS, que não foi testada.
- A criação automática da empresa depende de um trigger sobre `auth.users`; se falhar, o
  utilizador fica autenticado mas sem empresa e o painel não carrega dados.
- `empresas.utilizador_id` não tem `UNIQUE`, pelo que são possíveis duplicados.
- Não existe `PASSWORD_RECOVERY` tratado nem formulário de nova palavra-passe.

## 6. Organização do código

```
src/
  App.tsx                 rotas
  main.tsx                entrada React (AuthProvider duplicado)
  contexts/AuthContext.tsx
  components/
    RotaProtegida.tsx
    painel/LayoutPainel.tsx
    viewer3d/Viewer3D.tsx
  pages/
    Login.tsx Registar.tsx RecuperarSenha.tsx
    painel/ Dashboard, EncomendasLista, EncomendaForm, EmpresaPerfil, EstadosConfig
    publico/ AcompanharEncomenda, PecaPassaporte, VerificarCertificado
  lib/
    supabase.ts           cliente
    types.ts              tipos manuais
    utils.ts              validadores e helpers (não usados nos uploads)
    pdfGenerators.ts      esqueletos jsPDF
supabase/
  schema.sql              tabelas, índices, triggers, RLS, RPCs, Storage
  seed.sql                demonstração mínima (inválida)
```

Não existe camada `services/`, repositórios, React Query, Zustand ou validação com Zod.
Cada página chama `supabase.from(...)` diretamente e repete tratamento de erro. Isto
aumenta a duplicação e dificulta testes, mas não é por si só um bloqueio de release.

## 7. Acesso a dados

- **Painel:** consultas filtradas implicitamente pela RLS da empresa do utilizador.
- **Páginas públicas:** consultas diretas a `encomendas`, `itens_encomenda`,
  `historico_estados`, `fotos_encomenda` e `certificados` com a chave `anon`.
- **RPCs públicas disponíveis:** `obter_encomenda_publica(token)`,
  `obter_peca_publica(token_peca)`, `verificar_certificado(codigo)` e
  `submeter_avaliacao(...)`.
- **Desfasamento crítico:** a UI pública **não** chama as RPCs. Como não existem políticas
  `anon` nas tabelas, as consultas são rejeitadas. As RPCs existem, mas não são exercidas.

## 8. Visualizador 3D

`Viewer3D.tsx` usa `useGLTF` e `OrbitControls`, com `Stage` e `Suspense` sem fallback
visual. Limitações:

- Só GLB/GLTF; STL é prometido no âmbito funcional, mas não é suportado.
- Não há error boundary, mensagem de erro, indicador de loading ou fallback.
- Altura fixa de 400 px, sem adaptação a orientação ou ecrã pequeno.
- Não está integrado numa página com dados reais; o passaporte é um stub.
- Não foi testado com modelos reais, texturas ou URLs assinados.

## 9. Documentos PDF

`src/lib/pdfGenerators.ts` contém duas funções: `gerarCertificadoPDF` e `gerarReciboPDF`.
Ambas criam um `jsPDF`, escrevem alguns textos e chamam `save()`. Não incluem:

- itens da encomenda, totais ou dados fiscais;
- logótipo, cores, rodapé ou template da empresa;
- QR de verificação;
- numeração única ou registo de emissão;
- tratamento de erros ou pré-visualização.

Nenhuma página importa estas funções. São esqueletos, não funcionalidades.

## 10. Decisões arquiteturais a rever

| Decisão atual | Risco | Alternativa recomendada |
| --- | --- | --- |
| Acesso direto às tabelas nas páginas públicas | Depende de RLS bem configurada e expõe esquema | Usar exclusivamente RPCs com resposta mínima e `SET search_path` |
| Buckets públicos | Ficheiros acessíveis por URL | Bucket privado + URLs assinadas + políticas por empresa |
| Regras no cliente | Contornáveis | Triggers/RPCs transacionais no PostgreSQL |
| Sem camada de serviços | Duplicação e testes difíceis | Módulos `services/` tipados e testáveis |
| Sem gestão de estado servidor | Cache inexistente, chamadas repetidas | React Query ou equivalente |
| Sem CI | Regressões entram | Pipeline com build, lint, tipos, testes e RLS |

## 11. Limites desta análise

Não foi executado um ambiente Supabase, não foram observados pedidos reais e não foi
validada a configuração de Auth, SMTP, Storage ou rede. A arquitetura descrita é a que
resulta da leitura do código e do esquema, não de telemetria ou de testes de carga.
