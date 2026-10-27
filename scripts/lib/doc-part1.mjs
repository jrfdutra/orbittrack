import {
  h1, h2, h3, p, lead, bullets, numbered, table, callout, code, figure, pagebreak, quote,
} from './blocks.mjs';
import { FEATURES, RISKS, STATUS } from './audit-data.mjs';

export const chapters = [
  {
    number: 1,
    title: 'Visão geral',
    blocks: [
      h1(1, 'Visão geral', 'O que é o OrbitTrack, para quem existe e qual é o estado real do produto nesta data.'),
      h2('1.1 Apresentação do produto'),
      p('O OrbitTrack é uma aplicação web SaaS white-label para oficinas e estúdios de impressão 3D. Liga o vendedor ao comprador através de um painel privado de gestão e de uma página pública de acompanhamento acessível por um link secreto, sem criação de conta pelo comprador.'),
      p('A visão funcional inclui três experiências complementares: o painel do vendedor, o portal de acompanhamento do comprador e o passaporte digital da peça, com certificado de autenticidade verificável. A implementação atual cobre apenas parte desta visão; o Capítulo 6 e a matriz de funcionalidades detalham o que existe, o que está bloqueado e o que é apenas planeado.'),
      h2('1.2 Problema que o produto pretende resolver'),
      bullets(
        'Comunicação dispersa: o estado da encomenda vive em mensagens de WhatsApp, email e chamadas, obrigando a respostas repetidas.',
        'Processo invisível: o comprador não tem uma fonte única de verdade sobre o progresso, a previsão ou as alterações.',
        'Qualidade sem prova: depois da entrega não existe um registo verificável do material, dos parâmetros de impressão e da garantia.',
        'Marca diluída: pequenas oficinas competem com empresas maiores sem uma experiência digital que sustente um preço premium.',
      ),
      h2('1.3 Público-alvo'),
      table(
        ['Segmento', 'Necessidade principal', 'Relação com o produto'],
        [
          ['Estúdios de prototipagem', 'Reduzir suporte repetitivo e dar previsibilidade a clientes empresariais', 'Painel de encomendas e link público'],
          ['Criadores de peças personalizadas', 'Valorizar o trabalho e comunicar proveniência', 'Passaporte digital e certificado'],
          ['Pequenos fabricantes', 'Manter histórico de parâmetros e reposições', 'Ficha técnica, número de série e arquivo'],
          ['Compradores finais', 'Saber o estado da encomenda sem criar conta', 'Página pública por token'],
        ],
        { widths: [24, 40, 36] },
      ),
      h2('1.4 Proposta de valor'),
      bullets(
        'Um único link privado substitui dezenas de mensagens de acompanhamento.',
        'A experiência do comprador é mobile-first e não exige registo, palavra-passe ou aplicação.',
        'A oficina aplica a sua marca ao portal, aos documentos e ao certificado.',
        'A peça ganha identidade técnica e um código de verificação pública.',
        'A arquitetura multi-empresa foi desenhada desde o início, embora a eficácia do isolamento ainda não esteja validada por testes.',
      ),
      h2('1.5 Âmbito atual e evolução prevista'),
      table(
        ['Experiência', 'Estado nesta auditoria', 'Observação'],
        [
          ['Painel do vendedor', 'Parcial', 'Autenticação, perfil, estados e listagem existem. Criação de encomendas está bloqueada; edição e atualização de estado não estão implementadas.'],
          ['Portal do comprador', 'Bloqueado', 'A interface existe, mas consulta tabelas protegidas como anon e falha por RLS. As RPCs públicas existem e não são usadas.'],
          ['Passaporte da peça', 'Bloqueado', 'Página stub, parâmetro de rota incompatível e ausência de leitura de dados.'],
          ['Certificados e recibos', 'Parcial', 'Modelo de dados e esqueletos de PDF. Não existe emissão, template ou fluxo de download.'],
          ['QR codes', 'Planeado', 'Biblioteca instalada, sem qualquer utilização no código.'],
        ],
        { widths: [26, 16, 58] },
      ),
      h2('1.6 Método e limitações da auditoria'),
      p('Esta documentação foi produzida a partir de uma análise estática do repositório local, da execução dos comandos de build e lint e da leitura integral do esquema SQL. Não foi possível validar o comportamento em execução contra um projeto Supabase real, porque não existe ambiente configurado nem credenciais no repositório.'),
      bullets(
        'Fonte de verdade: ficheiros em src/, supabase/schema.sql, supabase/seed.sql, package.json e configurações do projeto.',
        'Comandos executados: npm run build, npx vite build, npm run lint, npx tsc -p tsconfig.json --noEmit --ignoreDeprecations 6.0 e npm audit.',
        'Não foram executadas migrações, seeds, alterações de código, commits ou testes de penetração.',
        'Não foram inventados clientes, métricas, preços, certificações, integrações ou resultados de testes.',
        'Sempre que não existe evidência suficiente, o estado é apresentado como “Não confirmada”.',
      ),
      callout('danger', 'Conclusão de leitura rápida', 'Nenhuma funcionalidade de aplicação atinge o estado “Implementada e validada”, porque não existe qualquer teste automatizado. Além disso, o build de produção falha, as páginas públicas estão bloqueadas pela RLS e a criação de encomendas falha por um campo obrigatório não preenchido. O produto não está pronto para comercialização.'),
      h2('1.7 Glossário essencial'),
      table(
        ['Termo', 'Definição'],
        [
          ['White-label', 'Produto em que a marca visível é a do vendedor, não a do fornecedor da plataforma.'],
          ['Token público', 'Cadeia aleatória longa usada no link do comprador; não é sequencial nem previsível.'],
          ['RLS', 'Row Level Security: políticas do PostgreSQL que filtram linhas por utilizador/empresa.'],
          ['RPC', 'Função remota do PostgreSQL exposta pelo Supabase e chamável pelo cliente.'],
          ['Passaporte digital', 'Página pública com a identidade técnica e o histórico de uma peça.'],
          ['Selo', 'Nível de qualidade atribuído pela oficina (bronze, prata ou ouro); não é uma certificação legal.'],
          ['SLA', 'Acordo de nível de serviço; não existe nem está documentado no produto.'],
          ['Tenant', 'Empresa isolada dentro da arquitetura multi-empresa.'],
        ],
        { widths: [24, 76] },
      ),
      h2('1.8 Como ler os estados'),
      table(
        ['Estado', 'Significado'],
        [
          [STATUS.validated, 'Existe código e evidência de teste ou validação adequada.'],
          [STATUS.unvalidated, 'Existe código, mas não há testes ou confirmação suficiente.'],
          [STATUS.partial, 'Existem partes do fluxo, mas falta implementação ou integração.'],
          [STATUS.planned, 'Está previsto, mas não existe implementação suficiente.'],
          [STATUS.blocked, 'Existe código ou dependência, mas há erro, bloqueio ou limitação conhecida.'],
          [STATUS.unconfirmed, 'Não existe evidência suficiente para classificar.'],
        ],
        { widths: [34, 66] },
      ),
      h2('1.9 Estrutura do documento'),
      p('O documento segue dezoito capítulos. Os capítulos 2 a 9 constituem a referência técnica e funcional; os capítulos 10 a 14 cobrem conformidade, operação, qualidade e desempenho; os capítulos 15 a 18 consolidam riscos, roadmap, suporte e anexos. A matriz de funcionalidades do Anexo A é a fonte de verdade para qualquer afirmação sobre o estado do produto.'),
    ],
  },

  {
    number: 2,
    title: 'Requisitos do sistema',
    blocks: [
      h1(2, 'Requisitos do sistema', 'Requisitos funcionais, não funcionais e de segurança, com identificadores e estado de verificação.'),
      h2('2.1 Método de identificação'),
      p('Os requisitos abaixo representam o âmbito necessário para operar o OrbitTrack como SaaS comercial. A coluna “Estado” não avalia a ambição do requisito: avalia apenas a evidência encontrada no código. Um requisito pode estar corretamente especificado e ainda assim não estar implementado.'),
      h2('2.2 Requisitos funcionais'),
      table(
        ['ID', 'Requisito', 'Estado', 'Evidência e limitação principal'],
        [
          ['RF-001', 'Registar vendedor com email e palavra-passe', STATUS.unvalidated, 'Registar.tsx + Supabase Auth; sem testes e sem confirmação de email validada.'],
          ['RF-002', 'Iniciar e terminar sessão', STATUS.unvalidated, 'Login.tsx, LayoutPainel.tsx e AuthContext; sem testes de sessão expirada.'],
          ['RF-003', 'Recuperar palavra-passe', STATUS.blocked, 'Redirect para rota inexistente /painel/redefinir-senha.'],
          ['RF-004', 'Criar empresa automaticamente no registo', STATUS.unvalidated, 'Trigger em auth.users; não validado e sem UNIQUE(utilizador_id).'],
          ['RF-005', 'Editar perfil e identidade da empresa', STATUS.unvalidated, 'EmpresaPerfil.tsx; validação apenas HTML.'],
          ['RF-006', 'Carregar logótipo e capa', STATUS.partial, 'Upload sem validação de tipo/tamanho; bucket público.'],
          ['RF-007', 'Configurar estados por empresa', STATUS.unvalidated, 'EstadosConfig.tsx; sem unicidade e sem testes.'],
          ['RF-008', 'Criar encomenda com dados do comprador', STATUS.blocked, 'Falta numero_encomenda NOT NULL; criação falha.'],
          ['RF-009', 'Adicionar itens com ficha técnica', STATUS.partial, 'Formulário só expõe nome, quantidade e preço; restantes campos existem na base.'],
          ['RF-010', 'Listar encomendas da empresa', STATUS.unvalidated, 'EncomendasLista.tsx; sem paginação, filtros ou ações.'],
          ['RF-011', 'Editar encomenda existente', STATUS.blocked, 'fetchEncomenda vazio; não carrega nem atualiza.'],
          ['RF-012', 'Atualizar estado com mensagem e fotos', STATUS.planned, 'Tabelas existem; não existe UI nem handler.'],
          ['RF-013', 'Registar histórico de estados', STATUS.partial, 'Tabela e RPC de leitura; nenhuma escrita pela aplicação.'],
          ['RF-014', 'Gerar link público com token seguro', STATUS.partial, 'Token de 18 bytes no schema; não existe UI para copiar/partilhar.'],
          ['RF-015', 'Acompanhar encomenda publicamente', STATUS.blocked, 'Página consulta tabelas como anon; RLS bloqueia.'],
          ['RF-016', 'Mostrar timeline, estado e previsão', STATUS.partial, 'UI existe; sem dados e sem tratamento de previsão nula.'],
          ['RF-017', 'Mostrar fotos no portal público', STATUS.planned, 'Tabela e RPC devolvem fotos; UI não as apresenta.'],
          ['RF-018', 'Mostrar ficha técnica e quantidade', STATUS.partial, 'UI mostra material, cor, camada e enchimento; faltam tempo, peso, impressora, série e data.'],
          ['RF-019', 'Visualizar modelo 3D', STATUS.partial, 'Viewer3D apenas GLB/GLTF; STL não suportado; sem fallback.'],
          ['RF-020', 'Passaporte digital da peça', STATUS.blocked, 'Página stub e parâmetro de rota errado.'],
          ['RF-021', 'Emitir recibo em PDF', STATUS.partial, 'Esboço em pdfGenerators.ts; sem itens, marca, numeração ou chamada.'],
          ['RF-022', 'Emitir certificado em PDF', STATUS.partial, 'Esboço simples; sem selo gráfico, critérios, QR ou marca.'],
          ['RF-023', 'Verificar certificado por código', STATUS.blocked, 'UI consulta tabela como anon, ignora :codigo e não apresenta todos os campos.'],
          ['RF-024', 'Gerar QR PNG/PDF', STATUS.planned, 'Biblioteca instalada; nenhuma utilização.'],
          ['RF-025', 'Submeter avaliação pública', STATUS.planned, 'RPC existe; não há formulário; sem validação de estado/abuso.'],
          ['RF-026', 'Dashboard com indicadores', STATUS.partial, 'Contagem real; tempo médio e avaliação média fixos.'],
          ['RF-027', 'Pesquisar, filtrar, ordenar e paginar', STATUS.planned, 'Sem implementação; lista carrega tudo.'],
          ['RF-028', 'Editor de template de certificado', STATUS.planned, 'Não existe.'],
          ['RF-029', 'Aplicar marca da empresa ao portal e documentos', STATUS.partial, 'Portal usa cor primária; documentos e certificado não.'],
          ['RF-030', 'Contactar a oficina a partir do portal', STATUS.partial, 'Ícones de telefone e Instagram; sem email/WhatsApp nem formulário.'],
        ],
        { widths: [10, 32, 17, 41], fontSize: 7.5 },
      ),
      h2('2.3 Requisitos não funcionais'),
      table(
        ['ID', 'Requisito', 'Critério de aceitação', 'Estado'],
        [
          ['RNF-001', 'Desempenho percetível', 'Primeira renderização útil inferior a 2,5 s em 4G; lista paginada.', 'Não medido'],
          ['RNF-002', 'Mobile-first', 'Todas as páginas utilizáveis entre 320 px e 430 px de largura.', 'Parcial'],
          ['RNF-003', 'Acessibilidade', 'WCAG 2.2 AA nas páginas principais; navegação por teclado.', 'Não validado'],
          ['RNF-004', 'Compatibilidade', 'Últimas duas versões de Chrome, Edge, Firefox e Safari.', 'Não validado'],
          ['RNF-005', 'Disponibilidade', 'Objetivo a definir; sem SLA atual.', 'Não definido'],
          ['RNF-006', 'Recuperação', 'RPO/RTO definidos; backups testados.', 'Não definido'],
          ['RNF-007', 'Manutenibilidade', 'Build, lint e tipos verdes em CI.', 'Bloqueado'],
          ['RNF-008', 'Observabilidade', 'Erros e eventos críticos registados com correlação.', 'Planeado'],
          ['RNF-009', 'Privacidade', 'Minimização, retenção e direitos dos titulares documentados.', 'Planeado'],
          ['RNF-010', 'Internacionalização', 'Textos externalizados; pt-PT como língua base.', 'Não implementado'],
          ['RNF-011', 'Custos', 'Consumo previsível e alertas de faturação.', 'Não definido'],
          ['RNF-012', 'Escalabilidade', 'Consultas paginadas e índices adequados a 10× o volume inicial.', 'Parcial'],
        ],
        { widths: [13, 25, 47, 15] },
      ),
      h2('2.4 Requisitos de segurança'),
      table(
        ['ID', 'Requisito', 'Evidência atual', 'Estado'],
        [
          ['SEG-001', 'RLS ativa em todas as tabelas de negócio', '9 tabelas com RLS', 'Não validado'],
          ['SEG-002', 'Isolamento entre empresas', 'Políticas por empresa_id/auth.uid()', 'Não validado'],
          ['SEG-003', 'Acesso público apenas por RPC segura', 'RPCs existem, mas UI não as usa', 'Bloqueado'],
          ['SEG-004', 'Buckets privados para dados de encomendas', 'public=true', 'Falha'],
          ['SEG-005', 'Políticas de Storage por proprietário', 'Apenas bucket_id', 'Falha'],
          ['SEG-006', 'Validação de uploads', 'Helpers existem, não são usados', 'Falha'],
          ['SEG-007', 'Validação de entradas no servidor', 'Apenas constraints básicas', 'Parcial'],
          ['SEG-008', 'Rate limiting em RPCs públicas', 'Não existe', 'Falha'],
          ['SEG-009', 'Segredos fora do repositório', 'Apenas .env.example', 'Conforme'],
          ['SEG-010', 'Sessões e recuperação seguras', 'Recuperação quebrada', 'Falha'],
          ['SEG-011', 'Cabeçalhos de segurança e CSP', 'Não configurados', 'Planeado'],
          ['SEG-012', 'Registo de auditoria', 'Apenas histórico de estados', 'Parcial'],
        ],
        { widths: [13, 35, 37, 15] },
      ),
      h2('2.5 Restrições conhecidas'),
      bullets(
        'Não existe backend próprio: toda a lógica de acesso passa pelo Supabase e pelas políticas RLS.',
        'O build de produção falha antes de gerar qualquer artefacto.',
        'Não existe ambiente de testes nem credenciais configuradas no repositório.',
        'A documentação não substitui revisão jurídica, fiscal ou de segurança.',
        'O produto não emite faturas certificadas; recibos e certificados são documentos da oficina, não documentos fiscais.',
      ),
      h2('2.6 Critérios de aceitação para produção'),
      numbered(
        'Build e verificação de tipos terminam sem erros; existe pipeline de CI.',
        'Todos os fluxos P0 (criar encomenda, link público, verificação) funcionam com dados reais.',
        'Testes de RLS e Storage provam isolamento entre duas empresas.',
        'Uploads validados, buckets privados e URLs assinadas em produção.',
        'Recuperação de palavra-passe e confirmação de email testadas.',
        'Documentação legal publicada e tratamento de dados revisto.',
        'Monitorização, backups e procedimentos de incidente definidos.',
        'Nenhuma métrica ou promessa comercial depende de valores fixos ou dados fictícios.',
      ),
    ],
  },

  {
    number: 3,
    title: 'Arquitetura técnica',
    blocks: [
      h1(3, 'Arquitetura técnica', 'Como o OrbitTrack está construído, que serviços utiliza e onde estão as fronteiras de confiança.'),
      h2('3.1 Visão geral'),
      p('O OrbitTrack é uma single-page application (SPA) React que comunica diretamente com o Supabase. Não existe servidor de aplicação próprio. O browser autentica-se com o Supabase Auth, recebe um JWT e usa o cliente Supabase para ler e escrever no PostgreSQL através do PostgREST. As políticas RLS decidem, linha a linha, o que cada utilizador pode ver ou alterar.'),
      p('As páginas públicas usam a chave anónima e não têm sessão. A arquitetura prevê que essas páginas chamem funções RPC SECURITY DEFINER, que devolvem apenas o JSON necessário. Na implementação atual, as páginas públicas ainda consultam tabelas diretamente e, por isso, falham.'),
      figure('assets/arquitetura.png', 'Figura 1 — Arquitetura lógica: SPA, Supabase e serviços executados no browser.', 16.2),
      h2('3.2 Tecnologias efetivamente utilizadas'),
      table(
        ['Camada', 'Tecnologia', 'Versão no projeto', 'Responsabilidade'],
        [
          ['UI', 'React', '19.3.1', 'Componentes, estado local e composição da interface.'],
          ['Build', 'Vite', '8.3.4 (instalado 8.3.5)', 'Servidor de desenvolvimento e bundling.'],
          ['Linguagem', 'TypeScript', '~6.0.3', 'Tipagem estática; verificação atualmente falha.'],
          ['Estilos', 'Tailwind CSS', '4.3.3', 'Utilitários e tema; build falha no @apply de classe personalizada.'],
          ['Rotas', 'React Router', '7.18.4', 'Navegação SPA e rotas protegidas.'],
          ['Backend', 'Supabase', '@supabase/supabase-js 2.118.0', 'Auth, PostgREST, Storage e funções RPC.'],
          ['Base de dados', 'PostgreSQL', 'Gerido pelo Supabase', 'Tabelas, índices, triggers e RLS.'],
          ['3D', 'three.js + React Three Fiber + drei', '0.186.1 / 9.8.2 / 10.7.9', 'Visualizador GLB/GLTF no browser.'],
          ['PDF', 'jsPDF + jspdf-autotable', '4.2.1 / 5.0.9', 'Geração de documentos no cliente (esboços).'],
          ['QR', 'qrcode.react', '4.0.1', 'Previsto para QR codes; não usado.'],
          ['Datas', 'date-fns', '4.4.0', 'Formatação de datas em pt-PT.'],
          ['Ícones', 'lucide-react', '0.468.0', 'Ícones da interface.'],
          ['Documentação', 'pptxgenjs, docx, sharp, qrcode', 'Ferramentas de build', 'Geração dos materiais entregues; não fazem parte do runtime da aplicação.'],
        ],
        { widths: [16, 27, 20, 37] },
      ),
      h2('3.3 Componentes e responsabilidades'),
      bullets(
        'Browser do vendedor: executa a SPA, mantém a sessão Supabase e envia o JWT em cada pedido.',
        'Browser do comprador: executa a mesma SPA sem sessão; o token público é o único segredo de acesso.',
        'Supabase Auth: registo, login, sessão, recuperação e JWT.',
        'PostgREST: expõe tabelas e RPCs; aplica RLS e permissões por role.',
        'PostgreSQL: armazena empresas, encomendas, itens, histórico, fotos, recibos, certificados e avaliações.',
        'Storage: armazena logótipos, capas, fotos e modelos 3D; atualmente com buckets públicos.',
        'Serviços no browser: three.js para 3D, jsPDF para PDF e qrcode.react para QR (previsto).',
      ),
      h2('3.4 Fluxo de dados do vendedor'),
      numbered(
        'O utilizador inicia sessão; o Supabase devolve uma sessão com JWT.',
        'O AuthContext consulta a tabela empresas pelo utilizador autenticado.',
        'As páginas do painel usam o cliente Supabase para SELECT/INSERT/UPDATE.',
        'O PostgREST avalia as políticas RLS com auth.uid() e o empresa_id da linha.',
        'Os dados autorizados são devolvidos ao browser e renderizados.',
      ),
      h2('3.5 Fluxo de dados do comprador'),
      numbered(
        'O vendedor partilha um link com o token público (previsto; ainda sem UI).',
        'O comprador abre /acompanhar/:token sem sessão.',
        'A página deve chamar obter_encomenda_publica(token) com a chave anon.',
        'A função SECURITY DEFINER valida o token e devolve apenas o JSON público.',
        'A página renderiza estado, timeline, itens, fotos, recibo e certificado (previsto).',
      ),
      callout('danger', 'Estado real do fluxo público', 'A página actual não chama a RPC. Consulta encomendas, empresas, itens e histórico diretamente como anon. Como não existem políticas de SELECT para anon, a consulta é rejeitada e o comprador vê o estado de erro.'),
      h2('3.6 Autenticação e autorização'),
      p('A autenticação é delegada no Supabase Auth. A autorização é implementada em duas camadas: o cliente esconde rotas e ecrãs, e o PostgreSQL aplica RLS. A segunda camada é a única que pode ser considerada uma barreira de segurança; a primeira é apenas experiência de utilização.'),
      table(
        ['Área', 'Quem acede', 'Mecanismo', 'Estado'],
        [
          ['/login, /registar, /recuperar-senha', 'Público', 'Supabase Auth', 'Parcial'],
          ['/painel/**', 'Vendedor autenticado', 'RotaProtegida + RLS', 'Não validado'],
          ['/acompanhar/:token', 'Público com token', 'RPC prevista; atualmente tabela direta', 'Bloqueado'],
          ['/peca/:tokenPeca', 'Público com token', 'RPC prevista; página stub', 'Bloqueado'],
          ['/verificar/:codigo', 'Público com código', 'RPC prevista; atualmente tabela direta', 'Bloqueado'],
        ],
        { widths: [28, 22, 36, 14] },
      ),
      h2('3.7 Storage'),
      table(
        ['Bucket', 'Conteúdo', 'Visibilidade', 'Políticas atuais'],
        [
          ['empresas', 'Logótipos e fotos de capa', 'Público', 'Qualquer autenticado pode inserir/atualizar/apagar em qualquer caminho.'],
          ['encomendas', 'Fotos, modelos 3D e ficheiros de encomendas', 'Público', 'Qualquer autenticado pode inserir/atualizar/apagar em qualquer caminho.'],
        ],
        { widths: [18, 34, 16, 32] },
      ),
      p('O modelo de caminho usado no upload é `${empresa.id}/${tipo}-${timestamp}.${ext}` para imagens de empresa. Não existe validação de que o primeiro segmento pertence ao utilizador autenticado. Esta é uma das falhas mais graves identificadas.'),
      h2('3.8 Geração de PDFs'),
      p('A geração está prevista para o cliente, com jsPDF. As funções existentes em src/lib/pdfGenerators.ts são esboços: escrevem texto simples, não usam a marca da empresa, não incluem itens, selo, QR ou critérios e não são chamadas por nenhuma página. Não há geração no servidor nem assinatura digital.'),
      h2('3.9 Decisões de arquitetura'),
      table(
        ['Decisão', 'Justificação', 'Consequência / estado'],
        [
          ['SPA + BaaS, sem backend próprio', 'Menor custo operacional e arranque rápido.', 'Segurança concentrada em RLS e RPC; exige testes rigorosos.'],
          ['White-label por dados', 'Cada empresa define nome, cores, logótipo e contactos.', 'Não há instâncias separadas; o isolamento é lógico.'],
          ['Token público longo', 'Acesso do comprador sem conta.', 'O link é um segredo; deve ser tratado como credencial.'],
          ['RPC SECURITY DEFINER para leitura pública', 'Evita expor tabelas e políticas anon.', 'Existe no schema, mas não está ligada à UI.'],
          ['PDF no cliente', 'Documentos não passam por servidores de terceiros.', 'Difícil garantir consistência, numeração e auditoria.'],
          ['Deploy previsto na Vercel', 'SPA estática e CDN.', 'Falta vercel.json, CI e build funcional.'],
        ],
        { widths: [27, 34, 39] },
      ),
      h2('3.10 Topologia de deploy prevista'),
      table(
        ['Elemento', 'Configuração atual', 'Necessário'],
        [
          ['Frontend', 'Sem vercel.json; build falha', 'Rewrites SPA, variáveis de ambiente e preview deployments.'],
          ['Supabase', 'schema.sql manual; sem migrações versionadas', 'Migrações, ambiente de teste e backups.'],
          ['Storage', 'Buckets públicos', 'Buckets privados e URLs assinadas.'],
          ['Domínios', 'Não configurados', 'Domínio, TLS, redirect URLs e CORS.'],
          ['CI/CD', 'Não existe', 'Pipeline de lint, tipos, testes e build.'],
        ],
        { widths: [22, 40, 38] },
      ),
      callout('warn', 'Nota de arquitetura', 'A ausência de backend próprio não dispensa validação no servidor. Constraints, RLS, funções RPC e políticas de Storage são o “servidor” do OrbitTrack; qualquer regra que exista apenas no React pode ser contornada.'),
    ],
  },

  {
    number: 4,
    title: 'Estrutura do código',
    blocks: [
      h1(4, 'Estrutura do código', 'Mapa dos diretórios, rotas, componentes e convenções, com os caminhos confirmados no repositório.'),
      h2('4.1 Árvore de diretórios'),
      code(`orbittrack/
├─ public/
│  ├─ brand/                  # logótipo e variações (novos)
│  ├─ favicon.svg
│  └─ icons.svg
├─ src/
│  ├─ assets/                 # imagens de exemplo do template Vite
│  ├─ components/
│  │  ├─ painel/LayoutPainel.tsx
│  │  ├─ viewer3d/Viewer3D.tsx
│  │  └─ RotaProtegida.tsx
│  ├─ contexts/AuthContext.tsx
│  ├─ lib/
│  │  ├─ pdfGenerators.ts
│  │  ├─ supabase.ts
│  │  ├─ types.ts
│  │  └─ utils.ts
│  ├─ pages/
│  │  ├─ Login.tsx
│  │  ├─ Registar.tsx
│  │  ├─ RecuperarSenha.tsx
│  │  ├─ painel/{Dashboard,EncomendasLista,EncomendaForm,EmpresaPerfil,EstadosConfig}.tsx
│  │  └─ publico/{AcompanharEncomenda,PecaPassaporte,VerificarCertificado}.tsx
│  ├─ App.css
│  ├─ App.tsx
│  ├─ index.css
│  └─ main.tsx
├─ supabase/
│  ├─ schema.sql
│  └─ seed.sql
├─ scripts/                   # ferramentas de documentação e apresentação
├─ package.json
├─ tsconfig.json
└─ vite.config.ts`),
      p('A árvore acima reflete os ficheiros existentes. Não foram encontrados testes, migrações versionadas, pipeline de CI, vercel.json ou documentação técnica prévia.'),
      h2('4.2 Rotas'),
      table(
        ['Rota', 'Componente', 'Acesso', 'Estado'],
        [
          ['/login', 'Login.tsx', 'Público', 'Não validado'],
          ['/registar', 'Registar.tsx', 'Público', 'Não validado'],
          ['/recuperar-senha', 'RecuperarSenha.tsx', 'Público', 'Parcial (destino inexistente)'],
          ['/acompanhar/:token', 'AcompanharEncomenda.tsx', 'Público', 'Bloqueado por RLS'],
          ['/peca/:tokenPeca', 'PecaPassaporte.tsx', 'Público', 'Bloqueado/stub'],
          ['/verificar/:codigo', 'VerificarCertificado.tsx', 'Público', 'Bloqueado por RLS'],
          ['/verificar', 'VerificarCertificado.tsx', 'Público', 'Não validado'],
          ['/painel', 'Dashboard.tsx', 'Protegido', 'Parcial'],
          ['/painel/encomendas', 'EncomendasLista.tsx', 'Protegido', 'Não validado'],
          ['/painel/encomendas/nova', 'EncomendaForm.tsx', 'Protegido', 'Bloqueado'],
          ['/painel/encomendas/:id/editar', 'EncomendaForm.tsx', 'Protegido', 'Bloqueado/stub'],
          ['/painel/empresa', 'EmpresaPerfil.tsx', 'Protegido', 'Não validado'],
          ['/painel/estados', 'EstadosConfig.tsx', 'Protegido', 'Não validado'],
          ['*', 'Navigate para /login', 'Público', 'Não existe página 404'],
        ],
        { widths: [32, 28, 18, 22] },
      ),
      h2('4.3 Responsabilidade dos ficheiros'),
      table(
        ['Ficheiro', 'Responsabilidade', 'Observações'],
        [
          ['src/App.tsx', 'Define todas as rotas e o layout protegido.', 'Importação estática de todas as páginas; aumenta o bundle.'],
          ['src/main.tsx', 'Monta React, importa o CSS e envolve a aplicação em AuthProvider.', 'AuthProvider duplicado: App também envolve AuthProvider.'],
          ['src/contexts/AuthContext.tsx', 'Sessão, utilizador, empresa, login, registo, logout e recuperação.', 'Ignora erros de fetchEmpresa; redirect de recuperação inválido.'],
          ['src/components/RotaProtegida.tsx', 'Redireciona para /login se não houver utilizador.', 'Proteção apenas client-side.'],
          ['src/components/painel/LayoutPainel.tsx', 'Sidebar, navegação e logout.', 'Menu mobile funcional; botões sem aria-label.'],
          ['src/pages/Login.tsx', 'Formulário de início de sessão.', 'Erro genérico; sem rate limiting visível.'],
          ['src/pages/Registar.tsx', 'Formulário de registo.', 'Mínimo de 6 caracteres; navigate não usado.'],
          ['src/pages/RecuperarSenha.tsx', 'Pedido de recuperação.', 'Não existe ecrã de redefinição.'],
          ['src/pages/painel/Dashboard.tsx', 'Contagem de encomendas e dois cartões fixos.', 'Valores 3 dias e 4.8 não são calculados.'],
          ['src/pages/painel/EncomendasLista.tsx', 'Tabela de encomendas.', 'Sem handlers, filtros ou paginação.'],
          ['src/pages/painel/EncomendaForm.tsx', 'Criação de encomenda e itens.', 'Não envia numero_encomenda; edição vazia.'],
          ['src/pages/painel/EmpresaPerfil.tsx', 'Perfil e uploads de marca.', 'Sem validação de ficheiros; pré-visualização simples.'],
          ['src/pages/painel/EstadosConfig.tsx', 'CRUD de estados.', 'Reordenação local; gravação sequencial.'],
          ['src/pages/publico/AcompanharEncomenda.tsx', 'Portal do comprador.', 'Consulta tabelas como anon; não usa RPC.'],
          ['src/pages/publico/PecaPassaporte.tsx', 'Passaporte digital.', 'Stub; parâmetro errado.'],
          ['src/pages/publico/VerificarCertificado.tsx', 'Verificação de certificado.', 'Consulta tabela; ignora :codigo.'],
          ['src/components/viewer3d/Viewer3D.tsx', 'Visualizador 3D GLB/GLTF.', 'Sem STL, erro ou fallback.'],
          ['src/lib/supabase.ts', 'Cliente Supabase e validação de env.', 'Lança erro se faltarem variáveis.'],
          ['src/lib/types.ts', 'Tipos TypeScript do domínio.', 'Bom ponto de partida; alguns tipos duplicados nas páginas.'],
          ['src/lib/utils.ts', 'Formatação, token, validação e limites.', 'Validadores não são usados; cn() não usa tailwind-merge.'],
          ['src/lib/pdfGenerators.ts', 'Esboços de recibo e certificado.', 'Não usado; sem marca nem QR.'],
          ['supabase/schema.sql', 'Tabelas, índices, funções, triggers, RLS e Storage.', 'Fonte de verdade da base de dados.'],
          ['supabase/seed.sql', 'Dados de demonstração.', 'Inválido: FK e numero_encomenda em falta.'],
        ],
        { widths: [29, 39, 32], fontSize: 7.6 },
      ),
      h2('4.4 Gestão de estado'),
      p('Não existe biblioteca de data fetching ou cache (React Query, SWR, Zustand). O estado é local a cada página, com useState/useEffect, e o contexto de autenticação guarda user, session e empresa. Isto é suficiente para um protótipo, mas origina pedidos repetidos, estados de erro inconsistentes e dificuldade em invalidar dados após mutações.'),
      h2('4.5 Validação de dados'),
      bullets(
        'A validação no cliente resume-se a atributos HTML (required, type=email, minLength=6) e a algumas verificações manuais.',
        'Não existe schema de validação partilhado (Zod, Valibot ou equivalente).',
        'A validação no servidor depende de constraints SQL e de políticas RLS; não há validação semântica de cores, NIF, URLs ou estados.',
        'Os helpers validarImagem, validarFicheiro3D, TAMANHO_MAX_IMAGEM e TAMANHO_MAX_FICHEIRO existem em utils.ts, mas não são chamados.',
      ),
      h2('4.6 Estilos e tema'),
      p('O tema atual usa Tailwind CSS 4 com tokens em src/index.css. A cor primária da aplicação é #2563eb (azul), distinta da identidade indigo #4F46E5 usada nos materiais comerciais. O logótipo criado para a marca não está aplicado ao layout do painel, que continua a usar o ícone Printer e o texto “OrbitTrack”.'),
      callout('warn', 'Inconsistência de marca', 'Os documentos e a apresentação usam a identidade OrbitTrack (indigo/esmeralda). A aplicação usa azul #2563eb e um ícone genérico. Antes de comercializar, alinhar tokens, logótipo, favicon e título da página.'),
      h2('4.7 Configuração e build'),
      table(
        ['Ficheiro', 'Conteúdo', 'Observação'],
        [
          ['package.json', 'Scripts dev, build, lint e preview.', 'Não existe script test.'],
          ['vite.config.ts', 'React, Tailwind e alias @.', 'Usa __dirname; aviso do novo config loader.'],
          ['tsconfig.json', 'Strict, paths @/*, baseUrl.', 'baseUrl provoca TS5101 no TypeScript 6.'],
          ['tsconfig.app.json', 'Configuração de app', 'Sem paths; falha a resolução de @/* se usada isoladamente.'],
          ['index.html', 'Entrada Vite', 'Lang="en", título "orbittrack", sem meta description.'],
          ['.env.example', 'URL, anon key e APP_URL', 'Valores placeholder; nunca inclui service role.'],
          ['README.md', 'Instruções mínimas', 'Texto com caracteres corrompidos e sem estado real.'],
        ],
        { widths: [22, 38, 40] },
      ),
      h2('4.8 Estado do build e da qualidade'),
      code(`npm run build
> tsc -b && vite build
tsconfig.json(19,5): error TS5101: Option 'baseUrl' is deprecated...

npx vite build
Error: Cannot apply unknown utility class \`btn\`
src/index.css

npx tsc -p tsconfig.json --noEmit --ignoreDeprecations 6.0
src/lib/supabase.ts: Property 'env' does not exist on type 'ImportMeta'.
src/main.tsx: Cannot find module or type declarations for side-effect import of './index.css'.
src/pages/painel/EncomendaForm.tsx: Module 'lucide-react' has no exported member 'Cube'.`),
      p('O lint (oxlint) termina com código 0, mas produz 40 avisos, incluindo imports não usados, dependências de hooks em falta e acesso a funções antes da inicialização. Não existe verificação de tipos verde nem build de produção.'),
      h2('4.9 Convenções e dívida técnica'),
      bullets(
        'Nomenclatura mistura português e inglês: componentes e tabelas em português, tipos e APIs em inglês.',
        'Alguns componentes importam React sem o usar; outros usam any em vez dos tipos de src/lib/types.ts.',
        'Existem ficheiros mortos do template Vite (App.css, assets/react.svg, assets/vite.svg) e scripts antigos de geração.',
        'As páginas repetem tipos de domínio em vez de importar os tipos centrais.',
        'Não há barrel files nem separação clara entre serviços, hooks e componentes de apresentação.',
      ),
    ],
  },

  {
    number: 5,
    title: 'Interface e experiência do utilizador',
    blocks: [
      h1(5, 'Interface e experiência do utilizador', 'Fluxos reais de navegação, estados de interface e lacunas de usabilidade e acessibilidade.'),
      h2('5.1 Princípios visuais'),
      bullets(
        'Layout limpo, cartões arredondados, sombras suaves e bastante espaço branco.',
        'Tipografia Inter com fallback de sistema; título de página forte e texto secundário em cinza.',
        'Formulários com labels visíveis, botões primários azuis e mensagens de sucesso/erro em cartões coloridos.',
        'Portal público com hero de capa, cartão de estado em destaque, timeline vertical e lista de peças.',
        'A experiência é mobile-first no portal do comprador; o painel usa sidebar colapsável em mobile.',
      ),
      h2('5.2 Autenticação'),
      table(
        ['Ecrã', 'Elementos', 'Estados', 'Lacunas'],
        [
          ['Login', 'Email, palavra-passe, mostrar/ocultar, links de recuperação e registo.', 'Loading, erro genérico.', 'Sem SSO, sem bloqueio por tentativas, sem mensagens específicas.'],
          ['Registar', 'Email, palavra-passe, confirmação.', 'Validação de 6 caracteres, sucesso.', 'Não confirma política de palavra-passe forte; depende de email.'],
          ['Recuperar', 'Email e confirmação de envio.', 'Loading, erro.', 'Destino do link não existe; fluxo incompleto.'],
        ],
        { widths: [16, 44, 20, 20] },
      ),
      h2('5.3 Navegação do painel'),
      p('A sidebar apresenta Dashboard, Encomendas, A Minha Empresa e Estados. Em mobile, abre por cima do conteúdo com overlay. O cabeçalho mobile mostra o nome OrbitTrack e o botão de menu. O rodapé da sidebar tem a ação Sair.'),
      bullets(
        'A empresa ativa é apresentada sob o nome OrbitTrack, mas não há seletor de empresa porque cada utilizador tem uma empresa.',
        'Não existe breadcrumb, pesquisa global, notificações ou ajuda contextual.',
        'O botão de menu e os botões de ação da lista não têm aria-label.',
      ),
      h2('5.4 Dashboard'),
      p('O dashboard apresenta três cartões: total de encomendas, tempo médio de fabrico e avaliação média. Apenas o total é obtido por query. Os outros dois valores são fixos no código (“3 dias” e “4.8”), pelo que não devem ser apresentados como dados reais.'),
      callout('danger', 'Dados não fiáveis', 'Os cartões de tempo médio e avaliação média mostram valores inventados. Em demonstração comercial, isto deve ser explicitamente identificado como exemplo ou removido até existir cálculo real.'),
      h2('5.5 Formulários'),
      table(
        ['Formulário', 'Campos', 'Validação', 'Problema principal'],
        [
          ['Encomenda', 'Comprador, email, telefone, previsão, notas e itens.', 'HTML required; sem validação semântica.', 'Falta numero_encomenda; criação falha.'],
          ['Empresa', 'Nome, NIF, descrição, cores, contactos, morada, rodapé.', 'HTML required no nome; email type.', 'Sem validação de NIF, URL, Instagram ou cor.'],
          ['Estado', 'Nome, cor, mensagem.', 'Nome obrigatório.', 'Sem unicidade; ordem calculada no cliente.'],
          ['Login/Registo', 'Email e palavra-passe.', 'HTML + mínimo 6.', 'Sem medidor de força ou política.'],
        ],
        { widths: [16, 40, 22, 22] },
      ),
      h2('5.6 Listagens e tabelas'),
      p('A lista de encomendas é uma tabela simples com número, comprador, estado, previsão e três botões de ação (editar, QR, documento). Nenhum dos botões tem handler. Não há pesquisa, filtros, ordenação, paginação, seleção múltipla ou estado vazio explícito. Em ecrãs pequenos, a tabela não tem contentor com scroll horizontal, podendo provocar overflow.'),
      h2('5.7 Modais e confirmações'),
      p('O único diálogo de confirmação é o confirm() nativo do browser ao remover um estado. Não existem modais desenhados, drawers ou confirmações de operações destrutivas com contexto.'),
      h2('5.8 Estados de carregamento, vazio e erro'),
      table(
        ['Ecrã', 'Carregamento', 'Vazio', 'Erro'],
        [
          ['Dashboard', 'Sem indicador visível.', 'Mostra 0.', 'Apenas console.error.'],
          ['Lista de encomendas', 'Texto “A carregar...”.', 'Tabela vazia, sem mensagem.', 'Apenas console.error.'],
          ['Perfil', 'Spinner no botão.', 'Formulário com valores vazios.', 'Cartão vermelho com mensagem.'],
          ['Estados', 'Spinner.', '“Nenhum estado configurado.”', 'Cartão vermelho.'],
          ['Portal público', 'Spinner.', 'Não aplicável.', 'Mensagem “Ops!”, mas causada por RLS.'],
          ['Verificação', 'Botão “A verificar...”.', 'Estado inicial sem instruções.', 'Cartão de código inválido.'],
        ],
        { widths: [20, 26, 26, 28] },
      ),
      h2('5.9 Responsividade'),
      bullets(
        'O painel adapta a sidebar e os formulários em grelha; o portal público foi desenhado para telemóvel.',
        'A tabela de encomendas e a pré-visualização de marca podem transbordar em ecrãs estreitos.',
        'Não foram feitos testes em dispositivos reais nem medições de toque.',
        'O visualizador 3D tem altura fixa de 400 px, sem adaptação a orientação.',
      ),
      h2('5.10 Acessibilidade'),
      table(
        ['Aspeto', 'Observação', 'Recomendação'],
        [
          ['Idioma', 'index.html tem lang="en".', 'Alterar para pt-PT.'],
          ['Foco', 'Alguns botões têm focus:ring; outros não.', 'Garantir foco visível em todos os controlos.'],
          ['Nomes acessíveis', 'Botões de ícone sem aria-label.', 'Adicionar nomes e estados.'],
          ['Formulários', 'Labels associados por htmlFor na maioria.', 'Rever todos e adicionar descrições de erro.'],
          ['Tabelas', 'Sem caption, scope ou resumo.', 'Adicionar semântica de tabela.'],
          ['Contraste', 'Não medido.', 'Auditar com ferramenta e corrigir.'],
          ['Movimento', 'Spinners e transições.', 'Respeitar prefers-reduced-motion.'],
        ],
        { widths: [18, 44, 38] },
      ),
      h2('5.11 Lacunas de experiência prioritárias'),
      numbered(
        'Dar feedback claro quando a criação de encomenda falha, sem alert() genérico.',
        'Substituir as ações inertes da lista por botões funcionais ou removê-las.',
        'Criar um estado vazio com chamada à ação na lista de encomendas.',
        'Eliminar métricas fixas do dashboard ou identificá-las como exemplo.',
        'Ligar o portal público às RPCs e desenhar o estado de link inválido.',
        'Adicionar confirmação e undo para operações destrutivas.',
        'Rever acessibilidade antes de qualquer demonstração com clientes.',
      ),
    ],
  },
];
