import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Purchases from './pages/Purchases';
import Transfers from './pages/Transfers';
import Assignments from './pages/Assignments';
import AuditLogs from './pages/AuditLogs';

const ProtectedLayout = ({ children }) => {
  const { token, loading } = useContext(AuthContext);

  if (loading) return <div className="text-center p-8 text-gray-400">Loading Session...</div>;
  if (!token) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <div className="flex pt-16">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </div>
    </div>
  );
};

const AppContent = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<ProtectedLayout><Dashboard /></ProtectedLayout>} />
        <Route path="/purchases" element={<ProtectedLayout><Purchases /></ProtectedLayout>} />
        <Route path="/transfers" element={<ProtectedLayout><Transfers /></ProtectedLayout>} />
        <Route path="/assignments" element={<ProtectedLayout><Assignments /></ProtectedLayout>} />
        <Route path="/audit-logs" element={<ProtectedLayout><AuditLogs /></ProtectedLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
