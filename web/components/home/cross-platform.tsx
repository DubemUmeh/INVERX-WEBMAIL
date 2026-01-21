export default function CrossPlatform() {
  return (
    <section className="py-20 bg-background-light dark:bg-background-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-black text-primary dark:text-white mb-4">Everywhere you work
              </h2>
              <p className="text-lg text-neutral-600 dark:text-neutral-400">Native apps for every device. Your state
                  syncs instantly.</p>
          </div>
          <div className="relative h-[400px] md:h-[500px] w-full max-w-5xl mx-auto rounded-3xl bg-neutral-200 dark:bg-neutral-800 overflow-hidden flex items-end justify-center px-4"
              data-alt="Abstract composition of laptop, tablet, and mobile devices displaying the Airmailly application, showing cross-platform consistency"
              style={{ background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.1) 100%)"}}>
              {/* <!-- Laptop --> */}
              <div
                  className="relative z-10 w-[60%] md:w-[600px] aspect-video bg-white dark:bg-[#121212] rounded-t-xl shadow-2xl border-x-8 border-t-8 border-neutral-800 translate-y-2">
                  <div className="w-full h-full bg-neutral-100 dark:bg-neutral-900 flex flex-col p-4">
                      <div className="w-1/3 h-4 bg-neutral-200 dark:bg-neutral-800 rounded mb-4"></div>
                      <div className="space-y-2">
                          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                          <div className="w-full h-2 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                          <div className="w-2/3 h-2 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                      </div>
                  </div>
              </div>
              {/* <!-- Tablet --> */}
              <div
                  className="absolute left-[5%] md:left-[10%] bottom-0 z-20 w-[25%] md:w-[200px] aspect-3/4 bg-white dark:bg-[#121212] rounded-t-xl shadow-2xl border-x-8 border-t-8 border-neutral-800">
                  <div className="w-full h-full bg-neutral-50 dark:bg-neutral-900 p-2">
                      <div className="w-1/2 h-2 bg-neutral-200 dark:bg-neutral-800 rounded mb-2"></div>
                      <div className="space-y-1">
                          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                          <div className="w-full h-1.5 bg-neutral-200 dark:bg-neutral-800 rounded"></div>
                      </div>
                  </div>
              </div>
              {/* <!-- Phone --> */}
              <div
                  className="absolute right-[5%] md:right-[15%] bottom-0 z-30 w-[15%] md:w-[100px] aspect-9/18 bg-white dark:bg-[#121212] rounded-t-xl shadow-2xl border-x-4 border-t-4 border-neutral-800">
                  <div className="w-full h-full bg-neutral-50 dark:bg-neutral-900 p-1">
                      <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded mb-1"></div>
                      <div className="w-full h-1 bg-neutral-200 dark:bg-neutral-800 rounded mb-1"></div>
                  </div>
              </div>
          </div>
      </div>
  </section>
  )
}