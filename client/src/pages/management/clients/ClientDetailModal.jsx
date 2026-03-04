import React, { useState, useEffect } from 'react';
import { Save, Edit3, Trash2, Building2, Plus, Star, User, Mail, Phone, Globe, Briefcase } from 'lucide-react';
import api from '../../../api/axios';
import BaseModal from '../../../components/ui/BaseModal';

const CONTACT_TITLES = ['HR', 'Accounts Payable', 'Timesheets receivable', 'Manager', 'Contracts Team'];

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
    }, [client]);

    const handleSave = async () => {
        try {
            await api.put(`/api/management/clients/${client.id}`, editData);
            setIsEditing(false);
            onRefresh();
            onClose();
        } catch (err) { alert(err.response?.data?.message || "Update failed"); }
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

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...editData.contacts];
        updatedContacts[index][field] = value;
        setEditData({ ...editData, contacts: updatedContacts });
    };

    const addContact = () => {
        setEditData({
            ...editData,
            contacts: [
                ...editData.contacts, 
                { contact_name: '', contact_title: '', contact_email: '', contact_phone: '', is_primary: editData.contacts.length === 0 }
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
            ...c,
            is_primary: i === index
        }));
        setEditData({ ...editData, contacts: updatedContacts });
    };

    if (!client) return null;

    // --- DEFINE FOOTER BUTTONS ---
    const modalFooter = (
        <div className="flex justify-between items-center w-full">
            {/* Left Side: Delete Action */}
            {userRole === 'ORG_ADMIN' ? (
                <button onClick={handleDelete} className="flex items-center gap-2 text-[var(--text-muted)] hover:text-red-500 transition-all text-[10px] font-bold uppercase px-4 py-2 rounded-xl">
                    <Trash2 size={16} /> Delete Client
                </button>
            ) : <div></div>}
            
            {/* Right Side: Edit/Save Actions */}
            <div className="flex gap-3">
                {!isEditing ? (
                    <button onClick={() => setIsEditing(true)} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:opacity-90 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none active:scale-95 transition-all">
                        <Edit3 size={16} /> Edit Profile
                    </button>
                ) : (
                    <>
                        <button 
                            onClick={() => {
                                setIsEditing(false);
                                setEditData({ 
                                    ...client,
                                    contacts: getSafeContacts(client?.contacts) 
                                });
                            }} 
                            className="px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                        >
                            Cancel
                        </button>
                        <button onClick={handleSave} className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-lg hover:opacity-90 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none active:scale-95 transition-all">
                            <Save size={16} /> Save Changes
                        </button>
                    </>
                )}
            </div>
        </div>
    );

    return (
        <BaseModal
            isOpen={true} // Controlled by parent
            onClose={onClose}
            icon={<Building2 size={16} />}
            title="Client Master File"
            subtitle="View and edit client details and contacts"
            footer={modalFooter}
        >
            <div className="space-y-8">
                
                {/* Main Details */}
                <div className="grid grid-cols-2 gap-6 bg-[var(--bg-app)]/50 p-5 rounded-2xl border border-[var(--border-subtle)]">
                    <ClientField label="Client / Company Name" icon={<Building2 size={14}/>} value={editData.client_name} edit={isEditing} onChange={v => setEditData({...editData, client_name: v})} />
                    <ClientField label="Website" icon={<Globe size={14}/>} value={editData.website} edit={isEditing} onChange={v => setEditData({...editData, website: v})} />
                </div>

                {/* Contacts Section */}
                <div className="pt-2">
                    <div className="flex justify-between items-center mb-4">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                            Points of Contact
                        </p>
                        {isEditing && (
                            <button 
                                type="button" 
                                onClick={addContact}
                                className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 active:scale-95 transition-all bg-[var(--brand-primary)]/10 px-3 py-1.5 rounded-lg"
                            >
                                <Plus size={14} /> Add Contact
                            </button>
                        )}
                    </div>

                    {/* Contacts List */}
                    <div className="space-y-4">
                        {editData.contacts?.length === 0 && !isEditing && (
                            <p className="text-xs text-[var(--text-muted)] italic px-2">No contacts registered.</p>
                        )}
                        
                        {editData.contacts?.map((contact, index) => (
                            <div key={index} className="relative p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)]/30 transition-colors duration-300">
                                
                                {/* Contact Header Controls */}
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
                                    {isEditing ? (
                                        <button 
                                            type="button"
                                            onClick={() => setPrimaryContact(index)}
                                            className={`flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider px-2 py-1.5 rounded-md transition-all ${
                                                contact.is_primary 
                                                ? 'bg-yellow-500/20 text-yellow-500' 
                                                : 'text-[var(--text-muted)] hover:bg-[var(--bg-surface)] hover:text-[var(--text-main)]'
                                            }`}
                                        >
                                            <Star size={14} className={contact.is_primary ? "fill-yellow-500" : ""} />
                                            {contact.is_primary ? "Primary Contact" : "Make Primary"}
                                        </button>
                                    ) : (
                                        <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider">
                                            {contact.is_primary ? (
                                                <span className="flex items-center gap-1.5 text-yellow-500 bg-yellow-500/10 px-3 py-1.5 rounded-md">
                                                    <Star size={12} className="fill-yellow-500" /> Primary Contact
                                                </span>
                                            ) : (
                                                <span className="text-[var(--text-muted)] px-2">Additional Contact</span>
                                            )}
                                        </div>
                                    )}

                                    {isEditing && (
                                        <button 
                                            type="button"
                                            onClick={() => removeContact(index)}
                                            className="text-red-500 hover:text-red-400 p-1.5 hover:bg-red-500/10 rounded-md transition-colors flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest"
                                            title="Remove Contact"
                                        >
                                            <Trash2 size={14} /> Remove
                                        </button>
                                    )}
                                </div>

                                {/* Fields */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                                    <ClientField 
                                        label="Contact Name" 
                                        icon={<User size={14}/>}
                                        value={contact.contact_name} 
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_name', v)} 
                                    />
                                    
                                    {/* Contact Title Field */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">
                                            Contact Title
                                        </label>
                                        {isEditing ? (
                                            <div className="relative group">
                                                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors pointer-events-none">
                                                    <Briefcase size={14}/>
                                                </div>
                                                <select
                                                    className="w-full pl-9 pr-3 py-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all appearance-none cursor-pointer"
                                                    value={contact.contact_title || ''}
                                                    onChange={e => handleContactChange(index, 'contact_title', e.target.value)}
                                                >
                                                    <option value="" disabled>Select Title...</option>
                                                    {CONTACT_TITLES.map(title => (
                                                        <option key={title} value={title}>{title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 px-1 py-1.5">
                                                <span className="text-[var(--text-muted)]"><Briefcase size={14}/></span>
                                                <p className="text-sm font-bold text-[var(--text-main)] truncate transition-colors duration-300">
                                                    {contact.contact_title || '---'}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <ClientField 
                                        label="Contact Email" 
                                        icon={<Mail size={14}/>}
                                        value={contact.contact_email} 
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_email', v)} 
                                    />
                                    <ClientField 
                                        label="Contact Phone" 
                                        icon={<Phone size={14}/>}
                                        value={contact.contact_phone} 
                                        edit={isEditing} 
                                        onChange={v => handleContactChange(index, 'contact_phone', v)} 
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

// Reusable Client Field 
const ClientField = ({ label, icon, value, edit, onChange }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">
            {label}
        </label>
        {edit ? (
            <div className="relative group">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
                    {icon}
                </div>
                <input 
                    className="w-full pl-9 pr-3 py-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm outline-none focus:ring-2 focus:ring-[var(--brand-primary)] transition-all" 
                    value={value || ''} 
                    onChange={e => onChange(e.target.value)} 
                />
            </div>
        ) : (
            <div className="flex items-center gap-2 px-1 py-1.5">
                <span className="text-[var(--text-muted)]">{icon}</span>
                <p className="text-sm font-bold text-[var(--text-main)] truncate transition-colors duration-300">
                    {value || '---'}
                </p>
            </div>
        )}
    </div>
);

export default ClientDetailModal;