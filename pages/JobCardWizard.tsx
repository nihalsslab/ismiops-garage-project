
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { JobStatus, PaymentStatus } from '../types';
import { VEHICLE_BRANDS } from '../mockData';

const JobCardWizard: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    brand: '',
    model: '',
    numberPlate: '',
    fuelType: '',
    fuelLevel: 50,
    vehicleImages: [] as string[],
    complaints: [] as string[],
    notes: ''
  });

  const [saving, setSaving] = useState(false);

  const [isCustomBrand, setIsCustomBrand] = useState(false);
  const [isCustomModel, setIsCustomModel] = useState(false);

  const nextStep = () => {
    if (step === 1) {
      if (!formData.customerName.trim()) return alert('Please enter Customer Name');
      if (!formData.phone.trim()) return alert('Please enter Phone Number');
    }
    if (step === 2) {
      if (!formData.brand.trim()) return alert('Please select or enter a Brand');
      if (!formData.model.trim()) return alert('Please select or enter a Model');
      if (!formData.numberPlate.trim()) return alert('Please enter Number Plate');
      // Fuel Type is now optional but recommended
    }
    if (step === 3) {
      if (formData.complaints.length === 0 && !formData.notes.trim()) {
        return alert('Please select at least one complaint or add a note');
      }
    }
    setStep(s => Math.min(s + 1, 4));
  };
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleCreateJob = async (shouldPrint = false) => {
    setSaving(true);
    const jobData = {
      ...formData,
      vehicle: `${formData.brand} ${formData.model}`.trim(),
      id: 'JC-' + Math.floor(Math.random() * 10000),
      date: new Date().toLocaleDateString(),
      status: 'Open',
      paymentStatus: 'Unpaid',
      totalAmount: 0 // Default
    };

    const res = await api.addJob(jobData);
    if (res.status === 'success') {
      if (shouldPrint) {
        navigate(`/job-card/${jobData.id}?autoprint=true`);
      } else {
        navigate('/jobs');
      }
    } else {
      alert('Failed to create job: ' + res.message);
    }
    setSaving(false);
  };

  const commonComplaints = [
    { icon: 'handyman', label: 'General Service' },
    { icon: 'hearing', label: 'Engine Noise' },
    { icon: 'warning', label: 'Brake Issue' },
    { icon: 'ac_unit', label: 'AC Cooling' },
    { icon: 'vibration', label: 'Suspension Noise' },
    { icon: 'electrical_services', label: 'Electrical Fault' },
    { icon: 'oil_barrel', label: 'Oil Leak' },
    { icon: 'battery_alert', label: 'Battery Dead' }
  ];

  const toggleComplaint = (label: string) => {
    setFormData(prev => ({
      ...prev,
      complaints: prev.complaints.includes(label)
        ? prev.complaints.filter(c => c !== label)
        : [...prev.complaints, label]
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files: File[] = Array.from(e.target.files);
      setSaving(true); // Reusing saving state for upload indicator

      const newImages: string[] = [];

      for (const file of files) {
        const res: any = await api.uploadImage(file);
        if (res.status === 'success' && res.url) {
          newImages.push(res.url);
        }
      }
      setFormData(prev => ({ ...prev, vehicleImages: [...prev.vehicleImages, ...newImages] }));
      setSaving(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      vehicleImages: prev.vehicleImages.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="flex-1 flex flex-col items-center py-8 px-4">
      {/* Header */}
      <div className="w-full max-w-[800px] mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">New Job Card</h1>
        <button onClick={() => navigate('/jobs')} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-[600px] mb-12 relative">
        <div className="absolute top-[18px] left-0 w-full h-1 bg-gray-200 -z-10 rounded-full"></div>
        <div className="absolute top-[18px] left-0 h-1 bg-primary -z-10 rounded-full transition-all duration-500" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className={`size-9 rounded-full flex items-center justify-center text-sm font-bold shadow-sm transition-all ${step >= s ? 'bg-primary text-white' : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                {s}
              </div>
              <span className={`text-xs font-medium uppercase tracking-wider ${step >= s ? 'text-primary' : 'text-gray-400'}`}>
                {s === 1 ? 'Customer' : s === 2 ? 'Vehicle' : s === 3 ? 'Complaints' : 'Review'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="w-full max-w-[600px] bg-white rounded-xl shadow-lg border border-border-light p-8">
        {step === 1 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Customer Information</h2>
            <div className="space-y-4">
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 uppercase mb-2">Customer Name</span>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-200 h-14 text-lg p-4 focus:ring-primary focus:border-primary"
                  placeholder="e.g. John Doe"
                  value={formData.customerName}
                  onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                />
              </label>
              <label className="block">
                <span className="block text-sm font-semibold text-gray-700 uppercase mb-2">Phone Number</span>
                <input
                  type="tel"
                  className="w-full rounded-lg border-gray-200 h-14 text-lg p-4 focus:ring-primary focus:border-primary"
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Vehicle Details</h2>

            {/* Number Plate Input */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 uppercase mb-2">Number Plate</label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-200 h-14 text-lg p-4 font-mono uppercase focus:ring-primary focus:border-primary placeholder:normal-case"
                placeholder="e.g. KL 01 AB 1234"
                value={formData.numberPlate}
                onChange={(e) => setFormData({ ...formData, numberPlate: e.target.value.toUpperCase() })}
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {VEHICLE_BRANDS.map(brand => (
                <button
                  key={brand.name}
                  onClick={() => {
                    setFormData({ ...formData, brand: brand.name, model: '' });
                    setIsCustomBrand(false);
                    setIsCustomModel(false);
                  }}
                  className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${!isCustomBrand && formData.brand === brand.name ? 'border-primary bg-primary/5' : 'border-gray-100 hover:border-primary/50'
                    }`}
                >
                  <img src={brand.logo} alt={brand.name} className="size-12 object-contain" />
                  <span className="text-sm font-semibold">{brand.name}</span>
                </button>
              ))}
              <button
                onClick={() => {
                  setFormData({ ...formData, brand: '', model: '' });
                  setIsCustomBrand(true);
                  setIsCustomModel(false);
                }}
                className={`p-4 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2 ${isCustomBrand ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
              >
                <span className="material-symbols-outlined text-2xl text-gray-400">add</span>
                <span className="text-sm font-medium text-gray-500">Other</span>
              </button>
            </div>

            {isCustomBrand && (
              <div className="mt-4">
                <label className="block text-sm font-semibold text-gray-700 uppercase mb-2">Enter Brand Name</label>
                <input
                  type="text"
                  className="w-full rounded-lg border-gray-200 h-12 px-4 focus:ring-primary focus:border-primary"
                  placeholder="e.g. Volkswagen"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                />
              </div>
            )}

            {(formData.brand || isCustomBrand) && (
              <div className="mt-6 flex flex-col gap-4">
                <h3 className="text-lg font-bold">Select Model</h3>
                {/* Only show predefined models if it's a known brand */}
                {!isCustomBrand && VEHICLE_BRANDS.find(b => b.name === formData.brand) && (
                  <div className="grid grid-cols-3 gap-3">
                    {VEHICLE_BRANDS.find(b => b.name === formData.brand)?.models.map(model => (
                      <button
                        key={model.name}
                        onClick={() => {
                          setFormData({ ...formData, model: model.name });
                          setIsCustomModel(false);
                        }}
                        className={`p-3 rounded-lg border-2 transition-all text-center font-bold text-sm ${!isCustomModel && formData.model === model.name ? 'border-primary bg-primary/5 text-primary' : 'border-gray-100 hover:border-primary/50 text-gray-700'
                          }`}
                      >
                        {model.name}
                      </button>
                    ))}
                    <button
                      onClick={() => {
                        setFormData({ ...formData, model: '' });
                        setIsCustomModel(true);
                      }}
                      className={`p-3 rounded-lg border-2 border-dashed transition-all flex items-center justify-center gap-2 ${isCustomModel ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary'}`}
                    >
                      <span className="text-sm font-medium text-gray-500">Other</span>
                    </button>
                  </div>
                )}

                {/* Show custom model input if isCustomModel is true OR if it's a custom brand (force custom model input) */}
                {(isCustomModel || isCustomBrand) && (
                  <div className="mt-2">
                    <label className="block text-sm font-semibold text-gray-700 uppercase mb-2">Enter Model Name</label>
                    <input
                      type="text"
                      className="w-full rounded-lg border-gray-200 h-12 px-4 focus:ring-primary focus:border-primary"
                      placeholder="e.g. Polo GT"
                      value={formData.model}
                      onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Fuel Details - Show if model is selected OR if explicitly in custom mode */}
            {(formData.model || isCustomModel || isCustomBrand) && (
              <div className="mt-6 flex flex-col gap-6 border-t border-gray-100 pt-6">

                {/* Fuel Type */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold">Fuel Type</h3>
                  <div className="flex gap-3">
                    {['Petrol', 'Diesel', 'Other'].map(type => (
                      <button
                        key={type}
                        onClick={() => setFormData({ ...formData, fuelType: type })}
                        className={`flex-1 py-3 rounded-lg border-2 font-bold transition-all ${formData.fuelType === type
                          ? 'border-primary bg-primary/10 text-primary'
                          : 'border-gray-100 text-gray-600 hover:border-sidebar-text'
                          }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel Level Slider */}
                <div className="space-y-3">
                  <div className="flex justify-between items-end">
                    <h3 className="text-lg font-bold">Fuel Level</h3>
                    <span className="text-primary font-bold">{formData.fuelLevel}%</span>
                  </div>
                  <div className="relative h-12 flex items-center px-2 bg-gray-50 rounded-lg border border-gray-100">
                    <span className="material-symbols-outlined text-gray-400 mr-3">local_gas_station</span>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="5"
                      value={formData.fuelLevel}
                      onChange={(e) => setFormData({ ...formData, fuelLevel: Number(e.target.value) })}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-primary"
                    />
                  </div>
                  <div className="flex justify-between text-xs font-bold text-gray-400 px-1">
                    <span>E</span>
                    <span>1/4</span>
                    <span>1/2</span>
                    <span>3/4</span>
                    <span>F</span>
                  </div>
                </div>

              </div>
            )}

            {/* Vehicle Images - Always Show if model selected or custom */}
            {(formData.model || isCustomModel || isCustomBrand) && (
              <div className="mt-6 border-t border-gray-100 pt-6">
                <h3 className="text-lg font-bold mb-3">Vehicle Images</h3>

                <div className="grid grid-cols-3 gap-3 mb-3">
                  {formData.vehicleImages.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                      <img src={img} alt="Vehicle" className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    </div>
                  ))}
                  <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors">
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
            )}
          </div>
        )}

        {step === 3 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Customer Complaints</h2>
            <div className="grid grid-cols-2 gap-3">
              {commonComplaints.map(item => (
                <button
                  key={item.label}
                  onClick={() => toggleComplaint(item.label)}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all ${formData.complaints.includes(item.label)
                    ? 'bg-primary text-white border-primary shadow-md'
                    : 'bg-white text-gray-700 border-gray-100 hover:border-primary/50'
                    }`}
                >
                  <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-2">
              <label className="text-lg font-bold flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">edit_note</span>
                Additional Notes
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-lg border-gray-200 p-4 focus:ring-primary focus:border-primary resize-none"
                placeholder="Describe any other requests..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="flex flex-col gap-6">
            <h2 className="text-2xl font-bold">Review Details</h2>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Customer Details</p>
                <p className="font-bold text-lg">{formData.customerName}</p>
                <p className="text-sm text-gray-600">{formData.phone}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Vehicle Details</p>
                <p className="font-bold text-lg">{formData.brand} {formData.model}</p>
                <p className="text-sm font-mono text-gray-600 uppercase mt-1">{formData.numberPlate}</p>
                {formData.vehicleImages.length > 0 && (
                  <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
                    {formData.vehicleImages.map((img, i) => (
                      <img key={i} src={img} alt="Vehicle" className="size-16 rounded-md object-cover border border-gray-200" />
                    ))}
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-xs font-bold text-gray-400 uppercase mb-2">Complaints</p>
                <div className="flex flex-wrap gap-2">
                  {formData.complaints.map(c => (
                    <span key={c} className="px-3 py-1 bg-primary/10 text-primary text-xs font-bold rounded-full">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Wizard Actions */}
        <div className="flex items-center justify-between mt-10 pt-6 border-t border-border-light">
          <button
            onClick={step === 1 ? () => navigate('/jobs') : prevStep}
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
            {step === 1 ? 'Cancel' : 'Back'}
          </button>

          <div className="flex gap-3">
            {step === 4 && (
              <button
                onClick={() => handleCreateJob(true)}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-900 hover:bg-black text-white font-bold shadow-lg transition-all active:scale-95 disabled:opacity-50"
              >
                <span className="material-symbols-outlined">print</span>
                <span>Create & Print</span>
              </button>
            )}
            <button
              onClick={step === 4 ? () => handleCreateJob(false) : nextStep}
              disabled={saving}
              className="flex items-center gap-2 px-8 py-3 rounded-lg bg-primary hover:bg-primary-dark text-white font-bold shadow-lg shadow-primary/30 transition-all active:scale-95 disabled:opacity-50"
            >
              {step === 4 ? (saving ? 'Creating...' : 'Create Job Card') : 'Next Step'}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCardWizard;
