// Tipos do OrbitTrack

export interface Empresa {
  id: string
  utilizador_id: string
  nome: string
  logotipo_url: string | null
  foto_capa_url: string | null
  cor_primaria: string
  cor_secundaria: string
  descricao: string | null
  email: string | null
  telefone: string | null
  website: string | null
  instagram: string | null
  morada: string | null
  nif: string | null
  texto_rodape: string | null
  criada_em: string
  atualizada_em: string
}

export type EstadoEncomenda = string

export interface ConfiguracaoEstado {
  id: string
  empresa_id: string
  nome: string
  ordem: number
  cor: string
  mensagem_padrao: string | null
  criado_em: string
}

export interface Encomenda {
  id: string
  empresa_id: string
  token_publico: string
  numero_encomenda: string
  nome_comprador: string
  email_comprador: string | null
  telefone_comprador: string | null
  estado: EstadoEncomenda
  previsao_entrega: string | null
  notas_publicas: string | null
  notas_internas: string | null
  criada_em: string
  atualizada_em: string
}

export interface ItemEncomenda {
  id: string
  encomenda_id: string
  nome_peca: string
  descricao: string | null
  quantidade: number
  preco_unitario: number | null
  material: string | null
  cor: string | null
  altura_camada: string | null
  enchimento_percentagem: number | null
  tempo_impressao_minutos: number | null
  peso_gramas: number | null
  impressora_usada: string | null
  ficheiro_3d_url: string | null
  numero_serie: string | null
  token_peca: string | null
  data_impressao: string | null
  criado_em: string
}

export interface HistoricoEstado {
  id: string
  encomenda_id: string
  estado: string
  mensagem: string | null
  criado_em: string
}

export interface FotoEncomenda {
  id: string
  encomenda_id: string
  item_id: string | null
  url: string
  legenda: string | null
  criada_em: string
}

export interface Recibo {
  id: string
  encomenda_id: string
  numero_recibo: string
  data_emissao: string
  valor_total: number
  metodo_pagamento: string | null
  observacoes: string | null
  criado_em: string
}

export interface Certificado {
  id: string
  encomenda_id: string
  item_id: string | null
  codigo_verificacao: string
  texto_personalizado: string | null
  nivel_selo: 'bronze' | 'prata' | 'ouro'
  criterios: string[]
  prazo_garantia_meses: number
  emitido_em: string
}

export interface Avaliacao {
  id: string
  encomenda_id: string
  estrelas: number
  comentario: string | null
  criada_em: string
}

// Tipos para os dados públicos (comprador)
export interface EncomendaPublica {
  encomenda: {
    id: string
    numero_encomenda: string
    nome_comprador: string
    estado: string
    previsao_entrega: string | null
    notas_publicas: string | null
    criada_em: string
  }
  empresa: {
    nome: string
    logotipo_url: string | null
    foto_capa_url: string | null
    cor_primaria: string
    cor_secundaria: string
    descricao: string | null
    email: string | null
    telefone: string | null
    website: string | null
    instagram: string | null
    texto_rodape: string | null
  }
  itens: ItemEncomenda[]
  historico: HistoricoEstado[]
  fotos: FotoEncomenda[]
  recibo: Recibo | null
  certificados: Certificado[]
  avaliacao: { estrelas: number; comentario: string | null } | null
  estados_config: { nome: string; ordem: number; cor: string }[]
}

export interface PecaPublica {
  peca: Omit<ItemEncomenda, 'encomenda_id' | 'preco_unitario' | 'criado_em'>
  empresa: {
    nome: string
    logotipo_url: string | null
    cor_primaria: string
    cor_secundaria: string
    email: string | null
    telefone: string | null
    website: string | null
    instagram: string | null
    texto_rodape: string | null
  }
  encomenda: {
    numero_encomenda: string
    token_publico: string
  }
  fotos: { url: string; legenda: string | null }[]
  certificado: Omit<Certificado, 'id' | 'encomenda_id' | 'item_id'> | null
}

export interface VerificacaoCertificado {
  valido: boolean
  empresa?: string
  logotipo_url?: string | null
  peca?: string
  numero_serie?: string | null
  nivel_selo?: string
  criterios?: string[]
  prazo_garantia_meses?: number
  emitido_em?: string
  cor_primaria?: string
}
