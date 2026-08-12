import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { Send, ArrowRightLeft, Calendar } from 'lucide-react';

export const Transfers = () => {
  const { user } = useContext(AuthContext);
  const [transfers, setTransfers] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Form states
  const [sourceBase, setSourceBase] = useState(user.role === 'ADMIN' ? '' : user.baseId);
  const [destBase, setDestBase] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState('');
  const [quantity, setQuantity] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransfers();
    fetchBases();
    fetchEquipmentTypes();
  }, []);

  const fetchTransfers = async () => {
    try {
      const response = await api.get('/transfers');
      setTransfers(response.data);
    } catch (err) {
      console.error("Failed to load transfers:", err);
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

    if (parseInt(sourceBase) === parseInt(destBase)) {
      setMessage({ text: "Source and Destination base cannot be the same.", type: "error" });
      return;
    }

    setLoading(true);

    try {
      await api.post('/transfers', {
        sourceBaseId: parseInt(sourceBase),
        destinationBaseId: parseInt(destBase),
        equipmentTypeId: parseInt(selectedEquipment),
        quantity: parseInt(quantity)
      });
      setMessage({ text: "Transfer completed successfully!", type: "success" });
      setQuantity('');
      setSelectedEquipment('');
      setDestBase('');
      fetchTransfers();
    } catch (err) {
      setMessage({ text: err.response?.data?.error || "Transfer transaction failed.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <ArrowRightLeft className="h-6 w-6 text-military-400" />
          Cross-Base Asset Transfers
        </h1>
        <p className="text-gray-400 text-sm mt-1">Safely transfer military assets between logistics bases (ACID Transaction protected).</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Transfer Form */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg h-fit">
          <h2 className="text-lg font-bold mb-4 text-white">Ship Assets</h2>

          {message.text && (
            <div className={`p-4 rounded-xl mb-4 text-sm font-semibold border ${
              message.type === 'success' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-rose-950/50 border-rose-900 text-rose-400'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {user.role === 'ADMIN' ? (
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Source Base</label>
                <select
                  required
                  value={sourceBase}
                  onChange={(e) => setSourceBase(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                >
                  <option value="">Select Source Base</option>
                  {bases.map(b => (
                    <option key={b.id} value={b.id}>{b.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Source Base</label>
                <input
                  type="text"
                  readOnly
                  value={`Base #${user.baseId}`}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-gray-500 focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Destination Base</label>
              <select
                required
                value={destBase}
                onChange={(e) => setDestBase(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
              >
                <option value="">Select Destination Base</option>
                {bases.map(b => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>

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
                placeholder="e.g. 10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-military-600 hover:bg-military-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Send className="h-4 w-4" />
              Transfer Assets
            </button>
          </form>
        </div>

        {/* Transfer History */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-white">Transfer Logs</h2>
          <div className="overflow-y-auto max-h-[500px]">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-slate-950 text-gray-400 uppercase text-xs tracking-wider border-b border-slate-800 sticky top-0">
                <tr>
                  <th className="px-4 py-3">Route</th>
                  <th className="px-4 py-3">Asset</th>
                  <th className="px-4 py-3 text-right">Quantity</th>
                  <th className="px-4 py-3 text-right">Status</th>
                  <th className="px-4 py-3 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {transfers.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 font-semibold text-white">
                      <div className="flex items-center gap-1.5">
                        <span>{t.source_base_name}</span>
                        <span className="text-gray-500">→</span>
                        <span>{t.destination_base_name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">{t.equipment_name} <span className="text-xs text-gray-500">[{t.category}]</span></td>
                    <td className="px-4 py-3 text-right font-bold">{t.quantity}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-900 rounded text-xs">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-gray-500 text-xs">
                      <span className="flex items-center justify-end gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(t.timestamp).toLocaleString()}
                      </span>
                    </td>
                  </tr>
                ))}
                {transfers.length === 0 && (
                  <tr>
                    <td colSpan="5" className="text-center p-8 text-gray-500">No transfer movements recorded.</td>
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
export default Transfers;
