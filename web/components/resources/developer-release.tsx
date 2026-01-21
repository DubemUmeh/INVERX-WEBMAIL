import { ArrowRightToLine, Megaphone } from "lucide-react";

export default function DeveloperRelease() {
  return (
    <div className="flex flex-col md:flex-row gap-6 px-4 py-6">
      {/* <!-- Developers --> */}
      <div
        className="flex flex-1 flex-col rounded-xl overflow-hidden border border-[#dbdbdb] dark:border-neutral-800 bg-primary">
        <div className="p-8 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-white/80 text-3xl">terminal</span>
            <h3 className="text-white text-xl font-bold">For Developers</h3>
          </div>
          <p className="text-neutral-300 text-sm leading-relaxed">
            Integrate Inverx into your workflow. Access our REST API documentation, webhooks, and open-source
            libraries.
          </p>
          <div className="mt-4 bg-black rounded-lg p-4 font-mono text-xs text-green-400 border border-white/10">
            <p>$ curl https://api.inverx.com/v1/user</p>
            <p className="text-white/50 mt-1">{ `"status": "connected"` }</p>
          </div>
          <a className="mt-auto pt-4 inline-flex items-center text-white font-bold hover:underline" href="#">
            View API Docs <span className="material-symbols-outlined text-[16px] ml-1"><ArrowRightToLine /></span>
          </a>
        </div>
      </div>
      {/* <!-- Release Notes --> */}
      <div
        className="flex flex-1 flex-col rounded-xl border border-[#dbdbdb] dark:border-neutral-800 bg-white dark:bg-[#1e1e1e]">
        <div className="p-6 border-b border-[#dbdbdb] dark:border-neutral-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
              <span className="material-symbols-outlined text-[#141414] dark:text-white"><Megaphone /></span>
            </div>
            <h3 className="text-[#141414] dark:text-white text-xl font-bold">Latest Updates</h3>
          </div>
          <a className="text-sm font-medium text-neutral-500 hover:text-primary" href="#">View all</a>
        </div>
        <div className="flex flex-col">
          <a className="p-6 border-b border-[#dbdbdb] dark:border-neutral-800 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
            href="#">
            <div className="flex justify-between items-start mb-1">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-green-100 text-green-700 uppercase tracking-wider">New</span>
              <span className="text-xs text-neutral-400">Jan 13, 2026</span>
            </div>
            <h4 className="text-[#141414] dark:text-white font-bold text-sm mb-1">Focus Mode 2.0</h4>
            <p className="text-neutral-500 text-sm line-clamp-2">Complete redesign of the reading pane to eliminate
              distractions and improve focus.</p>
          </a>
          <a className="p-6 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors" href="#">
            <div className="flex justify-between items-start mb-1">
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">Improvement</span>
              <span className="text-xs text-neutral-400">Jan 10, 2026</span>
            </div>
            <h4 className="text-[#141414] dark:text-white font-bold text-sm mb-1">Faster Search Indexing</h4>
            <p className="text-neutral-500 text-sm line-clamp-2">We've optimized the search engine. Results now appear
              40% faster on large inboxes.</p>
          </a>
        </div>
      </div>
    </div>
  )
}