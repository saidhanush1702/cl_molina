import React, { useState } from 'react';
import { X, Save, Edit3, Briefcase, DollarSign, CreditCard, User, Building, Clock, FileText } from 'lucide-react';
import api from '../../../api/axios';

const PlacementDetailModal = ({ placement, onClose, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);
    
    // Safely parse MySQL boolean
    const hasTimesheets = placement.has_timesheets === 1 || placement.has_timesheets === true;
    
    const [editData, setEditData] = useState({ ...placement, has_timesheets: hasTimesheets });
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await api.put(`/api/management/placements/${placement.id}`, editData);
            setIsEditing(false);
            onRefresh();
            onClose();
        } catch (err) {
            alert(err.response?.data?.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toISOString().split('T')[0];
    };

    if (!placement) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-[var(--bg-surface)] w-[70vw] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[var(--border-subtle)]">

                <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)]">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center text-[var(--brand-primary-text)] shadow-sm">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold uppercase tracking-tighter text-[var(--text-main)] leading-none text-lg">Placement Details</h2>
                            <p className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest mt-1">
                                {placement.first_name} {placement.last_name} @ {placement.client_name}
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)]"><X /></button>
                </div>

                <div className="p-8 flex-1 overflow-y-auto space-y-8">
                    
                    <div className="grid grid-cols-2 gap-6 bg-[var(--bg-app)]/50 p-5 rounded-2xl border border-[var(--border-subtle)]">
                        <div className="flex items-center gap-3">
                            <User size={16} className="text-[var(--text-muted)]"/>
                            <div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Consultant / Employee</p>
                                <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-tight">{placement.first_name} {placement.last_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <Building size={16} className="text-[var(--text-muted)]"/>
                            <div>
                                <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Direct Client</p>
                                <p className="text-sm font-bold text-[var(--text-main)] uppercase tracking-tight">{placement.client_name}</p>
                            </div>
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-4">
                        <SectionHeader icon={<Briefcase size={14} />} title="Job Information" />
                        <div className="grid grid-cols-3 gap-6">
                            <Field label="Job Title" value={editData.job_title} edit={isEditing} onChange={v => setEditData({ ...editData, job_title: v })} />
                            <Field label="Placement Code" value={editData.placement_code} edit={isEditing} onChange={v => setEditData({ ...editData, placement_code: v })} />
                            
                            {/* UPDATED OPTIONS TO ONLY Primary/Secondary */}
                            <Field label="Placement Type" value={editData.placement_type} edit={isEditing} isSelect options={['Primary', 'Secondary']} onChange={v => setEditData({ ...editData, placement_type: v })} />
                            
                            <Field label="Status" value={editData.status} edit={isEditing} isSelect options={['Active', 'Completed', 'Terminated']} onChange={v => setEditData({ ...editData, status: v })} />
                            <Field label="Start Date" type="date" value={formatDateForInput(editData.start_date)} edit={isEditing} onChange={v => setEditData({ ...editData, start_date: v })} />
                            <Field label="End Date" type="date" value={formatDateForInput(editData.end_date)} edit={isEditing} onChange={v => setEditData({ ...editData, end_date: v })} />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-8">
                        {/* Timesheets */}
                        <div className="space-y-4">
                            <SectionHeader icon={<Clock size={14} className="text-orange-500" />} title="Timesheet Settings" />
                            {isEditing ? (
                                <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-main)] cursor-pointer mb-4">
                                    <input 
                                        type="checkbox" 
                                        className="w-4 h-4 rounded border-[var(--border-subtle)] text-[var(--brand-primary)]"
                                        checked={editData.has_timesheets}
                                        onChange={e => setEditData({...editData, has_timesheets: e.target.checked})}
                                    />
                                    Timesheets Enabled
                                </label>
                            ) : (
                                <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-widest border-b border-[var(--border-subtle)] pb-1 w-max">
                                    Status: {editData.has_timesheets ? <span className="text-green-500">Enabled</span> : <span className="text-red-500">Disabled</span>}
                                </p>
                            )}

                            {editData.has_timesheets && (
                                <div className="grid grid-cols-2 gap-4">
                                    <Field label="Cycle" value={editData.timesheet_cycle} edit={isEditing} isSelect options={['Weekly', 'Bi-Weekly', 'Semi-Monthly', 'Monthly']} onChange={v => setEditData({ ...editData, timesheet_cycle: v })} />
                                    <Field label="Week Start Day" value={editData.week_start_day} edit={isEditing} isSelect options={['Monday', 'Sunday', 'Saturday']} onChange={v => setEditData({ ...editData, week_start_day: v })} />
                                    <div className="col-span-2">
                                        <Field label="Start Date" type="date" value={formatDateForInput(editData.timesheet_start_date)} edit={isEditing} onChange={v => setEditData({ ...editData, timesheet_start_date: v })} />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Invoicing */}
                        <div className="space-y-4">
                            <SectionHeader icon={<FileText size={14} className="text-purple-500" />} title="Invoicing Configuration" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Field label="Invoice Type" value={editData.invoice_type} edit={isEditing} isSelect options={['Time & Material', 'Fixed Price', 'Milestone']} onChange={v => setEditData({ ...editData, invoice_type: v })} />
                                </div>
                                <Field label="Reference No. (PO)" value={editData.invoice_reference_no} edit={isEditing} onChange={v => setEditData({ ...editData, invoice_reference_no: v })} />
                                <Field label="Frequency" value={editData.invoice_frequency} edit={isEditing} isSelect options={['Weekly', 'Bi-Weekly', 'Monthly']} onChange={v => setEditData({ ...editData, invoice_frequency: v })} />
                            </div>
                        </div>

                        {/* Bill Rate */}
                        <div className="space-y-4">
                            <SectionHeader icon={<DollarSign size={14} className="text-green-500" />} title="Bill Rate (Client)" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Field label="Bill Amount" type="number" step="0.01" value={editData.bill_rate} edit={isEditing} onChange={v => setEditData({ ...editData, bill_rate: v })} />
                                </div>
                                <Field label="Rate Frequency" value={editData.bill_frequency} edit={isEditing} isSelect options={['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']} onChange={v => setEditData({ ...editData, bill_frequency: v })} />
                            </div>
                        </div>

                        {/* Pay Rate */}
                        <div className="space-y-4">
                            <SectionHeader icon={<CreditCard size={14} className="text-blue-500" />} title="Pay Rate (Employee)" />
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <Field label="Pay Amount" type="number" step="0.01" value={editData.pay_rate} edit={isEditing} onChange={v => setEditData({ ...editData, pay_rate: v })} />
                                </div>
                                <Field label="Pay Frequency" value={editData.pay_frequency} edit={isEditing} isSelect options={['Hourly', 'Daily', 'Weekly', 'Monthly', 'Yearly']} onChange={v => setEditData({ ...editData, pay_frequency: v })} />
                                <Field label="Pay Type" value={editData.pay_type} edit={isEditing} isSelect options={['W2', '1099', 'C2C']} onChange={v => setEditData({ ...editData, pay_type: v })} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex justify-end items-center">
                    <div className="flex gap-3">
                        {!isEditing ? (
                            <button onClick={() => setIsEditing(true)} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-10 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:opacity-90 transition-all active:scale-95 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none">
                                <Edit3 size={16} /> Edit Placement
                            </button>
                        ) : (
                            <>
                                <button onClick={() => { setIsEditing(false); setEditData({ ...placement, has_timesheets: hasTimesheets }); }} className="px-6 py-3 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleSave} disabled={loading} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-10 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:opacity-90 transition-all active:scale-95 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none disabled:opacity-50">
                                    {loading ? 'Saving...' : <><Save size={16} /> Save Changes</>}
                                </button>
                            </>
                        )}
                    </div>
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

const Field = ({ label, value, edit, onChange, type = "text", isSelect = false, options = [], step }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-tighter ml-1">{label}</label>
        {edit ? (
            isSelect ? (
                <select className="w-full p-2 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all" value={value || ''} onChange={e => onChange(e.target.value)}>
                    <option value="">Select...</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input type={type} step={step} className="w-full p-2 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all" value={value || ''} onChange={e => onChange(e.target.value)} />
            )
        ) : (
            <p className="text-sm font-bold text-[var(--text-main)] px-1 truncate transition-colors duration-300">
                {type === 'number' && value ? `$${value}` : (type === 'date' && value ? new Date(value).toLocaleDateString() : (value || '---'))}
            </p>
        )}
    </div>
);

export default PlacementDetailModal;