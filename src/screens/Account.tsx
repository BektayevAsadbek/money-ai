import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { MenuItem, Sheet, Switch, TopBar, useToast } from '../components/ui'
import { CATEGORIES } from '../data/categories'
import { useStore } from '../data/store'
import { fmt, MONTHS, sameDay, time } from '../lib/format'

/** Plus pricing — fill in real prices before launch. */
export const PRICING = { yearly: '[YILLIK NARX]', yearlyPerMonth: '[OYLIK EKVIVALENT]', monthly: '[OYLIK NARX]' }

const ACCENTS = ['#C8F169', '#7CC4FF', '#B8A4FF', '#E8D08A']

/* ---------------- Profile ---------------- */

export function Profile() {
  const { state, updateProfile, reset } = useStore()
  const navigate = useNavigate()
  const [toast, say] = useToast()
  const [theme, setTheme] = useState(false)
  const p = state.profile
  const subTotal = state.subscriptions.reduce((a, s) => a + s.price, 0)

  const exportCsv = () => {
    const rows = [['Sana', 'Nomi', 'Toifa', 'Summa', 'Hisob', 'Izoh']]
    for (const t of state.transactions) rows.push([t.date.slice(0, 10), t.title, CATEGORIES[t.category].name, String(t.amount), t.account, t.note ?? ''])
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
    a.download = 'hamyon-amallar.csv'
    a.click()
    say('CSV fayl yuklab olindi')
  }

  return (
    <>
      <main className="scroll">
        <TopBar back="/" title="Profil" />
        <div className="row" style={{ gap: 14 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--surface-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--display)', fontSize: 22, color: 'var(--accent)' }}>{p.name.charAt(0)}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 18, fontWeight: 700 }}>{p.name}</span>
            <span className="caption">{p.phone}</span>
          </div>
        </div>

        <Link to="/premium" className="row" style={{ background: 'var(--accent)', color: 'var(--on-accent)', borderRadius: 22, padding: 16, gap: 12 }}>
          <span style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(14,15,12,.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="crown" /></span>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 700 }}>{p.plus ? 'Hamyon Plus faol' : 'Hamyon Plus'}</span>
            <span style={{ fontSize: 12, opacity: .75 }}>Cheksiz chek skanerlash va chuqur AI tahlil</span>
          </span>
          <Icon name="chevronRight" size={18} />
        </Link>

        <div className="overline muted" style={{ fontSize: 12 }}>MOLIYA</div>
        <div className="menu-group">
          <MenuItem icon="card" color="var(--blue)" label="Hisoblar va kartalar" value="1 ta" onClick={() => say('Karta ulash tez orada')} />
          <MenuItem icon="piggy" color="var(--accent)" label="Jamgʻarma maqsadlari" value={`${state.goals.length} ta`} to="/goals" />
          <MenuItem icon="repeat" color="var(--purple)" label="Obunalar" value={fmt(subTotal)} to="/subscriptions" />
        </div>

        <div className="overline muted" style={{ fontSize: 12 }}>ILOVA</div>
        <div className="menu-group">
          <MenuItem icon="globe" color="var(--blue)" label="Til" value="Oʻzbekcha" chevron={false} onClick={() => say('Rus va ingliz tillari tez orada')} />
          <MenuItem icon="coin" color="var(--gold)" label="Valyuta" value="UZS" chevron={false} onClick={() => say('Boshqa valyutalar tez orada')} />
          <MenuItem icon="sparkle" color={p.accent} label="Rang" onClick={() => setTheme(true)} />
          <MenuItem icon="bell" color="var(--danger)" label="Bildirishnomalar" to="/notifications" />
          <div className="menu-item">
            <span className="icon-box" style={{ color: 'var(--accent)' }}><Icon name="face" size={19} /></span>
            <span className="label">Face ID bilan kirish</span>
            <Switch label="Face ID" checked={p.faceId} onChange={(v) => updateProfile({ faceId: v })} />
          </div>
        </div>

        <div className="menu-group">
          <MenuItem icon="download" color="var(--purple)" label="Maʼlumotlarni eksport qilish" value="CSV" onClick={exportCsv} />
          <MenuItem icon="help" label="Yordam" onClick={() => say('Yordam: support@hamyon.uz')} />
        </div>

        <button type="button" className="btn danger" onClick={() => { if (confirm('Hisobdan chiqasizmi? Barcha maʼlumotlar demo holatiga qaytadi.')) { reset(); navigate('/welcome', { replace: true }) } }}>
          <Icon name="logout" size={18} />Chiqish
        </button>
      </main>
      {toast}

      <Sheet open={theme} onClose={() => setTheme(false)} title="Asosiy rang">
        <div className="row" style={{ justifyContent: 'space-between' }}>
          {ACCENTS.map((c) => (
            <button key={c} type="button" aria-label={c} aria-pressed={p.accent === c} onClick={() => updateProfile({ accent: c })}
              style={{ width: 64, height: 64, borderRadius: 20, background: c, border: p.accent === c ? '3px solid var(--text)' : '3px solid transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {p.accent === c && <Icon name="check" color="var(--on-accent)" stroke={2.6} />}
            </button>
          ))}
        </div>
      </Sheet>
    </>
  )
}

/* ---------------- Subscriptions ---------------- */

function nextCharge(day: number) {
  const now = new Date()
  const d = new Date(now.getFullYear(), now.getMonth(), day)
  if (d < new Date(now.getFullYear(), now.getMonth(), now.getDate())) d.setMonth(d.getMonth() + 1)
  return d
}

export function Subscriptions() {
  const { state, updateProfile, toggleSubUnused, addSubscription } = useStore()
  const [toast, say] = useToast()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [day, setDay] = useState('1')
  const subs = [...state.subscriptions].sort((a, b) => nextCharge(a.day).getTime() - nextCharge(b.day).getTime())
  const total = subs.reduce((a, s) => a + s.price, 0)
  const unused = subs.find((s) => s.unused)
  const pr = parseInt(price.replace(/\D/g, ''), 10) || 0

  return (
    <>
      <main className="scroll">
        <TopBar back={-1} title="Obunalar" right={<button type="button" className="icon-btn" aria-label="Obuna qoʻshish" onClick={() => setAdding(true)}><Icon name="plus" /></button>} />

        <section className="card lg" style={{ gap: 6, borderRadius: 26 }}>
          <span className="caption">Oylik toʻlov · {subs.length} ta faol</span>
          <span style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}><span className="display" style={{ fontSize: 30 }}>{fmt(total)}</span><span className="muted" style={{ fontSize: 14 }}>soʻm</span></span>
          <span className="caption">Yiliga {fmt(total * 12)} soʻm</span>
        </section>

        {unused && (
          <section className="card" style={{ border: '1px solid rgba(255,138,101,.35)' }}>
            <span className="row" style={{ alignItems: 'flex-start', gap: 10 }}>
              <span style={{ color: 'var(--danger)', flexShrink: 0 }}><Icon name="sparkle" size={18} /></span>
              <span style={{ fontSize: 14, lineHeight: 1.5 }}>{unused.name}ni 2 oydan beri ishlatmadingiz. Bekor qilsangiz, yiliga <b>{fmt(unused.price * 12)} soʻm</b> tejaysiz.</span>
            </span>
            <span className="row" style={{ gap: 8 }}>
              <button type="button" className="btn sm" style={{ background: 'var(--danger)', color: 'var(--on-accent)' }} onClick={() => { const d = nextCharge(unused.day); say(`${d.getDate()}-${MONTHS[d.getMonth()]} toʻlovidan 1 kun oldin eslatamiz`) }}>Bekor qilishni eslatish</button>
              <button type="button" className="btn sm" style={{ background: 'transparent', border: '1px solid var(--line)' }} onClick={() => toggleSubUnused(unused.id, false)}>Qoldirish</button>
            </span>
          </section>
        )}

        <h2 className="section-title" style={{ margin: 0 }}>Keyingi toʻlovlar</h2>
        <div className="card" style={{ padding: '4px 16px' }}>
          <div className="list">
            {subs.map((s) => {
              const d = nextCharge(s.day)
              return (
                <div key={s.id} className="tx">
                  <div className="icon-box" style={{ color: s.color }}><Icon name={s.icon} size={20} /></div>
                  <span className="meta">
                    <span className="name">{s.name}</span>
                    <span className="sub">{d.getDate()}-{MONTHS[d.getMonth()]} · {s.account}{s.unused && <> · <span style={{ color: 'var(--danger)' }}>ishlatilmayapti</span></>}</span>
                  </span>
                  <span className="amt">−{fmt(s.price)}</span>
                </div>
              )
            })}
          </div>
        </div>

        <section className="card" style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <span style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 15, fontWeight: 600 }}>Toʻlovdan 1 kun oldin eslatish</span>
            <span className="small muted">Pul yechilishidan oldin xabar olasiz</span>
          </span>
          <Switch label="Eslatma" checked={state.profile.remindSubs} onChange={(v) => updateProfile({ remindSubs: v })} />
        </section>
      </main>
      {toast}

      <Sheet open={adding} onClose={() => setAdding(false)} title="Yangi obuna">
        <label className="caption" htmlFor="sname">Nomi</label>
        <input id="sname" className="input" style={{ flex: 'none' }} value={name} onChange={(e) => setName(e.target.value)} placeholder="Masalan: Spotify" />
        <div className="grid2">
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span className="caption">Oylik narx</span>
            <input className="input" inputMode="numeric" style={{ flex: 'none' }} value={pr ? fmt(pr) : ''} onChange={(e) => setPrice(e.target.value)} placeholder="0" /></label>
          <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}><span className="caption">Toʻlov kuni</span>
            <input className="input" type="number" min={1} max={28} style={{ flex: 'none' }} value={day} onChange={(e) => setDay(e.target.value)} /></label>
        </div>
        <button type="button" className="btn primary" disabled={!name.trim() || !pr} style={{ opacity: name.trim() && pr ? 1 : .5 }}
          onClick={() => { addSubscription(name.trim(), pr, Math.min(28, Math.max(1, +day || 1))); setAdding(false); setName(''); setPrice('') }}>Qoʻshish</button>
      </Sheet>
    </>
  )
}

