import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { CategoryPicker, Sheet } from '../components/ui'
import { CATEGORIES, EXPENSE_CATEGORIES, type CategoryId } from '../data/categories'
import { useStore } from '../data/store'
import type { ReceiptItem } from '../data/seed'
import { fmt, longDate, MONTHS } from '../lib/format'

/**
 * Receipt recognition. OCR is not wired up yet, so a captured photo is shown as the
 * preview and a sample receipt is "recognised". Replace `recognise` with a vision/OCR API.
 */
async function recognise(): Promise<{ store: string; items: ReceiptItem[] }> {
  await new Promise((r) => setTimeout(r, 1800))
  return {
    store: 'Korzinka',
    items: [
      { name: 'Sut 2,5% · 1 l', price: 14900 }, { name: 'Non', price: 4000 }, { name: 'Tovuq filesi · 1 kg', price: 52000 },
      { name: 'Guruch · 2 kg', price: 38000 }, { name: 'Pomidor · 1 kg', price: 18500 }, { name: 'Tuxum · 10 dona', price: 17000 },
      { name: 'Pishloq', price: 24000 }, { name: 'Choy', price: 12000 }, { name: 'Olma · 1 kg', price: 6000 },
    ],
  }
}

export default function Scan() {
  const { addTransactions } = useStore()
  const navigate = useNavigate()
  const file = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState<string | null>(null)
  const [busy, setBusy] = useState(true)
  const [result, setResult] = useState<{ store: string; items: ReceiptItem[] } | null>(null)
  const [all, setAll] = useState(false)
  const [cat, setCat] = useState<CategoryId>('food')
  const [picking, setPicking] = useState(false)
  const [torch, setTorch] = useState(false)
  const now = useRef(new Date().toISOString())

  const run = () => { setBusy(true); setResult(null); recognise().then((r) => { setResult(r); setBusy(false) }) }
  useEffect(run, [])

  const total = result?.items.reduce((a, i) => a + i.price, 0) ?? 0
  const d = new Date(now.current)
  const stamp = `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()} ${longDate(now.current).split(', ')[1]}`

  return (
    <>
      <div style={{ position: 'relative', flex: 1, minHeight: 0, background: '#070807', overflow: 'hidden' }}>
        {photo ? (
          <img src={photo} alt="Chek surati" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: .9 }} />
        ) : (
          <div aria-hidden="true" style={{ position: 'absolute', left: '50%', top: 110, transform: 'translateX(-50%) rotate(-2deg)', width: 220, background: '#F4F1E8', color: '#1a1a17', borderRadius: 6, padding: '18px 16px', display: 'flex', flexDirection: 'column', gap: 8, boxShadow: '0 20px 50px rgba(0,0,0,.6)', fontFamily: 'ui-monospace, monospace' }}>
            <div style={{ fontSize: 14, fontWeight: 700, textAlign: 'center', letterSpacing: 2 }}>KORZINKA</div>
            <div style={{ fontSize: 10, textAlign: 'center', color: '#6b6a63' }}>{stamp}</div>
            <div style={{ borderTop: '1px dashed #C9C6BC' }} />
            {[60, 44, 70, 52, 38, 64, 48, 56].map((w, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ width: `${w}%`, height: 6, borderRadius: 3, background: '#C9C6BC' }} /><span style={{ width: '18%', height: 6, borderRadius: 3, background: '#C9C6BC' }} /></div>
            ))}
            <div style={{ borderTop: '1px dashed #C9C6BC' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}><span>JAMI</span><span>{fmt(total || 186400)}</span></div>
          </div>
        )}
        {/* viewfinder corners */}
        {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
          <span key={c} aria-hidden="true" style={{
            position: 'absolute', width: 34, height: 34, borderColor: 'var(--text)', borderStyle: 'solid', borderWidth: 0,
            ...(c[0] === 't' ? { top: 90, borderTopWidth: 3 } : { top: 430, borderBottomWidth: 3 }),
            ...(c[1] === 'l' ? { left: 50, borderLeftWidth: 3 } : { right: 50, borderRightWidth: 3 }),
            borderRadius: c === 'tl' ? '12px 0 0 0' : c === 'tr' ? '0 12px 0 0' : c === 'bl' ? '0 0 0 12px' : '0 0 12px 0',
          }} />
        ))}
        {busy && <span aria-hidden="true" style={{ position: 'absolute', left: 50, right: 50, height: 2, background: 'var(--accent)', boxShadow: '0 0 16px var(--accent)', animation: 'scanline 2.2s infinite ease-in-out' }} />}

        <div className="topbar" style={{ position: 'absolute', top: 52, left: 20, right: 20 }}>
          <button type="button" className="icon-btn" aria-label="Yopish" style={{ background: 'rgba(255,255,255,.12)' }} onClick={() => navigate(-1)}><Icon name="close" /></button>
          <div className="title">Chekni skanerlash</div>
          <button type="button" className="icon-btn" aria-label={torch ? 'Chiroqni oʻchirish' : 'Chiroqni yoqish'} aria-pressed={torch} style={{ background: torch ? 'var(--accent)' : 'rgba(255,255,255,.12)', color: torch ? 'var(--on-accent)' : undefined }} onClick={() => setTorch(!torch)}><Icon name="flash" /></button>
        </div>

        <input ref={file} type="file" accept="image/*" capture="environment" className="sr" aria-label="Chek suratini tanlash"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) { setPhoto(URL.createObjectURL(f)); run() } }} />
      </div>

      <section style={{ background: 'var(--surface)', borderRadius: '28px 28px 0 0', marginTop: -28, position: 'relative', padding: '10px 20px 30px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '62%', overflowY: 'auto' }}>
        <span style={{ alignSelf: 'center', width: 40, height: 5, borderRadius: 3, background: 'var(--line)' }} />
        {busy || !result ? (
          <div className="row" style={{ padding: '18px 0' }}>
            <span style={{ width: 24, height: 24, borderRadius: '50%', border: '3px solid var(--line)', borderTopColor: 'var(--accent)', animation: 'spin .8s linear infinite' }} />
            <span style={{ fontSize: 15, fontWeight: 600 }}>Chek oʻqilmoqda…</span>
          </div>
        ) : (
          <>
            <div className="between">
              <div className="row">
                <span style={{ width: 36, height: 36, borderRadius: 12, background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Icon name="check" size={20} stroke={2.4} /></span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>Chek aniqlandi</span>
                  <span className="small muted">{result.store} · {d.getDate()}-{MONTHS[d.getMonth()]}, {longDate(now.current).split(', ')[1]}</span>
                </div>
              </div>
              <button type="button" className="chip" style={{ background: 'var(--surface-2)', color: CATEGORIES[cat].color }} onClick={() => setPicking(true)}>{CATEGORIES[cat].name}</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 14 }}>
              {(all ? result.items : result.items.slice(0, 3)).map((it) => (
                <div key={it.name} className="between"><span className="muted">{it.name}</span><span>{fmt(it.price)}</span></div>
              ))}
              {result.items.length > 3 && (
                <button type="button" className="link" style={{ color: 'var(--accent)', alignSelf: 'flex-start', minHeight: 32 }} onClick={() => setAll(!all)}>
                  {all ? 'Yashirish' : `Yana ${result.items.length - 3} ta mahsulotni koʻrish`}
                </button>
              )}
            </div>
            <div className="between" style={{ borderTop: '1px solid var(--line)', paddingTop: 12 }}>
              <span className="muted" style={{ fontSize: 14 }}>Jami</span>
              <span className="display" style={{ fontSize: 22 }}>{fmt(total)} <span className="muted" style={{ fontSize: 14, fontFamily: 'var(--font)' }}>soʻm</span></span>
            </div>
            <div className="row" style={{ gap: 8 }}>
              <button type="button" className="icon-btn" aria-label="Boshqa surat tanlash" style={{ width: 56, height: 56, borderRadius: 18, background: 'var(--surface-2)' }} onClick={() => file.current?.click()}><Icon name="image" /></button>
              <button type="button" className="btn primary" onClick={() => {
                addTransactions([{ title: result.store, place: result.store, category: cat, amount: -total, date: new Date().toISOString(), source: 'chek', items: result.items }])
                navigate('/saved')
              }}>Xarajat sifatida saqlash</button>
            </div>
          </>
        )}
      </section>

      <Sheet open={picking} onClose={() => setPicking(false)} title="Toifani tanlang">
        <CategoryPicker value={cat} options={EXPENSE_CATEGORIES} onPick={(c) => { setCat(c); setPicking(false) }} />
      </Sheet>
    </>
  )
}
