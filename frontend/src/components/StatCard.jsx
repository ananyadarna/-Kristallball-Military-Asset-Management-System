import React from 'react';

export const StatCard = ({ title, value, icon: Icon, colorClass = "border-military-500", onClick }) => {
  return (
    <div 
      onClick={onClick}
      className={`bg-slate-900 border-l-4 ${colorClass} p-6 rounded-xl shadow-lg flex justify-between items-center ${onClick ? 'cursor-pointer hover:bg-slate-800 transition-all duration-200 hover:-translate-y-1' : ''}`}
    >
      <div>
        <h3 className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</h3>
        <p className="text-3xl font-extrabold mt-2 text-white">{value}</p>
      </div>
      {Icon && (
        <div className="p-3 bg-slate-800 rounded-lg text-gray-300">
          <Icon className="h-6 w-6" />
        </div>
      )}
    </div>
  );
};
