import React, { useState, useEffect } from 'react';
import { Building, Globe, Plus, Mail } from 'lucide-react';
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
        } catch (err) { console.error("Client fetch error:", err); }
    };

    useEffect(() => { fetchClients(); }, []);

    return (
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
            {/* Header Section (High Density) */}
            <div className="bg-[var(--bg-surface)] px-6 py-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex justify-between items-center shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center text-[var(--brand-primary)] transition-colors">
                        <Building size={20} />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold uppercase tracking-tight text-[var(--text-main)] leading-none">
                            Client Directory
                        </h1>
                        <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest font-bold">
                            Manage your client list and contact details
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsClientModalOpen(true)}
                    className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-sm active:scale-95 shrink-0"
                >
                    <Plus size={16} /> <span className="hidden sm:inline">Add Client</span>
                </button>
            </div>

            {/* Client Data Table (High Density) */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden transition-colors duration-300">
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] sticky top-0 z-10 transition-colors duration-300">
                            <tr>
                                <th className="px-6 py-4 w-1/3">Organization</th>
                                <th className="px-6 py-4 w-1/3">Contact Details</th>
                                <th className="px-6 py-4">Platform</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[var(--border-subtle)]">
                            {clients.length > 0 ? clients.map((client, index) => {
                                const primaryContact = client.contacts?.find(c => c.is_primary === 1 || c.is_primary === true) || client.contacts?.[0] || {};

                                return (
                                    <tr key={client.id || index} className="hover:bg-[var(--bg-app)] transition-colors group">
                                        <td className="px-6 py-3.5 font-bold uppercase text-[var(--text-main)] tracking-tight truncate transition-colors duration-300">
                                            {client.client_name}
                                        </td>
                                        <td className="px-6 py-3.5 overflow-hidden">
                                            <p className="text-xs font-bold uppercase text-[var(--text-main)] leading-none mb-1 truncate transition-colors duration-300">
                                                {primaryContact.contact_name || 'N/A'}
                                            </p>
                                            {primaryContact.contact_email && (
                                                <div className="flex items-center gap-1 text-[var(--text-muted)] font-bold uppercase text-[9px] transition-colors duration-300 truncate">
                                                    <Mail size={10} className="shrink-0" /> {primaryContact.contact_email}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 overflow-hidden">
                                            {client.website ? (
                                                <a href={client.website} target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-main)] flex items-center gap-2 transition-colors italic truncate text-xs">
                                                    <Globe size={12} className="shrink-0" /> {client.website.replace(/^https?:\/\//, '')}
                                                </a>
                                            ) : (
                                                <span className="text-[var(--text-muted)] italic text-xs">---</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-3.5 text-right">
                                            <button
                                                onClick={() => setSelectedClient(client)}
                                                className="text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-app)] text-[var(--text-main)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-text)] hover:border-[var(--brand-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] transition-all active:scale-95 shadow-sm"
                                            >
                                                View Client
                                            </button>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="4" className="px-6 py-10 text-center text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">
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