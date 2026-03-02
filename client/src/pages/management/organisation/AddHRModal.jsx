import React, { useState } from 'react';
import { Shield, Check, Mail, Key, Loader2, RefreshCw } from 'lucide-react';
import BaseModal from '../../../components/ui/BaseModal';
import { managementAPI } from '../../../api/apiService';

const AddHRModal = ({ isOpen, onClose, onRefresh }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });

    const generatePassword = () => {
        const pass = Math.random().toString(36).slice(-10) + "!" + Math.floor(Math.random() * 10);
        setFormData(prev => ({ ...prev, password: pass }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await managementAPI.createHR(formData);
            onRefresh();
            onClose();
            setFormData({ email: '', password: '' });
        } catch (err) {
            alert(err.response?.data?.message || "Error creating HR account.");
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const modalFooter = (
        <div className="w-full flex justify-end">
            <button 
                type="submit" 
                form="addHRForm"
                disabled={loading} 
                className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-8 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:opacity-90 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none active:scale-95 transition-all disabled:opacity-50"
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : <><Check size={16}/> Create Account</>}
            </button>
        </div>
    );

    return (
        <BaseModal
            isOpen={isOpen}
            onClose={onClose}
            icon={<Shield size={16} />}
            title="Register HR Representative"
            subtitle="Grant platform access to a new team member"
            footer={modalFooter}
        >
            <form id="addHRForm" onSubmit={handleSubmit} className="space-y-6 max-w-lg mx-auto py-4">
                
                <div className="space-y-1">
                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 transition-colors duration-300">
                        Professional Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
                            <Mail size={14} />
                        </div>
                        <input 
                            type="email" 
                            required 
                            placeholder="hr.member@company.com"
                            className="w-full pl-9 pr-3 py-3 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--input-placeholder)]"
                            value={formData.email} 
                            onChange={e => setFormData({ ...formData, email: e.target.value })} 
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between items-center ml-1">
                        <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors duration-300">
                            Temporary Password <span className="text-red-500">*</span>
                        </label>
                        <button 
                            type="button" 
                            onClick={generatePassword} 
                            className="text-[10px] font-bold text-[var(--brand-primary)] flex items-center gap-1 hover:opacity-80 transition-opacity outline-none uppercase tracking-widest"
                        >
                            <RefreshCw size={10}/> Auto-Generate
                        </button>
                    </div>
                    <div className="relative group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
                            <Key size={14} />
                        </div>
                        <input 
                            type="text" 
                            required 
                            placeholder="Set an initial password..."
                            className="w-full pl-9 pr-3 py-3 bg-[var(--input-bg)] text-[var(--input-text)] border border-[var(--border-subtle)] focus:border-[var(--brand-primary)] rounded-xl text-sm focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--input-placeholder)]"
                            value={formData.password} 
                            onChange={e => setFormData({ ...formData, password: e.target.value })} 
                        />
                    </div>
                    <p className="text-[9px] text-[var(--text-muted)] italic font-bold px-1 mt-1 uppercase tracking-wider">
                        An email will be sent automatically with these login credentials.
                    </p>
                </div>

            </form>
        </BaseModal>
    );
};

export default AddHRModal;