import { useMemo, useRef, useState } from 'react'
import { Icon } from '../components/Icon'
import { Screen, TxRow } from '../components/ui'
import { CATEGORIES } from '../data/categories'
import { useMonth, useStore } from '../data/store'
import type { Transaction } from '../data/seed'
import { dayLabel, fmt, monthName, signed } from '../lib/format'

const FILTERS = ['Hammasi', 'Xarajat', 'Daromad', 'Chek', 'Ovoz', 'Matn'] as const
type Filter = typeof FILTERS[number]

const match = (t: Transaction, f: Filter) => {
  switch (f) {
    case 'Xarajat': return t.amount < 0
    case 'Daromad': return t.amount > 0
    case 'Chek': return t.source === 'chek'
    case 'Ovoz': return t.source === 'ovoz'
    case 'Matn': return t.source === 'matn'
    default: return true
  }
}

export default function History() {
  const { state } = useStore()
  const month = useMonth()
  const [f, setF] = useState<Filter>('Hammasi')
  const [q, setQ] = useState('')
  const [day, setDay] = useState('')
  const dateRef = useRef<HTMLInputElement>(null)

  const groups = useMemo(() => {
    const needle = q.trim().toLowerCase()
    const list = state.transactions
      .filter((t) => match(t, f))
      .filter((t) => !day || t.date.slice(0, 10) <= day)
      .filter((t) => !needle || t.title.toLowerCase().includes(needle) || CATEGORIES[t.category].name.toLowerCase().includes(needle) || String(Math.abs(t.amount)).includes(needle.replace(/\s/g, '')))
      .sort((a, b) => b.date.localeCompare(a.date))
    const map = new Map<string, Transaction[]>()
    for (const t of list) {
      const k = new Date(t.date).toDateString()
      map.set(k, [...(map.get(k) ?? []), t])
    }
    return [...map.values()]
  }, [state.transactions, f, q, day])

  const m = monthName(new Date())

  return (
    <Screen nav>
      <div className="topbar">
        <h1 className="h1">Amallar</h1>
        <button type="button" className="icon-btn" aria-label="Sana boʻyicha" style={{ color: day ? 'var(--accent)' : undefined }} onClick={() => (day ? setDay('') : dateRef.current?.showPicker?.())}>
          <Icon name={day ? 'close' : 'calendar'} />
        </button>
        <input ref={dateRef} type="date" className="sr" tabIndex={-1} aria-hidden="true" value={day} onChange={(e) => setDay(e.target.value)} />
      </div>

      <label className="row" style={{ background: 'var(--surface)', borderRadius: 16, padding: '0 14px', height: 48, gap: 10 }}>
        <span className="muted"><Icon name="search" size={20} /></span>
        <span className="sr">Qidirish</span>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Doʻkon, toifa yoki summa"
          style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 15 }} />
      </label>

      <div className="chips" role="group" aria-label="Filtr">
        {FILTERS.map((l) => <button key={l} type="button" className="chip" aria-pressed={l === f} onClick={() => setF(l)}>{l}</button>)}
      </div>

      <div className="grid2">
        <div className="card" style={{ borderRadius: 18, padding: 14, gap: 4 }}><span className="small muted">{m} xarajati</span><span style={{ fontSize: 16, fontWeight: 700 }}>−{fmt(month.expense)}</span></div>
        <div className="card" style={{ borderRadius: 18, padding: 14, gap: 4 }}><span className="small muted">{m} daromadi</span><span style={{ fontSize: 16, fontWeight: 700 }}>+{fmt(month.income)}</span></div>
      </div>

      {groups.length === 0 && <p className="caption" style={{ textAlign: 'center', padding: 24 }}>Hech narsa topilmadi.</p>}
      {groups.map((g) => (
        <section key={g[0].date} className="list">
          <div className="between caption" style={{ padding: '4px 0' }}>
            <span>{dayLabel(g[0].date)}</span><span>{signed(g.reduce((a, t) => a + t.amount, 0))}</span>
          </div>
          {g.map((t) => <TxRow key={t.id} tx={t} />)}
        </section>
      ))}
    </Screen>
  )
}
