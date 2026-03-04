import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { encryptPassword } from '../utils/crypto.js';
import { sendWelcomeEmail } from '../utils/mailer.js';

export const createHR = async (req, res) => {
    const { email, password } = req.body;
    const orgId = req.user.orgId;
    const creatorId = req.user.id;
    const userRole = req.user.role;

    // Security Check: Only ORG_ADMIN can create an HR account
    if (userRole !== 'ORG_ADMIN') {
        return res.status(403).json({ message: "Access Denied: Only Organization Admins can create HR accounts." });
    }

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const userId = uuidv4();
        
        // Encrypt the password using the existing AES logic
        const encryptedPw = encryptPassword(password);

        // Insert directly into the users table with the role 'HR'
        await connection.query(
            `INSERT INTO users (id, organization_id, email, password_hash, role, created_by, updated_by) 
             VALUES (?, ?, ?, ?, 'HR', ?, ?)`,
            [userId, orgId, email, encryptedPw, creatorId, creatorId]
        );

        // Optionally send a welcome email
        await sendWelcomeEmail(email, password, "HR Portal");

        await connection.commit();
        res.status(201).json({ message: "HR account created successfully." });
    } catch (error) {
        await connection.rollback();
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "An account with this email already exists." });
        }
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const getHRs = async (req, res) => {
    const orgId = req.user.orgId;
    
    // Both ORG_ADMIN and HR might need to see the list of HRs
    try {
        const [hrs] = await pool.query(
            `SELECT id, email, is_active, role, created_at 
             FROM users 
             WHERE organization_id = ? AND role = 'HR' 
             ORDER BY created_at DESC`,
            [orgId]
        );
        res.json(hrs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const toggleHRAccess = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    const orgId = req.user.orgId;

    if (req.user.role !== 'ORG_ADMIN') {
        return res.status(403).json({ message: "Access Denied: Only Organization Admins can suspend/restore HR accounts." });
    }

    try {
        await pool.query(
            `UPDATE users SET is_active = ?, updated_by = ? WHERE id = ? AND organization_id = ? AND role = 'HR'`,
            [is_active, req.user.id, id, orgId]
        );
        res.json({ message: `HR account access ${is_active ? 'restored' : 'suspended'} successfully.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const deleteHR = async (req, res) => {
    const { id } = req.params;
    const orgId = req.user.orgId;

    if (req.user.role !== 'ORG_ADMIN') {
        return res.status(403).json({ message: "Access Denied: Only Organization Admins can delete HR accounts." });
    }

    try {
        const [result] = await pool.query('DELETE FROM users WHERE id = ? AND organization_id = ? AND role = \'HR\'', [id, orgId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "HR account not found or you do not have permission." });
        }
        res.json({ message: "HR account deleted successfully." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};