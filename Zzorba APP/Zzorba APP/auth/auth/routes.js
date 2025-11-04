import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db, { newId } from '../db.js';
import { requireAuth, requireAdmin } from './middleware.js';
import { notifyAdminOnSignup, notifyUserOnApproval } from '../mailer.js';

const router = express.Router();

router.post('/signup', async (req, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const id = newId();
    const password_hash = await bcrypt.hash(password, 12);
    try {
        db.prepare(
            'INSERT INTO users (id, email, password_hash, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(id, email.toLowerCase(), password_hash, 'user', 'pending', new Date().toISOString());
        notifyAdminOnSignup({ email }).catch(() => { });
        res.json({ ok: true, message: 'Signup received. Await admin approval.' });
    } catch (e) {
        if (String(e).includes('UNIQUE')) return res.status(409).json({ error: 'Email already exists' });
        res.status(500).json({ error: 'Signup failed' });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body || {};
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email?.toLowerCase());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password || '', user.password_hash);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.status !== 'approved') return res.status(403).json({ error: `Account status: ${user.status}` });

    const token = jwt.sign({ sub: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ token });
});

router.get('/admin/users', requireAuth, requireAdmin, (req, res) => {
    const { status = 'pending' } = req.query;
    const rows = db.prepare('SELECT id, email, role, status, created_at FROM users WHERE status = ?').all(status);
    res.json(rows);
});

router.post('/admin/users/:id/approve', requireAuth, requireAdmin, (req, res) => {
    const id = req.params.id;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (user.status === 'approved') return res.json({ ok: true, message: 'Already approved' });

    db.prepare('UPDATE users SET status = ? WHERE id = ?').run('approved', id);
    notifyUserOnApproval({ email: user.email }).catch(() => { });
    res.json({ ok: true });
});

router.post('/admin/users/:id/make-admin', requireAuth, requireAdmin, (req, res) => {
    const id = req.params.id;
    const result = db.prepare('UPDATE users SET role = ? WHERE id = ?').run('admin', id);
    if (!result.changes) return res.status(404).json({ error: 'User not found' });
    res.json({ ok: true });
});

export default router;