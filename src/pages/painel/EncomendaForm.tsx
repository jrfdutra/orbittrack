import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, ArrowLeft, Package, FileText } from 'lucide-react';

const EncomendaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);

  const [comprador, setComprador] = useState({
    nome_comprador: '',
    email_comprador: '',
    telefone_comprador: '',
    previsao_entrega: '',
    notas_publicas: '',
    notas_internas: ''
  });

  const [itens, setItens] = useState<any[]>([]);

  useEffect(() => {
    fetchEmpresa();
    if (id) fetchEncomenda();
  }, [id]);

  async function fetchEmpresa() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('empresas').select('id').eq('utilizador_id', user.id).single();
      if (data) setEmpresaId(data.id);
    }
  }

  async function fetchEncomenda() {
    // Implementar busca de encomenda existente para edição
  }

  const adicionarItem = () => {
    setItens([...itens, { 
      nome_peca: '', 
      quantidade: 1, 
      preco_unitario: 0, 
      material: 'PLA', 
      cor: '', 
      altura_camada: 0.2, 
      enchimento_percentagem: 15 
    }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!empresaId) return;
    setLoading(true);

    try {
      // 0. Gerar número da encomenda via função RPC
      const { data: numData, error: numError } = await supabase
        .rpc('gerar_numero_encomenda', { p_empresa_id: empresaId });

      if (numError) throw numError;
      const numeroEncomenda = numData || `${new Date().getFullYear()}-0001`;

      // 1. Criar encomenda
      const { data: enc, error: encError } = await supabase
        .from('encomendas')
        .insert([{ 
          ...comprador, 
          empresa_id: empresaId,
          numero_encomenda: numeroEncomenda,
          estado: 'Recebida'
        }])
        .select()
        .single();

      if (encError) throw encError;

      // 2. Inserir itens
      if (itens.length > 0) {
        const itensParaInserir = itens.map(item => ({ ...item, encomenda_id: enc.id }));
        const { error: itemsError } = await supabase.from('itens_encomenda').insert(itensParaInserir);
        if (itemsError) throw itemsError;
      }

      navigate('/painel/encomendas');
    } catch (error) {
      console.error('Erro ao guardar:', error);
      alert('Erro ao guardar encomenda.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-indigo-600">
        <ArrowLeft size={20} /> Voltar
      </button>

      <form onSubmit={handleSalvar} className="space-y-8">
        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold mb-4">Dados do Comprador</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input 
              type="text" placeholder="Nome do Comprador" required
              className="border p-2 rounded w-full"
              value={comprador.nome_comprador}
              onChange={e => setComprador({...comprador, nome_comprador: e.target.value})}
            />
            <input 
              type="email" placeholder="Email" required
              className="border p-2 rounded w-full"
              value={comprador.email_comprador}
              onChange={e => setComprador({...comprador, email_comprador: e.target.value})}
            />
            <input 
              type="tel" placeholder="Telefone" 
              className="border p-2 rounded w-full"
              value={comprador.telefone_comprador}
              onChange={e => setComprador({...comprador, telefone_comprador: e.target.value})}
            />
            <input 
              type="date" placeholder="Previsão de Entrega" required
              className="border p-2 rounded w-full"
              value={comprador.previsao_entrega}
              onChange={e => setComprador({...comprador, previsao_entrega: e.target.value})}
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Itens da Encomenda</h2>
            <button type="button" onClick={adicionarItem} className="text-indigo-600 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Adicionar Peça
            </button>
          </div>

          <div className="space-y-4">
            {itens.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group">
                <button 
                  type="button" onClick={() => removerItem(index)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="text" placeholder="Nome da Peça" required
                    className="border p-2 rounded bg-white"
                    value={item.nome_peca}
                    onChange={e => {
                      const newItens = [...itens];
                      newItens[index].nome_peca = e.target.value;
                      setItens(newItens);
                    }}
                  />
                  <input 
                    type="number" placeholder="Quantidade" required
                    className="border p-2 rounded bg-white"
                    value={item.quantidade}
                    onChange={e => {
                      const newItens = [...itens];
                      newItens[index].quantidade = parseInt(e.target.value);
                      setItens(newItens);
                    }}
                  />
                  <input 
                    type="number" step="0.01" placeholder="Preço Unitário (€)" required
                    className="border p-2 rounded bg-white"
                    value={item.preco_unitario}
                    onChange={e => {
                      const newItens = [...itens];
                      newItens[index].preco_unitario = parseFloat(e.target.value);
                      setItens(newItens);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end">
          <button 
            type="submit" disabled={loading}
            className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'A guardar...' : <><Save size={20} /> Guardar Encomenda</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EncomendaForm;
