import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export function LoginPage() {
    const [email, setEmail] = useState('admin@example.com');
    const [password, setPassword] = useState('admin123');
    const [error, setError] = useState(null);
    const setAuth = useAuthStore((s) => s.setAuth);
    const navigate = useNavigate();
    async function onSubmit(e) {
        e.preventDefault();
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
            setAuth(res.data.user, res.data.token);
            navigate(res.data.user.role === 'admin' ? '/admin' : '/worker', { replace: true });
        }
        catch (err) {
            setError(err?.response?.data?.error || 'Login failed');
        }
    }
    return (_jsx("div", { style: { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }, children: _jsxs("form", { onSubmit: onSubmit, style: { width: 360, padding: 24, border: '1px solid #ddd', borderRadius: 8 }, children: [_jsx("h2", { children: "Login" }), _jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: 12 }, children: [_jsxs("label", { children: [_jsx("div", { children: "Email" }), _jsx("input", { value: email, onChange: (e) => setEmail(e.target.value), type: "email", required: true, style: { width: '100%' } })] }), _jsxs("label", { children: [_jsx("div", { children: "Password" }), _jsx("input", { value: password, onChange: (e) => setPassword(e.target.value), type: "password", required: true, style: { width: '100%' } })] }), error && _jsx("div", { style: { color: 'red' }, children: error }), _jsx("button", { type: "submit", children: "Sign in" })] })] }) }));
}
//# sourceMappingURL=LoginPage.js.map