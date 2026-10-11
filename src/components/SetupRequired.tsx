export default function SetupRequired() {
  return (
    <section className="mt-6 rounded-sm border-2 border-black bg-white p-4">
      <h2 className="font-display text-2xl">Setup Required</h2>
      <p className="mt-2 text-sm leading-relaxed">
        Set <span className="font-mono">VITE_GITHUB_OWNER</span> and{' '}
        <span className="font-mono">VITE_GITHUB_REPO</span> in your local env or
        GitHub Pages workflow env, then redeploy.
      </p>
    </section>
  )
}
