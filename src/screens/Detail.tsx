import { useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { CategoryPicker, MenuItem, Sheet, TopBar, useToast } from '../components/ui'
import { CATEGORIES, EXPENSE_CATEGORIES } from '../data/categories'
import { inMonth, useMonth, useStore } from '../data/store'
import { fmt, longDate } from '../lib/format'

const SOURCE = { chek: 'Chek orqali qoʻshildi', ovoz: 'Ovoz orqali qoʻshildi', matn: 'Matn orqali qoʻshildi', avto: 'Avtomatik toʻlov' }

export default function Detail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { state, updateTransaction, deleteTransaction } = useStore()
  const month = useMonth()
  const [sheet, setSheet] = useState<'cat' | 'note' | 'items' | 'more' | null>(null)
  const [note, setNote] = useState('')
  const [toast, say] = useToast()
  const tx = state.transactions.find((t) => t.id === id)
  if (!tx) return <Navigate to="/history" replace />

  const cat = CATEGORIES[tx.category]
  const income = tx.amount > 0
  const same = state.transactions.filter((t) => t.title === tx.title && inMonth(t, new Date()))
  const sameSum = same.reduce((a, t) => a - t.amount, 0)
  const limit = state.limits[tx.category]
  const left = limit ? limit - (month.byCat[tx.category] ?? 0) : null

  const share = async () => {
    const text = `${tx.title}: ${fmt(tx.amount)} soʻm — ${longDate(tx.date)}`
    try {
      if (navigator.share) await navigator.share({ title: 'Hamyon', text })
      else { await navigator.clipboard.writeText(text); say('Nusxa olindi') }
    } catch { /* user cancelled */ }
  }

  const remove = () => {
    if (confirm('Amal oʻchirilsinmi?')) { deleteTransaction(tx.id); navigate(-1) }
  }

  return (
    <>
      <main className="scroll" style={{ gap: 20 }}>
        <TopBar back={-1} title="Amal tafsiloti" right={<button type="button" className="icon-btn" aria-label="Boshqa amallar" onClick={() => setSheet('more')}><Icon name="more" /></button>} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10, textAlign: 'center', paddingTop: 8 }}>
          <div className="icon-box" style={{ width: 64, height: 64, borderRadius: 22, background: 'var(--surface)', color: cat.color }}><Icon name={cat.icon} size={30} /></div>
          <div style={{ fontSize: 16, fontWeight: 600 }}>{tx.place ?? tx.title}</div>
          <div className="display" style={{ fontSize: 32, color: income ? 'var(--accent)' : undefined }}>{income ? '+' : '−'}{fmt(tx.amount)} <span className="muted" style={{ fontSize: 16, fontFamily: 'var(--font)' }}>soʻm</span></div>
          <div className="caption">{longDate(tx.date)} · {SOURCE[tx.source]}</div>
        </div>

        <div className="menu-group">
          <MenuItem icon={cat.icon} color={cat.color} label="Toifa" value={cat.name} onClick={() => setSheet('cat')} />
          <MenuItem icon="card" color="var(--blue)" label="Hisob" value={tx.account} chevron={false} onClick={() => say('Hozircha bitta hisob ulangan')} />
          <MenuItem icon="note" color="var(--gold)" label="Izoh" value={tx.note || 'Qoʻshish'} onClick={() => { setNote(tx.note ?? ''); setSheet('note') }} />
          {tx.items && <MenuItem icon="receipt" color="var(--purple)" label="Chek" value={`${tx.items.length} ta mahsulot`} onClick={() => setSheet('items')} />}
        </div>

        {!income && (
          <div className="card row" style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
            <span style={{ color: 'var(--accent)', flexShrink: 0 }}><Icon name="sparkle" size={18} /></span>
            <span style={{ fontSize: 14, lineHeight: 1.5 }}>
              Bu oy “{tx.title}”ga {same.length} marta — jami <b>{fmt(sameSum)} soʻm</b>.
              {left !== null && (left >= 0 ? ` ${cat.name} limitiga ${fmt(left)} soʻm qoldi.` : ` ${cat.name} limitidan ${fmt(-left)} soʻm oshdingiz.`)}
            </span>
          </div>
        )}

        <div className="grid2">
          <button type="button" className="btn sm" onClick={share}><Icon name="share" size={18} />Boʻlishish</button>
          <button type="button" className="btn sm" aria-pressed={!!tx.repeatMonthly} style={{ color: tx.repeatMonthly ? 'var(--accent)' : undefined }}
            onClick={() => { updateTransaction(tx.id, { repeatMonthly: !tx.repeatMonthly }); say(tx.repeatMonthly ? 'Takrorlash oʻchirildi' : 'Har oy takrorlanadi') }}>
            <Icon name="repeat" size={18} />Har oy takrorlash
          </button>
        </div>
      </main>
      <div className="footer"><button type="button" className="btn danger" onClick={remove}>Amalni oʻchirish</button></div>
      {toast}

      <Sheet open={sheet === 'cat'} onClose={() => setSheet(null)} title="Toifani tanlang">
        <CategoryPicker value={tx.category} options={income ? ['income'] : EXPENSE_CATEGORIES} onPick={(c) => { updateTransaction(tx.id, { category: c }); setSheet(null) }} />
      </Sheet>
      <Sheet open={sheet === 'note'} onClose={() => setSheet(null)} title="Izoh">
        <label className="sr" htmlFor="note">Izoh</label>
        <input id="note" className="input" autoFocus value={note} onChange={(e) => setNote(e.target.value)} placeholder="Masalan: haftalik xarid" style={{ flex: 'none' }} />
        <button type="button" className="btn primary" onClick={() => { updateTransaction(tx.id, { note: note.trim() || undefined }); setSheet(null) }}>Saqlash</button>
      </Sheet>
      <Sheet open={sheet === 'items'} onClose={() => setSheet(null)} title="Chek tarkibi">
        {tx.items?.map((it) => <div key={it.name} className="between" style={{ fontSize: 14 }}><span className="muted">{it.name}</span><span>{fmt(it.price)}</span></div>)}
        <div className="between" style={{ borderTop: '1px solid var(--line)', paddingTop: 10, fontWeight: 700 }}><span>Jami</span><span>{fmt(tx.amount)} soʻm</span></div>
      </Sheet>
      <Sheet open={sheet === 'more'} onClose={() => setSheet(null)} title="Amallar">
        <div className="menu-group" style={{ background: 'var(--surface-2)' }}>
          <MenuItem icon="share" label="Boʻlishish" onClick={() => { setSheet(null); share() }} />
          <MenuItem icon="edit" label="Toifani oʻzgartirish" onClick={() => setSheet('cat')} />
          <MenuItem icon="close" color="var(--danger)" label="Oʻchirish" onClick={() => { setSheet(null); remove() }} />
        </div>
      </Sheet>
    </>
  )
}
