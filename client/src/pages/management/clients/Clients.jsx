import React, { useState, useEffect } from 'react';
import { Building, Globe, UserPlus, Mail, Eye } from 'lucide-react';
import { managementAPI } from '../../../api/apiService';
import AddClientModal from './AddClientModal';
import ClientDetailModal from './ClientDetailModal';

const Clients = () => {
    const [clients, setClients] = useState([]);
    const [isClientModalOpen, setIsClientModalOpen] = useState(false);
    const [selectedClient, setSelectedClient] = useState(null);

    const fetchClients = async () => {
        try {
            const res = await managementAPI.getClients();
            setClients(res.data);
        } catch (err) { 
            console.error("Client fetch error:", err); 
        }
    };

    useEffect(() => { 
        fetchClients(); 
    }, []);

    return (
        <div className="max-w-7xl -mt-3 -mx-3 flex flex-col h-[calc(100vh-6rem)] sm:h-[calc(100vh-8rem)] gap-2 animate-in fade-in duration-500">
            
            {/* Header Section (Responsive High Density) */}
            <div className="bg-[var(--bg-surface)] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex justify-between items-center shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-2 min-w-0">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center text-[var(--brand-primary)] transition-colors shrink-0">
                        <Building size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight text-[var(--text-main)] leading-none truncate">
                            Client Directory
                        </h1>
                        <p className="hidden sm:block text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest font-bold truncate">
                            Manage your client list and contact details
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] w-9 h-9 sm:w-auto sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 shrink-0 outline-none"
                    title="Add Client"
                >
                    <UserPlus size={16} /> <span className="hidden sm:inline">Add Client</span>
                </button>
            </div>

            {/* Client Data Table */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden transition-colors duration-300">
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-[var(--bg-app)] text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] sticky top-0 z-10 transition-colors duration-300">
                            <tr>
                                {/* RESPONSIVE WIDTHS  
                                    Mobile: Org(50%) + Contact(35%) + Action(15%) (Platform hidden)
                                    Desktop: Distributed for 4 columns
                                */}
                                <th className="px-4 sm:px-6 py-3 sm:py-4 w-[50%] sm:w-[35%]">Organization</th>
                                <th className="px-2 sm:px-6 py-3 sm:py-4 w-[35%] sm:w-[30%]">Contact Details</th>
                                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 sm:w-[20%]">Platform</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 w-[15%] sm:w-[15%] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[var(--border-subtle)]">
                            {clients.length > 0 ? clients.map((client, index) => {
                                const primaryContact = client.contacts?.find(c => c.is_primary === 1 || c.is_primary === true) || client.contacts?.[0] || {};

                                return (
                                    <tr key={client.id || index} className="hover:bg-[var(--bg-app)] transition-colors group">
                                        
                                        {/* Column 1: Organization & Avatar */}
                                        <td className="px-4 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
                                            <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                                                <div className="relative shrink-0">
                                                    <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase shadow-sm">
                                                        {client.client_name?.[0] || '?'}
                                                    </div>
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-xs sm:text-sm font-bold uppercase tracking-tight leading-none truncate transition-colors text-[var(--text-main)]">
                                                        {client.client_name}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Column 2: Contact Name & Email */}
                                        <td className="px-2 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
                                            <div className="min-w-0">
                                                <p className="text-[11px] sm:text-xs font-bold text-[var(--text-main)] uppercase tracking-tight truncate">
                                                    {primaryContact.contact_name || 'N/A'}
                                                </p>
                                                {primaryContact.contact_email ? (
                                                    <div className="flex items-center gap-1 sm:gap-1.5 text-[9px] sm:text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider mt-1 truncate">
                                                        <Mail size={10} className="shrink-0" /> 
                                                        <span className="truncate">{primaryContact.contact_email}</span>
                                                    </div>
                                                ) : (
                                                    <p className="text-[9px] sm:text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider mt-1 truncate">
                                                        ---
                                                    </p>
                                                )}
                                            </div>
                                        </td>

                                        {/* Column 3: Platform / Website (Hidden on Mobile) */}
                                        <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
                                            {client.website ? (
                                                <a 
                                                    href={client.website.startsWith('http') ? client.website : `https://${client.website}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider hover:text-[var(--brand-primary)] transition-colors truncate"
                                                >
                                                    <Globe size={12} className="shrink-0" /> 
                                                    <span className="truncate">{client.website.replace(/^https?:\/\//, '')}</span>
                                                </a>
                                            ) : (
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-wider">---</span>
                                            )}
                                        </td>

                                        {/* Column 4: Actions */}
                                        <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedClient(client)}
                                                title="View Client"
                                                className="inline-flex items-center justify-center p-2 sm:px-3 sm:py-1.5 text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-text)] hover:border-[var(--brand-primary)] rounded-lg border border-[var(--border-subtle)] transition-all active:scale-95 shadow-sm outline-none"
                                            >
                                                {/* Hidden on Mobile, Shown on Desktop */}
                                                <span className="hidden sm:inline">View</span>
                                                {/* Shown on Mobile, Hidden on Desktop */}
                                                <Eye size={14} className="sm:hidden" />
                                            </button>
                                        </td>

                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className="px-4 sm:px-6 py-12 text-center text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
                                        No clients found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <AddClientModal isOpen={isClientModalOpen} onClose={() => setIsClientModalOpen(false)} onRefresh={fetchClients} />
            {selectedClient && <ClientDetailModal client={selectedClient} onClose={() => setSelectedClient(null)} onRefresh={fetchClients} />}
        </div>
    );
};

export default Clients;