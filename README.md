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
