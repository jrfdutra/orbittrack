# 01 · Visão geral da plataforma

## 1. O problema

Estúdios de impressão 3D vendem por Instagram, WhatsApp e feiras. O acompanhamento da
encomenda acaba no telefone do vendedor: o comprador pergunta «como está a minha peça?» e a
resposta é manual, repetida e diferente de cliente para cliente. Ao mesmo tempo, não existe
prova de autenticidade — o comprador não tem como confirmar quem produziu a peça nem com que
parâmetros, e o vendedor não tem como distinguir o seu trabalho de uma cópia.

## 2. A proposta

O OrbitTrack dá ao estúdio três coisas que hoje não tem:

| Necessidade | Como a plataforma resolve |
| --- | --- |
| «Onde está a minha encomenda?» | Link público por encomenda, com estado, previsão, histórico e peças. Sem login. |
| «Isto é original?» | Certificado com código de 8 caracteres verificável por qualquer pessoa em `/verificar`. |
| «Como é a peça ao vivo?» | Passaporte 3D com o modelo `.glb` real e modo de Realidade Aumentada na câmara do telemóvel. |

A plataforma é **white-label**: cada vendedor define nome, logótipo, foto de capa, cores,
contactos e texto de rodapé. O comprador nunca vê a marca OrbitTrack nos ecrãs que recebe.

## 3. Dois lados, uma base de dados

```
┌──────────────────────────┐        ┌───────────────────────────┐
│  VENDEDOR (autenticado)  │        │  COMPRADOR (sem conta)    │
│  /painel/...             │        │  /acompanhar/:token       │
│                          │        │  /peca/:tokenPeca         │
│  React + Supabase Auth   │        │  /verificar/:codigo       │
└───────────┬──────────────┘        └─────────────┬─────────────┘
            │  JWT do utilizador                  │  chave anon
            │  + políticas RLS                    │  + RPC security definer
            ▼                                     ▼
      ┌─────────────────────────────────────────────────┐
      │                   SUPABASE                      │
      │  PostgreSQL · 9 tabelas · RLS por empresa       │
      │  Auth (email/password) · Storage (2 buckets)    │
      │  4 funções RPC públicas (SECURITY DEFINER)      │
      └─────────────────────────────────────────────────┘
```

Regra estruturante: **o portal do comprador nunca lê tabelas**. Só executa quatro funções SQL
marcadas como públicas, que devolvem exclusivamente os campos expostos. Notas internas, NIF,
morada e contactos privados ficam fora do payload público por construção.

## 4. Mapa funcional

### 4.1 Painel do vendedor (protegido)

| Rota | Ecrã | O que faz |
| --- | --- | --- |
| `/painel` | Dashboard | Contagem de encomendas, tempo médio de fabrico, avaliação média e as 5 encomendas mais recentes. |
| `/painel/encomendas` | Gestão de encomendas | Lista com estado, previsão e cinco ações por linha. Em ecrãs pequenos a tabela dá lugar a cartões. |
| `/painel/encomendas/nova` | Nova encomenda | Formulário com dados do comprador, peças e upload de modelo 3D. |
| `/painel/encomendas/:id/editar` | Editar encomenda | O mesmo formulário, pré-preenchido. |
| `/painel/produtos` | Produtos & Consumo | Catálogo de produtos pré-definidos e stock de carretéis com abate de consumo. |
| `/painel/empresa` | A Minha Empresa | Identidade white-label: logo, capa, cores, contactos, NIF, rodapé. |
| `/painel/estados` | Estados de fabrico | Lista ordenada de estados, cor e mensagem padrão para o comprador. |

### 4.2 Portal do comprador (público)

| Rota | Ecrã | O que faz |
| --- | --- | --- |
| `/acompanhar/:token` | Rastreio | Estado atual, previsão, notas públicas, histórico, peças, certificados e contactos. |
| `/peca/:tokenPeca` | Passaporte 3D | Modelo `.glb`, especificações técnicas e botão de Realidade Aumentada. |
| `/verificar` e `/verificar/:codigo` | Verificação | Confirma a autenticidade de um certificado pelo código. |

### 4.3 Autenticação

| Rota | Ecrã |
| --- | --- |
| `/login` | Entrada com email e palavra-passe |
| `/registar` | Criação de conta (cria automaticamente a empresa e os estados padrão) |
| `/recuperar-senha` | Pedido de recuperação |
| `/redefinir-senha` e `/painel/redefinir-senha` | Definição de nova palavra-passe |

