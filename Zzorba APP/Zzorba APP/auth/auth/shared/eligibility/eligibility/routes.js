import express from 'express';
import db, { newId } from '../db.js';
import { requireAuth } from '../auth/middleware.js';
import { calculateEligibility } from './eligibility.js';

const router = express.Router();

router.post('/check', requireAuth, (req, res) => {
    const userId = req.user.sub;
    const payload = req.body || {};

    try {
        const result = calculateEligibility(payload);
        db.prepare(
            'INSERT INTO submissions (id, user_id, payload_json, eligibility_json, created_at) VALUES (?, ?, ?, ?, ?)'
        ).run(
            newId(),
            userId,
            JSON.stringify(payload),
            JSON.stringify(result),
            new Date().toISOString()
        );
        res.json({ result });
    } catch (e) {
        if (e && e.name === 'ValidationError' && Array.isArray(e.errors)) {
            return res.status(400).json({ errors: e.errors });
        }
        return res.status(400).json({ error: 'Eligibility calculation failed', detail: String(e?.message || e) });
    }
});

export default router;