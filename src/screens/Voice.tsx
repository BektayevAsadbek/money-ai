import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '../components/Icon'
import { TopBar, TxRow } from '../components/ui'
import { useStore } from '../data/store'
import { parseEntries } from '../lib/ai'

/* Minimal typing for the Web Speech API (not in lib.dom for all browsers). */
interface SpeechRec {
  lang: string; interimResults: boolean; continuous: boolean
  onresult: ((e: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null
  onend: (() => void) | null; onerror: (() => void) | null
  start(): void; stop(): void
}
const SR: (new () => SpeechRec) | undefined =
  (window as unknown as { SpeechRecognition?: new () => SpeechRec; webkitSpeechRecognition?: new () => SpeechRec }).SpeechRecognition ??
  (window as unknown as { webkitSpeechRecognition?: new () => SpeechRec }).webkitSpeechRecognition

const DEMO = 'Bugun Korzinkadan 186 ming soʻmlik oziq-ovqat oldim, taksiga 24 ming berdim'
const BARS = [10, 18, 26, 14, 30, 22, 36, 20, 28, 40, 24, 16, 32, 44, 26, 18, 34, 22, 30, 14, 24, 18, 12, 20, 10, 16, 8, 12, 6, 10]

export default function Voice() {
  const { addTransactions } = useStore()
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [text, setText] = useState('')
  const [sec, setSec] = useState(0)
  const rec = useRef<SpeechRec | null>(null)

  const parsed = text ? parseEntries(text).map((t) => ({ ...t, source: 'ovoz' as const })) : []

  const start = () => {
    setText(''); setSec(0)
    if (!SR) {
      // No speech engine in this browser — simulate a short recording with a sample phrase.
      setListening(true)
      setTimeout(() => { setText(DEMO); setListening(false) }, 2600)
      return
    }
    const r = new SR()
    r.lang = 'uz-UZ'
    r.interimResults = true
    r.continuous = false
    r.onresult = (e) => setText(Array.from(e.results).map((x) => x[0].transcript).join(' '))
    r.onend = () => setListening(false)
    r.onerror = () => setListening(false)
    rec.current = r
    r.start()
    setListening(true)
  }

  const stop = () => { rec.current?.stop(); setListening(false) }

  useEffect(() => {
    if (!listening) return
    const t = setInterval(() => setSec((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [listening])

  useEffect(() => { start(); return () => rec.current?.stop() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <main className="scroll" style={{ alignItems: 'stretch' }}>
        <TopBar back={-1} title="Ovoz bilan kiritish" right={<span className="small" style={{ background: 'var(--surface)', padding: '6px 10px', borderRadius: 999, fontWeight: 600 }}>UZ</span>} />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, paddingTop: 8 }}>
          <div style={{ position: 'relative', width: 120, height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {listening && [0, 0.6].map((d) => (
              <span key={d} style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'var(--accent)', animation: `pulse 1.6s ${d}s infinite ease-out` }} />
            ))}
            <button type="button" aria-label={listening ? 'Yozishni toʻxtatish' : 'Qayta yozish'} onClick={listening ? stop : start}
              style={{ position: 'relative', width: 88, height: 88, borderRadius: '50%', border: 'none', background: 'var(--accent)', color: 'var(--on-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={listening ? 'stop' : 'mic'} size={34} stroke={2} />
            </button>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 17, fontWeight: 600 }}>{listening ? 'Tinglayapman…' : text ? 'Tayyor' : 'Gapirish uchun bosing'}</div>
            <div className="caption">{listening ? `0:${String(sec).padStart(2, '0')} · Toʻxtatish uchun bosing` : SR ? 'Masalan: “taksiga 24 ming berdim”' : 'Demo rejim: brauzer ovozni tanimaydi'}</div>
          </div>
          <div aria-hidden="true" style={{ display: 'flex', alignItems: 'center', gap: 3, height: 44 }}>
            {BARS.map((h, i) => (
              <span key={i} style={{ width: 4, height: h, borderRadius: 2, background: listening || i < 22 ? 'var(--accent)' : 'var(--line)', opacity: listening ? 1 : .5, animation: listening ? `wave ${0.6 + (i % 5) * 0.12}s ${i * 0.03}s infinite ease-in-out` : 'none' }} />
            ))}
          </div>
        </div>

        {text && (
          <div className="card" style={{ fontSize: 16, lineHeight: 1.5, borderRadius: 20 }}>“{text}”</div>
        )}

        {parsed.length > 0 && !listening && (
          <section style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span className="caption">{parsed.length} ta amal aniqlandi</span>
            <div className="card" style={{ padding: '4px 16px' }}>
              <div className="list">{parsed.map((t, i) => <TxRow key={i} tx={t} link={false} showSource={false} />)}</div>
            </div>
          </section>
        )}
        {text && !listening && parsed.length === 0 && <p className="caption">Summani aniqlay olmadim. Qayta urinib koʻring.</p>}
        {!text && !listening && (
          <button type="button" className="chip" style={{ alignSelf: 'center' }} onClick={() => setText(DEMO)}>Namuna bilan sinash</button>
        )}
      </main>

      <div className="footer row">
        <button type="button" className="btn" style={{ flex: 1 }} onClick={start}>Qayta yozish</button>
        <button type="button" className="btn primary" style={{ flex: 1.4, opacity: parsed.length ? 1 : .5 }} disabled={!parsed.length || listening}
          onClick={() => { addTransactions(parsed); navigate('/saved') }}>
          {parsed.length ? `${parsed.length} ta amalni saqlash` : 'Saqlash'}
        </button>
      </div>
    </>
  )
}
