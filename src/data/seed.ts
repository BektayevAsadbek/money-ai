import type { CategoryId } from './categories'

export type Source = 'chek' | 'ovoz' | 'matn' | 'avto'

export interface ReceiptItem { name: string; price: number }

export interface Transaction {
  id: string
  title: string
  place?: string
  category: CategoryId
  /** Negative for expenses, positive for income (soʻm). */
  amount: number
  date: string
  source: Source
  account: string
  note?: string
  items?: ReceiptItem[]
  repeatMonthly?: boolean
}

export interface GoalEntry { id: string; label: string; amount: number; date: string }

export interface Goal {
  id: string
  name: string
  icon: string
  color: string
  saved: number
  target: number
  deadline?: string
  history: GoalEntry[]
}

export interface Subscription {
  id: string
  name: string
  icon: string
  color: string
  price: number
  day: number
  account: string
  unused?: boolean
}

export interface Notification {
  id: string
  title: string
  body: string
  icon: string
  color: string
  date: string
  read: boolean
}

export interface Profile {
  name: string
  phone: string
  onboarded: boolean
  income: number
  categories: CategoryId[]
  faceId: boolean
  autoSave: boolean
  autoSaveAmount: number
  remindSubs: boolean
  plus: boolean
  accent: string
}

export interface State {
  openingBalance: number
  transactions: Transaction[]
  limits: Partial<Record<CategoryId, number>>
  goals: Goal[]
  subscriptions: Subscription[]
  notifications: Notification[]
  profile: Profile
  lastSaved: string[]
}

export const ACCOUNT = 'Uzcard ···4521'

/** Date `daysAgo` days back at hh:mm, clamped to the current month so demo stats stay in "this month". */
function at(daysAgo: number, hh: number, mm: number, now: Date, clamp = true): string {
  const d = new Date(now)
  const back = clamp ? Math.min(daysAgo, now.getDate() - 1) : daysAgo
  d.setDate(now.getDate() - back)
  d.setHours(hh, mm, 0, 0)
  return d.toISOString()
}

function monthDay(day: number, now: Date, monthOffset = 0) {
  return new Date(now.getFullYear(), now.getMonth() + monthOffset, day, 10, 0).toISOString()
}

/**
 * Demo data mirroring the Claude Design canvas. Totals for the current month:
 * income 8 200 000, expenses 5 340 000 (food 1 820 000, transport 960 000,
 * cafe 850 000, util 640 000, other 550 000, clothes 520 000), balance 12 480 000.
 */
