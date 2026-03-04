import React, { useState } from 'react';
import { Building, Globe, User, Mail, Phone, Check, Plus, Trash2, Star, Briefcase } from 'lucide-react';
import api from '../../../api/axios';
import BaseModal from '../../../components/ui/BaseModal';

// Defined list of standard contact titles
const CONTACT_TITLES = ['HR', 'Accounts Payable', 'Timesheets receivable', 'Manager' , 'Contracts Team'];

const AddClientModal = ({ isOpen, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    
    // Initial state setup with an array for contacts including contact_title
    const initialFormState = {
        client_name: '', 
        website: '', 
        contacts: [
            { contact_name: '', contact_title: '', contact_email: '', contact_phone: '', is_primary: true }
        ]
    };
    const [formData, setFormData] = useState(initialFormState);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/management/clients', formData);
            onRefresh();
            onClose();
            setFormData(initialFormState);
        } catch (err) {
            alert(err.response?.data?.message || "Error registering client");
        } finally { setLoading(false); }
    };

    const handleContactChange = (index, field, value) => {
        const updatedContacts = [...formData.contacts];
        updatedContacts[index][field] = value;
        setFormData({ ...formData, contacts: updatedContacts });
    };

    const addContact = () => {
        setFormData({
            ...formData,
            contacts: [
                ...formData.contacts, 
                { contact_name: '', contact_title: '', contact_email: '', contact_phone: '', is_primary: false }
            ]
        });
    };

    const removeContact = (index) => {
        if (formData.contacts.length === 1) return; // Must have at least one contact
        
        const updatedContacts = [...formData.contacts];
        const removedWasPrimary = updatedContacts[index].is_primary;
        
        updatedContacts.splice(index, 1);
        
        // If the removed contact was the primary one, assign primary to the first remaining contact
        if (removedWasPrimary && updatedContacts.length > 0) {
            updatedContacts[0].is_primary = true;
        }
        
        setFormData({ ...formData, contacts: updatedContacts });
    };

    const setPrimaryContact = (index) => {
        const updatedContacts = formData.contacts.map((c, i) => ({
            ...c,
            is_primary: i === index
        }));
        setFormData({ ...formData, contacts: updatedContacts });
    };

    if (!isOpen) return null;

    // --- DEFINE FOOTER BUTTON ---
    const modalFooter = (
        <div className="w-full flex justify-end">
            <button 
                type="submit" 
                form="addClientForm" // Matches the ID of the form inside the body
                disabled={loading} 
                className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-90 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? 'Registering...' : <><Check size={16}/> Save Client</>}
            </button>
        </div>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            icon={<Building size={16} />}
            title="Register Client"
            subtitle="Add a new company and their contacts"
            headerRight={`${formData.contacts.length} Contact${formData.contacts.length !== 1 ? 's' : ''}`}
            footer={modalFooter}
        >
            <form id="addClientForm" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Company Details */}
                <div className="grid grid-cols-2 gap-6">
                    <Input 
                        label="Client / Company Name" 
                        icon={<Building size={14}/>} 
                        value={formData.client_name} 
                        onChange={v => setFormData({...formData, client_name: v})} 
                        required 
                    />
                    <Input 
                        label="Company Website" 
                        icon={<Globe size={14}/>} 
                        placeholder="https://..." 
                        value={formData.website} 
                        onChange={v => setFormData({...formData, website: v})} 
                        required 
                    />
                </div>
                
                {/* Contacts Section */}
                <div className="pt-2 border-t border-[var(--border-subtle)] transition-colors duration-300">
                    <div className="flex justify-between items-center mb-4 mt-2">
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-300">
                            Points of Contact
                        </p>
                        <button 
                            type="button" 
                            onClick={addContact}
                            className="flex items-center gap-1.5 text-xs font-bold text-[var(--brand-primary)] hover:opacity-80 active:scale-95 transition-all bg-[var(--brand-primary)]/10 px-3 py-1.5 rounded-lg"
                        >
                            <Plus size={14} /> Add Contact
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.contacts.map((contact, index) => (
                            <div key={index} className="relative p-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-app)]/50 transition-colors duration-300">
                                
                                {/* Contact Header Controls */}
                                <div className="flex justify-between items-center mb-4 pb-3 border-b border-[var(--border-subtle)]">
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

                                    {formData.contacts.length > 1 && (
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

                                {/* Contact Inputs */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                    <Input 
                                        label="Contact Name" 
                                        icon={<User size={14}/>} 
                                        value={contact.contact_name} 
                                        onChange={v => handleContactChange(index, 'contact_name', v)} 
                                        required
                                    />
                                    
                                    {/* NEW: Contact Title Dropdown */}
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">
                                            Contact Title <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative group">
                                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors pointer-events-none">
                                                <Briefcase size={14}/>
                                            </div>
                                            <select
                                                required
                                                className="w-full pl-9 pr-3 py-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all appearance-none cursor-pointer"
                                                value={contact.contact_title}
                                                onChange={e => handleContactChange(index, 'contact_title', e.target.value)}
                                            >
                                                <option value="" disabled>Select Title...</option>
                                                {CONTACT_TITLES.map(title => (
                                                    <option key={title} value={title}>{title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <Input 
                                        label="Contact Email" 
                                        icon={<Mail size={14}/>} 
                                        type="email"
                                        value={contact.contact_email} 
                                        onChange={v => handleContactChange(index, 'contact_email', v)} 
                                        required
                                    />
                                    <Input 
                                        label="Contact Phone" 
                                        icon={<Phone size={14}/>} 
                                        value={contact.contact_phone} 
                                        onChange={v => handleContactChange(index, 'contact_phone', v)} 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </form>
        </BaseModal>
    );
};

// Reusable Input Component
const Input = ({ label, icon, value, onChange, placeholder, type="text", required=false }) => (
    <div className="space-y-1">
        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative group">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
                {icon}
            </div>
            <input 
                type={type} 
                placeholder={placeholder}
                required={required}
                className="w-full pl-9 pr-3 py-2.5 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--input-placeholder)]"
                value={value} 
                onChange={e => onChange(e.target.value)} 
            />
        </div>
    </div>
);

export default AddClientModal;