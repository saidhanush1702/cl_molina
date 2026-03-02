import React, { useState, useEffect } from 'react';
import { RefreshCw, ChevronRight, ChevronLeft, Check, UserPlus } from 'lucide-react';
import { managementAPI, commonAPI } from '../../../api/apiService';
import BaseModal from '../../../components/ui/BaseModal'; 

// Helper to restrict past dates for Immigration Till Date
const getNextDay = (dateString) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
};

const AddEmployeeModal = ({ isOpen, onClose, onRefresh }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // Added lookups state
    const [lookups, setLookups] = useState({ 
        genders: [], 
        employeeTypes: [], 
        countries: [], 
        immigrationStatuses: [] 
    });

    const initialFormState = {
        profile: {
            first_name: '', last_name: '', birth_date: '',
            gender_id: '', marital_status: '', title: '', employee_code: '', 
            employee_type_id: '', ssn: '', joining_date: '',
            immigration_status_id: '', immigration_start_date: '', immigration_till_date: '',
            personal_email: '', phone_number: '', country_id: '', e_verification_code: ''
        },
        auth: { email: '', password: '' }
    };

    const [formData, setFormData] = useState(initialFormState);

    const stepTitles = [
        "1. Demographic & Contact",
        "2. Employment Details",
        "3. Immigration Details",
        "4. Communication & Identity",
        "Final Step: Account Setup"
    ];

    useEffect(() => {
        if (isOpen) {
            const fetchInitialData = async () => {
                try {
                    // Fetch code and lookups concurrently
                    const [codeRes, lookupsRes] = await Promise.all([
                        managementAPI.getNextEmployeeCode(),
                        commonAPI.getLookups()
                    ]);
                    
                    if (codeRes.data.nextCode) {
                        setFormData(prev => ({
                            ...prev,
                            profile: { ...prev.profile, employee_code: codeRes.data.nextCode }
                        }));
                    }
                    if (lookupsRes.data) {
                        setLookups(lookupsRes.data);
                    }
                } catch (err) {
                    console.error("Failed to fetch initial data", err);
                }
            };
            fetchInitialData();
        } else {
            setFormData(initialFormState);
            setStep(1);
        }
    }, [isOpen]);

    const updateProfile = (field, value) => {
        setFormData(prev => ({ ...prev, profile: { ...prev.profile, [field]: value } }));
    };

    const generatePassword = () => {
        const pass = Math.random().toString(36).slice(-10) + "!" + Math.floor(Math.random()*10);
        setFormData(prev => ({ ...prev, auth: { ...prev.auth, password: pass } }));
    };

    const validateStep = () => {
        const p = formData.profile;
        const a = formData.auth;
        
        if (step === 1) return p.first_name && p.last_name && p.birth_date && p.gender_id;
        if (step === 2) return p.title && p.employee_type_id && p.joining_date && p.ssn;
        // Safety check to ensure dates make sense
        if (step === 3) {
            if (p.immigration_start_date && p.immigration_till_date && p.immigration_start_date >= p.immigration_till_date) {
                alert("Till Date must be strictly after the Start Date.");
                return false;
            }
            return true;
        }
        if (step === 4) return p.personal_email && p.phone_number && p.country_id && p.e_verification_code;
        if (step === 5) return a.email && a.password;
        return true;
    };

    const handleNext = () => {
        if (!validateStep()) {
            if (step !== 3) alert("Please fill in all mandatory fields marked with an asterisk (*) before proceeding.");
            return;
        }
        setStep(step + 1);
    };

    const handleSubmit = async () => {
        if (!validateStep()) return alert("Please fill in all mandatory fields.");
        
        setLoading(true);
        try {
            await managementAPI.addEmployee(formData);
            onRefresh(); 
            onClose();
        } catch (err) { 
            alert(err.response?.data?.message || "Error creating employee"); 
        } finally { 
            setLoading(false); 
        }
    };

    const modalFooter = (
        <>
            <button 
                disabled={step === 1} 
                onClick={() => setStep(step - 1)} 
                className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-[var(--text-muted)] hover:text-[var(--text-main)] disabled:opacity-0 transition-all"
            >
                <ChevronLeft size={14}/> Back
            </button>
            
            {step < 5 ? (
                <button 
                    onClick={handleNext} 
                    className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all outline-none"
                >
                    Next <ChevronRight size={14}/>
                </button>
            ) : (
                <button 
                    onClick={handleSubmit} 
                    disabled={loading} 
                    className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-50 outline-none"
                >
                    {loading ? 'Creating...' : 'Finish & Save'} <Check size={14}/>
                </button>
            )}
        </>
    );

    return (
        <BaseModal
            isOpen={isOpen} onClose={onClose} icon={<UserPlus size={16} />}
            title="Hire New Staff"
            subtitle={<span className="text-[var(--brand-primary)] font-bold">{stepTitles[step - 1]}</span>}
            headerRight={`Step ${step} of 5`}
            footer={modalFooter}
        >
            {/* Highly Dense Form Layout using exactly gap-3 */}
            {step === 1 && (
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="First Name*" value={formData.profile.first_name} onChange={v => updateProfile('first_name', v)} />
                    <FormInput label="Last Name*" value={formData.profile.last_name} onChange={v => updateProfile('last_name', v)} />
                    <FormInput label="Birth Date*" type="date" value={formData.profile.birth_date} onChange={v => updateProfile('birth_date', v)} />
                    <FormSelect label="Gender*" isObject={true} options={lookups.genders || []} value={formData.profile.gender_id} onChange={v => updateProfile('gender_id', v)} />
                    <div className="col-span-2">
                        <FormInput label="Marital Status" value={formData.profile.marital_status} onChange={v => updateProfile('marital_status', v)} />
                    </div>
                </div>
            )}

            {step === 2 && (
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Job Title*" value={formData.profile.title} onChange={v => updateProfile('title', v)} />
                    <FormSelect label="Job Type*" isObject={true} options={lookups.employeeTypes || []} value={formData.profile.employee_type_id} onChange={v => updateProfile('employee_type_id', v)} />
                    <FormInput label="Employee Code (Auto-Generated)" value={formData.profile.employee_code} onChange={() => {}} placeholder="Fetching..." readOnly={true} />
                    <FormInput label="Joining Date*" type="date" value={formData.profile.joining_date} onChange={v => updateProfile('joining_date', v)} />
                    <div className="col-span-2">
                        <FormInput label="SSN / Tax ID*" type="password" value={formData.profile.ssn} onChange={v => updateProfile('ssn', v)} />
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="grid grid-cols-3 gap-3">
                    <FormSelect label="Immigration Status" isObject={true} options={lookups.immigrationStatuses || []} value={formData.profile.immigration_status_id} onChange={v => updateProfile('immigration_status_id', v)} />
                    <FormInput label="Start Date" type="date" value={formData.profile.immigration_start_date} onChange={v => updateProfile('immigration_start_date', v)} />
                    <FormInput label="Till Date" type="date" value={formData.profile.immigration_till_date} min={getNextDay(formData.profile.immigration_start_date)} onChange={v => updateProfile('immigration_till_date', v)} />
                </div>
            )}

            {step === 4 && (
                <div className="grid grid-cols-2 gap-3">
                    <FormInput label="Personal Email*" value={formData.profile.personal_email} onChange={v => updateProfile('personal_email', v)} />
                    <FormInput label="Phone Number*" value={formData.profile.phone_number} onChange={v => updateProfile('phone_number', v)} />
                    <FormSelect label="Country of Origin*" isObject={true} options={lookups.countries || []} value={formData.profile.country_id} onChange={v => updateProfile('country_id', v)} />
                    <FormInput label="E-Verification Code*" value={formData.profile.e_verification_code} onChange={v => updateProfile('e_verification_code', v)} />
                </div>
            )}

            {step === 5 && (
                <div className="space-y-4 max-w-md mx-auto py-6">
                    <FormInput label="Professional Work Email (Login)*" type="email" value={formData.auth.email} onChange={v => setFormData({...formData, auth: {...formData.auth, email: v}})} />
                    <div className="space-y-1">
                        <div className="flex justify-between items-center">
                            <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">Password*</label>
                            <button onClick={generatePassword} className="text-[9px] font-bold text-[var(--brand-primary)] flex items-center gap-1 hover:opacity-80 transition-opacity outline-none">
                                <RefreshCw size={10}/> Generate
                            </button>
                        </div>
                        <input 
                            type="text" 
                            className="w-full py-1.5 px-3 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-[var(--brand-primary)] transition-all placeholder:text-[var(--input-placeholder)]"
                            value={formData.auth.password} 
                            onChange={e => setFormData({...formData, auth: {...formData.auth, password: e.target.value}})} 
                        />
                    </div>
                </div>
            )}
        </BaseModal>
    );
};

