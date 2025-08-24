import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export function AdminDashboard() {
    const { token, logout, user } = useAuthStore();
    const navigate = useNavigate();
    const [workers, setWorkers] = useState([]);
    const [reports, setReports] = useState([]);
    const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
    useEffect(() => {
        if (!token)
            return;
        axios.get(`${API_URL}/api/admin/workers`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => setWorkers(res.data));
        axios.get(`${API_URL}/api/admin/reports`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => setReports(res.data));
    }, [token]);
    async function createWorker(e) {
        e.preventDefault();
        if (!token)
            return;
        await axios.post(`${API_URL}/api/admin/workers`, form, { headers: { Authorization: `Bearer ${token}` } });
        const res = await axios.get(`${API_URL}/api/admin/workers`, { headers: { Authorization: `Bearer ${token}` } });
        setWorkers(res.data);
        setForm({ name: '', email: '', password: '', phone: '' });
    }
    async function exportExcel() {
        if (!token)
            return;
        const res = await axios.get(`${API_URL}/api/admin/export/payments.xlsx`, { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } });
        const url = URL.createObjectURL(new Blob([res.data]));
        const a = document.createElement('a');
        a.href = url;
        a.download = 'payments.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
    }
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h2", { children: "Admin Dashboard" }), _jsxs("div", { children: [_jsx("span", { style: { marginRight: 8 }, children: user?.name }), _jsx("button", { onClick: () => { logout(); navigate('/login', { replace: true }); }, children: "Logout" })] })] }), _jsxs("div", { style: { display: 'grid', gap: 24 }, children: [_jsxs("section", { children: [_jsx("h3", { children: "Create Worker" }), _jsxs("form", { onSubmit: createWorker, style: { display: 'grid', gap: 8, maxWidth: 720 }, children: [_jsx("input", { placeholder: "Name", value: form.name, onChange: (e) => setForm({ ...form, name: e.target.value }), required: true }), _jsx("input", { placeholder: "Email", type: "email", value: form.email, onChange: (e) => setForm({ ...form, email: e.target.value }), required: true }), _jsx("input", { placeholder: "Password", type: "password", value: form.password, onChange: (e) => setForm({ ...form, password: e.target.value }), required: true }), _jsx("input", { placeholder: "Phone", value: form.phone, onChange: (e) => setForm({ ...form, phone: e.target.value }) }), _jsx("button", { type: "submit", children: "Create" })] })] }), _jsxs("section", { children: [_jsx("h3", { children: "Workers" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Name" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Email" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Phone" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Active" })] }) }), _jsx("tbody", { children: workers.map((w) => (_jsxs("tr", { children: [_jsx("td", { children: w.name }), _jsx("td", { children: w.email }), _jsx("td", { children: w.phone }), _jsx("td", { children: w.active ? 'Yes' : 'No' })] }, w.worker_id))) })] })] }), _jsxs("section", { children: [_jsx("h3", { children: "All Reports" }), _jsx("button", { onClick: exportExcel, style: { marginBottom: 8 }, children: "Export to Excel" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Date" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Worker" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Customer" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Expenses" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Collected" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Due" })] }) }), _jsx("tbody", { children: reports.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: r.visit_date }), _jsxs("td", { children: [r.worker_name, " (", r.worker_email, ")"] }), _jsx("td", { children: r.customer_name }), _jsx("td", { children: r.expenses }), _jsx("td", { children: r.amount_collected }), _jsx("td", { children: r.amount_due })] }, r.id))) })] })] })] })] }));
}
//# sourceMappingURL=AdminDashboard.js.map