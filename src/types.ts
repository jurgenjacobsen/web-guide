export type Guide = {
  slug: string
  filename: string
  title: string
  description?: string
  author?: string
  category?: string
  date?: string
  tags?: string[]
  [key: string]: unknown
}

export type GitHubIssue = Guide

export type RouteState =
  | { kind: 'home' }
  | { kind: 'guide'; slug: string }

export type Category = {
  name: string
  color: string
}
