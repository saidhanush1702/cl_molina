import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { authAPI } from '../../api/apiService';
import { ROUTES, ROLES } from '../../utils/constants';
import ForgotPassword from './ForgotPassword';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showForgot, setShowForgot] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true); setError('');
        try {
            // Using the centralized API file
            const res = await authAPI.login(formData);
            const { user } = res.data;
            localStorage.setItem('userRole', user.role); 

            // Using centralized global constants
            if (user.role === ROLES.SUPER_ADMIN) navigate(ROUTES.SUPER_ADMIN_DASHBOARD);
            else if (user.role === ROLES.ORG_ADMIN || user.role === ROLES.HR) navigate(ROUTES.MANAGEMENT_DASHBOARD); 
            else navigate(ROUTES.PORTAL_DASHBOARD); 
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials.');
        } finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg-app)] px-4 transition-colors duration-300">
            <div className="max-w-md w-full bg-[var(--bg-surface)] p-8 rounded-2xl shadow-xl border border-[var(--border-subtle)] transition-colors duration-300">
                {!showForgot ? (
                    <>
                        <div className="text-center mb-8">
                            <div className="mx-auto h-12 w-12 bg-[var(--brand-primary)] rounded-lg flex items-center justify-center mb-4 transition-colors duration-300 shadow-md">
                                <ShieldCheck className="h-8 w-8 text-[var(--brand-primary-text)]" />
                            </div>
                            <h2 className="text-2xl font-bold text-[var(--text-main)] tracking-tight uppercase italic transition-colors duration-300">Secure Login</h2>
                        </div>

                        <form className="space-y-6" onSubmit={handleLogin}>
                            {error && (
                                <div className="bg-red-500/10 text-red-500 p-3 rounded-lg text-xs font-bold border border-red-500/20 text-center transition-colors">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-4">
                                <div className="relative group">
                                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-1 block transition-colors duration-300">Email</label>
                                    <input
                                        name="email" type="email" required
                                        className="block w-full px-4 py-3 border border-[var(--brand-primary)]/50 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] transition-all text-sm outline-none placeholder:text-gray-500"
                                        placeholder="admin@org.com"
                                        value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    />
                                </div>

                                <div className="relative group">
                                    <label className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest ml-1 mb-1 block transition-colors duration-300">Password</label>
                                    <input
                                        name="password" type="password" required
                                        className="block w-full px-4 py-3 border border-[var(--brand-primary)]/50 rounded-xl bg-[var(--input-bg)] text-[var(--input-text)] focus:border-[var(--brand-primary)] focus:ring-2 focus:ring-[var(--brand-primary)] transition-all text-sm outline-none placeholder:text-gray-500"
                                        placeholder="••••••••"
                                        value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="text-right">
                                <button type="button" onClick={() => setShowForgot(true)} className="text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-main)] uppercase tracking-widest transition-colors">
                                    Forgot Password?
                                </button>
                            </div>

                            <button type="submit" disabled={loading} className="w-full flex justify-center py-3.5 px-4 bg-[var(--brand-primary)] text-[var(--brand-primary-text)] text-xs font-bold rounded-xl hover:opacity-90 focus:ring-4 focus:ring-[var(--brand-primary)]/50 outline-none active:scale-95 transition-all shadow-lg uppercase tracking-widest disabled:opacity-50">
                                {loading ? <Loader2 className="animate-spin h-5 w-5" /> : 'Enter Portal'}
                            </button>
                        </form>
                    </>
                ) : (
                    <ForgotPassword onClose={() => setShowForgot(false)} />
                )}
            </div>
        </div>
    );
};
export default Login;