import React, { useState, useEffect } from 'react';
import { X, Check, Briefcase, DollarSign, CreditCard, Clock, FileText } from 'lucide-react';
import api from '../../../api/axios';

const AddPlacementModal = ({ isOpen, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    
    const [employees, setEmployees] = useState([]);
    const [clients, setClients] = useState([]);

    const initialFormState = {
        employee_id: '', client_id: '', 
        job_title: '', placement_code: '', placement_type: 'Primary', start_date: '', end_date: '', status: 'Active',
        
        has_timesheets: false, timesheet_cycle: 'Weekly', timesheet_start_date: '', week_start_day: 'Monday',
        invoice_type: 'Time & Material', invoice_reference_no: '', invoice_frequency: 'Monthly',
        
        bill_rate: '', bill_frequency: 'Hourly', 
        pay_rate: '', pay_frequency: 'Hourly', pay_type: 'W2'
    };
    const [formData, setFormData] = useState(initialFormState);

    useEffect(() => {
        if (isOpen) {
            const fetchData = async () => {
                try {
                    const [empRes, cliRes] = await Promise.all([
                        api.get('/api/management/employees'),
                        api.get('/api/management/clients')
                    ]);
                    setEmployees(empRes.data.filter(e => e.is_active === 1 || e.is_active === true));
                    setClients(cliRes.data);
                } catch (err) { console.error(err); }
            };
            fetchData();
        } else {
            setFormData(initialFormState);
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/management/placements', formData);
            onRefresh(); onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Error creating placement");
        } finally { setLoading(false); }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-[var(--bg-surface)] w-[70vw] h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-subtle)] transition-colors duration-300">
                
                <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center shadow-sm">
                            <Briefcase className="text-[var(--brand-primary-text)]" size={20}/>
                        </div>
                        <div>
                            <h2 className="font-bold uppercase tracking-tighter text-[var(--text-main)] text-lg leading-none">Create Placement</h2>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">Assign Employee to Client</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)]"><X size={20}/></button>
                </div>

                <form id="placementForm" onSubmit={handleSubmit} className="p-8 space-y-8 flex-1 overflow-y-auto">
                    
                    {/* SECTION 1: Assignment Details */}
                    <div className="space-y-4">
                        <SectionHeader icon={<Briefcase size={14} />} title="Assignment & Job Details" />
                        <div className="grid grid-cols-3 gap-6">
                            <FormSelect label="Select Employee*" required value={formData.employee_id} onChange={v => setFormData({...formData, employee_id: v})}>
                                <option value="">-- Choose Employee --</option>
                                {employees.map(emp => <option key={emp.id} value={emp.id}>{emp.first_name} {emp.last_name} ({emp.employee_code || 'N/A'})</option>)}
                            </FormSelect>
                            
                            <FormSelect label="Direct Client*" required value={formData.client_id} onChange={v => setFormData({...formData, client_id: v})}>
                                <option value="">-- Choose Client --</option>
                                {clients.map(cli => <option key={cli.id} value={cli.id}>{cli.client_name}</option>)}
                            </FormSelect>

                            <FormSelect label="Placement Type" value={formData.placement_type} onChange={v => setFormData({...formData, placement_type: v})}>
                                <option value="Primary">Primary</option>
                                <option value="Secondary">Secondary</option>
                            </FormSelect>

                            <FormInput label="Job Title*" required value={formData.job_title} onChange={v => setFormData({...formData, job_title: v})} />
                            <FormInput label="Placement Code" value={formData.placement_code} onChange={v => setFormData({...formData, placement_code: v})} />
                            <div className="grid grid-cols-2 gap-2">
                                <FormInput label="Start Date*" type="date" required value={formData.start_date} onChange={v => setFormData({...formData, start_date: v})} />
                                <FormInput label="End Date" type="date" value={formData.end_date} onChange={v => setFormData({...formData, end_date: v})} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* SECTION 2: Timesheets */}
                        <div className="space-y-4 bg-[var(--bg-app)]/50 p-6 rounded-2xl border border-[var(--border-subtle)]">
                            <SectionHeader icon={<Clock size={14} className="text-orange-500"/>} title="Timesheet Settings" />
                            <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)] cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--brand-primary)] focus:ring-[var(--brand-primary)]"
                                    checked={formData.has_timesheets}
                                    onChange={e => setFormData({...formData, has_timesheets: e.target.checked})}
                                />
                                Enable Timesheets for this Placement
                            </label>
                            
                            {formData.has_timesheets && (
                                <div className="grid grid-cols-2 gap-4 mt-4 animate-in fade-in">
                                    <FormSelect label="Timesheet Cycle" value={formData.timesheet_cycle} onChange={v => setFormData({...formData, timesheet_cycle: v})}>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Bi-Weekly">Bi-Weekly</option>
                                        <option value="Semi-Monthly">Semi-Monthly</option>
                                        <option value="Monthly">Monthly</option>
                                    </FormSelect>
                                    <FormSelect label="Week Start Day" value={formData.week_start_day} onChange={v => setFormData({...formData, week_start_day: v})}>
                                        <option value="Monday">Monday</option>
                                        <option value="Sunday">Sunday</option>
                                        <option value="Saturday">Saturday</option>
                                    </FormSelect>
                                    <div className="col-span-2">
                                        <FormInput label="First Timesheet Start Date" type="date" required={formData.has_timesheets} value={formData.timesheet_start_date} onChange={v => setFormData({...formData, timesheet_start_date: v})} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* SECTION 3: Invoicing */}
                        <div className="space-y-4 bg-[var(--bg-app)]/50 p-6 rounded-2xl border border-[var(--border-subtle)]">
                            <SectionHeader icon={<FileText size={14} className="text-purple-500"/>} title="Invoicing Configuration" />
                            <div className="space-y-4">
                                <FormSelect label="Invoice Type" value={formData.invoice_type} onChange={v => setFormData({...formData, invoice_type: v})}>
                                    <option value="Time & Material">Time & Material (T&M)</option>
                                    <option value="Fixed Price">Fixed Price</option>
                                    <option value="Milestone">Milestone Based</option>
                                </FormSelect>
                                <div className="grid grid-cols-2 gap-4">
                                    <FormInput label="Invoice Reference No." value={formData.invoice_reference_no} onChange={v => setFormData({...formData, invoice_reference_no: v})} placeholder="e.g. PO-12345" />
                                    <FormSelect label="Invoice Frequency" value={formData.invoice_frequency} onChange={v => setFormData({...formData, invoice_frequency: v})}>
                                        <option value="Weekly">Weekly</option>
                                        <option value="Bi-Weekly">Bi-Weekly</option>
                                        <option value="Monthly">Monthly</option>
                                    </FormSelect>
                                </div>
                            </div>
                        </div>

                        {/* SECTION 4: Bill Rate */}
                        <div className="space-y-4 bg-[var(--bg-app)]/50 p-6 rounded-2xl border border-[var(--border-subtle)]">
                            <SectionHeader icon={<DollarSign size={14} className="text-green-500"/>} title="Bill Rate (Client Charges)" />
                            <div className="grid grid-cols-2 gap-4">
                                <FormInput label="Bill Rate Amount*" type="number" step="0.01" required value={formData.bill_rate} onChange={v => setFormData({...formData, bill_rate: v})} placeholder="0.00" />
                                <FormSelect label="Rate Frequency" value={formData.bill_frequency} onChange={v => setFormData({...formData, bill_frequency: v})}>
                                    <option value="Hourly">Hourly</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Yearly (Fixed)</option>
                                </FormSelect>
                            </div>
                        </div>

                        {/* SECTION 5: Pay Rate */}
                        <div className="space-y-4 bg-[var(--bg-app)]/50 p-6 rounded-2xl border border-[var(--border-subtle)]">
                            <SectionHeader icon={<CreditCard size={14} className="text-blue-500"/>} title="Pay Rate (Employee Earnings)" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <FormInput label="Pay Rate Amount*" type="number" step="0.01" required value={formData.pay_rate} onChange={v => setFormData({...formData, pay_rate: v})} placeholder="0.00" />
                                </div>
                                <FormSelect label="Pay Frequency" value={formData.pay_frequency} onChange={v => setFormData({...formData, pay_frequency: v})}>
                                    <option value="Hourly">Hourly</option>
                                    <option value="Daily">Daily</option>
                                    <option value="Weekly">Weekly</option>
                                    <option value="Monthly">Monthly</option>
                                    <option value="Yearly">Salary (Yearly)</option>
                                </FormSelect>
                                <FormSelect label="Pay Type" value={formData.pay_type} onChange={v => setFormData({...formData, pay_type: v})}>
                                    <option value="W2">W2</option>
                                    <option value="1099">1099 (Corp-to-Corp)</option>
                                    <option value="C2C">C2C</option>
                                </FormSelect>
                            </div>
                        </div>
                    </div>
                </form>

                <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex justify-end">
                    <button type="submit" form="placementForm" disabled={loading} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-10 py-3 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:opacity-90 active:scale-95 transition-all">
                        {loading ? 'Creating...' : <><Check size={16}/> Create Placement</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-2 border-b border-[var(--border-subtle)] pb-2 mb-2">
        <span className="text-[var(--text-muted)]">{icon}</span>
        <h3 className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{title}</h3>
    </div>
);

const FormInput = ({ label, type = "text", value, onChange, placeholder, required = false, step }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">{label}</label>
        <input type={type} step={step} required={required} placeholder={placeholder} className="w-full p-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all" value={value} onChange={e => onChange(e.target.value)} />
    </div>
);

const FormSelect = ({ label, children, value, onChange, required = false }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1">{label}</label>
        <select required={required} className="w-full p-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all" value={value} onChange={e => onChange(e.target.value)}>
            {children}
        </select>
    </div>
);

export default AddPlacementModal;