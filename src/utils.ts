import type { RouteState } from './types'

export function parseHashRoute(hash: string): RouteState {
  const match = hash.match(/^#(?:\/(?:guide|post))?\/([^/?#]+)$/)
  if (!match || !match[1] || match[1] === '') {
    return { kind: 'home' }
  }

  return { kind: 'guide', slug: match[1] }
}

export function goToGuide(slug: string): void {
  window.location.hash = `/guide/${slug}`
}

export const goToPost = goToGuide

export function goHome(): void {
  window.location.hash = '/'
}

export function formatDate(dateString: string): string {
  try {
    return new Intl.DateTimeFormat('en', {
      dateStyle: 'medium',
    }).format(new Date(dateString))
  } catch {
    return dateString
  }
}

export function parseMarkdownFile(content: string): {
  frontmatter: Record<string, unknown>
  body: string
} {
  const match = content.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\s*([\s\S]*)$/)
  if (!match) {
    return { frontmatter: {}, body: content }
  }

  const rawYaml = match[1]
  const body = match[2]
  const frontmatter: Record<string, unknown> = {}

  for (const line of rawYaml.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const colonIdx = trimmed.indexOf(':')
    if (colonIdx === -1) continue
    const key = trimmed.slice(0, colonIdx).trim()
    let val: unknown = trimmed.slice(colonIdx + 1).trim()
    if (typeof val === 'string') {
      if (
        (val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))
      ) {
        val = val.slice(1, -1)
      } else if (val === 'true') {
        val = true
      } else if (val === 'false') {
        val = false
      } else if (/^\d+$/.test(val)) {
        val = Number(val)
      }
    }
    frontmatter[key] = val
  }

  return { frontmatter, body }
}

export function transformCheckboxes(markdown: string): string {
  return markdown
    .replace(/^(\s*)-\s*\[([ xX])\]\s*-\s*/gm, (_match, indent, checked) => {
      return `${indent}- [${checked.toLowerCase()}] `
    })
    .replace(/^(\s*)\[([ xX])\]\s*-\s*/gm, (_match, indent, checked) => {
      return `${indent}- [${checked.toLowerCase()}] `
    })
}
