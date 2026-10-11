import { useMemo } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import type { Guide, Category } from '../types'
import { formatDate, transformCheckboxes } from '../utils'
import arrowIcon from '../assets/arrow.svg'

interface PostDetailProps {
  guide?: Guide | null
  post?: Guide | null
  markdownContent?: string | null
  categories?: readonly Category[]
  loading: boolean
  error: string | null
  onBack: () => void
}

export default function PostDetail({
  guide,
  post,
  markdownContent,
  categories = [],
  loading,
  error,
  onBack,
}: PostDetailProps) {
  const activeGuide = guide || post

  const contentHtml = useMemo(() => {
    if (!markdownContent) {
      return '<p>This guide has no content yet.</p>'
    }

    const processed = transformCheckboxes(markdownContent)
    const rawHtml = marked.parse(processed) as string
    const html = rawHtml.replace(/\s*disabled(?:=""|="disabled")?/g, '')
    return DOMPurify.sanitize(html, {
      ADD_TAGS: ['input'],
      ADD_ATTR: ['type', 'checked'],
    })
  }, [markdownContent])

  const categoryColor =
    categories.find(
      (c) => c.name.toLowerCase() === activeGuide?.category?.toLowerCase(),
    )?.color || '#ccc'

  return (
    <main className="mt-6 space-y-4">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-2 rounded-sm border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase tracking-widest transition hover:-translate-y-0.5"
      >
        <img
          src={arrowIcon}
          alt=""
          aria-hidden="true"
          className="h-4 w-4 shrink-0"
        />
        <span>Back to Guides</span>
      </button>

      {loading && (
        <div className="rounded-sm border-2 border-black bg-white p-5 font-mono text-xs uppercase tracking-wider">
          Loading guide...
        </div>
      )}

      {error && (
        <div className="rounded-sm border-2 border-black bg-white p-5 text-sm">
          {error}
        </div>
      )}

      {!loading && !error && activeGuide && (
        <article className="rounded-sm border-2 border-black bg-white p-5 sm:p-8">
          <h2 className="font-display text-2xl leading-tight sm:text-4xl">
            {activeGuide.title}
          </h2>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs uppercase tracking-wider">
            {activeGuide.date && (
              <span className="rounded-sm border border-black px-2 py-1 font-mono">
                {formatDate(activeGuide.date)}
              </span>
            )}
            {activeGuide.author && (
              <a href={"https://github.com/" + activeGuide.author} target="_blank" className="rounded-sm border border-black px-2 py-1 font-mono hover:underline decoration-2 underline-offset-2">
                {activeGuide.author.startsWith('@')
                  ? activeGuide.author
                  : `@${activeGuide.author}`}
              </a>
            )}
            {activeGuide.category && (
              <span className="inline-flex items-center gap-1.5 rounded-sm border border-black px-2 py-1 font-mono uppercase">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: categoryColor }}
                />
                {activeGuide.category}
              </span>
            )}
          </div>

          <div
            className="markdown-body mt-6"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />
        </article>
      )}
    </main>
  )
}
