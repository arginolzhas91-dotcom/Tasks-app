export const DEFAULT_CATEGORIES = [
  'Unideas',
  'Артисты',
  'ЕЭК',
  'Winline',
  'ИП Казахстан',
  'Талдау',
  'New Business',
  'Алматы',
  'Бытовые',
]

export const USERS = [
  { id: 'olzhas', name: 'Олжас', role: 'admin', password: 'olzhas2026', color: '#8B3A2A' },
  { id: 'assistant', name: 'Ассистент', role: 'member', password: 'assist2026', visibleCategories: ['Бытовые'], color: '#1C3560' },
  { id: 'winline', name: 'Винлайн', role: 'member', password: 'win2026', visibleCategories: ['Winline'], color: '#1C3560' },
  { id: 'taldau', name: 'Талдау', role: 'member', password: 'taldau2026', visibleCategories: ['Талдау'], color: '#5C3D10' },
  { id: 'unideas', name: 'Unideas', role: 'member', password: 'uni2026', visibleCategories: ['Unideas'], color: '#3D2250' },
]

export const CAT_COLOR = {
  'Unideas':      '#3D2250',
  'Артисты':      '#7A3525',
  'ЕЭК':          '#294530',
  'Winline':      '#1C3560',
  'ИП Казахстан': '#5C3D10',
  'Талдау':       '#6B3A1A',
  'New Business': '#2A4A4A',
  'Алматы':       '#4A3A20',
  'Бытовые':      '#5A4A3A',
}

export function getUserCategories(user, categories) {
  const cats = categories || DEFAULT_CATEGORIES
  if (!user) return []
  if (user.role === 'admin') return cats
  return (user.visibleCategories || []).filter(c => cats.includes(c))
}
