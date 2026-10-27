-- ============================================================
-- OrbitTrack - Schema completo para Supabase
-- Portal de acompanhamento de encomendas de impressão 3D
-- ============================================================

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TABELAS
-- ============================================================

-- Empresas (perfil do vendedor)
CREATE TABLE empresas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  utilizador_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL DEFAULT 'A minha empresa',
  logotipo_url TEXT,
  foto_capa_url TEXT,
  cor_primaria TEXT NOT NULL DEFAULT '#2563eb',
  cor_secundaria TEXT NOT NULL DEFAULT '#1e40af',
  descricao TEXT,
  email TEXT,
  telefone TEXT,
  website TEXT,
  instagram TEXT,
  morada TEXT,
  nif TEXT,
  texto_rodape TEXT DEFAULT 'Obrigado pela sua encomenda!',
  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Configuração de estados (editáveis por empresa)
CREATE TABLE configuracao_estados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  ordem INTEGER NOT NULL DEFAULT 0,
  cor TEXT NOT NULL DEFAULT '#6b7280',
  mensagem_padrao TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Encomendas
CREATE TABLE encomendas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  empresa_id UUID NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
  token_publico TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
  numero_encomenda TEXT NOT NULL,
  nome_comprador TEXT NOT NULL,
  email_comprador TEXT,
  telefone_comprador TEXT,
  estado TEXT NOT NULL DEFAULT 'Recebida',
  previsao_entrega DATE,
  notas_publicas TEXT,
  notas_internas TEXT,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizada_em TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empresa_id, numero_encomenda)
);

-- Itens de encomenda
CREATE TABLE itens_encomenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encomenda_id UUID NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
  nome_peca TEXT NOT NULL,
  descricao TEXT,
  quantidade INTEGER NOT NULL DEFAULT 1,
  preco_unitario NUMERIC(10,2),
  material TEXT,
  cor TEXT,
  altura_camada TEXT,
  enchimento_percentagem INTEGER,
  tempo_impressao_minutos INTEGER,
  peso_gramas NUMERIC(10,2),
  impressora_usada TEXT,
  ficheiro_3d_url TEXT,
  numero_serie TEXT,
  token_peca TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  data_impressao DATE,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Histórico de estados
CREATE TABLE historico_estados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encomenda_id UUID NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
  estado TEXT NOT NULL,
  mensagem TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Fotos de encomenda
CREATE TABLE fotos_encomenda (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encomenda_id UUID NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
  item_id UUID REFERENCES itens_encomenda(id) ON DELETE SET NULL,
  url TEXT NOT NULL,
  legenda TEXT,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Recibos
CREATE TABLE recibos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encomenda_id UUID NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
  numero_recibo TEXT NOT NULL,
  data_emissao DATE NOT NULL DEFAULT CURRENT_DATE,
  valor_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  metodo_pagamento TEXT,
  observacoes TEXT,
  criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Certificados de autenticidade
CREATE TABLE certificados (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encomenda_id UUID NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
  item_id UUID REFERENCES itens_encomenda(id) ON DELETE SET NULL,
  codigo_verificacao TEXT NOT NULL UNIQUE,
  texto_personalizado TEXT,
  nivel_selo TEXT NOT NULL DEFAULT 'prata' CHECK (nivel_selo IN ('bronze', 'prata', 'ouro')),
  criterios JSONB DEFAULT '[]'::jsonb,
  prazo_garantia_meses INTEGER DEFAULT 12,
  emitido_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Avaliações
CREATE TABLE avaliacoes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  encomenda_id UUID NOT NULL REFERENCES encomendas(id) ON DELETE CASCADE,
  estrelas INTEGER NOT NULL CHECK (estrelas >= 1 AND estrelas <= 5),
  comentario TEXT,
  criada_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_encomendas_empresa ON encomendas(empresa_id);
CREATE INDEX idx_encomendas_token ON encomendas(token_publico);
CREATE INDEX idx_itens_encomenda ON itens_encomenda(encomenda_id);
CREATE INDEX idx_itens_token_peca ON itens_encomenda(token_peca);
CREATE INDEX idx_historico_encomenda ON historico_estados(encomenda_id);
CREATE INDEX idx_fotos_encomenda ON fotos_encomenda(encomenda_id);
CREATE INDEX idx_certificados_codigo ON certificados(codigo_verificacao);
CREATE INDEX idx_configuracao_empresa ON configuracao_estados(empresa_id);

-- ============================================================
-- FUNÇÕES AUXILIARES
-- ============================================================

-- Gerar número de encomenda sequencial por empresa (AAAA-NNNN)
CREATE OR REPLACE FUNCTION gerar_numero_encomenda(p_empresa_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_ano TEXT;
  v_seq INTEGER;
BEGIN
  v_ano := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(numero_encomenda, '-', 2) AS INTEGER)
  ), 0) + 1
  INTO v_seq
  FROM encomendas
  WHERE empresa_id = p_empresa_id
    AND numero_encomenda LIKE v_ano || '-%';
  
  RETURN v_ano || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$;

