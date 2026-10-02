import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { Ring, TopBar } from '../components/ui'
import { CATEGORIES, SETUP_CATEGORIES, type CategoryId } from '../data/categories'
import { useStore } from '../data/store'
import { fmt } from '../lib/format'

/* ---------------- Welcome ---------------- */

const Bubble = ({ icon, text, style }: { icon: string; text: string; style: React.CSSProperties }) => (
  <div style={{ position: 'absolute', display: 'flex', alignItems: 'center', gap: 8, background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '10px 14px 10px 10px', fontSize: 14, fontWeight: 600, boxShadow: '0 12px 30px rgba(0,0,0,.45)', ...style }}>
    <span style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name={icon} size={16} stroke={2} color="var(--on-accent)" /></span>{text}
  </div>
)

export function Welcome() {
  return (
    <>
      <div style={{ position: 'relative', height: 420, flexShrink: 0, marginTop: 40 }} aria-hidden="true">
        <div style={{ position: 'absolute', left: '50%', marginLeft: -140, top: 70, width: 280, height: 176, background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 28, transform: 'rotate(-6deg)', padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <span className="small muted">Umumiy balans</span>
          <span className="display" style={{ fontSize: 28 }}>12 480 000</span>
          <span style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 44 }}>
            {[20, 32, 26, 44, 30].map((h, i) => <span key={i} style={{ width: 26, height: h, borderRadius: 6, background: i === 3 ? 'var(--accent)' : 'var(--surface-2)' }} />)}
          </span>
        </div>
        <Bubble icon="mic" text="“Taksiga 24 ming”" style={{ left: 24, top: 8 }} />
        <Bubble icon="receipt" text="Chek aniqlandi" style={{ right: 20, top: 262 }} />
        <Bubble icon="sparkle" text="32% tejash imkoni" style={{ left: 36, top: 322 }} />
      </div>
      <main className="scroll" style={{ paddingTop: 8, gap: 14 }}>
        <div style={{ display: 'flex', gap: 6 }} aria-hidden="true">
          <span style={{ width: 22, height: 6, borderRadius: 3, background: 'var(--accent)' }} />
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--line)' }} />
          <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--line)' }} />
        </div>
        <h1 className="h1" style={{ fontSize: 30, lineHeight: 1.2, letterSpacing: -.5 }}>Pulingiz qayerga ketayotganini biling</h1>
        <p className="lead">Xarajatni ovoz, matn yoki chek surati bilan qoʻshing — qolganini AI hisoblab, maslahat beradi.</p>
      </main>
      <div className="footer">
        <Link to="/onboarding/phone" className="btn primary">Boshlash</Link>
        <Link to="/onboarding/phone" className="btn ghost">Menda hisob bor</Link>
      </div>
    </>
  )
}

/* ---------------- Phone ---------------- */

