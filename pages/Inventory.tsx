
import React, { useState } from 'react';
import { api } from '../services/api';

const Inventory: React.FC = () => {
  const [search, setSearch] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [categoryFilter, setCategoryFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('All Statuses');

  React.useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const res = await api.getInventory();
    if (res.status === 'success') {
      setItems(res.data);
    } else {
      console.error(res.message);
    }
    setLoading(false);
  };

  const handleSavePart = async (formData: any) => {
    let status = 'In Stock';
    if (formData.stockQty === 0) {
      status = 'Out of Stock';
    } else if (formData.stockQty < 6) {
      status = 'Low Stock';
    }

    let res;

    if (editingItem) {
      // Update existing
      res = await api.updatePart(editingItem.id, { ...formData, status });
    } else {
      // Create new
      const payload = {
        ...formData,
        id: Date.now().toString(),
        sku: 'SKU-' + Date.now().toString().slice(-4),
        status
      };
      res = await api.addPart(payload);
    }

    if (res.status === 'success') {
      setIsModalOpen(false);
      setEditingItem(null);
      fetchInventory();
    } else {
      alert('Failed to save part: ' + res.message);
    }
  };

  const handleEditClick = (item: any) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  const handleDeletePart = async (id: string) => {
    if (!confirm('Are you sure you want to delete this part?')) return;

    // Optimistic UI update
    setItems(items.filter(item => item.id !== id));

    const res = await api.deletePart(id);
    if (res.status === 'success') {
      // already updated UI
    } else {
      alert('Failed to delete part: ' + res.message);
      fetchInventory(); // Revert on failure
    }
  };

  const uniqueCategories = ['All Categories', ...Array.from(new Set(items.map(i => i.category || 'Uncategorized')))];

  const getStockStatus = (qty: number) => {
    if (qty === 0) return 'Out of Stock';
    if (qty < 6) return 'Low Stock';
    return 'In Stock';
  };

  const filteredItems = items.filter(i => {
    const matchesSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.sku.toLowerCase().includes(search.toLowerCase());

    const derivedStatus = getStockStatus(Number(i.stockQty));

    const matchesCategory = categoryFilter === 'All Categories' || i.category === categoryFilter;
    const matchesStatus = statusFilter === 'All Statuses' || derivedStatus === statusFilter;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <div className="p-8">Loading inventory...</div>;

  return (
    <div className="p-8 flex flex-col gap-6">
      <div className="flex flex-wrap justify-between items-end gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-black text-[#181111]">Inventory</h1>
          <p className="text-secondary-text text-base">Overview of current stock and assets</p>
        </div>
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center justify-center rounded-lg h-10 px-5 bg-primary hover:bg-primary-dark text-white text-sm font-bold shadow-sm gap-2"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          <span className="truncate">Add New Part</span>
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-border-light shadow-sm">
        <div className="flex flex-col lg:flex-row gap-4 items-center">
          <div className="w-full lg:flex-1 relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-secondary-text">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              className="w-full bg-bg-light border border-border-light rounded-lg pl-10 p-3 text-sm focus:ring-primary focus:border-primary block"
              placeholder="Search by part name or SKU..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex w-full lg:w-auto gap-4">
            <select
              className="bg-bg-light border border-border-light text-sm rounded-lg p-3 w-full lg:w-48 appearance-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {uniqueCategories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <select
              className="bg-bg-light border border-border-light text-sm rounded-lg p-3 w-full lg:w-48 appearance-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option>All Statuses</option>
              <option>In Stock</option>
              <option>Low Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-border-light shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-bg-light text-[#181111] font-semibold border-b border-border-light">
              <tr>
                <th className="px-6 py-4">Part Name</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Qty</th>
                <th className="px-6 py-4">Cost</th>
                <th className="px-6 py-4">Selling</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredItems.map(item => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-[#181111] font-medium">{item.name}</span>
                      <span className="text-xs text-secondary-text">{item.sku}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-secondary-text">{item.category}</td>
                  <td className="px-6 py-4 text-[#181111] font-medium">{item.stockQty}</td>
                  <td className="px-6 py-4 text-secondary-text">₹{item.costPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-[#181111] font-medium">₹{item.sellingPrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-center">
                    <StockStatus status={getStockStatus(Number(item.stockQty))} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-secondary-text hover:text-primary transition-colors"
                      >
                        <span className="material-symbols-outlined text-[20px]">edit</span>
                      </button>
                      <button
                        onClick={() => handleDeletePart(item.id)}
                        className="text-secondary-text hover:text-red-600 transition-colors"
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

      {isModalOpen && (
        <AddPartModal
          initialData={editingItem}
          onClose={() => { setIsModalOpen(false); setEditingItem(null); }}
          onSave={handleSavePart}
        />
      )}
    </div>
  );
};

const StockStatus = ({ status }: { status: string }) => {
  const styles: any = {
    'In Stock': 'bg-green-100 text-green-800',
    'Low Stock': 'bg-yellow-100 text-yellow-800',
    'Out of Stock': 'bg-red-100 text-red-800',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[status]}`}>
      {status}
    </span>
  );
};

const AddPartModal = ({ onClose, onSave, initialData }: { onClose: () => void; onSave: (data: any) => void; initialData?: any }) => {
  const [formData, setFormData] = useState({
    name: '', category: '', brand: '', stockQty: 0, costPrice: 0, sellingPrice: 0, notes: ''
  });

  const [isCustomCategory, setIsCustomCategory] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        category: initialData.category || '',
        brand: initialData.brand || '',
        stockQty: Number(initialData.stockQty) || 0,
        costPrice: Number(initialData.costPrice) || 0,
        sellingPrice: Number(initialData.sellingPrice) || 0,
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleSubmit = () => {
    if (!formData.name.trim()) return alert('Please enter Part Name');
    if (!formData.category.trim()) return alert('Please select or enter a Category');
    if (formData.stockQty < 0) return alert('Stock Quantity cannot be negative'); // Changed to allow 0
    if (formData.costPrice <= 0) return alert('Cost Price must be greater than 0');
    if (formData.sellingPrice <= 0) return alert('Selling Price must be greater than 0');

    // Pass formData directly, parent handles ID/SKU/Status
    onSave(formData);
  };

  const handleChange = (field: string, value: any) => {
    if (field === 'category' && value === 'other') {
      setIsCustomCategory(true);
      setFormData(prev => ({ ...prev, category: '' }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative w-screen max-w-lg h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between border-b border-border-light px-6 py-5">
          <h2 className="text-xl font-bold">{initialData ? 'Edit Part' : 'Add New Part'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Part Name *</label>
            <input
              type="text"
              className="w-full rounded-lg border-border-light p-3"
              placeholder="e.g. Oil Filter, Brake Pad"
              value={formData.name}
              onChange={e => handleChange('name', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Category *</label>
              <select
                className="w-full rounded-lg border-border-light p-3"
                value={isCustomCategory ? 'other' : formData.category}
                onChange={e => {
                  if (e.target.value === 'other') {
                    setIsCustomCategory(true);
                    setFormData(prev => ({ ...prev, category: '' }));
                  } else {
                    setIsCustomCategory(false);
                    handleChange('category', e.target.value);
                  }
                }}
              >
                <option value="">Select category...</option>
                <option>Engine</option>
                <option>Brake</option>
                <option>Electrical</option>
                <option>Suspension</option>
                <option>Body</option>
                <option value="other">Other</option>
              </select>
              {isCustomCategory && (
                <input
                  type="text"
                  className="w-full rounded-lg border-border-light p-3 mt-2"
                  placeholder="Type category name..."
                  value={formData.category}
                  onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))}
                />
              )}
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Brand</label>
              <input
                type="text"
                className="w-full rounded-lg border-border-light p-3"
                placeholder="e.g. Bosch"
                value={formData.brand}
                onChange={e => handleChange('brand', e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Stock Quantity *</label>
            <input
              type="number"
              className="w-full rounded-lg border-border-light p-3"
              placeholder="0"
              value={formData.stockQty}
              onChange={e => handleChange('stockQty', Number(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Cost Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  className="w-full rounded-lg border-border-light pl-8 p-3"
                  placeholder="0.00"
                  value={formData.costPrice}
                  onChange={e => handleChange('costPrice', Number(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium">Selling Price *</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">₹</span>
                <input
                  type="number"
                  className="w-full rounded-lg border-border-light pl-8 p-3"
                  placeholder="0.00"
                  value={formData.sellingPrice}
                  onChange={e => handleChange('sellingPrice', Number(e.target.value))}
                />
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="block text-sm font-medium">Notes</label>
            <textarea
              className="w-full rounded-lg border-border-light p-3 resize-none"
              rows={4}
              placeholder="Specific details..."
              value={formData.notes}
              onChange={e => handleChange('notes', e.target.value)}
            ></textarea>
          </div>
        </div>
        <div className="border-t border-border-light p-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2.5 text-sm font-semibold hover:bg-gray-50 border border-border-light rounded-lg">Cancel</button>
          <button onClick={handleSubmit} className="px-5 py-2.5 text-sm font-semibold bg-primary text-white rounded-lg shadow-sm hover:bg-primary-dark">Save Part</button>
        </div>
      </div>
    </div>
  );
};

export default Inventory;
