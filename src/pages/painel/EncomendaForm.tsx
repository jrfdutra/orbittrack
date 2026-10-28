import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Save, Plus, Trash2, ArrowLeft, Upload, FileBox } from 'lucide-react';

const EncomendaForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [empresaId, setEmpresaId] = useState<string | null>(null);
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null);

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
    if (id) fetchEncomenda(id);
  }, [id]);

  async function fetchEmpresa() {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase.from('empresas').select('id').eq('utilizador_id', user.id).single();
      if (data) setEmpresaId(data.id);
    }
  }

  async function fetchEncomenda(encomendaId: string) {
    setLoading(true);
    try {
      const { data: encData, error: encError } = await supabase
        .from('encomendas')
        .select('*')
        .eq('id', encomendaId)
        .single();

      if (encError) throw encError;
      if (encData) {
        setComprador({
          nome_comprador: encData.nome_comprador || '',
          email_comprador: encData.email_comprador || '',
          telefone_comprador: encData.telefone_comprador || '',
          previsao_entrega: encData.previsao_entrega || '',
          notas_publicas: encData.notas_publicas || '',
          notas_internas: encData.notas_internas || ''
        });
      }

      const { data: itensData, error: itensError } = await supabase
        .from('itens_encomenda')
        .select('*')
        .eq('encomenda_id', encomendaId);

      if (itensError) throw itensError;
      setItens(itensData || []);
    } catch (error: any) {
      console.error('Erro ao carregar encomenda:', error);
      alert('Erro ao carregar dados da encomenda para edição.');
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se é .glb ou .gltf
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.glb') && !fileName.endsWith('.gltf')) {
      alert('Por favor, selecione um ficheiro 3D em formato .glb ou .gltf');
      return;
    }

    try {
      setUploadingIndex(index);
      const filePath = `modelos_3d/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

      const { error: uploadError } = await supabase.storage
        .from('encomendas')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('encomendas')
        .getPublicUrl(filePath);

      const newItens = [...itens];
      newItens[index].ficheiro_3d_url = publicUrl;
      setItens(newItens);

      alert('Modelo 3D carregado com sucesso!');
    } catch (err: any) {
      alert('Erro ao fazer upload do modelo 3D: ' + err.message);
    } finally {
      setUploadingIndex(null);
    }
  };

  const adicionarItem = () => {
    setItens([...itens, { 
      nome_peca: '', 
      quantidade: 1, 
      preco_unitario: 0, 
      material: 'PLA', 
      cor: '', 
      altura_camada: '0.2',
      ficheiro_3d_url: ''
    }]);
  };

  const removerItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSalvar = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let currentEmpresaId = empresaId;
      if (!currentEmpresaId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Utilizador não autenticado');
        const { data: empData, error: empError } = await supabase.from('empresas').select('id').eq('utilizador_id', user.id).single();
        if (empError || !empData) {
          const { data: newEmp, error: createEmpError } = await supabase.from('empresas').insert([{ utilizador_id: user.id }]).select().single();
          if (createEmpError) throw createEmpError;
          currentEmpresaId = newEmp.id;
        } else {
          currentEmpresaId = empData.id;
        }
        setEmpresaId(currentEmpresaId);
      }

      if (id) {
        const { error: updateError } = await supabase
          .from('encomendas')
          .update({ ...comprador })
          .eq('id', id);

        if (updateError) throw updateError;

        await supabase.from('itens_encomenda').delete().eq('encomenda_id', id);

        if (itens.length > 0) {
          const itensParaInserir = itens.map(item => {
            const { id: _, ...rest } = item;
            return { ...rest, encomenda_id: id };
          });
          const { error: itemsError } = await supabase.from('itens_encomenda').insert(itensParaInserir);
          if (itemsError) throw itemsError;
        }

      } else {
        const { data: numData, error: numError } = await supabase
          .rpc('gerar_numero_encomenda', { p_empresa_id: currentEmpresaId });

        if (numError) throw numError;
        const numeroEncomenda = numData || `${new Date().getFullYear()}-0001`;

        const { data: enc, error: encError } = await supabase
          .from('encomendas')
          .insert([{ 
            ...comprador, 
            empresa_id: currentEmpresaId,
            numero_encomenda: numeroEncomenda,
            estado: 'Recebida'
          }])
          .select()
          .single();

        if (encError) throw encError;

        if (itens.length > 0) {
          const itensParaInserir = itens.map(item => ({ ...item, encomenda_id: enc.id }));
          const { error: itemsError } = await supabase.from('itens_encomenda').insert(itensParaInserir);
          if (itemsError) throw itemsError;
        }
      }

      navigate('/painel/encomendas');
    } catch (error: any) {
      console.error('Erro ao guardar:', error);
      alert('Erro ao guardar encomenda: ' + (error.message || JSON.stringify(error)));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 mb-6 hover:text-indigo-600">
        <ArrowLeft size={20} /> Voltar
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-950">
          {id ? 'Editar Encomenda' : 'Nova Encomenda'}
        </h1>
      </div>

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
            <textarea 
              placeholder="Notas Públicas (visíveis para o cliente no portal)" 
              className="border p-2 rounded w-full md:col-span-2"
              rows={2}
              value={comprador.notas_publicas}
              onChange={e => setComprador({...comprador, notas_publicas: e.target.value})}
            />
            <textarea 
              placeholder="Notas Internas (apenas visíveis no painel)" 
              className="border p-2 rounded w-full md:col-span-2"
              rows={2}
              value={comprador.notas_internas}
              onChange={e => setComprador({...comprador, notas_internas: e.target.value})}
            />
          </div>
        </section>

        <section className="bg-white p-6 rounded-lg shadow-sm border">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Itens da Encomenda (Peças 3D)</h2>
            <button type="button" onClick={adicionarItem} className="text-indigo-600 flex items-center gap-1 text-sm font-medium">
              <Plus size={16} /> Adicionar Peça
            </button>
          </div>

          <div className="space-y-4">
            {itens.map((item, index) => (
              <div key={index} className="p-4 border rounded-lg bg-gray-50 relative group space-y-4">
                <button 
                  type="button" onClick={() => removerItem(index)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700 p-1"
                >
                  <Trash2 size={18} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Nome da Peça *</label>
                    <input 
                      type="text" placeholder="Ex: Suporte Headset" required
                      className="border p-2 rounded bg-white w-full"
                      value={item.nome_peca}
                      onChange={e => {
                        const newItens = [...itens];
                        newItens[index].nome_peca = e.target.value;
                        setItens(newItens);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Quantidade *</label>
                    <input 
                      type="number" min="1" placeholder="1" required
                      className="border p-2 rounded bg-white w-full"
                      value={item.quantidade}
                      onChange={e => {
                        const newItens = [...itens];
                        newItens[index].quantidade = parseInt(e.target.value) || 1;
                        setItens(newItens);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Preço Unitário (€) *</label>
                    <input 
                      type="number" step="0.01" min="0" placeholder="0.00" required
                      className="border p-2 rounded bg-white w-full"
                      value={item.preco_unitario}
                      onChange={e => {
                        const newItens = [...itens];
                        newItens[index].preco_unitario = parseFloat(e.target.value) || 0;
                        setItens(newItens);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Material</label>
                    <input 
                      type="text" placeholder="Ex: PLA, PETG, ABS"
                      className="border p-2 rounded bg-white w-full"
                      value={item.material}
                      onChange={e => {
                        const newItens = [...itens];
                        newItens[index].material = e.target.value;
                        setItens(newItens);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Cor</label>
                    <input 
                      type="text" placeholder="Ex: Preto Matte"
                      className="border p-2 rounded bg-white w-full"
                      value={item.cor}
                      onChange={e => {
                        const newItens = [...itens];
                        newItens[index].cor = e.target.value;
                        setItens(newItens);
                      }}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-600 block mb-1">Resolução (mm)</label>
                    <input 
                      type="text" placeholder="Ex: 0.2"
                      className="border p-2 rounded bg-white w-full"
                      value={item.altura_camada}
                      onChange={e => {
                        const newItens = [...itens];
                        newItens[index].altura_camada = e.target.value;
                        setItens(newItens);
                      }}
                    />
                  </div>
                </div>

                {/* Upload do Modelo 3D (.GLB / .GLTF) */}
                <div className="pt-3 border-t border-gray-200">
                  <label className="text-xs font-semibold text-gray-700 block mb-1 flex items-center gap-1.5">
                    <FileBox size={16} className="text-indigo-600" />
                    Modelo 3D para AR / VR (.glb ou .gltf)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      accept=".glb,.gltf"
                      id={`file_upload_${index}`}
                      className="hidden"
                      onChange={(e) => handleFileUpload(index, e)}
                    />
                    <label
                      htmlFor={`file_upload_${index}`}
                      className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors border border-indigo-200"
                    >
                      <Upload size={14} />
                      {uploadingIndex === index ? 'A carregar ficheiro...' : item.ficheiro_3d_url ? 'Substituir Modelo 3D' : 'Upload Ficheiro 3D (.glb)'}
                    </label>
                    {item.ficheiro_3d_url ? (
                      <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 rounded-md border border-green-200 font-medium">
                        ✓ Ficheiro 3D anexado
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">
                        Opcional: anexe o ficheiro para visualização 3D e Realidade Aumentada (câmara).
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex justify-end gap-4">
          <button 
            type="button" 
            onClick={() => navigate('/painel/encomendas')}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-bold"
          >
            Cancelar
          </button>
          <button 
            type="submit" disabled={loading}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? 'A guardar...' : <><Save size={20} /> {id ? 'Atualizar Encomenda' : 'Guardar Encomenda'}</>}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EncomendaForm;
