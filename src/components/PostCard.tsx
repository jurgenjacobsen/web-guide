import type { Guide, Category } from '../types'
import { formatDate } from '../utils'

interface PostCardProps {
  guide?: Guide
  issue?: Guide
  categories: readonly Category[]
  onClick: () => void
}

export default function PostCard({
  guide,
  issue,
  categories,
  onClick,
}: PostCardProps) {
  const item = guide || issue

  if (!item) {
    return null
  }

  const categoryColor =
    categories.find(
      (c) => c.name.toLowerCase() === item.category?.toLowerCase(),
    )?.color || '#ccc'

  return (
    <article
      className="flex flex-col justify-between group cursor-pointer rounded-sm border-2 border-black bg-white p-4 transition hover:-translate-y-0.5 sm:p-5"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="font-display text-xl font-medium leading-tight sm:text-2xl">
          {item.title || 'Untitled Guide'}
        </h2>
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-700">
        {item.description || 'No description yet.'}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider text-neutral-700">
        {item.date && (
          <span className="rounded-sm border border-black px-2 py-1 font-mono">
            {formatDate(item.date)}
          </span>
        )}
        {item.author && (
          <span className="rounded-sm border border-black px-2 py-1 font-mono">
            {item.author.startsWith('@') ? item.author : `@${item.author}`}
          </span>
        )}
        {item.category && (
          <span className="inline-flex items-center gap-1.5 rounded-sm border border-black px-2 py-1 font-mono uppercase">
            {/* The Dot: Colored based on category */}
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: categoryColor }}
            />
            {item.category}
          </span>
        )}
      </div>
    </article>
  )
}
