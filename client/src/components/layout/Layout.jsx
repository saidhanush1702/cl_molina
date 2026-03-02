import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Sun, Moon } from 'lucide-react';
import Sidebar from './Sidebar'; 
import api from '../../api/axios'; 

const Layout = ({ children }) => {
    const navigate = useNavigate();
    const userRole = localStorage.getItem('userRole');

    const [isDark, setIsDark] = useState(false);

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
        <div className="flex h-screen bg-[var(--bg-app)] overflow-hidden transition-colors duration-300">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                
                {/* Header is explicitly set to h-16 (64px) to match the new Sidebar top header */}
                <header className="h-16 shrink-0 bg-[var(--bg-sidebar)] border-b border-[var(--border-subtle)] flex items-center justify-between px-8 transition-colors duration-300">
                    <h2 className="text-sm font-semibold text-[var(--text-main)] tracking-tight">
                        Welcome, {userRole?.replace('_', ' ')}
                    </h2>
                    
                    <div className="flex items-center space-x-4">
                        <button 
                            onClick={toggleTheme} 
                            className="flex items-center space-x-2 px-3 py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] rounded-lg transition-all"
                            title="Toggle Light/Dark Mode"
                        >
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </button>

                        <div className="w-px h-6 bg-[var(--border-subtle)] mx-2"></div>

                        <button 
                            onClick={handleLogout} 
                            className="flex items-center space-x-2 px-4 py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border-subtle)] rounded-lg transition-all"
                        >
                            <LogOut size={18} />
                            <span className="text-sm font-medium">Log Out</span>
                        </button>
                    </div>
                </header>
                
                <main className="flex-1 overflow-x-hidden overflow-y-auto p-8 bg-[var(--bg-app)] transition-colors duration-300">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;