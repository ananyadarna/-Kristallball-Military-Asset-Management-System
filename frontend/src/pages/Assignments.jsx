import React, { useState, useEffect, useContext } from 'react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { ClipboardList, Plus, ShieldClose, Calendar } from 'lucide-react';

export const Assignments = () => {
  const { user } = useContext(AuthContext);
  const [assignments, setAssignments] = useState([]);
  const [expenditures, setExpenditures] = useState([]);
  const [bases, setBases] = useState([]);
  const [equipmentTypes, setEquipmentTypes] = useState([]);

  // Form states - Assignment
  const [assignBase, setAssignBase] = useState(user.role === 'ADMIN' ? '' : user.baseId);
  const [assignEquipment, setAssignEquipment] = useState('');
  const [assignQty, setAssignQty] = useState('');
  const [assignTo, setAssignTo] = useState('');
  
  // Form states - Expenditure
  const [expBase, setExpBase] = useState(user.role === 'ADMIN' ? '' : user.baseId);
  const [expEquipment, setExpEquipment] = useState('');
  const [expQty, setExpQty] = useState('');
  const [expReason, setExpReason] = useState('');

  const [message, setMessage] = useState({ text: '', type: '', form: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
    fetchExpenditures();
    fetchEquipmentTypes();
    if (user.role === 'ADMIN') {
      fetchBases();
    }
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await api.get('/assets/assignments');
      setAssignments(response.data);
    } catch (err) {
      console.error("Failed to load assignments:", err);
    }
  };

  const fetchExpenditures = async () => {
    try {
      const response = await api.get('/assets/expenditures');
      setExpenditures(response.data);
    } catch (err) {
      console.error("Failed to load expenditures:", err);
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

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '', form: '' });
    setLoading(true);

    try {
      await api.post('/assets/assignments', {
        baseId: parseInt(assignBase),
        equipmentTypeId: parseInt(assignEquipment),
        quantity: parseInt(assignQty),
        assignedTo: assignTo
      });
      setMessage({ text: "Assignment completed successfully!", type: "success", form: "assign" });
      setAssignQty('');
      setAssignTo('');
      setAssignEquipment('');
      fetchAssignments();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Assignment failed.", type: "error", form: "assign" });
    } finally {
      setLoading(false);
    }
  };

  const handleExpSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '', form: '' });
    setLoading(true);

    try {
      await api.post('/assets/expenditures', {
        baseId: parseInt(expBase),
        equipmentTypeId: parseInt(expEquipment),
        quantity: parseInt(expQty),
        reason: expReason
      });
      setMessage({ text: "Expenditure logged successfully!", type: "success", form: "exp" });
      setExpQty('');
      setExpReason('');
      setExpEquipment('');
      fetchExpenditures();
    } catch (err) {
      setMessage({ text: err.response?.data?.message || "Expenditure logging failed.", type: "error", form: "exp" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <ClipboardList className="h-6 w-6 text-military-400" />
          Personnel Assignments & Expenditures
        </h1>
        <p className="text-gray-400 text-sm mt-1">Deploy assets to battlefield personnel or mark consumed supplies.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Assignments Block */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-white">Log Asset Assignment</h2>
            
            {message.form === 'assign' && message.text && (
              <div className={`p-4 rounded-xl mb-4 text-sm font-semibold border ${
                message.type === 'success' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-rose-950/50 border-rose-900 text-rose-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              {user.role === 'ADMIN' ? (
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Base</label>
                  <select
                    required
                    value={assignBase}
                    onChange={(e) => setAssignBase(e.target.value)}
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
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Base</label>
                  <input
                    type="text"
                    readOnly
                    value={`Base #${user.baseId}`}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-gray-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Equipment</label>
                  <select
                    required
                    value={assignEquipment}
                    onChange={(e) => setAssignEquipment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                  >
                    <option value="">Select Equipment</option>
                    {equipmentTypes.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={assignQty}
                    onChange={(e) => setAssignQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                    placeholder="e.g. 5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Assigned To (Personnel / Unit)</label>
                <input
                  type="text"
                  required
                  value={assignTo}
                  onChange={(e) => setAssignTo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                  placeholder="e.g. Alpha Company Sergeant"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-military-600 hover:bg-military-700 text-white font-semibold py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Assign Asset
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-white">Active Assignments</h2>
            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-slate-950 text-gray-400 uppercase text-xs tracking-wider border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Personnel</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {assignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-semibold text-white">
                        <div>
                          <p>{a.assigned_to}</p>
                          <p className="text-xs text-gray-500">{a.base_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{a.equipment_name}</td>
                      <td className="px-4 py-3 text-right font-bold">{a.quantity}</td>
                    </tr>
                  ))}
                  {assignments.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center p-4 text-gray-500">No active assignments recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Expenditures Block */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-white">Log Stock Expenditure</h2>

            {message.form === 'exp' && message.text && (
              <div className={`p-4 rounded-xl mb-4 text-sm font-semibold border ${
                message.type === 'success' ? 'bg-emerald-950/50 border-emerald-900 text-emerald-400' : 'bg-rose-950/50 border-rose-900 text-rose-400'
              }`}>
                {message.text}
              </div>
            )}

            <form onSubmit={handleExpSubmit} className="space-y-4">
              {user.role === 'ADMIN' ? (
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Base</label>
                  <select
                    required
                    value={expBase}
                    onChange={(e) => setExpBase(e.target.value)}
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
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Base</label>
                  <input
                    type="text"
                    readOnly
                    value={`Base #${user.baseId}`}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2.5 px-4 text-gray-500 focus:outline-none"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Equipment</label>
                  <select
                    required
                    value={expEquipment}
                    onChange={(e) => setExpEquipment(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                  >
                    <option value="">Select Equipment</option>
                    {equipmentTypes.map(e => (
                      <option key={e.id} value={e.id}>{e.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Quantity</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={expQty}
                    onChange={(e) => setExpQty(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                    placeholder="e.g. 1000"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-xs font-semibold uppercase tracking-wider mb-2">Reason (Expenditure Details)</label>
                <input
                  type="text"
                  required
                  value={expReason}
                  onChange={(e) => setExpReason(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:border-military-600 transition"
                  placeholder="e.g. Training exercise ammunition expenditure"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 font-semibold py-2.5 rounded-xl transition duration-200 flex items-center justify-center gap-2"
              >
                <ShieldClose className="h-4 w-4" />
                Expend Stock
              </button>
            </form>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-white">Expenditure History</h2>
            <div className="overflow-y-auto max-h-[300px]">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-slate-950 text-gray-400 uppercase text-xs tracking-wider border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="px-4 py-3">Reason</th>
                    <th className="px-4 py-3">Asset</th>
                    <th className="px-4 py-3 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {expenditures.map((e) => (
                    <tr key={e.id} className="hover:bg-slate-800/50 transition">
                      <td className="px-4 py-3 font-semibold text-white">
                        <div>
                          <p>{e.reason}</p>
                          <p className="text-xs text-gray-500">{e.base_name}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{e.equipment_name}</td>
                      <td className="px-4 py-3 text-right font-bold text-rose-400">-{e.quantity}</td>
                    </tr>
                  ))}
                  {expenditures.length === 0 && (
                    <tr>
                      <td colSpan="3" className="text-center p-4 text-gray-500">No expenditures recorded.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default Assignments;
