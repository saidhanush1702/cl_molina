import React from 'react';
import { Users, Briefcase, Clock, FileText, AlertCircle } from 'lucide-react';

const ManagementDashboard = () => {
    const userRole = localStorage.getItem('userRole'); 

    const cards = [
        { label: 'Total Employees', value: '24', icon: Users },
        { label: 'Active Placements', value: '18', icon: Briefcase },
        { label: 'Pending Timesheets', value: '5', icon: Clock },
        { label: 'Unpaid Invoices', value: '3', icon: FileText }
    ];

    const alerts = [
        { title: 'Past Due Timesheet', desc: 'Employee John Doe has not submitted timesheet for Week 4', color: 'bg-[var(--status-red)]' },
        { title: 'Invoice Pending Approval', desc: 'Invoice #INV-2024-0123 requires approval', color: 'bg-[var(--status-yellow)]' },
        { title: 'New Employee Onboarding', desc: 'Jane Smith requires placement assignment', color: 'bg-[var(--accent-orange)]' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
            
            {/* Header */}
            <div>
                <h1 className="text-3xl font-semibold text-[var(--text-main)] tracking-tight">Dashboard</h1>
                <p className="text-sm text-[var(--text-muted)] mt-1">Overview of your {userRole === 'ORG_ADMIN' ? 'administration' : 'HR management'} system</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <div key={i} className="relative bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 overflow-hidden shadow-sm transition-colors duration-300">
                        {/* Orange Accent Border */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[var(--accent-orange)]"></div>
                        
                        <div className="flex justify-between items-start mb-6 pl-2">
                            <p className="text-sm font-medium text-[var(--text-muted)]">{card.label}</p>
                            <div className="p-2 rounded-full bg-[var(--icon-bg)] text-[var(--icon-color)] transition-colors duration-300">
                                <card.icon size={18} />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-[var(--text-main)] pl-2">{card.value}</p>
                    </div>
                ))}
            </div>

            {/* Alerts Section */}
            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-6 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-2 mb-6 text-[var(--text-main)]">
                    <AlertCircle size={20} />
                    <h2 className="text-base font-medium">Recent Alerts</h2>
                </div>
                
                <div className="space-y-0">
                    {alerts.map((alert, i) => (
                        <div key={i} className={`flex gap-4 py-4 ${i !== alerts.length - 1 ? 'border-b border-[var(--border-subtle)]' : ''}`}>
                            <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${alert.color}`}></div>
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-main)]">{alert.title}</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">{alert.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
};

export default ManagementDashboard;