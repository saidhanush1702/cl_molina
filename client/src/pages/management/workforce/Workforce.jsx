import React, { useState, useEffect } from 'react';
import { UserPlus, Fingerprint, Search, Filter, Globe, X } from 'lucide-react';
import { managementAPI, commonAPI } from '../../../api/apiService';
import AddEmployeeModal from './AddEmployeeModal';
import EmployeeDetailModal from './EmployeeDetailModal';

// Reusable UI Component for Dropdown Filters (Responsive width)
const SelectFilter = ({ value, onChange, options, icon: Icon, placeholder }) => (
    <div className="relative group shrink-0 w-full sm:w-auto lg:w-32 xl:w-40">
        <div className="absolute left-3 sm:left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors pointer-events-none">
            <Icon size={14} />
        </div>
        <select 
            value={value} 
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-9 pr-8 py-2.5 sm:py-1.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-xl sm:rounded-lg text-xs font-bold focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all appearance-none cursor-pointer shadow-sm truncate"
        >
            <option value="ALL">{placeholder}</option>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
        </select>
        <div className="absolute right-3 sm:right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none">
            <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
        </div>
    </div>
);

const Workforce = () => {
    const [employees, setEmployees] = useState([]);
    const [showFilters, setShowFilters] = useState(false); // Controls mobile filter visibility

    // Dynamic Lookup States
    const [lookups, setLookups] = useState({
        payTypes: [],
        countries: [],
        employeeTypes: []
    });

    const [isEmpModalOpen, setIsEmpModalOpen] = useState(false);
    const [selectedEmp, setSelectedEmp] = useState(null);

    // Filters
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [filterPayType, setFilterPayType] = useState('ALL');
    const [filterCountry, setFilterCountry] = useState('ALL');
    const [searchQuery, setSearchQuery] = useState('');

    const fetchEmployees = async () => {
        try {
            const res = await managementAPI.getEmployees();
            setEmployees(res.data);
        } catch (err) {
            console.error("Workforce fetch error:", err);
        }
    };

    const fetchLookups = async () => {
        try {
            const res = await commonAPI.getLookups();
            setLookups(res.data);
        } catch (err) {
            console.error("Lookups fetch error:", err);
        }
    };

    useEffect(() => {
        fetchEmployees();
        fetchLookups();
    }, []);

    // 1. Base Filter (Applies Search, Country, Pay Type, and Role, but NOT Status)
    const baseFilteredEmployees = employees.filter(emp => {
        if (emp.role !== 'EMPLOYEE') return false;

        if (filterPayType !== 'ALL' && String(emp.pay_type_id) !== String(filterPayType)) return false;
        if (filterCountry !== 'ALL' && String(emp.country_id) !== String(filterCountry)) return false;

        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            const fullName = `${emp.first_name} ${emp.last_name}`.toLowerCase();
            return fullName.includes(query) || emp.employee_code?.toLowerCase().includes(query);
        }
        return true;
    });

    // 2. Calculate Counts dynamically based on the other active filters
    const tabCounts = {
        ALL: baseFilteredEmployees.length,
        ACTIVE: baseFilteredEmployees.filter(emp => emp.is_active === 1 || emp.is_active === true).length,
        TERMINATED: baseFilteredEmployees.filter(emp => emp.is_active !== 1 && emp.is_active !== true).length
    };

    // 3. Final Filter (Applies Status on top of Base Filters for the Table)
    const filteredEmployees = baseFilteredEmployees.filter(emp => {
        const isActive = emp.is_active === 1 || emp.is_active === true;
        if (filterStatus === 'ACTIVE' && !isActive) return false;
        if (filterStatus === 'TERMINATED' && isActive) return false;
        return true;
    });

    // Check if any filter is active for the mobile icon highlighting
    const isFilterActive = filterCountry !== 'ALL' || filterPayType !== 'ALL' || filterStatus !== 'ALL' || searchQuery;

    return (
        <div className="max-w-7xl mx-auto flex flex-col h-[calc(100vh-5rem)] md:h-[calc(100vh-8rem)] gap-2 animate-in fade-in duration-500">

            {/* HEADER CARD */}
            <div className="bg-[var(--bg-surface)] px-4 sm:px-6 py-3 sm:py-4 rounded-2xl border border-[var(--border-subtle)] shadow-sm flex justify-between items-center shrink-0 transition-colors duration-300">
                <div className="flex items-center gap-3">
                    <div className="h-9 w-9 sm:h-10 sm:w-10 bg-[var(--brand-primary)]/10 rounded-xl flex items-center justify-center text-[var(--brand-primary)] transition-colors shrink-0">
                        <Fingerprint size={18} className="sm:w-5 sm:h-5" />
                    </div>
                    <div>
                        <h1 className="text-base sm:text-lg font-bold uppercase tracking-tight text-[var(--text-main)] leading-none">
                            Workforce
                        </h1>
                        <p className="hidden sm:block text-[10px] text-[var(--text-muted)] mt-1 uppercase tracking-widest font-bold">
                            Manage employee records & access
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setIsEmpModalOpen(true)}
                    className="bg-[var(--brand-primary)] text-[var(--brand-primary-text)] w-9 h-9 sm:w-auto sm:px-5 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm active:scale-95 shrink-0 outline-none"
                    title="Add Employee"
                >
                    <UserPlus size={16} /> <span className="hidden sm:inline">Add Employee</span>
                </button>
            </div>

            {/* COMBINED FILTER & TABLE CARD */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-2xl shadow-sm flex flex-col flex-1 overflow-hidden transition-colors duration-300">

                {/* Mobile Filter Toggle Bar (Visible ONLY on Mobile) */}
                <div className="lg:hidden px-4 py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/30 flex justify-between items-center shrink-0">
                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                        {filteredEmployees.length} Records Found
                    </span>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-lg border flex items-center justify-center transition-all outline-none ${
                            isFilterActive || showFilters
                            ? 'bg-[var(--brand-primary)]/10 border-[var(--brand-primary)]/30 text-[var(--brand-primary)]' 
                            : 'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-main)]'
                        }`}
                    >
                        {showFilters ? <X size={16} /> : <Filter size={16} />}
                    </button>
                </div>

                {/* Filters Toolbar (Hidden on Mobile unless toggled, Single line on Desktop) */}
                <div className={`${showFilters ? 'flex' : 'hidden'} lg:flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4 px-4 sm:px-6 py-4 lg:py-3 border-b border-[var(--border-subtle)] bg-[var(--bg-app)]/30 shrink-0`}>

                    {/* Tabs */}
                    <div className="flex p-1 bg-[var(--bg-surface)] rounded-xl lg:rounded-lg border border-[var(--border-subtle)] w-full lg:w-auto shadow-sm overflow-x-auto hide-scrollbar shrink-0">
                        {['ALL', 'ACTIVE', 'TERMINATED'].map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setFilterStatus(tab)}
                                className={`flex-1 lg:flex-none whitespace-nowrap px-3 sm:px-4 py-2 lg:py-1.5 rounded-lg lg:rounded-md text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-1.5 outline-none ${
                                    filterStatus === tab
                                        ? 'bg-[var(--brand-primary)]/10 text-[var(--brand-primary)]'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
                                }`}
                            >
                                {tab}
                                <span className={`px-1.5 py-0.5 rounded-md text-[9px] leading-none transition-colors ${
                                    filterStatus === tab
                                        ? 'bg-[var(--brand-primary)] text-[var(--brand-primary-text)]'
                                        : 'bg-[var(--border-subtle)] text-[var(--text-muted)]'
                                }`}>
                                    {tabCounts[tab]}
                                </span>
                            </button>
                        ))}
                    </div>

                    {/* Dropdowns & Search (Single line on Desktop) */}
                    <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
                        <div className="flex flex-row gap-3 w-full sm:w-auto">
                            <SelectFilter 
                                value={filterCountry} 
                                onChange={setFilterCountry} 
                                options={lookups.countries} 
                                icon={Globe} 
                                placeholder="All Origins" 
                            />
                            
                            <SelectFilter 
                                value={filterPayType} 
                                onChange={setFilterPayType} 
                                options={lookups.payTypes} 
                                icon={Filter} 
                                placeholder="All Pay" 
                            />
                        </div>

                        {/* Compact Search Bar */}
                        <div className="relative w-full sm:w-48 lg:w-56 xl:w-64 shrink-0 group">
                            <div className="absolute left-3 sm:left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--brand-primary)] transition-colors">
                                <Search size={14} />
                            </div>
                            <input
                                type="text"
                                placeholder="Search employees..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-3 py-2.5 sm:py-1.5 bg-[var(--bg-surface)] text-[var(--text-main)] border border-[var(--border-subtle)] rounded-xl sm:rounded-lg text-xs font-bold focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)] outline-none transition-all placeholder:text-[var(--text-muted)] placeholder:font-normal shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Table Body - Mobile 3 Columns, Expands on Desktop */}
                <div className="flex-1 overflow-y-auto overflow-x-hidden">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-[var(--bg-app)] text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest border-b border-[var(--border-subtle)] sticky top-0 z-10 transition-colors duration-300">
                            <tr>
                                {/* Name: 50% Mobile, 30% Desktop */}
                                <th className="px-4 sm:px-6 py-3 sm:py-4 w-[50%] sm:w-[30%]">Employee</th>
                                
                                {/* Hidden on Mobile, Shown on Tablet/Desktop */}
                                <th className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-4 sm:w-[20%]">Role</th>
                                
                                {/* Hidden until Large Desktop */}
                                <th className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-4 lg:w-[15%]">Origin</th>
                                
                                {/* Pay Type: 25% Mobile, 12% Desktop */}
                                <th className="px-2 sm:px-6 py-3 sm:py-4 w-[25%] sm:w-[12%]">Pay Type</th>
                                
                                {/* Hidden on Mobile, Shown on Tablet/Desktop */}
                                <th className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-4 md:w-[13%]">Access</th>
                                
                                {/* Action: 25% Mobile, 10% Desktop */}
                                <th className="px-4 sm:px-6 py-3 sm:py-4 w-[25%] sm:w-[10%] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[var(--border-subtle)]">
                            {filteredEmployees.length > 0 ? (
                                filteredEmployees.map(emp => {
                                    const isActive = emp.is_active === 1 || emp.is_active === true;
                                    return (
                                        <tr key={emp.id} className="hover:bg-[var(--bg-app)] transition-colors group">

                                            {/* Column 1: Name & ID (Always Visible) */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
                                                <div className="flex items-center gap-2.5 sm:gap-3">
                                                    <div className="relative shrink-0">
                                                        <div className="h-8 w-8 sm:h-9 sm:w-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[9px] sm:text-[10px] font-bold text-[var(--text-muted)] uppercase shadow-sm">
                                                            {emp.first_name?.[0] || '?'}{emp.last_name?.[0] || '?'}
                                                        </div>
                                                        <div className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-[var(--bg-surface)] ${isActive ? 'bg-green-500' : 'bg-red-500'}`} title={isActive ? "Active" : "Terminated"} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className={`text-xs sm:text-sm font-bold uppercase tracking-tight leading-none truncate transition-colors ${isActive ? 'text-[var(--text-main)]' : 'text-red-500/80'}`}>
                                                            {emp.first_name} {emp.last_name}
                                                        </p>
                                                        <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] font-mono tracking-tighter mt-1 uppercase truncate">
                                                            {emp.employee_code || '---'}
                                                        </p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Column 2: Role & Emp Type (Hidden on Mobile) */}
                                            <td className="hidden sm:table-cell px-4 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
                                                <p className="text-xs font-bold text-[var(--text-main)] uppercase tracking-tight truncate">{emp.title || '---'}</p>
                                                <p className="text-[10px] font-bold uppercase text-[var(--text-muted)] tracking-wider mt-1 truncate">
                                                    {emp.employee_type_name || 'Full Time'}
                                                </p>
                                            </td>

                                            {/* Column 3: Country of Origin (Hidden until Large Screen) */}
                                            <td className="hidden lg:table-cell px-4 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
                                                <span className="text-xs font-bold text-[var(--text-main)] truncate block">
                                                    {emp.country_name || 'N/A'}
                                                </span>
                                            </td>

                                            {/* Column 4: Pay Type (Always Visible) */}
                                            <td className="px-2 sm:px-6 py-3 sm:py-3.5 overflow-hidden">
                                                <span className="px-2 py-1 sm:py-0.5 bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded text-[9px] sm:text-[10px] font-bold border border-[var(--brand-primary)]/20 truncate inline-block max-w-full">
                                                    {emp.pay_type_name || '---'}
                                                </span>
                                            </td>

                                            {/* Column 5: Access Level (Hidden on Mobile/Small Tablets) */}
                                            <td className="hidden md:table-cell px-4 sm:px-6 py-3 sm:py-3.5 text-[var(--text-main)] overflow-hidden">
                                                <span className="px-2.5 py-1 bg-[var(--bg-surface)] rounded-lg text-[9px] font-bold uppercase text-[var(--text-muted)] border border-[var(--border-subtle)] truncate inline-block max-w-full shadow-sm">
                                                    {emp.role}
                                                </span>
                                            </td>

                                            {/* Column 6: Actions (Always Visible) */}
                                            <td className="px-4 sm:px-6 py-3 sm:py-3.5 text-right">
                                                <button
                                                    onClick={() => setSelectedEmp(emp)}
                                                    className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest bg-[var(--bg-surface)] text-[var(--text-main)] hover:bg-[var(--brand-primary)] hover:text-[var(--brand-primary-text)] hover:border-[var(--brand-primary)] px-3 py-1.5 rounded-lg border border-[var(--border-subtle)] transition-all active:scale-95 shadow-sm outline-none"
                                                >
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan="6" className="px-4 sm:px-6 py-16 text-center text-[var(--text-muted)] text-xs font-bold uppercase tracking-widest">
                                        No employees found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modals */}
            <AddEmployeeModal isOpen={isEmpModalOpen} onClose={() => setIsEmpModalOpen(false)} onRefresh={fetchEmployees} />
            {selectedEmp && <EmployeeDetailModal employee={selectedEmp} onClose={() => setSelectedEmp(null)} onRefresh={fetchEmployees} />}
        </div >
    );
};

export default Workforce;