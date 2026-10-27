import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { ConfiguracaoEstado } from '@/lib/types'
import { Plus, Trash2, GripVertical, Save, Loader2, CheckCircle2 } from 'lucide-react'

export default function EstadosConfig() {
  const { empresa } = useAuth()
  const [estados, setEstados] = useState<ConfiguracaoEstado[]>([])
  const [loading, setLoading] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [sucesso, setSucesso] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  const [novoEstado, setNovoEstado] = useState({
    nome: '',
    cor: '#3b82f6',
    mensagem_padrao: '',
  })

  useEffect(() => {
    if (empresa) {
      carregarEstados()
    }
  }, [empresa])

  const carregarEstados = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('configuracao_estados')
        .select('*')
        .eq('empresa_id', empresa?.id)
        .order('ordem', { ascending: true })

      if (error) throw error
      setEstados(data || [])
    } catch (err: any) {
      setErro('Erro ao carregar estados: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAdicionar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!empresa || !novoEstado.nome.trim()) return

    try {
      const novaOrdem = estados.length > 0 ? Math.max(...estados.map((e) => e.ordem)) + 1 : 1
      const { data, error } = await supabase
        .from('configuracao_estados')
        .insert({
          empresa_id: empresa.id,
          nome: novoEstado.nome.trim(),
          cor: novoEstado.cor,
          mensagem_padrao: novoEstado.mensagem_padrao.trim() || null,
          ordem: novaOrdem,
        })
        .select()
        .single()

      if (error) throw error

      setEstados([...estados, data])
      setNovoEstado({ nome: '', cor: '#3b82f6', mensagem_padrao: '' })
    } catch (err: any) {
      setErro('Erro ao adicionar estado: ' + err.message)
    }
  }

  const handleRemover = async (id: string) => {
    if (!confirm('Tem certeza que deseja remover este estado?')) return

    try {
      const { error } = await supabase.from('configuracao_estados').delete().eq('id', id)
      if (error) throw error
      setEstados(estados.filter((e) => e.id !== id))
    } catch (err: any) {
      setErro('Erro ao remover estado: ' + err.message)
    }
  }

  const handleMudarOrdem = async (index: number, direcao: 'cima' | 'baixo') => {
    const novoIndex = direcao === 'cima' ? index - 1 : index + 1
    if (novoIndex < 0 || novoIndex >= estados.length) return

    const novosEstados = [...estados]
    const temp = novosEstados[index]
    novosEstados[index] = novosEstados[novoIndex]
    novosEstados[novoIndex] = temp

    // Atualizar ordens
    const estadosAtualizados = novosEstados.map((est, idx) => ({
      ...est,
      ordem: idx + 1,
    }))

    setEstados(estadosAtualizados)
  }

  const guardarAlteracoes = async () => {
    try {
      setSalvando(true)
      setErro(null)

      for (const est of estados) {
        const { error } = await supabase
          .from('configuracao_estados')
          .update({ ordem: est.ordem, nome: est.nome, cor: est.cor, mensagem_padrao: est.mensagem_padrao })
          .eq('id', est.id)

        if (error) throw error
      }

      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } catch (err: any) {
      setErro('Erro ao guardar estados: ' + err.message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Estados das Encomendas</h1>
          <p className="text-gray-500 text-sm">
            Configure os estados personalizados do processo de impressão e fabrico.
          </p>
        </div>
        <button
          onClick={guardarAlteracoes}
          className="btn-primary"
          disabled={salvando}
        >
          {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Guardar Alterações</span>
        </button>
      </div>

      {sucesso && (
        <div className="p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>Estados atualizados com sucesso!</span>
        </div>
      )}

      {erro && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{erro}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Lista de Estados */}
        <div className="lg:col-span-2 card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Estados Atuais</h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : estados.length === 0 ? (
            <p className="text-gray-500 text-sm py-4">Nenhum estado configurado.</p>
          ) : (
            <div className="space-y-3">
              {estados.map((estado, index) => (
                <div
                  key={estado.id}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-200 bg-white shadow-xs"
                >
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMudarOrdem(index, 'cima')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMudarOrdem(index, 'baixo')}
                      disabled={index === estados.length - 1}
                      className="text-gray-400 hover:text-gray-700 disabled:opacity-20"
                    >
                      ▼
                    </button>
                  </div>

                  <input
                    type="color"
                    value={estado.cor}
                    onChange={(e) => {
                      const novos = [...estados]
                      novos[index].cor = e.target.value
                      setEstados(novos)
                    }}
                    className="w-8 h-8 rounded-lg border border-gray-300 cursor-pointer p-0.5"
                  />

                  <div className="flex-1 space-y-1">
                    <input
                      type="text"
                      value={estado.nome}
                      onChange={(e) => {
                        const novos = [...estados]
                        novos[index].nome = e.target.value
                        setEstados(novos)
                      }}
                      className="input py-1 text-sm font-medium"
                    />
                    <input
                      type="text"
                      value={estado.mensagem_padrao || ''}
                      placeholder="Mensagem padrão para o cliente..."
                      onChange={(e) => {
                        const novos = [...estados]
                        novos[index].mensagem_padrao = e.target.value
                        setEstados(novos)
                      }}
                      className="input py-1 text-xs text-gray-500"
                    />
                  </div>

                  <button
                    onClick={() => handleRemover(estado.id)}
                    className="text-gray-400 hover:text-red-600 p-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Adicionar Novo Estado */}
        <div className="card p-6 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Novo Estado</h2>

          <form onSubmit={handleAdicionar} className="space-y-4">
            <div>
              <label className="label">Nome do Estado</label>
              <input
                type="text"
                className="input"
                value={novoEstado.nome}
                onChange={(e) => setNovoEstado({ ...novoEstado, nome: e.target.value })}
                placeholder="Ex: Em embalamento"
                required
              />
            </div>

            <div>
              <label className="label">Cor do Estado</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={novoEstado.cor}
                  onChange={(e) => setNovoEstado({ ...novoEstado, cor: e.target.value })}
                  className="w-12 h-10 rounded-xl border border-gray-300 cursor-pointer p-1"
                />
                <input
                  type="text"
                  value={novoEstado.cor}
                  onChange={(e) => setNovoEstado({ ...novoEstado, cor: e.target.value })}
                  className="input"
                />
              </div>
            </div>

            <div>
              <label className="label">Mensagem Padrão (Opcional)</label>
              <textarea
                className="input"
                rows={3}
                value={novoEstado.mensagem_padrao}
                onChange={(e) => setNovoEstado({ ...novoEstado, mensagem_padrao: e.target.value })}
                placeholder="Mensagem enviada ao comprador nesta fase..."
              />
            </div>

            <button type="submit" className="btn-secondary w-full">
              <Plus className="w-4 h-4" />
              <span>Adicionar Estado</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
