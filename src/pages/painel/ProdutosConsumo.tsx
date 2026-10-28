import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Box, Layers, Zap, Scale, DollarSign, Archive, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Produto {
  id: string;
  nome: string;
  material: string;
  peso_gramas: number;
  tempo_minutos: number;
  preco_base: number;
  cor: string;
}

interface FilamentoConsumo {
  id: string;
  marca_material: string;
  cor: string;
  peso_total_g: number;
  peso_restante_g: number;
  preco_kg: number;
}

const ProdutosConsumo = () => {
  const [activeTab, setActiveTab] = useState<'produtos' | 'consumos'>('produtos');
  const [loading, setLoading] = useState(false);

  // Produtos State
  const [produtos, setProdutos] = useState<Produto[]>([
    { id: '1', nome: 'Suporte Headset Premium', material: 'PLA', peso_gramas: 120, tempo_minutos: 240, preco_base: 15.00, cor: 'Preto Matte' },
    { id: '2', nome: 'Cubo Calibração 20mm', material: 'PETG', peso_gramas: 15, tempo_minutos: 35, preco_base: 3.50, cor: 'Cinza' }
  ]);
  const [novoProduto, setNovoProduto] = useState({
    nome: '', material: 'PLA', peso_gramas: 50, tempo_minutos: 60, preco_base: 10.00, cor: 'Preto'
  });
  const [modalProduto, setModalProduto] = useState(false);

  // Filamentos/Consumos State
  const [filamentos, setFilamentos] = useState<FilamentoConsumo[]>([
    { id: '1', marca_material: 'eSUN PLA+', cor: 'Preto Matte', peso_total_g: 1000, peso_restante_g: 750, preco_kg: 22.00 },
    { id: '2', marca_material: 'Bambu Lab PETG Basic', cor: 'Cinza', peso_total_g: 1000, peso_restante_g: 400, preco_kg: 25.00 }
  ]);
  const [novoFilamento, setNovoFilamento] = useState({
    marca_material: '', cor: '', peso_total_g: 1000, peso_restante_g: 1000, preco_kg: 20.00
  });
  const [modalFilamento, setModalFilamento] = useState(false);

  // Registar consumo direto
  const [consumoRegisto, setConsumoRegisto] = useState({ filamentoId: '', gramasUsadas: 0 });

  const handleAddProduto = (e: React.FormEvent) => {
    e.preventDefault();
    const item: Produto = {
      id: Date.now().toString(),
      ...novoProduto
    };
    setProdutos([...produtos, item]);
    setNovoProduto({ nome: '', material: 'PLA', peso_gramas: 50, tempo_minutos: 60, preco_base: 10.00, cor: 'Preto' });
    setModalProduto(false);
  };

  const handleAddFilamento = (e: React.FormEvent) => {
    e.preventDefault();
    const item: FilamentoConsumo = {
      id: Date.now().toString(),
      ...novoFilamento
    };
    setFilamentos([...filamentos, item]);
    setNovoFilamento({ marca_material: '', cor: '', peso_total_g: 1000, peso_restante_g: 1000, preco_kg: 20.00 });
    setModalFilamento(false);
  };

  const RegistarGastoMaterial = (id: string, gramas: number) => {
    setFilamentos(filamentos.map(f => {
      if (f.id === id) {
        const novoRestante = Math.max(0, f.peso_restante_g - gramas);
        return { ...f, peso_restante_g: novoRestante };
      }
      return f;
    }));
  };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6">
      {/* Cabeçalho */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catálogo de Produtos & Consumo</h1>
          <p className="text-sm text-gray-500">Registe produtos frequentes de impressão 3D e acompanhe o consumo do stock de filamentos e resina.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('produtos')}
          className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'produtos'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Box size={18} /> Produtos Pré-Definidos ({produtos.length})
        </button>
        <button
          onClick={() => setActiveTab('consumos')}
          className={`py-3 px-6 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'consumos'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Layers size={18} /> Stock de Filamentos & Consumo
        </button>
      </div>

      {/* Conteúdo Aba 1: Produtos */}
      {activeTab === 'produtos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Catálogo de Impressão</h2>
            <button
              onClick={() => setModalProduto(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Cadastrar Produto
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {produtos.map((p) => (
              <div key={p.id} className="bg-white p-5 rounded-2xl border shadow-sm space-y-3 relative group">
                <button
                  onClick={() => setProdutos(produtos.filter(x => x.id !== p.id))}
                  className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1"
                >
                  <Trash2 size={16} />
                </button>
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                    <Box size={24} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{p.nome}</h3>
                    <span className="text-xs bg-gray-100 text-gray-600 font-semibold px-2 py-0.5 rounded-md">
                      {p.material} · {p.cor}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 text-xs border-t border-gray-100">
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <span className="text-gray-400 block">Peso</span>
                    <strong className="text-gray-800">{p.peso_gramas}g</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <span className="text-gray-400 block">Tempo</span>
                    <strong className="text-gray-800">{p.tempo_minutos}min</strong>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg text-center">
                    <span className="text-gray-400 block">Preço</span>
                    <strong className="text-indigo-600">{p.preco_base.toFixed(2)}€</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conteúdo Aba 2: Stock de Filamentos & Consumo */}
      {activeTab === 'consumos' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Carretéis e Matéria-Prima em Stock</h2>
            <button
              onClick={() => setModalFilamento(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 shadow-sm"
            >
              <Plus size={16} /> Novo Carretel
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filamentos.map((f) => {
              const pct = Math.round((f.peso_restante_g / f.peso_total_g) * 100);
              return (
                <div key={f.id} className="bg-white p-5 rounded-2xl border shadow-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-900 text-base">{f.marca_material}</h3>
                      <p className="text-xs text-gray-500">Cor: <strong className="text-gray-700">{f.cor}</strong> · {f.preco_kg}€/Kg</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${
                      pct > 40 ? 'bg-green-100 text-green-800' : pct > 15 ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pct}% Restante
                    </span>
                  </div>

                  {/* Barra de Progresso do Consumo */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Restante: {f.peso_restante_g}g</span>
                      <span>Total: {f.peso_total_g}g</span>
                    </div>
                    <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          pct > 40 ? 'bg-green-500' : pct > 15 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Registo Rápido de Consumo */}
                  <div className="flex items-center gap-2 pt-2 border-t text-xs">
                    <span className="text-gray-500 font-medium">Abater consumo:</span>
                    <button
                      onClick={() => RegistarGastoMaterial(f.id, 50)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-semibold"
                    >
                      -50g
                    </button>
                    <button
                      onClick={() => RegistarGastoMaterial(f.id, 100)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-semibold"
                    >
                      -100g
                    </button>
                    <button
                      onClick={() => RegistarGastoMaterial(f.id, 250)}
                      className="px-2.5 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-md font-semibold"
                    >
                      -250g
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal Novo Produto */}
      {modalProduto && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddProduto} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Novo Produto no Catálogo</h3>
            <input
              type="text" required placeholder="Nome do Produto"
              className="w-full border p-2.5 rounded-xl text-sm"
              value={novoProduto.nome}
              onChange={e => setNovoProduto({ ...novoProduto, nome: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text" required placeholder="Material (Ex: PLA, PETG)"
                className="border p-2.5 rounded-xl text-sm"
                value={novoProduto.material}
                onChange={e => setNovoProduto({ ...novoProduto, material: e.target.value })}
              />
              <input
                type="text" required placeholder="Cor"
                className="border p-2.5 rounded-xl text-sm"
                value={novoProduto.cor}
                onChange={e => setNovoProduto({ ...novoProduto, cor: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="text-xs text-gray-500">Peso (g)</label>
                <input
                  type="number" required
                  className="border p-2.5 rounded-xl text-sm w-full"
                  value={novoProduto.peso_gramas}
                  onChange={e => setNovoProduto({ ...novoProduto, peso_gramas: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Tempo (min)</label>
                <input
                  type="number" required
                  className="border p-2.5 rounded-xl text-sm w-full"
                  value={novoProduto.tempo_minutos}
                  onChange={e => setNovoProduto({ ...novoProduto, tempo_minutos: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Preço (€)</label>
                <input
                  type="number" step="0.01" required
                  className="border p-2.5 rounded-xl text-sm w-full"
                  value={novoProduto.preco_base}
                  onChange={e => setNovoProduto({ ...novoProduto, preco_base: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalProduto(false)} className="px-4 py-2 text-sm text-gray-600 font-bold">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Salvar Produto</button>
            </div>
          </form>
        </div>
      )}

      {/* Modal Novo Filamento */}
      {modalFilamento && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleAddFilamento} className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h3 className="font-bold text-lg text-gray-900">Novo Carretel de Filamento</h3>
            <input
              type="text" required placeholder="Marca e Material (Ex: eSUN PLA+)"
              className="w-full border p-2.5 rounded-xl text-sm"
              value={novoFilamento.marca_material}
              onChange={e => setNovoFilamento({ ...novoFilamento, marca_material: e.target.value })}
            />
            <input
              type="text" required placeholder="Cor (Ex: Preto Matte)"
              className="w-full border p-2.5 rounded-xl text-sm"
              value={novoFilamento.cor}
              onChange={e => setNovoFilamento({ ...novoFilamento, cor: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500">Peso Total (g)</label>
                <input
                  type="number" required
                  className="border p-2.5 rounded-xl text-sm w-full"
                  value={novoFilamento.peso_total_g}
                  onChange={e => {
                    const val = parseInt(e.target.value) || 0;
                    setNovoFilamento({ ...novoFilamento, peso_total_g: val, peso_restante_g: val });
                  }}
                />
              </div>
              <div>
                <label className="text-xs text-gray-500">Preço / Kg (€)</label>
                <input
                  type="number" step="0.01" required
                  className="border p-2.5 rounded-xl text-sm w-full"
                  value={novoFilamento.preco_kg}
                  onChange={e => setNovoFilamento({ ...novoFilamento, preco_kg: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button type="button" onClick={() => setModalFilamento(false)} className="px-4 py-2 text-sm text-gray-600 font-bold">Cancelar</button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold">Guardar Carretel</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProdutosConsumo;
