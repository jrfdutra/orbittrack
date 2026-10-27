import {
  h1, h2, h3, p, bullets, numbered, table, callout, code,
} from './blocks.mjs';
import { RISKS, STATUS } from './audit-data.mjs';

export const chapters = [
  {
    number: 11,
    title: 'Instalação e ambiente de desenvolvimento',
    blocks: [
      h1(11, 'Instalação e ambiente de desenvolvimento', 'Passos reproduzíveis, comandos reais e diagnóstico dos bloqueios atuais.'),
      h2('11.1 Pré-requisitos'),
      table(
        ['Requisito', 'Versão observada / recomendada', 'Nota'],
        [
          ['Node.js', '24.13.0 observado', 'Usar uma versão LTS compatível com Vite 8.'],
          ['npm', '11.21.1 observado', 'O projeto usa package-lock? Não foi confirmado; gerar e versionar.'],
          ['Sistema', 'Windows 10/11 no ambiente auditado', 'Os comandos são compatíveis com macOS/Linux.'],
          ['Supabase', 'Projeto cloud ou local', 'Necessário para Auth, Postgres e Storage.'],
          ['Editor', 'VS Code ou equivalente', 'Extensões recomendadas: ESLint/oxlint, Tailwind, TypeScript.'],
        ],
        { widths: [22, 34, 44] },
      ),
      h2('11.2 Instalação de dependências'),
      code(`cd orbittrack
npm install`),
      p('O projeto não tem repositório Git inicializado no ambiente auditado. Antes de qualquer trabalho, deve ser criado um repositório e protegido o acesso. Não existe ficheiro package-lock.json confirmado; a ausência de lockfile torna as instalações não determinísticas.'),
      h2('11.3 Variáveis de ambiente'),
      table(
        ['Variável', 'Obrigatória', 'Exemplo seguro', 'Onde é usada'],
        [
          ['VITE_SUPABASE_URL', 'Sim', 'https://SEU-PROJETO.supabase.co', 'src/lib/supabase.ts'],
          ['VITE_SUPABASE_ANON_KEY', 'Sim', 'chave anon pública', 'src/lib/supabase.ts'],
          ['VITE_APP_URL', 'Não confirmada', 'http://localhost:5173', '.env.example; não referenciada no código'],
        ],
        { widths: [26, 14, 34, 26] },
      ),
      p('Criar .env.local a partir de .env.example e preencher com valores do projeto Supabase. Nunca colocar a service_role no cliente nem versionar .env.local. O cliente lança uma exceção explícita se as duas variáveis obrigatórias faltarem.'),
      code(`# .env.local (exemplo; não versionar)
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_CHAVE_ANON
VITE_APP_URL=http://localhost:5173`),
      h2('11.4 Aplicar o schema'),
      numbered(
        'Abrir o projeto no Supabase e o SQL Editor.',
        'Confirmar que a extensão pgcrypto está disponível (gen_random_bytes). O schema só declara uuid-ossp.',
        'Executar supabase/schema.sql num projeto vazio.',
        'Verificar a criação das nove tabelas, das funções e dos buckets.',
        'Configurar as redirect URLs de autenticação, incluindo /login e a futura rota de redefinição.',
        'Executar o seed apenas depois de corrigido; o seed atual falha.',
      ),
      callout('warn', 'Idempotência', 'O schema não é idempotente. Uma segunda execução falha porque as tabelas e políticas já existem. Para evoluir o esquema, criar migrações versionadas em vez de reexecutar o ficheiro completo.'),
      h2('11.5 Executar em desenvolvimento'),
      code(`npm run dev
# Vite indica a URL local, por exemplo http://localhost:5173`),
      p('O servidor de desenvolvimento pode arrancar, mas o CSS pode falhar ao compilar a classe personalizada .btn usada em @apply. O build de produção falha de forma reproduzível. Não foi possível validar a aplicação em execução contra um Supabase real.'),
      h2('11.6 Lint, tipos e build'),
      table(
        ['Comando', 'Resultado observado', 'Conclusão'],
        [
          ['npm run lint', 'Código 0, 40 avisos', 'Não bloqueia, mas há imports mortos e avisos de hooks.'],
          ['npm run build', 'Falha TS5101 (baseUrl)', 'Não gera dist.'],
          ['npx vite build', 'Falha: Cannot apply unknown utility class btn', 'CSS Tailwind incompatível.'],
          ['npx tsc -p tsconfig.json --noEmit --ignoreDeprecations 6.0', '3 erros (import.meta.env, CSS, Cube)', 'Tipos incompletos.'],
          ['npm audit', '1 vulnerabilidade alta (image-size via pptxgenjs)', 'Ferramenta de documentação; não runtime do cliente.'],
        ],
        { widths: [38, 32, 30], fontSize: 7.8 },
      ),
      h2('11.7 Correzões mínimas para desbloquear o build'),
      bullets(
        'Remover baseUrl do tsconfig e configurar paths de forma compatível, ou fixar uma versão de TypeScript que não trate a opção como erro.',
        'Adicionar "types": ["vite/client"] e uma declaração para importação de CSS, ou usar a configuração tsconfig.app correta.',
        'Substituir @apply btn por CSS explícito ou declarar btn como @utility no Tailwind 4.',
        'Remover a importação inexistente Cube de lucide-react.',
        'Garantir que os dois AuthProvider não são aninhados sem necessidade.',
      ),
      h2('11.8 Build de produção e pré-visualização'),
      code(`npm run build
npm run preview`),
      p('Estes comandos só serão úteis depois de corrigidos os bloqueios acima. A pré-visualização atual não pode ser gerada. Para a Vercel, será necessário um vercel.json com rewrite de SPA.'),
      h2('11.9 Ambiente de testes separado'),
      bullets(
        'Criar um projeto Supabase dedicado a testes, com dados fictícios.',
        'Usar variáveis de ambiente distintas e nunca apontar testes para produção.',
        'Aplicar migrações e seed no projeto de testes antes de cada suite.',
        'Criar dois utilizadores de teste em empresas distintas para validar RLS.',
        'Automatizar a limpeza de dados e não usar dados pessoais reais.',
      ),
      h2('11.10 Diagnóstico de erros frequentes'),
      table(
        ['Sintoma', 'Causa provável', 'Resolução'],
        [
          ['“Variáveis de ambiente ... são obrigatórias”', 'Falta .env.local ou nomes errados.', 'Criar o ficheiro e reiniciar o Vite.'],
          ['Página pública “Não conseguimos encontrar”', 'RLS bloqueia consulta anon.', 'Ligar à RPC; não desativar RLS.'],
          ['“Erro ao guardar encomenda”', 'numero_encomenda NOT NULL.', 'Gerar número no servidor.'],
          ['Link de recuperação 404', 'Rota inexistente.', 'Criar /painel/redefinir-senha.'],
          ['CSS não compila', '@apply btn.', 'Corrigir Tailwind.'],
          ['Tipos de import.meta.env', ' Falta vite/client.', 'Adicionar types.'],
          ['Upload falha', 'Bucket/política ou tamanho.', 'Verificar Storage e limites.'],
          ['Seed falha', 'FK zero e numero em falta.', 'Corrigir seed.'],
        ],
        { widths: [34, 30, 36], fontSize: 7.8 },
      ),
    ],
  },

  {
    number: 12,
    title: 'Testes e garantia de qualidade',
    blocks: [
      h1(12, 'Testes e garantia de qualidade', 'Estado atual, plano de testes priorizado e critérios de aceitação.'),
      h2('12.1 Estado atual'),
      p('Não existe framework de testes, ficheiros de teste, script npm test, pipeline de CI ou relatório de cobertura. O lint produz avisos, mas não bloqueia. O build falha. Consequentemente, nenhuma funcionalidade pode ser classificada como “implementada e validada”.'),
      table(
        ['Tipo de teste', 'Existe?', 'Observação'],
        [
          ['Unitário', 'Não', 'Sem Vitest/Jest.'],
          ['Componentes', 'Não', 'Sem Testing Library.'],
          ['Integração', 'Não', 'Sem base de dados de teste.'],
          ['E2E', 'Não', 'Sem Playwright/Cypress.'],
          ['RLS/segurança', 'Não', 'Prioridade máxima.'],
          ['Acessibilidade', 'Não', 'Sem axe/Lighthouse.'],
          ['Regressão visual', 'Não', 'Sem snapshots.'],
          ['Carga/desempenho', 'Não', 'Sem medições.'],
        ],
        { widths: [24, 16, 60] },
      ),
      h2('12.2 Estratégia recomendada'),
      numbered(
        'Unitários para funções puras: formatação, validação, geração de tokens e cálculos.',
        'Componentes para formulários e estados de erro/loading.',
        'Integração com Supabase de teste para CRUD e RPCs.',
        'RLS com dois utilizadores e duas empresas, cobrindo todos os verbos.',
        'E2E dos fluxos P0: registo, criação de encomenda, link público, verificação e avaliação.',
        'Acessibilidade automatizada e manual nas páginas principais.',
        'Regressão visual dos ecrãs críticos em desktop e mobile.',
      ),
      h2('12.3 Plano de testes priorizado'),
      table(
        ['ID', 'Área', 'Cenário', 'Resultado esperado', 'Prioridade'],
        [
          ['TC-001', 'Auth', 'Registo com email novo e confirmação', 'Conta criada e empresa associada.', 'P0'],
          ['TC-002', 'Auth', 'Login com credenciais válidas', 'Sessão iniciada e /painel acessível.', 'P0'],
          ['TC-003', 'Auth', 'Login com palavra-passe errada', 'Erro genérico, sem revelar existência.', 'P1'],
          ['TC-004', 'Auth', 'Recuperação de palavra-passe completa', 'Nova palavra-passe aceite e login funciona.', 'P0'],
          ['TC-005', 'RLS', 'A lê encomendas de B', 'Zero linhas.', 'P0'],
          ['TC-006', 'RLS', 'A atualiza encomenda de B', 'Operação rejeitada.', 'P0'],
          ['TC-007', 'RLS', 'A insere encomenda com empresa_id de B', 'Operação rejeitada.', 'P0'],
          ['TC-008', 'Storage', 'A tenta escrever na pasta de B', 'Operação rejeitada.', 'P0'],
          ['TC-009', 'Storage', 'Anon acede a foto de encomenda', 'Acesso negado ou URL assinada inválida.', 'P0'],
          ['TC-010', 'Encomendas', 'Criar encomenda com 2 itens', 'Número gerado, itens persistidos.', 'P0'],
          ['TC-011', 'Encomendas', 'Criar duas encomendas em simultâneo', 'Números distintos.', 'P1'],
          ['TC-012', 'Encomendas', 'Editar encomenda existente', 'Dados carregados e atualizados.', 'P0'],
          ['TC-013', 'Encomendas', 'Atualizar estado com mensagem/foto', 'Histórico criado e portal reflete.', 'P0'],
          ['TC-014', 'Público', 'Abrir link com token válido', 'Dados corretos, sem login.', 'P0'],
          ['TC-015', 'Público', 'Abrir link com token inválido', 'Estado de erro controlado.', 'P0'],
          ['TC-016', 'Público', 'Previsão nula', 'Mostra “a definir”, não 1970.', 'P1'],
          ['TC-017', 'Passaporte', 'Abrir /peca/:tokenPeca', 'Ficha e modelo corretos.', 'P1'],
          ['TC-018', '3D', 'Modelo GLB válido', 'Cena carrega e permite orbitar.', 'P1'],
          ['TC-019', '3D', 'URL inválido', 'Fallback sem rebentar a página.', 'P1'],
          ['TC-020', 'Certificados', 'Verificar código válido', 'Empresa, peça, data e selo.', 'P0'],
          ['TC-021', 'Certificados', 'Código minúsculo/sem hífen', 'Normalização e resultado válido.', 'P1'],
          ['TC-022', 'PDF', 'Gerar recibo com itens', 'PDF com marca, valores e numeração.', 'P1'],
          ['TC-023', 'PDF', 'Gerar certificado com QR', 'PDF com selo, critérios e QR.', 'P1'],
          ['TC-024', 'Avaliações', 'Submeter avaliação duas vezes', 'Segunda tentativa rejeitada.', 'P1'],
          ['TC-025', 'Avaliações', 'Estrelas fora de 1–5', 'Erro controlado.', 'P1'],
          ['TC-026', 'Upload', 'Ficheiro com 51 MB', 'Rejeitado com mensagem.', 'P1'],
          ['TC-027', 'Upload', 'Ficheiro .exe renomeado para .png', 'Rejeitado por MIME/conteúdo.', 'P1'],
          ['TC-028', 'Dashboard', 'Sem encomendas', 'Estado vazio, sem métricas falsas.', 'P1'],
          ['TC-029', 'Mobile', 'Portal em 375 px', 'Sem overflow; timeline legível.', 'P1'],
          ['TC-030', 'A11y', 'Navegação só com teclado', 'Foco visível e ordem lógica.', 'P2'],
          ['TC-031', 'Build', 'npm run build', 'Código 0 e dist gerado.', 'P0'],
          ['TC-032', 'Deploy', 'Abrir rota profunda na Vercel', 'SPA carrega, sem 404.', 'P1'],
        ],
        { widths: [8, 12, 38, 30, 12], fontSize: 7.2 },
      ),
      h2('12.4 Exemplo de teste RLS'),
      code(`-- Executar num projeto de testes, com dois utilizadores A e B.
-- Autenticar como A e tentar ler a encomenda de B.
select *
from encomendas
where id = '<ID_DA_ENCOMENDA_DE_B>';
-- Esperado: 0 linhas.

-- Autenticar como A e tentar atualizar a encomenda de B.
update encomendas
set estado = 'Entregue'
where id = '<ID_DA_ENCOMENDA_DE_B>';
-- Esperado: 0 linhas afetadas (ou erro de política).`),
      p('Estes testes devem ser repetidos para todas as tabelas e para operações de INSERT/UPDATE/DELETE. A evidência (output, data, ambiente) deve ser arquivada.'),
      h2('12.5 Testes de componentes e E2E'),
      bullets(
        'Componentes: formulário de encomenda, perfil, configuração de estados, cartões de estado e timeline.',
        'E2E: registo → perfil → encomenda → estado → link público → avaliação.',
        'E2E de segurança: tentar abrir /painel sem sessão e aceder a IDs de outra empresa.',
        'E2E de documentos: descarregar recibo e certificado e validar conteúdo com pdf-parse.',
        'E2E de acessibilidade: axe em cada página e testes de teclado.',
      ),
      h2('12.6 Critérios de saída'),
      table(
        ['Gate', 'Critério'],
        [
          ['G0 — Build', 'npm run build e lint verdes em CI.'],
          ['G1 — Segurança', 'Testes RLS/Storage verdes; nenhuma falha crítica aberta.'],
          ['G2 — Fluxos', 'Todos os P0 com E2E verde.'],
          ['G3 — Documentos', 'PDFs validados e QR verificado.'],
          ['G4 — Acessibilidade', 'WCAG 2.2 AA nas páginas principais.'],
          ['G5 — Operação', 'Monitorização, backups e rollback testados.'],
        ],
        { widths: [24, 76] },
      ),
      callout('danger', 'Estado atual dos gates', 'G0 está bloqueado. G1 não foi executado. G2 não é possível porque os fluxos P0 não funcionam. G3, G4 e G5 não têm implementação.'),
    ],
  },

  {
    number: 13,
    title: 'Deploy, manutenção e operações',
    blocks: [
      h1(13, 'Deploy, manutenção e operações', 'O que existe, o que falta e como operar o produto quando os bloqueios forem resolvidos.'),
      h2('13.1 Estado atual'),
      table(
        ['Item', 'Estado', 'Evidência'],
        [
          ['Repositório Git', 'Não inicializado no ambiente auditado', 'Ausência de .git.'],
          ['CI/CD', 'Não existe', 'Sem .github/workflows.'],
          ['Build', 'Falha', 'TS5101 e @apply btn.'],
          ['Vercel', 'Não configurada', 'Sem vercel.json.'],
          ['Supabase', 'Schema manual', 'Sem migrações.'],
          ['Monitorização', 'Não existe', 'Sem Sentry, logs ou alertas.'],
          ['Backups', 'Não documentados', 'Depende do plano Supabase.'],
          ['Domínio/TLS', 'Não configurados', 'Sem informação no repositório.'],
        ],
        { widths: [22, 38, 40] },
      ),
      h2('13.2 Ambientes'),
      table(
        ['Ambiente', 'Frontend', 'Supabase', 'Dados', 'Objetivo'],
        [
          ['Local', 'Vite', 'Projeto de desenvolvimento', 'Fictícios', 'Desenvolvimento.'],
          ['Teste', 'Preview Vercel', 'Projeto de teste', 'Fictícios e isolados', 'CI, RLS, E2E.'],
          ['Produção', 'Vercel', 'Projeto de produção', 'Reais', 'Clientes.'],
        ],
        { widths: [16, 20, 26, 22, 16] },
      ),
      p('Os três ambientes devem usar projetos Supabase distintos. Misturar produção e teste é um risco de perda de dados e de fuga de informação.'),
      h2('13.3 Configuração Vercel recomendada'),
      code(`{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "X-Frame-Options", "value": "DENY" }
      ]
    }
  ]
}`),
      p('Este ficheiro não existe no projeto; é uma recomendação. Uma CSP completa deve ser desenhada depois de inventariar os domínios do Supabase e eventuais fontes externas.'),
      h2('13.4 Variáveis por ambiente'),
      table(
        ['Variável', 'Local', 'Teste', 'Produção'],
        [
          ['VITE_SUPABASE_URL', 'Projeto dev', 'Projeto teste', 'Projeto prod'],
          ['VITE_SUPABASE_ANON_KEY', 'Chave dev', 'Chave teste', 'Chave prod'],
          ['VITE_APP_URL', 'http://localhost:5173', 'URL de preview', 'URL pública'],
        ],
        { widths: [30, 24, 23, 23] },
      ),
      p('As variáveis VITE_* são incorporadas no bundle e não são segredos. A service_role nunca deve ser exposta. Chaves devem ser rotáveis e o acesso ao dashboard Supabase restringido.'),
      h2('13.5 Processo de release'),
      numbered(
        'Criar branch a partir de main e abrir pull request.',
        'Executar lint, tipos, testes unitários, RLS e build em CI.',
        'Aplicar migrações no ambiente de teste e correr E2E.',
        'Gerar preview deployment e validar smoke tests.',
        'Aprovar revisão de código e de segurança.',
        'Aplicar migrações em produção com plano de rollback.',
        'Publicar frontend e monitorizar erros e métricas.',
        'Registar a versão e as alterações.',
      ),
      h2('13.6 Migrações'),
      bullets(
        'Substituir schema.sql por migrações numeradas e imutáveis.',
        'Nunca alterar uma migração já aplicada; criar uma nova.',
        'Testar em cópia de produção antes de aplicar.',
        'Fazer backup antes de alterações destrutivas.',
        'Manter scripts de rollback para cada migração.',
        'Documentar dependências e ordem de execução.',
      ),
      h2('13.7 Monitorização e logs'),
      table(
        ['Sinal', 'Ferramenta sugerida', 'Alerta'],
        [
          ['Erros de frontend', 'Sentry ou equivalente', 'Novo erro ou aumento de taxa.'],
          ['Erros de API/PostgREST', 'Logs Supabase', '5xx, 401/403 anómalos.'],
          ['Latência', 'Vercel Analytics / Supabase', 'P95 acima do objetivo.'],
          ['Falhas de build', 'CI', 'Bloquear merge.'],
          ['Abuso de RPC', 'Rate limit + logs', 'Picos por IP/token.'],
          ['Armazenamento', 'Supabase', 'Crescimento anómalo.'],
          ['Backups', 'Supabase', 'Falha ou atraso.'],
        ],
        { widths: [26, 38, 36] },
      ),
      h2('13.8 Backups e recuperação'),
      p('O plano do Supabase contratado determina a retenção e a frequência dos backups. Não foi encontrada documentação sobre RPO/RTO. Antes de produção, definir objetivos, testar restauro e documentar o procedimento. Dados de Storage também precisam de estratégia de backup.'),
      h2('13.9 Rollback'),
      numbered(
        'Reverter o deployment do frontend para a versão anterior na Vercel.',
        'Reverter a migração com o script preparado, se seguro.',
        'Se os dados estiverem corrompidos, restaurar backup e comunicar o incidente.',
        'Invalidar sessões/chaves se houver suspeita de compromisso.',
        'Registar causa, impacto e ações corretivas.',
      ),
      h2('13.10 Manutenção'),
      bullets(
        'Atualizar dependências mensalmente e rever vulnerabilidades.',
        'Revisar políticas RLS e Storage a cada alteração de modelo.',
        'Rodar testes de restauro trimestralmente.',
        'Rever custos e quotas.',
        'Manter documentação e runbooks atualizados.',
        'Planear janelas de manutenção para migrações destrutivas.',
      ),
      callout('warn', 'Não existe operação pronta', 'Sem build, CI, monitorização, backups documentados ou plano de rollback, o OrbitTrack não tem uma operação de produção. Este capítulo descreve o destino necessário, não o estado atual.'),
    ],
  },

  {
    number: 14,
    title: 'Desempenho e escalabilidade',
    blocks: [
      h1(14, 'Desempenho e escalabilidade', 'Pontos de pressão, medições disponíveis e recomendações, distinguindo factos de estimativas.'),
      h2('14.1 O que foi medido'),
      p('Não foi possível medir desempenho em execução: o build falha e não existe ambiente Supabase configurado. As observações abaixo são estáticas, baseadas no código e no esquema. Não são apresentados valores de latência, throughput ou custos inventados.'),
      h2('14.2 Pontos de pressão'),
      table(
        ['Área', 'Observação', 'Impacto potencial'],
        [
          ['Bundle inicial', 'Todas as páginas e three.js são importados estaticamente em App.tsx.', 'Carregamento inicial pesado, sobretudo em mobile.'],
          ['Lista de encomendas', 'SELECT sem paginação nem filtros.', 'Resposta lenta com volume.'],
          ['RPC pública', 'Agrega itens, histórico, fotos, certificados e avaliação num único JSON.', 'Resposta grande e custo de agregação.'],
          ['Índices', 'Bom conjunto para tokens e FKs; falta índice de ordenação por criada_em.', 'Ordenações podem ficar lentas.'],
          ['Storage', 'Ficheiros 3D sem limite e servidos publicamente.', 'Consumo de banda e custos.'],
          ['PDFs', 'Gerados no cliente, sem limite de complexidade.', 'Bloqueio do browser em documentos grandes.'],
          ['3D', 'Modelos sem limite de tamanho nem compressão.', 'Falhas de memória em telemóveis.'],
          ['Dashboard', 'Count exact em todos os pedidos.', 'Custo crescente com volume.'],
        ],
        { widths: [20, 48, 32], fontSize: 7.8 },
      ),
      h2('14.3 Consultas e índices'),
      bullets(
        'encomendas tem índices por empresa e token; a listagem ordenada por criada_em beneficiaria de índice composto (empresa_id, criada_em DESC).',
        'itens, histórico, fotos e certificados têm índices por encomenda/item.',
        'A RPC pública faz várias subqueries correlacionadas; com muitas fotos/itens pode ser pesada.',
        'Não há pesquisa textual; se for adicionada, avaliar pg_trgm ou full-text.',
        'O count exact do dashboard pode ser substituído por contagem estimada ou cache.',
      ),
      h2('14.4 Paginação e carregamento'),
      p('Nenhuma listagem é paginada. A primeira otimização deve ser paginação server-side com limites máximos, seguida de seleção explícita de colunas. O portal público deve limitar o número de fotos e itens devolvidos ou paginar secções.'),
      h2('14.5 Frontend'),
      bullets(
        'Introduzir lazy loading por rota, especialmente para o visualizador 3D e páginas públicas.',
        'Separar o bundle de three.js e carregá-lo apenas quando necessário.',
        'Evitar re-renderizações desnecessárias e pedidos duplicados.',
        'Adicionar cache de dados (React Query ou equivalente) para listas e perfil.',
        'Otimizar imagens (largura, formato WebP, lazy loading).',
        'Medir Core Web Vitals depois de o build funcionar.',
      ),
      h2('14.6 Escalabilidade multi-empresa'),
      p('O modelo é single-tenant por utilizador: cada empresa tem um dono e não há membros. Isto simplifica o isolamento, mas limita equipas. O volume por empresa é desconhecido. As políticas RLS com subqueries são adequadas para volumes moderados; devem ser testadas com dados representativos.'),
      h2('14.7 Custos'),
      p('Os custos dependem dos planos Supabase e Vercel, do armazenamento de modelos 3D, do tráfego e do número de pedidos. Não são apresentados valores porque não foram medidos nem contratados. Antes de comercializar, modelar cenários de uso e definir alertas de faturação.'),
      h2('14.8 Objetivos sugeridos'),
      table(
        ['Métrica', 'Objetivo inicial (a validar)'],
        [
          ['LCP mobile', '≤ 2,5 s em 4G'],
          ['Resposta da lista', '≤ 500 ms para 50 registos'],
          ['Resposta do portal', '≤ 800 ms com 20 fotos'],
          ['Erros 5xx', '< 0,5% dos pedidos'],
          ['Tamanho do modelo 3D', '≤ 15 MB comprimido'],
          ['Upload de imagem', '≤ 5 MB após compressão'],
        ],
        { widths: [42, 58] },
      ),
      callout('warn', 'Estimativas, não garantias', 'Os objetivos acima são propostas de engenharia. Não foram medidos nem validados com utilizadores reais.'),
    ],
  },

  {
    number: 15,
    title: 'Limitações, riscos e dívida técnica',
    blocks: [
      h1(15, 'Limitações, riscos e dívida técnica', 'Inventário priorizado, com evidência, impacto, recomendação e critério de conclusão.'),
      h2('15.1 Método'),
      p('Os riscos abaixo foram confirmados por leitura de código ou por execução de comandos. A coluna “Probabilidade” distingue o que já acontece (Confirmada) do que é provável mas não foi reproduzido. O esforço é indicado em S/M/L, sem datas, porque não existe equipa dimensionada nem histórico de velocidade.'),
      h2('15.2 Resumo priorizado'),
      table(
        ['ID', 'Problema', 'Gravidade', 'Prob.', 'Prioridade', 'Esforço'],
        RISKS.map((r) => [r.id, r.problem, r.severity, r.probability, r.priority, r.effort]),
        { widths: [8, 50, 12, 12, 10, 8], fontSize: 7.4 },
      ),
      h2('15.3 Riscos críticos em detalhe'),
      ...RISKS.filter((r) => r.priority === 'P0').flatMap((r) => [
        h3(`${r.id} — ${r.problem}`),
        table(
          ['Campo', 'Detalhe'],
          [
            ['Evidência', r.evidence],
            ['Impacto', r.impact],
            ['Gravidade / probabilidade', `${r.severity} / ${r.probability}`],
            ['Recomendação', r.recommendation],
            ['Dependência', r.dependency],
            ['Critério de conclusão', r.done],
          ],
          { widths: [24, 76], fontSize: 7.8 },
        ),
      ]),
      h2('15.4 Riscos de prioridade 1 e 2'),
      table(
        ['ID', 'Evidência', 'Impacto', 'Recomendação', 'Critério'],
        RISKS.filter((r) => r.priority !== 'P0').map((r) => [r.id, r.evidence, r.impact, r.recommendation, r.done]),
        { widths: [7, 26, 24, 25, 18], fontSize: 6.9 },
      ),
      h2('15.5 Dívida técnica por categoria'),
      table(
        ['Categoria', 'Exemplos', 'Consequência'],
        [
          ['Build e tipos', 'baseUrl, vite/client, CSS, Cube', 'Não há artefacto de produção.'],
          ['Dados', 'Numeração, constraints, seed', 'Fluxos falham e há risco de duplicados.'],
          ['Segurança', 'Buckets públicos, Storage, RPC', 'Isolamento não comprovado.'],
          ['Frontend', 'Estado local, duplicação, imports mortos', 'Manutenção difícil e bugs silenciosos.'],
          ['Testes', 'Ausência total', 'Regressões inevitáveis.'],
          ['Operações', 'CI, monitorização, backups', 'Não há produção sustentável.'],
          ['Conformidade', 'RGPD, termos, retenção', 'Risco legal e comercial.'],
        ],
        { widths: [18, 44, 38] },
      ),
      h2('15.6 O que não pode ser afirmado'),
      callout('danger', 'Afirmações proibidas no estado atual', 'Não é possível afirmar que o OrbitTrack está pronto para produção, que o isolamento multi-empresa está validado, que os dados estão seguros, que o portal do comprador funciona, que os certificados são verificáveis, que os PDFs são emitidos, que há conformidade RGPD ou que o produto é “Vercel-ready”.'),
      h2('15.7 Ordem de correção recomendada'),
      numbered(
        'Desbloquear o build e a verificação de tipos.',
        'Corrigir a criação de encomendas com numeração transacional.',
        'Ligar o portal público e a verificação às RPCs.',
        'Fechar o Storage: buckets privados, políticas por dono e validação de uploads.',
        'Criar testes RLS/Storage com dois utilizadores.',
        'Implementar atualização de estado, histórico e fotos.',
        'Implementar recibos, certificados, QR e passaporte.',
        'Adicionar CI, monitorização, backups e documentação legal.',
      ),
    ],
  },
];
