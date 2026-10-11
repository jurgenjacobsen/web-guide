interface SearchBarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
}

export default function SearchBar({
  searchQuery,
  onSearchChange,
}: SearchBarProps) {
  return (
    <div className="rounded-sm border-2 border-black bg-white p-4 sm:p-5">
      <label
        htmlFor="post-search"
        className="font-mono text-xs uppercase tracking-wider"
      >
        Search posts by title or content
      </label>
      <input
        id="post-search"
        type="search"
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        placeholder="Search posts..."
        className="mt-2 w-full border-2 border-black px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-black"
      />
    </div>
  )
}
