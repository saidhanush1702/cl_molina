import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';
import { sendWelcomeEmail } from '../utils/mailer.js';
import { orgSchema } from '../utils/validators.js';
import { encryptPassword } from '../utils/crypto.js'; // Imported AES encryption

export const createOrganization = async (req, res) => {
    
    const { error, value } = orgSchema.validate(req.body);
    
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }

    const { name, admin_email, domain, address } = value;
    const superAdminId = req.user.id;

    const connection = await pool.getConnection();

    try {
        console.log(` Starting onboarding for: ${name}`);
        
        await connection.beginTransaction();

        const orgId = uuidv4();
        const userId = uuidv4();
        const tempPassword = Math.random().toString(36).slice(-10);
        
        // Changed to AES Encryption (synchronous function)
        const encryptedPw = encryptPassword(tempPassword);

        console.log(" Step 1: Creating Organization record...");
        await connection.query(
            `INSERT INTO organizations (id, name, admin_email, domain, address, created_by, updated_by) 
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [orgId, name, admin_email, domain, address, superAdminId, superAdminId]
        );

        console.log(" Step 2: Creating Admin User record...");
        await connection.query(
            `INSERT INTO users (id, organization_id, email, password_hash, role, created_by, updated_by) 
             VALUES (?, ?, ?, ?, 'ORG_ADMIN', ?, ?)`,
            [userId, orgId, admin_email, encryptedPw, superAdminId, superAdminId] // Using encryptedPw
        );

        console.log(" Step 3: Attempting to send welcome email...");
        await sendWelcomeEmail(admin_email, tempPassword, name);

        await connection.commit();
        console.log(" Success: Transaction committed and email sent.");

        res.status(201).json({ 
            message: "Organization created successfully and credentials have been emailed." 
        });

    } catch (error) {
        if (connection) await connection.rollback();
        
        console.error(" ONBOARDING FAILED:");
        console.error(`Error Message: ${error.message}`);

        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: "Organization or Admin Email already exists." });
        }

        res.status(500).json({ 
            message: "Internal Server Error during organization creation.",
            error: error.message 
        });

    } finally {
        if (connection) connection.release();
    }
};


export const toggleOrgStatus = async (req, res) => {
    const { id } = req.params;
    const { is_active } = req.body;
    try {
        await pool.query('UPDATE organizations SET is_active = ? WHERE id = ?', [is_active, id]);
        res.json({ message: `Organization ${is_active ? 'activated' : 'deactivated'} successfully.` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllOrganizations = async (req, res) => {
    try {
        const [orgs] = await pool.query(`
            SELECT o.*, u.email as admin_email 
            FROM organizations o 
            LEFT JOIN users u ON o.id = u.organization_id AND u.role = 'ORG_ADMIN'
            ORDER BY o.created_at DESC
        `);
        res.json(orgs);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};