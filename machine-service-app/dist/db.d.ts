export declare const db: any;
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
    visit_date: string;
    expenses: number;
    amount_collected: number;
    amount_due: number;
    notes: string | null;
    created_at: string;
};
//# sourceMappingURL=db.d.ts.map