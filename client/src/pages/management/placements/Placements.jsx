import React, { useState, useEffect } from 'react';
import { Briefcase, Search, Plus, Filter } from 'lucide-react';
import api from '../../../api/axios';
import AddPlacementModal from './AddPlacementModal';
import PlacementDetailModal from './PlacementDetailModal';

const Placements = () => {
    const [placements, setPlacements] = useState([]);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedPlacement, setSelectedPlacement] = useState(null); 
    
    // Filters state
    const [filterStatus, setFilterStatus] = useState('ALL'); 
    const [filterType, setFilterType] = useState('ALL'); 
    const [filterPayType, setFilterPayType] = useState('ALL'); // NEW: Pay Type Filter
    const [searchQuery, setSearchQuery] = useState('');

    const fetchPlacements = async () => {
        try {
            const res = await api.get('/api/management/placements');
            setPlacements(res.data);
        } catch (err) { console.error("Placements fetch error:", err); }
    };

    useEffect(() => {
        fetchPlacements();
    }, []);

    // Filter Logic
    const filteredPlacements = placements.filter(p => {
        // 1. Status Filter
        if (filterStatus === 'ACTIVE' && p.status !== 'Active') return false;
        if (filterStatus === 'COMPLETED' && p.status !== 'Completed') return false;

        // 2. Placement Type Filter
        if (filterType !== 'ALL' && p.placement_type !== filterType) return false;

        // 3. Pay Type Filter (W2, 1099, C2C)
        if (filterPayType !== 'ALL' && p.pay_type !== filterPayType) return false;

        // 4. Search Query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const searchString = `${p.first_name} ${p.last_name} ${p.client_name} ${p.job_title} ${p.placement_type} ${p.pay_type}`.toLowerCase();
            if (!searchString.includes(query)) return false;
        }
        return true;
    });

    return (
        <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500">

            <div className="flex justify-between items-center bg-[var(--bg-surface)] p-8 rounded-2xl border border-[var(--border-subtle)] shadow-sm transition-colors duration-300">
                <div>
                    <h1 className="text-2xl font-bold uppercase tracking-tight italic flex items-center gap-3 text-[var(--text-main)] transition-colors duration-300">
                        <Briefcase size={28} /> Placements & Assignments
                    </h1>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest font-bold transition-colors duration-300">
                        Manage employee jobs, billing rates, and client links
                    </p>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center gap-2 shadow-lg active:scale-95"
                    >
                        <Plus size={16} /> New Placement
                    </button>
                </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-[var(--bg-surface)] p-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm transition-colors duration-300">
                
                {/* Status Tabs */}
                <div className="flex p-1 bg-[var(--bg-app)] rounded-xl border border-[var(--border-subtle)] w-full md:w-auto shrink-0">
                    {['ALL', 'ACTIVE', 'COMPLETED'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilterStatus(tab)}
                            className={`flex-1 md:flex-none px-6 py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                                filterStatus === tab 
                                ? 'bg-[var(--bg-surface)] text-[var(--brand-primary)] shadow-sm' 
                                : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex flex-1 justify-end gap-3 w-full md:w-auto flex-wrap">
                    
                    {/* Pay Type Dropdown Filter */}
                    <div className="relative group shrink-0">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors pointer-events-none">
                            <Filter size={14} />
                        </div>
                        <select 
                            value={filterPayType}
                            onChange={(e) => setFilterPayType(e.target.value)}
                            className="w-full md:w-40 pl-9 pr-8 py-2.5 bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Pay Types</option>
                            <option value="W2">W2</option>
                            <option value="1099">1099</option>
                            <option value="C2C">C2C</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>

                    {/* Placement Type Dropdown Filter */}
                    <div className="relative group shrink-0">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors pointer-events-none">
                            <Filter size={14} />
                        </div>
                        <select 
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="w-full md:w-40 pl-9 pr-8 py-2.5 bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all appearance-none cursor-pointer"
                        >
                            <option value="ALL">All Placements</option>
                            <option value="Primary">Primary</option>
                            <option value="Secondary">Secondary</option>
                        </select>
                        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" /></svg>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-64 group">
                        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
                            <Search size={16} />
                        </div>
                        <input 
                            type="text" 
                            placeholder="Search records..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-[var(--bg-app)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-xl text-xs font-bold focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] placeholder:font-normal"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm overflow-hidden min-h-[400px] transition-colors duration-300">
                <table className="w-full text-left table-fixed">
                    <thead className="bg-[var(--bg-app)] text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] transition-colors duration-300">
                        <tr>
                            <th className="px-6 py-5 w-1/4">Employee & Role</th>
                            <th className="px-6 py-5 w-1/4">Client Details</th>
                            <th className="px-6 py-5 w-1/4">Financials</th>
                            <th className="px-6 py-5 w-1/6">Duration</th>
                            <th className="px-6 py-5 text-right w-1/6">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-[var(--border-subtle)]">
                        {filteredPlacements.length > 0 ? (
                            filteredPlacements.map(p => {
                                const isActive = p.status === 'Active';
                                return (
                                    <tr key={p.id} className="hover:bg-[var(--bg-app)] transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="relative">
                                                    <div className="h-10 w-10 shrink-0 rounded-full bg-[var(--bg-app)] border border-[var(--border-subtle)] flex items-center justify-center text-[10px] font-bold text-[var(--text-muted)] uppercase">
                                                        {p.first_name?.[0]}{p.last_name?.[0]}
                                                    </div>
                                                    <div className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-[var(--bg-surface)] ${isActive ? 'bg-green-500' : 'bg-[var(--text-muted)]'}`} title={p.status} />
                                                </div>
                                                <div className="truncate">
                                                    <p className="font-bold uppercase tracking-tight leading-none text-[var(--text-main)] truncate">
                                                        {p.first_name} {p.last_name}
                                                    </p>
                                                    <p className="text-[10px] text-[var(--text-muted)] font-mono tracking-tighter mt-1 uppercase truncate">
                                                        {p.job_title}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <p className="font-bold text-[var(--text-main)] text-xs uppercase tracking-tight truncate">{p.client_name}</p>
                                            
                                            <div className="flex items-center gap-2 mt-1">
                                                <p className="text-[10px] text-[var(--brand-primary)] bg-[var(--brand-primary)]/10 px-2 py-0.5 rounded uppercase tracking-widest truncate">
                                                    {p.placement_type || 'Primary'}
                                                </p>
                                                {(p.has_timesheets === 1 || p.has_timesheets === true) && (
                                                    <p className="text-[10px] text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded uppercase tracking-widest">
                                                        TSheets
                                                    </p>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[10px] font-bold uppercase tracking-widest space-y-1">
                                                <p className="text-green-500">BILL: ${p.bill_rate} / {p.bill_frequency?.[0] || 'H'}</p>
                                                <p className="text-blue-500">PAY ({p.pay_type || 'W2'}): ${p.pay_rate} / {p.pay_frequency?.[0] || 'H'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider">
                                                <p>Start: {new Date(p.start_date).toLocaleDateString()}</p>
                                                <p className="mt-1">End: {p.end_date ? new Date(p.end_date).toLocaleDateString() : 'Ongoing'}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <button 
                                                onClick={() => setSelectedPlacement(p)}
                                                className="text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-app)] text-[var(--text-main)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-text)] hover:border-[var(--brand-primary)] px-4 py-2 rounded-lg border border-[var(--border-subtle)] transition-all active:scale-95"
                                            >
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="5" className="px-6 py-10 text-center text-[var(--text-muted)] text-sm font-bold uppercase tracking-widest">
                                    No placements found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <AddPlacementModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onRefresh={fetchPlacements} />
            
            {selectedPlacement && (
                <PlacementDetailModal 
                    placement={selectedPlacement} 
                    onClose={() => setSelectedPlacement(null)} 
                    onRefresh={fetchPlacements} 
                />
            )}
        </div>
    );
};

export default Placements;