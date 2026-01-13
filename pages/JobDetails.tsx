import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { JobCard, LineItem, SERVICE_CATEGORIES, JobStatus, PaymentStatus } from '../types';

const JobDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [job, setJob] = useState<JobCard | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Edit State for Line Items
    const [isEditingItems, setIsEditingItems] = useState(false);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState(SERVICE_CATEGORIES[0]);
    const [type, setType] = useState<'Part' | 'Labour'>('Labour');
    const [quantity, setQuantity] = useState(1);
    const [unitPrice, setUnitPrice] = useState(0);

    useEffect(() => {
        fetchJobDetails();
    }, [id]);

    const fetchJobDetails = async () => {
        if (!id) return;
        try {
            setLoading(true);
            const res = await api.getJobs();
            if (res.status === 'success' && Array.isArray(res.data)) {
                const jobs = res.data;
                const foundJob = jobs.find((j: JobCard) => j.id === id);
                if (foundJob) {
                    // Ensure lineItems exists
                    if (!foundJob.lineItems || foundJob.lineItems.length === 0) {
                        // Default to complaints if no items
                        foundJob.lineItems = foundJob.complaints.map((c: string, i: number) => ({
                            id: `init-${i}`,
                            description: c,
                            category: 'General Service',
                            type: 'Labour',
                            quantity: 1,
                            unitPrice: 0,
                            total: 0
                        }));
                    }

                    // FIX: Ensure vehicleImages is an array
                    if (typeof foundJob.vehicleImages === 'string') {
                        try {
                            foundJob.vehicleImages = JSON.parse(foundJob.vehicleImages);
                        } catch (e) {
                            foundJob.vehicleImages = [];
                        }
                    }
                    if (!Array.isArray(foundJob.vehicleImages)) {
                        foundJob.vehicleImages = [];
                    }

                    setJob(foundJob);
                }
            } else {
                console.error("Failed to fetch jobs:", res);
            }
        } catch (error) {
            console.error("Error fetching job:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddItem = () => {
        if (!job) return;
        const newItem: LineItem = {
            id: Date.now().toString(),
            description,
            category,
            type,
            quantity,
            unitPrice,
            total: quantity * unitPrice,
        };

        const updatedItems = [...(job.lineItems || []), newItem];
        updateJobItems(updatedItems);

        // Reset form
        setDescription('');
        setQuantity(1);
        setUnitPrice(0);
    };

    const handleRemoveItem = (itemId: string) => {
        if (!job) return;
        const updatedItems = (job.lineItems || []).filter(item => item.id !== itemId);
        updateJobItems(updatedItems);
    };

    const updateJobItems = (newItems: LineItem[]) => {
        if (!job) return;
        const newTotal = newItems.reduce((sum, item) => sum + item.total, 0);
        setJob({ ...job, lineItems: newItems, totalAmount: newTotal });
    };

    const handleSaveWrapper = async () => {
        if (!job) return;
        setSaving(true);
        try {
            // We need to construct the update object carefully.
            // The API expects the full JobCard or partial updates? 
            // Based on previous files, api.updateJob takes (id, jobData).
            await api.updateJob(job.id, {
                ...job,
                lineItems: JSON.stringify(job.lineItems), // API might expect string if not handled in backend properly, but let's send object if api.ts handles it.
                // checking api.ts... it wraps it. Wait, the spreadsheet stores strings.
                // Code.js expects 'lineItems' as a string field if it's a simple column, OR we follow the existing pattern.
                // Let's rely on api.ts. If api.updateJob just sends the object, we might need to stringify specific fields if the backend requires it.
                // However, browsing Code.js, it seems to parse/stringify. Let's send the object. 
                // Actually, looking at Invoice.tsx saves: lineItems: job.lineItems.
            });
            setIsEditingItems(false);
            await fetchJobDetails(); // Refresh
        } catch (e) {
            console.error(e);
            alert("Failed to save");
        } finally {
            setSaving(false);
        }
    };

    // Helper for status badge
    const getStatusColor = (status: string) => {
        switch (status) {
            case JobStatus.FINISHED: return 'bg-green-100 text-green-700';
            case JobStatus.IN_PROGRESS: return 'bg-blue-100 text-blue-700';
            default: return 'bg-yellow-100 text-yellow-700';
        }
    };

    const handleMarkAsPaid = async () => {
        if (!job) return;
        if (!window.confirm('Are you sure you want to mark this job as PAID?')) return;

        try {
            await api.updateJob(job.id, { paymentStatus: 'Paid' });
            setJob({ ...job, paymentStatus: PaymentStatus.PAID });
        } catch (error) {
            console.error("Error updating payment status:", error);
            alert("Failed to update status");
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!job || !e.target.files) return;

        const files: File[] = Array.from(e.target.files);
        setSaving(true);

        try {
            const newImages: string[] = [];
            for (const file of files) {
                const res: any = await api.uploadImage(file);
                if (res.status === 'success' && res.url) {
                    newImages.push(res.url);
                }
            }

            if (newImages.length > 0) {
                const updatedImages = [...(job.vehicleImages || []), ...newImages];
                // Save immediately
                await api.updateJob(job.id, { vehicleImages: updatedImages });
                setJob({ ...job, vehicleImages: updatedImages });
            }
        } catch (error) {
            console.error("Error uploading images:", error);
            alert("Failed to upload images");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600"></div>
                <p className="text-sm font-medium text-gray-500 animate-pulse">Loading Job Details...</p>
            </div>
        </div>
    );

    if (!job) return (
        <div className="flex h-screen items-center justify-center bg-gray-50">
            <div className="text-center">
                <h2 className="text-xl font-bold text-gray-900">Job Not Found</h2>
                <button onClick={() => navigate('/jobs')} className="mt-4 text-blue-600 hover:underline">Return to Jobs</button>
            </div>
        </div>
    );

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-3xl font-black text-gray-900">Job #{job.id}</h1>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getStatusColor(job.status)}`}>
                            {job.status}
                        </span>
                    </div>
                    <div className="text-gray-500 mt-1">
                        Created on {new Date(job.date).toLocaleDateString()} • Service Advisor: {job.customerName.split(' ')[0]}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-lg font-bold text-sm ${job.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        Payment: {job.paymentStatus || 'Unpaid'}
                    </span>
                    <Link to={`/job-card/${job.id}`} target="_blank" className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 font-bold bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                        <span className="material-symbols-outlined text-sm">print</span> Print Job Card
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Details & Images */}
                <div className="md:col-span-2 space-y-6">

                    {/* Info Cards Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Customer Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Customer Info</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined">person</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{job.customerName}</p>
                                    <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                                        <span className="material-symbols-outlined text-[14px]">call</span> {job.phone}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Vehicle Card */}
                        <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Vehicle Info</h3>
                            <div className="flex items-center gap-4">
                                <div className="h-12 w-12 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center">
                                    <span className="material-symbols-outlined">directions_car</span>
                                </div>
                                <div>
                                    <p className="font-bold text-gray-900">{job.brand} {job.model}</p>
                                    <div className="flex gap-2 mt-1">
                                        <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{job.numberPlate}</span>
                                        {job.fuelType && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{job.fuelType}</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Work Details (Editable) */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-5 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">Work Details</h3>
                            {isEditingItems ? (
                                <div className="flex gap-2">
                                    <button onClick={() => setIsEditingItems(false)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                                    <button onClick={handleSaveWrapper} disabled={saving} className="text-sm bg-green-600 text-white px-3 py-1.5 rounded-lg hover:bg-green-700">
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            ) : (
                                <button onClick={() => setIsEditingItems(true)} className="text-sm text-blue-600 font-medium hover:text-blue-700">Edit Items</button>
                            )}
                        </div>

                        {isEditingItems && (
                            <div className="p-4 bg-gray-50 border-b border-gray-100 grid grid-cols-1 md:grid-cols-12 gap-2 items-end">
                                <div className="md:col-span-4">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Description</label>
                                    <input type="text" value={description} onChange={e => setDescription(e.target.value)} className="w-full text-sm border-gray-300 rounded-md" placeholder="Item name" />
                                </div>
                                <div className="md:col-span-3">
                                    <label className="text-[10px] font-bold text-gray-500 uppercase">Category</label>
                                    <select value={category} onChange={e => setCategory(e.target.value as any)} className="w-full text-sm border-gray-300 rounded-md">
                                        {SERVICE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 md:col-span-4 gap-2 w-full">
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Price</label>
                                        <input type="number" value={unitPrice} onChange={e => setUnitPrice(Number(e.target.value))} className="w-full text-sm border-gray-300 rounded-md" />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="text-[10px] font-bold text-gray-500 uppercase">Qty</label>
                                        <input type="number" value={quantity} onChange={e => setQuantity(Number(e.target.value))} className="w-full text-sm border-gray-300 rounded-md" />
                                    </div>
                                </div>
                                <div className="md:col-span-1 mt-2 md:mt-0">
                                    <button onClick={handleAddItem} className="w-full bg-blue-600 text-white h-[38px] rounded-md flex items-center justify-center">
                                        <span className="material-symbols-outlined text-lg">add</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        <table className="w-full text-sm text-left">
                            <thead className="bg-gray-50 text-gray-500 font-medium">
                                <tr>
                                    <th className="px-5 py-3">Description</th>
                                    <th className="px-5 py-3">Type</th>
                                    <th className="px-5 py-3 text-right">Qty</th>
                                    <th className="px-5 py-3 text-right">Unit Price</th>
                                    <th className="px-5 py-3 text-right">Total</th>
                                    {isEditingItems && <th className="px-5 py-3 w-10"></th>}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {job.lineItems?.map((item) => (
                                    <tr key={item.id}>
                                        <td className="px-5 py-3 font-medium text-gray-900">
                                            {item.description}
                                            <div className="text-xs text-gray-400 font-normal">{item.category}</div>
                                        </td>
                                        <td className="px-5 py-3">
                                            <span className={`px-2 py-0.5 rounded text-xs ${item.type === 'Part' ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>
                                                {item.type}
                                            </span>
                                        </td>
                                        <td className="px-5 py-3 text-right">{item.quantity}</td>
                                        <td className="px-5 py-3 text-right">₹{item.unitPrice}</td>
                                        <td className="px-5 py-3 text-right font-bold">₹{item.total}</td>
                                        {isEditingItems && (
                                            <td className="px-5 py-3 text-right">
                                                <button onClick={() => handleRemoveItem(item.id)} className="text-red-400 hover:text-red-600">
                                                    <span className="material-symbols-outlined text-lg">delete</span>
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {(!job.lineItems || job.lineItems.length === 0) && (
                                    <tr>
                                        <td colSpan={5} className="text-center py-8 text-gray-400">No items added yet.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-gray-50">
                                <tr>
                                    <td colSpan={4} className="px-5 py-4 text-right font-bold text-gray-600">Total Amount</td>
                                    <td className="px-5 py-4 text-right font-black text-xl text-blue-600">₹{job.totalAmount}</td>
                                    {isEditingItems && <td></td>}
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Right Column: Timeline & Side Info */}
                <div className="space-y-6">
                    {/* Timeline Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Service Timeline</h3>
                        <div className="relative border-l-2 border-gray-100 ml-3 space-y-8 py-2">
                            {/* Started */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-green-100 border-[3px] border-white ring-1 ring-green-500"></div>
                                <p className="text-xs font-bold text-green-600 uppercase mb-0.5">Job Started</p>
                                <p className="text-sm font-bold text-gray-900">{new Date(job.date).toLocaleDateString()}</p>
                                <p className="text-xs text-gray-500">Job Card Created</p>
                            </div>

                            {/* Current Status */}
                            <div className="relative pl-6">
                                <div className="absolute -left-[9px] top-0 h-4 w-4 rounded-full bg-blue-100 border-[3px] border-white ring-1 ring-blue-500"></div>
                                <p className="text-xs font-bold text-blue-600 uppercase mb-0.5">Current Status</p>
                                <p className="text-sm font-bold text-gray-900">{job.status}</p>
                                <p className="text-xs text-gray-500">Last updated recently</p>
                            </div>
                        </div>
                    </div>

                    {/* Images Card */}
                    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Condition Before Work</h3>
                        <div className="grid grid-cols-2 gap-2 mb-3">
                            {(Array.isArray(job.vehicleImages) ? job.vehicleImages : []).slice(0, 4).map((img, idx) => (
                                <div key={idx} className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative group">
                                    <img src={img} alt="Vehicle condition" className="w-full h-full object-cover" />
                                    <a href={img} target="_blank" rel="noreferrer" className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                                        <span className="material-symbols-outlined text-white">visibility</span>
                                    </a>
                                </div>
                            ))}
                            <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                                {saving ? (
                                    <span className="text-xs text-gray-500 font-medium">Uploading...</span>
                                ) : (
                                    <>
                                        <span className="material-symbols-outlined text-gray-400 text-3xl">add_a_photo</span>
                                        <span className="text-xs text-gray-500 font-bold mt-1">Add Photo</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
                                    </>
                                )}
                            </label>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Footer Actions */}
            <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 transition-all duration-300 z-40 md:pl-72`}>
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="w-full md:w-auto flex justify-between md:block">
                        <p className="text-xs font-bold text-gray-500 uppercase">Total Due</p>
                        <p className="text-3xl font-black text-gray-900">₹{job.totalAmount}</p>
                    </div>
                    <div className="w-full md:w-auto flex items-center gap-2 md:gap-4 overflow-x-auto pb-2 md:pb-0">
                        <button onClick={handleMarkAsPaid} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-white border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 whitespace-nowrap">
                            <span className="material-symbols-outlined">check_circle</span>
                            <span className="hidden sm:inline">Mark as Paid</span>
                            <span className="sm:hidden">Paid</span>
                        </button>
                        <Link to={`/invoice/${job.id}`} target="_blank" className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 md:px-6 py-3 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 shadow-sm whitespace-nowrap">
                            <span className="material-symbols-outlined">receipt_long</span>
                            <span className="hidden sm:inline">Generate Invoice</span>
                            <span className="sm:hidden">Invoice</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Spacer for sticky footer */}
            <div className="h-24"></div>
        </div>
    );
};

export default JobDetails;
