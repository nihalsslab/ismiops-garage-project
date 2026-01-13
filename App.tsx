
import React from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import JobList from './pages/JobList';
import Inventory from './pages/Inventory';
import JobCardWizard from './pages/JobCardWizard';
import JobCardDocument from './pages/JobCardDocument';
import Invoice from './pages/Invoice';
import JobDetails from './pages/JobDetails';
import logo from './assets/logo.webp';

const Sidebar = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-border-light flex flex-col shrink-0 no-print transition-transform duration-300 ease-in-out
        md:relative md:translate-x-0
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        print:hidden
      `}>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center shrink-0 rounded-full overflow-hidden bg-white">
              <img src={logo} alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col overflow-hidden">
              <h1 className="text-[#F4B400] text-lg font-black leading-none uppercase tracking-wide">PHOENIX</h1>
              <h2 className="text-black text-[10px] font-bold leading-tight uppercase tracking-wider">MULTY BRAND GARAGE</h2>
            </div>
          </div>
          <button onClick={onClose} className="md:hidden text-gray-500 hover:text-gray-900">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="flex-1 px-4 py-2 flex flex-col gap-1 overflow-y-auto">
          <NavButton to="/" active={isActive('/')} icon="dashboard" label="Dashboard" onClick={onClose} />
          <NavButton to="/jobs" active={isActive('/jobs')} icon="description" label="Job Cards" onClick={onClose} />
          <NavButton to="/inventory" active={isActive('/inventory')} icon="inventory_2" label="Inventory" onClick={onClose} />
          <NavButton to="/customers" active={isActive('/customers')} icon="group" label="Customers" onClick={onClose} />
          <NavButton to="/settings" active={isActive('/settings')} icon="settings" label="Settings" onClick={onClose} />
        </div>
        <div className="p-4 border-t border-border-light">
          <button className="flex w-full items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold shadow-sm">
            <span className="material-symbols-outlined text-[18px]">logout</span>
            <span className="truncate">Log Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

const NavButton = ({ to, active, icon, label, onClick }: { to: string; active: boolean; icon: string; label: string; onClick: () => void }) => (
  <Link
    to={to}
    onClick={onClick}
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
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  return (
    <Router>
      <div className="flex h-screen w-full overflow-hidden bg-bg-light">
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="flex-1 flex flex-col h-full overflow-y-auto overflow-x-hidden relative">
          {/* Mobile Header */}
          <header className="md:hidden h-16 bg-white border-b border-gray-200 flex items-center px-4 justify-between shrink-0 sticky top-0 z-30 print:hidden">
            <div className="flex items-center gap-3">
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-gray-600 hover:bg-gray-100 rounded-lg">
                <span className="material-symbols-outlined">menu</span>
              </button>
              <div className="h-8 w-8 rounded-full overflow-hidden">
                <img src={logo} alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-gray-900">Phoenix Garage</span>
            </div>
          </header>

          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/jobs" element={<JobList />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/new-job" element={<JobCardWizard />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
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
