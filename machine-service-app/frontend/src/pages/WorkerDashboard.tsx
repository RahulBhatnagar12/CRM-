import { useEffect, useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

type Report = {
  id: number
  customer_name: string
  customer_address?: string
  issue_description?: string
  visit_date: string
  expenses: number
  amount_collected: number
  amount_due: number
  notes?: string
}

export function WorkerDashboard() {
  const { token, logout, user } = useAuthStore()
  const [reports, setReports] = useState<Report[]>([])
  const [form, setForm] = useState({
    customer_name: '',
    customer_address: '',
    issue_description: '',
    visit_date: new Date().toISOString().slice(0, 10),
    expenses: 0,
    amount_collected: 0,
    notes: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    if (!token) return
    axios
      .get<Report[]>(`${API_URL}/api/reports/my`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setReports(res.data))
  }, [token])

  async function submitReport(e: React.FormEvent) {
    e.preventDefault()
    if (!token) return
    const payload = {
      ...form,
      expenses: Number(form.expenses),
      amount_collected: Number(form.amount_collected),
      visit_date: form.visit_date,
    }
    await axios.post(`${API_URL}/api/reports`, payload, { headers: { Authorization: `Bearer ${token}` } })
    const res = await axios.get<Report[]>(`${API_URL}/api/reports/my`, { headers: { Authorization: `Bearer ${token}` } })
    setReports(res.data)
    setForm({ customer_name: '', customer_address: '', issue_description: '', visit_date: new Date().toISOString().slice(0, 10), expenses: 0, amount_collected: 0, notes: '' })
  }

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Worker Dashboard</h2>
        <div>
          <span style={{ marginRight: 8 }}>{user?.name}</span>
          <button onClick={() => { logout(); navigate('/login', { replace: true }) }}>Logout</button>
        </div>
      </div>

      <h3>Submit Service Report</h3>
      <form onSubmit={submitReport} style={{ display: 'grid', gap: 8, maxWidth: 720 }}>
        <input placeholder="Customer name" value={form.customer_name} onChange={(e) => setForm({ ...form, customer_name: e.target.value })} required />
        <input placeholder="Customer address" value={form.customer_address} onChange={(e) => setForm({ ...form, customer_address: e.target.value })} />
        <input placeholder="Issue description" value={form.issue_description} onChange={(e) => setForm({ ...form, issue_description: e.target.value })} />
        <div>
          <label>
            Visit date: <input type="date" value={form.visit_date} onChange={(e) => setForm({ ...form, visit_date: e.target.value })} required />
          </label>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label>
            Expenses: <input type="number" step="0.01" value={form.expenses} onChange={(e) => setForm({ ...form, expenses: Number(e.target.value) })} />
          </label>
          <label>
            Amount collected: <input type="number" step="0.01" value={form.amount_collected} onChange={(e) => setForm({ ...form, amount_collected: Number(e.target.value) })} />
          </label>
        </div>
        <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        <button type="submit">Save report</button>
      </form>

      <h3 style={{ marginTop: 24 }}>My Reports</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', borderBottom: '1px solid #ccc' }}>Date</th>
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
              <td>{r.customer_name}</td>
              <td>{r.expenses}</td>
              <td>{r.amount_collected}</td>
              <td>{r.amount_due}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}