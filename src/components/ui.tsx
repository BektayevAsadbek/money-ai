import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { Icon } from './Icon'
import { CATEGORIES, type CategoryId } from '../data/categories'
import type { Transaction } from '../data/seed'
import { shortWhen, signed } from '../lib/format'

export function Screen({ children, nav = false, footer }: { children: ReactNode; nav?: boolean; footer?: ReactNode }) {
  return (
    <>
      <main className={`scroll${nav ? ' with-nav' : ''}`}>{children}</main>
      {footer}
      {nav && <BottomNav />}
    </>
  )
}

export function TopBar({ title, back, right, backLabel = 'Orqaga', backIcon = 'arrowLeft' }: { title?: ReactNode; back?: string | number; right?: ReactNode; backLabel?: string; backIcon?: string }) {
  const navigate = useNavigate()
  return (
    <div className="topbar">
      {back !== undefined ? (
        <button type="button" className="icon-btn" aria-label={backLabel} onClick={() => (typeof back === 'number' ? navigate(back) : navigate(back))}>
          <Icon name={backIcon} />
        </button>
      ) : <div className="slot" />}
      <div className="title">{title}</div>
      <div className="slot">{right}</div>
    </div>
  )
}

const SOURCE: Record<Transaction['source'], string> = { chek: 'Chek', ovoz: 'Ovoz', matn: 'Matn', avto: 'Avtomatik' }

export function TxRow({ tx, link = true, showSource = true }: { tx: Pick<Transaction, 'title' | 'category' | 'amount' | 'date' | 'source'> & { id?: string }; link?: boolean; showSource?: boolean }) {
  const cat = CATEGORIES[tx.category]
  const income = tx.amount > 0
  const sub = showSource ? `${cat.name} · ${SOURCE[tx.source]} · ${shortWhen(tx.date)}` : `${cat.name} · ${shortWhen(tx.date).includes(':') ? 'Bugun' : shortWhen(tx.date)}`
  const body = (
    <>
      <div className="icon-box" style={{ color: cat.color }}><Icon name={cat.icon} size={20} /></div>
      <span className="meta"><span className="name">{tx.title}</span><span className="sub">{sub}</span></span>
      <span className="amt" style={{ color: income ? 'var(--accent)' : undefined }}>{signed(tx.amount)}</span>
    </>
  )
  return link && tx.id ? <Link to={`/tx/${tx.id}`} className="tx">{body}</Link> : <div className="tx">{body}</div>
}

export function Bar({ pct, color = 'var(--accent)', size }: { pct: number; color?: string; size?: 'thin' | 'thick' }) {
  return <div className={`bar${size ? ' ' + size : ''}`}><span style={{ width: `${Math.min(100, Math.max(0, pct))}%`, background: color }} /></div>
}

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
      <span />
    </button>
  )
}

export function Ring({ pct, size = 88, stroke = 8, color = 'var(--accent)', track = 'var(--surface-2)', children }: { pct: number; size?: number; stroke?: number; color?: string; track?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  return (
    <div style={{ width: size, height: size, position: 'relative', flexShrink: 0 }}>
      <svg width={size} height={size} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={`${(c * Math.min(100, pct)) / 100} ${c}`} transform={`rotate(-90 ${size / 2} ${size / 2})`} style={{ transition: 'stroke-dasharray .5s' }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>{children}</div>
    </div>
  )
}

export function BottomNav() {
  const item = (to: string, icon: string, label: string) => (
    <NavLink to={to} end className={({ isActive }) => (isActive ? 'active' : '')}>
      <Icon name={icon} /><span>{label}</span>
    </NavLink>
  )
  return (
    <nav className="nav" aria-label="Asosiy menyu">
      {item('/', 'home', 'Asosiy')}
      {item('/analytics', 'chart', 'Tahlil')}
      <Link to="/add/text" className="fab" aria-label="Amal qoʻshish"><Icon name="plus" size={26} stroke={2.2} /></Link>
      {item('/budget', 'wallet', 'Budjet')}
      {item('/advice', 'sparkle', 'Maslahat')}
    </nav>
  )
}

export function MenuItem({ icon, color, label, value, to, onClick, chevron = true }: { icon: string; color?: string; label: string; value?: ReactNode; to?: string; onClick?: () => void; chevron?: boolean }) {
  const inner = (
    <>
      <span className="icon-box" style={{ color: color ?? 'var(--muted)' }}><Icon name={icon} size={19} /></span>
      <span className="label">{label}</span>
      {value !== undefined && <span className="value">{value}</span>}
      {chevron && <span className="muted"><Icon name="chevronRight" size={18} /></span>}
    </>
  )
  if (to) return <Link to={to} className="menu-item">{inner}</Link>
  return <button type="button" className="menu-item" onClick={onClick}>{inner}</button>
}

export function Sheet({ open, onClose, title, children }: { open: boolean; onClose: () => void; title: string; children: ReactNode }) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  return (
    <div style={{ position: 'absolute', inset: 0, zIndex: 40, background: 'rgba(0,0,0,.55)', display: 'flex', alignItems: 'flex-end' }} onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxHeight: '80%', overflowY: 'auto', background: 'var(--surface)', borderRadius: '28px 28px 0 0', padding: '12px 20px 34px', display: 'flex', flexDirection: 'column', gap: 12, animation: 'rise .25s ease-out' }}>
        <span style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, background: 'var(--line)' }} />
        <div className="between"><span className="section-title" style={{ fontSize: 17 }}>{title}</span>
          <button type="button" className="icon-btn" aria-label="Yopish" style={{ background: 'var(--surface-2)' }} onClick={onClose}><Icon name="close" size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  )
}

export function CategoryPicker({ value, options, onPick }: { value?: CategoryId; options: CategoryId[]; onPick: (c: CategoryId) => void }) {
  return (
    <div className="grid2">
      {options.map((id) => {
        const c = CATEGORIES[id]
        const on = id === value
        return (
          <button key={id} type="button" aria-pressed={on} onClick={() => onPick(id)}
            style={{ minHeight: 52, borderRadius: 16, border: `1px solid ${on ? 'var(--accent)' : 'var(--line)'}`, background: on ? 'var(--surface-2)' : 'transparent', display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', fontSize: 14, fontWeight: 600, textAlign: 'left' }}>
            <span style={{ color: c.color }}><Icon name={c.icon} size={19} /></span>{c.name}
          </button>
        )
      })}
    </div>
  )
}

export function useToast() {
  const [msg, setMsg] = useState<string | null>(null)
  useEffect(() => {
    if (!msg) return
    const t = setTimeout(() => setMsg(null), 2400)
    return () => clearTimeout(t)
  }, [msg])
  const node = msg ? <div className="toast" role="status">{msg}</div> : null
  return [node, setMsg] as const
}

export function AmountSheet({ open, title, cta, initial = '', onClose, onSubmit }: { open: boolean; title: string; cta: string; initial?: string; onClose: () => void; onSubmit: (n: number) => void }) {
  const [v, setV] = useState(initial)
  useEffect(() => { if (open) setV(initial) }, [open, initial])
  const n = parseInt(v.replace(/\D/g, ''), 10) || 0
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <label className="field">
        <span className="sr">Summa</span>
        <input autoFocus inputMode="numeric" value={v ? n.toLocaleString('ru-RU') : ''} placeholder="0" onChange={(e) => setV(e.target.value)} />
        <span className="muted">soʻm</span>
      </label>
      <button type="button" className="btn primary" disabled={!n} style={{ opacity: n ? 1 : .5 }} onClick={() => { onSubmit(n); onClose() }}>{cta}</button>
    </Sheet>
  )
}
