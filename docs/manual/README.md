# Manual da Plataforma OrbitTrack

Documentação funcional e operacional do OrbitTrack — plataforma white-label de rastreio de
encomendas, certificação de autenticidade e visualização 3D/AR para estúdios de impressão 3D.

Este manual descreve **o que existe hoje no código** e **como usar**. Não é uma auditoria nem
um roadmap: para isso existe a pasta irmã `../` (ver [nota histórica](../README.md)).

## Por onde começar

| Quero… | Documento |
| --- | --- |
| Entender o produto, a arquitetura e os comandos | [01 · Visão geral](01-visao-geral.md) |
| Operar o painel (empresa, encomendas, certificados, stock) | [02 · Guia do vendedor](02-guia-vendedor.md) |
| Perceber o que o comprador vê no link público | [03 · Guia do cliente](03-guia-cliente.md) |
| Integrar ou depurar as funções SQL públicas | [04 · Referência das RPC](04-referencia-rpc.md) |
| Instalar, configurar o Supabase e publicar na Vercel | [05 · Deploy e operação](05-deploy-e-operacao.md) |

## Em três frases

1. O vendedor autentica-se no painel, configura a identidade da empresa e regista encomendas
   com peças, especificações e ficheiros `.glb`.
2. Cada encomenda recebe um `token_publico` (36 caracteres hexadecimais) que gera um link
   `/acompanhar/<token>` — sem login, sem conta, partilhável por WhatsApp.
3. Cada peça recebe um `token_peca` que abre um passaporte 3D com Realidade Aumentada e,
   opcionalmente, um certificado de autenticidade verificável por qualquer pessoa.

## Convenções deste manual

- **Caminho de rota** aparece como `/acompanhar/:token`.
- **Tabelas e colunas** aparecem em `monoespaçado` e correspondem a `supabase/schema.sql`.
- Quando algo é limitação conhecida, está marcado com **⚠ Limitação**.
- Datas no formato `AAAA-MM-DD`; valores monetários em euros.

## Estado da documentação

Escrita a 28 de outubro de 2026, a partir da leitura do código em `src/`, de
`supabase/schema.sql`, de `vercel.json` e do `package.json`. Sempre que um ecrã ou uma função
mudar, o documento correspondente deve ser atualizado no mesmo commit.
