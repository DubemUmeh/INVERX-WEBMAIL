export default function KeyboardShortcuts() {
  return (
    <section className="py-20 bg-primary text-white overflow-hidden relative">
      {/* <!-- Background decoration --> */}
      <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black mb-4">Master your workflow</h2>
              <p className="text-neutral-400 text-lg">Don't let the mouse slow you down. Fly through your inbox.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="flex flex-col items-center gap-3">
                  <div
                      className="h-16 w-16 bg-neutral-800 rounded-lg flex items-center justify-center border-b-4 border-black shadow-lg">
                      <span className="text-2xl font-bold font-mono">C</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Compose</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div
                      className="h-16 w-16 bg-neutral-800 rounded-lg flex items-center justify-center border-b-4 border-black shadow-lg">
                      <span className="text-2xl font-bold font-mono">/</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Search</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div
                      className="h-16 w-16 bg-neutral-800 rounded-lg flex items-center justify-center border-b-4 border-black shadow-lg">
                      <span className="text-2xl font-bold font-mono">E</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Archive</span>
              </div>
              <div className="flex flex-col items-center gap-3">
                  <div className="flex gap-2">
                      <div
                          className="h-16 w-16 bg-neutral-800 rounded-lg flex items-center justify-center border-b-4 border-black shadow-lg">
                          <span className="text-2xl font-bold font-mono">G</span>
                      </div>
                      <div
                          className="h-16 w-16 bg-neutral-800 rounded-lg flex items-center justify-center border-b-4 border-black shadow-lg">
                          <span className="text-2xl font-bold font-mono">I</span>
                      </div>
                  </div>
                  <span className="text-sm font-medium text-neutral-400">Go to Inbox</span>
              </div>
          </div>
      </div>
  </section>
  )
}