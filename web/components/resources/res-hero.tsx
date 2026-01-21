import Link from "next/link"

export default function ResHero() {
  return (
    <div className="@container w-full py-16">
      <div className="@[480px]:px-4">
        <div
          className="flex min-h-[360px] flex-col gap-6 bg-cover bg-center bg-no-repeat @[480px]:gap-8 @[480px]:rounded-xl items-center justify-center p-8 relative overflow-hidden"
          data-alt="Abstract gradient background in dark grey tones"
          style={{ backgroundImage: "linear-gradient(135deg, #121212 0%, #2d2d2d 100%)" }}>
          {/* <!-- Decorative circles --> */}
          <div
            className="absolute top-0 left-0 w-64 h-64 bg-white opacity-[0.03] rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          </div>
          <div
            className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-[0.03] rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none">
          </div>
          <div className="flex flex-col gap-3 text-center z-10 max-w-2xl">
            <h1 className="text-white text-3xl font-black leading-tight tracking-[-0.033em] @[480px]:text-5xl">
              Inverx Resources
            </h1>
            <p className="text-neutral-300 text-base font-normal leading-normal @[480px]:text-lg">
              Everything you need to master your inbox. Search guides, API docs, and more.
            </p>
          </div>
          <label className="flex flex-col h-12 w-full max-w-[560px] @[480px]:h-14 z-10 shadow-lg shadow-black/10">
            <div className="flex w-full flex-1 items-stretch rounded-lg h-full bg-white overflow-hidden">
              <div className="text-neutral-400 flex items-center justify-center pl-4 bg-white">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                className="flex w-full min-w-0 flex-1 resize-none overflow-hidden text-[#141414] focus:outline-0 bg-white placeholder:text-neutral-400 px-3 text-sm font-normal leading-normal @[480px]:text-base"
                placeholder="How can we help?" />
              <div className="flex items-center justify-center bg-white pr-1">
                <button
                  className="flex cursor-pointer items-center justify-center overflow-hidden rounded-md h-9 px-4 m-1 bg-primary text-white text-sm font-bold leading-normal hover:bg-black/80 transition-colors">
                  Search
                </button>
              </div>
            </div>
          </label>
          {/* <!-- Chips --> */}
          <div className="flex gap-2 flex-wrap justify-center w-full z-10 max-w-[600px]">
            <span className="text-neutral-400 text-sm py-1">Popular:</span>
            <Link className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 px-3 transition-colors"
              href="#">
              <p className="text-white text-xs font-medium leading-normal">Aliases</p>
            </Link>
            <Link className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 px-3 transition-colors"
              href="#">
              <p className="text-white text-xs font-medium leading-normal">Snooze</p>
            </Link>
            <Link className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 px-3 transition-colors"
              href="#">
              <p className="text-white text-xs font-medium leading-normal">IMAP Setup</p>
            </Link>
            <Link className="flex h-7 shrink-0 items-center justify-center gap-x-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/10 px-3 transition-colors"
              href="#">
              <p className="text-white text-xs font-medium leading-normal">Billing</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}