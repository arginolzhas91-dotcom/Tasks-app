import { useState } from 'react'

const CAT_COLORS = [
  '#7A3525', '#1C3560', '#294530', '#5C3D10',
  '#6B3A1A', '#2A4A4A', '#4A3A20', '#3D2250',
  '#5A4A3A', '#2A3A5A', '#3A2A4A', '#4A2A2A',
]

export default function Settings({ user, categories, onSave }) {
  const [cats, setCats] = useState([...categories])
  const [newCat, setNewCat] = useState('')
  const [saved, setSaved] = useState(false)

  if (user.role !== 'admin') return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 24, color: 'var(--border)' }}>Нет доступа</p>
    </div>
  )

  function addCat() {
    const name = newCat.trim()
    if (!name || cats.includes(name)) return
    setCats(prev => [...prev, name])
    setNewCat('')
  }

  function removeCat(cat) { setCats(prev => prev.filter(c => c !== cat)) }

  function moveUp(i) {
    if (i === 0) return
    const next = [...cats];[next[i-1], next[i]] = [next[i], next[i-1]]; setCats(next)
  }

  function moveDown(i) {
    if (i === cats.length - 1) return
    const next = [...cats];[next[i], next[i+1]] = [next[i+1], next[i]]; setCats(next)
  }

  async function save() {
    await onSave(cats)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div style={{ padding: '24px 20px 120px' }}>
      <h2 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 36, color: 'var(--text)', marginBottom: 8 }}>Настройки</h2>
      <p style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1, marginBottom: 32 }}>ТОЛЬКО ДЛЯ АДМИНИСТРАТОРА</p>

      <div style={{ marginBottom: 32 }}>
        <p style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', marginBottom: 16, textTransform: 'uppercase' }}>Разделы</p>
        {cats.map((cat, i) => (
          <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 8 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <button onClick={() => moveUp(i)} style={{ background: 'none', border: 'none', cursor: i === 0 ? 'default' : 'pointer', color: i === 0 ? 'var(--border)' : 'var(--text3)', fontSize: 12, lineHeight: 1, padding: '1px 4px' }}>▲</button>
              <button onClick={() => moveDown(i)} style={{ background: 'none', border: 'none', cursor: i === cats.length-1 ? 'default' : 'pointer', color: i === cats.length-1 ? 'var(--border)' : 'var(--text3)', fontSize: 12, lineHeight: 1, padding: '1px 4px' }}>▼</button>
            </div>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: CAT_COLORS[i % CAT_COLORS.length], flexShrink: 0 }} />
            <span style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: 'var(--text)' }}>{cat}</span>
            <button onClick={() => removeCat(cat)} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 20, lineHeight: 1, padding: '0 4px' }}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input value={newCat} onChange={e => setNewCat(e.target.value)} onKeyDown={e => e.key === 'Enter' && addCat()} placeholder="новый раздел"
            style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none' }} />
          <button onClick={addCat} style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '0 18px', cursor: 'pointer', fontSize: 20 }}>+</button>
        </div>
      </div>

      <div style={{ marginBottom: 32, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 12, padding: '16px' }}>
        <p style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', marginBottom: 12, textTransform: 'uppercase' }}>Пароли</p>
        {[
          { name: 'Олжас', pass: 'olzhas2026', access: 'Всё' },
          { name: 'Ассистент', pass: 'assist2026', access: 'Бытовые' },
          { name: 'Винлайн', pass: 'win2026', access: 'Winline' },
          { name: 'Талдау', pass: 'taldau2026', access: 'Талдау' },
          { name: 'Unideas', pass: 'uni2026', access: 'Unideas' },
        ].map(u => (
          <div key={u.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid var(--border)' }}>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--text)' }}>{u.name}</span>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: 'var(--text3)' }}>{u.pass}</span>
          </div>
        ))}
        <p style={{ fontSize: 10, color: 'var(--text3)', marginTop: 10 }}>Чтобы изменить пароли — напиши Клоду</p>
      </div>

      <button onClick={save} style={{ width: '100%', padding: '16px', background: saved ? '#294530' : 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 22, transition: 'background 0.3s' }}>
        {saved ? 'Сохранено ✓' : 'Сохранить'}
      </button>
    </div>
  )
}
