import blogIcon from '../assets/icon.svg'
import githubIcon from '../assets/github.svg'

interface HeaderProps {
  blogTitle: string
  owner?: string
  repo?: string
}

export default function Header({ blogTitle, owner, repo }: HeaderProps) {
  return (
    <header className="rounded-sm border-2 border-black bg-white p-4 sm:p-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2rem]">
            Useful Websites & Resources
          </p>
          <h1 className="mt-2 inline-flex items-center gap-4 font-display text-3xl leading-tight sm:text-5xl">
            <img
              src={blogIcon}
              alt=""
              aria-hidden="true"
              className="h-8 w-8 shrink-0 sm:h-12 sm:w-12"
            />
            <span>{blogTitle}</span>
          </h1>
        </div>
        {owner && repo && (
          <a
            href={`https://github.com/${owner}/${repo}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-sm border-2 border-black px-4 py-2 font-mono text-xs uppercase tracking-widest transition hover:-translate-y-0.5"
          >
            <img
              src={githubIcon}
              alt=""
              aria-hidden="true"
              className="h-4 w-4 shrink-0"
            />
            <span>GitHub</span>
          </a>
        )}
      </div>
    </header>
  )
}
