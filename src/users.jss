export const USERS = [
  { id: 'olzhas', name: 'Олжас', role: 'admin', password: 'olzhas2026', color: '#8B3A2A' },
  { id: 'assistant', name: 'Ассистент', role: 'member', password: 'assist2026', visibleCategories: ['Бытовые'], color: '#1C3560' },
  { id: 'winline', name: 'Винлайн', role: 'member', password: 'win2026', visibleCategories: ['Винлайн'], color: '#1C3560' },
  { id: 'taldau', name: 'Талдау', role: 'member', password: 'taldau2026', visibleCategories: ['Талдау'], color: '#5C3D10' },
  { id: 'moskva', name: 'Москва', role: 'member', password: 'msk2026', visibleCategories: ['Москва'], color: '#3D2250' },
]

export const CATEGORIES = ['Бытовые', 'Винлайн', 'ЕЭК', 'Талдау', 'Москва']

export const CAT_COLOR = {
  'Бытовые': '#7A3525',
  'Винлайн': '#1C3560',
  'ЕЭК':     '#294530',
  'Талдау':  '#5C3D10',
  'Москва':  '#3D2250',
}

export function getUserCategories(user) {
  if (!user) return []
  if (user.role === 'admin') return CATEGORIES
  return user.visibleCategories || []
}
