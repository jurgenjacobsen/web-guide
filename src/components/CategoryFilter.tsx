import type { Category } from '../types'

interface CategoryFilterProps {
  categories: readonly Category[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function CategoryFilter({
  categories,
  selectedCategory,
  onSelectCategory,
}: CategoryFilterProps) {
  return (
    <aside className="h-full rounded-sm border-2 border-black bg-white p-4 sm:p-5">
      <h2 className="font-display text-xl">Categories</h2>
      <div className="mt-4 flex flex-wrap gap-2 lg:flex-col">
        <button
          onClick={() => onSelectCategory('all')}
          className={`rounded-sm border-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider transition ${
            selectedCategory === 'all'
              ? 'border-black bg-black text-white'
              : 'border-black bg-white hover:-translate-y-0.5'
          }`}
        >
          All
        </button>
        {categories.map((category) => (
          <button
            key={category.name}
            onClick={() => onSelectCategory(category.name)}
            className={`flex items-center gap-2 rounded-sm border-2 px-3 py-2 text-left font-mono text-xs uppercase tracking-wider transition ${
              selectedCategory === category.name
                ? 'border-black bg-black text-white'
                : 'border-black bg-white hover:-translate-y-0.5'
            }`}
          >
            {/* The Dot */}
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            {category.name}
          </button>
        ))}
      </div>
    </aside>
  )
}
