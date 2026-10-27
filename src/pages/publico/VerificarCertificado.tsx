import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Award, CheckCircle2, XCircle, Building2, Package, ShieldCheck } from 'lucide-react';

const VerificarCertificado = () => {
  const { codigo: codigoParam } = useParams<{ codigo?: string }>();
  const [codigo, setCodigo] = useState(codigoParam || '');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codigoParam) {
      setCodigo(codigoParam);
      executarVerificacao(codigoParam);
    }
  }, [codigoParam]);

  async function executarVerificacao(cod: string) {
    if (!cod.trim()) return;
    setLoading(true);
    setResultado(null);

    try {
      const { data, error } = await supabase
        .rpc('verificar_certificado', { p_codigo: cod.trim() });

      if (error || !data || !data.valido) {
        setResultado({ valido: false });
      } else {
        setResultado(data);
      }
    } catch {
      setResultado({ valido: false });
    } finally {
      setLoading(false);
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executarVerificacao(codigo);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border text-center">
        <Award className="w-16 h-16 mx-auto text-indigo-600 mb-4" />
        <h1 className="text-2xl font-bold mb-6">Verificar Certificado</h1>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="Código (ex: AB7K-92QX)"
            className="w-full border p-3 rounded-lg text-center font-mono uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            value={codigo}
            onChange={e => setCodigo(e.target.value)}
          />
          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold transition-colors disabled:opacity-50"
          >
            {loading ? 'A verificar...' : 'Verificar'}
          </button>
        </form>

        {resultado?.valido && (
          <div className="mt-8 p-6 bg-green-50 border border-green-200 text-green-900 rounded-xl text-left space-y-3">
            <div className="flex items-center gap-2 text-green-700 font-bold text-lg">
              <CheckCircle2 size={22} />
              <span>Certificado Autêntico</span>
            </div>
            
            <div className="space-y-1.5 text-sm text-green-800 pt-2 border-t border-green-200/60">
              <p className="flex items-center gap-2">
                <Building2 size={16} className="text-green-600 shrink-0" />
                <span>Empresa: <strong>{resultado.empresa}</strong></span>
              </p>
              <p className="flex items-center gap-2">
                <Package size={16} className="text-green-600 shrink-0" />
                <span>Peça: <strong>{resultado.peca}</strong></span>
              </p>
              {resultado.numero_serie && (
                <p className="flex items-center gap-2">
                  <ShieldCheck size={16} className="text-green-600 shrink-0" />
                  <span>Nº Série: <strong>{resultado.numero_serie}</strong></span>
                </p>
              )}
              <p className="text-xs text-green-700 pt-1">
                Selo de Qualidade: <strong className="uppercase">{resultado.nivel_selo}</strong>
              </p>
            </div>
          </div>
        )}

        {resultado?.valido === false && (
          <div className="mt-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3 text-left">
            <XCircle className="shrink-0 text-red-600" size={24} />
            <div>
              <p className="font-bold">Código Inválido</p>
              <p className="text-xs text-red-600">Não foi possível confirmar a autenticidade deste certificado.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerificarCertificado;