/* ---------------- Notifications ---------------- */

export function Notifications() {
  const { state, markAllRead } = useStore()
  const groups = new Map<string, typeof state.notifications>()
  const now = new Date()
  const y = new Date(now); y.setDate(now.getDate() - 1)
  for (const n of [...state.notifications].sort((a, b) => b.date.localeCompare(a.date))) {
    const d = new Date(n.date)
    const k = sameDay(d, now) ? 'Bugun' : sameDay(d, y) ? 'Kecha' : `${d.getDate()}-${MONTHS[d.getMonth()]}`
    groups.set(k, [...(groups.get(k) ?? []), n])
  }
  const unread = state.notifications.some((n) => !n.read)

  return (
    <main className="scroll">
      <TopBar back={-1} title="Bildirishnomalar" />
      {[...groups.entries()].map(([label, items], gi) => (
        <section key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div className="between">
            <span className="caption">{label}</span>
            {gi === 0 && unread && <button type="button" className="link" style={{ color: 'var(--accent)', minHeight: 32 }} onClick={markAllRead}>Hammasini oʻqildi deb belgilash</button>}
          </div>
          {items.map((n) => (
            <div key={n.id} className="row" style={{ alignItems: 'flex-start', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
              <div className="icon-box" style={{ color: n.color }}><Icon name={n.icon} size={20} /></div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="between"><span style={{ fontSize: 15, fontWeight: 600 }}>{n.title}</span><span className="small muted">{time(n.date)}</span></div>
                <span className="caption" style={{ lineHeight: 1.45 }}>{n.body}</span>
              </div>
              <span aria-label={n.read ? undefined : 'Oʻqilmagan'} style={{ width: 8, height: 8, borderRadius: '50%', marginTop: 8, flexShrink: 0, background: n.read ? 'transparent' : 'var(--accent)' }} />
            </div>
          ))}
        </section>
      ))}
    </main>
  )
}

/* ---------------- Premium ---------------- */

export function Premium() {
  const { state, updateProfile } = useStore()
  const navigate = useNavigate()
  const [plan, setPlan] = useState<'yearly' | 'monthly'>('yearly')
  const features = ['Cheksiz chek skanerlash', 'Ovozli kiritish — limitsiz', 'Chuqur AI tahlil va oy oxiri prognozi', 'Oilaviy budjet — 5 kishigacha', 'Excel va PDF eksport']

  return (
    <>
      <main className="scroll" style={{ gap: 24 }}>
        <TopBar back={-1} backIcon="close" backLabel="Yopish" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <span style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="crown" size={30} /></span>
          <h1 className="h1 lg">Hamyon Plus</h1>
          <p className="lead">Pulingizni toʻliq nazorat qiling — AI har bir soʻmni hisoblaydi.</p>
        </div>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {features.map((f) => (
            <li key={f} className="row" style={{ fontSize: 15 }}>
              <span style={{ width: 28, height: 28, borderRadius: 10, background: 'var(--surface-2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={16} stroke={2.4} /></span>{f}
            </li>
          ))}
        </ul>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} role="radiogroup" aria-label="Tarif">
          {(['yearly', 'monthly'] as const).map((k) => {
            const on = plan === k
            return (
              <button key={k} type="button" role="radio" aria-checked={on} onClick={() => setPlan(k)}
                style={{ position: 'relative', minHeight: 72, borderRadius: 20, padding: '14px 18px', background: 'var(--surface)', border: `2px solid ${on ? 'var(--accent)' : 'var(--line)'}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', textAlign: 'left' }}>
                <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{k === 'yearly' ? 'Yillik' : 'Oylik'}</span>
                  {k === 'yearly' && <span className="caption">{PRICING.yearlyPerMonth} soʻm / oy</span>}
                </span>
                <span style={{ fontSize: 16, fontWeight: 700 }}>{k === 'yearly' ? PRICING.yearly : PRICING.monthly}</span>
                {k === 'yearly' && <span style={{ position: 'absolute', top: -10, right: 16, background: 'var(--accent)', color: 'var(--on-accent)', fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 999 }}>TEJAMKOR</span>}
              </button>
            )
          })}
        </div>
      </main>
      <div className="footer">
        <button type="button" className="btn primary" onClick={() => { updateProfile({ plus: !state.profile.plus }); navigate('/profile') }}>
          {state.profile.plus ? 'Obunani bekor qilish' : 'Obunani boshlash'}
        </button>
        <span className="small muted" style={{ textAlign: 'center' }}>Istalgan vaqtda bekor qilish mumkin</span>
      </div>
    </>
  )
}
