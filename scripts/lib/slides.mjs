// Conteúdo da apresentação comercial OrbitTrack.
// Todos os dados de encomendas são fictícios e identificados como exemplo.

export const BRAND = {
  name: 'OrbitTrack',
  tagline: 'Gestão de impressão 3D',
  site: 'orbittrack.pt',
  colors: {
    ink: '0F172A',
    inkSoft: '1E293B',
    muted: '64748B',
    line: 'E2E8F0',
    bg: 'F8FAFC',
    white: 'FFFFFF',
    indigo: '4F46E5',
    indigoDark: '3730A3',
    indigoLight: '818CF8',
    softIndigo: 'EEF2FF',
    emerald: '10B981',
    emeraldDark: '047857',
    softEmerald: 'ECFDF5',
    amber: 'F59E0B',
    amberDark: 'B45309',
    softAmber: 'FFF7ED',
    blue: '3B82F6',
    softBlue: 'EFF6FF',
    rose: 'E11D48',
    softRose: 'FFF1F2',
  },
};

export const STATUS = {
  done: { label: 'Implementado', bg: BRAND.colors.softEmerald, fg: BRAND.colors.emeraldDark },
  partial: { label: 'Parcial', bg: BRAND.colors.softAmber, fg: BRAND.colors.amberDark },
  pending: { label: 'Em desenvolvimento', bg: 'F1F5F9', fg: '475569' },
  planned: { label: 'Planeado', bg: BRAND.colors.softIndigo, fg: '4338CA' },
  blocked: { label: 'Bloqueado', bg: BRAND.colors.softRose, fg: 'BE123C' },
};

