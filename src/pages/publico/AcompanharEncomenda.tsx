import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Package, Calendar, MapPin, CheckCircle2, Clock, Truck, Award, FileText, ExternalLink } from 'lucide-react';

interface EncomendaPublica {
  id: string;
  numero_encomenda: string;
  nome_comprador: string;
  estado: string;
  previsao_entrega: string;
  notas_publicas: string;
  empresa: {
    nome: string;
    logotipo_url: string;
    foto_capa_url: string;
    cor_primaria: string;
    cor_secundaria: string;
    telefone: string;
    instagram: string;
    texto_rodape: string;
  };
  itens: any[];
  historico: any[];
}

const AcompanharEncomenda = () => {
  const { token } = useParams<{ token: string }>();
  const [encomenda, setEncomenda] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    if (token) fetchDadosPublicos();
  }, [token]);

  async function fetchDadosPublicos() {
    try {
      const { data, error } = await supabase
        .rpc('obter_encomenda_publica', { p_token: token });

      if (error || !data || !data.encomenda) throw new Error('Encomenda não encontrada');
      
      setEncomenda(data);
    } catch (err: any) {
      setErro(err.message);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (erro || !encomenda) return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ops!</h1>
        <p className="text-gray-600">Não conseguimos encontrar esta encomenda. Verifica o link.</p>
      </div>
    </div>
  );

  const corPrimaria = encomenda.empresa.cor_primaria || '#4f46e5';

  return (
    <div className="min-h-screen bg-gray-50 pb-12" style={{ '--primary': corPrimaria } as any}>
      {/* Hero / Capa */}
      <div className="h-48 w-full bg-indigo-900 relative overflow-hidden">
        {encomenda.empresa.foto_capa_url && (
          <img src={encomenda.empresa.foto_capa_url} alt="Capa" className="w-full h-full object-cover opacity-50" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 flex items-end gap-4">
          <div className="w-20 h-20 bg-white rounded-xl shadow-lg p-2 overflow-hidden shrink-0">
             {encomenda.empresa.logotipo_url ? (
               <img src={encomenda.empresa.logotipo_url} alt="Logo" className="w-full h-full object-contain" />
             ) : (
               <div className="w-full h-full bg-gray-200 flex items-center justify-center"><Package className="text-gray-400" /></div>
             )}
          </div>
          <div className="text-white pb-1">
            <h1 className="text-xl font-bold leading-tight">{encomenda.empresa.nome}</h1>
            <p className="text-sm opacity-90">Encomenda #{encomenda.encomenda.numero_encomenda}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 relative z-10">
        {/* Card Estado Principal */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 text-center">
          <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-bold uppercase tracking-wider mb-2" style={{ color: corPrimaria, backgroundColor: `${corPrimaria}15` }}>
            Estado Atual
          </span>
          <h2 className="text-3xl font-black text-gray-900 mb-2 uppercase">{encomenda.encomenda.estado}</h2>
          <div className="flex items-center justify-center gap-2 text-gray-500 text-sm">
            <Clock size={16} />
            <span>Previsão: {encomenda.encomenda.previsao_entrega ? new Date(encomenda.encomenda.previsao_entrega).toLocaleDateString('pt-PT') : 'A definir'}</span>
          </div>
        </div>

        {/* Linha do Tempo */}
        <div className="bg-white rounded-2xl shadow-sm border p-6">
          <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
            <Clock size={20} className="text-gray-400" /> Histórico
          </h3>
          <div className="space-y-8 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-100">
            {encomenda.historico.map((h: any, i: number) => (
              <div key={h.id} className="relative pl-8">
                <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-white shadow-sm flex items-center justify-center ${i === 0 ? 'bg-indigo-600' : 'bg-gray-300'}`} style={{ backgroundColor: i === 0 ? corPrimaria : undefined }}>
                   {i === 0 && <div className="w-2 h-2 bg-white rounded-full"></div>}
                </div>
                <div>
                  <p className={`font-bold ${i === 0 ? 'text-gray-900' : 'text-gray-500'}`}>{h.estado}</p>
                  <p className="text-xs text-gray-400 mb-1">{new Date(h.criado_em).toLocaleString('pt-PT')}</p>
                  {h.mensagem && <p className="text-sm text-gray-600 italic">"{h.mensagem}"</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Itens */}
        <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
          <div className="p-6 border-b">
             <h3 className="font-bold text-gray-900 flex items-center gap-2">
               <Package size={20} className="text-gray-400" /> Peças na Encomenda
             </h3>
          </div>
          <div className="divide-y">
            {encomenda.itens.map((item: any) => (
              <div key={item.id} className="p-6 flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800">{item.nome_peca}</h4>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2 text-xs text-gray-500">
                    <span>Material: <b className="text-gray-700">{item.material}</b></span>
                    <span>Cor: <b className="text-gray-700">{item.cor}</b></span>
                    <span>Resolução: <b className="text-gray-700">{item.altura_camada}mm</b></span>
                    <span>Preenchimento: <b className="text-gray-700">{item.enchimento_percentagem}%</b></span>
                  </div>
                </div>
                {item.ficheiro_3d_url && (
                  <button className="p-2 bg-gray-50 rounded-lg text-indigo-600 border border-indigo-100">
                    <ExternalLink size={18} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé / Contactos */}
        <div className="text-center py-6 space-y-4">
           <div className="flex justify-center gap-4">
             {encomenda.empresa.telefone && (
               <a href={`tel:${encomenda.empresa.telefone}`} className="p-3 bg-white rounded-full shadow-sm border text-gray-600"><Truck size={20} /></a>
             )}
             {encomenda.empresa.instagram && (
               <a href={`https://instagram.com/${encomenda.empresa.instagram}`} target="_blank" className="p-3 bg-white rounded-full shadow-sm border text-gray-600"><Award size={20} /></a>
             )}
           </div>
           <p className="text-xs text-gray-400 max-w-xs mx-auto">
             {encomenda.empresa.texto_rodape || `Portal de acompanhamento powered by OrbitTrack`}
           </p>
        </div>
      </div>
    </div>
  );
};

export default AcompanharEncomenda;
