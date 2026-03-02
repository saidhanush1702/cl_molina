import React, { useState, useEffect } from 'react';
import { Building2, Plus, Shield, Trash2, Lock, Unlock, Mail } from 'lucide-react';
import { managementAPI } from '../../../api/apiService';
import AddHRModal from './AddHRModal';

const Organisation = () => {
    const [team, setTeam] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    
    // Check role to determine if they can add/delete users
    const userRole = localStorage.getItem('userRole');
    const isOrgAdmin = userRole === 'ORG_ADMIN';

    const fetchTeam = async () => {
        try {
            const res = await managementAPI.getHRs();
            setTeam(res.data);
        } catch (err) { 
            console.error("Team fetch error:", err); 
        }
    };

    useEffect(() => { 
        fetchTeam(); 
    }, []);

    const handleToggleAccess = async (id, currentStatus) => {
        const newStatus = !currentStatus;
        if (window.confirm(`Are you sure you want to ${newStatus ? 'restore' : 'suspend'} this user's access?`)) {
            try {
                await managementAPI.toggleHRAccess(id, { is_active: newStatus });
                fetchTeam();
            } catch (err) { 
                alert(err.response?.data?.message || "Failed to toggle access."); 
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this HR account permanently?")) {
            try {
                await managementAPI.deleteHR(id);
                fetchTeam();
            } catch (err) { 
                alert(err.response?.data?.message || "Failed to delete account."); 
            }
        }
    };

    // STRICT ROLE CHECK: Only show HRs and Admins on the Organisation page
    const filteredTeam = team.filter(member => member.role === 'HR' || member.role === 'ORG_ADMIN');

    return (
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
            {/* Header */}
            <div className="bg-[var(--bg-surface)] px-6 py-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex justify-between items-center shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center text-[var(--brand-primary)] transition-colors">
                        <Building2 size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold uppercase tracking-tight text-[var(--text-main)] leading-none">
                            Organisation Team
                        </h1>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest font-bold">
                            Manage Internal Administrators and HRs
                        </p>
                    </div>
                </div>

                {isOrgAdmin && (
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm active:scale-95 shrink-0"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Add HR User</span>
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden transition-colors duration-300">
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] sticky top-0 z-10 transition-colors duration-300">
                            <tr>
                                <th className="px-6 py-4 w-[40%]">User Profile</th>
                                <th className="px-6 py-4 w-[20%]">Role</th>
                                <th className="px-6 py-4 w-[20%]">Status</th>
                                <th className="px-6 py-4 w-[20%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[var(--border-subtle)]">
                            {filteredTeam.length > 0 ? filteredTeam.map((member) => (
                                <tr key={member.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                                    <td className="px-6 py-3.5 overflow-hidden">
                                        <div className="flex items-center gap-3">
                                            <div className="h-9 w-9 shrink-0 rounded-full bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
                                                <Shield size={16} />
                                            </div>
                                            <div className="truncate">
                                                <p className="font-bold text-[var(--text-main)] truncate text-sm">
                                                    {member.email}
                                                </p>
                                                <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-0.5 truncate flex items-center gap-1">
                                                    <Mail size={10} /> Registered User
                                                </p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className="px-2.5 py-1 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded uppercase text-[10px] font-bold tracking-widest border border-[var(--brand-primary)]/20">
                                            {member.role?.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5">
                                        <span className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-widest border ${
                                            member.is_active 
                                            ? 'bg-green-500/10 text-green-500 border-green-500/20' 
                                            : 'bg-orange-500/10 text-orange-500 border-orange-500/20'
                                        }`}>
                                            {member.is_active ? 'Active' : 'Suspended'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3.5 text-right">
                                        {isOrgAdmin ? (
                                            <div className="flex justify-end gap-2">
                                                <button 
                                                    onClick={() => handleToggleAccess(member.id, member.is_active)}
                                                    className={`p-1.5 rounded-lg border transition-all ${member.is_active ? 'text-orange-500 hover:bg-orange-500/10 border-transparent hover:border-orange-500/20' : 'text-green-500 hover:bg-green-500/10 border-transparent hover:border-green-500/20'}`}
                                                    title={member.is_active ? "Suspend Access" : "Restore Access"}
                                                >
                                                    {member.is_active ? <Lock size={14} /> : <Unlock size={14} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(member.id)}
                                                    className="p-1.5 text-[var(--text-muted)] hover:text-red-500 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20 transition-all"
                                                    title="Delete User"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="text-[10px] text-[var(--text-muted)] italic font-bold tracking-widest uppercase">
                                                View Only
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">
                                        No team members found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddHRModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={fetchTeam} />
        </div>
    );
};

export default Organisation;