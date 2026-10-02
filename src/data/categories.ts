export type CategoryId =
  | 'food' | 'transport' | 'cafe' | 'util' | 'clothes' | 'health'
  | 'edu' | 'fun' | 'rent' | 'gift' | 'subs' | 'other' | 'income'

export interface Category {
  id: CategoryId
  name: string
  icon: string
  color: string
}

export const CATEGORIES: Record<CategoryId, Category> = {
  food: { id: 'food', name: 'Oziq-ovqat', icon: 'cart', color: '#C8F169' },
  transport: { id: 'transport', name: 'Transport', icon: 'car', color: '#7CC4FF' },
  cafe: { id: 'cafe', name: 'Kafe va restoran', icon: 'cup', color: '#FF8A65' },
  util: { id: 'util', name: 'Kommunal', icon: 'bolt', color: '#B8A4FF' },
  clothes: { id: 'clothes', name: 'Kiyim', icon: 'shirt', color: '#E8D08A' },
  health: { id: 'health', name: 'Salomatlik', icon: 'heart', color: '#FF8A65' },
  edu: { id: 'edu', name: 'Taʼlim', icon: 'book', color: '#7CC4FF' },
  fun: { id: 'fun', name: 'Koʻngilochar', icon: 'film', color: '#B8A4FF' },
  rent: { id: 'rent', name: 'Ijara', icon: 'key', color: '#E8D08A' },
  gift: { id: 'gift', name: 'Sovgʻalar', icon: 'gift', color: '#FF8A65' },
  subs: { id: 'subs', name: 'Obuna', icon: 'film', color: '#B8A4FF' },
  other: { id: 'other', name: 'Boshqa', icon: 'dots', color: '#77786F' },
  income: { id: 'income', name: 'Daromad', icon: 'cash', color: '#C8F169' },
}

/** Categories the user can pick in onboarding (order matches the design). */
export const SETUP_CATEGORIES: CategoryId[] = ['food', 'transport', 'cafe', 'util', 'clothes', 'health', 'edu', 'fun', 'rent', 'gift']

/** Expense categories selectable when editing a transaction. */
export const EXPENSE_CATEGORIES: CategoryId[] = [...SETUP_CATEGORIES, 'subs', 'other']

/** Relative weight used when the "AI" splits income into first limits. */
export const LIMIT_WEIGHTS: Partial<Record<CategoryId, number>> = {
  food: 30, transport: 17, cafe: 10, util: 10, clothes: 11, health: 6, edu: 6, fun: 6, rent: 25, gift: 4, other: 23,
}
