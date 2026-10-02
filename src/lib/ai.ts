import type { CategoryId } from '../data/categories'
import type { NewTx } from '../data/store'
import { limitStatus, type Totals } from '../data/store'
import type { State } from '../data/seed'
import { fmt } from './format'

/* ------------------------------------------------------------------
 * Natural-language parser: "tushlik 45 000, benzin 150 ming, oylik tushdi 8,2 mln"
 * → three transactions with amount, category, title and date.
 * Runs fully on-device; swap `parseEntries` for an LLM call later if needed.
 * ------------------------------------------------------------------ */

const norm = (s: string) => s.toLowerCase().replace(/[ʻʼ‘’`']/g, "'")

const MERCHANTS: [RegExp, string, CategoryId][] = [
  [/korzinka/, 'Korzinka', 'food'],
  [/makro/, 'Makro', 'food'],
  [/havas/, 'Havas', 'food'],
  [/yandex/, 'Yandex Go', 'transport'],
  [/my ?taxi|mytaxi/, 'MyTaxi', 'transport'],
  [/evos/, 'Evos', 'cafe'],
]

const CATEGORY_WORDS: [CategoryId, RegExp][] = [
  ['income', /oylik|maosh|daromad|bonus|avans|keldi|tushdi|ish haqi|stipendiya|qarz qaytdi/],
  ['cafe', /tushlik|nonushta|kechki ovqat|kafe|restoran|kofe|qahva|choyxona|osh\b|burger|pitsa|lavash|somsa|shashlik/],
  ['transport', /taksi|taxi|benzin|metro|avtobus|yo'l|propan|metan|mashina|parkovka|transport/],
  ['food', /oziq|bozor|non\b|sut|go'sht|meva|sabzavot|supermarket|do'kon|ovqat|xarid/],
  ['util', /svet|elektr|kommunal|internet|suv\b|gaz\b|telefon|mobil|uzmobile|beeline/],
  ['clothes', /kiyim|ko'ylak|poyabzal|krossovka|shim|kurtka|libos/],
  ['health', /dori|apteka|dorixona|shifokor|klinika|stomatolog|tahlil/],
  ['edu', /kurs|kitob|o'qish|kontrakt|repetitor|maktab/],
  ['fun', /kino|konsert|o'yin|teatr|park/],
  ['rent', /ijara|kvartira|uy haqi/],
  ['gift', /sovg'a|tug'ilgan|to'y|gul\b/],
  ['subs', /obuna|netflix|spotify|youtube/],
]

const TITLES: Partial<Record<CategoryId, string>> = { income: 'Daromad' }

function parseAmount(chunk: string): { value: number; raw: string } | null {
  // "8,2 mln" | "150 ming" | "45 000" | "45000 so'm" | "24k"
  const re = /(\d{1,3}(?:[  ]\d{3})+|\d+(?:[.,]\d+)?)\s*(mln|million|millon|ming|k\b|m\b)?/i
  const m = chunk.match(re)
  if (!m) return null
  let value = parseFloat(m[1].replace(/[  ]/g, '').replace(',', '.'))
  const unit = (m[2] || '').toLowerCase()
  if (unit.startsWith('m') && unit !== 'ming') value *= 1_000_000
  else if (unit === 'ming' || unit === 'k') value *= 1_000
  if (!value || value < 100) return null
  return { value: Math.round(value), raw: m[0] }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

export interface ParseOptions { now?: Date }

export function parseEntries(input: string, { now = new Date() }: ParseOptions = {}): NewTx[] {
  const chunks = input
    // split on commas that aren't decimal separators ("8,2 mln" stays whole)
    .split(/,(?!\d)|[;\n]|\s+va\s+|\.\s+/i)
    .map((c) => c.trim())
    .filter(Boolean)

  const out: NewTx[] = []
  const globalYesterday = /kecha/.test(norm(input))

  for (const chunk of chunks) {
    const amount = parseAmount(chunk)
    if (!amount) continue
    const n = norm(chunk)

    let category: CategoryId = 'other'
    let title = ''
    const merchant = MERCHANTS.find(([re]) => re.test(n))
    if (merchant) { title = merchant[1]; category = merchant[2] }
    for (const [cat, re] of CATEGORY_WORDS) {
      if (re.test(n)) { if (!merchant || cat === 'income') category = cat; break }
    }

    if (!title) {
      if (category === 'income' && /oylik|maosh|ish haqi/.test(n)) title = 'Oylik maosh'
      else {
        const word = n
          .replace(amount.raw.toLowerCase(), ' ')
          .replace(/\b(bugun|kecha|so'm|so'mlik|sum|uzs|berdim|oldim|to'ladim|ketdi|tushdi|ga|uchun|naqd|karta)\b/g, ' ')
          .replace(/[^a-z'ʻ\s-]/g, ' ')
          .trim()
          .split(/\s+/)
          .filter((w) => w.length > 2)[0]
        title = word ? cap(word.replace(/(ga|dan|da)$/, '')) : TITLES[category] ?? 'Xarajat'
      }
    }

    const d = new Date(now)
    if (/kecha/.test(n) || (globalYesterday && !/bugun/.test(n))) d.setDate(d.getDate() - 1)

    out.push({
      title,
      category,
      amount: category === 'income' ? amount.value : -amount.value,
      date: d.toISOString(),
      source: 'matn',
    })
  }
  return out
}

/* ------------------------------------------------------------------
 * Insights: rule-based advice computed from the user's own numbers.
 * ------------------------------------------------------------------ */

export interface Insight {
  id: string
  tone: 'warn' | 'info' | 'good'
  overline: string
  title: string
  body: string
  cta: string
  to: string
}

export function healthScore(state: State, month: Totals): number {
  let score = 100
  for (const [cat, limit] of Object.entries(state.limits)) {
    const spent = month.byCat[cat as CategoryId] ?? 0
    const st = limitStatus(spent, limit!)
    if (st === 'over') score -= 8
    else if (st === 'near') score -= 5
  }
  const limitTotal = Object.values(state.limits).reduce((a, b) => a + (b ?? 0), 0)
  if (limitTotal && month.expense / limitTotal > 0.75) score -= 10
  if (!state.profile.autoSave) score -= 8
  return Math.max(10, Math.min(100, score))
}

export function scoreLabel(score: number) {
  if (score >= 85) return 'Aʼlo'
  if (score >= 65) return 'Yaxshi'
  if (score >= 45) return 'Oʻrtacha'
  return 'Eʼtibor kerak'
}

export function insights(state: State, month: Totals, prev: Totals): Insight[] {
  const list: Insight[] = []

  const over = Object.entries(state.limits)
    .map(([c, l]) => ({ c: c as CategoryId, over: (month.byCat[c as CategoryId] ?? 0) - (l ?? 0) }))
    .filter((x) => x.over > 0)
    .sort((a, b) => b.over - a.over)[0]
  if (over) {
    const names: Partial<Record<CategoryId, string>> = { cafe: 'Kafe', food: 'Oziq-ovqat', transport: 'Transport', util: 'Kommunal', clothes: 'Kiyim', other: 'Boshqa' }
    list.push({
      id: 'over', tone: 'warn', overline: 'DIQQAT',
      title: `${names[over.c] ?? 'Toifa'} limitidan ${fmt(over.over)} soʻm oshdingiz`,
      body: over.c === 'cafe'
        ? 'Asosan ish kunlari tushlikda. Ertalab uydan ovqat olib chiqsangiz, limitga qaytasiz.'
        : 'Oy oxirigacha shu toifadagi xarajatlarni kamaytirishga harakat qiling yoki limitni qayta koʻrib chiqing.',
      cta: 'Limitni koʻrib chiqish', to: '/budget',
    })
  }

  const subs = state.subscriptions
  const subTotal = subs.reduce((a, s) => a + s.price, 0)
  const unused = subs.filter((s) => s.unused)
  if (subs.length) {
    list.push({
      id: 'subs', tone: 'info', overline: 'OBUNALAR',
      title: `${subs.length} ta obunaga oyiga ${fmt(subTotal)} soʻm`,
      body: unused.length
        ? `Ulardan ${unused.length === 1 ? 'biri' : unused.length + ' tasi'} 2 oydan beri ishlatilmayapti. Bekor qilsangiz, yiliga ${fmt(unused.reduce((a, s) => a + s.price, 0) * 12)} soʻm tejaysiz.`
        : 'Hammasi faol ishlatilyapti. Toʻlovdan oldin eslatma olasiz.',
      cta: 'Obunalarni koʻrish', to: '/subscriptions',
    })
  }

  const income = month.income || state.profile.income
  const tenth = Math.round(income * 0.1 / 10000) * 10000
  list.push({
    id: 'save', tone: 'good', overline: 'JAMGʻARMA',
    title: state.profile.autoSave ? `Har oy ${fmt(state.profile.autoSaveAmount)} soʻm jamgʻarilyapti` : `Oylik tushgan kuni ${fmt(tenth)} soʻm ajrating`,
    body: state.profile.autoSave
      ? 'Avtojamgʻarma yoqilgan. Maqsadlarga tezroq yetish uchun summani oshirishingiz mumkin.'
      : 'Bu daromadingizning 10% i. Avtojamgʻarma buni har oy oʻzi bajaradi.',
    cta: state.profile.autoSave ? 'Maqsadlarni koʻrish' : 'Avtojamgʻarmani yoqish', to: '/goals',
  })

  if (prev.expense > 0 && month.expense > prev.expense * 1.1) {
    list.push({
      id: 'trend', tone: 'warn', overline: 'TENDENSIYA',
      title: `Xarajatlar oʻtgan oyga nisbatan ${Math.round((month.expense / prev.expense - 1) * 100)}% oshdi`,
      body: 'Tahlil boʻlimida qaysi toifalar oʻsganini koʻring.', cta: 'Tahlilni ochish', to: '/analytics',
    })
  }
  return list
}

/** Daily headline insight for the home screen: [before, highlighted, after]. */
export function headline(state: State, month: Totals): [string, string, string] {
  const cafe = month.byCat.cafe ?? 0
  const limit = state.limits.cafe
  if (limit && cafe > limit) {
    return ['Kafe xarajatlari limitdan ', `${Math.round((cafe / limit - 1) * 100)}%`, ' oshdi. Haftada 2 marta uyda ovqatlansangiz, oyiga ~400 000 soʻm tejaysiz.']
  }
  const top = Object.entries(month.byCat).sort((a, b) => (b[1] ?? 0) - (a[1] ?? 0))[0]
  if (top) return ['Bu oy eng katta xarajat toifasi — ', `${fmt(top[1] ?? 0)} soʻm`, '. Limitlaringizni Budjet boʻlimida kuzating.']
  return ['Birinchi amalni qoʻshing — tahlil va maslahatlar shu yerda paydo boʻladi.', '', '']
}

/** Very small on-device Q&A for the advice chat. */
export function answer(q: string, state: State, month: Totals): string {
  const n = norm(q)
  const limitsTotal = Object.values(state.limits).reduce((a, b) => a + (b ?? 0), 0)
  if (/qancha|sarf|xarajat/.test(n)) {
    for (const [cat, re] of CATEGORY_WORDS) {
      if (cat !== 'income' && re.test(n)) {
        const spent = month.byCat[cat] ?? 0
        const lim = state.limits[cat]
        return `Bu oy bu toifaga ${fmt(spent)} soʻm sarfladingiz${lim ? `, limit ${fmt(lim)} soʻm` : ''}.`
      }
    }
    return `Bu oy jami ${fmt(month.expense)} soʻm sarfladingiz — limitning ${limitsTotal ? Math.round((month.expense / limitsTotal) * 100) : 0}%.`
  }
  if (/daromad|oylik|topdim/.test(n)) return `Bu oy daromad: ${fmt(month.income)} soʻm. Qoldiq: ${fmt(month.income - month.expense)} soʻm.`
  if (/tejash|jamg'ar|maslahat/.test(n)) return `Daromadning 10% i — ${fmt(Math.round(month.income * 0.1))} soʻm — ni oylik tushgan kuni ajrating. Eng katta tejash imkoni: kafe va obunalar.`
  if (/maqsad|istanbul|noutbuk/.test(n)) {
    return state.goals.map((g) => `${g.name}: ${Math.round((g.saved / g.target) * 100)}%`).join(' · ')
  }
  return 'Hozircha xarajat, daromad, tejash va maqsadlar haqida javob bera olaman. Masalan: “Kafega qancha sarfladim?”'
}
