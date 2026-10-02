import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Bar } from '../components/ui'
import { CATEGORIES } from '../data/categories'
import { limitStatus, useMonth, useStore } from '../data/store'
import { daysLeftInMonth, fmt, signed } from '../lib/format'

export default function Success() {
  const { state } = useStore()
  const month = useMonth()
  const saved = state.transactions.filter((t) => state.lastSaved.includes(t.id))
  const sum = saved.reduce((a, t) => a + t.amount, 0)
  const exp = saved.find((t) => t.amount < 0 && state.limits[t.category])
  const cat = exp?.category
  const limit = cat ? state.limits[cat]! : 0
  const spent = cat ? month.byCat[cat] ?? 0 : 0
  const st = limitStatus(spent, limit)
  const color = st === 'over' ? 'var(--danger)' : st === 'near' ? 'var(--gold)' : 'var(--accent)'

  return (
    <>
      <main className="scroll" style={{ justifyContent: 'center', alignItems: 'center', gap: 24, textAlign: 'center' }}>
        <div style={{ width: 96, height: 96, borderRadius: 32, background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="check" size={46} stroke={2.4} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="h1 lg">Saqlandi</h1>
          <p className="lead">{saved.length} ta amal qoʻshildi · jami {signed(sum)} soʻm</p>
        </div>
        {cat && (
          <div className="card" style={{ width: '100%', textAlign: 'left' }}>
            <div className="between" style={{ fontSize: 14 }}><span>{CATEGORIES[cat].name} limiti</span><span><b>{fmt(spent)}</b><span className="muted"> / {fmt(limit)}</span></span></div>
            <Bar pct={(spent / limit) * 100} color={color} />
            <div className="caption">
              {st === 'over' ? `Limitdan ${fmt(spent - limit)} soʻm oshdingiz` : `Limitga ${fmt(limit - spent)} soʻm qoldi`} — oy oxirigacha {daysLeftInMonth()} kun bor.
            </div>
          </div>
        )}
      </main>
      <div className="footer row">
        <Link to="/add/text" className="btn" style={{ flex: 1 }}>Yana qoʻshish</Link>
        <Link to="/" className="btn primary" style={{ flex: 1 }}>Tayyor</Link>
      </div>
    </>
  )
}
