import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
	fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'app.db');
export const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name TEXT NOT NULL,
	email TEXT UNIQUE NOT NULL,
	password_hash TEXT NOT NULL,
	role TEXT NOT NULL CHECK(role IN ('admin','worker')),
	created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS workers (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	user_id INTEGER NOT NULL UNIQUE,
	phone TEXT,
	active INTEGER NOT NULL DEFAULT 1,
	FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS reports (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	worker_id INTEGER NOT NULL,
	customer_name TEXT NOT NULL,
	customer_address TEXT,
	issue_description TEXT,
	visit_date TEXT NOT NULL,
	expenses REAL NOT NULL DEFAULT 0,
	amount_collected REAL NOT NULL DEFAULT 0,
	amount_due REAL NOT NULL DEFAULT 0,
	notes TEXT,
	created_at TEXT NOT NULL DEFAULT (datetime('now')),
	FOREIGN KEY(worker_id) REFERENCES workers(id) ON DELETE CASCADE
);
`);

export type UserRow = {
	id: number;
	name: string;
	email: string;
	password_hash: string;
	role: 'admin' | 'worker';
	created_at: string;
};

export type WorkerRow = {
	id: number;
	user_id: number;
	phone: string | null;
	active: 0 | 1;
};

export type ReportRow = {
	id: number;
	worker_id: number;
	customer_name: string;
	customer_address: string | null;
	issue_description: string | null;
	visit_date: string; // ISO date string
	expenses: number;
	amount_collected: number;
	amount_due: number;
	notes: string | null;
	created_at: string;
};