import React, { useState } from 'react';
import { X, Building, Check, Loader2 } from 'lucide-react';
import api from '../../api/axios';

const RegisterOrgModal = ({ isOpen, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', admin_email: '', domain: '', address: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.post('/api/super-admin/create-org', formData);
            onRefresh();
            onClose();
            setFormData({ name: '', admin_email: '', domain: '', address: '' });
        } catch (err) {
            alert(err.response?.data?.message || "Registration failed.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
            {/* MODIFIED: w-[70vw] h-[90vh] with flex-col */}
            <div className="bg-[var(--bg-surface)] w-[70vw] h-[90vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col border border-[var(--border-subtle)] transition-colors duration-300">
                
                {/* Header */}
                <div className="p-6 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)] transition-colors duration-300">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center text-[var(--brand-primary-text)] shadow-sm transition-colors duration-300">
                            <Building size={20}/>
                        </div>
                        <h2 className="font-bold uppercase tracking-tighter text-[var(--text-main)] leading-none text-lg transition-colors duration-300">Register Tenant</h2>
                    </div>
                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors duration-300"><X size={20}/></button>
                </div>

                {/* Body Area: Added flex-1 overflow-y-auto to scroll form content */}
                <form onSubmit={handleSubmit} className="p-8 space-y-6 flex-1 overflow-y-auto flex flex-col">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">Organization Name</label>
                            <input 
                                required 
                                className="w-full p-4 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--brand-primary)]/50 rounded-2xl text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] transition-all placeholder:text-[var(--input-placeholder)]"
                                placeholder="e.g. Acme Corp" 
                                value={formData.name} 
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                            />
                        </div>
                        
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">Admin Email</label>
                            <input 
                                type="email" 
                                required 
                                className="w-full p-4 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--brand-primary)]/50 rounded-2xl text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] transition-all placeholder:text-[var(--input-placeholder)]"
                                placeholder="admin@org.com" 
                                value={formData.admin_email} 
                                onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })} 
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">Custom Domain</label>
                            <input 
                                className="w-full p-4 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--brand-primary)]/50 rounded-2xl text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] transition-all placeholder:text-[var(--input-placeholder)]"
                                placeholder="acme.com" 
                                value={formData.domain} 
                                onChange={(e) => setFormData({ ...formData, domain: e.target.value })} 
                            />
                        </div>

                        <div className="col-span-2 space-y-1">
                            <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">Physical Address</label>
                            <textarea 
                                className="w-full p-4 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--brand-primary)]/50 rounded-2xl text-sm outline-none focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] transition-all h-24 resize-none placeholder:text-[var(--input-placeholder)]"
                                placeholder="Headquarters address..." 
                                value={formData.address} 
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                            />
                        </div>
                    </div>

                    {/* MODIFIED: Added mt-auto to anchor the button at the bottom of the container */}
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="mt-auto w-full bg-[var(--brand-primary)] text-[var(--brand-primary-text)] py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-90 active:scale-95 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : <><Check size={18} /> Complete Registration</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default RegisterOrgModal;