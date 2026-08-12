import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ShoppingCart, Plus, Calendar } from 'lucide-react';

export const Purchases = () => {
  const { user } = useContext(AuthContext);
  const [purchases, setPurchases] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);
  
  // Form states
  const [selectedBase, setSelectedBase] = useState(user?.role === 'ADMIN' ? '' : (user?.baseId || ''));
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPurchases();
    fetchEquipmentTypes();
    if (user?.role === 'ADMIN') {
      fetchBases();
    }
  }, [user]);

  const fetchPurchases = async () => {
    try {
      const response = await api.get('/purchases');
      setPurchases(response.data);
    } catch (err) {
      console.error("Failed to load purchases:", err);
    }
  };

  const fetchBases = async () => {
    try {
      const response = await api.get('/assets/bases');
      setBases(response.data);
    } catch (err) {
      console.error("Failed to load bases:", err);
    }
  };

  const fetchEquipmentTypes = async () => {
    try {
      const response = await api.get('/assets/equipment-types');
      setEquipmentTypes(response.data);
    } catch (err) {
      console.error("Failed to load equipment types:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });
    setLoading(true);

    try {
      await api.post('/purchases', {
        baseId: selectedBase,
        equipmentTypeId: selectedEquipment,
        quantity: parseInt(quantity)
      });
      setMessage({ text: "Purchase logged successfully!", type: "success" });
      setQuantity('');
      setSelectedEquipment('');
      fetchPurchases();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Purchase failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <ShoppingCart className="h-6 w-6 text-military-400" />
          Asset Purchase Logging
        </h1>
        <p className="text-gray-400 text-sm mt-1">Record newly procured assets arriving at military depots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Purchase Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg h-fit">
          <h2 className="text-lg font-bold mb-4 text-white">Log Procurement</h2>
          
          {message.text && (
            <div className={`p-4 rounded-xl mb-4 text-sm font-semibold border ${
              message.type === 'success' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-rose-950/50 border-rose-900 text-rose-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {user?.role === 'ADMIN' ? (
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Target Base</label>
                <select
                  required
                  value={selectedBase}
                  onChange={(e) => setSelectedBase(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                >
                  <option value="">Select Base</option>
                  {bases.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Target Base</label>
                <input
                  type="text"
                  readOnly
                  value={`Base #${user?.baseId || ''}`}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-gray-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Equipment Type</label>
              <select
                required
                value={selectedEquipment}
                onChange={(e) => setSelectedEquipment(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
              >
                <option value="">Select Equipment</option>
                {equipmentTypes.map(e => (
                  <option key={e.id} value={e.id}>{e.name} [{e.category}]</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Quantity</label>
              <input
                type="number"
                required
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                placeholder="e.g. 50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-military-600 hover:bg-military-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Log Assets
            </button>
          </form>
        </div>

        {/* Purchase History */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-white">Procurement Log History</h2>
          <div className="overflow-y-auto max-h-[500px]">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-950 text-gray-400 uppercase text-xs tracking-wider border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Base</th>
                  <th className="px-4 py-3">Equipment</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {purchases.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-semibold text-white">{p.base_name}</td>
                    <td className="px-4 py-3">{p.equipment_name} <span className="text-xs text-gray-500">[{p.category}]</span></td>
                    <td className="px-4 py-3 text-right font-bold text-military-300">{p.quantity}</td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      <span className="flex items-center justify-end gap-1.5">
                        <Calendar className="h-3 w-3" />
                        {new Date(p.created_at).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {purchases.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center p-8 text-gray-500">No procurement logs recorded.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Purchases;
