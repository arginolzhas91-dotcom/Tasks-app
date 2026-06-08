import { useState, useRef } from 'react'
import { ref as dbRef, push, update, remove } from 'firebase/database'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'
import { db, storage } from '../firebase'
import { CAT_COLOR, getUserCategories } from '../users'

const PRIORITY = {
  high:   { label: 'Высокий', color: '#7A3525' },
  medium: { label: 'Средний', color: '#5C3D10' },
  low:    { label: 'Низкий',  color: '#A09080' },
}

function fmtDate(ds) {
  if (!ds) return null
  const d = new Date(ds)
  const today = new Date(); today.setHours(0,0,0,0)
  const diff = Math.round((d - today) / 86400000)
  const fmt = d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
  return { fmt, diff, overdue: diff < 0, soon: diff >= 0 && diff <= 3 }
}

function TaskCard({ task, taskId, user, onEdit }) {
  const [expanded, setExpanded] = useState(false)
  const [comment, setComment] = useState('')
  const dl = fmtDate(task.deadline)
  const accent = CAT_COLOR[task.category] || '#4A4438'
  const subtasks = task.subtasks ? Object.entries(task.subtasks) : []
  const comments = task.comments ? Object.entries(task.comments) : []
  const doneCount = subtasks.filter(([,s]) => s.done).length

  async function toggleDone() { await update(dbRef(db, `tasks/${taskId}`), { done: !task.done, completedAt: !task.done ? Date.now() : null }) }
  async function toggleSub(sid, val) { await update(dbRef(db, `tasks/${taskId}/subtasks/${sid}`), { done: !val }) }
  async function addComment() {
    if (!comment.trim()) return
    await push(dbRef(db, `tasks/${taskId}/comments`), { text: comment.trim(), author: user.name, ts: Date.now() })
    setComment('')
  }

  return (
    <div style={{ background: 'var(--bg2)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border)', marginBottom: 12, opacity: task.done ? 0.5 : 1 }}>
      {task.imageUrl && <img src={task.imageUrl} alt="" style={{ width: '100%', maxHeight: 220, objectFit: 'cover' }} />}
      <div style={{ padding: '14px 14px 12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: accent }} />
          <span style={{ fontSize: 10, color: accent, letterSpacing: 1.5, fontWeight: 500 }}>{task.category.toUpperCase()}</span>
          <span style={{ marginLeft: 'auto', fontSize: 10, color: PRIORITY[task.priority]?.color }}>{task.priority === 'high' ? '↑↑' : task.priority === 'medium' ? '↑' : '—'}</span>
        </div>
        <p onClick={() => onEdit(taskId, task)} style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, lineHeight: 1.35, color: 'var(--text)', textDecoration: task.done ? 'line-through' : 'none', marginBottom: 8, cursor: 'pointer' }}>{task.text}</p>
        {subtasks.length > 0 && (
          <div style={{ marginBottom: 8 }}>
            <div style={{ height: 3, background: 'var(--border)', borderRadius: 2, marginBottom: 6, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(doneCount / subtasks.length) * 100}%`, background: accent }} />
            </div>
            <span style={{ fontSize: 10, color: 'var(--text3)', letterSpacing: 1 }}>{doneCount}/{subtasks.length} подзадач</span>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {dl && !task.done && <span style={{ fontSize: 10, letterSpacing: 1, color: dl.overdue ? '#7A3525' : dl.soon ? '#5C3D10' : 'var(--text3)', background: dl.overdue ? '#F5EAE7' : dl.soon ? '#F2EBE0' : 'var(--bg3)', padding: '3px 8px', borderRadius: 20 }}>{dl.overdue ? `просрочено ${Math.abs(dl.diff)}д` : dl.diff === 0 ? 'сегодня' : dl.fmt}</span>}
          {task.addedBy && task.addedBy !== 'Олжас' && <span style={{ fontSize: 10, color: 'var(--text3)' }}>+ {task.addedBy}</span>}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <button onClick={() => setExpanded(!expanded)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, color: 'var(--text3)' }}>{comments.length > 0 ? `💬 ${comments.length}` : '💬'}</button>
            <button onClick={toggleDone} style={{ width: 22, height: 22, borderRadius: '50%', border: `1.5px solid ${task.done ? accent : 'var(--border)'}`, background: task.done ? accent : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{task.done && <span style={{ color: 'var(--bg)', fontSize: 10 }}>✓</span>}</button>
          </div>
        </div>
      </div>
      {expanded && (
        <div style={{ borderTop: '1px solid var(--border)', padding: '12px 14px', background: 'var(--bg)' }}>
          {subtasks.length > 0 && <div style={{ marginBottom: 12 }}>{subtasks.map(([sid, sub]) => (
            <div key={sid} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0' }}>
              <button onClick={() => toggleSub(sid, sub.done)} style={{ width: 14, height: 14, borderRadius: 3, border: `1.5px solid ${sub.done ? accent : 'var(--border)'}`, background: sub.done ? accent : 'transparent', cursor: 'pointer', flexShrink: 0 }} />
              <span style={{ color: sub.done ? 'var(--text3)' : 'var(--text)', textDecoration: sub.done ? 'line-through' : 'none', fontFamily: "'Cormorant Garamond', serif", fontSize: 15 }}>{sub.text}</span>
            </div>
          ))}</div>}
          {comments.length > 0 && <div style={{ marginBottom: 10 }}>{comments.sort((a,b) => a[1].ts - b[1].ts).map(([cid, c]) => (
            <div key={cid} style={{ marginBottom: 8 }}>
              <span style={{ fontSize: 10, color: accent, letterSpacing: 1 }}>{c.author} </span>
              <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 14, color: 'var(--text2)' }}>{c.text}</span>
            </div>
          ))}</div>}
          <div style={{ display: 'flex', gap: 8 }}>
            <input value={comment} onChange={e => setComment(e.target.value)} onKeyDown={e => e.key === 'Enter' && addComment()} placeholder="комментарий…" style={{ flex: 1, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text)', outline: 'none' }} />
            <button onClick={addComment} style={{ background: accent, color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '8px 12px', cursor: 'pointer', fontSize: 14 }}>→</button>
          </div>
        </div>
      )}
    </div>
  )
}

const inputStyle = { width: '100%', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text)', padding: '12px 14px', fontSize: 14, fontFamily: 'inherit', outline: 'none', marginBottom: 16, resize: 'none', display: 'block' }
function Label({ children }) { return <p style={{ fontSize: 10, letterSpacing: 2, color: 'var(--text3)', marginBottom: 6, textTransform: 'uppercase' }}>{children}</p> }

function TaskModal({ user, categories, editTask, editId, onClose }) {
  const isEdit = !!editId
  const [form, setForm] = useState(editTask || { text: '', category: categories[0], priority: 'medium', deadline: '' })
  const [subInput, setSubInput] = useState('')
  const [subtasks, setSubtasks] = useState(editTask?.subtasks ? Object.entries(editTask.subtasks).map(([id, s]) => ({ id, ...s })) : [])
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(editTask?.imageUrl || null)
  const [saving, setSaving] = useState(false)
  const fileRef = useRef()

  function pickImage(e) { const f = e.target.files[0]; if (!f) return; setImageFile(f); setImagePreview(URL.createObjectURL(f)) }
  function addSub() { if (!subInput.trim()) return; setSubtasks(p => [...p, { id: Date.now().toString(), text: subInput.trim(), done: false }]); setSubInput('') }

  async function save() {
    if (!form.text.trim()) return
    setSaving(true)
    try {
      let imageUrl = form.imageUrl || null
      if (imageFile) {
        const sRef = storageRef(storage, `tasks/${Date.now()}_${imageFile.name}`)
        await uploadBytes(sRef, imageFile)
        imageUrl = await getDownloadURL(sRef)
      }
      const subObj = {}
      subtasks.forEach(s => { subObj[s.id] = { text: s.text, done: s.done } })
      const data = { ...form, imageUrl, subtasks: subObj, addedBy: user.name, done: isEdit ? (editTask.done || false) : false, createdAt: isEdit ? (editTask.createdAt || Date.now()) : Date.now() }
      if (isEdit) await update(dbRef(db, `tasks/${editId}`), data)
      else await push(dbRef(db, 'tasks'), data)
      onClose()
    } catch(e) { console.error(e); setSaving(false) }
  }
  async function deleteTask() { if (!isEdit) return; await remove(dbRef(db, `tasks/${editId}`)); onClose() }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(20,16,12,0.6)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div style={{ width: '100%', background: 'var(--bg)', borderRadius: '20px 20px 0 0', padding: '20px', maxHeight: '92dvh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ width: 36, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 20px' }} />
        <h2 style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontWeight: 300, fontSize: 28, marginBottom: 20, color: 'var(--text)' }}>{isEdit ? 'Редактировать' : 'Новая задача'}</h2>
        <div style={{ marginBottom: 16 }}>
          {imagePreview ? (
            <div style={{ position: 'relative' }}>
              <img src={imagePreview} style={{ width: '100%', height: 160, objectFit: 'cover', borderRadius: 10 }} />
              <button onClick={() => { setImagePreview(null); setImageFile(null) }} style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 28, height: 28, cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
          ) : (
            <button onClick={() => fileRef.current.click()} style={{ width: '100%', height: 72, background: 'var(--bg2)', border: '1.5px dashed var(--border)', borderRadius: 10, color: 'var(--text3)', fontSize: 12, letterSpacing: 1, cursor: 'pointer' }}>+ добавить картинку</button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={pickImage} />
        </div>
        <Label>Задача</Label>
        <textarea value={form.text} onChange={e => setForm(f => ({ ...f, text: e.target.value }))} rows={3} placeholder="Что нужно сделать?" style={inputStyle} />
        <Label>Раздел</Label>
        <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} style={inputStyle}>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        <Label>Приоритет</Label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
          {Object.entries(PRIORITY).map(([k, cfg]) => (
            <button key={k} onClick={() => setForm(f => ({ ...f, priority: k }))} style={{ flex: 1, padding: '10px 4px', border: `1.5px solid ${form.priority === k ? cfg.color : 'var(--border)'}`, background: form.priority === k ? cfg.color + '22' : 'transparent', color: form.priority === k ? cfg.color : 'var(--text3)', borderRadius: 8, cursor: 'pointer', fontSize: 11, letterSpacing: 1, fontFamily: 'inherit' }}>{cfg.label}</button>
          ))}
        </div>
        <Label>Дедлайн</Label>
        <input type="date" value={form.deadline || ''} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} style={inputStyle} />
        <Label>Подзадачи</Label>
        {subtasks.map((s, i) => (
          <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ flex: 1, fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: 'var(--text2)' }}>{i + 1}. {s.text}</span>
            <button onClick={() => setSubtasks(p => p.filter(x => x.id !== s.id))} style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', fontSize: 16 }}>×</button>
          </div>
        ))}
        <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
          <input value={subInput} onChange={e => setSubInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSub())} placeholder="добавить подзадачу" style={{ ...inputStyle, marginBottom: 0, flex: 1 }} />
          <button onClick={addSub} style={{ background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 8, padding: '0 16px', cursor: 'pointer', fontSize: 18 }}>+</button>
        </div>
        <button onClick={save} disabled={saving} style={{ width: '100%', padding: '16px', background: 'var(--text)', color: 'var(--bg)', border: 'none', borderRadius: 10, cursor: 'pointer', fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 22, marginBottom: 10, opacity: saving ? 0.6 : 1 }}>{saving ? 'Сохранение…' : isEdit ? 'Сохранить' : 'Добавить'}</button>
        {isEdit && <button onClick={deleteTask} style={{ width: '100%', padding: '12px', background: 'transparent', color: '#7A3525', border: '1px solid #D4B0A8', borderRadius: 10, cursor: 'pointer', fontSize: 13, letterSpacing: 1 }}>Удалить задачу</button>}
      </div>
    </div>
  )
}

export default function Tasks({ user, tasks }) {
  const [activeCategory, setActive] = useState('all')
  const [modal, setModal] = useState(false)
  const [editData, setEditData] = useState({ id: null, task: null })
  const categories = getUserCategories(user)

  function openEdit(id, task) { setEditData({ id, task }); setModal(true) }
  function closeModal() { setModal(false); setEditData({ id: null, task: null }) }

  const filtered = Object.entries(tasks || {}).filter(([, t]) => {
    if (t.done) return false
    if (!categories.includes(t.category)) return false
    if (activeCategory !== 'all' && t.category !== activeCategory) return false
    return true
  }).sort((a, b) => { const p = { high: 0, medium: 1, low: 2 }; return (p[a[1].priority] || 1) - (p[b[1].priority] || 1) })

  const col1 = [], col2 = []
  filtered.forEach(([id, t], i) => { if (i % 2 === 0) col1.push([id, t]); else col2.push([id, t]) })

  return (
    <div style={{ paddingBottom: 90 }}>
      <div style={{ display: 'flex', gap: 0, overflowX: 'auto', padding: '0 16px', marginBottom: 20, borderBottom: '1px solid var(--border)' }}>
        {[['all', 'Все'], ...categories.map(c => [c, c])].map(([val, label]) => {
          const active = activeCategory === val
          const color = CAT_COLOR[val] || 'var(--text)'
          return <button key={val} onClick={() => setActive(val)} style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 17, fontWeight: active ? 600 : 300, color: active ? color : 'var(--text3)', background: 'transparent', border: 'none', padding: '12px 14px', cursor: 'pointer', whiteSpace: 'nowrap', borderBottom: active ? `2px solid ${color}` : '2px solid transparent' }}>{label}</button>
        })}
      </div>
      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontFamily: "'Cormorant', serif", fontStyle: 'italic', fontSize: 32, color: 'var(--border)' }}>Всё сделано</p>
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 10, padding: '0 16px', alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>{col1.map(([id, t]) => <TaskCard key={id} task={t} taskId={id} user={user} onEdit={openEdit} />)}</div>
          <div style={{ flex: 1 }}>{col2.map(([id, t]) => <TaskCard key={id} task={t} taskId={id} user={user} onEdit={openEdit} />)}</div>
        </div>
      )}
      <button onClick={() => setModal(true)} style={{ position: 'fixed', bottom: 'calc(80px + env(safe-area-inset-bottom))', right: 20, width: 52, height: 52, borderRadius: '50%', background: 'var(--text)', color: 'var(--bg)', border: 'none', fontSize: 28, cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>+</button>
      {modal && <TaskModal user={user} categories={categories} editTask={editData.task} editId={editData.id} onClose={closeModal} />}
    </div>
  )
}
