import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { CATEGORIES, LIMIT_WEIGHTS, type CategoryId } from './categories'
import { seed, type Goal, type Profile, type State, type Transaction } from './seed'
import { uid } from '../lib/format'

const KEY = 'hamyon:v1'

function load(): State {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as State
  } catch { /* storage unavailable — fall back to demo data */ }
  return seed()
}

export type NewTx = Omit<Transaction, 'id' | 'account'> & { account?: string }

interface Store {
  state: State
  addTransactions: (txs: NewTx[]) => void
  updateTransaction: (id: string, patch: Partial<Transaction>) => void
  deleteTransaction: (id: string) => void
  updateProfile: (patch: Partial<Profile>) => void
  setLimit: (cat: CategoryId, amount: number) => void
  buildBudget: (income: number, cats: CategoryId[]) => void
  addGoal: (g: Pick<Goal, 'name' | 'target'>) => string
  moveGoal: (id: string, amount: number) => void
  updateGoal: (id: string, patch: Partial<Goal>) => void
  toggleSubUnused: (id: string, unused: boolean) => void
  addSubscription: (name: string, price: number, day: number) => void
  markAllRead: () => void
  reset: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(load)

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)) } catch { /* ignore quota / private mode */ }
  }, [state])

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', state.profile.accent)
  }, [state.profile.accent])

  const addTransactions = useCallback((txs: NewTx[]) => {
    const created = txs.map((t) => ({ account: 'Uzcard ···4521', ...t, id: uid() }))
    setState((s) => ({ ...s, transactions: [...created, ...s.transactions], lastSaved: created.map((t) => t.id) }))
  }, [])

  const updateTransaction = useCallback((id: string, patch: Partial<Transaction>) => {
    setState((s) => ({ ...s, transactions: s.transactions.map((t) => (t.id === id ? { ...t, ...patch } : t)) }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setState((s) => ({ ...s, transactions: s.transactions.filter((t) => t.id !== id) }))
  }, [])

  const updateProfile = useCallback((patch: Partial<Profile>) => {
    setState((s) => ({ ...s, profile: { ...s.profile, ...patch } }))
  }, [])

  const setLimit = useCallback((cat: CategoryId, amount: number) => {
    setState((s) => ({ ...s, limits: { ...s.limits, [cat]: amount } }))
  }, [])

  /** First budget: keep ~15% of income unallocated, split the rest by category weight, round to 50 000. */
  const buildBudget = useCallback((income: number, cats: CategoryId[]) => {
    const picked = [...cats, 'other' as CategoryId]
    const total = picked.reduce((a, c) => a + (LIMIT_WEIGHTS[c] ?? 5), 0)
    const pool = income * 0.85
    const limits: Partial<Record<CategoryId, number>> = {}
    for (const c of picked) limits[c] = Math.max(50000, Math.round((pool * (LIMIT_WEIGHTS[c] ?? 5)) / total / 50000) * 50000)
    setState((s) => ({ ...s, limits, profile: { ...s.profile, income, categories: cats, autoSaveAmount: Math.round(income * 0.1 / 10000) * 10000 } }))
  }, [])

  const addGoal = useCallback((g: Pick<Goal, 'name' | 'target'>) => {
    const id = uid()
    const palette = ['#7CC4FF', '#B8A4FF', '#E8D08A', '#FF8A65', '#C8F169']
    setState((s) => ({ ...s, goals: [...s.goals, { id, name: g.name, target: g.target, saved: 0, icon: 'piggy', color: palette[s.goals.length % palette.length], history: [] }] }))
    return id
  }, [])

  const moveGoal = useCallback((id: string, amount: number) => {
    setState((s) => ({
      ...s,
      goals: s.goals.map((g) => g.id !== id ? g : {
        ...g,
        saved: Math.max(0, g.saved + amount),
        history: [{ id: uid(), label: amount > 0 ? 'Qoʻlda qoʻshildi' : 'Yechib olindi', amount, date: new Date().toISOString() }, ...g.history],
      }),
    }))
  }, [])

  const updateGoal = useCallback((id: string, patch: Partial<Goal>) => {
    setState((s) => ({ ...s, goals: s.goals.map((g) => (g.id === id ? { ...g, ...patch } : g)) }))
  }, [])

  const toggleSubUnused = useCallback((id: string, unused: boolean) => {
    setState((s) => ({ ...s, subscriptions: s.subscriptions.map((x) => (x.id === id ? { ...x, unused } : x)) }))
  }, [])

  const addSubscription = useCallback((name: string, price: number, day: number) => {
    setState((s) => ({ ...s, subscriptions: [...s.subscriptions, { id: uid(), name, price, day, icon: 'repeat', color: '#7CC4FF', account: 'Uzcard ···4521' }] }))
  }, [])

  const markAllRead = useCallback(() => {
    setState((s) => ({ ...s, notifications: s.notifications.map((x) => ({ ...x, read: true })) }))
  }, [])

  const reset = useCallback(() => setState(seed()), [])

  const value = useMemo<Store>(() => ({
    state, addTransactions, updateTransaction, deleteTransaction, updateProfile, setLimit, buildBudget,
    addGoal, moveGoal, updateGoal, toggleSubUnused, addSubscription, markAllRead, reset,
  }), [state, addTransactions, updateTransaction, deleteTransaction, updateProfile, setLimit, buildBudget, addGoal, moveGoal, updateGoal, toggleSubUnused, addSubscription, markAllRead, reset])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore must be used inside <StoreProvider>')
  return s
}

/* ---------------- Selectors ---------------- */

export function inMonth(t: Transaction, ref: Date, offset = 0) {
  const d = new Date(t.date)
  const m = new Date(ref.getFullYear(), ref.getMonth() + offset, 1)
  return d.getFullYear() === m.getFullYear() && d.getMonth() === m.getMonth()
}

export interface Totals { income: number; expense: number; byCat: Partial<Record<CategoryId, number>> }

export function totals(txs: Transaction[]): Totals {
  const byCat: Partial<Record<CategoryId, number>> = {}
  let income = 0
  let expense = 0
  for (const t of txs) {
    if (t.amount > 0) income += t.amount
    else {
      expense += -t.amount
      byCat[t.category] = (byCat[t.category] ?? 0) - t.amount
    }
  }
  return { income, expense, byCat }
}

export function useMonth(offset = 0) {
  const { state } = useStore()
  return useMemo(() => {
    const now = new Date()
    return totals(state.transactions.filter((t) => inMonth(t, now, offset)))
  }, [state.transactions, offset])
}

export function useBalance() {
  const { state } = useStore()
  return useMemo(() => state.openingBalance + state.transactions.reduce((a, t) => a + t.amount, 0), [state])
}

export type LimitStatus = 'over' | 'near' | 'ok'
export const limitStatus = (spent: number, limit: number): LimitStatus =>
  spent > limit ? 'over' : spent / limit >= 0.9 ? 'near' : 'ok'

export const catColor = (id: CategoryId) => CATEGORIES[id]?.color ?? '#77786F'
