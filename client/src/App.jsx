import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/layout/Layout';
import Login from './pages/auth/Login';

import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import Organizations from "./pages/super-admin/Organizations";

import ManagementDashboard from './pages/management/dashboard/ManagementDashboard';
import Workforce from './pages/management/workforce/Workforce';
import Clients from './pages/management/clients/Clients'; // <-- NEW IMPORT
import Placements from './pages/management/placements/Placements';
import Organisation from './pages/management/organisation/Organisation';

import EmployeeDashboard from './pages/portal/dashboard/EmployeeDashboard';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const role = localStorage.getItem('userRole');
    if (!role) return <Navigate to="/" replace />;
    if (allowedRoles && !allowedRoles.includes(role)) return <Navigate to="/" replace />;
    return children;
};

function App() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />

                {/* Super Admin Routes */}
                <Route path="/super-admin/dashboard" element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Layout><SuperAdminDashboard /></Layout></ProtectedRoute>
                } />
                <Route path="/super-admin/organizations" element={
                    <ProtectedRoute allowedRoles={['SUPER_ADMIN']}><Layout><Organizations /></Layout></ProtectedRoute>
                } />

                {/* Management (HR/Admin) Routes */}
                <Route path="/management/dashboard" element={
                    <ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><ManagementDashboard /></Layout></ProtectedRoute>
                } />

                <Route path="/management/workforce" element={
                    <ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><Workforce /></Layout></ProtectedRoute>
                } />

                {/* NEW: Clients Route */}
                <Route path="/management/clients" element={
                    <ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><Clients /></Layout></ProtectedRoute>
                } />

                <Route path="/management/placements" element={
                    <ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><Placements /></Layout></ProtectedRoute>
                } />

                <Route path="/management/timesheets" element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><div className="p-10 uppercase italic font-bold text-[var(--text-main)]">Timesheet Approvals</div></Layout></ProtectedRoute>} />
                <Route path="/management/invoices" element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><div className="p-10 uppercase italic font-bold text-[var(--text-main)]">Invoices & Billing</div></Layout></ProtectedRoute>} />
                <Route path="/management/payroll" element={<ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><div className="p-10 uppercase italic font-bold text-[var(--text-main)]">Payroll Processing</div></Layout></ProtectedRoute>} />

                {/* Employee Portal Routes */}
                <Route path="/portal/dashboard" element={
                    <ProtectedRoute allowedRoles={['EMPLOYEE']}><Layout><EmployeeDashboard /></Layout></ProtectedRoute>
                } />
                <Route path="/portal/placements" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Layout><div className="p-10 uppercase italic font-bold text-[var(--text-main)]">My Active Placements</div></Layout></ProtectedRoute>} />
                <Route path="/portal/timesheets" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Layout><div className="p-10 uppercase italic font-bold text-[var(--text-main)]">My Weekly Timesheets</div></Layout></ProtectedRoute>} />
                <Route path="/portal/balance-sheet" element={<ProtectedRoute allowedRoles={['EMPLOYEE']}><Layout><div className="p-10 uppercase italic font-bold text-[var(--text-main)]">Personal Balance Sheet</div></Layout></ProtectedRoute>} />

                <Route path="/management/organisation" element={
                    <ProtectedRoute allowedRoles={['ORG_ADMIN', 'HR']}><Layout><Organisation /></Layout></ProtectedRoute>
                } />

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
}

export default App;