-- Gerar número de recibo sequencial por empresa
CREATE OR REPLACE FUNCTION gerar_numero_recibo(p_empresa_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_ano TEXT;
  v_seq INTEGER;
BEGIN
  v_ano := TO_CHAR(NOW(), 'YYYY');
  SELECT COALESCE(MAX(
    CAST(SPLIT_PART(r.numero_recibo, '-', 2) AS INTEGER)
  ), 0) + 1
  INTO v_seq
  FROM recibos r
  JOIN encomendas e ON r.encomenda_id = e.id
  WHERE e.empresa_id = p_empresa_id
    AND r.numero_recibo LIKE 'REC-' || v_ano || '-%';
  
  RETURN 'REC-' || v_ano || '-' || LPAD(v_seq::TEXT, 4, '0');
END;
$$;

-- Gerar código de verificação curto e legível para certificados
CREATE OR REPLACE FUNCTION gerar_codigo_verificacao()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  v_chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  v_codigo TEXT := '';
  v_i INTEGER;
BEGIN
  FOR v_i IN 1..8 LOOP
    v_codigo := v_codigo || SUBSTR(v_chars, FLOOR(RANDOM() * LENGTH(v_chars) + 1)::INTEGER, 1);
    IF v_i = 4 THEN
      v_codigo := v_codigo || '-';
    END IF;
  END LOOP;
  RETURN v_codigo;
END;
$$;

-- Trigger para atualizar atualizada_em
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.atualizada_em = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_empresas_atualizar
  BEFORE UPDATE ON empresas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

CREATE TRIGGER tr_encomendas_atualizar
  BEFORE UPDATE ON encomendas
  FOR EACH ROW EXECUTE FUNCTION atualizar_timestamp();

-- Trigger para criar estados padrão ao criar empresa
CREATE OR REPLACE FUNCTION criar_estados_padrao()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO configuracao_estados (empresa_id, nome, ordem, cor, mensagem_padrao) VALUES
    (NEW.id, 'Recebida', 1, '#6b7280', 'A sua encomenda foi recebida e está a ser processada.'),
    (NEW.id, 'Em fila', 2, '#f59e0b', 'A sua encomenda está na fila de impressão.'),
    (NEW.id, 'A imprimir', 3, '#3b82f6', 'A sua peça está a ser impressa neste momento!'),
    (NEW.id, 'Acabamento', 4, '#8b5cf6', 'A peça está em fase de acabamento e polimento.'),
    (NEW.id, 'Controlo de qualidade', 5, '#10b981', 'A peça está a passar pelo controlo de qualidade.'),
    (NEW.id, 'Enviada', 6, '#f97316', 'A sua encomenda foi enviada!'),
    (NEW.id, 'Entregue', 7, '#22c55e', 'A sua encomenda foi entregue. Obrigado!');
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_empresa_estados_padrao
  AFTER INSERT ON empresas
  FOR EACH ROW EXECUTE FUNCTION criar_estados_padrao();

-- Trigger para criar empresa ao criar utilizador (via auth hook)
CREATE OR REPLACE FUNCTION criar_empresa_para_utilizador()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO empresas (utilizador_id) VALUES (NEW.id);
  RETURN NEW;
END;
$$;

CREATE TRIGGER tr_criar_empresa
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION criar_empresa_para_utilizador();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE empresas ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracao_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE encomendas ENABLE ROW LEVEL SECURITY;
ALTER TABLE itens_encomenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE historico_estados ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotos_encomenda ENABLE ROW LEVEL SECURITY;
ALTER TABLE recibos ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificados ENABLE ROW LEVEL SECURITY;
ALTER TABLE avaliacoes ENABLE ROW LEVEL SECURITY;

-- EMPRESAS: o vendedor vê apenas a sua
CREATE POLICY "Vendedor vê a sua empresa"
  ON empresas FOR SELECT
  TO authenticated
  USING (utilizador_id = auth.uid());

CREATE POLICY "Vendedor edita a sua empresa"
  ON empresas FOR UPDATE
  TO authenticated
  USING (utilizador_id = auth.uid());

-- CONFIGURAÇÃO DE ESTADOS: vendedor gere os da sua empresa
CREATE POLICY "Vendedor gere estados"
  ON configuracao_estados FOR ALL
  TO authenticated
  USING (empresa_id IN (SELECT id FROM empresas WHERE utilizador_id = auth.uid()));

-- ENCOMENDAS: vendedor gere as da sua empresa
CREATE POLICY "Vendedor gere encomendas"
  ON encomendas FOR ALL
  TO authenticated
  USING (empresa_id IN (SELECT id FROM empresas WHERE utilizador_id = auth.uid()));

-- ITENS: vendedor gere os das suas encomendas
CREATE POLICY "Vendedor gere itens"
  ON itens_encomenda FOR ALL
  TO authenticated
  USING (encomenda_id IN (
    SELECT id FROM encomendas WHERE empresa_id IN (
      SELECT id FROM empresas WHERE utilizador_id = auth.uid()
    )
  ));

-- HISTÓRICO: vendedor gere
CREATE POLICY "Vendedor gere historico"
  ON historico_estados FOR ALL
  TO authenticated
  USING (encomenda_id IN (
    SELECT id FROM encomendas WHERE empresa_id IN (
      SELECT id FROM empresas WHERE utilizador_id = auth.uid()
    )
  ));

-- FOTOS: vendedor gere
CREATE POLICY "Vendedor gere fotos"
  ON fotos_encomenda FOR ALL
  TO authenticated
  USING (encomenda_id IN (
    SELECT id FROM encomendas WHERE empresa_id IN (
      SELECT id FROM empresas WHERE utilizador_id = auth.uid()
    )
  ));

-- RECIBOS: vendedor gere
CREATE POLICY "Vendedor gere recibos"
  ON recibos FOR ALL
  TO authenticated
  USING (encomenda_id IN (
    SELECT id FROM encomendas WHERE empresa_id IN (
      SELECT id FROM empresas WHERE utilizador_id = auth.uid()
    )
  ));

-- CERTIFICADOS: vendedor gere
CREATE POLICY "Vendedor gere certificados"
  ON certificados FOR ALL
  TO authenticated
  USING (encomenda_id IN (
    SELECT id FROM encomendas WHERE empresa_id IN (
      SELECT id FROM empresas WHERE utilizador_id = auth.uid()
    )
  ));

-- AVALIAÇÕES: vendedor vê as das suas encomendas
CREATE POLICY "Vendedor ve avaliacoes"
  ON avaliacoes FOR SELECT
  TO authenticated
  USING (encomenda_id IN (
    SELECT id FROM encomendas WHERE empresa_id IN (
      SELECT id FROM empresas WHERE utilizador_id = auth.uid()
    )
  ));

-- ============================================================
-- FUNÇÕES RPC PARA ACESSO PÚBLICO (comprador)
-- ============================================================

-- Obter encomenda por token público (para o comprador)
CREATE OR REPLACE FUNCTION obter_encomenda_publica(p_token TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'encomenda', json_build_object(
      'id', e.id,
      'numero_encomenda', e.numero_encomenda,
      'nome_comprador', e.nome_comprador,
      'estado', e.estado,
      'previsao_entrega', e.previsao_entrega,
      'notas_publicas', e.notas_publicas,
      'criada_em', e.criada_em
    ),
    'empresa', json_build_object(
      'nome', emp.nome,
      'logotipo_url', emp.logotipo_url,
      'foto_capa_url', emp.foto_capa_url,
      'cor_primaria', emp.cor_primaria,
      'cor_secundaria', emp.cor_secundaria,
      'descricao', emp.descricao,
      'email', emp.email,
      'telefone', emp.telefone,
      'website', emp.website,
      'instagram', emp.instagram,
      'texto_rodape', emp.texto_rodape
    ),
    'itens', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', i.id,
        'nome_peca', i.nome_peca,
        'descricao', i.descricao,
        'quantidade', i.quantidade,
        'preco_unitario', i.preco_unitario,
        'material', i.material,
        'cor', i.cor,
        'altura_camada', i.altura_camada,
        'enchimento_percentagem', i.enchimento_percentagem,
        'tempo_impressao_minutos', i.tempo_impressao_minutos,
        'peso_gramas', i.peso_gramas,
        'impressora_usada', i.impressora_usada,
        'ficheiro_3d_url', i.ficheiro_3d_url,
        'numero_serie', i.numero_serie,
        'token_peca', i.token_peca,
        'data_impressao', i.data_impressao
      ) ORDER BY i.criado_em), '[]'::json)
      FROM itens_encomenda i WHERE i.encomenda_id = e.id
    ),
    'historico', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', h.id,
        'estado', h.estado,
        'mensagem', h.mensagem,
        'criado_em', h.criado_em
      ) ORDER BY h.criado_em DESC), '[]'::json)
      FROM historico_estados h WHERE h.encomenda_id = e.id
    ),
    'fotos', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', f.id,
        'url', f.url,
        'legenda', f.legenda,
        'item_id', f.item_id,
        'criada_em', f.criada_em
      ) ORDER BY f.criada_em DESC), '[]'::json)
      FROM fotos_encomenda f WHERE f.encomenda_id = e.id
    ),
    'recibo', (
      SELECT json_build_object(
        'id', r.id,
        'numero_recibo', r.numero_recibo,
        'data_emissao', r.data_emissao,
        'valor_total', r.valor_total,
        'metodo_pagamento', r.metodo_pagamento,
        'observacoes', r.observacoes
      )
      FROM recibos r WHERE r.encomenda_id = e.id
      ORDER BY r.criado_em DESC LIMIT 1
    ),
    'certificados', (
      SELECT COALESCE(json_agg(json_build_object(
        'id', c.id,
        'item_id', c.item_id,
        'codigo_verificacao', c.codigo_verificacao,
        'texto_personalizado', c.texto_personalizado,
        'nivel_selo', c.nivel_selo,
        'criterios', c.criterios,
        'prazo_garantia_meses', c.prazo_garantia_meses,
        'emitido_em', c.emitido_em
      ) ORDER BY c.emitido_em DESC), '[]'::json)
      FROM certificados c WHERE c.encomenda_id = e.id
    ),
    'avaliacao', (
      SELECT json_build_object(
        'estrelas', a.estrelas,
        'comentario', a.comentario
      )
      FROM avaliacoes a WHERE a.encomenda_id = e.id
      ORDER BY a.criada_em DESC LIMIT 1
    ),
    'estados_config', (
      SELECT COALESCE(json_agg(json_build_object(
        'nome', ce.nome,
        'ordem', ce.ordem,
        'cor', ce.cor
      ) ORDER BY ce.ordem), '[]'::json)
      FROM configuracao_estados ce WHERE ce.empresa_id = emp.id
    )
  )
  INTO v_result
  FROM encomendas e
  JOIN empresas emp ON e.empresa_id = emp.id
  WHERE e.token_publico = p_token;
  
  RETURN v_result;
