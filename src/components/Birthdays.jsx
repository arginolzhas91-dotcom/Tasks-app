import { useState } from 'react'
import { ref as dbRef, push, remove } from 'firebase/database'
import { db } from '../firebase'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const [m, d] = dateStr.split('-').map(Number)
  const today = new Date()
  let next = new Date(today.getFullYear(), m - 1, d)
  if (next < today) next.setFullYear(today.getFullYear() + 1)
  return Math.round((next - today) / 86400000)
}

function fmtBday(dateStr) {
  if (!dateStr) return ''
  const [m, d] = dateStr.split('-').map(Number)
  return new Date(2000, m - 1, d).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })
}

export default function Birthdays({ user, birthdays }) {
  const [modal, setModal] = useState(false)
  const [form, setForm] = useState({ name: '', date: '', role: '' })
  const isAdmin = user.role === 'admin'

  const list = Object.entries(birthdays || {})
    .map(([id, b]) => ({ id, ...b, days: daysUntil(b.date) }))
    .sort((a, b) => a.days - b.days)

  async function add() {
    if (!form.name.trim() || !form.date) return
    await push(dbRef(db, 'birthdays'), form)
    setModal(false); setForm({ name: '', date: '', role: '' })
  }
  async function del(id) { await remove(dbRef(db, `birthdays/${id}`)) }

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 36, color: 'var(--text)' }}>Дни рождения</h2>
        {isAdmin && <button onClick={() => setModal(true)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 8, padding: '6px 12px', fontSize: 11, color: 'var(--text3)', cursor: 'pointer', letterSpacing: 1 }}>+ добавить</button>}
      </div>
      {list.length === 0 ? (
        <p style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 24, color: 'var(--border)', textAlign: 'center', marginTop: 60 }}>Нет записей</p>
      ) : list.map(b => {
        const upcoming = b.days <= 7, today = b.days === 0
        return (
          <div key={b.id} style={{ background: today ? '#F5EAE7' : upcoming ? '#F2EBE0' : 'var(--bg2)', border: `1px solid ${today ? '#D4B0A8' : upcoming ? '#D4C0A0' : 'var(--border)'}`, borderRadius: 14, padding: '16px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: today ? '#8B3A2A' : upcoming ? '#5C3D10' : 'var(--bg3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span style={{ fontFamily: "'Cormorant', serif", fontSize: 22, fontWeight: 600, color: today || upcoming ? 'var(--bg)' : 'var(--text3)' }}>{b.name[0]?.toUpperCase()}</span>
            </div>
            <div style={{ flex: 1 }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, color: 'var(--text)' }}>{b.name}{today && ' 🎂'}</p>
              {b.role && <p style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1.5, marginTop: 2 }}>{b.role.toUpperCase()}</p>}
              <p style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{fmtBday(b.date)}</p>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              {today ? <p style={{ fontSize: 12, color: '#8B3A2A', fontWeight: 500, letterSpacing: 1 }}>СЕГОДНЯ</p> : <p style={{ fontSize: 13, color: upcoming ? '#5C3D10' : 'var(--text3)' }}>через {b.days}д</p>}
              {isAdmin && <button onClick={() => del(b.id)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16, marginTop: 4 }}>×</button>}
            </div>
          </div>
        )
      })}
      {modal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,12,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={() => setModal(false)}>
          <div style={{ width: '100%', background: 'var(--bg)', borderRadius: '20px 20px 0 0', padding: '20px' }} onClick={e => e.stopPropagation()}>
            <h3 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 26, marginBottom: 20 }}>Новый день рождения</h3>
            {[['Имя', 'name', 'Настя'], ['Дата (ММ-ДД)', 'date', '06-15'], ['Роль', 'role', 'Ассистент']].map(([label, key, ph]) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <p style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', marginBottom: 6 }}>{label.toUpperCase()}</p>
                <input placeholder={ph} value={form[key]} onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                  style={{ width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
              </div>
            ))}
            <button onClick={add} style={{ width: '100%', padding: '16px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 22, marginTop: 6 }}>Добавить</button>
          </div>
        </div>
      )}
    </div>
  )
}
