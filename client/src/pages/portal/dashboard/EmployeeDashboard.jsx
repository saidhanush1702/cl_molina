import React from 'react';
import { Briefcase, Calendar, Wallet, CheckCircle } from 'lucide-react';

const EmployeeDashboard = () => {
    return (
        <div className="space-y-8 animate-in slide-in-from-bottom-2 duration-500">
            <div>
                <h1 className="text-2xl font-bold text-[var(--text-main)] tracking-tight uppercase italic transition-colors">Personal Portal</h1>
                <p className="text-sm text-[var(--text-muted)] transition-colors">Manage your assignments and timesheet status.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[
                    { label: 'My Placements', value: '2 Active', icon: Briefcase },
                    { label: 'Hours This Week', value: '32.5', icon: Calendar },
                    { label: 'Verification', value: 'Verified', icon: CheckCircle },
                    { label: 'Latest Balance', value: '$2,450', icon: Wallet }
                ].map((card, i) => (
                    <div key={i} className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-6 rounded-xl transition-colors duration-300 shadow-sm">
                        <card.icon size={20} className="mb-4 text-[var(--text-muted)] transition-colors" />
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest transition-colors">{card.label}</p>
                        <p className="text-xl font-bold text-[var(--text-main)] mt-1 transition-colors">{card.value}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default EmployeeDashboard;