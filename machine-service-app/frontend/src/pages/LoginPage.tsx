import { useState } from 'react'
import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000'

export function LoginPage() {
  const [email, setEmail] = useState('admin@example.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState<string | null>(null)
  const setAuth = useAuthStore((s) => s.setAuth)
  const navigate = useNavigate()

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password })
      setAuth(res.data.user, res.data.token)
      navigate(res.data.user.role === 'admin' ? '/admin' : '/worker', { replace: true })
    } catch (err: any) {
      setError(err?.response?.data?.error || 'Login failed')
    }
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>
      <form onSubmit={onSubmit} style={{ width: 360, padding: 24, border: '1px solid #ddd', borderRadius: 8 }}>
        <h2>Login</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <label>
            <div>Email</div>
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required style={{ width: '100%' }} />
          </label>
          <label>
            <div>Password</div>
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required style={{ width: '100%' }} />
          </label>
          {error && <div style={{ color: 'red' }}>{error}</div>}
          <button type="submit">Sign in</button>
        </div>
      </form>
    </div>
  )
}