import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';
const JWT_EXPIRES_IN = '7d';

type JwtPayload = { id: number; role: 'admin' | 'worker'; name: string };

export function signToken(payload: JwtPayload): string {
	return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function authMiddleware(req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) {
	const authHeader = req.headers.authorization;
	if (!authHeader || !authHeader.startsWith('Bearer ')) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	const token = authHeader.substring('Bearer '.length);
	try {
		const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
		req.user = decoded;
		next();
	} catch (err) {
		return res.status(401).json({ error: 'Invalid token' });
	}
}

export function requireRole(role: 'admin' | 'worker') {
	return function (req: Request & { user?: JwtPayload }, res: Response, next: NextFunction) {
		if (!req.user) return res.status(401).json({ error: 'Unauthorized' });
		if (req.user.role !== role) return res.status(403).json({ error: 'Forbidden' });
		next();
	};
}