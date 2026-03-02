import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { encryptPassword, decryptPassword } from '../utils/crypto.js';
import { sendWelcomeEmail } from '../utils/mailer.js';

export const addEmployee = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { auth, profile } = req.body;
        const orgId = req.user.orgId;
        const creatorId = req.user.id;

        const userId = uuidv4();
        
        // Changed from bcrypt to AES Encryption
        const hashedPw = encryptPassword(auth.password);
        
        await connection.query(
            `INSERT INTO users (id, organization_id, email, password_hash, role, created_by, updated_by) 
             VALUES (?, ?, ?, ?, 'EMPLOYEE', ?, ?)`,
            [userId, orgId, auth.email, hashedPw, creatorId, creatorId]
        );

        const employeeId = uuidv4();
        const profileQuery = `
            INSERT INTO employees (
                id, organization_id, user_id, first_name, last_name,
                birth_date, gender_id, marital_status, title,
                employee_code, employee_type_id, 
                ssn, joining_date, personal_email, phone_number, country_id, 
                e_verification_code, created_by, updated_by
            ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`;

        const values = [
            employeeId, orgId, userId, profile.first_name, profile.last_name, 
            profile.birth_date || null, profile.gender_id || null, profile.marital_status, profile.title,
            profile.employee_code, profile.employee_type_id || null, 
            profile.ssn, profile.joining_date, profile.personal_email, profile.phone_number, profile.country_id || null,
            profile.e_verification_code, creatorId, creatorId
        ];

        await connection.query(profileQuery, values);

        if (profile.immigration_status_id) {
            await connection.query(
                `INSERT INTO employee_immigrations (id, employee_id, status_id, start_date, till_date, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [uuidv4(), employeeId, profile.immigration_status_id, profile.immigration_start_date || null, profile.immigration_till_date || null, creatorId, creatorId]
            );
        }

        await sendWelcomeEmail(auth.email, auth.password, "Your Organization");

        await connection.commit();
        res.status(201).json({ message: "Full employee profile created." });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const getEmployees = async (req, res) => {
    try {
        const [employees] = await pool.query(`
            SELECT 
                e.*, 
                g.name as gender_name,
                et.name as employee_type_name,
                c.name as country_name,
                u.id as user_account_id, u.email, u.role, u.is_active,
                u.password_hash,  -- Added to fetch the encrypted password
                (SELECT pt.name 
                 FROM placements p 
                 LEFT JOIN lkp_pay_types pt ON p.pay_type_id = pt.id 
                 WHERE p.employee_id = e.id AND p.status = 'Active' 
                 ORDER BY p.created_at DESC LIMIT 1) as pay_type_name,
                (SELECT JSON_ARRAYAGG(
                    JSON_OBJECT(
                        'id', i.id, 
                        'status_id', i.status_id, 
                        'status_name', lis.name, 
                        'start_date', i.start_date, 
                        'till_date', i.till_date
                    )
                 ) 
                 FROM employee_immigrations i 
                 LEFT JOIN lkp_immigration_statuses lis ON i.status_id = lis.id 
                 WHERE i.employee_id = e.id) as immigrations
            FROM users u
            LEFT JOIN employees e ON u.id = e.user_id
            LEFT JOIN lkp_genders g ON e.gender_id = g.id
            LEFT JOIN lkp_employee_types et ON e.employee_type_id = et.id
            LEFT JOIN lkp_countries c ON e.country_id = c.id
            WHERE u.organization_id = ? AND u.role != 'SUPER_ADMIN'
            ORDER BY u.created_at DESC
        `, [req.user.orgId]);
        
        // Map through the employees to attach the decrypted password
        const formattedEmployees = employees.map(emp => {
            return {
                ...emp,
                plain_password: decryptPassword(emp.password_hash) || 'Encrypted (Old Hash)'
            };
        });

        res.json(formattedEmployees);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const addImmigrationRecord = async (req, res) => {
    const { empId } = req.params;
    const { status_id, start_date, till_date } = req.body;
    const creatorId = req.user.id; 
    try {
        await pool.query(
            `INSERT INTO employee_immigrations (id, employee_id, status_id, start_date, till_date, created_by, updated_by) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [uuidv4(), empId, status_id || null, start_date || null, till_date || null, creatorId, creatorId]
        );
        res.status(201).json({ message: "Immigration record added." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateEmployee = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    const orgId = req.user.orgId;

    try {
        await pool.query(
            `UPDATE employees SET 
                first_name=?, last_name=?, birth_date=?, 
                gender_id=?, marital_status=?, title=?, 
                employee_code=?, employee_type_id=?, 
                ssn=?, joining_date=?, personal_email=?, phone_number=?, 
                country_id=?, e_verification_code=?, updated_by=?
            WHERE id = ? AND organization_id = ?`,
            [
                data.first_name || '', 
                data.last_name || '', 
                data.birth_date || null, 
                data.gender_id || null, 
                data.marital_status || null, 
                data.title || null, 
                data.employee_code || null, 
                data.employee_type_id || null, 
                data.ssn || null, 
                data.joining_date || null, 
                data.personal_email || null, 
                data.phone_number || null, 
                data.country_id || null, 
                data.e_verification_code || null, 
                req.user.id, 
                id, 
                orgId
            ]
        );
        res.json({ message: "Profile synchronized successfully." });
    } catch (error) {
        console.error("Backend Update Error:", error);
        res.status(500).json({ error: error.message });
    }
};

export const updateImmigrationRecord = async (req, res) => {
    const { immId } = req.params;
    const { status_id, start_date, till_date } = req.body;
    const updatedBy = req.user.id;
    
    try {
        await pool.query(
            `UPDATE employee_immigrations 
             SET status_id = ?, start_date = ?, till_date = ?, updated_by = ? 
             WHERE id = ?`,
            [status_id || null, start_date || null, till_date || null, updatedBy, immId]
        );
        res.json({ message: "Immigration record updated successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteEmployee = async (req, res) => {
    const { id } = req.params;
    const userRole = req.user.role; 

    try {
        if (userRole !== 'ORG_ADMIN') {
            return res.status(403).json({ message: "Access Denied: Only Admins can delete users." });
        }
        if (id === req.user.id) return res.status(400).json({ message: "Cannot delete yourself." });

        await pool.query('DELETE FROM users WHERE id = ? AND organization_id = ?', [id, req.user.orgId]);
        res.json({ message: "Employee deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const terminateEmployee = async (req, res) => {
    const { id } = req.params; 
    const { date, reason } = req.body;
    const orgId = req.user.orgId;
    const userRole = req.user.role;

    if (userRole !== 'ORG_ADMIN') {
        return res.status(403).json({ message: "Access Denied: Only Admins can terminate users." });
    }
    if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot terminate yourself." });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            `UPDATE employees 
             SET termination_date = ?, reason_for_termination = ?, updated_by = ? 
             WHERE user_id = ? AND organization_id = ?`,
            [date, reason, req.user.id, id, orgId]
        );

        await connection.query(
            `UPDATE users 
             SET is_active = FALSE, updated_by = ? 
             WHERE id = ? AND organization_id = ?`,
            [req.user.id, id, orgId]
        );

        await connection.commit();
        res.json({ message: "Employee terminated and system access revoked." });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const toggleEmployeeAccess = async (req, res) => {
    const { id } = req.params; 
    const { is_active } = req.body; 
    const orgId = req.user.orgId;

    if (req.user.role !== 'ORG_ADMIN') {
        return res.status(403).json({ message: "Access Denied." });
    }
    if (id === req.user.id) {
        return res.status(400).json({ message: "Cannot change your own access." });
    }

    try {
        await pool.query(
            `UPDATE users SET is_active = ?, updated_by = ? WHERE id = ? AND organization_id = ?`,
            [is_active, req.user.id, id, orgId]
        );
        res.json({ message: `Employee access ${is_active ? 'restored' : 'suspended'} successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const getNextEmployeeCode = async (req, res) => {
    try {
        const orgId = req.user.orgId;
        
        const [rows] = await pool.query(`
            SELECT employee_code 
            FROM employees 
            WHERE organization_id = ? AND employee_code IS NOT NULL
        `, [orgId]);

        let maxNumber = 0;

        rows.forEach(row => {
            const match = row.employee_code.match(/\d+/);
            if (match) {
                const num = parseInt(match[0], 10);
                if (num > maxNumber) {
                    maxNumber = num;
                }
            }
        });

        const nextNumber = maxNumber + 1;
        const nextCode = `EMP-${String(nextNumber).padStart(3, '0')}`;

        res.json({ nextCode });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// --- DELETE IMMIGRATION RECORD ---
export const deleteImmigrationRecord = async (req, res) => {
    const { immId } = req.params;
    
    try {
        await pool.query(`DELETE FROM employee_immigrations WHERE id = ?`, [immId]);
        res.json({ message: "Immigration record deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};