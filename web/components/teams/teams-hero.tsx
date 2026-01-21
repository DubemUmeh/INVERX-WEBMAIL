import Link from "next/link"

export default function TeamsHero() {
  return (
    <section className="layout-container flex h-full grow flex-col">
      <div className="px-4 md:px-10 lg:px-20 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-none flex-1">
          <div className="@container">
            <div className="flex flex-col gap-6 px-4 py-10 @[480px]:gap-8 @[864px]:flex-row items-center">
              {/* <!-- Hero Content --> */}
              <div className="flex flex-col gap-6 @[480px]:min-w-[400px] @[480px]:gap-8 @[864px]:justify-center flex-1">
                <div className="flex flex-col gap-4 text-left">
                  <h1 className="text-primary dark:text-white text-4xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
                    Collaborate without the clutter. Secure email for fast-moving teams.
                  </h1>
                  <h2 className="text-neutral-600 dark:text-neutral-400 text-base font-normal leading-relaxed @[480px]:text-lg">
                    Manage custom domains, provision users instantly, and share inboxes securely, all from one powerful
                    dashboard designed for modern workflows.
                  </h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href='/login'
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-primary dark:bg-white text-white dark:text-primary text-base font-bold leading-normal tracking-[0.015em] hover:opacity-90 transition-opacity">
                    <span className="truncate">Request Access</span>
                  </Link>
                  <Link
                    href='/contact'
                    className="flex min-w-[84px] cursor-pointer items-center justify-center overflow-hidden rounded-lg h-12 px-6 bg-[#ededed] dark:bg-neutral-800 text-[#141414] dark:text-white text-base font-bold leading-normal tracking-[0.015em] hover:bg-[#e0e0e0] dark:hover:bg-neutral-700 transition-colors">
                    <span className="truncate">Contact Sales</span>
                  </Link>
                </div>
              </div>
              {/* <!-- Hero Image --> */}
              <div
                className="w-full flex-1 bg-center bg-no-repeat aspect-video bg-cover rounded-xl shadow-xl overflow-hidden"
                data-alt="Modern email dashboard interface showing team inbox collaboration features"
                style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuB-C9TOBHB7CDPVRS-hm1tfEmDQJv9Bzqy7Dp-PXJOZk_Go7CqLdg10eyeFhEcfrErcmn4R3urIUpHKcGJDrZlx0fS6RFop6H-yCaFz7utZMMmvf29oOaKEwaYsl0g5ABF26nAcSrseK3h0jf1l5iVs1e-wzwO_vKFmHGGwfWC-27vUodlBaFhW_bJd65oYpBn3kOTw2lewLW13tVOsTjOY_x5zJGqDe55X3SxWUWDua2bs2jRNI3jUX_AhrGqSN6q_uf0FZHurbec")' }}>
                <div className="w-full h-full bg-linear-to-tr from-primary/10 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}