
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobStatus } from '../types';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState<any[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, inventoryRes] = await Promise.all([
        api.getJobs(),
        api.getInventory()
      ]);

      if (jobsRes.status === 'success') {
        setJobs(jobsRes.data);
      }
      if (inventoryRes.status === 'success') {
        setInventory(inventoryRes.data);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data', error);
    } finally {
      setLoading(false);
    }
  };

  const openJobsCount = jobs.filter(j => j.status === JobStatus.OPEN).length;
  const inProgressCount = jobs.filter(j => j.status === JobStatus.IN_PROGRESS).length;
  const completedCount = jobs.filter(j => j.status === JobStatus.FINISHED).length;
  // Low Stock: Less than 6 items (includes 0)
  const lowStockItems = inventory.filter(p => Number(p.stockQty) < 6);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-8 flex flex-col gap-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-[#181111] text-4xl font-black leading-tight tracking-tight">Dashboard</h2>
          <p className="text-secondary-text text-base">Today's overview · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
        </div>
        <button
          onClick={() => navigate('/new-job')}
          className="flex items-center justify-center gap-2 rounded-lg h-11 px-6 bg-primary hover:bg-primary-dark transition-colors text-white text-sm font-bold shadow-lg shadow-red-900/20"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="truncate">New Job Card</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Open Jobs" value={openJobsCount} subtitle="Needs Attention" icon="assignment" color="yellow" />
        <StatCard title="In Progress" value={inProgressCount} subtitle="On Track" icon="construction" color="blue" />
        <StatCard title="Completed" value={completedCount} subtitle="Today" icon="check_circle" color="emerald" />
        <StatCard title="Total Jobs" value={jobs.length} subtitle="All Time" icon="folder_open" color="gray" />
        <StatCard title="Low Stock" value={lowStockItems.length} subtitle="Action Required" icon="warning" color="primary" highlight />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[#181111] text-lg font-bold">Low Stock Items</h3>
          <button
            onClick={() => navigate('/inventory')}
            className="text-sm font-medium text-primary hover:text-primary-dark flex items-center gap-1"
          >
            View Inventory <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {lowStockItems.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl border border-gray-100 text-gray-400">
            All stock levels are healthy!
          </div>
        ) : (
          <div className="w-full overflow-hidden rounded-xl border border-border-light bg-white shadow-sm">
            <table className="w-full text-left">
              <thead className="bg-[#fcfcfc] border-b border-border-light text-xs uppercase font-semibold text-gray-500 tracking-wider">
                <tr>
                  <th className="px-6 py-4">Part Name</th>
                  <th className="px-6 py-4">SKU</th>
                  <th className="px-6 py-4">Stock</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-light">
                {lowStockItems.slice(0, 5).map(item => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                          <span className="material-symbols-outlined">oil_barrel</span>
                        </div>
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 font-mono">{item.sku}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${item.status === 'Out of Stock' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {item.stockQty} Units ({item.status})
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => navigate('/inventory')}
                        className="h-8 px-3 rounded-md bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold transition-colors"
                      >
                        Restock
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, icon, color, highlight }: any) => {
  const colorMap: any = {
    yellow: 'bg-yellow-100 text-yellow-700',
    blue: 'bg-blue-100 text-blue-700',
    emerald: 'bg-emerald-100 text-emerald-700',
    gray: 'bg-gray-100 text-gray-700',
    primary: 'bg-primary/20 text-primary',
  };

  return (
    <div className={`bg-white rounded-xl p-5 border border-border-light shadow-sm flex flex-col justify-between h-36 relative overflow-hidden group hover:shadow-md transition-all ${highlight ? 'ring-1 ring-primary/30' : ''}`}>
      {highlight && <div className="absolute inset-0 bg-primary/5"></div>}
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <span className="material-symbols-outlined text-6xl">{icon}</span>
      </div>
      <div className="flex items-center gap-3 z-10">
        <div className={`p-2 rounded-lg ${colorMap[color]}`}>
          <span className="material-symbols-outlined block">{icon}</span>
        </div>
        <span className="text-sm font-medium text-gray-600">{title}</span>
      </div>
      <div className="z-10 mt-auto">
        <p className="text-[#181111] text-3xl font-bold leading-tight">{value}</p>
        <p className={`text-xs font-medium mt-1 ${color === 'primary' ? 'text-primary' : 'text-gray-500'}`}>{subtitle}</p>
      </div>
    </div>
  );
};

export default Dashboard;
