
import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobCard } from '../types';
import logo from '../assets/logo.webp';

const JobCardDocument: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [job, setJob] = React.useState<JobCard | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        fetchJobDetails();
    }, [id]);

    React.useEffect(() => {
        if (!loading && job && new URLSearchParams(window.location.search).get('autoprint') === 'true') {
            setTimeout(() => window.print(), 500); // Small delay *after* render
        }
    }, [loading, job]);

    const fetchJobDetails = async () => {
        try {
            const res = await api.getJobs();
            if (res.status === 'success') {
                const found = res.data.find((j: any) => j.id === id);
                if (found) {
                    // Robust parsing for potentially stringified arrays
                    ['lineItems', 'complaints', 'vehicleImages'].forEach(field => {
                        if (typeof found[field] === 'string') {
                            try {
                                found[field] = JSON.parse(found[field]);
                            } catch (e) {
                                found[field] = [];
                            }
                        }
                        if (!Array.isArray(found[field])) {
                            found[field] = [];
                        }
                    });

                    // Ensure defaults
                    if (!found.vehicleImages) found.vehicleImages = [];
                    if (!found.complaints) found.complaints = [];
                    // lineItems might be undefined, that's fine as long as it's not a string

                    setJob(found);
                } else {
                    alert('Job not found!');
                    navigate('/jobs');
                }
            }
        } catch (error) {
            console.error("Error fetching job card:", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePrint = () => window.print();

    if (loading) return <div className="p-8 flex items-center justify-center">Loading Job Card...</div>;

    if (!job) return (
        <div className="p-8 flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Job Not Found</h1>
            <p className="text-gray-600 mb-6">Could not find job with ID: {id}</p>
            <button onClick={() => navigate('/jobs')} className="px-4 py-2 bg-gray-900 text-white rounded">Go Back to Jobs</button>
        </div>
    );

    return (
        <div className="p-8 flex flex-col gap-6 max-w-5xl mx-auto bg-white min-h-screen">
            {/* Header Actions */}
            <div className="no-print flex justify-between items-center mb-6">
                <button onClick={() => navigate('/jobs')} className="text-gray-600 hover:text-gray-900 flex items-center gap-2">
                    <span className="material-symbols-outlined">arrow_back</span> Back
                </button>
                <div className="flex gap-3">
                    <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg font-bold">
                        <span className="material-symbols-outlined">print</span> Print Job Card
                    </button>
                </div>
            </div>

            {/* Document Content */}
            <div className="border border-gray-900 p-8 print:border-2 print:p-0 print:border-none">
                {/* Title Header */}
                <div className="flex justify-between items-start border-b-2 border-gray-900 pb-6 mb-8">
                    {/* Left: Title & ID */}
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 bg-gray-900 rounded-full flex items-center justify-center text-white">
                            <span className="material-symbols-outlined text-3xl">directions_car</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900 leading-none">Job Card</h1>
                            <p className="text-gray-500 font-mono text-lg font-bold">#{job.id}</p>
                        </div>
                    </div>

                    {/* Right: Logo & Address */}
                    <div className="text-right flex flex-col items-end">
                        <div className="flex items-center justify-end gap-2 mb-2">
                            {/* Small Logo next to Brand Name if desired, or just Brand Name */}
                            <img src={logo} alt="Logo" className="h-8 w-8 object-cover rounded-full" />
                            <div>
                                <h2 className="text-[#F4B400] text-xl font-black leading-none uppercase tracking-wide">ISMIOPS</h2>
                                <h3 className="text-black text-[10px] font-bold leading-tight uppercase tracking-wider">MULTI BRAND GARAGE</h3>
                            </div>
                        </div>
                        <p className="text-xs text-gray-600 font-bold">Perinthalmanna, Malappuram</p>
                        <p className="text-xs text-gray-600 font-bold">Kerala - 679322 | ph: 9847805330</p>
                        <p className="text-xs text-gray-600 mt-1">Date: <span className="font-bold">{job.date}</span></p>
                    </div>
                </div>

                {/* Customer & Vehicle Grid */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="border border-gray-300 p-4">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Customer Details</h3>
                        <p className="text-xl font-bold">{job.customerName}</p>
                        <p className="text-lg font-mono">{job.phone}</p>
                    </div>
                    <div className="border border-gray-300 p-4">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Vehicle Details</h3>
                        <p className="text-xl font-bold">{job.brand} {job.model}</p>
                        <div className="flex items-center gap-4 mt-1">
                            {job.numberPlate && (
                                <p className="text-lg font-mono uppercase bg-gray-100 inline-block px-2 rounded border border-gray-200">{job.numberPlate}</p>
                            )}
                            {job.km && (
                                <p className="text-sm font-bold text-gray-600">KM: <span className="font-mono text-gray-900">{job.km}</span></p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Fuel & Intake Info */}
                <div className="grid grid-cols-2 gap-8 mb-8">
                    <div className="border border-gray-300 p-4">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Fuel Level</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-4 bg-gray-200 rounded-full overflow-hidden border border-gray-300 relative">
                                <div className="h-full bg-gray-800" style={{ width: `${job.fuelLevel || 50}%` }}></div>
                                {/* Markers */}
                                <div className="absolute top-0 left-1/4 h-full w-0.5 bg-white/50"></div>
                                <div className="absolute top-0 left-1/2 h-full w-0.5 bg-white/50"></div>
                                <div className="absolute top-0 left-3/4 h-full w-0.5 bg-white/50"></div>
                            </div>
                            <span className="font-bold font-mono">{job.fuelLevel || 50}%</span>
                        </div>
                        <p className="text-sm mt-2 text-gray-600">Type: <span className="font-bold">{job.fuelType || 'N/A'}</span></p>
                    </div>
                    <div className="border border-gray-300 p-4">
                        <h3 className="text-xs font-bold uppercase text-gray-400 mb-2">Service Advisor</h3>
                        <div className="h-12 border-b border-gray-300 flex items-end pb-1">
                            <span className="text-gray-400 text-sm">Signature</span>
                        </div>
                    </div>
                </div>

                {/* Complaints / Requested Work Table */}
                <div className="mb-8">
                    <table className="w-full border-collapse border border-gray-900">
                        <thead>
                            <tr className="bg-gray-100 border-b border-gray-900">
                                <th className="py-2 px-4 border-r border-gray-900 text-center w-16 text-sm font-bold uppercase">Sr.</th>
                                <th className="py-2 px-4 border-r border-gray-900 text-left text-sm font-bold uppercase">Description / Work Requested</th>
                                <th className="py-2 px-4 text-left w-48 text-sm font-bold uppercase">Technician Remarks</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* Fallback for basic complaints */}
                            {(!job.lineItems || job.lineItems.length === 0) && job.complaints && job.complaints.map((c: string, i: number) => (
                                <tr key={i} className="border-b border-gray-900">
                                    <td className="py-3 px-4 border-r border-gray-900 text-center font-mono">{i + 1}</td>
                                    <td className="py-3 px-4 border-r border-gray-900 font-bold text-lg">{c}</td>
                                    <td className="py-3 px-4"></td>
                                </tr>
                            ))}

                            {/* Render Line Items if present (Name Only) */}
                            {job.lineItems && job.lineItems.map((item: any, i: number) => (
                                <tr key={i} className="border-b border-gray-900">
                                    <td className="py-3 px-4 border-r border-gray-900 text-center font-mono">{i + 1}</td>
                                    <td className="py-3 px-4 border-r border-gray-900 font-bold text-lg">{item.description}</td>
                                    <td className="py-3 px-4"></td>
                                </tr>
                            ))}

                            {/* Empty rows if no data */}
                            {(!job.lineItems && !job.complaints) && (
                                <tr><td colSpan={3} className="p-4 text-center text-gray-500 italic">No complaints or items specified.</td></tr>
                            )}

                            {/* Empty rows for manual entry */}

                        </tbody>
                    </table>

                    {job.notes && (
                        <div className="mt-4 p-4 border border-gray-900 rounded">
                            <p className="text-sm font-bold uppercase mb-1">Customer Notes:</p>
                            <p className="font-medium">{job.notes}</p>
                        </div>
                    )}
                </div>



                {/* Mechanic Section (Empty for writing) */}
                {/* Mechanic Section (Writing Lines) */}
                <div className="mt-8">
                    <h3 className="text-xs font-bold uppercase text-gray-400 mb-2 border-b border-gray-100 pb-2">Mechanic Notes / Work Done</h3>
                    <div className="border border-gray-200 rounded-lg p-6 bg-white">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="border-b border-gray-100 h-10"></div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between items-end mt-8 pt-4 border-t border-gray-900">
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Printed On: {new Date().toLocaleDateString()}</p>
                    <p className="text-[10px] text-gray-400 font-bold uppercase">Ismiops Multi-Brand Garage © {new Date().getFullYear()}</p>
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
                    }
                    /* Reset container heights/overflows to prevent scrollbars */
                    html, body, #root, main, div {
                        overflow: visible !important;
                        height: auto !important;
                    }
                    /* Ensure the document wrapper handles the margins */
                    .print\\:p-0 {
                        padding: 40px !important; /* Internal padding for the paper */
                    }
                    .print\\:border-none {
                        border: none !important;
                    }
                    /* Hide any scrollbar artifacts */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                }
            `}</style>
        </div>
    );
};

export default JobCardDocument;
