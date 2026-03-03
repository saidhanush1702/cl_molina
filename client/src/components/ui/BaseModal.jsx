import React from 'react';
import { X } from 'lucide-react';

const BaseModal = ({ 
    isOpen, 
    onClose, 
    icon, 
    title, 
    subtitle, 
    headerRight, 
    footer,      
    children,    
    noPadding = false // NEW: Allows content to stretch to edges
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
            <div className="bg-[var(--bg-surface)] w-[70vw] h-[90vh] flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-[var(--border-subtle)] transition-colors duration-300">
                
                {/* HEADER */}
                <div className="relative px-6 py-4 border-b border-[var(--border-subtle)] flex justify-between items-center bg-[var(--bg-app)] transition-colors duration-300 shrink-0">
                    
                    <div className="flex items-center gap-3">
                        {icon && (
                            <div className="h-8 w-8 bg-[var(--brand-primary)] rounded-xl flex items-center justify-center shadow-sm text-[var(--brand-primary-text)]">
                                {icon}
                            </div>
                        )}
                        <div className="flex flex-col">
                            <h2 className="font-bold uppercase tracking-tighter text-lg text-[var(--text-main)] leading-none mb-1">
                                {title}
                            </h2>
                            {subtitle && (
                                <div className="text-[10px] text-[var(--text-muted)] font-bold uppercase tracking-widest">
                                    {subtitle}
                                </div>
                            )}
                        </div>
                    </div>

                    {headerRight && (
                        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex justify-center items-center pointer-events-none">
                            <div className="bg-[var(--bg-surface)] border border-[var(--border-subtle)] px-4 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-[var(--brand-primary)] uppercase tracking-widest">
                                {headerRight}
                            </div>
                        </div>
                    )}

                    <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors duration-300">
                        <X size={20} />
                    </button>
                </div>

                {/* SCROLLABLE BODY - Adjusted with noPadding prop */}
                <div className={`flex-1 overflow-y-auto ${noPadding ? '' : 'p-8'}`}>
                    {children}
                </div>

                {/* FOOTER */}
                {footer && (
                    <div className="px-6 py-4 border-t border-[var(--border-subtle)] bg-[var(--bg-app)] flex justify-between items-center transition-colors duration-300 shrink-0">
                        {footer}
                    </div>
                )}
            </div>
        </div>
    );
};

export default BaseModal;