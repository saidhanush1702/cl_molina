import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon, Menu } from 'lucide-react';
import Sidebar from './Sidebar'; 
import api from '../../api/axios'; 

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    const [isDark, setIsDark] = useState(false);
    
    // Lifted state to coordinate mobile menu and desktop collapse
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            setIsDark(true);
            document.documentElement.classList.add('dark');
        }
    }, []);

    const toggleTheme = () => {
        if (isDark) {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
            setIsDark(false);
        } else {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            setIsDark(true);
        }
    };

    const handleLogout = async () => {
        try {
            await api.post('/api/auth/logout'); 
            localStorage.clear();
            navigate('/');
        } catch (err) {
            console.error("Logout failed", err);
        }
    };

    return (
        <div className="flex h-screen w-full bg-[var(--bg-app)] overflow-hidden transition-colors duration-300 relative">
            
            {/* Sidebar completely handles its own mobile vs desktop rendering logic */}
            <Sidebar 
                isOpen={isSidebarOpen} 
                setIsOpen={setIsSidebarOpen} 
                isMobileOpen={isMobileSidebarOpen}
                setIsMobileOpen={setIsMobileSidebarOpen}
            />
            
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                
                {/* Fixed Header */}
                <header className="h-16 shrink-0 bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] flex items-center justify-between px-4 lg:px-8 transition-colors duration-300">
                    
                    {/* Left: Mobile Menu Toggle & Welcome Text */}
                    <div className="flex items-center gap-3">
                        {/* <button 
                            onClick={() => setIsMobileSidebarOpen(true)}
                            className="lg:hidden p-2 -ml-2 rounded-lg text-[var(--text-main)] hover:bg-[var(--bg-app)]/50 transition-colors outline-none"
                        >
                            <Menu size={20} />
                        </button> */}

                        <h2 className="text-sm lg:text-base font-semibold text-[var(--text-main)] tracking-tight truncate">
                            Welcome, {userRole?.replace('_', ' ')}
                        </h2>
                    </div>
                    
                    {/* Right: Theme Toggle & Logout */}
                    <div className="flex items-center space-x-1 lg:space-x-4">
                        <button 
                            onClick={toggleTheme} 
                            className="flex items-center justify-center p-2 lg:px-3 lg:py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] rounded-lg transition-all outline-none"
                            title="Toggle Light/Dark Mode"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <div className="hidden lg:block w-px h-6 bg-[var(--border-subtle)] mx-2"></div>

                        <button 
                            onClick={handleLogout} 
                            className="flex items-center justify-center p-2 lg:px-4 lg:py-2 text-[var(--text-muted)] hover:text-red-500 lg:hover:text-[var(--text-main)] lg:hover:bg-[var(--border-subtle)] rounded-lg transition-all outline-none"
                            title="Log Out"
                        >
                            <LogOut size={18} />
                            <span className="hidden lg:inline ml-2 text-sm font-medium">Log Out</span>
                        </button>
                    </div>
                </header>
                
                {/* Scrollable Page Content */}
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 lg:p-8 bg-[var(--bg-app)] transition-colors duration-300 w-full relative">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;