import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createClient = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        const { client_name, website, contacts } = req.body; 
        const orgId = req.user.orgId;
        const creatorId = req.user.id;

        const clientId = uuidv4();
        
        await connection.query(
            `INSERT INTO clients (id, organization_id, client_name, website, created_by, updated_by) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [clientId, orgId, client_name, website, creatorId, creatorId]
        );

        if (contacts && Array.isArray(contacts) && contacts.length > 0) {
            for (const contact of contacts) {
                const contactId = uuidv4();
                await connection.query(
                    `INSERT INTO client_contacts 
                    (id, client_id, contact_name, contact_title, contact_email, contact_phone, is_primary, created_by, updated_by) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        contactId, 
                        clientId, 
                        contact.contact_name, 
                        contact.contact_title || null, // NEW FIELD
                        contact.contact_email, 
                        contact.contact_phone || null, 
                        contact.is_primary || false, 
                        creatorId, 
                        creatorId
                    ]
                );
            }
        }

        await connection.commit();
        res.status(201).json({ message: "Client and contacts registered successfully." });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const getClients = async (req, res) => {
    try {
        const [clients] = await pool.query(`
            SELECT 
                c.id, c.organization_id, c.client_name, c.website, c.created_at,
                COALESCE(
                    JSON_ARRAYAGG(
                        IF(cc.id IS NOT NULL,
                            JSON_OBJECT(
                                'id', cc.id,
                                'contact_name', cc.contact_name,
                                'contact_title', cc.contact_title, -- NEW FIELD
                                'contact_email', cc.contact_email,
                                'contact_phone', cc.contact_phone,
                                'is_primary', cc.is_primary
                            ),
                            NULL
                        )
                    ), '[]'
                ) AS contacts
            FROM clients c
            LEFT JOIN client_contacts cc ON c.id = cc.client_id
            WHERE c.organization_id = ?
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `, [req.user.orgId]);
        
        const formattedClients = clients.map(client => {
            let parsedContacts = client.contacts;
            
            if (typeof parsedContacts === 'string') {
                try { parsedContacts = JSON.parse(parsedContacts); } 
                catch (e) { parsedContacts = []; }
            }
            
            if (Array.isArray(parsedContacts)) {
                parsedContacts = parsedContacts.filter(c => c !== null);
            } else {
                parsedContacts = [];
            }

            return {
                ...client,
                contacts: parsedContacts
            };
        });

        res.json(formattedClients);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updateClient = async (req, res) => {
    const { id } = req.params;
    const { client_name, website, contacts } = req.body;
    
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();

        await connection.query(
            `UPDATE clients SET client_name=?, website=?, updated_by=?
             WHERE id = ? AND organization_id = ?`,
            [client_name, website, req.user.id, id, req.user.orgId]
        );

        if (contacts && Array.isArray(contacts)) {
            await connection.query('DELETE FROM client_contacts WHERE client_id = ?', [id]);
            
            for (const contact of contacts) {
                const contactId = uuidv4();
                await connection.query(
                    `INSERT INTO client_contacts 
                    (id, client_id, contact_name, contact_title, contact_email, contact_phone, is_primary, created_by, updated_by) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        contactId, 
                        id, 
                        contact.contact_name, 
                        contact.contact_title || null, // NEW FIELD
                        contact.contact_email, 
                        contact.contact_phone || null, 
                        contact.is_primary || false, 
                        req.user.id, 
                        req.user.id
                    ]
                );
            }
        }

        await connection.commit();
        res.json({ message: "Client updated successfully" });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const deleteClient = async (req, res) => {
    const { id } = req.params;
    if (req.user.role !== 'ORG_ADMIN') return res.status(403).json({ message: "Unauthorized" });

    try {
        await pool.query('DELETE FROM clients WHERE id = ? AND organization_id = ?', [id, req.user.orgId]);
        res.json({ message: "Client and associated contacts removed successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};