function formatPhone(d: string) {
  const p = [d.slice(0, 2), d.slice(2, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean)
  return p.join(' ')
}

export function Phone() {
  const { state, updateProfile } = useStore()
  const navigate = useNavigate()
  const [digits, setDigits] = useState(state.profile.phone.replace(/\D/g, '').slice(3))
  const valid = digits.length === 9
  const press = (k: string) => setDigits((d) => (k === 'del' ? d.slice(0, -1) : (d + k).slice(0, 9)))

  return (
    <>
      <main className="scroll" style={{ gap: 24 }}>
        <TopBar back="/welcome" right={<span className="caption">1/3</span>} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="h1" style={{ fontSize: 26 }}>Telefon raqamingiz</h1>
          <p className="lead">Tasdiqlash kodini SMS orqali yuboramiz.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="phone" className="caption">Telefon raqam</label>
          <div className="field">
            <span style={{ fontSize: 18, fontWeight: 600 }} className="muted">+998</span>
            <input id="phone" type="tel" inputMode="numeric" value={formatPhone(digits)} onChange={(e) => setDigits(e.target.value.replace(/\D/g, '').slice(0, 9))} placeholder="90 123 45 67" />
          </div>
        </div>
        <p className="small muted" style={{ margin: 0, lineHeight: 1.5 }}>Davom etish orqali <a href="#" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Foydalanish shartlari</a> va <a href="#" style={{ color: 'var(--text)', textDecoration: 'underline' }}>Maxfiylik siyosati</a>ga rozilik bildirasiz.</p>
      </main>
      <div className="footer" style={{ paddingBottom: 20 }}>
        <button type="button" className="btn primary" disabled={!valid} style={{ opacity: valid ? 1 : .5 }}
          onClick={() => { updateProfile({ phone: `+998 ${formatPhone(digits)}` }); navigate('/onboarding/setup') }}>Kod olish</button>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 4 }}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'].map((k, i) => k === '' ? <span key={i} /> : (
            <button key={i} type="button" aria-label={k === 'del' ? 'Oʻchirish' : k} onClick={() => press(k)}
              style={{ height: 52, border: 'none', background: 'transparent', fontSize: 24, fontWeight: 500, borderRadius: 14 }}>
              {k === 'del' ? '⌫' : k}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

/* ---------------- Setup ---------------- */

export function Setup() {
  const { state, buildBudget } = useStore()
  const navigate = useNavigate()
  const [sel, setSel] = useState<CategoryId[]>(state.profile.categories)
  const [income, setIncome] = useState(String(state.profile.income))
  const n = parseInt(income.replace(/\D/g, ''), 10) || 0
  const ok = sel.length > 0 && n > 0

  return (
    <>
      <main className="scroll" style={{ gap: 20 }}>
        <TopBar back="/onboarding/phone" right={<span className="caption">2/3</span>} />
        <div className="bar" style={{ height: 4, marginTop: -8 }}><span style={{ width: '66%', background: 'var(--accent)' }} /></div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <h1 className="h1">Nimaga koʻproq sarflaysiz?</h1>
          <p className="lead" style={{ fontSize: 14 }}>Tanlovingiz asosida birinchi budjetni tuzaman. Keyin istalgan vaqtda oʻzgartirasiz.</p>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {SETUP_CATEGORIES.map((id) => {
            const on = sel.includes(id)
            const c = CATEGORIES[id]
            return (
              <button key={id} type="button" aria-pressed={on} onClick={() => setSel((s) => (on ? s.filter((x) => x !== id) : [...s, id]))}
                style={{ height: 46, padding: '0 16px 0 12px', borderRadius: 16, border: `1.5px solid ${on ? 'var(--accent)' : 'var(--line)'}`, background: on ? 'var(--surface-2)' : 'var(--surface)', display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600 }}>
                <span style={{ color: on ? 'var(--accent)' : 'var(--muted)' }}><Icon name={on ? 'check' : c.icon} size={18} /></span>{c.name}
              </button>
            )
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label htmlFor="inc" className="caption">Oylik daromad (taxminan)</label>
          <div className="field">
            <input id="inc" type="text" inputMode="numeric" value={n ? fmt(n) : ''} placeholder="0" onChange={(e) => setIncome(e.target.value)} />
            <span className="muted" style={{ fontSize: 15 }}>soʻm</span>
          </div>
        </div>
      </main>
      <div className="footer">
        <button type="button" className="btn primary" disabled={!ok} style={{ opacity: ok ? 1 : .5 }}
          onClick={() => { buildBudget(n, sel); navigate('/onboarding/processing') }}>
          {sel.length ? `${sel.length} ta toifa bilan davom etish` : 'Kamida bitta toifa tanlang'}
        </button>
      </div>
    </>
  )
}

/* ---------------- Processing ---------------- */

export function Processing() {
  const { state, updateProfile } = useStore()
  const navigate = useNavigate()
  const [pct, setPct] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPct((p) => Math.min(100, p + 4)), 90)
    return () => clearInterval(t)
  }, [])

  const steps = [
    { at: 20, text: 'Daromad hisobga olindi' },
    { at: 45, text: `${state.profile.categories.length} ta asosiy toifa tanlandi` },
    { at: 75, text: pct >= 75 ? 'Limitlar hisoblandi' : 'Limitlar hisoblanmoqda…' },
    { at: 100, text: pct >= 100 ? 'Birinchi maslahatlar tayyor' : 'Birinchi maslahatlar tayyorlanadi' },
  ]
  const done = pct >= 100

  return (
    <>
      <main className="scroll" style={{ justifyContent: 'center', alignItems: 'center', gap: 28, textAlign: 'center' }}>
        <Ring pct={pct} size={150} stroke={10}><span className="display" style={{ fontSize: 40 }}>{pct}%</span></Ring>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <h1 className="h1" style={{ fontSize: 22 }}>{done ? 'Budjetingiz tayyor' : 'Budjetingizni tuzyapman'}</h1>
          <p className="caption" style={{ margin: 0, fontSize: 14 }}>{done ? `${fmt(Object.values(state.limits).reduce((a, b) => a + (b ?? 0), 0))} soʻmlik oylik limit` : 'Bu bir necha soniya oladi'}</p>
        </div>
        <div className="card" style={{ width: '100%', gap: 14, textAlign: 'left' }} aria-live="polite">
          {steps.map((s, i) => {
            const ok = pct >= s.at
            const active = !ok && (i === 0 || pct >= steps[i - 1].at)
            return (
              <div key={i} className="row" style={{ fontSize: 15, color: ok || active ? 'var(--text)' : 'var(--muted)' }}>
                <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: ok ? 'var(--accent)' : 'transparent', border: ok ? 'none' : `2px solid ${active ? 'var(--accent)' : 'var(--line)'}`, borderTopColor: active ? 'transparent' : undefined, animation: active ? 'spin .9s linear infinite' : 'none' }}>
                  {ok && <Icon name="check" size={14} stroke={2.6} color="var(--on-accent)" />}
                </span>
                {s.text}
              </div>
            )
          })}
        </div>
      </main>
      <div className="footer">
        <button type="button" className={`btn${done ? ' primary' : ''}`} onClick={() => { updateProfile({ onboarded: true }); navigate('/', { replace: true }) }}>Asosiy sahifaga oʻtish</button>
      </div>
    </>
  )
}
