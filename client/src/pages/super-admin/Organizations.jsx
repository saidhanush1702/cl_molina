import React, { useState, useEffect } from 'react';
import { Building2, Plus, Mail, Globe, Power, PowerOff } from 'lucide-react';
import api from '../../api/axios';
import { superAdminAPI } from '../../api/apiService';
import RegisterOrgModal from './RegisterOrgModal';

const Organizations = () => {
    const [orgs, setOrgs] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchOrgs = async () => {
        try {
            // Using the centralized API file
            const res = await superAdminAPI.getOrganizations();
            setOrgs(res.data);
        } catch (err) {
            console.error("Failed to fetch organizations", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchOrgs(); }, []);

    const handleToggleStatus = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'deactivate' : 'activate'} this organization?`)) return;
        try {
            // Using the centralized API file
            await superAdminAPI.toggleOrganizationStatus(id, currentStatus);
            fetchOrgs();
        } catch (err) {
            alert("Failed to update organization status.");
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            
            <div className="flex justify-between items-center bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-subtle)] shadow-sm transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight italic flex items-center gap-3 text-[var(--text-main)] transition-colors duration-300">
                        <Building2 size={28} /> Organization Directory
                    </h1>
                    <p className="text-sm text-[var(--text-muted)] mt-1 uppercase tracking-widest font-medium transition-colors duration-300">
                        Global Tenant Management & Infrastructure
                    </p>
                </div>
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-8 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                >
                    <Plus size={16} /> Register New Org
                </button>
            </div>

            
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
                <table className="w-full text-left">
                    <thead className="bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] transition-colors duration-300">
                        <tr>
                            <th className="px-8 py-5">Organization & Domain</th>
                            <th className="px-8 py-5">Primary Admin</th>
                            <th className="px-8 py-5">Status</th>
                            <th className="px-8 py-5 text-right">Service Control</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[var(--border-subtle)]">
                        {orgs.map(org => (
                            <tr key={org.id} className={`hover:bg-[var(--bg-app)] transition-colors duration-300 ${!org.is_active ? 'opacity-60' : ''}`}>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center transition-colors duration-300">
                                            <Building2 size={20} className="text-[var(--text-muted)] transition-colors duration-300" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-[var(--text-main)] uppercase tracking-tight transition-colors duration-300">{org.name}</p>
                                            <div className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] font-bold uppercase transition-colors duration-300">
                                                <Globe size={10} /> {org.domain || 'no-domain.com'}
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-2 text-[var(--text-muted)] transition-colors duration-300">
                                        <Mail size={14} />
                                        <span className="font-medium text-xs">{org.admin_email}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border transition-colors duration-300 ${
                                        org.is_active 
                                        ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                        : 'bg-[var(--bg-app)] text-[var(--text-muted)] border-[var(--border-subtle)]'
                                    }`}>
                                        {org.is_active ? 'Active' : 'Suspended'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button 
                                        onClick={() => handleToggleStatus(org.id, org.is_active)}
                                        className={`p-2 rounded-lg transition-all ${
                                            org.is_active 
                                            ? 'text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10' 
                                            : 'text-[var(--text-muted)] hover:text-green-500 hover:bg-green-500/10'
                                        }`}
                                        title={org.is_active ? "Deactivate Organization" : "Activate Organization"}
                                    >
                                        {org.is_active ? <Power size={20} /> : <PowerOff size={20} />}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <RegisterOrgModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onRefresh={fetchOrgs} 
            />
        </div>
    );
};

export default Organizations;