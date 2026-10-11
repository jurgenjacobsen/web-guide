import type { Category } from './types'

export const categories: readonly Category[] = [
  {
    name: 'design',
    color: '#0E8A16',
  },
  {
    name: 'photography',
    color: '#1D76DB',
  },
  {
    name: 'study',
    color: '#FBCA04',
  },
  {
    name: 'stores',
    color: '#5319E7',
  },
  {
    name: 'work',
    color: '#F07361',
  },
  {
    name: 'crafts',
    color: '#C5DEF5',
  },
  {
    name: 'development',
    color: '#0052CC',
  },
] as const
