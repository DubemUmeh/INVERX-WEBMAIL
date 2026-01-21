import { Headset } from 'lucide-react';

export default function SupportCTA() {
  return (
    <div className="px-4 py-12 mb-10 mt-6">
      <div
        className="bg-neutral-100 dark:bg-[#1e1e1e] rounded-2xl p-8 md:p-12 text-center flex flex-col items-center gap-6">
        <div className="size-14 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-3xl text-primary dark:text-white"><Headset /></span>
        </div>
        <div className="max-w-md">
          <h2 className="text-2xl font-bold text-[#141414] dark:text-white mb-2">Can't find what you're looking for?
          </h2>
          <p className="text-neutral-500">Our support team is here to help you with any questions or technical issues.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            className="flex min-w-[140px] items-center justify-center rounded-lg h-10 px-6 bg-[#121212] dark:bg-white text-white dark:text-primary text-sm font-bold shadow-sm hover:opacity-90 transition-opacity">
            Contact Support
          </button>
          <button
            className="flex min-w-[140px] items-center justify-center rounded-lg h-10 px-6 bg-white dark:bg-neutral-800 border border-[#dbdbdb] dark:border-neutral-700 text-[#141414] dark:text-white text-sm font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
            Join Community
          </button>
        </div>
      </div>
    </div>
  )
}