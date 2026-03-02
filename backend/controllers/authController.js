import pool from '../config/db.js';
import jwt from 'jsonwebtoken';
import { sendPasswordResetEmail } from '../utils/mailer.js';
import { encryptPassword, decryptPassword } from '../utils/crypto.js'; // NEW IMPORT

export const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const [users] = await pool.query(`
            SELECT u.*, o.is_active as org_active 
            FROM users u 
            LEFT JOIN organizations o ON u.organization_id = o.id 
            WHERE u.email = ?
        `, [email]);
        
        const user = users[0];

        // NEW DECRYPTION LOGIC
        if (!user) return res.status(401).json({ message: "Invalid credentials" });
        
        const decryptedPassword = decryptPassword(user.password_hash);
        
        if (decryptedPassword !== password) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.role !== 'SUPER_ADMIN' && user.org_active === 0) {
            return res.status(403).json({ message: "Your organization account has been suspended. Please contact support." });
        }

        if (!user.is_active) {
            return res.status(403).json({ message: "Your individual account has been deactivated. Please contact your HR manager." });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role, orgId: user.organization_id },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.cookie('token', token, {
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'Lax', 
            maxAge: 24 * 60 * 60 * 1000 
        });

        res.json({
            message: "Login successful",
            user: { email: user.email, role: user.role, orgId: user.organization_id }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ... keep logout, forgotPassword, and verifyResetCode the same ...

export const resetPassword = async (req, res) => {
    const { email, code, newPassword } = req.body;
    try {
        const [users] = await pool.query(
            'SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_expiry > NOW()',
            [email, code]
        );
        if (users.length === 0) return res.status(400).json({ message: "Session expired." });

        // NEW ENCRYPTION LOGIC
        const encryptedPw = encryptPassword(newPassword);
        
        await pool.query(
            'UPDATE users SET password_hash = ?, reset_code = NULL, reset_expiry = NULL WHERE email = ?',
            [encryptedPw, email]
        );

        res.json({ message: "Password updated successfully. Please login." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const logout = (req, res) => {
    res.cookie('token', '', { httpOnly: true, expires: new Date(0), secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    res.status(200).json({ message: "Logged out successfully" });
};

export const forgotPassword = async (req, res) => {
    const { email } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) return res.status(404).json({ message: "User not found" });

        const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit code
        const expiry = new Date(Date.now() + 15 * 60 * 1000); // 15 mins

        await pool.query('UPDATE users SET reset_code = ?, reset_expiry = ? WHERE email = ?', [code, expiry, email]);
        await sendPasswordResetEmail(email, code);

        res.json({ message: "Reset code sent to your email." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verifyResetCode = async (req, res) => {
    const { email, code } = req.body;
    try {
        const [users] = await pool.query('SELECT * FROM users WHERE email = ? AND reset_code = ? AND reset_expiry > NOW()', [email, code]);
        if (users.length === 0) return res.status(400).json({ message: "Invalid or expired code." });
        res.json({ message: "Code verified. You can now change your password." });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};