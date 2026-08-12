import React from 'react';
import { X, ArrowUpRight, ArrowDownRight, RefreshCcw } from 'lucide-react';

export const NetMoveModal = ({ metrics, onClose }) => {
  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex justify-center items-center z-50">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl max-w-md w-full shadow-2xl relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2">
          <RefreshCcw className="h-5 w-5 text-military-400" />
          Net Movement Breakdown
        </h2>

        <div className="space-y-4">
          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-gray-400 flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-emerald-500" /> Purchases (+)
            </span>
            <span className="font-semibold text-emerald-500">+{metrics.purchases}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-gray-400 flex items-center gap-2 text-sm">
              <ArrowUpRight className="h-4 w-4 text-blue-500" /> Transfers In (+)
            </span>
            <span className="font-semibold text-blue-500">+{metrics.transfersIn}</span>
          </div>

          <div className="flex justify-between items-center bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span className="text-gray-400 flex items-center gap-2 text-sm">
              <ArrowDownRight className="h-4 w-4 text-rose-500" /> Transfers Out (-)
            </span>
            <span className="font-semibold text-rose-500">-{metrics.transfersOut}</span>
          </div>

          <hr className="border-slate-800 my-4" />

          <div className="flex justify-between items-center bg-slate-950 p-4 rounded-lg border border-military-600 font-bold">
            <span className="text-white text-sm">Total Net Movement</span>
            <span className={`text-lg ${metrics.netMovement >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
              {metrics.netMovement >= 0 ? '+' : ''}{metrics.netMovement}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-6 w-full bg-military-600 text-white py-2.5 rounded-lg font-semibold hover:bg-military-700 transition"
        >
          Close
        </button>
      </div>
    </div>
  );
};
