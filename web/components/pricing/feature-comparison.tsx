import { CheckCircle, Ban } from "lucide-react"

export default function FeatureComparison() {
  return (
    <section className="py-20 bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-2xl font-bold text-center mb-12 text-neutral-900 dark:text-white">Feature Comparison</h2>
        <div className="overflow-x-auto rounded-lg border border-neutral-200 dark:border-neutral-800">
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 dark:bg-neutral-800/50">
                <th className="p-4 text-sm font-bold text-neutral-900 dark:text-white w-1/2">Features</th>
                <th className="p-4 text-sm font-bold text-neutral-900 dark:text-white text-center w-1/4">Individual</th>
                <th className="p-4 text-sm font-bold text-neutral-900 dark:text-white text-center w-1/4">Team</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800 bg-white dark:bg-neutral-900">
              {/* <!-- Row 1 --> */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300 font-medium">Mailbox Storage</td>
                <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">5 GB</td>
                <td className="p-4 text-sm text-neutral-900 dark:text-white text-center font-bold">50 GB / user</td>
              </tr>
              {/* <!-- Row 2 --> */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300 font-medium">Custom Domains</td>
                <td className="p-4 text-center">
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium bg-neutral-100 dark:bg-neutral-800 rounded">1
                    Included</span>
                </td>
                <td className="p-4 text-center">
                  <span
                    className="inline-block px-2 py-1 text-xs font-medium bg-primary/10 text-primary dark:bg-white/10 dark:text-white rounded">Unlimited</span>
                </td>
              </tr>
              {/* <!-- Row 3 --> */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300 font-medium">Ad-free Experience</td>
                <td className="p-4 text-center text-primary dark:text-white"><span
                    className="material-symbols-outlined text-[20px] mx-auto flex items-center justify-center text-green-600"><CheckCircle /></span></td>
                <td className="p-4 text-center text-primary dark:text-white"><span
                    className="material-symbols-outlined text-[20px] mx-auto flex items-center justify-center text-green-600"><CheckCircle /></span></td>
              </tr>
              {/* <!-- Row 4 --> */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300 font-medium">End-to-End Encryption</td>
                <td className="p-4 text-center text-primary dark:text-white"><span
                    className="material-symbols-outlined text-[20px] mx-auto flex items-center justify-center text-green-600"><CheckCircle /></span></td>
                <td className="p-4 text-center text-primary dark:text-white"><span
                    className="material-symbols-outlined text-[20px] mx-auto flex items-center justify-center text-green-600"><CheckCircle /></span></td>
              </tr>
              {/* <!-- Row 5 --> */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300 font-medium">Centralized Billing</td>
                <td className="p-4 text-center text-neutral-300 dark:text-neutral-700"><span
                    className="material-symbols-outlined text-[20px] mx-auto flex items-center justify-center text-red-600"><Ban /></span></td>
                <td className="p-4 text-center text-primary dark:text-white"><span
                    className="material-symbols-outlined text-[20px] mx-auto flex items-center justify-center text-green-600"><CheckCircle /></span></td>
              </tr>
              {/* <!-- Row 6 --> */}
              <tr className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30">
                <td className="p-4 text-sm text-neutral-700 dark:text-neutral-300 font-medium">Support Priority</td>
                <td className="p-4 text-sm text-neutral-600 dark:text-neutral-400 text-center">Standard</td>
                <td className="p-4 text-sm text-neutral-900 dark:text-white text-center font-bold">Priority 24/7</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}