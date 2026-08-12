import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LayoutDashboard, ShoppingCart, Send, ClipboardList, ShieldAlert } from 'lucide-react';

export const Sidebar = () => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const hasAccess = (allowedRoles) => allowedRoles.includes(user.role);

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 fixed top-16 bottom-0 left-0 z-20 p-4">
      <div className="space-y-1.5">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
              isActive ? 'bg-military-900 text-military-300 border border-military-700' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        {hasAccess(['ADMIN', 'LOGISTICS_OFFICER']) && (
          <NavLink
            to="/purchases"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                isActive ? 'bg-military-900 text-military-300 border border-military-700' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <ShoppingCart className="h-4 w-4" />
            Purchases
          </NavLink>
        )}

        {hasAccess(['ADMIN', 'LOGISTICS_OFFICER']) && (
          <NavLink
            to="/transfers"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                isActive ? 'bg-military-900 text-military-300 border border-military-700' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <Send className="h-4 w-4" />
            Transfers
          </NavLink>
        )}

        {hasAccess(['ADMIN', 'BASE_COMMANDER']) && (
          <NavLink
            to="/assignments"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                isActive ? 'bg-military-900 text-military-300 border border-military-700' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <ClipboardList className="h-4 w-4" />
            Assignments & Exp.
          </NavLink>
        )}

        {hasAccess(['ADMIN']) && (
          <NavLink
            to="/audit-logs"
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold transition ${
                isActive ? 'bg-military-900 text-military-300 border border-military-700' : 'text-gray-400 hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <ShieldAlert className="h-4 w-4" />
            System Audit Logs
          </NavLink>
        )}
      </div>
    </aside>
  );
};
