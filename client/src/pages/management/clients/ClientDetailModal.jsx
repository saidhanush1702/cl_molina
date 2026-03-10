import React, { useState, useEffect } from 'react';
import { Save, Edit3, Trash2, Building2, Plus, Star, User, Mail, Phone, Globe, Briefcase, MapPin, Printer, AlertTriangle } from 'lucide-react';
import api from '../../../api/axios';
import { commonAPI } from '../../../api/apiService';
import BaseModal from '../../../components/ui/BaseModal';

const getSafeContacts = (contactsRaw) => {
    if (!contactsRaw) return [];
    let parsed = contactsRaw;
    if (typeof contactsRaw === 'string') {
        try { parsed = JSON.parse(contactsRaw); } 
        catch (e) { return []; }
    }
    if (Array.isArray(parsed)) {
        return parsed.filter(c => c !== null);
    }
    return [];
};

const ClientDetailModal = ({ client, onClose, onRefresh }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [lookups, setLookups] = useState({ clientContactTypes: [] });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    
    const [editData, setEditData] = useState({ 
        ...client,
        contacts: getSafeContacts(client?.contacts)
    });
    
    const userRole = localStorage.getItem('userRole');

    useEffect(() => {
        setEditData({ 
            ...client,
            contacts: getSafeContacts(client?.contacts)
        });
        setIsEditing(false);
        setErrors({});
        setSubmitError('');
    }, [client]);

    useEffect(() => {
        commonAPI.getLookups()
            .then(res => setLookups(res.data))
            .catch(err => console.error("Failed to load lookups", err));
    }, []);

    const validateForm = () => {
        const newErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const websiteRegex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/i;

        if (!editData.client_name) newErrors.client_name = "Client name is required.";
        
        if (!editData.website) {
            newErrors.website = "Website is required.";
        } else if (!websiteRegex.test(editData.website)) {
            newErrors.website = "Please enter a valid website URL.";
        }

        if (editData.fax_number) {
            const faxDigits = editData.fax_number.replace(/\D/g, '');
            if (faxDigits.length > 0 && faxDigits.length < 7) {
                newErrors.fax_number = "Fax number must be at least 7 digits.";
            }
        }

        editData.contacts.forEach((contact, index) => {
            if (!contact.contact_name) newErrors[`contact_${index}_contact_name`] = "Name is required.";
            if (!contact.contact_type_id) newErrors[`contact_${index}_contact_type_id`] = "Type is required.";
            
            if (!contact.contact_email) {
                newErrors[`contact_${index}_contact_email`] = "Email is required.";
            } else if (!emailRegex.test(contact.contact_email)) {
                newErrors[`contact_${index}_contact_email`] = "Invalid email format.";
            }

            if (contact.contact_phone) {
                const phoneDigits = contact.contact_phone.replace(/\D/g, '');
                if (phoneDigits.length > 0 && phoneDigits.length < 10) {
                    newErrors[`contact_${index}_contact_phone`] = "Phone must be at least 10 digits.";
                }
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) return;
        setSubmitError('');
        try {
            await api.put(`/api/management/clients/${client.id}`, editData);
            setIsEditing(false);
            onRefresh();
            onClose();
        } catch (err) { 
            setSubmitError(err.response?.data?.error || err.response?.data?.message || "Update failed"); 
        }
    };

    const handleDelete = async () => {
        if (window.confirm(`Delete ${client.client_name}? This cannot be undone.`)) {
            try {
                await api.delete(`/api/management/clients/${client.id}`);
                onRefresh();
                onClose();
            } catch (err) { alert("Delete failed"); }
        }
    };

    const updateField = (field, value) => {
        setEditData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
        if (submitError) setSubmitError('');
    };

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...editData.contacts];
        updatedContacts[index][field] = value;
        setEditData({ ...editData, contacts: updatedContacts });
        
        const errorKey = `contact_${index}_${field}`;
        if (errors[errorKey]) setErrors(prev => ({ ...prev, [errorKey]: null }));
        if (submitError) setSubmitError('');
    };

    const addContact = () => {
        setEditData({
            ...editData,
            contacts: [
                ...editData.contacts, 
                { contact_name: '', contact_title: '', contact_type_id: '', contact_email: '', contact_phone: '', is_primary: editData.contacts.length === 0 }
            ]
        });
    };

    const removeContact = (index) => {
        const updatedContacts = [...editData.contacts];
        const removedWasPrimary = updatedContacts[index].is_primary;
        
        updatedContacts.splice(index, 1);
        
        if (removedWasPrimary && updatedContacts.length > 0) {
            updatedContacts[0].is_primary = true;
        }
        setEditData({ ...editData, contacts: updatedContacts });
    };

    const setPrimaryContact = (index) => {
        const updatedContacts = editData.contacts.map((c, i) => ({
            ...c, is_primary: i === index
        }));
        setEditData({ ...editData, contacts: updatedContacts });
    };

    if (!client) return null;

    const modalFooter = (
        <div className="flex flex-col w-full gap-2">
            {submitError && (
                <div className="w-full bg-red-500/10 border border-red-500/30 text-red-600 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <AlertTriangle size={14} className="shrink-0" />
                    <span>{submitError}</span>
                </div>
            )}
            <div className="flex justify-between items-center w-full">
                {userRole === 'ORG_ADMIN' ? (
                    <button onClick={handleDelete} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-red-500 transition-all text-[10px] font-bold uppercase px-3 py-1.5 rounded-xl outline-none">
                        <Trash2 size={14} /> Delete Client
                    </button>
                ) : <div></div>}
                
                <div className="flex gap-2">
                    {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all outline-none">
                            <Edit3 size={14} /> Edit Profile
                        </button>
                    ) : (
                        <>
                            <button 
                                onClick={() => {
                                    setIsEditing(false);
                                    setErrors({});
                                    setSubmitError('');
                                    setEditData({ 
                                        ...client,
                                        contacts: getSafeContacts(client?.contacts) 
                                    });
                                }} 
                                className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors outline-none"
                            >
                                Cancel
                            </button>
                            <button onClick={handleSave} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-6 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 shadow-sm hover:opacity-90 active:scale-95 transition-all outline-none">
                                <Save size={14} /> Save Changes
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <BaseModal
            isOpen={true} 
            onClose={onClose}
            icon={<Building2 size={16} />}
            title="Client Master File"
            subtitle="View and edit client details and contacts"
            footer={modalFooter}
        >
            <div className="space-y-4">
                
                {/* Main Details - HIGH DENSITY GRID (4 Columns) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 bg-[var(--bg-app)]/50 p-4 rounded-xl border border-[var(--border-subtle)]">
                    <ClientField 
                        label="Client / Company Name*" 
                        icon={<Building2 size={14}/>} 
                        value={editData.client_name} 
                        edit={isEditing} 
                        onChange={v => updateField('client_name', v)} 
                        error={errors.client_name}
                    />
                    <ClientField 
                        label="Company Website*" 
                        icon={<Globe size={14}/>} 
                        value={editData.website} 
                        edit={isEditing} 
                        onChange={v => updateField('website', v)} 
                        error={errors.website}
                    />
                    <ClientField 
                        label="Office Address" 
                        icon={<MapPin size={14}/>} 
                        value={editData.address} 
                        edit={isEditing} 
                        onChange={v => updateField('address', v)} 
                    />
                    <ClientField 
                        label="Fax Number" 
                        icon={<Printer size={14}/>} 
                        value={editData.fax_number} 
                        edit={isEditing} 
                        onChange={v => updateField('fax_number', v.replace(/[^\d+]/g, ''))} 
                        error={errors.fax_number}
                        maxLength={20}
                    />
                </div>

                {/* Contacts Section */}
                <div className="pt-1">
                    <div className="flex justify-between items-center mb-3">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                            Points of Contact
                        </p>
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={addContact}
                                className="flex items-center gap-1 text-[9px] font-bold text-[var(--brand-primary)] uppercase tracking-widest hover:opacity-80 active:scale-95 transition-all bg-[var(--brand-primary)]/10 px-2 py-1.5 rounded-lg outline-none"
                            >
                                <Plus size={12} /> Add Contact
                            </button>
                        )}
                    </div>

                    {/* Contacts List */}
                    <div className="space-y-3">
                        {editData.contacts?.length === 0 && !isEditing && (
                            <p className="text-xs text-[var(--text-muted)] italic px-2">No contacts registered.</p>
                        )}
                        
                        {editData.contacts?.map((contact, index) => (
                            <div key={index} className={`relative p-3 rounded-xl border border-[var(--border-subtle)] transition-colors duration-300 ${isEditing ? 'bg-[var(--bg-app)]/50' : 'bg-transparent'}`}>
                                
                                {/* Contact Header Controls */}
                                <div className="flex justify-between items-center mb-2 pb-2 border-b border-[var(--border-subtle)]">
                                    {isEditing ? (
                                        <button 
                                            type="button"
                                            onClick={() => setPrimaryContact(index)}
                                            className={`flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-widest px-2 py-1 rounded-md transition-all outline-none ${
                                                contact.is_primary 
                                                ? 'bg-yellow-500/10 text-yellow-500' 
                                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            <Star size={12} className={contact.is_primary ? "fill-yellow-500" : ""} />
                                            {contact.is_primary ? "Primary Contact" : "Make Primary"}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[9px] uppercase font-bold tracking-wider">
                                            {contact.is_primary ? (
                                                <span className="flex items-center gap-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-md">
                                                    <Star size={10} className="fill-yellow-500" /> Primary Contact
                                                </span>
                                            ) : (
                                                <span className="text-[var(--text-muted)] px-1">Additional Contact</span>
                                            )}
                                        </div>
                                    )}

                                    {isEditing && editData.contacts.length > 1 && (
                                        <button 
                                            type="button"
                                            onClick={() => removeContact(index)}
                                            className="text-[var(--text-muted)] hover:text-red-500 p-1 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest outline-none"
                                            title="Remove Contact"
                                        >
                                            <Trash2 size={12} /> Remove
                                        </button>
                                    )}
                                </div>

                                {/* Contact Fields Grid - HIGH DENSITY GRID (5 Columns) */}
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                    <ClientField 
                                        label="Contact Name*" 
                                        icon={<User size={14}/>}
                                        value={contact.contact_name} 
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_name', v)} 
                                        error={errors[`contact_${index}_contact_name`]}
                                    />
                                    
                                    <ClientField 
                                        label="Contact Title" 
                                        icon={<Briefcase size={14}/>}
                                        value={contact.contact_title} 
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_title', v)} 
                                    />
                                    
                                    <ClientSelectField 
                                        label="Contact Type*" 
                                        icon={<Briefcase size={14}/>}
                                        options={lookups.clientContactTypes || []}
                                        value={contact.contact_type_id}
                                        displayValue={contact.contact_type_name || lookups.clientContactTypes?.find(t => t.id === contact.contact_type_id)?.name}
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_type_id', v)} 
                                        error={errors[`contact_${index}_contact_type_id`]}
                                    />

                                    <ClientField 
                                        label="Contact Email*" 
                                        icon={<Mail size={14}/>}
                                        type="email"
                                        value={contact.contact_email} 
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_email', v)} 
                                        error={errors[`contact_${index}_contact_email`]}
                                        maxLength={null}
                                    />
                                    
                                    <ClientField 
                                        label="Contact Phone" 
                                        icon={<Phone size={14}/>}
                                        value={contact.contact_phone} 
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_phone', v.replace(/\D/g, ''))} 
                                        error={errors[`contact_${index}_contact_phone`]}
                                        maxLength={15}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </BaseModal>
    );
};

// Reusable Input Field (Handles View Mode & Edit Mode)
const ClientField = ({ label, icon, value, edit, onChange, type = "text", placeholder, error, maxLength = 50 }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">
            {label}
        </label>
        {edit ? (
            <>
                <input 
                    type={type}
                    placeholder={placeholder}
                    maxLength={type === "email" ? undefined : maxLength}
                    className={`w-full py-1.5 px-2 bg-[var(--input-bg)] text-[var(--input-text)] border rounded-lg text-xs font-bold outline-none transition-all placeholder:font-normal placeholder:text-[var(--text-muted)] ${
                        error 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500' 
                        : 'border-[var(--border-subtle)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'
                    }`}
                    value={value || ''} 
                    onChange={e => onChange && onChange(e.target.value)} 
                />
                {error && <p className="text-[9px] text-red-500 font-semibold ml-1 leading-tight">{error}</p>}
            </>
        ) : (
            <div className="flex items-center gap-1.5 px-1 py-1">
                <span className="text-[var(--text-muted)] shrink-0">{icon}</span>
                <p className="text-xs font-bold text-[var(--text-main)] truncate transition-colors duration-300">
                    {value || '---'}
                </p>
            </div>
        )}
    </div>
);

// Reusable Select Field (Handles View Mode & Edit Mode)
const ClientSelectField = ({ label, icon, value, displayValue, edit, onChange, options = [], error }) => (
    <div className="space-y-1">
        <label className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">
            {label}
        </label>
        {edit ? (
            <>
                <select 
                    className={`w-full py-1.5 px-2 bg-[var(--input-bg)] text-[var(--input-text)] border rounded-lg text-xs font-bold outline-none transition-all ${
                        error 
                        ? 'border-red-500 focus:ring-1 focus:ring-red-500 focus:border-red-500' 
                        : 'border-[var(--border-subtle)] focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]'
                    }`}
                    value={value || ''} 
                    onChange={e => onChange && onChange(e.target.value)}
                >
                    <option value="" disabled className="text-[var(--input-placeholder)]">Select...</option>
                    {options.map(opt => (
                        <option key={opt.id} value={opt.id}>{opt.name}</option>
                    ))}
                </select>
                {error && <p className="text-[9px] text-red-500 font-semibold ml-1 leading-tight">{error}</p>}
            </>
        ) : (
            <div className="flex items-center gap-1.5 px-1 py-1">
                <span className="text-[var(--text-muted)] shrink-0">{icon}</span>
                <p className="text-xs font-bold text-[var(--text-main)] truncate transition-colors duration-300">
                    {displayValue || '---'}
                </p>
            </div>
        )}
    </div>
);

export default ClientDetailModal;