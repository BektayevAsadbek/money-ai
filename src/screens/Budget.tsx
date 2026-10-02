import { useState } from 'react'
import { Icon } from '../components/Icon'
import { AmountSheet, Bar, CategoryPicker, Screen, Sheet } from '../components/ui'
import { CATEGORIES, EXPENSE_CATEGORIES, type CategoryId } from '../data/categories'
import { limitStatus, useMonth, useStore } from '../data/store'
import { daysLeftInMonth, fmt, monthName } from '../lib/format'

export default function Budget() {
  const { state, setLimit } = useStore()
  const month = useMonth()
  const [edit, setEdit] = useState<CategoryId | null>(null)
  const [picking, setPicking] = useState(false)

  const entries = Object.entries(state.limits) as [CategoryId, number][]
  const limitTotal = entries.reduce((a, [, v]) => a + v, 0)
  const spent = month.expense
  const pct = limitTotal ? Math.round((spent / limitTotal) * 100) : 0
  const left = daysLeftInMonth()
  const perDay = Math.max(0, Math.round((limitTotal - spent) / Math.max(1, left) / 100) * 100)

  return (
    <Screen nav>
      <div className="topbar">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <h1 className="h1">Budjet</h1>
          <span className="small muted">{monthName(new Date())} · {left} kun qoldi</span>
        </div>
        <button type="button" className="icon-btn" aria-label="Limit qoʻshish" onClick={() => setPicking(true)}><Icon name="plus" /></button>
      </div>

      <section className="card lg" style={{ gap: 12, borderRadius: 26, padding: 18 }}>
        <div className="between caption"><span>Sarflandi</span><span>Limit: {fmt(limitTotal)}</span></div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="display" style={{ fontSize: 28 }}>{fmt(spent)}</span>
          <span className="muted" style={{ fontSize: 14 }}>soʻm · {pct}%</span>
        </div>
        <Bar pct={pct} size="thick" color={pct > 100 ? 'var(--danger)' : 'var(--accent)'} />
        <div className="row" style={{ background: 'var(--surface-2)', borderRadius: 14, padding: '10px 12px', fontSize: 13, gap: 10 }}>
          <span style={{ color: 'var(--accent)' }}><Icon name="sparkle" size={18} /></span>
          <span>{limitTotal > spent ? <>Oy oxirigacha kuniga <b>{fmt(perDay)} soʻm</b> sarflashingiz mumkin</> : <>Umumiy limitdan <b>{fmt(spent - limitTotal)} soʻm</b> oshdingiz</>}</span>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Toifa limitlari</h2>
        {entries.map(([id, limit]) => {
          const c = CATEGORIES[id]
          const s = month.byCat[id] ?? 0
          const st = limitStatus(s, limit)
          const color = st === 'over' ? 'var(--danger)' : st === 'near' ? 'var(--gold)' : c.color
          return (
            <button key={id} type="button" className="card" onClick={() => setEdit(id)} aria-label={`${c.name} limitini oʻzgartirish`}
              style={{ flexDirection: 'row', alignItems: 'center', gap: 12, border: 'none', textAlign: 'left', borderRadius: 20, padding: 14 }}>
              <span className="icon-box" style={{ color: c.color }}><Icon name={c.icon} size={20} /></span>
              <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="between" style={{ fontSize: 14 }}><span style={{ fontWeight: 600 }}>{c.name}</span><span><b>{fmt(s)}</b><span className="muted"> / {fmt(limit)}</span></span></span>
                <Bar pct={(s / limit) * 100} color={color} />
                <span className="small" style={{ color: st === 'ok' ? 'var(--muted)' : color }}>
                  {st === 'over' ? `${fmt(s - limit)} oshdi` : st === 'near' ? 'Limitga yaqin' : `${fmt(limit - s)} qoldi`}
                </span>
              </span>
            </button>
          )
        })}
      </section>

      <AmountSheet open={edit !== null} title={edit ? `${CATEGORIES[edit].name} limiti` : ''} cta="Saqlash"
        initial={edit ? String(state.limits[edit] ?? '') : ''} onClose={() => setEdit(null)} onSubmit={(n) => edit && setLimit(edit, n)} />

      <Sheet open={picking} onClose={() => setPicking(false)} title="Qaysi toifaga limit?">
        <CategoryPicker options={EXPENSE_CATEGORIES.filter((c) => !(c in state.limits))} onPick={(c) => { setPicking(false); setEdit(c) }} />
      </Sheet>
    </Screen>
  )
}
