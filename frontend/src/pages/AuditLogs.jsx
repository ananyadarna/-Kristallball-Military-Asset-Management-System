import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { ShieldAlert, Calendar, User } from 'lucide-react';

export const AuditLogs = () => {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/assets/audit-logs');
      setLogs(response.data);
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    }
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'PURCHASE':
        return 'bg-emerald-950 text-emerald-400 border border-emerald-900';
      case 'TRANSFER':
        return 'bg-blue-950 text-blue-400 border border-blue-900';
      case 'ASSIGNMENT':
        return 'bg-violet-950 text-violet-400 border border-violet-900';
      case 'EXPENDITURE':
        return 'bg-rose-950 text-rose-400 border border-rose-900';
      default:
        return 'bg-slate-950 text-slate-400 border border-slate-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2 text-white">
          <ShieldAlert className="h-6 w-6 text-military-400" />
          Central System Audit Trail
        </h1>
        <p className="text-gray-400 text-sm mt-1">Immutable audit records tracking all inventory adjustments and assignments.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-lg">
        <h2 className="text-lg font-bold mb-4 text-white">Activity Log Trail</h2>
        <div className="overflow-y-auto max-h-[600px]">
          <table className="w-full text-left text-sm text-gray-300">
            <thead className="bg-slate-950 text-gray-400 uppercase text-xs tracking-wider border-b border-slate-800 sticky top-0">
              <tr>
                <th className="px-4 py-3">Operator</th>
                <th className="px-4 py-3">Action</th>
                <th className="px-4 py-3">Details</th>
                <th className="px-4 py-3 text-right">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-800/50 transition">
                  <td className="px-4 py-3.5 font-semibold text-white">
                    <span className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <div>
                        <p>{log.username}</p>
                        <p className="text-xs text-gray-500 uppercase">{log.role}</p>
                      </div>
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`px-2 py-1 rounded text-xs uppercase font-bold ${getActionBadge(log.action)}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-gray-300 max-w-md break-words">{log.details}</td>
                  <td className="px-4 py-3.5 text-right text-gray-500 text-xs">
                    <span className="flex items-center justify-end gap-1.5">
                      <Calendar className="h-3.5 w-3.5" />
                      {new Date(log.created_at).toLocaleString()}
                    </span>
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan="4" className="text-center p-8 text-gray-500">No logs found in audit logs table.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
export default AuditLogs;
