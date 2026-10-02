import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Ring, Screen } from '../components/ui'
import { useMonth, useStore } from '../data/store'
import { answer, healthScore, insights, scoreLabel } from '../lib/ai'

const TONE = { warn: 'var(--danger)', info: 'var(--blue)', good: 'var(--accent)' }

export default function Advice() {
  const { state } = useStore()
  const month = useMonth()
  const prev = useMonth(-1)
  const score = healthScore(state, month)
  const list = insights(state, month, prev)
  const [q, setQ] = useState('')
  const [chat, setChat] = useState<{ q: string; a: string }[]>([])

  const ask = () => {
    if (!q.trim()) return
    setChat((c) => [...c, { q, a: answer(q, state, month) }])
    setQ('')
  }

  return (
    <Screen nav>
      <div className="topbar">
        <h1 className="h1">Maslahatlar</h1>
        <span className="row" style={{ gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--accent)', background: 'var(--surface)', padding: '8px 12px', borderRadius: 999 }}><Icon name="sparkle" size={15} />AI yordamchi</span>
      </div>

      <section className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 16, borderRadius: 26, padding: 18 }}>
        <Ring pct={score}><span className="display" style={{ fontSize: 24 }}>{score}</span></Ring>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span className="small muted">Moliyaviy holat</span>
          <span style={{ fontSize: 17, fontWeight: 700 }}>{scoreLabel(score)}</span>
          <span className="caption" style={{ lineHeight: 1.4 }}>Limitlarga rioya qilsangiz va avtojamgʻarmani yoqib qoʻysangiz, ball oshadi.</span>
        </div>
      </section>

      {list.map((i) => (
        <article key={i.id} className="card">
          <span className="overline" style={{ color: TONE[i.tone] }}>{i.overline}</span>
          <span style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35 }}>{i.title}</span>
          <span className="caption" style={{ lineHeight: 1.5 }}>{i.body}</span>
          <Link to={i.to} className="link" style={{ color: TONE[i.tone], paddingTop: 4 }}>{i.cta}<Icon name="arrowRight" size={15} /></Link>
        </article>
      ))}

      {chat.map((m, k) => (
        <div key={k} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div className="bubble-me">{m.q}</div>
          <div className="row" style={{ alignItems: 'flex-start', gap: 8 }}>
            <span className="icon-box" style={{ width: 32, height: 32, borderRadius: 11, color: 'var(--accent)' }}><Icon name="sparkle" size={16} /></span>
            <div className="bubble-ai" style={{ fontSize: 14, lineHeight: 1.5 }}>{m.a}</div>
          </div>
        </div>
      ))}

      <form className="row" style={{ gap: 8 }} onSubmit={(e) => { e.preventDefault(); ask() }}>
        <label htmlFor="ask" className="sr">Yordamchiga savol</label>
        <input id="ask" className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Yordamchidan soʻrang…" />
        <button type="submit" aria-label="Yuborish" style={{ width: 52, height: 52, borderRadius: 18, border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <Icon name="send" stroke={2.2} />
        </button>
      </form>
    </Screen>
  )
}
