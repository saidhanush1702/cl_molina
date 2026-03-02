import React, { useState, useEffect } from 'react';
import { Save, Edit3, User, Briefcase, Mail, Fingerprint, Trash2, AlertTriangle, Lock, Unlock, Plus, Plane, Eye, EyeOff, X } from 'lucide-react';
import { managementAPI, commonAPI } from '../../../api/apiService';
import BaseModal from '../../../components/ui/BaseModal';

const getSafeImmigrations = (raw) => {
    if (!raw) return [];
    let parsed = raw;
    if (typeof raw === 'string') {
        try { parsed = JSON.parse(raw); } 
        catch (e) { return []; }
    }
    if (Array.isArray(parsed)) return parsed.filter(i => i);
    return [];
};

const getNextDay = (dateString) => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return undefined;
    date.setDate(date.getDate() + 1);
    return date.toISOString().split('T')[0];
};

const safeDate = (dateString) => dateString ? dateString.split('T')[0] : '';

const EmployeeDetailModal = ({ employee, onClose, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [isTerminating, setIsTerminating] = useState(false);
    const [terminationData, setTerminationData] = useState({ date: '', reason: '' });
    
    // Lookups State
    const [lookups, setLookups] = useState({
        genders: [], employeeTypes: [], countries: [], immigrationStatuses: []
    });

    // Immigration State
    const [immigrations, setImmigrations] = useState(getSafeImmigrations(employee?.immigrations));
    const [showAddImm, setShowAddImm] = useState(false);
    const [newImm, setNewImm] = useState({ status_id: '', start_date: '', till_date: '' });
    
    // Inline Edit State for Immigration
    const [editingImmId, setEditingImmId] = useState(null);
    const [editImmData, setEditImmData] = useState({ status_id: '', start_date: '', till_date: '' });

    // Credentials State
    const [showPassword, setShowPassword] = useState(false);

    const [editData, setEditData] = useState({ ...employee });
    const userRole = localStorage.getItem('userRole');

    const isActive = employee?.is_active === 1 || employee?.is_active === true;
    const isTerminated = !!employee?.termination_date;

    // Fetch lookups when editing begins to populate dropdowns
    useEffect(() => {
        if (isEditing || showAddImm || editingImmId !== null) {
            commonAPI.getLookups()
                .then(res => setLookups(res.data))
                .catch(err => console.error("Failed to load lookups", err));
        }
    }, [isEditing, showAddImm, editingImmId]);

    const handleToggleAccess = async () => {
        const newStatus = !isActive;
        const actionText = newStatus ? "RESTORE" : "SUSPEND";
        if (window.confirm(`Are you sure you want to ${actionText} system access?`)) {
            try {
                await managementAPI.toggleEmployeeAccess(employee.id, { is_active: newStatus });
                onRefresh(); onClose();
            } catch (err) { alert(err.response?.data?.message || `Failed to ${actionText} access.`); }
        }
    };

    const handleTerminateConfirm = async () => {
        if (!terminationData.date || !terminationData.reason.trim()) return alert("Provide date and reason.");
        if (window.confirm(`WARNING: Officially terminate?`)) {
            try {
                await managementAPI.terminateEmployee(employee.id, terminationData);
                onRefresh(); onClose();   
            } catch (err) { alert(err.response?.data?.message || "Critical: Termination failed."); }
        }
    };

    const handleSave = async () => {
        try {
            const updatePayload = {
                first_name: editData.first_name, 
                last_name: editData.last_name,
                birth_date: safeDate(editData.birth_date), 
                gender_id: editData.gender_id || null, 
                marital_status: editData.marital_status, 
                employee_code: editData.employee_code,
                title: editData.title, 
                employee_type_id: editData.employee_type_id || null, 
                joining_date: safeDate(editData.joining_date), 
                ssn: editData.ssn,
                personal_email: editData.personal_email, 
                phone_number: editData.phone_number,
                country_id: editData.country_id || null, 
                e_verification_code: editData.e_verification_code
            };
            await managementAPI.updateEmployee(employee.id, updatePayload);
            setIsEditing(false); setShowAddImm(false); setEditingImmId(null); onRefresh();
        } catch (err) { alert("Update failed: " + (err.response?.data?.message || err.message)); }
    };

    // -- IMMIGRATION ACTIONS --
    const handleAddImmigration = async () => {
        if (!newImm.status_id) return alert("Status is required");
        if (newImm.start_date && newImm.till_date && newImm.start_date >= newImm.till_date) {
            return alert("Till Date must be strictly after the Start Date.");
        }
        try {
            await managementAPI.addImmigration(employee.id, newImm);
            
            // Map the selected ID to the status name for immediate UI update
            const statusObj = lookups.immigrationStatuses.find(s => String(s.id) === String(newImm.status_id));
            
            setImmigrations([...immigrations, { ...newImm, id: Date.now(), status_name: statusObj?.name }]);
            setNewImm({ status_id: '', start_date: '', till_date: '' });
            setShowAddImm(false); 
            onRefresh(); 
        } catch (err) { alert("Failed to add record"); }
    };

    const handleDeleteImmigration = async (immId) => {
        if(window.confirm("Remove this immigration record?")) {
            try {
                await managementAPI.deleteImmigration(immId);
                setImmigrations(immigrations.filter(i => i.id !== immId)); onRefresh();
            } catch (err) { alert("Failed to delete record"); }
        }
    };

    const startEditingImm = (imm) => {
        setEditingImmId(imm.id);
        setEditImmData({ status_id: imm.status_id, start_date: safeDate(imm.start_date), till_date: safeDate(imm.till_date) });
    };

    const handleUpdateImmigration = async (immId) => {
        if (!editImmData.status_id) return alert("Status is required");
        if (editImmData.start_date && editImmData.till_date && editImmData.start_date >= editImmData.till_date) {
            return alert("Till Date must be strictly after the Start Date.");
        }
        try {
            await managementAPI.updateImmigration(immId, editImmData);
            
            const statusObj = lookups.immigrationStatuses.find(s => String(s.id) === String(editImmData.status_id));
            
            setImmigrations(immigrations.map(imm => 
                imm.id === immId ? { ...imm, ...editImmData, status_name: statusObj?.name } : imm
            ));
            
            setEditingImmId(null); 
            onRefresh(); 
        } catch (err) { alert("Failed to update record"); }
    };

    if (!employee) return null;

    const modalFooter = isTerminating ? (
        <div className="bg-red-500/5 p-3 rounded-xl border border-red-500/20 w-full animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 mb-2">
                <AlertTriangle size={14} className="text-red-500" />
                <h4 className="text-red-500 font-bold text-[10px] uppercase tracking-widest">Terminate Employee</h4>
            </div>
            <div className="grid grid-cols-4 gap-3 items-end">
                <div className="space-y-1 col-span-1">
                    <label className="text-[9px] font-bold text-red-500/70 uppercase tracking-tighter ml-1">Termination Date</label>
                    <input type="date" className="w-full p-1.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-red-500/30 rounded-lg text-[10px] font-bold focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" value={terminationData.date} onChange={e => setTerminationData({...terminationData, date: e.target.value})} />
                </div>
                <div className="space-y-1 col-span-3">
                    <label className="text-[9px] font-bold text-red-500/70 uppercase tracking-tighter ml-1">Reason for Termination</label>
                    <div className="flex gap-2">
                        <input type="text" placeholder="Enter reason..." className="flex-1 p-1.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-red-500/30 rounded-lg text-[10px] font-bold focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all" value={terminationData.reason} onChange={e => setTerminationData({...terminationData, reason: e.target.value})} />
                        <button onClick={() => setIsTerminating(false)} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">Cancel</button>
                        <button onClick={handleTerminateConfirm} className="bg-red-500 text-white px-6 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest shadow-sm hover:opacity-90 transition-all active:scale-95">Confirm</button>
                    </div>
                </div>
            </div>
        </div>
    ) : (
        <div className="flex justify-between items-center w-full">
            <div className="flex gap-2">
                {userRole === 'ORG_ADMIN' && !isTerminated && (
                    <>
                        <button onClick={handleToggleAccess} className={`flex items-center gap-1.5 transition-all text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg border ${isActive ? 'text-orange-500 hover:bg-orange-500/10 border-transparent hover:border-orange-500/20' : 'text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20'}`}>
                            {isActive ? <Lock size={12} /> : <Unlock size={12} />} {isActive ? "Suspend Access" : "Restore Access"}
                        </button>
                        <button onClick={() => setIsTerminating(true)} className="flex items-center gap-1.5 text-[var(--text-muted)] hover:text-red-500 transition-all text-[9px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20">
                            <Trash2 size={12} /> Terminate
                        </button>
                    </>
                )}
            </div>
            <div className="flex gap-2">
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-6 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm hover:opacity-90 transition-all active:scale-95 outline-none">
                        <Edit3 size={12} /> Edit Details
                    </button>
                ) : (
                    <>
                        <button onClick={() => { setIsEditing(false); setShowAddImm(false); setEditingImmId(null); setEditData({...employee})}} className="px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors">
                            Cancel
                        </button>
                        <button onClick={handleSave} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-6 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm hover:opacity-90 transition-all active:scale-95 outline-none">
                            <Save size={12} /> Save Changes
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <BaseModal
            isOpen={true} onClose={onClose} icon={<Fingerprint size={16} />}
            title="Employee Master File"
            subtitle={
                <span>
                    {editData.first_name} {editData.last_name}
                    {!isActive && !isTerminated && <span className="text-orange-500 ml-2">(SUSPENDED)</span>}
                    {isTerminated && <span className="text-red-500 ml-2">(TERMINATED)</span>}
                </span>
            }
            footer={modalFooter}
        >
            <div className="space-y-4"> 
                {/* Personal Section */}
                <div className="space-y-2">
                    <SectionHeader icon={<User size={12} />} title="Personal & Demographic" />
                    <div className="grid grid-cols-4 gap-2 bg-[var(--bg-app)]/50 p-2 rounded-xl border border-[var(--border-subtle)]">
                        <Field label="First Name" value={editData.first_name} edit={isEditing} onChange={v => setEditData({ ...editData, first_name: v })} />
                        <Field label="Last Name" value={editData.last_name} edit={isEditing} onChange={v => setEditData({ ...editData, last_name: v })} />
                        <Field label="Birth Date" type="date" value={safeDate(editData.birth_date)} edit={isEditing} onChange={v => setEditData({ ...editData, birth_date: v })} />
                        <Field label="Gender" value={isEditing ? editData.gender_id : editData.gender_name} edit={isEditing} isSelect isObject options={lookups.genders} onChange={v => setEditData({ ...editData, gender_id: v })} />
                        <Field label="Marital Status" value={editData.marital_status} edit={isEditing} onChange={v => setEditData({ ...editData, marital_status: v })} />
                    </div>
                </div>

                {/* Employment Section */}
                <div className="space-y-2">
                    <SectionHeader icon={<Briefcase size={12} />} title="Employment Details" />
                    <div className="grid grid-cols-4 gap-2 bg-[var(--bg-app)]/50 p-2 rounded-xl border border-[var(--border-subtle)]">
                        <Field label="Employee Code" value={editData.employee_code} edit={isEditing} onChange={v => setEditData({ ...editData, employee_code: v })} />
                        <Field label="Job Title" value={editData.title} edit={isEditing} onChange={v => setEditData({ ...editData, title: v })} />
                        <Field label="Employment Type" value={isEditing ? editData.employee_type_id : editData.employee_type_name} edit={isEditing} isSelect isObject options={lookups.employeeTypes} onChange={v => setEditData({ ...editData, employee_type_id: v })} />
                        <Field label="Joining Date" type="date" value={safeDate(editData.joining_date)} edit={isEditing} onChange={v => setEditData({ ...editData, joining_date: v })} />
                        <div className="col-span-2">
                            <Field label="SSN (Encrypted)" value={editData.ssn} edit={isEditing} type="ssn" onChange={v => setEditData({ ...editData, ssn: v })} />
                        </div>
                    </div>
                </div>

                {/* Communication Section */}
                <div className="space-y-2">
                    <SectionHeader icon={<Mail size={12} />} title="Communication & Setup" />
                    <div className="grid grid-cols-4 gap-2 bg-[var(--bg-app)]/50 p-2 rounded-xl border border-[var(--border-subtle)]">
                        <Field label="Personal Email" value={editData.personal_email} edit={isEditing} onChange={v => setEditData({ ...editData, personal_email: v })} />
                        <Field label="Phone Number" value={editData.phone_number} edit={isEditing} onChange={v => setEditData({ ...editData, phone_number: v })} />
                        <Field label="Country of Origin" value={isEditing ? editData.country_id : editData.country_name} edit={isEditing} isSelect isObject options={lookups.countries} onChange={v => setEditData({ ...editData, country_id: v })} />
                        <Field label="E-Verify Code" value={editData.e_verification_code} edit={isEditing} onChange={v => setEditData({ ...editData, e_verification_code: v })} />
                    </div>
                </div>

                {/* IMMIGRATION HISTORY SECTION */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center border-b border-[var(--border-subtle)] pb-1">
                        <div className="flex items-center gap-1.5">
                            <span className="text-[var(--text-muted)]"><Plane size={12} /></span>
                            <h3 className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Immigration History</h3>
                        </div>
                        {isEditing && (
                            <button onClick={() => { setShowAddImm(!showAddImm); setEditingImmId(null); }} className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest text-[var(--brand-primary)] hover:opacity-80 transition-opacity bg-[var(--brand-primary)]/10 px-2 py-1 rounded">
                                <Plus size={10} /> Add Record
                            </button>
                        )}
                    </div>

                    {/* ADD NEW FORM */}
                    {isEditing && showAddImm && !editingImmId && (
                        <div className="grid grid-cols-4 gap-2 p-3 bg-[var(--bg-app)]/80 rounded-xl border border-[var(--brand-primary)]/30 animate-in fade-in slide-in-from-top-2">
                            <Field label="Status*" value={newImm.status_id} edit={true} isSelect={true} isObject={true} options={lookups.immigrationStatuses} onChange={v => setNewImm({...newImm, status_id: v})} />
                            <Field label="Start Date" type="date" value={newImm.start_date} edit={true} onChange={v => setNewImm({...newImm, start_date: v})} />
                            <Field label="Till Date" type="date" value={newImm.till_date} edit={true} min={getNextDay(newImm.start_date)} onChange={v => setNewImm({...newImm, till_date: v})} />
                            <div className="flex items-end pb-px">
                                <button onClick={handleAddImmigration} className="w-full bg-[var(--brand-primary)] text-[var(--brand-primary-text)] py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">Save Record</button>
                            </div>
                        </div>
                    )}

                    <div className="space-y-1.5">
                        {immigrations.length === 0 ? (
                            <p className="text-[10px] font-bold text-[var(--text-muted)] italic px-1 py-2">No immigration records found.</p>
                        ) : (
                            immigrations.map((imm, index) => (
                                <div key={imm.id || `imm-${index}`} className="bg-[var(--bg-app)]/50 rounded-lg border border-[var(--border-subtle)] transition-colors duration-300 overflow-hidden">
                                    
                                    {/* EDITING MODE ROW */}
                                    {editingImmId === imm.id ? (
                                        <div className="grid grid-cols-4 gap-2 p-3 bg-blue-50/50 border-l-2 border-[var(--brand-primary)]">
                                            <Field label="Status*" value={editImmData.status_id} edit={true} isSelect={true} isObject={true} options={lookups.immigrationStatuses} onChange={v => setEditImmData({...editImmData, status_id: v})} />
                                            <Field label="Start Date" type="date" value={editImmData.start_date} edit={true} onChange={v => setEditImmData({...editImmData, start_date: v})} />
                                            <Field label="Till Date" type="date" value={editImmData.till_date} edit={true} min={getNextDay(editImmData.start_date)} onChange={v => setEditImmData({...editImmData, till_date: v})} />
                                            <div className="flex items-end gap-1 pb-px">
                                                <button onClick={() => setEditingImmId(null)} className="flex-1 bg-white text-[var(--text-muted)] border border-[var(--border-subtle)] py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:text-[var(--text-main)] transition-all">Cancel</button>
                                                <button onClick={() => handleUpdateImmigration(imm.id)} className="flex-1 bg-[var(--brand-primary)] text-[var(--brand-primary-text)] py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest hover:opacity-90 active:scale-95 transition-all">Update</button>
                                            </div>
                                        </div>
                                    ) : (
                                        /* NORMAL VIEW ROW */
                                        <div className="flex justify-between items-center px-3 py-2">
                                            <div className="grid grid-cols-3 gap-8 w-full mr-4">
                                                <div>
                                                    <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Status</p>
                                                    <p className="text-[11px] font-bold text-[var(--text-main)] truncate mt-0.5">{imm.status_name || imm.status}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Start Date</p>
                                                    <p className="text-[10px] font-bold text-[var(--text-main)] mt-0.5">{safeDate(imm.start_date) || '---'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Till Date</p>
                                                    <p className="text-[10px] font-bold text-[var(--text-main)] mt-0.5">{safeDate(imm.till_date) || '---'}</p>
                                                </div>
                                            </div>
                                            
                                            {/* Action Buttons */}
                                            {isEditing && (
                                                <div className="flex gap-1 shrink-0">
                                                    <button onClick={() => startEditingImm(imm)} className="text-[var(--brand-primary)] hover:bg-[var(--brand-primary)]/10 p-1.5 rounded-md transition-colors" title="Edit Record">
                                                        <Edit3 size={12} />
                                                    </button>
                                                    <button onClick={() => handleDeleteImmigration(imm.id)} className="text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 p-1.5 rounded-md transition-colors" title="Delete Record">
                                                        <Trash2 size={12} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Credentials Section */}
                <div className="space-y-2 pt-2 border-t border-[var(--border-subtle)]">
                    <SectionHeader icon={<Lock size={12} />} title="System Credentials (Read-Only)" />
                    <div className="grid grid-cols-4 gap-2 bg-[var(--bg-app)]/50 p-2 rounded-xl border border-[var(--border-subtle)]">
                        <div className="col-span-2">
                            <Field label="Username / Email" value={employee.email} edit={false} />
                        </div>
                        <div className="col-span-2">
                            <div className="space-y-0.5">
                                <label className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1 transition-colors duration-300">Password</label>
                                
                                {/* UPDATED: Replaced justify-between with items-center gap-2, removed text inside button */}
                                <div className="flex items-center gap-2 px-1">
                                    <p className="text-[11px] font-bold text-[var(--text-main)] truncate transition-colors duration-300">
                                        {!showPassword ? '••••••••••••' : (employee.plain_password || 'Password Encrypted / Hidden')}
                                    </p>
                                    <button 
                                        onClick={() => setShowPassword(!showPassword)} 
                                        className="flex items-center text-[var(--brand-primary)] hover:opacity-80 transition-opacity outline-none"
                                        title={showPassword ? "Hide Password" : "Show Password"}
                                    >
                                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    </button>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </BaseModal>
    );
};

// Helpers
const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-1.5 border-b border-[var(--border-subtle)] pb-1 transition-colors duration-300">
        <span className="text-[var(--text-muted)] transition-colors duration-300">{icon}</span>
        <h3 className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-300">{title}</h3>
    </div>
);

// Updated Field component to support object mapping for selects
const Field = ({ label, value, edit, onChange, type = "text", isSelect = false, isObject = false, options = [], min }) => {
    const getDisplayValue = () => {
        if (!value) return '---';
        if (type === 'ssn' && String(value).length >= 4) return `*****${String(value).slice(-4)}`;
        if (type === 'password') return '********';
        return value;
    };

    return (
        <div className="space-y-0.5">
            <label className="text-[8px] font-bold text-[var(--text-muted)] uppercase tracking-wider ml-1 transition-colors duration-300">{label}</label>
            {edit ? (
                isSelect ? (
                    <select className="w-full py-1 px-2 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all" value={value || ''} onChange={e => onChange(e.target.value)}>
                        <option value="" disabled>Select...</option>
                        {options.map(opt => (
                            <option key={isObject ? opt.id : opt} value={isObject ? opt.id : opt}>
                                {isObject ? opt.name : opt}
                            </option>
                        ))}
                    </select>
                ) : (
                    <input type={type === 'ssn' ? 'text' : type} className="w-full py-1 px-2 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-lg text-[10px] font-bold focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all" value={value || ''} min={min} onChange={e => onChange(e.target.value)} />
                )
            ) : (
                <p className="text-[11px] font-bold text-[var(--text-main)] px-1 truncate transition-colors duration-300">
                    {getDisplayValue()}
                </p>
            )}
        </div>
    );
};

export default EmployeeDetailModal;