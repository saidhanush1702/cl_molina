import pool from '../config/db.js';

export const getAllLookups = async (req, res) => {
    try {
        const [genders] = await pool.query('SELECT id, name FROM lkp_genders ORDER BY id');
        const [employeeTypes] = await pool.query('SELECT id, name FROM lkp_employee_types ORDER BY id');
        const [countries] = await pool.query('SELECT id, name FROM lkp_countries ORDER BY name');
        const [immigrationStatuses] = await pool.query('SELECT id, name FROM lkp_immigration_statuses ORDER BY id');
        const [payTypes] = await pool.query('SELECT id, name FROM lkp_pay_types ORDER BY id');

        res.json({
            genders,
            employeeTypes,
            countries,
            immigrationStatuses,
            payTypes
        });
    } catch (error) {
        console.error("Lookup fetch error:", error);
        res.status(500).json({ error: error.message });
    }
};