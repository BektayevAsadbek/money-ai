import { useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { AmountSheet, Bar, Ring, Sheet, Switch, TopBar, useToast } from '../components/ui'
import { useStore } from '../data/store'
import { dayMonth, fmt, MONTHS } from '../lib/format'

const until = (iso?: string) => {
  if (!iso) return 'Muddatsiz'
  const d = new Date(iso)
  return d.getMonth() === 11 && d.getDate() === 31 ? '31-dekabrgacha' : `${MONTHS[d.getMonth()].charAt(0).toUpperCase() + MONTHS[d.getMonth()].slice(1)}gacha`
}

export function Goals() {
  const { state, updateProfile, addGoal } = useStore()
  const navigate = useNavigate()
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState('')
  const [target, setTarget] = useState('')
  const total = state.goals.reduce((a, g) => a + g.saved, 0)
  const thisMonth = state.goals.flatMap((g) => g.history).filter((h) => { const d = new Date(h.date), n = new Date(); return d.getMonth() === n.getMonth() && d.getFullYear() === n.getFullYear() }).reduce((a, h) => a + h.amount, 0)
  const t = parseInt(target.replace(/\D/g, ''), 10) || 0

  return (
    <>
      <main className="scroll">
        <TopBar back={-1} right={<button type="button" className="icon-btn" aria-label="Yangi maqsad" onClick={() => setCreating(true)}><Icon name="plus" /></button>} />
        <h1 className="h1">Jamgʻarma</h1>

        <section className="card lg" style={{ gap: 6, borderRadius: 26 }}>
          <span className="caption">Jami jamgʻarilgan</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span className="display" style={{ fontSize: 30 }}>{fmt(total)}</span><span className="muted" style={{ fontSize: 14 }}>soʻm</span></span>
          <span style={{ fontSize: 13, color: 'var(--accent)', fontWeight: 600 }}>Bu oy {thisMonth >= 0 ? '+' : '−'}{fmt(thisMonth)}</span>
        </section>

        <section className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <span className="icon-box" style={{ color: 'var(--accent)' }}><Icon name="repeat" size={20} /></span>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Avtojamgʻarma</span>
            <span className="small muted">Har oyning 5-sanasida {fmt(state.profile.autoSaveAmount)} soʻm</span>
          </span>
          <Switch label="Avtojamgʻarma" checked={state.profile.autoSave} onChange={(v) => updateProfile({ autoSave: v })} />
        </section>

        <h2 className="section-title" style={{ margin: 0 }}>Maqsadlar</h2>
        {state.goals.map((g) => {
          const pct = Math.round((g.saved / g.target) * 100)
          return (
            <Link key={g.id} to={`/goals/${g.id}`} className="card" style={{ gap: 12 }}>
              <span className="row">
                <span className="icon-box" style={{ color: g.color }}><Icon name={g.icon} size={20} /></span>
                <span style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 15, fontWeight: 600 }}>{g.name}</span>
                  <span className="small muted">{fmt(g.saved)} / {fmt(g.target)} · {until(g.deadline)}</span>
                </span>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{pct}%</span>
              </span>
              <Bar pct={pct} color={g.color} />
            </Link>
          )
        })}
      </main>

      <Sheet open={creating} onClose={() => setCreating(false)} title="Yangi maqsad">
        <label className="caption" htmlFor="gname">Nomi</label>
        <input id="gname" className="input" style={{ flex: 'none' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Yangi telefon" />
        <label className="caption" htmlFor="gtarget">Kerakli summa</label>
        <input id="gtarget" className="input" style={{ flex: 'none' }} inputMode="numeric" value={t ? fmt(t) : ''} onChange={(e) => setTarget(e.target.value)} placeholder="0 soʻm" />
        <button type="button" className="btn primary" disabled={!name.trim() || !t} style={{ opacity: name.trim() && t ? 1 : .5 }}
          onClick={() => { const id = addGoal({ name: name.trim(), target: t }); setCreating(false); setName(''); setTarget(''); navigate(`/goals/${id}`) }}>Yaratish</button>
      </Sheet>
    </>
  )
}

export function GoalDetail() {
  const { id } = useParams()
  const { state, moveGoal, updateGoal } = useStore()
  const [mode, setMode] = useState<'add' | 'take' | 'edit' | null>(null)
  const [toast, say] = useToast()
  const g = state.goals.find((x) => x.id === id)
  if (!g) return <Navigate to="/goals" replace />

  const pct = Math.round((g.saved / g.target) * 100)
  const left = Math.max(0, g.target - g.saved)
  let advice = 'Muddat belgilang — oylik qancha ajratish kerakligini hisoblab beraman.'
  if (g.deadline) {
    const now = new Date()
    const d = new Date(g.deadline)
    const months = Math.max(1, (d.getFullYear() - now.getFullYear()) * 12 + d.getMonth() - now.getMonth())
    const need = Math.ceil(left / months / 10000) * 10000
    const auto = state.profile.autoSave ? state.profile.autoSaveAmount : 0
    const eta = auto ? new Date(now.getFullYear(), now.getMonth() + Math.ceil(left / auto), 1) : null
    advice = `Har oy ~${fmt(need)} soʻm qoʻshsangiz, ${dayMonth(g.deadline)}gacha yetasiz.` +
      (eta && eta > d ? ` Hozirgi avtojamgʻarma bilan maqsad ${MONTHS[eta.getMonth()]}ga surilyapti.` : '')
  }
  if (left === 0) advice = 'Tabriklaymiz! Maqsadga yetdingiz.'

  return (
    <>
      <main className="scroll" style={{ gap: 20 }}>
        <TopBar back={-1} title={g.name} right={<button type="button" className="icon-btn" aria-label="Tahrirlash" onClick={() => setMode('edit')}><Icon name="edit" /></button>} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Ring pct={pct} size={190} stroke={14} color={g.color}>
            <span className="display" style={{ fontSize: 34 }}>{pct}%</span>
            <span className="small muted">{g.deadline ? `Muddat: ${dayMonth(g.deadline)}` : 'Muddatsiz'}</span>
          </Ring>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
            <span className="display" style={{ fontSize: 22 }}>{fmt(g.saved)}</span>
            <span className="muted" style={{ fontSize: 14 }}>/ {fmt(g.target)} soʻm</span>
          </div>
        </div>

        <div className="grid3">
          {([['add', 'plus', 'Qoʻshish'], ['take', 'minus', 'Yechish'], ['edit', 'settings', 'Sozlash']] as const).map(([k, icon, label]) => (
            <button key={k} type="button" onClick={() => setMode(k)} style={{ background: 'none', border: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 600 }}>
              <span className="icon-box" style={{ width: 56, height: 56, borderRadius: 20, background: 'var(--surface)', color: k === 'add' ? 'var(--accent)' : 'var(--text)' }}><Icon name={icon} /></span>{label}
            </button>
          ))}
        </div>

        <div className="card row" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ color: 'var(--accent)', flexShrink: 0 }}><Icon name="sparkle" size={18} /></span>
          <span style={{ fontSize: 14, lineHeight: 1.5 }}>{advice}</span>
        </div>

        <section className="list">
          <h2 className="section-title" style={{ margin: '0 0 4px' }}>Tarix</h2>
          {g.history.length === 0 && <p className="caption">Hali hech narsa qoʻshilmagan.</p>}
          {g.history.map((h) => (
            <div key={h.id} className="tx">
              <div className="icon-box" style={{ color: h.amount > 0 ? 'var(--accent)' : 'var(--danger)' }}><Icon name={h.amount > 0 ? 'arrowDownLeft' : 'arrowUpRight'} size={20} /></div>
              <span className="meta"><span className="name">{h.label}</span><span className="sub">{dayMonth(h.date)}</span></span>
              <span className="amt" style={{ color: h.amount > 0 ? 'var(--accent)' : undefined }}>{h.amount > 0 ? '+' : '−'}{fmt(h.amount)}</span>
            </div>
          ))}
        </section>
      </main>
      {toast}

      <AmountSheet open={mode === 'add'} title="Maqsadga qoʻshish" cta="Qoʻshish" onClose={() => setMode(null)} onSubmit={(n) => { moveGoal(g.id, n); say(`+${fmt(n)} soʻm qoʻshildi`) }} />
      <AmountSheet open={mode === 'take'} title="Maqsaddan yechish" cta="Yechish" onClose={() => setMode(null)} onSubmit={(n) => { moveGoal(g.id, -Math.min(n, g.saved)); say(`${fmt(Math.min(n, g.saved))} soʻm yechildi`) }} />
      <AmountSheet open={mode === 'edit'} title="Maqsad summasi" cta="Saqlash" initial={String(g.target)} onClose={() => setMode(null)} onSubmit={(n) => updateGoal(g.id, { target: n })} />
    </>
  )
}
