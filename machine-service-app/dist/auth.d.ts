import type { Request, Response, NextFunction } from 'express';
type JwtPayload = {
    id: number;
    role: 'admin' | 'worker';
    name: string;
};
export declare function signToken(payload: JwtPayload): string;
export declare function authMiddleware(req: Request & {
    user?: JwtPayload;
}, res: Response, next: NextFunction): Response<any, Record<string, any>> | undefined;
export declare function requireRole(role: 'admin' | 'worker'): (req: Request & {
    user?: JwtPayload;
}, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
export {};
//# sourceMappingURL=auth.d.ts.map