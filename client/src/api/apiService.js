import api from './axios';

export const commonAPI = {
    getLookups: () => api.get('/api/lookups'),
};

// AUTHENTICATION
export const authAPI = {
    login: (credentials) => api.post('/api/auth/login', credentials),
};

// MANAGEMENT (HR/Admin)
export const managementAPI = {
    // Employee Endpoints
    getEmployees: () => api.get('/api/management/employees'),
    addEmployee: (data) => api.post('/api/management/add-employee', data),
    updateEmployee: (id, data) => api.put(`/api/management/update-employee/${id}`, data),
    terminateEmployee: (id, data) => api.put(`/api/management/employees/${id}/terminate`, data),
    toggleEmployeeAccess: (id, data) => api.put(`/api/management/employees/${id}/toggle-access`, data),
    getNextEmployeeCode: () => api.get('/api/management/employees/next-code'),

    getEmployeeDocuments: (empId) => api.get(`/api/management/employees/${empId}/documents`),
    uploadEmployeeDocument: (empId, formData) => api.post(`/api/management/employees/${empId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
    }),
    deleteEmployeeDocument: (docId) => api.delete(`/api/management/employees/documents/${docId}`),

    // Immigration Endpoints
    addImmigration: (id, data) => api.post(`/api/management/employees/${id}/immigration`, data),
    deleteImmigration: (immId) => api.delete(`/api/management/employees/immigration/${immId}`),
    updateImmigration: (immId, data) => api.put(`/api/management/employees/immigration/${immId}`, data),

    // Client Endpoints
    getClients: () => api.get('/api/management/clients'),

    // HR / Team Endpoints (NEW)
    getHRs: () => api.get('/api/management/hr'),
    createHR: (data) => api.post('/api/management/hr', data),
    toggleHRAccess: (id, data) => api.put(`/api/management/hr/${id}/toggle-access`, data),
    deleteHR: (id) => api.delete(`/api/management/hr/${id}`),
};

// SUPER ADMIN
export const superAdminAPI = {
    getOrganizations: () => api.get('/api/super-admin/organizations'),
    toggleOrganizationStatus: (id, currentStatus) =>
        api.put(`/api/super-admin/organizations/${id}/toggle`, { is_active: !currentStatus }),
};