import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Edit2, ExternalLink, MessageSquare, Award } from 'lucide-react';

interface Encomenda {
  id: string;
  numero_encomenda: string;
  nome_comprador: string;
  telefone_comprador: string;
  estado: string;
  previsao_entrega: string;
  token_publico: string;
}

const ESTADOS_POSSIVEIS = [
  'Recebida',
  'Em fila',
  'A imprimir',
  'Acabamento',
  'Controlo de qualidade',
  'Enviada',
  'Entregue'
];

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
        .select('id, numero_encomenda, nome_comprador, telefone_comprador, estado, previsao_entrega, token_publico')
        .order('criada_em', { ascending: false });

      if (error) throw error;
      setEncomendas(data || []);
    } catch (error) {
      console.error('Erro ao carregar encomendas:', error);
    } finally {
      setLoading(false);
    }
  }

  async function atualizarEstado(id: string, novoEstado: string) {
    try {
      const { error } = await supabase
        .from('encomendas')
        .update({ estado: novoEstado })
        .eq('id', id);

      if (error) throw error;

      await supabase.from('historico_estados').insert([{
        encomenda_id: id,
        estado: novoEstado,
        mensagem: `Estado atualizado para: ${novoEstado}`
      }]);

      setEncomendas(encomendas.map(enc => enc.id === id ? { ...enc, estado: novoEstado } : enc));
    } catch (error: any) {
      alert('Erro ao atualizar estado: ' + error.message);
    }
  }

  async function emitirCertificado(encomendaId: string) {
    try {
      const { data: itens, error: itensErr } = await supabase
        .from('itens_encomenda')
        .select('id, nome_peca')
        .eq('encomenda_id', encomendaId);

      if (itensErr || !itens || itens.length === 0) {
        alert('Esta encomenda não tem peças registadas para gerar certificado.');
        return;
      }

      for (const item of itens) {
        const { data: existente } = await supabase
          .from('certificados')
          .select('codigo_verificacao')
          .eq('item_id', item.id)
          .single();

        if (!existente) {
          const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          let codigo = '';
          for (let i = 0; i < 8; i++) {
            codigo += chars.charAt(Math.floor(Math.random() * chars.length));
            if (i === 3) codigo += '-';
          }

          await supabase.from('certificados').insert([{
            encomenda_id: encomendaId,
            item_id: item.id,
            codigo_verificacao: codigo,
            nivel_selo: 'prata',
            criterios: JSON.stringify(['Impressão 3D validada', 'Controlo dimensional OK', 'Acabamento verificado'])
          }]);
        }
      }

      alert('Certificado(s) digital(is) de autenticidade emitido(s) com sucesso! O comprador já pode verificar a autenticidade.');
    } catch (err: any) {
      alert('Erro ao emitir certificado: ' + err.message);
    }
  }

  async function eliminarEncomenda(id: string) {
    if (!confirm('Tem a certeza que deseja eliminar esta encomenda?')) return;
    try {
      const { error } = await supabase.from('encomendas').delete().eq('id', id);
      if (error) throw error;
      setEncomendas(encomendas.filter(enc => enc.id !== id));
    } catch (error: any) {
      alert('Erro ao eliminar: ' + error.message);
    }
  }

  function copiarLink(token: string) {
    const url = `${window.location.origin}/acompanhar/${token}`;
    navigator.clipboard.writeText(url);
    alert('Link público de rastreio copiado para a área de transferência!');
  }

  function enviarWhatsApp(enc: Encomenda) {
    if (!enc.telefone_comprador) {
      alert('O comprador não tem número de telefone registado.');
      return;
    }
    const url = `${window.location.origin}/acompanhar/${enc.token_publico}`;
    const texto = encodeURIComponent(`Olá ${enc.nome_comprador}! A sua encomenda #${enc.numero_encomenda} está com o estado: *${enc.estado}*. Acompanhe o progresso em tempo real aqui: ${url}`);
    window.open(`https://wa.me/${enc.telefone_comprador.replace(/\D/g, '')}?text=${texto}`, '_blank');
  }

  if (loading) return <div className="p-6">A carregar encomendas...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Encomendas</h1>
          <p className="text-sm text-gray-500">Edite encomendas, emita certificados digitais, atualize estados e comunique com clientes.</p>
        </div>
        <button 
          onClick={() => navigate('/painel/encomendas/nova')}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-semibold flex items-center gap-2 shadow-sm transition-colors"
        >
          <Plus size={20} /> Nova Encomenda
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        {/* Tabela em Desktop */}
        <table className="hidden md:table w-full text-left border-collapse">
          <thead className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
            <tr>
              <th className="p-4">Nº Encomenda</th>
              <th className="p-4">Comprador</th>
              <th className="p-4">Estado de Fabrico</th>
              <th className="p-4">Previsão</th>
              <th className="p-4 text-right">Ações & Certificado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm">
            {encomendas.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  Ainda não existem encomendas registadas. Clique em "Nova Encomenda" para começar.
                </td>
              </tr>
            ) : (
              encomendas.map((enc) => (
                <tr key={enc.id} className="hover:bg-gray-50/80 transition-colors">
                  <td className="p-4 font-mono font-bold text-indigo-600">{enc.numero_encomenda}</td>
                  <td className="p-4 font-medium text-gray-900">
                    {enc.nome_comprador}
                    {enc.telefone_comprador && <span className="block text-xs text-gray-400">{enc.telefone_comprador}</span>}
                  </td>
                  <td className="p-4">
                    <select
                      value={enc.estado}
                      onChange={(e) => atualizarEstado(enc.id, e.target.value)}
                      className="border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                    >
                      {ESTADOS_POSSIVEIS.map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-gray-600">
                    {enc.previsao_entrega ? new Date(enc.previsao_entrega).toLocaleDateString('pt-PT') : '—'}
                  </td>
                  <td className="p-4 text-right flex items-center justify-end gap-2">
                    <button 
                      onClick={() => navigate(`/painel/encomendas/${enc.id}/editar`)}
                      title="Editar Encomenda"
                      className="p-2 text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => emitirCertificado(enc.id)}
                      title="Emitir Certificado Digital de Autenticidade"
                      className="p-2 text-gray-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                    >
                      <Award size={16} />
                    </button>
                    <button 
                      onClick={() => copiarLink(enc.token_publico)}
                      title="Copiar Link Público de Rastreio"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                    >
                      <ExternalLink size={14} /> Link
                    </button>
                    <button 
                      onClick={() => enviarWhatsApp(enc)}
                      title="Enviar atualização por WhatsApp com link"
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <MessageSquare size={14} /> WhatsApp
                    </button>
                    <button 
                      onClick={() => eliminarEncomenda(enc.id)}
                      title="Eliminar Encomenda"
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Lista Responsiva em Cards (Mobile) */}
        <div className="md:hidden divide-y divide-gray-100">
          {encomendas.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              Ainda não existem encomendas registadas. Clique em "Nova Encomenda" para começar.
            </div>
          ) : (
            encomendas.map((enc) => (
              <div key={enc.id} className="p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-indigo-600 text-base">{enc.numero_encomenda}</span>
                  <span className="text-xs text-gray-400">
                    {enc.previsao_entrega ? new Date(enc.previsao_entrega).toLocaleDateString('pt-PT') : 'Sem data'}
                  </span>
                </div>

                <div>
                  <div className="font-semibold text-gray-900 text-sm">{enc.nome_comprador}</div>
                  {enc.telefone_comprador && (
                    <div className="text-xs text-gray-500">{enc.telefone_comprador}</div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs font-medium text-gray-500">Estado:</span>
                  <select
                    value={enc.estado}
                    onChange={(e) => atualizarEstado(enc.id, e.target.value)}
                    className="border border-gray-200 bg-gray-50 rounded-lg px-2.5 py-1 text-xs font-semibold text-gray-800 focus:outline-none"
                  >
                    {ESTADOS_POSSIVEIS.map(st => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                {/* Ações Móveis Touch-Friendly */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between gap-1 flex-wrap">
                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => navigate(`/painel/encomendas/${enc.id}/editar`)}
                      className="p-2 text-gray-600 bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 rounded-lg text-xs flex items-center gap-1 font-medium"
                    >
                      <Edit2 size={15} /> Editar
                    </button>
                    <button 
                      onClick={() => emitirCertificado(enc.id)}
                      className="p-2 text-amber-700 bg-amber-50 rounded-lg text-xs flex items-center gap-1 font-medium"
                    >
                      <Award size={15} /> Selo
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button 
                      onClick={() => copiarLink(enc.token_publico)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 rounded-lg flex items-center gap-1"
                    >
                      <ExternalLink size={13} /> Link
                    </button>
                    <button 
                      onClick={() => enviarWhatsApp(enc)}
                      className="px-2.5 py-1.5 text-xs font-semibold text-green-700 bg-green-50 rounded-lg flex items-center gap-1"
                    >
                      <MessageSquare size={13} /> Wpp
                    </button>
                    <button 
                      onClick={() => eliminarEncomenda(enc.id)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default EncomendasLista;
