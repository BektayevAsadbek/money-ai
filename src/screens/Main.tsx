import { Link } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Screen, TxRow } from '../components/ui'
import { useBalance, useMonth, useStore } from '../data/store'
import { headline } from '../lib/ai'
import { fmt, monthName } from '../lib/format'

function greeting() {
  const h = new Date().getHours()
  if (h < 5) return 'Xayrli tun'
  if (h < 12) return 'Xayrli tong'
  if (h < 18) return 'Xayrli kun'
  return 'Xayrli kech'
}

export default function Main() {
  const { state } = useStore()
  const month = useMonth()
  const balance = useBalance()
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 3)
  const unread = state.notifications.some((n) => !n.read)
  const tip = headline(state, month)

  return (
    <Screen nav>
      <div className="topbar">
        <div className="row">
          <Link to="/profile" aria-label="Profil" style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 16, color: 'var(--accent)' }}>
            {state.profile.name.charAt(0)}
          </Link>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span className="small muted">{greeting()}</span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>{state.profile.name}</span>
          </div>
        </div>
        <Link to="/notifications" className="icon-btn" aria-label="Bildirishnomalar">
          <Icon name="bell" />{unread && <span className="dot" />}
        </Link>
      </div>

      <section className="card lg">
        <div className="between">
          <span className="caption">Umumiy balans</span>
          <span className="pill">{monthName(new Date())}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span className="display" style={{ fontSize: 34, letterSpacing: -1 }}>{fmt(balance)}</span>
          <span className="muted" style={{ fontSize: 15 }}>soʻm</span>
        </div>
        <div className="grid2">
          <div className="tile">
            <span className="row small muted" style={{ gap: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: 8, background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowDownLeft" size={14} stroke={2.4} color="var(--on-accent)" /></span>Daromad
            </span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>+{fmt(month.income)}</span>
          </div>
          <div className="tile">
            <span className="row small muted" style={{ gap: 6 }}>
              <span style={{ width: 22, height: 22, borderRadius: 8, background: 'var(--danger)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="arrowUpRight" size={14} stroke={2.4} color="var(--on-accent)" /></span>Xarajat
            </span>
            <span style={{ fontSize: 16, fontWeight: 600 }}>−{fmt(month.expense)}</span>
          </div>
        </div>
      </section>

      <section style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <h2 className="section-title" style={{ margin: 0 }}>Tez qoʻshish</h2>
        <div className="grid3">
          {[
            { to: '/add/voice', icon: 'mic', label: 'Ovoz', sub: 'Gapiring' },
            { to: '/add/text', icon: 'text', label: 'Matn', sub: 'Yozing' },
            { to: '/add/scan', icon: 'receipt', label: 'Chek', sub: 'Suratga oling' },
          ].map((q) => (
            <Link key={q.to} to={q.to} className="card" style={{ borderRadius: 20, padding: '14px 12px' }}>
              <span className="icon-box" style={{ borderRadius: 14, color: 'var(--accent)' }}><Icon name={q.icon} size={21} /></span>
              <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <span style={{ fontSize: 15, fontWeight: 600 }}>{q.label}</span>
                <span className="small muted">{q.sub}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <Link to="/advice" className="card outlined">
        <span className="row" style={{ gap: 8, fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}><Icon name="sparkle" size={16} />AI MASLAHAT</span>
        <span style={{ fontSize: 15, lineHeight: 1.45 }}>
          {tip[0]}<b style={{ color: 'var(--danger)' }}>{tip[1]}</b>{tip[2]}
        </span>
        <span className="row" style={{ gap: 6, fontSize: 13, fontWeight: 600, color: 'var(--accent)' }}>Batafsil <Icon name="arrowRight" size={16} /></span>
      </Link>

      <section className="list">
        <div className="between" style={{ marginBottom: 4 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Soʻnggi amallar</h2>
          <Link to="/history" className="caption" style={{ padding: '12px 0' }}>Barchasi</Link>
        </div>
        {recent.map((t) => <TxRow key={t.id} tx={t} />)}
      </section>
    </Screen>
  )
}
