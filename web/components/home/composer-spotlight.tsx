import { CheckCircleIcon, Bold, Italic, Link as LucideLink, Image as LucideImage } from "lucide-react"

export default function ComposerSpotlight() {
  return (
    <section className="py-24 bg-neutral-100 dark:bg-neutral-900/50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-16">
              <div className="flex-1 space-y-8">
                  <h2 className="text-3xl md:text-5xl font-black tracking-tight text-primary dark:text-white">
                      Write without noise.
                  </h2>
                  <p className="text-lg text-neutral-600 dark:text-neutral-400 leading-relaxed">
                      The composer floats above your inbox, dimming the background so you can focus on your words.
                      It supports Markdown out of the box, letting you format as you type without lifting your
                      fingers from the keys.
                  </p>
                  <ul className="space-y-4">
                      <li className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600">
                            <CheckCircleIcon />
                          </span>
                          <span className="font-medium">Markdown support</span>
                      </li>
                      <li className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600">
                            <CheckCircleIcon />
                          </span>
                          <span className="font-medium">Zen mode for long-form writing</span>
                      </li>
                      <li className="flex items-center gap-3">
                          <span className="material-symbols-outlined text-green-600">
                            <CheckCircleIcon />
                          </span>
                          <span className="font-medium">Instant attachment drag-and-drop</span>
                      </li>
                  </ul>
              </div>
              <div className="flex-1 w-full">
                  <div
                      className="relative rounded-2xl bg-white dark:bg-[#1f1f1f] shadow-2xl p-8 border border-neutral-200 dark:border-neutral-800">
                      {/* <!-- Decorative dots --> */}
                      <div className="flex gap-2 mb-6">
                          <div className="size-3 rounded-full bg-red-400"></div>
                          <div className="size-3 rounded-full bg-yellow-400"></div>
                          <div className="size-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="space-y-4">
                          <div
                              className="flex justify-between text-sm text-neutral-400 border-b border-neutral-100 dark:border-neutral-800 pb-2">
                              <span>To: Team</span>
                              <span>Cc/Bcc</span>
                          </div>
                          <div className="text-xl font-bold text-primary dark:text-white">Q3 Product Roadmap Review
                          </div>
                          <div className="h-fit text-neutral-600 dark:text-neutral-300 leading-relaxed pb-3">
                            Hi everyone,<br /><br />
                            I've just updated the roadmap for Q3. We are focusing heavily on the <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-1 rounded">performance improvements</span> requested by our enterprise clients.<br /><br />
                            Key takeaways:
                            <ul className="list-disc list-inside ml-2 mt-2">
                              <li>Inbox load time reduced by 40%</li>
                              <li>Offline mode is now fully stable</li>
                            </ul>
                          </div>
                          <div className="pt-4 border-t border-neutral-600 dark:border-neutral-200 flex justify-between items-center">
                            <div className="flex gap-4 text-neutral-400">
                              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-primary"><Bold /></span>
                              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-primary"><Italic /></span>
                              <span className="material-symbols-outlined text-[20px] cursor-pointer hover:text-primary"><LucideLink /></span>
                              <span className="material-symbols-outlined text-[20px] cursor-pointer  hover:text-primary"><LucideImage /></span>
                            </div>
                            <button className="bg-primary text-white px-4 py-1.5 rounded-lg text-sm font-bold">
                              Send
                            </button>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
  </section>
  )
}