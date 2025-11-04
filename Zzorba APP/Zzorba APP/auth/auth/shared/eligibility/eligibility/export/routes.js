import express from 'express';
import ExcelJS from 'exceljs';
import db from '../db.js';
import { requireAuth, requireAdmin } from '../auth/middleware.js';

const router = express.Router();

router.get('/excel', requireAuth, requireAdmin, async (req, res) => {
    const rows = db.prepare(`
    SELECT s.id, s.created_at, u.email as user_email, s.payload_json, s.eligibility_json
    FROM submissions s
    JOIN users u ON u.id = s.user_id
    ORDER BY s.created_at DESC
  `).all();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Submissions');

    sheet.columns = [
        { header: 'Submission ID', key: 'id', width: 36 },
        { header: 'Created At', key: 'created_at', width: 24 },
        { header: 'User Email', key: 'user_email', width: 30 },
        { header: 'Input JSON', key: 'payload_json', width: 80 },
        { header: 'Eligibility JSON', key: 'eligibility_json', width: 80 },
    ];

    for (const r of rows) sheet.addRow(r);

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="submissions.xlsx"');

    await workbook.xlsx.write(res);
    res.end();
});

export default router;