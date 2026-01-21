export default function AdminDashShowcase() {
  return (
    <section className="w-full bg-white dark:bg-neutral-900 py-20 border-y border-[#ededed] dark:border-neutral-800">
      <div className="layout-container flex h-full grow flex-col">
        <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
            <div className="flex flex-col gap-8 text-center items-center mb-10">
              <h2 className="text-primary dark:text-white text-3xl font-bold leading-tight">Your command center</h2>
              <p className="text-neutral-600 dark:text-neutral-400 max-w-2xl">
                Visualize your organization's communication health. Monitor usage, manage billing, and configure global settings with an interface built for clarity.
              </p>
            </div>
            <div
              className="relative w-full rounded-xl overflow-hidden shadow-2xl border border-[#ededed] dark:border-neutral-800 group">
              <div className="bg-cover bg-center min-h-[400px] md:min-h-[500px]"
                data-alt="Wide shot of the main administration dashboard with graphs and user tables"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDRJ-OFtlPFrqJ9fgZ-Ym29S1yOJC9xqa61qxfxLhv8_7JKV3gaTrsioLff42UQSpoo_JovcRAiPrU98QAaEcv6waQPzZQM5DLqTvlqSCWBA0wtoucEwAM7oTJu54aISGylOSVVeBbDBWxVke45XOHW7bxCITHmuhehPXwV3Pm1NW4CVvAuaPlBJAd3096fz5OmdlQHl_-m4lf3gamLbCVUycQrqdDXs3V9JBYjMWg7cL9_yUmuuAQVIcV1adToHYeHIW4zjUW5s0Y")' }}>
              </div>
              {/* <!-- Overlay Content --> */}
              <div
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <button
                  className="bg-white text-primary font-bold py-3 px-6 rounded-lg shadow-lg transform translate-y-4 group-hover:translate-y-0 transition-transform">
                  View Interactive Demo
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}