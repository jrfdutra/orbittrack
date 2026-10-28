# OrbitTrack - Portal de Acompanhamento para Impressão 3D

Portal SaaS White-Label para vendedores de impressões 3D acompanharem encomendas com os seus compradores.

## Stack
- React + Vite + TypeScript + Tailwind CSS
- Supabase (Postgres, Auth, RLS)
- three.js (@react-three/fiber)
- jsPDF (Geração de documentos)

## Instalação
1. `npm install`
2. Configurar `.env` com as credenciais do Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`).
3. Executar o SQL em `supabase/schema.sql` no editor SQL do Supabase.
4. Executar o `seed.sql` para dados de teste.
5. `npm run dev`

## Documentação

- [Manual da plataforma](docs/manual/README.md) — visão geral, guia do vendedor, guia do cliente,
  referência das RPC e deploy/operação.
- [Auditoria de 27/10/2026](docs/README.md) — registo histórico, não descreve o estado atual.
- [Apresentação](OrbitTrack-Apresentacao-v2.pptx) — 16 slides; o gerador está em
  `scripts/gerar-apresentacao.mjs` (`node scripts/gerar-apresentacao.mjs`).

## Comandos

```bash
npm run dev      # servidor de desenvolvimento
npm run build    # tsc -b && vite build
npm run preview  # servir dist/ localmente
npm run lint     # oxlint
```

