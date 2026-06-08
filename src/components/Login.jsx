import { useState } from 'react'
import { USERS } from '../users'

export default function Login({ onLogin }) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [shake, setShake] = useState(false)

  function attempt() {
    const user = USERS.find(u => u.password === password.trim())
    if (user) onLogin(user)
    else { setError(true); setShake(true); setTimeout(() => setShake(false), 500) }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', padding: '32px 24px' }}>
      <div style={{ width: '100%', maxWidth: 320, textAlign: 'center' }}>
        <h1 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 64, lineHeight: 1, color: 'var(--text)', marginBottom: 8 }}>Задачи</h1>
        <p style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 2, marginBottom: 48 }}>КОМАНДА</p>
        <div style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}>
          <style>{`@keyframes shake{0%,100%{transform:translateX(0)}20%,60%{transform:translateX(-6px)}40%,80%{transform:translateX(6px)}}`}</style>
          <input type="password" placeholder="пароль" value={password}
            onChange={e => { setPassword(e.target.value); setError(false) }}
            onKeyDown={e => e.key === 'Enter' && attempt()}
            style={{ width: '100%', background: 'var(--bg2)', border: `1px solid ${error ? '#8B3A2A' : 'var(--border)'}`, color: 'var(--text)', padding: '14px 16px', fontSize: 14, fontFamily: "'IBM Plex Mono', monospace", outline: 'none', borderRadius: 8, textAlign: 'center', letterSpacing: 4, marginBottom: 12 }}
            autoFocus />
          {error && <p style={{ fontSize: 11, color: '#8B3A2A', letterSpacing: 1, marginBottom: 12 }}>неверный пароль</p>}
          <button onClick={attempt}
            style={{ width: '100%', background: 'var(--text)', color: 'var(--bg)', border: 'none', padding: '14px', fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 20, fontWeight: 400, letterSpacing: 1, borderRadius: 8, cursor: 'pointer' }}>
            Войти
          </button>
        </div>
      </div>
    </div>
  )
}
