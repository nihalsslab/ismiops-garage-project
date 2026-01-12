
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import JobList from './pages/JobList';
import Inventory from './pages/Inventory';
import JobCardWizard from './pages/JobCardWizard';
import JobCardDocument from './pages/JobCardDocument';
import Invoice from './pages/Invoice';
import logo from './assets/logo.webp';

const Sidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-border-light flex flex-col shrink-0 no-print">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-white">
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col overflow-hidden">
            <h1 className="text-[#F4B400] text-lg font-black leading-none uppercase tracking-wide">PHOENIX</h1>
            <h2 className="text-black text-[10px] font-bold leading-tight uppercase tracking-wider">MULTY BRAND GARAGE</h2>
          </div>
        </div>
      </div>
      <div className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
        <NavLink to="/" active={isActive('/')} icon="dashboard" label="Dashboard" />
        <NavLink to="/jobs" active={isActive('/jobs')} icon="description" label="Job Cards" />
        <NavLink to="/inventory" active={isActive('/inventory')} icon="inventory_2" label="Inventory" />
        <NavLink to="/customers" active={isActive('/customers')} icon="group" label="Customers" />
        <NavLink to="/settings" active={isActive('/settings')} icon="settings" label="Settings" />
      </div>
      <div className="p-4 border-t border-border-light">
        <button className="flex w-full items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold shadow-sm">
          <span className="material-symbols-outlined text-[18px]">logout</span>
          <span className="truncate">Log Out</span>
        </button>
      </div>
    </aside>
  );
};

const NavLink = ({ to, active, icon, label }: { to: string; active: boolean; icon: string; label: string }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group ${active ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50 text-gray-600'
      }`}
  >
    <span className={`material-symbols-outlined text-[22px] ${active ? 'text-primary' : 'text-gray-500 group-hover:text-[#181111]'}`}>
      {icon}
    </span>
    <p className={`text-sm font-medium ${active ? 'text-primary' : 'group-hover:text-[#181111]'}`}>{label}</p>
  </Link>
);

const App: React.FC = () => {
  return (
    <Router>
      <div className="flex h-screen w-full overflow-hidden bg-bg-light">
        <Sidebar />
        <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/new-job" element={<JobCardWizard />} />
            <Route path="/job-card/:id" element={<JobCardDocument />} />
            <Route path="/invoice/:id" element={<Invoice />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
