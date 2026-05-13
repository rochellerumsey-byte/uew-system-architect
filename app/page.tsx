/**
 * Home page placeholder. Commit 4 of Phase 1 replaces this with the blueprint
 * list + create flow. For Commit 1 we just need the build to succeed and the
 * brand to read correctly so the deploy verifies.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-xl text-center">
        <div className="text-xs font-mono font-bold tracking-widest uppercase text-uew-orange mb-2">
          UEW Healthcare · AI Innovations
        </div>
        <h1 className="text-4xl font-bold text-uew-navy leading-tight mb-3">
          System Architect
        </h1>
        <p className="text-base text-slate-600 leading-relaxed">
          Design, decompose, and document AI-augmented systems.
        </p>
        <p className="mt-6 text-sm text-slate-500">
          Project scaffolded. Home page lands in Commit 4 of Phase 1.
        </p>
      </div>
    </main>
  );
}
