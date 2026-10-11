import { useEffect, useMemo, useState } from 'react'
import { categories } from './constants'
import type { Guide, RouteState } from './types'
import { parseHashRoute, goToGuide, goHome, parseMarkdownFile } from './utils'
import {
  Header,
  CategoryFilter,
  SearchBar,
  PostCard,
  PostDetail,
  Footer,
} from './components'

const owner = import.meta.env.VITE_GITHUB_OWNER as string | undefined
const repo = import.meta.env.VITE_GITHUB_REPO as string | undefined
const blogTitle = import.meta.env.VITE_BLOG_TITLE || 'IssuePress'

function App() {
  const [route, setRoute] = useState<RouteState>(() =>
    parseHashRoute(window.location.hash),
  )
  const [guides, setGuides] = useState<Guide[]>([])
  const [guidesLoading, setGuidesLoading] = useState(true)
  const [guidesError, setGuidesError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [activeGuide, setActiveGuide] = useState<Guide | null>(null)
  const [guideContent, setGuideContent] = useState<string | null>(null)
  const [guideLoading, setGuideLoading] = useState(false)
  const [guideError, setGuideError] = useState<string | null>(null)

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Load guides/index.json
  useEffect(() => {
    const controller = new AbortController()
    const fetchGuides = async () => {
      setGuidesLoading(true)
      setGuidesError(null)

      try {
        const indexPath = `${import.meta.env.BASE_URL}guides/index.json`
        const response = await fetch(indexPath, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Failed to load index.json (${response.status})`)
        }

        const data = (await response.json()) as Guide[]
        setGuides(data)
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
        setGuidesError('Unable to load guides index.')
      } finally {
        setGuidesLoading(false)
      }
    }

    void fetchGuides()
    return () => controller.abort()
  }, [])

  // When viewing a specific guide, fetch its markdown file
  useEffect(() => {
    if (route.kind !== 'guide') {
      return
    }

    const controller = new AbortController()
    const fetchGuideContent = async () => {
      setActiveGuide(null)
      setGuideContent(null)
      setGuideLoading(true)
      setGuideError(null)

      try {
        const matchingGuide = guides.find(
          (g) =>
            g.slug.toLowerCase() === route.slug.toLowerCase() ||
            g.filename.toLowerCase().replace(/\.md$/, '') ===
              route.slug.toLowerCase(),
        )

        const filename = matchingGuide
          ? matchingGuide.filename
          : route.slug.endsWith('.md')
            ? route.slug
            : `${route.slug}.md`

        const fileUrl = `${import.meta.env.BASE_URL}guides/${filename}`
        const response = await fetch(fileUrl, { signal: controller.signal })

        if (!response.ok) {
          throw new Error(`Guide file not found (${response.status})`)
        }

        const rawMarkdown = await response.text()
        const { frontmatter, body } = parseMarkdownFile(rawMarkdown)

        const resolvedGuide: Guide = {
          slug: matchingGuide?.slug || route.slug,
          filename,
          title:
            matchingGuide?.title ||
            (frontmatter.title as string) ||
            matchingGuide?.slug ||
            route.slug,
          description:
            matchingGuide?.description ||
            (frontmatter.description as string) ||
            '',
          author:
            matchingGuide?.author || (frontmatter.author as string) || '',
          category:
            matchingGuide?.category || (frontmatter.category as string) || '',
          ...frontmatter,
          ...matchingGuide,
        }

        setActiveGuide(resolvedGuide)
        setGuideContent(body)
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
        setGuideError('Guide not found or unable to load markdown content.')
      } finally {
        setGuideLoading(false)
      }
    }

    void fetchGuideContent()
    return () => controller.abort()
  }, [route, guides])

  const visibleGuides = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase().replace(/@/, '')

    return guides.filter((guide) => {
      const inCategory =
        selectedCategory === 'all' ||
        guide.category?.toLowerCase() === selectedCategory

      if (!inCategory) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const haystack =
        `${guide.title}\n${guide.description || ''}\n${guide.category || ''}\n${guide.author || ''}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [guides, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-paper text-black">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-8">
        <Header blogTitle={blogTitle} owner={owner} repo={repo} />

        {route.kind === 'home' && (
          <main className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            {guidesLoading && (
              <div className="rounded-sm border-2 border-black bg-white p-5 font-mono text-xs uppercase tracking-wider lg:col-span-2">
                Loading guides...
              </div>
            )}

            {guidesError && (
              <div className="rounded-sm border-2 border-black bg-white p-5 text-sm lg:col-span-2">
                {guidesError}
              </div>
            )}

            {!guidesLoading && !guidesError && guides.length === 0 && (
              <div className="rounded-sm border-2 border-black bg-white p-5 text-sm lg:col-span-2">
                No guides found in guides/index.json.
              </div>
            )}

            {!guidesLoading && !guidesError && guides.length > 0 && (
              <>
                <CategoryFilter
                  categories={categories}
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                />

                <section className="space-y-4">
                  <SearchBar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                  />

                  {visibleGuides.length === 0 ? (
                    <div className="rounded-sm border-2 border-black bg-white p-5 text-sm">
                      No guides match the selected category or search query.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
                      {visibleGuides.map((guide) => (
                        <PostCard
                          key={guide.slug || guide.filename}
                          guide={guide}
                          categories={categories}
                          onClick={() => goToGuide(guide.slug)}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        )}

        {route.kind === 'guide' && (
          <PostDetail
            guide={activeGuide}
            markdownContent={guideContent}
            categories={categories}
            loading={guideLoading}
            error={guideError}
            onBack={goHome}
          />
        )}

        <Footer />
      </div>
    </div>
  )
}

export default App