export const SLIDES = [
  {
    type: 'cover',
    eyebrow: 'APRESENTAÇÃO COMERCIAL · 2026',
    title: 'OrbitTrack',
    subtitle: 'A plataforma que transforma encomendas de impressão 3D em experiências de confiança.',
    meta: 'Portal white-label  ·  Acompanhamento público  ·  Passaporte digital da peça',
    note:
      'Bom dia. O OrbitTrack nasce de uma constatação simples: o fabrico aditivo profissional cresceu, mas a forma como as oficinas comunicam com os clientes ficou parada no tempo. Esta apresentação mostra o problema, a solução proposta e, com transparência, o estado real do produto. O objetivo é sair da reunião com uma demonstração agendada.',
  },
  {
    type: 'cards3',
    eyebrow: 'O DESAFIO',
    title: 'Vender impressão 3D ainda é gerir incerteza',
    lead: 'O processo de fabrico é sofisticado. A comunicação com o comprador continua artesanal.',
    cards: [
      {
        n: '01',
        title: 'Comunicação dispersa',
        text: 'Estados de encomenda espalhados por WhatsApp, email e chamadas. O mesmo pedido de informação repete-se todos os dias.',
        cost: 'CUSTO: TEMPO',
      },
      {
        n: '02',
        title: 'Processo invisível',
        text: 'O comprador não vê a peça a nascer. A confiança depende apenas da palavra de quem vende.',
        cost: 'CUSTO: CONFIANÇA',
      },
      {
        n: '03',
        title: 'Qualidade sem prova',
        text: 'Depois da entrega não existe um registo verificável do material, dos parâmetros ou da garantia.',
        cost: 'CUSTO: MARGEM',
      },
    ],
    footerNote: 'Sem um ponto único de verdade, o vendedor perde tempo e o comprador perde confiança.',
    note:
      'Peça à audiência para pensar na última encomenda que fizeram online. Em quase todos os setores existe tracking. Na impressão 3D, o tracking continua a ser uma mensagem manual. Estes três problemas têm um custo direto: horas de suporte e margem perdida em negociações de preço.',
  },
  {
    type: 'statement',
    eyebrow: 'A SOLUÇÃO',
    title: 'Um portal com a sua marca, do primeiro estado à última peça',
    lead:
      'O OrbitTrack é um SaaS white-label que liga a oficina ao comprador através de um link privado — sem contas, sem apps e sem fricção.',
    pillars: [
      { title: 'Portal do comprador', text: 'Timeline, previsão de entrega e fichas técnicas — leitura por concluir.' },
      { title: 'Passaporte digital', text: 'Identidade técnica da peça, com certificado verificável previsto.' },
      { title: 'Documentos com marca', text: 'Recibos e certificados com a identidade da oficina (roadmap).' },
    ],
    note:
      'A proposta não é substituir o email ou o WhatsApp: é dar-lhes um destino único. O comprador receberá um link, abrirá no telemóvel e terá resposta para as perguntas que faria por mensagem. Para o vendedor, é menos suporte e uma experiência coerente com o preço que pratica.',
  },
  {
    type: 'value4',
    eyebrow: 'PROPOSTA DE VALOR',
    title: 'Quatro razões para mudar a forma como acompanha encomendas',
    cards: [
      {
        title: 'Menos suporte',
        text: 'O comprador responde a si próprio na timeline. A equipa concentra-se na produção.',
        accent: 'indigo',
      },
      {
        title: 'Preço justificado',
        text: 'Uma experiência profissional e um certificado elevam o valor percebido da peça.',
        accent: 'emerald',
      },
      {
        title: 'Confiança verificável',
        text: 'Cada peça prevê identidade, número de série e um código público de verificação.',
        accent: 'amber',
      },
      {
        title: 'Modelo multi-empresa',
        text: 'RLS por empresa no desenho. O isolamento ainda não foi provado com testes.',
        accent: 'blue',
      },
    ],
    statusNote: 'Visão de valor. Isolamento por RLS, certificado e documentos são roadmap ou estão por validar.',
    note:
      'Estes quatro benefícios estão ligados a funcionalidades previstas. O primeiro será o mais fácil de quantificar num piloto: contar quantas mensagens por encomenda a oficina recebe hoje. Os outros três sustentam a decisão de compra por parte de oficinas que querem posicionar-se num segmento premium.',
  },
  {
    type: 'three',
    eyebrow: 'UMA PLATAFORMA, TRÊS EXPERIÊNCIAS',
    title: 'O mesmo sistema, três pontos de vista',
    columns: [
      {
        tag: 'VENDEDOR',
        title: 'Painel de gestão',
        items: ['Autenticação e perfil da empresa', 'Lista de encomendas e ficha técnica', 'Estados configuráveis com cor e mensagem', 'Dashboard com contagem total'],
        color: 'indigo',
      },
      {
        tag: 'COMPRADOR',
        title: 'Link privado',
        items: ['Sem registo e sem palavra-passe', 'Estrutura de timeline com datas e mensagens', 'Previsão de entrega e notas públicas', 'Contacto direto com a oficina'],
        color: 'emerald',
      },
      {
        tag: 'PEÇA',
        title: 'Passaporte digital',
        items: ['Número de série e data de impressão', 'Material, camada, peso e impressora', 'Visualizador 3D e fotos', 'Certificado com código de verificação'],
        color: 'amber',
      },
    ],
    status: 'partial',
    statusNote: 'Visão funcional. Portal, passaporte e certificados ainda não estão ligados a dados; recibos e QR são roadmap.',
    note:
      'Vale a pena sublinhar a peça como terceiro ponto de vista. O QR code na peça é roadmap, mas o princípio mantém-se: um dia, continuará a funcionar anos depois da encomenda, mesmo que o comprador perca o link original. É este detalhe que transforma um trabalho de impressão numa peça com proveniência.',
  },
  {
    type: 'steps',
    eyebrow: 'COMO FUNCIONA',
    title: 'Da criação da encomenda à avaliação do comprador',
    steps: [
      { n: '1', title: 'Criar', text: 'Encomenda, comprador, itens e ficha técnica.' },
      { n: '2', title: 'Atualizar', text: 'Estado, mensagem e fotos do progresso.' },
      { n: '3', title: 'Partilhar', text: 'Link privado e QR code para a embalagem.' },
      { n: '4', title: 'Acompanhar', text: 'O comprador vê tudo no telemóvel.' },
      { n: '5', title: 'Fechar', text: 'Recibo, certificado e avaliação (roadmap).' },
    ],
    status: 'partial',
    statusNote: 'Fluxo-alvo. Nesta versão, criação de encomenda e atualização de estado ainda não estão operacionais.',
    note:
      'O fluxo foi desenhado para ser compreendido em menos de um minuto. Nesta versão, mostre o painel e explique que o portal do comprador é o próximo marco; a criação e a atualização de estado ainda não estão operacionais.',
  },
  {
    type: 'splitMock',
    eyebrow: 'PAINEL DO VENDEDOR',
    title: 'O pulso da oficina num único ecrã',
    status: 'partial',
    statusNote: 'Apenas a contagem total é calculada. O mock ilustra a evolução; link, recibo e certificado não estão disponíveis.',
    bullets: [
      'Contagem total de encomendas',
      'Configuração de estados por empresa',
      'Perfil white-label com logótipo, capa e cores',
      'Ações de link público e documentos (roadmap)',
    ],
    mock: 'dashboard',
    note:
      'Este ecrã é a base do trabalho diário. Neste momento o dashboard mostra o total de encomendas; os indicadores de encomendas por mês, tempo médio de entrega e avaliação média estão identificados como evolução. Se a audiência perguntar por métricas, seja transparente e enquadre como próxima fase.',
  },
  {
    type: 'table',
    eyebrow: 'GESTÃO DE ENCOMENDAS',
    title: 'O contexto que cada encomenda pode reunir',
    status: 'partial',
    statusNote: 'Apenas a listagem está implementada. A criação falha por numero_encomenda; a edição está vazia e as ações não têm handlers.',
    headers: ['Encomenda', 'Comprador', 'Estado', 'Previsão', 'Total'],
    rows: [
      ['2026-0001', 'Ana Martins', 'A imprimir', '12/11/2026', '84,90 €'],
      ['2026-0002', 'João Silva', 'Acabamento', '18/11/2026', '129,00 €'],
      ['2026-0003', 'Rita Costa', 'Enviada', '21/11/2026', '47,50 €'],
    ],
    caption: 'Dados de exemplo. Não representam clientes reais.',
    side: [
      'Dados do comprador: nome, email e telefone',
      'Itens com material, cor, camada, enchimento, peso e impressora',
      'Notas públicas e notas internas separadas',
      'Previsão de entrega no modelo; histórico por ligar',
    ],
    note:
      'A tabela que vê é ilustrativa, com dados fictícios. O modelo de dados suporta a ficha técnica completa de cada item e separa notas públicas de notas internas. As colunas de pesquisa e filtro fazem parte do próximo ciclo de desenvolvimento, não da versão atual.',
  },
  {
    type: 'timeline',
    eyebrow: 'ESTADOS CONFIGURÁVEIS',
    title: 'O processo da sua oficina, não o nosso',
    states: [
      { name: 'Recebida', color: '94A3B8' },
      { name: 'Em fila', color: 'F59E0B' },
      { name: 'A imprimir', color: '3B82F6' },
      { name: 'Acabamento', color: '8B5CF6' },
      { name: 'Controlo de qualidade', color: '10B981' },
      { name: 'Enviada', color: 'F97316' },
      { name: 'Entregue', color: '22C55E' },
    ],
    bullets: [
      'Cada empresa define nome, ordem, cor e mensagem padrão',
      'Histórico previsto com data, estado e mensagem',
      'A timeline deverá ser a mesma que o comprador vê no link privado',
      'Fotos e mensagens por fase (roadmap)',
      'Estados iniciais prontos a usar, mas totalmente editáveis',
    ],
    status: 'partial',
    statusNote: 'Configuração de estados implementada. Alteração de estado, histórico e fotos ainda não estão ligados.',
    note:
      'Os sete estados iniciais são apenas um ponto de partida. A configuração por empresa permite adaptar o fluxo a quem faz prototipagem rápida ou a quem produz séries maiores. A alteração de estado com upload de fotos está prevista e é o próximo passo natural.',
  },
  {
    type: 'phone',
    eyebrow: 'PORTAL DO COMPRADOR',
    title: 'Uma experiência mobile-first, sem login',
    status: 'partial',
    statusNote: 'Interface implementada; leitura de dados por RPC, recibo e certificado por concluir.',
    bullets: [
      'Link único de 36 caracteres aleatórios, sem sequência',
      'Cabeçalho com logótipo, capa e cores da empresa',
      'Estado atual em destaque e barra de progresso',
      'Estrutura de timeline com datas, mensagens e fotos',
      'Fichas técnicas das peças',
    ],
    note:
      'O comprador nunca cria conta. Recebe um link e abre. Isto reduz drasticamente a fricção e funciona bem em Portugal, onde o WhatsApp é o canal dominante: o link pode ser enviado por lá. A interface está construída; a leitura de dados precisa de ser concluída através das funções RPC já definidas na base de dados.',
  },
  {
    type: 'features3',
    eyebrow: 'PASSAPORTE DIGITAL',
    title: 'A peça deixa de ser anónima',
    status: 'pending',
    statusNote: 'Página e modelo de dados estruturados. Leitura pública e visualizador ainda não ligados.',
    features: [
      {
        title: 'Ficha técnica',
        text: 'Material, cor, altura de camada, enchimento, tempo, peso e impressora.',
      },
      {
        title: 'Visualizador 3D',
        text: 'Componente GLB/GLTF com rotação e zoom; STL ainda não suportado.',
      },
      {
        title: 'Proveniência',
        text: 'Número de série, data de impressão, fotos e certificado associado.',
      },
    ],
    serial: 'OT-2026-0042 · PLA PRETO · 0,20 mm',
    note:
      'O passaporte é o argumento mais diferenciador para oficinas que vendem peças personalizadas ou reposições. Um QR code na peça permite ao proprietário consultar o histórico anos mais tarde. É também a base para serviços pós-venda e garantia.',
  },
  {
    type: 'seal',
    eyebrow: 'CERTIFICAÇÃO',
    title: 'Um selo com verificação pública',
    status: 'partial',
    statusNote: 'Modelo, RPC e interface base definidos. Emissão por concluir; a verificação pública ainda está bloqueada por RLS.',
    seal: { level: 'OURO', code: 'AB7K-92QX', subtitle: 'AUTENTICIDADE VERIFICADA' },
    levels: [
      { name: 'Bronze', text: 'Verificação essencial' },
      { name: 'Prata', text: 'Controlo de qualidade' },
      { name: 'Ouro', text: 'Processo completo' },
    ],
    bullets: [
      'Código único por certificado no modelo de dados',
      'RPC prevê empresa, peça, data de emissão e selo',
      'Critérios de qualidade previstos por empresa',
      'Garantia configurável no modelo (meses)',
    ],
    note:
      'O certificado não substitui uma certificação legal: é um selo de qualidade da própria oficina. O valor está na verificação pública: quando estiver ligada, qualquer pessoa poderá abrir /verificar/AB7K-92QX e confirmar que aquele código existe. Um código de exemplo é usado apenas para ilustração.',
  },
  {
    type: 'docs',
    eyebrow: 'DOCUMENTOS',
    title: 'Recibos e certificados com a identidade da oficina',
    status: 'pending',
    statusNote: 'Esqueleto de geração em jsPDF. Layout final, logótipo e QR por integrar.',
    items: [
      { title: 'Recibo', text: 'Número sequencial por empresa, data, valor, método de pagamento e observações.' },
      { title: 'Certificado', text: 'Selo gráfico, critérios verificados, garantia, código e QR de verificação.' },
      { title: 'Cartão QR', text: 'Formato para imprimir e colar na embalagem ou na própria peça.' },
    ],
    note:
      'A geração no cliente tem uma vantagem prática: os documentos não passam por um servidor de terceiros. O utilizador revê e edita antes de emitir. Neste momento existe a estrutura técnica; o layout profissional é trabalho de acabamento.',
  },
  {
    type: 'qr',
    eyebrow: 'LIGAÇÃO FÍSICO-DIGITAL',
    title: 'Um QR code que continua a funcionar anos depois',
    status: 'planned',
    statusNote: 'Biblioteca de QR instalada. Geração, download PNG/PDF e cartão de embalagem por implementar.',
    steps: [
      { title: 'Imprimir', text: 'Cartão com QR e número da peça.' },
      { title: 'Colar', text: 'Na embalagem ou na base da peça.' },
      { title: 'Verificar', text: 'O cliente abre o passaporte no telemóvel.' },
    ],
    caption: 'QR de exemplo — aponta para um domínio ilustrativo.',
    note:
      'Este é o slide que costuma convencer oficinas de peças técnicas e reposições. O QR não é um link temporário: é a porta de entrada para o passaporte. A implementação atual ainda não gera o QR; a biblioteca está instalada e o desenho de interação está definido.',
  },
  {
    type: 'brand',
    eyebrow: 'WHITE-LABEL',
    title: 'A sua marca em cada ponto de contacto',
    status: 'partial',
    statusNote: 'Perfil, contactos e cores guardados. Aplicação aos PDFs/certificado por concluir; uploads sem validação.',
    swatches: [
      { hex: '#4F46E5', name: 'Indigo' },
      { hex: '#10B981', name: 'Esmeralda' },
      { hex: '#F59E0B', name: 'Âmbar' },
      { hex: '#0F172A', name: 'Grafite' },
      { hex: '#F8FAFC', name: 'Neve' },
    ],
    bullets: [
      'Cores guardadas no perfil da empresa',
      'Logótipo e foto de capa associados ao perfil',
      'Rodapé e contactos editáveis',
      'Aplicação aos PDFs e certificado (roadmap)',
    ],
    note:
      'O white-label é o objetivo: o comprador deve ver a marca da oficina, não a marca OrbitTrack. Isto é particularmente importante para empresas que já investiram em branding e não querem diluí-lo num portal de terceiros. A aplicação das cores ao portal e aos PDFs ainda está por concluir.',
  },
  {
    type: 'security',
    eyebrow: 'SEGURANÇA E ISOLAMENTO',
    title: 'Multi-empresa desde a primeira tabela',
    status: 'partial',
    statusNote: 'Schema RLS e funções definidos. Faltam testes de isolamento e revisão das políticas de Storage.',
    pillars: [
      { title: 'Row Level Security', text: 'Cada linha é filtrada por empresa_id e auth.uid().' },
      { title: 'Tokens públicos', text: '24+ caracteres aleatórios; sem sequência nem enumeração.' },
      { title: 'RPC dedicadas', text: 'Desenhadas para o público ler apenas o que a função devolve; integração por concluir.' },
    ],
    risks: [
      'Buckets atualmente públicos — migrar para privado + URLs assinadas.',
      'Páginas públicas consultam tabelas diretamente — usar as RPC já criadas.',
      'Sem testes automatizados de RLS nem rate limiting.',
    ],
    note:
      'Este slide é deliberadamente técnico. Para parceiros e investidores, mostra maturidade. Para clientes, responde à pergunta “os meus dados ficam separados dos de outra oficina?”. A resposta é sim por desenho, mas a validação com testes ainda está em falta — e é importante dizê-lo.',
  },
  {
    type: 'architecture',
    eyebrow: 'ARQUITETURA',
    title: 'Uma stack atual, simples de operar',
    layers: [
      {
        title: 'Experiência',
        items: ['React 19 + Vite', 'TypeScript', 'Tailwind CSS 4', 'React Router 7'],
        color: 'indigo',
      },
      {
        title: 'Serviços',
        items: ['Supabase Auth', 'PostgreSQL + RLS', 'Storage', 'Funções RPC'],
        color: 'emerald',
      },
      {
        title: 'Conteúdo',
        items: ['three.js + React Three Fiber', 'jsPDF', 'qrcode.react', 'date-fns'],
        color: 'amber',
      },
    ],
    footer: 'Deploy previsto: Vercel (SPA com rewrites para rotas profundas).',
    note:
      'Não há servidor próprio: o frontend fala diretamente com o Supabase, protegido por RLS. Isto reduz custo operacional e tempo de arranque. A contrapartida é que a segurança depende de políticas bem testadas — daí a prioridade dada aos testes de RLS no roadmap.',
  },
  {
    type: 'matrix',
    eyebrow: 'ESTADO ATUAL',
    title: 'O que existe hoje, sem promessas que não possam ser cumpridas',
    rows: [
      ['Autenticação, sessão e recuperação', 'partial'],
      ['Perfil white-label da empresa', 'partial'],
      ['Criação e listagem de encomendas', 'blocked'],
      ['Configuração de estados por empresa', 'partial'],
      ['Dashboard com indicadores de gestão', 'partial'],
      ['Portal público de acompanhamento', 'blocked'],
      ['Passaporte digital da peça', 'blocked'],
      ['Certificados e verificação pública', 'blocked'],
      ['Recibos e cartões QR em PDF', 'pending'],
      ['Pesquisa, filtros e edição de encomendas', 'pending'],
      ['Testes automatizados e validação de RLS', 'planned'],
      ['Notificações automáticas e pagamentos', 'planned'],
    ],
    note:
      'Esta transparência é intencional. Numa venda real, prometer o que não existe destrói a confiança na primeira semana de utilização. O objetivo é fechar os fluxos essenciais antes de escalar comercialmente. A matriz completa, com evidências ficheiro a ficheiro, está na documentação técnica.',
  },
  {
    type: 'personas',
    eyebrow: 'CASOS DE UTILIZAÇÃO',
    title: 'Para quem constrói por encomenda',
    personas: [
      {
        tag: 'ESTÚDIO DE PROTOTIPAGEM',
        title: 'Muitas encomendas, pouca margem para suporte',
        text: 'Precisa de reduzir mensagens repetitivas e dar previsibilidade a clientes empresariais.',
        gain: 'Ganho: menos interrupções, mais horas de máquina.',
      },
      {
        tag: 'PEÇAS PERSONALIZADAS',
        title: 'Cada peça é única e vale contar essa história',
        text: 'Vende para particulares que valorizam proveniência, fotos e garantia.',
        gain: 'Ganho: preço premium sustentado por um passaporte digital.',
      },
      {
        tag: 'PEQUENO FABRICANTE',
        title: 'Reposições e séries curtas ao longo dos anos',
        text: 'Precisa de manter o histórico de parâmetros e materiais por número de série.',
        gain: 'Ganho: reposições mais rápidas e menos erros.',
      },
    ],
    note:
      'Escolha a persona que mais se aproxima da audiência e aprofunde apenas essa. O erro comum é tentar vender para todos ao mesmo tempo. As três personas partilham a mesma dor: a informação técnica e o estado da encomenda estão dispersos.',
  },
  {
    type: 'roadmap',
    eyebrow: 'ROADMAP',
    title: 'Três horizontes, sem datas inventadas',
    phases: [
      {
        tag: 'AGORA',
        title: 'Estabilizar o núcleo',
        items: ['Build de produção verde', 'Ligar portal público às RPC', 'Numeração automática de encomendas', 'Buckets privados e testes de RLS'],
        color: 'emerald',
        criterion: 'Critério: fluxo público funcional em ambiente de ensaio.',
      },
      {
        tag: 'A SEGUIR',
        title: 'Fechar a experiência',
        items: ['Estados com fotos e timeline', 'Recibos e certificados com marca', 'QR codes PNG/PDF', 'Visualizador 3D com fallback'],
        color: 'indigo',
        criterion: 'Critério: documentos emitidos com a marca da oficina.',
      },
      {
        tag: 'DEPOIS',
        title: 'Escalar o negócio',
        items: ['Notificações por email', 'Pagamentos online', 'Métricas e relatórios', 'Integração com impressoras'],
        color: 'amber',
        criterion: 'Critério: integrações validadas com clientes-piloto.',
      },
    ],
    note:
      'Não apresento datas porque não existe equipa dimensionada nem histórico de velocidade que as justifique. O critério é claro: cada horizonte só avança quando o anterior estiver validado. As notificações e os pagamentos estão fora do âmbito da versão atual, mas a arquitetura já os acomoda.',
  },
  {
    type: 'closing',
    eyebrow: 'PRÓXIMO PASSO',
    title: 'Uma demonstração com os dados da sua oficina',
    subtitle:
      'Mostramos o painel e o percurso do comprador com dados de exemplo — em menos de 20 minutos.',
    footer: 'Contacto a preencher pelo vendedor  ·  hello@orbittrack.pt (exemplo)',
    note:
      'Termine com um convite concreto, não com “obrigado”. Proponha uma demonstração de 20 minutos com dados de exemplo, deixando claro o que está funcional e o que é roadmap. Se possível, saia da reunião com data marcada e com o email do responsável.',
  },
];
