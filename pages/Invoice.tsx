
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

  // Inventory State
  const [inventory, setInventory] = React.useState<any[]>([]);

  React.useEffect(() => {
    fetchJobDetails();
    fetchInventory(); // Fetch inventory for autocomplete
    if (new URLSearchParams(window.location.search).get('autoprint') === 'true') {
      setTimeout(() => window.print(), 1000);
    }
  }, [id]);

  const fetchInventory = async () => {
    const res = await api.getInventory();
    if (res.status === 'success' && Array.isArray(res.data)) {
      setInventory(res.data);
    }
  };

  const fetchJobDetails = async () => {
    // 1. Fetch Job Metadata
    const res = await api.getJobs();
    if (res.status === 'success') {
      const found = res.data.find((j: any) => j.id === id);
      if (found) {
        setJob(found);

        // 2. Fetch Invoice Items from dedicated sheet
        const invRes = await api.getInvoiceItems(found.id);
        if (invRes.status === 'success' && invRes.data && invRes.data.length > 0) {
          setItems(invRes.data);
        } else {
          // Fallback to legacy items if invoice sheet is empty
          setItems(found.lineItems || []);
        }
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

    // 1. Save Line Items to dedicated Invoice Sheet
    const invRes = await api.saveInvoiceItems(job.id, items);

    // 2. Update Job Meta (Total Amount) on Jobs Sheet
    const jobRes = await api.updateJob(job.id, {
      totalAmount: totalAmount
      // We don't save lineItems to Jobs sheet anymore to avoid duplication/limit issues
    });

    if (invRes.status === 'success' && jobRes.status === 'success') {
      setJob({ ...job, lineItems: items, totalAmount });
      setIsEditing(false);
    } else {
      alert('Failed to save invoice');
    }
    setSaving(false);
  };

  const calculateTotal = () => items.reduce((sum, item) => sum + item.total, 0);

  // Handle Part Selection from Datalist
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const updates: any = { description: val };

    // Auto-fill price if it matches a part exactly
    if (newItem.type === 'Part') {
      const part = inventory.find(p => p.name === val);
      if (part) {
        updates.unitPrice = part.sellingPrice;
      }
    }
    setNewItem({ ...newItem, ...updates });
  };

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

      <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 md:p-12 print:shadow-none print:p-0 print:block">
        {/* Header Section - Compact for Print */}
        <div className="flex flex-col md:flex-row print:flex-row justify-between gap-8 print:gap-2 pb-8 print:pb-2 border-b border-dashed border-gray-200">
          <div className="flex flex-col gap-4 print:gap-1">
            <div className="flex items-center gap-3 print:gap-2">
              <div className="size-16 print:size-10 rounded-full flex items-center justify-center overflow-hidden bg-white border border-gray-100">
                <img src={logo} alt="Phoenix Garage" className="w-full h-full object-cover" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-[#F4B400] text-xl print:text-sm font-black leading-none uppercase tracking-wide">PHOENIX</h1>
                <h2 className="text-slate-900 text-xs print:text-[8px] font-bold leading-tight uppercase tracking-wider">MULTI BRAND GARAGE</h2>
              </div>
            </div>
            <div className="text-sm print:text-[9px] text-slate-500 leading-relaxed pl-1">
              <p className="font-bold">AMMINIKKAD, AMMINIKKAD, 679322</p>
              <p className="font-bold">Malappuram, Kerala ph: 9847805330</p>
            </div>
          </div>
          <div className="flex flex-col items-start md:items-end print:items-end gap-1 print:gap-0">
            <h3 className="text-2xl print:text-lg font-bold text-slate-900">INV-{job.id.split('-')[1]}</h3>
            <div className="text-sm print:text-[9px] text-slate-500 text-right mt-1 print:mt-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1">
              <span className="text-slate-400 font-medium">Issued Date:</span>
              <span className="font-medium text-slate-700">{job.date}</span>
            </div>
          </div>
        </div>

        {/* Details Section - Compact for Print */}
        <div className="grid grid-cols-1 md:grid-cols-2 print:grid-cols-2 gap-8 print:gap-4 py-8 print:py-2">
          <div className="flex flex-col gap-3 print:gap-1">
            <h4 className="text-xs print:text-[8px] font-bold uppercase text-slate-400 tracking-wider">Bill To</h4>
            <div className="bg-gray-50 rounded-lg p-4 print:p-2 border border-gray-100">
              <p className="font-bold text-slate-900 text-lg print:text-xs">{job.customerName}</p>
              <p className="text-slate-600 text-sm print:text-[9px] mt-2 print:mt-0 flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px] print:text-[12px] print:hidden">phone</span> {job.phone}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-3 print:gap-1">
            <h4 className="text-xs print:text-[8px] font-bold uppercase text-slate-400 tracking-wider">Vehicle Details</h4>
            <div className="bg-gray-50 rounded-lg p-4 print:p-2 border border-gray-100">
              <p className="font-bold text-slate-900 text-lg print:text-xs">{job.brand} {job.model}</p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                {job.numberPlate && (
                  <span className="font-mono bg-gray-100 border border-gray-200 px-1.5 rounded text-sm print:text-[9px] uppercase font-bold text-slate-700">{job.numberPlate}</span>
                )}
                {job.km && (
                  <span className="text-slate-500 text-xs print:text-[8px] font-bold">KM: {job.km}</span>
                )}
                <span className="text-slate-600 text-sm print:text-[9px]">{job.vehicle || `${job.brand} ${job.model}`}
                  {job.fuelType && <span className="ml-1 text-xs print:text-[8px] text-gray-400">({job.fuelType})</span>}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* --- EDIT MODE INPUT --- */}
        {isEditing && (
          <div className="no-print bg-blue-50/50 border border-blue-100 p-4 rounded-lg mb-6 flex flex-wrap gap-4 items-end">

            {/* 1. Type Selection (Now First) */}
            <div className="w-24">
              <label className="block text-xs font-bold text-gray-500 mb-1">Type *</label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={newItem.type}
                onChange={e => setNewItem({ ...newItem, type: e.target.value as any })}
              >
                <option value="Labour">Labour</option>
                <option value="Part">Part</option>
                <option value="Fluid">Fluid</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* 2. Category Selection */}
            <div className="w-40">
              <label className="block text-xs font-bold text-gray-500 mb-1">Category *</label>
              <select
                className="w-full border rounded p-2 text-sm"
                value={newItem.category}
                onChange={e => setNewItem({ ...newItem, category: e.target.value as any })}
              >
                <option value="" disabled>Select category...</option>
                {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* 3. Description (Filtered Datalist if Part) */}
            <div className="flex-1 min-w-[200px]">
              <label className="block text-xs font-bold text-gray-500 mb-1">Description *</label>
              <input
                type="text"
                list={newItem.type === 'Part' ? "filtered-parts" : ""}
                className="w-full border rounded p-2 text-sm"
                placeholder={newItem.type === 'Part' ? `Search ${newItem.category || ''} Parts...` : "Service description..."}
                value={newItem.description}
                onChange={handleDescriptionChange}
                disabled={newItem.type === 'Part' && !newItem.category}
              />
              {newItem.type === 'Part' && (
                <datalist id="filtered-parts">
                  {inventory
                    .filter(part => !newItem.category || part.category === newItem.category)
                    .map(part => (
                      <option key={part.id} value={part.name}>
                        SKU: {part.sku} | Stock: {part.stockQty} | ₹{part.sellingPrice}
                      </option>
                    ))}
                </datalist>
              )}
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

        {/* Grouped Items Table - Smaller Text for Print */}
        <div className="mb-8 print:mb-1">
          {/* Header */}
          <div className="grid grid-cols-12 gap-4 print:gap-2 border-b-2 border-slate-900 pb-2 mb-4 print:mb-1 text-xs print:text-[8px] font-bold uppercase text-slate-900 tracking-wider">
            <div className="col-span-6">Description</div>
            <div className="col-span-2 text-right">Qty/Hrs</div>
            <div className="col-span-2 text-right">Rate</div>
            <div className="col-span-2 text-right">Amount</div>
          </div>

          {[...new Set(items.map(i => i.category))].sort().map(category => {
            const categoryItems = items.filter(i => i.category === category);
            const categoryTotal = categoryItems.reduce((sum, i) => sum + i.total, 0);

            return (
              <div key={category} className="mb-6 print:mb-1">
                {/* Category Header */}
                <div className="bg-gray-100 px-3 py-1 print:py-0 text-xs print:text-[8px] font-bold uppercase tracking-wider text-slate-900 mb-2 print:mb-0.5 border-l-4 border-slate-900">
                  Category: {category}
                </div>

                {categoryItems.map(item => (
                  <div key={item.id} className="grid grid-cols-12 gap-4 print:gap-2 py-3 print:py-0.5 border-b border-gray-100 text-sm print:text-[9px] group">
                    <div className="col-span-6">
                      <p className="font-bold text-slate-900">{item.description}</p>
                      {/* Optional extra text if available, or just generic */}
                      <p className="text-xs print:text-[7px] text-slate-500">{item.type} - {item.id ? 'Item' : 'Service'}</p>
                    </div>
                    <div className="col-span-2 text-right font-mono text-slate-600">{item.quantity}</div>
                    <div className="col-span-2 text-right font-mono text-slate-600">₹{item.unitPrice.toFixed(2)}</div>
                    <div className="col-span-2 text-right font-bold font-mono text-slate-900">
                      ₹{item.total.toFixed(2)}
                      {isEditing && (
                        <button onClick={() => handleRemoveItem(item.id)} className="ml-2 text-red-400 hover:text-red-600 no-print">
                          <span className="material-symbols-outlined text-[16px] align-middle">delete</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {/* Category Subtotal */}
                <div className="flex justify-end pt-2 print:pt-0.5">
                  <div className="text-xs print:text-[8px] uppercase font-bold text-slate-500 mr-4">Subtotal: {category}</div>
                  <div className="text-sm print:text-[9px] font-bold font-mono text-slate-900">₹{categoryTotal.toFixed(2)}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex flex-col md:flex-row justify-end items-end gap-12">
          <div className="w-full md:w-80 flex flex-col gap-3">
            {/* Total Logic */}
            {(items.length > 0 || isEditing) ? (
              <>
                <div className="flex justify-between items-center text-sm border-t border-gray-100 pt-3">
                  <span className="text-slate-900 font-bold">Combined Subtotal</span>
                  <span className="text-slate-900 font-bold font-mono">₹{calculateTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm pb-3">
                  <span className="text-slate-500 font-medium">Tax (0%)</span>
                  <span className="text-slate-900 font-semibold font-mono">₹0.00</span>
                </div>
                <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded">
                  <span className="font-black text-lg uppercase tracking-wide">Grand Total</span>
                  <span className="font-black text-2xl font-mono">₹{calculateTotal().toFixed(2)}</span>
                </div>
              </>
            ) : (
              <div className="flex justify-between items-center bg-slate-900 text-white p-3 rounded">
                <span className="font-black text-lg uppercase tracking-wide">Grand Total</span>
                <span className="font-black text-2xl font-mono">₹{job.totalAmount?.toFixed(2) || '0.00'}</span>
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 print:mt-4 print:pt-4 border-t border-gray-200 flex flex-col md:flex-row justify-end items-center md:items-end print:justify-center print:items-center gap-8 print:gap-2 page-break-avoid">
          <div className="flex flex-col gap-2 w-64 print:mt-4">
            <div className="h-16 border-b border-slate-900 w-full mb-2"></div>
            <p className="text-xs text-center text-slate-500 font-medium uppercase tracking-wider">Authorized Signature</p>
          </div>
        </div>
      </div>


      <style>{`
        @media print {
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 0;
            padding: 0;
            background: white !important;
          }
          /* Reset container heights/overflows to prevent scrollbars */
          html, body, #root, main, div {
            overflow: visible !important;
            height: auto !important;
          }
          
          /* Hide Sidebar and other non-print elements globally if not already handled */
          .no-print, nav, aside {
            display: none !important;
          }

          /* Main container padding for print */
          .print\\:p-0 {
            padding: 40px !important;
            border: none !important;
            box-shadow: none !important;
          }
          
          /* Hide scrollbars */
          ::-webkit-scrollbar {
            display: none;
          }

          /* Avoid page breaks inside elements */
          .page-break-avoid {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
      `}</style>
    </div >
  );
};

export default Invoice;
