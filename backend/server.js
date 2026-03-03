import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './config/db.js';

dotenv.config();
 
import { login , logout, forgotPassword, verifyResetCode, resetPassword } from './controllers/authController.js';
import { createOrganization, toggleOrgStatus, getAllOrganizations } from './controllers/orgController.js';
import { verifyToken, isSuperAdmin } from './middleware/auth.js'; 
import { createHR, getHRs, toggleHRAccess, deleteHR } from './controllers/hrController.js';
import { addEmployee, getEmployees, updateEmployee, deleteEmployee, terminateEmployee, toggleEmployeeAccess, addImmigrationRecord } from './controllers/employeeController.js';
import { getNextEmployeeCode, updateImmigrationRecord , deleteImmigrationRecord } from './controllers/employeeController.js';

import { createClient, getClients } from './controllers/clientController.js';
import { updateClient, deleteClient } from './controllers/clientController.js';

import { createPlacement, getPlacements, updatePlacement } from './controllers/placementController.js';

import { getAllLookups } from './controllers/lookupController.js';


const app = express();

app.use(cors({
    origin: process.env.CLIENT_ORIGIN, 
    credentials: true,              
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());
app.use(cookieParser());

//  ROUTES 

app.post('/api/auth/login', login);
app.post('/api/auth/logout', logout);

app.post('/api/auth/forgot-password', forgotPassword);
app.post('/api/auth/verify-code', verifyResetCode);
app.post('/api/auth/reset-password', resetPassword);

// Super Admin Protected
app.post('/api/super-admin/create-org', [verifyToken, isSuperAdmin], createOrganization);
app.put('/api/super-admin/organizations/:id/toggle', [verifyToken, isSuperAdmin], toggleOrgStatus);
app.get('/api/super-admin/organizations', [verifyToken, isSuperAdmin], getAllOrganizations);


// --- HR Management Routes (ORG_ADMIN only for modification) ---
app.post('/api/management/hr', verifyToken, createHR);
app.get('/api/management/hr', verifyToken, getHRs);
app.put('/api/management/hr/:id/toggle-access', verifyToken, toggleHRAccess);
app.delete('/api/management/hr/:id', verifyToken, deleteHR);

// Management Routes (Admin & HR)
app.get('/api/management/employees', verifyToken, getEmployees);
app.post('/api/management/add-employee', [verifyToken], addEmployee);
app.put('/api/management/update-employee/:id', verifyToken, updateEmployee);
app.delete('/api/management/delete-employee/:id', verifyToken, deleteEmployee);
app.put('/api/management/employees/:id/terminate', verifyToken, terminateEmployee);
app.put('/api/management/employees/:id/toggle-access', verifyToken, toggleEmployeeAccess);
app.get('/api/management/employees/next-code', verifyToken, getNextEmployeeCode);
app.post('/api/management/employees/:empId/immigration', verifyToken, addImmigrationRecord);
app.put('/api/management/employees/immigration/:immId', verifyToken, updateImmigrationRecord);
app.delete('/api/management/employees/immigration/:immId', verifyToken, deleteImmigrationRecord);


app.get('/api/management/clients', verifyToken, getClients);
app.post('/api/management/clients', verifyToken, createClient);
app.put('/api/management/clients/:id', verifyToken, updateClient);
app.delete('/api/management/clients/:id', verifyToken, deleteClient);


app.post('/api/management/placements', verifyToken, createPlacement);
app.get('/api/management/placements', verifyToken, getPlacements);
app.put('/api/management/placements/:id', verifyToken, updatePlacement);

app.get('/api/lookups', verifyToken, getAllLookups);


const PORT = process.env.PORT;

const startServer = async () => {
    try {
        // Just verify connection works before starting server
        await pool.query('SELECT 1'); 
        console.log("Database connected successfully.");
        app.listen(PORT, () => console.log(`Server on http://localhost:${PORT}`));
    } catch (error) {
        console.error("Server Error:", error);
    }
};

startServer();