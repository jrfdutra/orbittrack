import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Trash2, Edit2, ClipboardList, QrCode, FileText, CheckCircle } from 'lucide-react';

interface Encomenda {
  id: string;
  numero_encomenda: string;
  nome_comprador: string;
  estado: string;
  previsao_entrega: string;
}

const EncomendasLista = () => {
  const [encomendas, setEncomendas] = useState<Encomenda[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEncomendas();
  }, []);

  async function fetchEncomendas() {
    try {
      const { data, error } = await supabase
        .from('encomendas')
        .select('id, numero_encomenda, nome_comprador, estado, previsao_entrega')
        .order('criada_em', { ascending: false });

      if (error) throw error;
      setEncomendas(data || []);
    } catch (error) {
      console.error('Erro ao carregar encomendas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-6">A carregar...</div>;

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Encomendas</h1>
        <button 
          onClick={() => navigate('/painel/encomendas/nova')}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus size={20} /> Nova Encomenda
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nº</th>
              <th className="p-4">Comprador</th>
              <th className="p-4">Estado</th>
              <th className="p-4">Previsão</th>
              <th className="p-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {encomendas.map((enc) => (
              <tr key={enc.id} className="border-b hover:bg-gray-50">
                <td className="p-4 font-mono">{enc.numero_encomenda}</td>
                <td className="p-4">{enc.nome_comprador}</td>
                <td className="p-4"><span className="px-2 py-1 bg-gray-100 rounded text-sm">{enc.estado}</span></td>
                <td className="p-4">{new Date(enc.previsao_entrega).toLocaleDateString('pt-PT')}</td>
                <td className="p-4 flex gap-2">
                  <button className="text-gray-600 hover:text-indigo-600"><Edit2 size={18} /></button>
                  <button className="text-gray-600 hover:text-indigo-600"><QrCode size={18} /></button>
                  <button className="text-gray-600 hover:text-indigo-600"><FileText size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EncomendasLista;
