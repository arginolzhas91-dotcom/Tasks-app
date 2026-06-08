import { ref as dbRef, update } from 'firebase/database'
import { db } from '../firebase'
import { CAT_COLOR, getUserCategories } from '../users'

export default function History({ user, tasks }) {
  const categories = getUserCategories(user)
  const done = Object.entries(tasks || {})
    .filter(([, t]) => t.done && categories.includes(t.category))
    .sort((a, b) => (b[1].completedAt || 0) - (a[1].completedAt || 0))

  async function reopen(id) {
    await update(dbRef(db, `tasks/${id}`), { done: false })
  }

  if (done.length === 0) return (
    <div style={{ textAlign: 'center', padding: '80px 24px' }}>
      <p style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 32, color: 'var(--border)' }}>Пока ничего</p>
      <p style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1, marginTop: 8 }}>ВЫПОЛНЕННЫЕ ЗАДАЧИ ПОЯВЯТСЯ ЗДЕСЬ</p>
    </div>
  )

  const grouped = {}
  done.forEach(([id, t]) => { if (!grouped[t.category]) grouped[t.category] = []; grouped[t.category].push([id, t]) })

  return (
    <div style={{ padding: '16px 16px 100px' }}>
      <h2 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 36, color: 'var(--text)', marginBottom: 24 }}>История</h2>
      {Object.entries(grouped).map(([cat, items]) => {
        const accent = CAT_COLOR[cat] || 'var(--text2)'
        return (
          <div key={cat} style={{ marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingBottom: 8, borderBottom: `1.5px solid ${accent}22` }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: accent }} />
              <span style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 22, color: accent }}>{cat}</span>
              <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>{items.length}</span>
            </div>
            {items.map(([id, t]) => (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: accent, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ color: 'var(--bg)', fontSize: 10 }}>✓</span>
                </div>
                <span style={{ flex: 1, fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: 'var(--text2)', textDecoration: 'line-through' }}>{t.text}</span>
                <button onClick={() => reopen(id)} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 10, color: 'var(--text3)', cursor: 'pointer', letterSpacing: 1 }}>вернуть</button>
              </div>
            ))}
          </div>
        )
      })}
    </div>
  )
}