END;
$$;

-- Obter peça por token (passaporte digital)
CREATE OR REPLACE FUNCTION obter_peca_publica(p_token_peca TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'peca', json_build_object(
      'id', i.id,
      'nome_peca', i.nome_peca,
      'descricao', i.descricao,
      'quantidade', i.quantidade,
      'material', i.material,
      'cor', i.cor,
      'altura_camada', i.altura_camada,
      'enchimento_percentagem', i.enchimento_percentagem,
      'tempo_impressao_minutos', i.tempo_impressao_minutos,
      'peso_gramas', i.peso_gramas,
      'impressora_usada', i.impressora_usada,
      'ficheiro_3d_url', i.ficheiro_3d_url,
      'numero_serie', i.numero_serie,
      'data_impressao', i.data_impressao
    ),
    'empresa', json_build_object(
      'nome', emp.nome,
      'logotipo_url', emp.logotipo_url,
      'cor_primaria', emp.cor_primaria,
      'cor_secundaria', emp.cor_secundaria,
      'email', emp.email,
      'telefone', emp.telefone,
      'website', emp.website,
      'instagram', emp.instagram,
      'texto_rodape', emp.texto_rodape
    ),
    'encomenda', json_build_object(
      'numero_encomenda', enc.numero_encomenda,
      'token_publico', enc.token_publico
    ),
    'fotos', (
      SELECT COALESCE(json_agg(json_build_object(
        'url', f.url,
        'legenda', f.legenda
      )), '[]'::json)
      FROM fotos_encomenda f WHERE f.item_id = i.id
    ),
    'certificado', (
      SELECT json_build_object(
        'codigo_verificacao', c.codigo_verificacao,
        'texto_personalizado', c.texto_personalizado,
        'nivel_selo', c.nivel_selo,
        'criterios', c.criterios,
        'prazo_garantia_meses', c.prazo_garantia_meses,
        'emitido_em', c.emitido_em
      )
      FROM certificados c WHERE c.item_id = i.id
      ORDER BY c.emitido_em DESC LIMIT 1
    )
  )
  INTO v_result
  FROM itens_encomenda i
  JOIN encomendas enc ON i.encomenda_id = enc.id
  JOIN empresas emp ON enc.empresa_id = emp.id
  WHERE i.token_peca = p_token_peca;
  
  RETURN v_result;
