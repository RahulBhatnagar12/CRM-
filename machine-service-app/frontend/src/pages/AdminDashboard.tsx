import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

type Worker = { worker_id: number; user_id: number; name: string; email: string; phone?: string; active: 0 | 1 }

type Report = {
  id: number
  worker_name: string
  worker_email: string
  customer_name: string
  visit_date: string
  expenses: number
  amount_collected: number
  amount_due: number
  notes?: string
}

export function AdminDashboard() {
  const { token, logout, user } = useAuthStore()
  const navigate = useNavigate()
  const [workers, setWorkers] = useState<Worker[]>([])
  const [reports, setReports] = useState<Report[]>([])
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' })

  useEffect(() => {
    if (!token) return
    axios.get(`${API_URL}/api/admin/workers`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => setWorkers(res.data))
    axios.get(`${API_URL}/api/admin/reports`, { headers: { Authorization: `Bearer ${token}` } }).then((res) => setReports(res.data))
  }, [token])

  async function createWorker(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    await axios.post(`${API_URL}/api/admin/workers`, form, { headers: { Authorization: `Bearer ${token}` } })
    const res = await axios.get(`${API_URL}/api/admin/workers`, { headers: { Authorization: `Bearer ${token}` } })
    setWorkers(res.data)
    setForm({ name: '', email: '', password: '', phone: '' })
  }

  async function exportExcel() {
    if (!token) return
    const res = await axios.get(`${API_URL}/api/admin/export/payments.xlsx`, { responseType: 'blob', headers: { Authorization: `Bearer ${token}` } })
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = 'payments.xlsx'
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Admin Dashboard</h2>
        <div>
          <span style={{ marginRight: 8 }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login', { replace: true }) }}>Logout</button>
        </div>
      </div>

      <div style={{ display: 'grid', gap: 24 }}>
        <section>
          <h3>Create Worker</h3>
          <form onSubmit={createWorker} style={{ display: 'grid', gap: 8, maxWidth: 720 }}>
            <input placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            <input placeholder="Password" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            <button type="submit">Create</button>
          </form>
        </section>

        <section>
          <h3>Workers</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Name</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Email</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Phone</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Active</th>
              </tr>
            </thead>
            <tbody>
              {workers.map((w) => (
                <tr key={w.worker_id}>
                  <td>{w.name}</td>
                  <td>{w.email}</td>
                  <td>{w.phone}</td>
                  <td>{w.active ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h3>All Reports</h3>
          <button onClick={exportExcel} style={{ marginBottom: 8 }}>Export to Excel</button>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Date</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Worker</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Customer</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Expenses</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Collected</th>
                <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Due</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id}>
                  <td>{r.visit_date}</td>
                  <td>{r.worker_name} ({r.worker_email})</td>
                  <td>{r.customer_name}</td>
                  <td>{r.expenses}</td>
                  <td>{r.amount_collected}</td>
                  <td>{r.amount_due}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </div>
  )
}