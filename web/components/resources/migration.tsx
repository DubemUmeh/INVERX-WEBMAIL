import { Mail, CalendarDays, Server } from "lucide-react"

export default function Migration() {
  return (
    <div className="flex flex-col gap-6 px-4 py-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-[#141414] dark:text-white text-2xl font-bold leading-tight">Easy Migration</h2>
        <p className="text-neutral-500 text-base">Select your current provider to see step-by-step import instructions.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <a className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-[#1e1e1e] border border-[#dbdbdb] dark:border-neutral-800 hover:border-primary transition-colors"
          href="#">
          <div className="size-10 rounded-full bg-red-50 flex items-center justify-center text-red-600">
            <span className="material-symbols-outlined"><Mail /></span>
          </div>
          <div>
            <h3 className="font-bold text-[#141414] dark:text-white">Gmail</h3>
            <p className="text-xs text-neutral-500">Import guide</p>
          </div>
        </a>
        <a className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-[#1e1e1e] border border-[#dbdbdb] dark:border-neutral-800 hover:border-primary transition-colors"
          href="#">
          <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <span className="material-symbols-outlined"><CalendarDays /></span>
          </div>
          <div>
            <h3 className="font-bold text-[#141414] dark:text-white">Outlook</h3>
            <p className="text-xs text-neutral-500">Import guide</p>
          </div>
        </a>
        <a className="flex items-center gap-4 p-4 rounded-lg bg-white dark:bg-[#1e1e1e] border border-[#dbdbdb] dark:border-neutral-800 hover:border-primary transition-colors"
          href="#">
          <div className="size-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
            <span className="material-symbols-outlined"><Server /></span>
          </div>
          <div>
            <h3 className="font-bold text-[#141414] dark:text-white">IMAP / Other</h3>
            <p className="text-xs text-neutral-500">Generic setup</p>
          </div>
        </a>
      </div>
    </div>
  )
}