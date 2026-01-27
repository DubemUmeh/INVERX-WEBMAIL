import { MessageCircle, BookOpenCheck, Users, ChevronDown, Send } from "lucide-react"

export default function Contact() {
  return (
    <main className="grow w-full px-5 md:px-10 py-12 md:py-20 flex justify-center">
      <div className="w-full max-w-[1024px] flex flex-col">
        {/* <!-- Hero Section --> */}
        <div className="mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-black leading-tight tracking-tight mb-4 text-primary dark:text-white">
            We'd love to hear from you
          </h1>
          <p className="text-neutral-500 dark:text-neutral-400 text-lg md:text-xl font-normal max-w-2xl leading-relaxed">
            Whether you have a question about features, pricing, or need a demo, our team is ready to answer all your
            questions.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* <!-- Left Column: Alternative Contact Info --> */}
          <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="flex flex-col gap-6">
              {/* <!-- Support Item 1 --> */}
              <div
                className="group flex gap-4 items-start p-4 -ml-4 rounded-xl hover:bg-white dark:hover:bg-[#222] transition-colors border border-transparent hover:border-[#ededed] dark:hover:border-[#333]">
                <div className="size-10 rounded-lg bg-[#ededed] dark:bg-[#333] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary dark:text-white"><MessageCircle /></span>
                </div>
                <div>
                  <h3 className="font-bold text-primary dark:text-white mb-1">Chat to sales</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Speak to our friendly team.</p>
                  <a className="text-sm font-semibold underline decoration-neutral-300 underline-offset-4 hover:decoration-primary transition-all"
                    href="#">sales@inverx.pro</a>
                </div>
              </div>
              {/* <!-- Support Item 2 --> */}
              <div
                className="group flex gap-4 items-start p-4 -ml-4 rounded-xl hover:bg-white dark:hover:bg-[#222] transition-colors border border-transparent hover:border-[#ededed] dark:hover:border-[#333]">
                <div className="size-10 rounded-lg bg-[#ededed] dark:bg-[#333] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary dark:text-white"><BookOpenCheck /></span>
                </div>
                <div>
                  <h3 className="font-bold text-primary dark:text-white mb-1">Help Center</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Check out our documentation.</p>
                  <a className="text-sm font-semibold underline decoration-neutral-300 underline-offset-4 hover:decoration-primary transition-all"
                    href="#">Visit Help Center</a>
                </div>
              </div>
              {/* <!-- Support Item 3 --> */}
              <div
                className="group flex gap-4 items-start p-4 -ml-4 rounded-xl hover:bg-white dark:hover:bg-[#222] transition-colors border border-transparent hover:border-[#ededed] dark:hover:border-[#333]">
                <div className="size-10 rounded-lg bg-[#ededed] dark:bg-[#333] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-primary dark:text-white"><Users /></span>
                </div>
                <div>
                  <h3 className="font-bold text-primary dark:text-white mb-1">Community Forum</h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-2">Join the conversation.</p>
                  <a className="text-sm font-semibold underline decoration-neutral-300 underline-offset-4 hover:decoration-primary transition-all"
                    href="#">Go to Community</a>
                </div>
              </div>
            </div>
            {/* <!-- Map / Location Visual --> */}
            <div className="mt-4 rounded-xl overflow-hidden h-48 w-full bg-neutral-200 relative group">
              <div
                className="absolute inset-0 bg-linear-to-tr from-neutral-800/80 to-transparent z-10 flex items-end p-4">
                <div className="text-white">
                  <p className="font-bold text-sm">San Francisco HQ</p>
                  <p className="text-xs opacity-80">123 Market St, Suite 400</p>
                </div>
              </div>
              {/* <!-- Abstract map representation --> */}
              {/* <!-- <div class="w-full h-full bg-[url('https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?ixlib=rb-4.0.3&amp;auto=format&amp;fit=crop&amp;w=800&amp;q=80')] bg-cover bg-center grayscale opacity-80 group-hover:scale-105 transition-transform duration-700" data-alt="Aerial view of San Francisco city grid" data-location="San Francisco" style="https://lh3.googleusercontent.com/aida-public/AB6AXuCN0bnUc5ht2bkQShxn2WSQ2GyZ1oMCKIE2m7TU797yU4tB3P3KJQOqvZqYEgswM4J1ilgHFC5mF8Rxf1gCMD79j5bRVSCGqMrnj0VVi11quDEQPMXvq6H-c9gaZygRSVokO_WPJvU0uHYr951C3B-NqSWPDrjwOm1GxArH2gcdufXMdrfF6kmbD9CmgyQMpruRQxPhtOv4tXvArBfkod_2GSMBTPn1cgb6aRMxJ7UQqSRKoi8aFRu8Kvflf3NZroykUIr_6EFhr0c"></div> --> */}
            </div>
          </div>
          {/* <!-- Right Column: Form --> */}
          <div className="lg:col-span-8">
            <div
              className="bg-white dark:bg-[#222] p-6 md:p-8 rounded-2xl shadow-sm border border-[#ededed] dark:border-[#333]">
              <form action="#" className="flex flex-col gap-6" method="POST">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* <!-- Name Field --> */}
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-primary dark:text-white">Name</span>
                    <input
                      className="w-full h-12 px-4 rounded-lg bg-background-light dark:bg-[#191919] border border-[#dbdbdb] dark:border-[#444] text-primary dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-white/20 focus:border-primary dark:focus:border-white transition-all"
                      placeholder="Jane Doe" type="text" />
                  </label>
                  {/* <!-- Email Field --> */}
                  <label className="flex flex-col gap-2">
                    <span className="text-sm font-semibold text-primary dark:text-white">Work Email</span>
                    <input
                      className="w-full h-12 px-4 rounded-lg bg-background-light dark:bg-[#191919] border border-[#dbdbdb] dark:border-[#444] text-primary dark:text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-white/20 focus:border-primary dark:focus:border-white transition-all"
                      placeholder="jane@company.com" type="email" />
                  </label>
                </div>
                {/* <!-- Topic Select --> */}
                <label className="flex flex-col gap-2 relative">
                  <span className="text-sm font-semibold text-primary dark:text-white">Topic</span>
                  <div className="relative">
                    <select
                      className="appearance-none w-full h-12 px-4 pr-10 rounded-lg bg-background-light dark:bg-[#191919] border border-[#dbdbdb] dark:border-[#444] text-primary dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-white/20 focus:border-primary dark:focus:border-white transition-all">
                      <option value="">Select a topic</option>
                      <option value="sales">Sales &amp; Enterprise</option>
                      <option value="support">Technical Support</option>
                      <option value="billing">Billing &amp; Pricing</option>
                      <option value="other">General Inquiry</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-neutral-500">
                      <span className="material-symbols-outlined text-xl"><ChevronDown /></span>
                    </div>
                  </div>
                </label>
                {/* <!-- Message Textarea --> */}
                <label className="flex flex-col gap-2">
                  <span className="text-sm font-semibold text-primary dark:text-white">How can we help?</span>
                  <textarea
                    className="w-full min-h-[160px] p-4 rounded-lg bg-background-light dark:bg-[#191919] border border-[#dbdbdb] dark:border-[#444] text-primary dark:text-white placeholder-neutral-500 resize-y focus:outline-none focus:ring-2 focus:ring-primary/20 dark:focus:ring-white/20 focus:border-primary dark:focus:border-white transition-all"
                    placeholder="Tell us about your inquiry..."></textarea>
                </label>
                {/* <!-- Submit Button --> */}
                <div className="pt-2">
                  <button
                    type='submit'
                    className="w-full md:w-auto min-w-[160px] h-12 bg-primary dark:bg-white text-white dark:text-primary font-bold rounded-lg shadow-md hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer">
                    <span>Send Message</span>
                    <span className="material-symbols-outlined text-sm font-bold"><Send /></span>
                  </button>
                  <p className="text-xs text-neutral-500 mt-4 text-center md:text-left">
                    We respect your privacy. No spam, ever.
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}