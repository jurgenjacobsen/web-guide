# IssuePress

A React + TypeScript + TailwindCSS blog that uses GitHub Issues as the CMS.
## How It Works

- The home page fetches issues from a configured repository and displays them as posts.
- Clicking a post opens the issue as a full article.
- Markdown from issue bodies is rendered and sanitized before display.
- Pull requests are automatically excluded.
## Configuration

Copy `.env.example` to `.env` and set:
```bash
VITE_GITHUB_OWNER=your-github-username
VITE_GITHUB_REPO=your-repo-name
VITE_GITHUB_LABEL=blog
VITE_BLOG_TITLE=IssuePress
VITE_BASE_PATH=/
```
Notes:

- `VITE_GITHUB_LABEL` is optional. If set, only issues with that label are shown.
- `VITE_BASE_PATH=/` is correct for custom domains (like this repo using `CNAME`).
- For project pages without a custom domain, set `VITE_BASE_PATH=/your-repo-name/`.
## Local Development

```bash
npm install
npm run dev
```
## Build

```bash
npm run build
```
## Deploy To GitHub Pages

Deployment is handled by GitHub Actions using [.github/workflows/deploy.yml](.github/workflows/deploy.yml).

To deploy:

1. Push changes to `main`.
2. The workflow builds the site and publishes the `docs` artifact to GitHub Pages.

## Authoring Posts

Create a GitHub issue in your configured repo:
- Title = blog post title
- Body = markdown content
- Optional labels = tags or filtering label (`blog` by default)

After creating the issue, the post appears automatically in the blog.
