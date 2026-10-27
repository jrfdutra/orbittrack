import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, Clock, Star, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalEncomendas: 0,
    tempoMedio: '3 dias',
    avaliacaoMedia: 4.8
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count, error } = await supabase
          .from('encomendas')
          .select('*', { count: 'exact', head: true });

        if (!error && count !== null) {
          setStats(prev => ({ ...prev, totalEncomendas: count }));
        }
      } catch (err) {
        console.error('Erro ao buscar estatísticas', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
          <div>
            <p className="text-gray-500">Total de Encomendas</p>
            <h3 className="text-3xl font-bold">{stats.totalEncomendas}</h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-full">
            <Package size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
          <div>
            <p className="text-gray-500">Tempo Médio de Fabrico</p>
            <h3 className="text-3xl font-bold">{stats.tempoMedio}</h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
            <Clock size={24} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow border flex items-center justify-between">
          <div>
            <p className="text-gray-500">Avaliação Média</p>
            <h3 className="text-3xl font-bold">{stats.avaliacaoMedia}</h3>
          </div>
          <div className="p-4 bg-yellow-50 text-yellow-600 rounded-full">
            <Star size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