END;
$$;

-- Verificar certificado por código
CREATE OR REPLACE FUNCTION verificar_certificado(p_codigo TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'valido', true,
    'empresa', emp.nome,
    'logotipo_url', emp.logotipo_url,
    'peca', COALESCE(i.nome_peca, 'N/A'),
    'numero_serie', i.numero_serie,
    'nivel_selo', c.nivel_selo,
    'criterios', c.criterios,
    'prazo_garantia_meses', c.prazo_garantia_meses,
    'emitido_em', c.emitido_em,
    'cor_primaria', emp.cor_primaria
  )
  INTO v_result
  FROM certificados c
  JOIN encomendas enc ON c.encomenda_id = enc.id
  JOIN empresas emp ON enc.empresa_id = emp.id
  LEFT JOIN itens_encomenda i ON c.item_id = i.id
  WHERE UPPER(REPLACE(c.codigo_verificacao, '-', '')) = UPPER(REPLACE(p_codigo, '-', ''));
  
  IF v_result IS NULL THEN
    RETURN json_build_object('valido', false);
  END IF;
  
  RETURN v_result;
END;
$$;

-- Submeter avaliação (público)
CREATE OR REPLACE FUNCTION submeter_avaliacao(
  p_token TEXT,
  p_estrelas INTEGER,
  p_comentario TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_encomenda_id UUID;
BEGIN
  SELECT id INTO v_encomenda_id
  FROM encomendas
  WHERE token_publico = p_token;
  
  IF v_encomenda_id IS NULL THEN
    RETURN json_build_object('sucesso', false, 'erro', 'Encomenda não encontrada.');
  END IF;
  
  -- Verificar se já existe avaliação
  IF EXISTS (SELECT 1 FROM avaliacoes WHERE encomenda_id = v_encomenda_id) THEN
    RETURN json_build_object('sucesso', false, 'erro', 'Esta encomenda já foi avaliada.');
  END IF;
  
  INSERT INTO avaliacoes (encomenda_id, estrelas, comentario)
  VALUES (v_encomenda_id, p_estrelas, p_comentario);
  
  RETURN json_build_object('sucesso', true);
END;
$$;

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================

-- Bucket para logotipos e capas das empresas
INSERT INTO storage.buckets (id, name, public) VALUES ('empresas', 'empresas', true);

-- Bucket para ficheiros 3D e fotos de encomendas
INSERT INTO storage.buckets (id, name, public) VALUES ('encomendas', 'encomendas', true);

-- Políticas de Storage
CREATE POLICY "Utilizadores autenticados podem fazer upload em empresas"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'empresas');

CREATE POLICY "Utilizadores autenticados podem atualizar em empresas"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'empresas');

CREATE POLICY "Ficheiros de empresas são públicos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'empresas');

CREATE POLICY "Utilizadores autenticados podem fazer upload em encomendas"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'encomendas');

CREATE POLICY "Utilizadores autenticados podem atualizar em encomendas"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'encomendas');

CREATE POLICY "Ficheiros de encomendas são públicos"
  ON storage.objects FOR SELECT
  TO public
  USING (bucket_id = 'encomendas');

CREATE POLICY "Utilizadores autenticados podem apagar em empresas"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'empresas');

CREATE POLICY "Utilizadores autenticados podem apagar em encomendas"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'encomendas');

-- ============================================================
-- PERMISSÕES PARA FUNÇÕES RPC PÚBLICAS
-- ============================================================

GRANT EXECUTE ON FUNCTION obter_encomenda_publica(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION obter_encomenda_publica(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION obter_peca_publica(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION obter_peca_publica(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION verificar_certificado(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION verificar_certificado(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION submeter_avaliacao(TEXT, INTEGER, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION submeter_avaliacao(TEXT, INTEGER, TEXT) TO authenticated;
