import { create } from 'zustand';
export const useAuthStore = create((set) => ({
    user: (() => {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    })(),
    token: localStorage.getItem('token'),
    setAuth: (user, token) => {
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('token', token);
        set({ user, token });
    },
    logout: () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        set({ user: null, token: null });
    },
}));
//# sourceMappingURL=authStore.js.map