Qualquer rota desconhecida redireciona para `/login`. As rotas sob `/painel` estão envolvidas
por `RotaProtegida`, que espera pela sessão e expulsa quem não estiver autenticado.

## 5. Stack

| Camada | Tecnologia | Nota |
| --- | --- | --- |
| Interface | React 19 + TypeScript 6 | Componentes funcionais, sem state manager externo. |
| Build | Vite 8 | `npm run build` corre `tsc -b` antes do bundle. |
| Estilos | Tailwind CSS v4 | Configuração por `@tailwindcss/vite`, sem `tailwind.config.js`. |
| Ícones | lucide-react | Traço consistente em todo o painel. |
| Base de dados | Supabase (PostgreSQL + Auth + Storage) | RLS ativa nas 9 tabelas de negócio. |
| 3D | three.js + @react-three/fiber + drei | `useGLTF` carrega o `.glb`; `Stage` e `OrbitControls` dão o enquadramento. |
| Documentos | jsPDF + jspdf-autotable, docx | Geração no browser. |
| QR | qrcode / qrcode.react | Para partilhar o link de rastreio. |
| Lint | oxlint | `npm run lint`. |
| Distribuição | Vercel | `vercel.json` reescreve tudo para `index.html` (SPA). |

### Comandos

```bash
npm install        # dependências
npm run dev        # servidor de desenvolvimento (Vite)
npm run build      # tsc -b && vite build  → dist/
npm run preview    # servir dist/ localmente
npm run lint       # oxlint
```

## 6. Modelo de dados em resumo

Nove tabelas, todas com RLS ligada:

| Tabela | Papel | Chave para o exterior |
| --- | --- | --- |
| `empresas` | Identidade white-label do vendedor | — |
| `configuracao_estados` | Estados de fabrico ordenados, com cor e mensagem | — |
| `encomendas` | Cabeçalho: comprador, estado, previsão, notas | `token_publico` (36 hex) |
| `itens_encomenda` | Peças, especificações, `.glb`, série | `token_peca` (24 hex) |
| `historico_estados` | Linha do tempo da encomenda | — |
| `fotos_encomenda` | Fotografias do fabrico | — |
| `recibos` | Número, data, valor, método de pagamento | — |
| `certificados` | Código de 8 caracteres, nível de selo, critérios | `codigo_verificacao` |
| `avaliacoes` | 1 a 5 estrelas, uma por encomenda | — |

Relações: `empresas 1—N encomendas 1—N itens_encomenda`; `itens_encomenda 1—N fotos` e
`1—0..1 certificados`; `encomendas 1—N historico_estados` e `1—0..1 recibos/avaliacoes`.

Detalhe completo de colunas, políticas e funções em
[04 · Referência das RPC](04-referencia-rpc.md).

## 7. Identidade visual e responsividade

- **White-label real no portal**: a cor primária da empresa alimenta variáveis CSS
  (`--primary`) usadas no cabeçalho, nos selos e nos botões do link público.
- **Mobile-first no que o comprador vê.** O portal foi desenhado para abrir num telemóvel
  vindo do WhatsApp, com cartões empilhados e alvos de toque ≥ 32 px.
- **Painel adaptativo.** Abaixo de 768 px a tabela de encomendas é substituída por cartões com
  as mesmas ações — a mesma fonte de dados, sem lógica duplicada.
- **AR imersiva.** Com a câmara ativa, o visualizador passa a `fixed inset-0` e ocupa o ecrã
  inteiro do telemóvel, com o modelo sobreposto ao vídeo em tempo real.

## 8. Limitações conhecidas

| ⚠ | Detalhe |
| --- | --- |
| Produtos & Consumo | Os dados vivem em `useState`. Recarregar a página perde o catálogo e o stock. Persistência em base de dados está planeada. |
| Recibos | A tabela e a função de numeração existem, mas ainda não há ecrã de emissão. |
| Avaliações | A RPC `submeter_avaliacao` existe; o formulário no portal ainda não está ligado. |
| AR | Depende de `getUserMedia`, que exige HTTPS (ou `localhost`) e permissão explícita do utilizador. Sem ancoragem de superfície: o modelo flutua sobre o vídeo. |
| Faturação | Não há integração com software de faturação nem assinatura digital. |
| Multi-idioma | Interface apenas em português. |
| Testes | Não existe suite automatizada; a validação é manual, ecrã a ecrã. |
