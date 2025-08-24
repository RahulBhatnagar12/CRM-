import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
export function WorkerDashboard() {
    const { token, logout, user } = useAuthStore();
    const [reports, setReports] = useState([]);
    const [form, setForm] = useState({
        customer_name: '',
        customer_address: '',
        issue_description: '',
        visit_date: new Date().toISOString().slice(0, 10),
        expenses: 0,
        amount_collected: 0,
        notes: '',
    });
    const navigate = useNavigate();
    useEffect(() => {
        if (!token)
            return;
        axios
            .get(`${API_URL}/api/reports/my`, { headers: { Authorization: `Bearer ${token}` } })
            .then((res) => setReports(res.data));
    }, [token]);
    async function submitReport(e) {
        e.preventDefault();
        if (!token)
            return;
        const payload = {
            ...form,
            expenses: Number(form.expenses),
            amount_collected: Number(form.amount_collected),
            visit_date: form.visit_date,
        };
        await axios.post(`${API_URL}/api/reports`, payload, { headers: { Authorization: `Bearer ${token}` } });
        const res = await axios.get(`${API_URL}/api/reports/my`, { headers: { Authorization: `Bearer ${token}` } });
        setReports(res.data);
        setForm({ customer_name: '', customer_address: '', issue_description: '', visit_date: new Date().toISOString().slice(0, 10), expenses: 0, amount_collected: 0, notes: '' });
    }
    return (_jsxs("div", { style: { padding: 16 }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsx("h2", { children: "Worker Dashboard" }), _jsxs("div", { children: [_jsx("span", { style: { marginRight: 8 }, children: user?.name }), _jsx("button", { onClick: () => { logout(); navigate('/login', { replace: true }); }, children: "Logout" })] })] }), _jsx("h3", { children: "Submit Service Report" }), _jsxs("form", { onSubmit: submitReport, style: { display: 'grid', gap: 8, maxWidth: 720 }, children: [_jsx("input", { placeholder: "Customer name", value: form.customer_name, onChange: (e) => setForm({ ...form, customer_name: e.target.value }), required: true }), _jsx("input", { placeholder: "Customer address", value: form.customer_address, onChange: (e) => setForm({ ...form, customer_address: e.target.value }) }), _jsx("input", { placeholder: "Issue description", value: form.issue_description, onChange: (e) => setForm({ ...form, issue_description: e.target.value }) }), _jsx("div", { children: _jsxs("label", { children: ["Visit date: ", _jsx("input", { type: "date", value: form.visit_date, onChange: (e) => setForm({ ...form, visit_date: e.target.value }), required: true })] }) }), _jsxs("div", { style: { display: 'flex', gap: 8 }, children: [_jsxs("label", { children: ["Expenses: ", _jsx("input", { type: "number", step: "0.01", value: form.expenses, onChange: (e) => setForm({ ...form, expenses: Number(e.target.value) }) })] }), _jsxs("label", { children: ["Amount collected: ", _jsx("input", { type: "number", step: "0.01", value: form.amount_collected, onChange: (e) => setForm({ ...form, amount_collected: Number(e.target.value) }) })] })] }), _jsx("input", { placeholder: "Notes", value: form.notes, onChange: (e) => setForm({ ...form, notes: e.target.value }) }), _jsx("button", { type: "submit", children: "Save report" })] }), _jsx("h3", { style: { marginTop: 24 }, children: "My Reports" }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Date" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Customer" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Expenses" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Collected" }), _jsx("th", { style: { textAlign: 'left', borderBottom: '1px solid #ccc' }, children: "Due" })] }) }), _jsx("tbody", { children: reports.map((r) => (_jsxs("tr", { children: [_jsx("td", { children: r.visit_date }), _jsx("td", { children: r.customer_name }), _jsx("td", { children: r.expenses }), _jsx("td", { children: r.amount_collected }), _jsx("td", { children: r.amount_due })] }, r.id))) })] })] }));
}
//# sourceMappingURL=WorkerDashboard.js.map