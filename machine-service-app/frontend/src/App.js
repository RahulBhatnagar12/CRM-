import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboard } from './pages/AdminDashboard';
import { WorkerDashboard } from './pages/WorkerDashboard';
import { useAuthStore } from './store/authStore';
function ProtectedRoute({ children, role }) {
    const { user } = useAuthStore();
    if (!user)
        return _jsx(Navigate, { to: "/login", replace: true });
    if (role && user.role !== role)
        return _jsx(Navigate, { to: user.role === 'admin' ? '/admin' : '/worker', replace: true });
    return children;
}
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/login", replace: true }) }), _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }), _jsx(Route, { path: "/admin", element: _jsx(ProtectedRoute, { role: "admin", children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "/worker", element: _jsx(ProtectedRoute, { role: "worker", children: _jsx(WorkerDashboard, {}) }) }), _jsx(Route, { path: "*", element: _jsx(Navigate, { to: "/login", replace: true }) })] }) }));
}
//# sourceMappingURL=App.js.map