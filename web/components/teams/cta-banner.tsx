export default function TeamsCTA() {
  return (
    <section className="px-4 md:px-10 lg:px-40 flex justify-center py-20">
      <div className="layout-content-container flex flex-col items-center max-w-[720px] text-center gap-8">
        <h2 className="text-primary dark:text-white text-4xl font-black leading-tight tracking-[-0.033em]">
          Ready to upgrade your team's workflow?
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 text-lg">
          Join thousands of teams who have switched to Inverx for a faster, calmer, and more secure email experience.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <button
            className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-primary dark:bg-white text-white dark:text-primary text-base font-bold leading-normal hover:opacity-90 transition-opacity">
            Request Access
          </button>
          <button
            className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-lg h-12 px-6 bg-[#ededed] dark:bg-neutral-800 text-[#141414] dark:text-white text-base font-bold leading-normal hover:bg-[#e0e0e0] dark:hover:bg-neutral-700 transition-colors">
            Contact Sales
          </button>
        </div>
      </div>
    </section>
  )
}