// ==========================================
// Strictly Typed CSS Design Token Components
// ==========================================
const FormInput = ({ label, type = "text", value, onChange, placeholder, readOnly = false, min }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">{label}</label>
        <input 
            type={type} 
            placeholder={placeholder}
            readOnly={readOnly}
            min={min}
            className={`w-full py-1.5 px-3 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] rounded-lg text-xs font-bold outline-none transition-all ${
                readOnly 
                ? 'opacity-60 cursor-not-allowed bg-[var(--bg-app)]' 
                : 'focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'
            }`}
            value={value} 
            onChange={e => onChange && onChange(e.target.value)} 
        />
    </div>
);

// Updated FormSelect to handle arrays of objects
const FormSelect = ({ label, options, value, onChange, isObject = false }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">{label}</label>
        <select 
            className="w-full py-1.5 px-3 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-lg text-xs font-bold outline-none focus:ring-1 focus:ring-[var(--brand-primary)] transition-all"
            value={value || ''} 
            onChange={e => onChange(e.target.value)}
        >
            <option value="" disabled className="text-[var(--input-placeholder)]">Select...</option>
            {options.map(opt => (
                <option key={isObject ? opt.id : opt} value={isObject ? opt.id : opt}>
                    {isObject ? opt.name : opt}
                </option>
            ))}
        </select>
    </div>
);

export default AddEmployeeModal;