export function seed(now = new Date()): State {
  let n = 0
  const tx = (t: Omit<Transaction, 'id' | 'account'> & { account?: string }): Transaction => ({ id: `t${++n}`, account: ACCOUNT, ...t })

  const transactions: Transaction[] = [
    tx({ title: 'Korzinka', place: 'Korzinka · Chilonzor', category: 'food', amount: -186400, date: at(0, 14, 32, now), source: 'chek', note: 'Haftalik xarid',
      items: [
        { name: 'Sut 2,5% · 1 l', price: 14900 }, { name: 'Non', price: 4000 }, { name: 'Tovuq filesi · 1 kg', price: 52000 },
        { name: 'Guruch · 2 kg', price: 38000 }, { name: 'Pomidor · 1 kg', price: 18500 }, { name: 'Tuxum · 10 dona', price: 17000 },
        { name: 'Pishloq', price: 24000 }, { name: 'Choy', price: 12000 }, { name: 'Olma · 1 kg', price: 6000 },
      ] }),
    tx({ title: 'Yandex Go', category: 'transport', amount: -24000, date: at(0, 9, 10, now), source: 'ovoz' }),
    tx({ title: 'Oylik maosh', category: 'income', amount: 8200000, date: at(1, 10, 0, now), source: 'matn' }),
    tx({ title: 'Tushlik', category: 'cafe', amount: -45000, date: at(1, 13, 15, now), source: 'matn' }),
    tx({ title: 'Benzin', category: 'transport', amount: -150000, date: at(2, 18, 40, now), source: 'matn' }),
    tx({ title: 'Onlayn kinoteatr', category: 'other', amount: -65000, date: at(2, 8, 0, now), source: 'avto' }),
    tx({ title: 'Havas', category: 'food', amount: -412000, date: at(4, 19, 5, now), source: 'chek' }),
    tx({ title: 'Kofe', category: 'cafe', amount: -38000, date: at(5, 8, 45, now), source: 'ovoz' }),
    tx({ title: 'Elektr energiya', category: 'util', amount: -240000, date: at(6, 11, 20, now), source: 'matn' }),
    tx({ title: 'Metro kartasi', category: 'transport', amount: -100000, date: at(7, 8, 10, now), source: 'matn' }),
    tx({ title: 'Korzinka', place: 'Korzinka · Chilonzor', category: 'food', amount: -298600, date: at(8, 18, 30, now), source: 'chek' }),
    tx({ title: 'Krossovka', category: 'clothes', amount: -520000, date: at(9, 16, 0, now), source: 'chek' }),
    tx({ title: 'Restoran', category: 'cafe', amount: -420000, date: at(10, 20, 30, now), source: 'ovoz' }),
    tx({ title: 'Bulutli xotira', category: 'other', amount: -65000, date: at(11, 9, 0, now), source: 'avto' }),
    tx({ title: 'Benzin', category: 'transport', amount: -300000, date: at(12, 17, 50, now), source: 'matn' }),
    tx({ title: 'Gaz va suv', category: 'util', amount: -160000, date: at(13, 12, 0, now), source: 'matn' }),
    tx({ title: 'Makro', category: 'food', amount: -540000, date: at(15, 18, 10, now), source: 'chek' }),
    tx({ title: 'Burger', category: 'cafe', amount: -95000, date: at(16, 21, 0, now), source: 'matn' }),
    tx({ title: 'Internet', category: 'util', amount: -240000, date: at(17, 10, 0, now), source: 'avto' }),
    tx({ title: 'Taksi', category: 'transport', amount: -386000, date: at(18, 22, 10, now), source: 'ovoz' }),
    tx({ title: 'Musiqa obunasi', category: 'other', amount: -59000, date: at(19, 9, 0, now), source: 'avto' }),
    tx({ title: 'Bozor', category: 'food', amount: -383000, date: at(20, 11, 30, now), source: 'ovoz' }),
    tx({ title: 'Choyxona', category: 'cafe', amount: -252000, date: at(22, 14, 0, now), source: 'matn' }),
    tx({ title: 'Sovgʻa', category: 'other', amount: -361000, date: at(24, 17, 0, now), source: 'matn' }),
  ]

  return {
    openingBalance: 9620000,
    transactions,
    limits: { food: 2000000, transport: 1200000, cafe: 700000, util: 700000, clothes: 800000, other: 1600000 },
    goals: [
      { id: 'g1', name: 'Taʼtil — Istanbul', icon: 'plane', color: '#7CC4FF', saved: 2600000, target: 6000000, deadline: new Date(now.getFullYear(), 11, 31).toISOString(),
        history: [
          { id: 'h1', label: 'Avtojamgʻarma', amount: 820000, date: monthDay(5, now) },
          { id: 'h2', label: 'Qoʻlda qoʻshildi', amount: 500000, date: monthDay(18, now, -1) },
          { id: 'h3', label: 'Avtojamgʻarma', amount: 820000, date: monthDay(5, now, -1) },
          { id: 'h4', label: 'Boshlangʻich summa', amount: 460000, date: monthDay(20, now, -2) },
        ] },
      { id: 'g2', name: 'Yangi noutbuk', icon: 'laptop', color: '#B8A4FF', saved: 1250000, target: 12000000, deadline: new Date(now.getFullYear() + 1, 5, 30).toISOString(),
        history: [{ id: 'h5', label: 'Qoʻlda qoʻshildi', amount: 1250000, date: monthDay(2, now, -1) }] },
      { id: 'g3', name: 'Favqulodda jamgʻarma', icon: 'shield', color: '#E8D08A', saved: 500000, target: 15000000,
        history: [{ id: 'h6', label: 'Qoʻlda qoʻshildi', amount: 500000, date: monthDay(10, now, -1) }] },
    ],
    subscriptions: [
      { id: 's1', name: 'Onlayn kinoteatr', icon: 'film', color: '#B8A4FF', price: 65000, day: 5, account: ACCOUNT },
      { id: 's2', name: 'Bulutli xotira', icon: 'cloud', color: '#7CC4FF', price: 65000, day: 12, account: ACCOUNT },
      { id: 's3', name: 'Musiqa obunasi', icon: 'music', color: '#FF8A65', price: 59000, day: 18, account: ACCOUNT, unused: true },
    ],
    notifications: [
      { id: 'n1', title: 'Kafe limiti oshdi', body: 'Bu oy uchun limitdan 150 000 soʻm oshdingiz.', icon: 'cup', color: '#FF8A65', date: at(0, 12, 40, now, false), read: false },
      { id: 'n2', title: 'Oylik tushdi', body: '+8 200 000 soʻm. 10% ini jamgʻarmaga oʻtkazaylikmi?', icon: 'cash', color: '#C8F169', date: at(0, 9, 0, now, false), read: false },
      { id: 'n3', title: 'Ertaga obuna toʻlovi', body: 'Onlayn kinoteatr — 65 000 soʻm, Uzcard ···4521 dan.', icon: 'film', color: '#B8A4FF', date: at(1, 18, 0, now, false), read: true },
      { id: 'n4', title: 'Haftalik hisobot tayyor', body: 'Oʻtgan haftaga nisbatan 12% kam sarfladingiz.', icon: 'chart', color: '#7CC4FF', date: at(1, 10, 0, now, false), read: true },
      { id: 'n5', title: 'Maqsadga 43% yetdingiz', body: 'Taʼtil — Istanbul: 2 600 000 / 6 000 000 soʻm.', icon: 'plane', color: '#7CC4FF', date: at(3, 20, 15, now, false), read: true },
    ],
    profile: {
      name: 'Aziz Karimov',
      phone: '+998 90 123 45 67',
      onboarded: false,
      income: 8000000,
      categories: ['food', 'transport', 'cafe', 'util', 'fun'],
      faceId: true,
      autoSave: true,
      autoSaveAmount: 820000,
      remindSubs: true,
      plus: false,
      accent: '#C8F169',
    },
    lastSaved: [],
  }
}
