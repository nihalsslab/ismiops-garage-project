
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import logo from '../assets/logo.webp';

import { SERVICE_CATEGORIES, LineItem } from '../types';

const Invoice: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  // Editing State
  const [isEditing, setIsEditing] = React.useState(false);
  const [items, setItems] = React.useState<LineItem[]>([]);
  const [saving, setSaving] = React.useState(false);

  // New Item State
  const [newItem, setNewItem] = React.useState<Partial<LineItem>>({
    description: '',
    category: 'General Service',
    type: 'Labour',
    quantity: 1,
    unitPrice: 0
  });

  React.useEffect(() => {
    fetchJobDetails();
    if (new URLSearchParams(window.location.search).get('autoprint') === 'true') {
      setTimeout(() => window.print(), 1000);
    }
  }, [id]);

  const fetchJobDetails = async () => {
    const res = await api.getJobs();
    if (res.status === 'success') {
      const found = res.data.find((j: any) => j.id === id);
      if (found) {
        setJob(found);
        setItems(found.lineItems || []);
      } else {
        alert('Job not found!');
        navigate('/jobs');
      }
    }
    setLoading(false);
  };

  const handlePrint = () => window.print();

  // --- Edit Logic ---

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const handleAddItem = () => {
    if (!newItem.description || !newItem.unitPrice) return alert('Please enter description and price');

    const item: LineItem = {
      id: generateId(),
      description: newItem.description,
      category: newItem.category as any,
      type: newItem.type as any,
      quantity: Number(newItem.quantity),
      unitPrice: Number(newItem.unitPrice),
      total: Number(newItem.quantity) * Number(newItem.unitPrice)
    };

    setItems([...items, item]);
    setNewItem({ description: '', category: 'General Service', type: 'Labour', quantity: 1, unitPrice: 0 });
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(items.filter(i => i.id !== itemId));
  };

  const handleSaveInvoice = async () => {
    setSaving(true);
    const totalAmount = items.reduce((sum, item) => sum + item.total, 0);

    // Update Job with new Items and Total
    const res = await api.updateJob(job.id, {
      lineItems: items,
      totalAmount: totalAmount
    });

    if (res.status === 'success') {
      setJob({ ...job, lineItems: items, totalAmount });
      setIsEditing(false);
    } else {
      alert('Failed to save invoice');
    }
    setSaving(false);
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + item.total, 0);

  if (loading) return <div className="p-8">Loading Invoice...</div>;
  if (!job) return null;

  return (
    <div className="p-8 flex flex-col gap-6 max-w-5xl mx-auto">
      <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm">
            <button onClick={() => navigate('/jobs')} className="text-slate-500 hover:text-primary font-medium">Job Cards</button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">{job.id}</span>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-[#181111]">Invoice #{job.id}</h1>
            <p className="text-slate-500 text-sm mt-1">Service details and payment status.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Edit Toggle */}
          {!isEditing ? (
            <button onClick={() => setIsEditing(true)} className="flex items-center gap-2 h-10 px-4 bg-blue-100 border border-blue-200 rounded-lg text-blue-700 text-sm font-bold shadow-sm hover:bg-blue-200">
              <span className="material-symbols-outlined text-[18px]">edit</span>
              <span className="hidden sm:inline">Edit Items</span>
            </button>
          ) : (
            <button onClick={handleSaveInvoice} disabled={saving} className="flex items-center gap-2 h-10 px-4 bg-green-600 border border-green-700 rounded-lg text-white text-sm font-bold shadow-sm hover:bg-green-700">
              <span className="material-symbols-outlined text-[18px]">save</span>
              <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save Invoice'}</span>
            </button>
          )}

          <button onClick={() => window.open(`#/job-card/${job.id}?autoprint=true`, '_blank')} className="flex items-center gap-2 h-10 px-4 bg-gray-900 border border-gray-900 rounded-lg text-white text-sm font-bold shadow-sm hover:bg-gray-800">
            <span className="material-symbols-outlined text-[18px]">print</span>
            <span className="hidden sm:inline">Job Card</span>
          </button>
          <button onClick={handlePrint} className="flex items-center gap-2 h-10 px-4 bg-white border border-gray-200 rounded-lg text-slate-700 text-sm font-bold shadow-sm hover:bg-gray-50">
            <span className="material-symbols-outlined text-[18px]">receipt_long</span>
            <span className="hidden sm:inline">Print Invoice</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 print:shadow-none print:p-0">
        <div className="flex flex-col md:flex-row justify-between gap-8 pb-8 border-b border-dashed border-gray-200">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="size-16 rounded-full flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                <img src={logo} alt="Phoenix Garage" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#F4B400] text-xl font-black leading-none uppercase tracking-wide">PHOENIX</h1>
                <h2 className="text-slate-900 text-xs font-bold leading-tight uppercase tracking-wider">MULTY BRAND GARAGE</h2>
              </div>
            </div>
            <div className="text-sm text-slate-500 leading-relaxed pl-1">
              <p>123 Garage Lane, Industrial District</p>
              <p>Phoenix, AZ 85001</p>
              <p>(555) 123-4567 | support@phoenixgarage.com</p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end gap-1">
            <h3 className="text-2xl font-bold text-slate-900">INV-{job.id.split('-')[1]}</h3>
            <div className="text-sm text-slate-500 text-right mt-1 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <span className="text-slate-400 font-medium">Issued Date:</span>
              <span className="font-medium text-slate-700">{job.date}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-8">
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Bill To</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="font-bold text-slate-900 text-lg">{job.customerName}</p>
              <p className="text-slate-600 text-sm mt-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">phone</span> {job.phone}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Vehicle Details</h4>
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <p className="font-bold text-slate-900 text-lg">{job.brand} {job.model}</p>
              <p className="text-slate-600 text-sm mt-1">{job.vehicle || `${job.brand} ${job.model}`}
                {job.fuelType && <span className="ml-2 text-xs text-gray-400">({job.fuelType})</span>}
              </p>
            </div>
          </div>
        </div>

        {/* --- EDIT MODE INPUT --- */}
        {isEditing && (
          <div className="no-print bg-blue-50/50 border border-blue-100 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 mb-1">Description</label>
              <input
                type="text"
                className="w-full border rounded p-2 text-sm"
                placeholder="Part name or Service..."
                value={newItem.description}
                onChange={e => setNewItem({ ...newItem, description: e.target.value })}
              />
            </div>
            <div className="w-40">
              <label className="block text-xs font-bold text-gray-500 mb-1">Category</label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={newItem.category}
                onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
              >
                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="w-24">
              <label className="block text-xs font-bold text-gray-500 mb-1">Type</label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={newItem.type}
                onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
              >
                <option value="Part">Part</option>
                <option value="Labour">Labour</option>
                <option value="Fluid">Fluid</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="w-20">
              <label className="block text-xs font-bold text-gray-500 mb-1">Qty</label>
              <input
                type="number"
                className="w-full border rounded p-2 text-sm"
                value={newItem.quantity}
                onChange={e => setNewItem({ ...newItem, quantity: Number(e.target.value) })}
              />
            </div>
            <div className="w-24">
              <label className="block text-xs font-bold text-gray-500 mb-1">Price (₹)</label>
              <input
                type="number"
                className="w-full border rounded p-2 text-sm"
                value={newItem.unitPrice}
                onChange={e => setNewItem({ ...newItem, unitPrice: Number(e.target.value) })}
              />
            </div>
            <button
              onClick={handleAddItem}
              className="h-[38px] px-4 bg-blue-600 text-white font-bold rounded hover:bg-blue-700"
            >
              Add
            </button>
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200 mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500">Description</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500 w-32">Type</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500 text-right w-24">Qty</th>
                <th className="py-3 px-4 text-xs font-semibold uppercase text-slate-500 text-right w-32">Amount</th>
                {isEditing && <th className="no-print py-3 px-4 w-10"></th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Fallback Display if NOT editing and NO items (legacy jobs) */}
              {!isEditing && items.length === 0 && job.complaints && job.complaints.map((c: string, i: number) => (
                <tr key={i} className="hover:bg-gray-50/50">
                  <td className="py-4 px-4 text-sm font-medium text-slate-900">{c} <span className="text-xs text-gray-400 block">General Service</span></td>
                  <td className="py-4 px-4"><span className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded">Labour</span></td>
                  <td className="py-4 px-4 text-right text-sm font-mono">1</td>
                  <td className="py-4 px-4 text-right text-sm font-mono opacity-50">--</td>
                </tr>
              ))}

              {/* Active Items */}
              {items.map((item, i) => (
                <tr key={i} className="hover:bg-gray-50/50 group">
                  <td className="py-4 px-4">
                    <p className="text-sm font-medium text-slate-900">{item.description}</p>
                    <span className="text-xs text-slate-500">{item.category}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${item.type === 'Labour' ? 'bg-blue-50 text-blue-700' :
                      item.type === 'Part' ? 'bg-purple-50 text-purple-700' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-sm text-slate-700 text-right font-mono">{item.quantity}</td>
                  <td className="py-4 px-4 text-sm font-semibold text-slate-900 text-right font-mono">
                    ₹{item.total.toFixed(2)}
                  </td>
                  {isEditing && (
                    <td className="no-print py-4 px-4 text-right">
                      <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                        <span className="material-symbols-outlined text-[20px]">delete</span>
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col md:flex-row justify-end items-end gap-12">
          <div className="w-full md:w-80 flex flex-col gap-3">
            {/* Total Logic */}
            {(items.length > 0 || isEditing) ? (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500 font-medium">Subtotal</span>
                  <span className="text-slate-900 font-semibold font-mono">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-3">
                  <span className="text-slate-500 font-medium">Tax (0%)</span>
                  <span className="text-slate-900 font-semibold font-mono">₹0.00</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span className="text-slate-900 font-bold text-lg">Grand Total</span>
                  <span className="text-primary font-black text-2xl font-mono border-b-4 border-primary/20 pb-1">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center pt-2">
                <span className="text-slate-900 font-bold text-lg">Grand Total</span>
                <span className="text-primary font-black text-2xl font-mono border-b-4 border-primary/20 pb-1">₹{job.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-200 flex flex-col md:flex-row justify-between items-end gap-8">
          <div className="max-w-md">
            <h5 className="text-sm font-bold text-slate-900 mb-2">Terms & Conditions</h5>
            <p className="text-xs text-slate-500 leading-relaxed">
              Payment is due upon receipt. Warranty on parts and labour is 6 months or 5,000 miles.
              We appreciate your business!
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full md:w-64">
            <div className="h-16 border-b border-slate-900 w-full mb-2"></div>
            <p className="text-xs text-center text-slate-500 font-medium uppercase tracking-wider">Authorized Signature</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
