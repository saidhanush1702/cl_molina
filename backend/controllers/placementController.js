import pool from '../config/db.js';
import { v4 as uuidv4 } from 'uuid';

export const createPlacement = async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const data = req.body;
        const orgId = req.user.orgId;
        const creatorId = req.user.id;
        const placementId = uuidv4();

        const [emp] = await connection.query(
            `SELECT e.id AS real_employee_id, u.is_active 
             FROM employees e 
             JOIN users u ON e.user_id = u.id 
             WHERE u.id = ? AND e.organization_id = ?`, 
            [data.employee_id, orgId]
        );

        if (emp.length === 0 || !emp[0].is_active) {
            throw new Error("Cannot create a placement for an inactive or non-existent employee.");
        }

        const realEmployeeId = emp[0].real_employee_id;
        const billRate = parseFloat(data.bill_rate) || 0.00;
        const payRate = parseFloat(data.pay_rate) || 0.00;

        await connection.query(
            `INSERT INTO placements (
                id, organization_id, employee_id, client_id, 
                job_title, placement_code, placement_type, start_date, end_date, status,
                has_timesheets, timesheet_cycle, timesheet_start_date, week_start_day,
                invoice_type, invoice_reference_no, invoice_frequency,
                bill_rate, bill_frequency, pay_rate, pay_frequency, pay_type_id, 
                created_by, updated_by
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                placementId, orgId, realEmployeeId, data.client_id, 
                data.job_title, data.placement_code || null, data.placement_type || 'Primary', data.start_date, data.end_date || null, data.status || 'Active',
                data.has_timesheets || false, data.timesheet_cycle || null, data.timesheet_start_date || null, data.week_start_day || null,
                data.invoice_type || null, data.invoice_reference_no || null, data.invoice_frequency || 'Monthly',
                billRate, data.bill_frequency || 'Hourly', payRate, data.pay_frequency || 'Hourly', data.pay_type_id || null,
                creatorId, creatorId
            ]
        );

        await connection.commit();
        res.status(201).json({ message: "Placement created successfully", id: placementId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
};

export const getPlacements = async (req, res) => {
    try {
        const [placements] = await pool.query(`
            SELECT 
                p.*,
                pt.name as pay_type_name,
                e.first_name, e.last_name, e.employee_code,
                c.client_name
            FROM placements p
            JOIN employees e ON p.employee_id = e.id
            JOIN clients c ON p.client_id = c.id
            LEFT JOIN lkp_pay_types pt ON p.pay_type_id = pt.id
            WHERE p.organization_id = ?
            ORDER BY p.created_at DESC
        `, [req.user.orgId]);
        
        res.json(placements);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const updatePlacement = async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        const billRate = parseFloat(data.bill_rate) || 0.00;
        const payRate = parseFloat(data.pay_rate) || 0.00;

        await pool.query(
            `UPDATE placements SET 
                job_title=?, placement_code=?, placement_type=?, start_date=?, end_date=?, status=?,
                has_timesheets=?, timesheet_cycle=?, timesheet_start_date=?, week_start_day=?,
                invoice_type=?, invoice_reference_no=?, invoice_frequency=?,
                bill_rate=?, bill_frequency=?, pay_rate=?, pay_frequency=?, pay_type_id=?, updated_by=?
             WHERE id = ? AND organization_id = ?`,
            [
                data.job_title, data.placement_code || null, data.placement_type, data.start_date, data.end_date || null, data.status,
                data.has_timesheets || false, data.timesheet_cycle || null, data.timesheet_start_date || null, data.week_start_day || null,
                data.invoice_type || null, data.invoice_reference_no || null, data.invoice_frequency,
                billRate, data.bill_frequency, payRate, data.pay_frequency, data.pay_type_id || null, req.user.id,
                id, req.user.orgId
            ]
        );
        res.json({ message: "Placement updated successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};