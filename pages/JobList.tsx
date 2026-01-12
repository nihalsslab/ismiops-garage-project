
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobStatus, PaymentStatus } from '../types';

const JobList: React.FC = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingJob, setEditingJob] = useState<any>(null);

  React.useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    const res = await api.getJobs();
    if (res.status === 'success') {
      setJobs(res.data);
    }
    setLoading(false);
  };

  const filteredJobs = jobs.filter(job => {
    const matchesFilter = filter === 'All' ||
      (filter === 'Open' && job.status === JobStatus.OPEN) ||
      (filter === 'In Progress' && job.status === JobStatus.IN_PROGRESS) ||
      (filter === 'Finished' && job.status === JobStatus.FINISHED) ||
      (filter === 'Paid' && job.paymentStatus === PaymentStatus.PAID);

    // Safety check for search fields
    const matchesSearch = (job.customerName || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.vehicle || '').toLowerCase().includes(search.toLowerCase()) ||
      (job.id || '').toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  if (loading) return <div className="p-8">Loading jobs...</div>;

  const handleDeleteJob = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent row click nav
    if (!confirm('Are you sure you want to delete this job card?')) return;

    setJobs(jobs.filter(job => job.id !== id));

    const res = await api.deleteJob(id);
    if (res.status !== 'success') {
      alert('Failed to delete job: ' + res.message);
      fetchJobs();
    }
  };

  const handleEditJob = (job: any) => {
    setEditingJob(job);
  };

  const handleSaveJob = async (updates: any) => {
    const res = await api.updateJob(editingJob.id, updates);
    if (res.status === 'success') {
      setEditingJob(null);
      fetchJobs();
    } else {
      alert('Failed to update job: ' + res.message);
    }
  };

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-[#181111]">All Jobs</h1>
          <p className="text-secondary-text text-base">View and manage all active and past job cards</p>
        </div>
        <button
          onClick={() => navigate('/new-job')}
          className="flex items-center justify-center gap-2 rounded-full h-11 px-6 bg-primary hover:bg-primary-dark text-white shadow-lg shadow-primary/30"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="text-sm font-bold">New Job Card</span>
        </button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {['All', 'Open', 'In Progress', 'Finished', 'Paid'].map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-all ${filter === tab ? 'bg-[#181111] text-white' : 'bg-white border border-transparent hover:border-gray-200 text-[#181111]'
                }`}
            >
              <span className="text-sm font-medium">{tab}</span>
            </button>
          ))}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-400">
            <span className="material-symbols-outlined">search</span>
          </div>
          <input
            type="text"
            className="w-full bg-white rounded-full border border-gray-100 shadow-sm h-12 pl-12 pr-4 focus:ring-2 focus:ring-primary focus:border-primary focus:outline-none transition-shadow"
            placeholder="Search by vehicle, customer, or Job ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-light bg-white shadow-sm">
        <div className="w-full overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="bg-[#fcfcfc] border-b border-border-light text-xs uppercase font-semibold text-gray-500 tracking-wider">
              <tr>
                <th className="px-6 py-4">Job ID</th>
                <th className="px-6 py-4">Vehicle</th>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Date In</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-center">Payment</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredJobs.map(job => (
                <tr key={job.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4 text-sm font-medium text-[#181111]">{job.id}</td>
                  <td className="px-6 py-4">
                    <div className="inline-flex items-center rounded bg-gray-100 px-2 py-1 text-sm font-mono font-medium">
                      {job.vehicle}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-[#181111]">{job.customerName}</span>
                      <span className="text-xs text-gray-500">{job.phone}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{job.date}</td>
                  <td className="px-6 py-4 text-center">
                    <StatusBadge status={job.status} />
                  </td>
                  <td className="px-6 py-4 text-center">
                    <PaymentBadge status={job.paymentStatus} />
                    {job.paymentStatus === PaymentStatus.ADVANCE && job.advanceAmount && (
                      <div className="text-xs text-orange-700 font-medium mt-1">₹{job.advanceAmount}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* View Button */}
                      <button
                        onClick={() => navigate(`/invoice/${job.id}`)}
                        className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-primary transition-colors"
                        title="View Invoice"
                      >
                        <span className="material-symbols-outlined text-[20px]">visibility</span>
                      </button>

                      <button
                        onClick={(e) => { e.stopPropagation(); handleEditJob(job); }}
                        className="p-1.5 rounded-full text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                        title="Edit Job"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>

                      {/* Delete Button - New */}
                      <button
                        onClick={(e) => handleDeleteJob(job.id, e)}
                        className="p-1.5 rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                        title="Delete Job"
                      >
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingJob && (
        <EditJobModal
          job={editingJob}
          onClose={() => setEditingJob(null)}
          onSave={handleSaveJob}
        />
      )}
    </div>
  );
};

const StatusBadge = ({ status }: { status: JobStatus }) => {
  const styles: any = {
    [JobStatus.OPEN]: 'bg-yellow-100 text-yellow-800 ring-yellow-600/20',
    [JobStatus.IN_PROGRESS]: 'bg-blue-100 text-blue-700 ring-blue-600/20',
    [JobStatus.FINISHED]: 'bg-green-100 text-green-700 ring-green-600/20',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
};

const PaymentBadge = ({ status }: { status: PaymentStatus }) => {
  const styles: any = {
    [PaymentStatus.PAID]: 'bg-emerald-100 text-emerald-700 ring-emerald-600/20',
    [PaymentStatus.UNPAID]: 'bg-red-100 text-red-700 ring-red-600/10',
    [PaymentStatus.ADVANCE]: 'bg-orange-100 text-orange-700 ring-orange-600/20',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${styles[status]}`}>
      {status}
    </span>
  );
};

export default JobList;

const EditJobModal = ({ job, onClose, onSave }: { job: any, onClose: () => void, onSave: (data: any) => void }) => {
  const [status, setStatus] = useState(job.status);
  const [paymentStatus, setPaymentStatus] = useState(job.paymentStatus);
  const [advanceAmount, setAdvanceAmount] = useState(job.advanceAmount || '');
  const [notes, setNotes] = useState(job.notes || '');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg text-[#181111]">Edit Job Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value={JobStatus.OPEN}>{JobStatus.OPEN}</option>
              <option value={JobStatus.IN_PROGRESS}>{JobStatus.IN_PROGRESS}</option>
              <option value={JobStatus.FINISHED}>{JobStatus.FINISHED}</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
            <select
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-2.5 shadow-sm focus:border-primary focus:ring-primary"
            >
              <option value={PaymentStatus.UNPAID}>{PaymentStatus.UNPAID}</option>
              <option value={PaymentStatus.PAID}>{PaymentStatus.PAID}</option>
              <option value={PaymentStatus.ADVANCE}>{PaymentStatus.ADVANCE}</option>
            </select>
          </div>
          {paymentStatus === PaymentStatus.ADVANCE && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Advance Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                  className="w-full rounded-lg border-gray-300 pl-7 p-2.5 shadow-sm focus:border-primary focus:ring-primary"
                  placeholder="0.00"
                />
              </div>
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-lg border-gray-300 p-3 shadow-sm focus:border-primary focus:ring-primary resize-none"
              rows={3}
              placeholder="Add notes..."
            />
          </div>
        </div>
        <div className="px-6 py-4 bg-gray-50 flex justify-end gap-3 border-t border-gray-100">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg">Cancel</button>
          <button
            onClick={() => onSave({ status, paymentStatus, notes, advanceAmount: paymentStatus === PaymentStatus.ADVANCE ? Number(advanceAmount) : 0 })}
            className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-dark rounded-lg shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};
