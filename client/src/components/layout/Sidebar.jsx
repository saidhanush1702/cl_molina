import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Building2, Building, Users, Briefcase, 
    Clock, FileText, CreditCard, Wallet, Shield, Menu, UserCircle, X
} from 'lucide-react';

const Sidebar = ({ isOpen, setIsOpen, isMobileOpen, setIsMobileOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const userRole = localStorage.getItem('userRole'); 
    
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

    const handleNavigate = (path) => {
        navigate(path);
        // Automatically close the mobile sidebar upon navigation
        setIsMobileOpen(false);
    };

    return (
        <>
            {/* Mobile Backdrop Overlay - Closes sidebar when clicked */}
            {isMobileOpen && (
                <div 
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
                    onClick={() => setIsMobileOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed top-0 left-0 h-screen z-50 bg-[var(--bg-sidebar)] border-r border-[var(--border-subtle)] flex flex-col font-sans transition-all duration-300 ease-in-out
                /* Mobile classes: fixed drawer. Shrinks to w-16 (just enough for menu button) when closed */
                ${isMobileOpen ? 'w-64 shadow-2xl' : 'w-16 lg:shadow-none'}
                /* Desktop classes: relative positioning inside the flex parent */
                lg:relative lg:translate-x-0 ${isOpen ? 'lg:w-46' : 'lg:w-20'}
            `}>
                
                {/* HEADER SECTION */}
                <div className={`h-16 flex items-center border-b border-[var(--border-subtle)] shrink-0 transition-all duration-300 
                    ${isMobileOpen ? 'px-5 justify-between' : 'px-0 justify-center'}
                    ${isOpen ? 'lg:px-5 lg:justify-between' : 'lg:px-0 lg:justify-center'}
                `}>
                    
                    {/* Logo & Title */}
                    <div className={`flex items-center space-x-2 overflow-hidden transition-all duration-300 
                        ${isMobileOpen ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}
                        ${isOpen ? 'lg:opacity-100 lg:w-auto lg:flex' : 'lg:opacity-0 lg:w-0 lg:hidden'}
                    `}>
                        <div className="bg-[var(--brand-primary)] p-1.5 rounded flex-shrink-0">
                            <Shield className="text-[var(--brand-primary-text)] h-5 w-5" />
                        </div>
                        <span className="font-bold text-[var(--text-main)] tracking-tight uppercase text-sm whitespace-nowrap">HR System</span>
                    </div>

                    {/* Unified Toggle Button (Handles Mobile & Desktop) */}
                    <button 
                        onClick={() => {
                            if (window.innerWidth < 1024) {
                                setIsMobileOpen(!isMobileOpen);
                            } else {
                                setIsOpen(!isOpen);
                            }
                        }} 
                        className={`p-2 rounded-lg hover:bg-[var(--bg-app)]/50 transition-colors text-[var(--text-main)] outline-none ${(!isOpen && !isMobileOpen) && 'mx-auto'}`}
                        title="Toggle Menu"
                    >
                        {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>

                {/* NAVIGATION LINKS */}
                <nav className={`flex-1 mt-6 space-y-2 overflow-y-auto overflow-x-hidden transition-all duration-300
                    ${isMobileOpen ? 'px-3' : 'px-2'}
                    ${isOpen ? 'lg:px-3' : 'lg:px-2'}
                `}>
                    {filteredItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <button
                                key={item.title}
                                onClick={() => handleNavigate(item.path)}
                                title={!isOpen && !isMobileOpen ? item.title : ""} 
                                className={`w-full flex items-center py-2.5 rounded-lg transition-all duration-200 outline-none
                                    ${isMobileOpen ? 'px-3 justify-start' : 'px-0 justify-center'}
                                    ${isOpen ? 'lg:px-3 lg:justify-start' : 'lg:px-0 lg:justify-center'}
                                    ${isActive ? 'bg-[var(--bg-app)] text-[var(--text-main)] font-bold shadow-sm' : 'text-[var(--text-main)]/70 hover:bg-[var(--bg-app)]/50 hover:text-[var(--text-main)]'}
                                `}
                            >
                                <item.icon size={18} className={`flex-shrink-0 ${isActive ? 'text-[var(--brand-primary)]' : ''}`} />
                                
                                <span className={`text-xs whitespace-nowrap overflow-hidden transition-all duration-300 
                                    ${isMobileOpen ? 'ml-3 opacity-100 w-auto' : 'ml-0 opacity-0 w-0'}
                                    ${isOpen ? 'lg:ml-3 lg:opacity-100 lg:w-auto' : 'lg:ml-0 lg:opacity-0 lg:w-0'}
                                `}>
                                    {item.title}
                                </span>
                            </button>
                        );
                    })}
                </nav>

                {/* USER INFO FOOTER */}
                <div className="p-4 border-t border-[var(--border-subtle)] shrink-0">
                    <div className={`py-3 bg-[var(--bg-app)] rounded-xl flex items-center transition-all duration-300 shadow-sm 
                        ${isMobileOpen ? 'px-4 space-x-3' : 'justify-center px-0'}
                        ${isOpen ? 'lg:px-4 lg:space-x-3' : 'lg:justify-center lg:px-0'}
                    `} title={!isOpen && !isMobileOpen ? `${userRole?.replace('_', ' ')} USER` : ''}>
                        
                        {/* Text Block */}
                        <div className={`min-w-0 overflow-hidden transition-all duration-300
                            ${isMobileOpen ? 'w-auto opacity-100 block' : 'w-0 opacity-0 hidden'}
                            ${isOpen ? 'lg:block lg:w-auto lg:opacity-100' : 'lg:hidden lg:w-0 lg:opacity-0'}
                        `}>
                            <p className="text-xs font-bold text-[var(--text-main)] truncate">{userRole?.replace('_', ' ')} USER</p>
                            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest leading-none mt-1 truncate">
                                {userRole}
                            </p>
                        </div>

                        {/* Icon Block (Only visible when collapsed) */}
                        <div className={`shrink-0 overflow-hidden transition-all duration-300 flex justify-center
                            ${isMobileOpen ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100 block'}
                            ${isOpen ? 'lg:hidden lg:w-0 lg:opacity-0' : 'lg:block lg:w-auto lg:opacity-100'}
                        `}>
                            <UserCircle size={20} className="text-[var(--brand-primary)]" />
                        </div>
                    </div>
                </div>
                
            </aside>
        </>
    );
};

export default Sidebar;