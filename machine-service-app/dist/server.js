import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import bcrypt from 'bcrypt';
import { z } from 'zod';
import XLSX from 'xlsx';
import { db } from './db.js';
import { authMiddleware, requireRole, signToken } from './auth.js';
const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(helmet());
// Seed default admin if not exists
(function seedAdmin() {
    const existing = db.prepare("SELECT id FROM users WHERE role = 'admin' LIMIT 1").get();
    if (!existing) {
        const password_hash = bcrypt.hashSync('admin123', 10);
        db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)')
            .run('Admin', 'admin@example.com', password_hash, 'admin');
        console.log('Seeded default admin: admin@example.com / admin123');
    }
})();
// Helpers
function getUserByEmail(email) {
    return db.prepare('SELECT * FROM users WHERE email = ?').get(email);
}
function getWorkerByUserId(userId) {
    return db.prepare('SELECT * FROM workers WHERE user_id = ?').get(userId);
}
// Auth routes
const registerSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    password: z.string().min(6),
    role: z.enum(['admin', 'worker'])
});
app.post('/api/auth/register', (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { name, email, password, role } = parsed.data;
    const existing = getUserByEmail(email);
    if (existing)
        return res.status(409).json({ error: 'Email already registered' });
    const password_hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)').run(name, email, password_hash, role);
    if (role === 'worker') {
        // Auto-create worker row
        db.prepare('INSERT INTO workers (user_id, active) VALUES (?,1)').run(info.lastInsertRowid);
    }
    const token = signToken({ id: Number(info.lastInsertRowid), role, name });
    return res.json({ token, user: { id: info.lastInsertRowid, name, email, role } });
});
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
app.post('/api/auth/login', (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { email, password } = parsed.data;
    const user = getUserByEmail(email);
    if (!user)
        return res.status(401).json({ error: 'Invalid credentials' });
    const ok = bcrypt.compareSync(password, user.password_hash);
    if (!ok)
        return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken({ id: user.id, role: user.role, name: user.name });
    return res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
});
// Admin: create worker user and profile
const createWorkerSchema = z.object({ name: z.string().min(1), email: z.string().email(), password: z.string().min(6), phone: z.string().optional() });
app.post('/api/admin/workers', authMiddleware, requireRole('admin'), (req, res) => {
    const parsed = createWorkerSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const { name, email, password, phone } = parsed.data;
    const existing = getUserByEmail(email);
    if (existing)
        return res.status(409).json({ error: 'Email already registered' });
    const password_hash = bcrypt.hashSync(password, 10);
    const info = db.prepare('INSERT INTO users (name, email, password_hash, role) VALUES (?,?,?,?)').run(name, email, password_hash, 'worker');
    db.prepare('INSERT INTO workers (user_id, phone, active) VALUES (?,?,1)').run(info.lastInsertRowid, phone ?? null);
    return res.json({ id: info.lastInsertRowid, name, email, role: 'worker', phone: phone ?? null });
});
app.get('/api/admin/workers', authMiddleware, requireRole('admin'), (req, res) => {
    const rows = db.prepare('SELECT w.id as worker_id, u.id as user_id, u.name, u.email, w.phone, w.active FROM workers w JOIN users u ON u.id = w.user_id').all();
    return res.json(rows);
});
app.patch('/api/admin/workers/:workerId', authMiddleware, requireRole('admin'), (req, res) => {
    const workerId = Number(req.params.workerId);
    const { phone, active } = req.body ?? {};
    const stmt = db.prepare('UPDATE workers SET phone = COALESCE(?, phone), active = COALESCE(?, active) WHERE id = ?');
    stmt.run(phone ?? null, typeof active === 'number' ? active : null, workerId);
    return res.json({ ok: true });
});
// Reports
const reportSchema = z.object({
    customer_name: z.string().min(1),
    customer_address: z.string().optional(),
    issue_description: z.string().optional(),
    visit_date: z.string().min(1), // expect ISO date
    expenses: z.number().nonnegative().default(0),
    amount_collected: z.number().nonnegative().default(0),
    notes: z.string().optional()
});
app.post('/api/reports', authMiddleware, requireRole('worker'), (req, res) => {
    const parsed = reportSchema.safeParse(req.body);
    if (!parsed.success)
        return res.status(400).json({ error: parsed.error.flatten() });
    const userId = req.user.id;
    const worker = getWorkerByUserId(userId);
    if (!worker)
        return res.status(400).json({ error: 'Worker profile not found' });
    const { customer_name, customer_address, issue_description, visit_date, expenses, amount_collected, notes } = parsed.data;
    const amount_due = Math.max(0, (expenses ?? 0) - (amount_collected ?? 0));
    const info = db.prepare(`INSERT INTO reports (worker_id, customer_name, customer_address, issue_description, visit_date, expenses, amount_collected, amount_due, notes) VALUES (?,?,?,?,?,?,?,?,?)`).run(worker.id, customer_name, customer_address ?? null, issue_description ?? null, visit_date, expenses ?? 0, amount_collected ?? 0, amount_due, notes ?? null);
    return res.json({ id: info.lastInsertRowid });
});
app.get('/api/reports/my', authMiddleware, requireRole('worker'), (req, res) => {
    const worker = getWorkerByUserId(req.user.id);
    if (!worker)
        return res.status(400).json({ error: 'Worker profile not found' });
    const rows = db.prepare('SELECT * FROM reports WHERE worker_id = ? ORDER BY visit_date DESC').all(worker.id);
    return res.json(rows);
});
app.get('/api/admin/reports', authMiddleware, requireRole('admin'), (req, res) => {
    const rows = db.prepare(`SELECT r.*, u.name as worker_name, u.email as worker_email FROM reports r JOIN workers w ON w.id = r.worker_id JOIN users u ON u.id = w.user_id ORDER BY r.visit_date DESC`).all();
    return res.json(rows);
});
app.patch('/api/reports/:id', authMiddleware, (req, res) => {
    const id = Number(req.params.id);
    const row = db.prepare('SELECT r.*, w.user_id FROM reports r JOIN workers w ON w.id = r.worker_id WHERE r.id = ?').get(id);
    if (!row)
        return res.status(404).json({ error: 'Not found' });
    if (req.user.role !== 'admin' && req.user.id !== row.user_id)
        return res.status(403).json({ error: 'Forbidden' });
    const { expenses, amount_collected, notes } = req.body ?? {};
    const amount_due = typeof expenses === 'number' && typeof amount_collected === 'number' ? Math.max(0, expenses - amount_collected) : row.amount_due;
    db.prepare('UPDATE reports SET expenses = COALESCE(?, expenses), amount_collected = COALESCE(?, amount_collected), amount_due = ?, notes = COALESCE(?, notes) WHERE id = ?')
        .run(typeof expenses === 'number' ? expenses : null, typeof amount_collected === 'number' ? amount_collected : null, amount_due, notes ?? null, id);
    return res.json({ ok: true });
});
// Excel export (admin)
app.get('/api/admin/export/payments.xlsx', authMiddleware, requireRole('admin'), (req, res) => {
    const rows = db.prepare(`SELECT r.visit_date, u.name as worker_name, r.customer_name, r.expenses, r.amount_collected, r.amount_due, r.notes FROM reports r JOIN workers w ON w.id = r.worker_id JOIN users u ON u.id = w.user_id ORDER BY r.visit_date DESC`).all();
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Payments');
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    res.setHeader('Content-Disposition', 'attachment; filename="payments.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    return res.send(buffer);
});
// Health
app.get('/api/health', (_req, res) => res.json({ ok: true }));
const PORT = Number(process.env.PORT || 4000);
app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
});
//# sourceMappingURL=server.js.map