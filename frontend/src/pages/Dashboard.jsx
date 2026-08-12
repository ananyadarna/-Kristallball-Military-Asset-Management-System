import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { StatCard } from '../components/StatCard';
import { NetMoveModal } from '../components/NetMoveModal';
import { LayoutDashboard, Compass, Archive, ShoppingBag, Truck, ClipboardList, ShieldClose } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [metrics, setMetrics] = useState(null);
  const [assets, setAssets] = useState([]);
  const [bases, setBases] = useState([]);
  const [selectedBase, setSelectedBase] = useState(user?.role === 'ADMIN' ? '' : (user?.baseId || ''));
  const [showNetMoveModal, setShowNetMoveModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      fetchBases();
    }
  }, [user]);

  useEffect(() => {
    fetchMetrics();
  }, [selectedBase]);

  const fetchBases = async () => {
    try {
      const response = await api.get('/assets/bases');
      setBases(response.data);
    } catch (err) {
      console.error("Failed to load bases:", err);
    }
  };

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/assets/metrics?baseId=${selectedBase || ''}`);
      setMetrics(response.data.summary);
      setAssets(response.data.assets);
    } catch (err) {
      console.error("Failed to fetch metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !metrics) {
    return <div className="text-center p-8 text-gray-400">Loading metrics...</div>;
  }

  // Formatting data for Recharts visualization
  const chartData = assets.map(asset => ({
    name: asset.name,
    balance: parseInt(asset.closing_balance),
    assigned: parseInt(asset.assigned),
    expended: parseInt(asset.expended)
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
            <LayoutDashboard className="h-6 w-6 text-military-400" />
            Tactical Inventory Dashboard
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time status overview of military logistics.</p>
        </div>

        {user?.role === 'ADMIN' && (
          <div className="flex items-center gap-2 bg-slate-900 px-4 py-2 rounded-xl border border-slate-800 w-full sm:w-auto">
            <Compass className="h-4 w-4 text-gray-400" />
            <select
              value={selectedBase}
              onChange={(e) => setSelectedBase(e.target.value)}
              className="bg-transparent text-white text-sm focus:outline-none border-none cursor-pointer"
            >
              <option value="" className="bg-slate-900 text-white">All Bases (Global Ops)</option>
              {bases.map(b => (
                <option key={b.id} value={b.id} className="bg-slate-900 text-white">{b.name} ({b.location})</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard title="Opening Balance" value={metrics.openingBalance} icon={Archive} colorClass="border-slate-700" />
          <StatCard 
            title="Net Movement" 
            value={metrics.netMovement} 
            icon={Truck} 
            colorClass="border-emerald-600" 
            onClick={() => setShowNetMoveModal(true)} 
          />
          <StatCard title="Assigned Assets" value={metrics.assigned} icon={ClipboardList} colorClass="border-blue-600" />
          <StatCard title="Expended Assets" value={metrics.expended} icon={ShieldClose} colorClass="border-rose-600" />
          <StatCard title="Closing Balance" value={metrics.closingBalance} icon={ShoppingBag} colorClass="border-military-600" />
        </div>
      )}

      {/* Asset Table & Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-white">Itemized Asset Registry</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-950 text-gray-400 uppercase text-xs tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Net Move</th>
                  <th className="px-4 py-3 text-right">Assigned</th>
                  <th className="px-4 py-3 text-right">Expended</th>
                  <th className="px-4 py-3 text-right">Closing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3.5 font-semibold text-white">{asset.name}</td>
                    <td className="px-4 py-3.5"><span className="px-2 py-1 bg-slate-950 rounded text-xs text-gray-400 border border-slate-800">{asset.category}</span></td>
                    <td className="px-4 py-3.5 text-right font-medium">{asset.net_movement}</td>
                    <td className="px-4 py-3.5 text-right">{asset.assigned}</td>
                    <td className="px-4 py-3.5 text-right">{asset.expended}</td>
                    <td className="px-4 py-3.5 text-right font-bold text-military-300">{asset.closing_balance}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg flex flex-col justify-between">
          <h2 className="text-lg font-bold mb-4 text-white">Inventory Chart</h2>
          <div className="h-64 flex-grow">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b' }} />
                <Legend />
                <Bar dataKey="balance" name="Closing" fill="#839b5a" radius={[4, 4, 0, 0]} />
                <Bar dataKey="assigned" name="Assigned" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {showNetMoveModal && (
        <NetMoveModal metrics={metrics} onClose={() => setShowNetMoveModal(false)} />
      )}
    </div>
  );
};
export default Dashboard;
