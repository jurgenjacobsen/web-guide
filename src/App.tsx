import { useEffect, useMemo, useState } from 'react'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { WHITELISTED_AUTHOR_SET } from './whitelisted-authors'

type GitHubIssue = {
  id: number
  number: number
  title: string
  body: string | null
  html_url: string
  created_at: string
  labels: { name: string }[]
  user: {
    login: string
  }
  pull_request?: unknown
}

type RouteState =
  | { kind: 'home' }
  | { kind: 'post'; issueNumber: number }

const owner = import.meta.env.VITE_GITHUB_OWNER as string | undefined
const repo = import.meta.env.VITE_GITHUB_REPO as string | undefined
const issueLabel = import.meta.env.VITE_GITHUB_LABEL as string | undefined
const blogTitle = import.meta.env.VITE_BLOG_TITLE || 'IssuePress'
const normalizedIssueLabel = issueLabel?.trim()
const categories = [
  'design',
  'photography',
  'study',
  'stores',
  'work',
  'crafts',
  'programming',
] as const

const isConfigured = Boolean(owner && repo)

function parseHashRoute(hash: string): RouteState {
  const match = hash.match(/^#\/post\/(\d+)$/)
  if (!match) {
    return { kind: 'home' }
  }

  return { kind: 'post', issueNumber: Number(match[1]) }
}

function goToPost(issueNumber: number): void {
  window.location.hash = `/post/${issueNumber}`
}

function goHome(): void {
  window.location.hash = '/'
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('en', {
    dateStyle: 'medium',
  }).format(new Date(dateString))
}

function App() {
  const [route, setRoute] = useState<RouteState>(() =>
    parseHashRoute(window.location.hash),
  )
  const [issues, setIssues] = useState<GitHubIssue[]>([])
  const [issuesLoading, setIssuesLoading] = useState(false)
  const [issuesError, setIssuesError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')

  const [post, setPost] = useState<GitHubIssue | null>(null)
  const [postLoading, setPostLoading] = useState(false)
  const [postError, setPostError] = useState<string | null>(null)

  useEffect(() => {
    const onHashChange = () => setRoute(parseHashRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)

    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  useEffect(() => {
    if (!isConfigured) {
      return
    }

    const controller = new AbortController()
    const fetchIssues = async () => {
      setIssuesLoading(true)
      setIssuesError(null)

      try {
        const params = new URLSearchParams({
          state: 'open',
          per_page: '100',
          sort: 'created',
          direction: 'desc',
        })

        if (normalizedIssueLabel) {
          params.set('labels', normalizedIssueLabel)
        }

        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues?${params.toString()}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`)
        }
        const data = (await response.json()) as GitHubIssue[]
        const filteredPosts = data.filter(
          (item) =>
            !item.pull_request &&
            WHITELISTED_AUTHOR_SET.has(item.user.login.toLowerCase()),
        )
        setIssues(filteredPosts)

      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }

        setIssuesError(
          'Unable to load issues from GitHub. Check repository visibility, owner/repo config, or API limits.',
        )
      } finally {
        setIssuesLoading(false)
      }
    }

    void fetchIssues()
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!isConfigured || route.kind !== 'post') {
      setPost(null)
      setPostError(null)
      return
    }

    const controller = new AbortController()
    const fetchPost = async () => {
      setPostLoading(true)
      setPostError(null)

      try {
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repo}/issues/${route.issueNumber}`,
          { signal: controller.signal },
        )

        if (!response.ok) {
          throw new Error(`GitHub API error: ${response.status}`)
        }

        const data = (await response.json()) as GitHubIssue

        if (data.pull_request) {
          throw new Error('Issue number points to a pull request')
        }

        if (!WHITELISTED_AUTHOR_SET.has(data.user.login.toLowerCase())) {
          throw new Error('Post author is not whitelisted')
        }

        setPost(data)
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }

        setPostError('Post not found or unavailable from GitHub Issues.')
      } finally {
        setPostLoading(false)
      }
    }

    void fetchPost()
    return () => controller.abort()
  }, [route])

  const postHtml = useMemo(() => {
    if (!post?.body) {
      return '<p>This post has no content yet.</p>'
    }

    const markdown = marked.parse(post.body) as string
    return DOMPurify.sanitize(markdown)
  }, [post])

  const visibleIssues = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    return issues.filter((issue) => {
      const inCategory =
        selectedCategory === 'all' ||
        issue.labels.some(
          (label) => label.name.toLowerCase() === selectedCategory,
        )

      if (!inCategory) {
        return false
      }

      if (!normalizedQuery) {
        return true
      }

      const haystack = `${issue.title}\n${issue.body || ''}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })
  }, [issues, searchQuery, selectedCategory])

  return (
    <div className="min-h-screen bg-paper text-black">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <header className="rounded-sm border-2 border-black bg-white p-4 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em]">
                Useful Websites & Resources
              </p>
              <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
                {blogTitle}
              </h1>
            </div>
            {isConfigured && (
              <a
                href={`https://github.com/${owner}/${repo}/issues`}
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border-2 border-black px-3 py-2 font-mono text-xs uppercase tracking-widest transition hover:-translate-y-0.5"
              >
                Open Issues
              </a>
            )}
          </div>
        </header>

        {!isConfigured && (
          <section className="mt-6 rounded-sm border-2 border-black bg-white p-5">
            <h2 className="font-display text-2xl">Setup Required</h2>
            <p className="mt-2 text-sm leading-relaxed">
              Set <span className="font-mono">VITE_GITHUB_OWNER</span> and{' '}
              <span className="font-mono">VITE_GITHUB_REPO</span> in your local
              env or GitHub Pages workflow env, then redeploy.
            </p>
          </section>
        )}

        {isConfigured && route.kind === 'home' && (
          <main className="mt-6 grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
            {issuesLoading && (
              <div className="rounded-sm border-2 border-black bg-white p-5 font-mono text-xs uppercase tracking-wider lg:col-span-2">
                Loading posts...
              </div>
            )}

            {issuesError && (
              <div className="rounded-sm border-2 border-black bg-white p-5 text-sm lg:col-span-2">
                {issuesError}
              </div>
            )}

            {!issuesLoading && !issuesError && issues.length === 0 && (
              <div className="rounded-sm border-2 border-black bg-white p-5 text-sm lg:col-span-2">
                No posts found. Create issues in{' '}
                <a
                  href={`https://github.com/${owner}/${repo}/issues`}
                  target="_blank"
                  rel="noreferrer"
                  className="underline decoration-2 underline-offset-4"
                >
                  {owner}/{repo}
                </a>
                .
              </div>
            )}

            {!issuesLoading && !issuesError && issues.length > 0 && (
              <>
                <aside className="h-fit rounded-sm border-2 border-black bg-white p-4 sm:p-5">
                  <h2 className="font-display text-xl">Categories</h2>
                  <div className="mt-4 flex flex-wrap gap-2 lg:flex-col">
                    <button
                      onClick={() => setSelectedCategory('all')}
                      className={`rounded-sm border-2 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider transition ${
                        selectedCategory === 'all'
                          ? 'border-black bg-black text-white'
                          : 'border-black bg-white hover:-translate-y-0.5'
                      }`}
                    >
                      All
                    </button>
                    {categories.map((category) => (
                      <button
                        key={category}
                        onClick={() => setSelectedCategory(category)}
                        className={`rounded-sm border-2 px-3 py-2 text-left font-mono text-[11px] uppercase tracking-wider transition ${
                          selectedCategory === category
                            ? 'border-black bg-black text-white'
                            : 'border-black bg-white hover:-translate-y-0.5'
                        }`}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                </aside>

                <section className="space-y-4">
                  <div className="rounded-sm border-2 border-black bg-white p-4 sm:p-5">
                    <label
                      htmlFor="post-search"
                      className="font-mono text-[11px] uppercase tracking-wider"
                    >
                      Search posts by title or content
                    </label>
                    <input
                      id="post-search"
                      type="search"
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search posts..."
                      className="mt-2 w-full rounded-sm border-2 border-black px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>

                  {visibleIssues.length === 0 ? (
                    <div className="rounded-sm border-2 border-black bg-white p-5 text-sm">
                      No posts match the selected category or search query.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {visibleIssues.map((issue) => (
                        <article
                          key={issue.id}
                          className="group cursor-pointer rounded-sm border-2 border-black bg-white p-4 transition hover:-translate-y-0.5 sm:p-5"
                          onClick={() => goToPost(issue.number)}
                        >
                          <div className="flex items-start justify-between gap-4">
                            <h2 className="font-display text-xl leading-tight sm:text-2xl">
                              {issue.title.replace(/\[post\]/g, '').trim() || 'Untitled Post'}
                            </h2>
                            <span className="rounded-sm border-2 border-black px-2 py-1 font-mono text-[10px] uppercase tracking-[0.16em]">
                              #{issue.number}
                            </span>
                          </div>

                          <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-neutral-700">
                            {(issue.body || 'No content yet.').replace(/\n+/g, ' ')}
                          </p>

                          <div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-700">
                            <span className="rounded-sm border border-black px-2 py-1 font-mono">
                              {formatDate(issue.created_at)}
                            </span>
                            <span className="rounded-sm border border-black px-2 py-1 font-mono">
                              @{issue.user.login}
                            </span>
                            {issue.labels.slice(0, 3).map((label) => (
                              <span
                                key={label.name}
                                className="rounded-sm border border-black px-2 py-1 font-mono"
                              >
                                {label.name}
                              </span>
                            ))}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </main>
        )}

        {isConfigured && route.kind === 'post' && (
          <main className="mt-6 space-y-4">
            <button
              onClick={goHome}
              className="rounded-sm border-2 border-black bg-white px-3 py-2 font-mono text-xs uppercase tracking-widest transition hover:-translate-y-0.5"
            >
              Back to Posts
            </button>

            {postLoading && (
              <div className="rounded-sm border-2 border-black bg-white p-5 font-mono text-xs uppercase tracking-wider">
                Loading post...
              </div>
            )}

            {postError && (
              <div className="rounded-sm border-2 border-black bg-white p-5 text-sm">
                {postError}
              </div>
            )}

            {!postLoading && !postError && post && (
              <article className="rounded-sm border-2 border-black bg-white p-5 sm:p-8">
                <h2 className="font-display text-2xl leading-tight sm:text-4xl">
                  {post.title}
                </h2>

                <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wider text-neutral-700">
                  <span className="rounded-sm border border-black px-2 py-1 font-mono">
                    {formatDate(post.created_at)}
                  </span>
                  <span className="rounded-sm border border-black px-2 py-1 font-mono">
                    @{post.user.login}
                  </span>
                  <a
                    href={post.html_url}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-sm border border-black px-2 py-1 font-mono underline decoration-2 underline-offset-4"
                  >
                    View on GitHub
                  </a>
                </div>

                <div
                  className="markdown-body mt-6"
                  dangerouslySetInnerHTML={{ __html: postHtml }}
                />
              </article>
            )}
          </main>
        )}
      </div>
    </div>
  )
}

export default App
