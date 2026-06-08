import { useState, useEffect } from 'react'
import { ref as dbRef, onValue, set } from 'firebase/database'
import { db } from './firebase'
import Login from './components/Login'
import Tasks from './components/Tasks'
import History from './components/History'
import Birthdays from './components/Birthdays'
import Settings from './components/Settings'
import { DEFAULT_CATEGORIES } from './users'

const TABS = [
  { id: 'tasks',     label: 'Задачи',    icon: '◈' },
  { id: 'history',   label: 'История',   icon: '◷' },
  { id: 'birthdays', label: 'Команда',   icon: '◉' },
  { id: 'settings',  label: 'Настройки', icon: '◎' },
]

export default function App() {
  const [user, setUser]             = useState(null)
  const [tab, setTab]               = useState('tasks')
  const [tasks, setTasks]           = useState({})
  const [birthdays, setBirthdays]   = useState({})
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES)
  const [loading, setLoading]       = useState(true)

  useEffect(() => {
    try { const s = localStorage.getItem('session'); if (s) setUser(JSON.parse(s)) } catch {}
  }, [])

  useEffect(() => {
    if (!user) return
    const u1 = onValue(dbRef(db, 'tasks'),      snap => { setTasks(snap.val() || {}); setLoading(false) })
    const u2 = onValue(dbRef(db, 'birthdays'),  snap => { setBirthdays(snap.val() || {}) })
    const u3 = onValue(dbRef(db, 'categories'), snap => {
      const val = snap.val()
      if (val && Array.isArray(val)) setCategories(val)
      else setCategories(DEFAULT_CATEGORIES)
    })
    return () => { u1(); u2(); u3() }
  }, [user])

  function login(u) { setUser(u); try { localStorage.setItem('session', JSON.stringify(u)) } catch {} }
  function logout() { setUser(null); try { localStorage.removeItem('session') } catch {} }

  async function saveCategories(cats) {
    setCategories(cats)
    await set(dbRef(db, 'categories'), cats)
  }

  if (!user) return <Login onLogin={login} />

  const openCount = Object.values(tasks).filter(t => !t.done).length
  const visibleTabs = user.role === 'admin' ? TABS : TABS.filter(t => t.id !== 'settings')

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top) + 12px) 20px 12px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--bg)', position: 'sticky', top: 0, zIndex: 50 }}>
        <h1 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 32, lineHeight: 1, color: 'var(--text)' }}>Задачи</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 11, color: 'var(--text3)', letterSpacing: 1 }}>{user.name}</span>
          <button onClick={logout} style={{ background: 'none', border: '1px solid var(--border)', borderRadius: 6, padding: '4px 10px', fontSize: 10, color: 'var(--text3)', cursor: 'pointer', letterSpacing: 1 }}>выйти</button>
        </div>
      </div>
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {tab === 'tasks'     && <Tasks     user={user} tasks={tasks} categories={categories} />}
        {tab === 'history'   && <History   user={user} tasks={tasks} categories={categories} />}
        {tab === 'birthdays' && <Birthdays user={user} birthdays={birthdays} />}
        {tab === 'settings'  && <Settings  user={user} categories={categories} onSave={saveCategories} />}
      </div>
      <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--bg)', borderTop: '1px solid var(--border)', display: 'flex', paddingBottom: 'env(safe-area-inset-bottom)', zIndex: 50 }}>
        {visibleTabs.map(t => {
          const active = tab === t.id
          const badge = t.id === 'tasks' && openCount > 0 ? openCount : null
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '12px 8px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, position: 'relative' }}>
              <span style={{ fontSize: 20, color: active ? 'var(--text)' : 'var(--text3)' }}>{t.icon}</span>
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, letterSpacing: 1, color: active ? 'var(--text)' : 'var(--text3)', textTransform: 'uppercase' }}>{t.label}</span>
              {badge !== null && <div style={{ position: 'absolute', top: 8, right: 'calc(50% - 14px)', background: '#7A3525', color: 'var(--bg)', borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9 }}>{badge}</div>}
              {active && <div style={{ position: 'absolute', top: 0, left: '25%', right: '25%', height: 2, background: 'var(--text)', borderRadius: 2 }} />}
            </button>
          )
        })}
      </div>
    </div>
  )
}
