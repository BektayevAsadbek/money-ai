import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { CategoryPicker, Sheet, TopBar, TxRow } from '../components/ui'
import { CATEGORIES, EXPENSE_CATEGORIES } from '../data/categories'
import { useStore, type NewTx } from '../data/store'
import { parseEntries } from '../lib/ai'

interface Msg { text: string; parsed: NewTx[] }

const HINTS = ['Kecha', 'Naqd', 'Karta orqali', 'Har oy']

export default function Text() {
  const { addTransactions } = useStore()
  const navigate = useNavigate()
  const [q, setQ] = useState('')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [mods, setMods] = useState<string[]>([])
  const [editing, setEditing] = useState<{ m: number; i: number } | null>(null)
  const end = useRef<HTMLDivElement>(null)

  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }) }, [msgs])

  const send = () => {
    const text = q.trim()
    if (!text) return
    const now = new Date()
    if (mods.includes('Kecha')) now.setDate(now.getDate() - 1)
    const parsed = parseEntries(text, { now }).map((t) => ({
      ...t,
      account: mods.includes('Naqd') ? 'Naqd pul' : t.account,
      repeatMonthly: mods.includes('Har oy') || undefined,
    }))
    setMsgs((m) => [...m, { text, parsed }])
    setQ('')
    setMods([])
  }

  const last = msgs[msgs.length - 1]
  const save = (m: Msg) => {
    addTransactions(m.parsed)
    navigate('/saved')
  }

  return (
    <>
      <main className="scroll" style={{ paddingBottom: 12 }}>
        <TopBar back={-1} title="Matn bilan kiritish" />
        <p className="caption" style={{ margin: 0, textAlign: 'center' }}>Oddiy tilda yozing — summa, toifa va sanani oʻzim aniqlayman.</p>

        {msgs.length === 0 && (
          <div className="card" style={{ gap: 8 }}>
            <span className="small muted">Masalan:</span>
            {['tushlik 45 000, benzin 150 ming, oylik tushdi 8,2 mln', 'taksi 24 ming', 'kecha Korzinkada 186 400 soʻm'].map((ex) => (
              <button key={ex} type="button" className="chip" style={{ height: 'auto', padding: '10px 14px', textAlign: 'left', whiteSpace: 'normal', borderRadius: 14 }} onClick={() => setQ(ex)}>{ex}</button>
            ))}
          </div>
        )}

        {msgs.map((m, mi) => (
          <div key={mi} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div className="bubble-me">{m.text}</div>
            <div className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
              <span className="icon-box" style={{ width: 32, height: 32, borderRadius: 11, color: 'var(--accent)' }}><Icon name="sparkle" size={16} /></span>
              <div className="bubble-ai">
                {m.parsed.length === 0 ? (
                  <span style={{ fontSize: 15 }}>Summani topa olmadim. “taksi 24 ming” kabi yozib koʻring.</span>
                ) : (
                  <>
                    <span style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{m.parsed.length} ta amal topdim. Tekshirib, saqlang:</span>
                    <div className="list">
                      {m.parsed.map((t, i) => (
                        <button key={i} type="button" onClick={() => setEditing({ m: mi, i })} aria-label={`${t.title} toifasini oʻzgartirish`} style={{ background: 'none', border: 'none', padding: 0, textAlign: 'left', display: 'block', width: '100%' }}>
                          <TxRow tx={t} link={false} showSource={false} />
                        </button>
                      ))}
                    </div>
                    {m === last && (
                      <div className="row" style={{ gap: 8, marginTop: 6 }}>
                        <button type="button" className="btn sm" style={{ background: 'transparent', border: '1px solid var(--line)' }} onClick={() => { setQ(m.text); setMsgs((x) => x.slice(0, -1)) }}>Tahrirlash</button>
                        <button type="button" className="btn sm primary" onClick={() => save(m)}>Hammasini saqlash</button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
        <div ref={end} />
      </main>

      <div style={{ padding: '8px 20px 30px', display: 'flex', flexDirection: 'column', gap: 10, background: 'var(--bg)' }}>
        <div className="chips" role="group" aria-label="Qoʻshimcha belgilar">
          {HINTS.map((h) => (
            <button key={h} type="button" className="chip" aria-pressed={mods.includes(h)} onClick={() => setMods((m) => (m.includes(h) ? m.filter((x) => x !== h) : [...m, h]))}>{h}</button>
          ))}
        </div>
        <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); send() }}>
          <label htmlFor="q" className="sr">Amalni yozing</label>
          <input id="q" className="input" autoComplete="off" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Masalan: taksi 24 ming" />
          <Link to="/add/voice" className="icon-btn" aria-label="Ovoz bilan kiritish" style={{ width: 52, height: 52, borderRadius: 18 }}><Icon name="mic" /></Link>
          <button type="submit" aria-label="Yuborish" style={{ width: 52, height: 52, borderRadius: 18, border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="send" stroke={2.2} />
          </button>
        </form>
      </div>

      <Sheet open={!!editing} onClose={() => setEditing(null)} title="Toifani tanlang">
        {editing && (
          <CategoryPicker
            value={msgs[editing.m].parsed[editing.i].category}
            options={[...EXPENSE_CATEGORIES, 'income']}
            onPick={(c) => {
              setMsgs((all) => all.map((m, mi) => mi !== editing.m ? m : {
                ...m,
                parsed: m.parsed.map((t, i) => i !== editing.i ? t : { ...t, category: c, amount: c === 'income' ? Math.abs(t.amount) : -Math.abs(t.amount), title: t.title === CATEGORIES[t.category].name ? CATEGORIES[c].name : t.title }),
              }))
              setEditing(null)
            }}
          />
        )}
      </Sheet>
    </>
  )
}
