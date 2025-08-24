export type User = {
    id: number;
    name: string;
    email: string;
    role: 'admin' | 'worker';
};
type AuthState = {
    user: User | null;
    token: string | null;
    setAuth: (user: User, token: string) => void;
    logout: () => void;
};
export declare const useAuthStore: import("zustand").UseBoundStore<import("zustand").StoreApi<AuthState>>;
export {};
//# sourceMappingURL=authStore.d.ts.map