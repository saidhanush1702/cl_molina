import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Building2, Building, Users, Briefcase, 
    Clock, FileText, CreditCard, Wallet, Shield, Menu, UserCircle
} from 'lucide-react';

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('userRole'); 
    
    // State to manage sidebar open/close toggle
    const [isOpen, setIsOpen] = useState(true);

    const menuItems = [
        {
            title: 'Dashboard', icon: LayoutDashboard,
            path: userRole === 'SUPER_ADMIN' ? '/super-admin/dashboard' :
                  (userRole === 'ORG_ADMIN' || userRole === 'HR') ? '/management/dashboard' : 
                  '/portal/dashboard',
            roles: ['SUPER_ADMIN', 'ORG_ADMIN', 'HR', 'EMPLOYEE']
        },
        { title: 'Organisations', icon: Building2, path: '/super-admin/organizations', roles: ['SUPER_ADMIN'] },  
        
        
        { title: 'Workforce', icon: Users, path: '/management/workforce', roles: ['ORG_ADMIN', 'HR'] },
        { title: 'Clients', icon: Building, path: '/management/clients', roles: ['ORG_ADMIN', 'HR'] },
        { title: 'Placements', icon: Briefcase, path: '/management/placements', roles: ['ORG_ADMIN', 'HR'] },
        { title: 'Timesheets', icon: Clock, path: '/management/timesheets', roles: ['ORG_ADMIN', 'HR'] },
        { title: 'Invoices', icon: FileText, path: '/management/invoices', roles: ['ORG_ADMIN', 'HR'] },
        { title: 'Payroll', icon: CreditCard, path: '/management/payroll', roles: ['ORG_ADMIN', 'HR'] },
        { title: 'My Placements', icon: Briefcase, path: '/portal/placements', roles: ['EMPLOYEE'] },
        { title: 'My Timesheets', icon: Clock, path: '/portal/timesheets', roles: ['EMPLOYEE'] },
        { title: 'Balance Sheet', icon: Wallet, path: '/portal/balance-sheet', roles: ['EMPLOYEE'] },
        
        { title: 'Organisation', icon: Building2, path: '/management/organisation', roles: ['ORG_ADMIN', 'HR'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(userRole));

    return (
        /* CHANGED: Replaced w-64 with w-56 for a slimmer open sidebar */
        <div className={`h-screen bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col font-sans transition-all duration-300 relative ${isOpen ? 'w-50' : 'w-20'}`}>
            
            {/* HEADER SECTION */}
            <div className={`h-16 flex items-center justify-between border-b border-[var(--border-subtle)] shrink-0 transition-all duration-300 ${isOpen ? 'px-5' : 'px-0 justify-center'}`}>
                
                {/* Logo & Title (Hidden when collapsed) */}
                <div className={`flex items-center space-x-2 overflow-hidden transition-all duration-300 ${isOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                    <div className="bg-[var(--brand-primary)] p-1.5 rounded flex-shrink-0">
                        <Shield className="text-[var(--brand-primary-text)] h-5 w-5" />
                    </div>
                    <span className="font-bold text-[var(--text-main)] tracking-tight uppercase text-sm whitespace-nowrap">HR System</span>
                </div>

                {/* Toggle Button */}
                <button 
                    onClick={() => setIsOpen(!isOpen)} 
                    className={`p-2 rounded-lg hover:bg-[var(--bg-app)]/50 transition-colors text-[var(--text-main)] ${!isOpen && 'mx-auto'}`}
                    title={isOpen ? "Collapse Menu" : "Expand Menu"}
                >
                    <Menu size={18} />
                </button>
            </div>

            {/* NAVIGATION LINKS */}
            <nav className={`flex-1 mt-6 space-y-2 overflow-y-auto overflow-x-hidden ${isOpen ? 'px-3' : 'px-2'}`}>
                {filteredItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.title}
                            onClick={() => navigate(item.path)}
                            title={!isOpen ? item.title : ""} // Native browser tooltip when collapsed
                            className={`w-full flex items-center py-2.5 rounded-lg transition-all duration-200 ${
                                isOpen ? 'px-3 justify-start' : 'px-0 justify-center'
                            } ${
                                isActive 
                                ? 'bg-[var(--bg-app)] text-[var(--text-main)] font-bold shadow-sm' 
                                : 'text-[var(--text-main)]/70 hover:bg-[var(--bg-app)]/50 hover:text-[var(--text-main)]'
                            }`}
                        >
                            <item.icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[var(--brand-primary)]' : ''}`} />
                            
                            {/* Text smoothly disappears when collapsed */}
                            <span className={`text-xs whitespace-nowrap overflow-hidden transition-all duration-300 ${
                                isOpen ? 'ml-3 opacity-100 w-auto' : 'ml-0 opacity-0 w-0'
                            }`}>
                                {item.title}
                            </span>
                        </button>
                    );
                })}
            </nav>

            {/* USER INFO FOOTER */}
            <div className="p-4 border-t border-[var(--border-subtle)]">
                <div className={`py-3 bg-[var(--bg-app)] rounded-xl flex items-center transition-all duration-300 shadow-sm ${isOpen ? 'px-4 space-x-3' : 'justify-center px-0'}`} title={!isOpen ? `${userRole?.replace('_', ' ')} USER` : ''}>
                    
                    {/* User Icon shrinks when closed to fit */}
                    {isOpen ? (
                        <div className="min-w-0 overflow-hidden">
                            <p className="text-xs font-bold text-[var(--text-main)] truncate">{userRole?.replace('_', ' ')} USER</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest leading-none mt-1 truncate">
                                {userRole}
                            </p>
                        </div>
                    ) : (
                        <UserCircle size={20} className="text-[var(--brand-primary)]" />
                    )}
                </div>
            </div>
            
        </div>
    );
};

export default Sidebar;