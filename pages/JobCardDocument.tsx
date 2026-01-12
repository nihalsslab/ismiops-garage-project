
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
        const res = await api.getJobs();
        if (res.status === 'success') {
            const found = res.data.find((j: any) => j.id === id);
            if (found) {
                setJob(found);
            } else {
                alert('Job not found!');
                navigate('/jobs');
            }
        }
        setLoading(false);
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
                    <div>
                        <div className="flex items-center gap-3">
                            <img src={logo} alt="Logo" className="h-16 w-16 object-cover rounded-full border border-gray-900" />
                            <div>
                                <h1 className="text-4xl font-black uppercase tracking-tighter text-gray-900">Job Card</h1>
                                <p className="text-gray-500 font-mono mt-1">#{job.id}</p>
                            </div>
                        </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                        <h2 className="text-[#F4B400] text-xl font-black leading-none uppercase tracking-wide">PHOENIX</h2>
                        <h3 className="text-black text-xs font-bold leading-tight uppercase tracking-wider mb-1">MULTY BRAND GARAGE</h3>
                        <p className="text-sm text-gray-600">123 Garage Lane, Phoenix, AZ</p>
                        <p className="text-sm text-gray-600">Date: <span className="font-bold">{job.date}</span></p>
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
                        <p className="text-lg font-mono uppercase bg-gray-100 inline-block px-2 rounded mt-1">{job.numberPlate}</p>
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
                            {[1, 2, 3].map((_, i) => (
                                <tr key={`empty-${i}`} className="border-b border-gray-900 h-12">
                                    <td className="border-r border-gray-900"></td>
                                    <td className="border-r border-gray-900"></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {job.notes && (
                        <div className="mt-4 p-4 border border-gray-900 rounded">
                            <p className="text-sm font-bold uppercase mb-1">Customer Notes:</p>
                            <p className="font-medium">{job.notes}</p>
                        </div>
                    )}
                </div>

                {/* Vehicle Images */}
                {job.vehicleImages && job.vehicleImages.length > 0 && (
                    <div className="mb-8">
                        <h3 className="text-lg font-bold uppercase border-b border-gray-900 pb-2 mb-4">Vehicle Inspection Images</h3>
                        <div className="grid grid-cols-4 gap-4">
                            {job.vehicleImages.map((img, i) => (
                                <div key={i} className="aspect-square border border-gray-200 rounded overflow-hidden">
                                    <img src={img} alt="Vehicle" className="w-full h-full object-cover grayscale contrast-125" />
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Mechanic Section (Empty for writing) */}
                <div className="mt-12 pt-4 border-t-2 border-dashed border-gray-300">
                    <h3 className="text-sm font-bold uppercase text-gray-400 mb-4">Mechanic Notes / Work Done</h3>
                    <div className="h-40 border border-gray-200 rounded bg-gray-50/50"></div>
                </div>

            </div>
        </div>
    );
};

export default JobCardDocument;
