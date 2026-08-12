import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Shield, Compass } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  if (!user) return null;

  return (
    <nav className="h-16 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-6 fixed top-0 left-0 right-0 z-30">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-military-900 rounded-lg text-military-300 font-extrabold tracking-wider border border-military-700">
          KRISTALLBALL
        </div>
        <span className="text-gray-400 text-xs tracking-widest uppercase hidden md:inline-block">
          Asset Management
        </span>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
          <Shield className="h-4 w-4 text-military-400" />
          <span className="text-xs font-semibold text-gray-300 uppercase">{user.role}</span>
        </div>

        {user.baseId && (
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
            <Compass className="h-4 w-4 text-blue-400" />
            <span className="text-xs font-semibold text-gray-300">Base ID: #{user.baseId}</span>
          </div>
        )}

        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user.username}</p>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-1.5 bg-rose-950 hover:bg-rose-900 text-rose-300 text-xs font-bold px-3.5 py-1.8 rounded-lg border border-rose-900 transition"
          >
            <LogOut className="h-3.5 w-3.5" />
            Log Out
          </button>
        </div>
      </div>
    </nav>
  );
};
