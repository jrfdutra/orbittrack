import React, { useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Award, CheckCircle2, XCircle } from 'lucide-react';

const VerificarCertificado = () => {
  const [codigo, setCodigo] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const verificar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResultado(null);

    const { data, error } = await supabase
      .from('certificados')
      .select('*, item:itens_encomenda(nome_peca, encomenda:encomendas(empresa:empresas(nome)))')
      .eq('codigo_verificacao', codigo.toUpperCase())
      .single();

    if (error || !data) {
      setResultado({ invalido: true });
    } else {
      setResultado({ valido: true, ...data });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border text-center">
        <Award className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
        <h1 className="text-2xl font-bold mb-6">Verificar Certificado</h1>
        
        <form onSubmit={verificar} className="space-y-4">
          <input 
            type="text" placeholder="Código (ex: AB7K-92QX)"
            className="w-full border p-3 rounded-lg text-center font-mono uppercase"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
          />
          <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">
            {loading ? 'A verificar...' : 'Verificar'}
          </button>
        </form>

        {resultado?.valido && (
          <div className="mt-8 p-4 bg-green-50 text-green-700 rounded-lg flex items-center gap-3">
            <CheckCircle2 />
            <div>
              <p className="font-bold">Certificado Válido</p>
              <p className="text-sm">Peça: {resultado.item.nome_peca}</p>
            </div>
          </div>
        )}

        {resultado?.invalido && (
          <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg flex items-center gap-3">
            <XCircle />
            <p className="font-bold">Código Inválido ou não encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificarCertificado;
