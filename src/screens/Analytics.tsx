import { useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Bar, Screen } from '../components/ui'
import { CATEGORIES, type CategoryId } from '../data/categories'
import { totals, useStore } from '../data/store'
import { compact, fmt, MONTHS } from '../lib/format'

type Period = 'week' | 'month' | 'year'

function range(period: Period, offset: number): [Date, Date, string, string] {
  const now = new Date()
  if (period === 'week') {
    const end = new Date(now); end.setDate(now.getDate() - 7 * offset); end.setHours(23, 59, 59)
    const start = new Date(end); start.setDate(end.getDate() - 6); start.setHours(0, 0, 0)
    return [start, end, offset === 0 ? 'Shu hafta' : `${start.getDate()}-${MONTHS[start.getMonth()].slice(0, 3)}`, 'oʻtgan haftaga']
  }
  if (period === 'year') {
    const y = now.getFullYear() - offset
    return [new Date(y, 0, 1), new Date(y, 11, 31, 23, 59, 59), String(y), 'oʻtgan yilga']
  }
  const m = new Date(now.getFullYear(), now.getMonth() - offset, 1)
  const label = MONTHS[m.getMonth()]
  return [m, new Date(m.getFullYear(), m.getMonth() + 1, 0, 23, 59, 59), label.charAt(0).toUpperCase() + label.slice(1), `${MONTHS[(m.getMonth() + 11) % 12]}ga`]
}

export default function Analytics() {
  const { state } = useStore()
  const [period, setPeriod] = useState<Period>('month')
  const [offset, setOffset] = useState(0)

  const { cur, prev, label, vs } = useMemo(() => {
    const [s, e, label, vs] = range(period, offset)
    const [ps, pe] = range(period, offset + 1)
    const pick = (a: Date, b: Date) => state.transactions.filter((t) => { const d = new Date(t.date); return d >= a && d <= b })
    return { cur: totals(pick(s, e)), prev: totals(pick(ps, pe)), label, vs }
  }, [state.transactions, period, offset])

  const cats = (Object.entries(cur.byCat) as [CategoryId, number][]).sort((a, b) => b[1] - a[1])
  const max = cats[0]?.[1] ?? 1
  const C = 2 * Math.PI * 74
  let acc = 0
  const delta = prev.expense ? Math.round((cur.expense / prev.expense - 1) * 100) : null

  return (
    <Screen nav>
      <div className="topbar">
        <h1 className="h1">Tahlil</h1>
        <div className="row" style={{ gap: 6 }}>
          <button type="button" className="icon-btn" aria-label="Oldingi davr" style={{ width: 40, height: 40 }} onClick={() => setOffset(offset + 1)}><Icon name="arrowLeft" size={18} /></button>
          <span style={{ fontSize: 14, fontWeight: 500, minWidth: 72, textAlign: 'center' }}>{label}</span>
          <button type="button" className="icon-btn" aria-label="Keyingi davr" disabled={offset === 0} style={{ width: 40, height: 40, opacity: offset === 0 ? .4 : 1 }} onClick={() => setOffset(Math.max(0, offset - 1))}><Icon name="arrowRight" size={18} /></button>
        </div>
      </div>

      <div className="segmented" role="group" aria-label="Davr">
        {([['week', 'Hafta'], ['month', 'Oy'], ['year', 'Yil']] as const).map(([k, l]) => (
          <button key={k} type="button" aria-pressed={period === k} onClick={() => { setPeriod(k); setOffset(0) }}>{l}</button>
        ))}
      </div>

      <div className="row" style={{ gap: 16 }}>
        <div style={{ width: 170, height: 170, position: 'relative', flexShrink: 0 }}>
          <svg width="170" height="170" viewBox="0 0 200 200" role="img" aria-label="Toifalar boʻyicha xarajat diagrammasi">
            <circle cx="100" cy="100" r="74" fill="none" stroke="var(--surface)" strokeWidth="18" />
            {cats.map(([id, v]) => {
              const len = (v / (cur.expense || 1)) * C
              const el = <circle key={id} cx="100" cy="100" r="74" fill="none" stroke={CATEGORIES[id].color} strokeWidth="18"
                strokeDasharray={`${Math.max(0, len - 4)} ${C}`} strokeDashoffset={-acc} transform="rotate(-90 100 100)" />
              acc += len
              return el
            })}
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
            <span className="muted" style={{ fontSize: 11 }}>Xarajat</span>
            <span className="display" style={{ fontSize: 17 }}>{compact(cur.expense)}</span>
            <span className="muted" style={{ fontSize: 11 }}>soʻm</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span className="small muted">{vs.charAt(0).toUpperCase() + vs.slice(1)} nisbatan</span>
            {delta === null ? <span style={{ fontSize: 16, fontWeight: 600 }} className="muted">Maʼlumot yoʻq</span> : (
              <span className="row" style={{ gap: 4, fontSize: 18, fontWeight: 700, color: delta <= 0 ? 'var(--accent)' : 'var(--danger)' }}>
                <Icon name={delta <= 0 ? 'arrowDownLeft' : 'arrowUpRight'} size={18} />{Math.abs(delta)}% {delta <= 0 ? 'kam' : 'koʻp'}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="small muted">Daromad</span><span style={{ fontSize: 16, fontWeight: 600 }}>{fmt(cur.income)}</span></div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span className="small muted">Qoldiq</span><span style={{ fontSize: 16, fontWeight: 600 }}>{cur.income - cur.expense >= 0 ? '+' : '−'}{fmt(cur.income - cur.expense)}</span></div>
        </div>
      </div>

      <section className="list">
        <h2 className="section-title" style={{ margin: '0 0 4px' }}>Toifalar boʻyicha</h2>
        {cats.length === 0 && <p className="caption">Bu davrda xarajat yoʻq.</p>}
        {cats.map(([id, v]) => {
          const c = CATEGORIES[id]
          return (
            <div key={id} className="tx" style={{ padding: '8px 0' }}>
              <div className="icon-box" style={{ width: 38, height: 38, color: c.color }}><Icon name={c.icon} size={20} /></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div className="between" style={{ fontSize: 14, fontWeight: 600 }}><span>{c.name}</span><span>{fmt(v)}</span></div>
                <div className="row" style={{ gap: 8 }}>
                  <div style={{ flex: 1 }}><Bar pct={(v / max) * 88} color={c.color} size="thin" /></div>
                  <span className="small muted" style={{ width: 32, textAlign: 'right' }}>{Math.round((v / cur.expense) * 100)}%</span>
                </div>
              </div>
            </div>
          )
        })}
      </section>
    </Screen>
  )
}
