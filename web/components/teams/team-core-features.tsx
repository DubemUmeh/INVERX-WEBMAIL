export default function TeamCoreFeatures() {
  return (
    <section className="layout-container flex h-full grow flex-col">
      <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-col gap-10 px-4 py-16 @container">
            <div className="flex flex-col gap-4 text-center items-center">
              <h2
                className="text-primary dark:text-white tracking-tight text-[32px] font-bold leading-tight @[480px]:text-4xl max-w-[720px]">
                Enterprise-grade control for your organization
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg font-normal leading-normal max-w-[720px]">
                Everything you need to manage your team's communication infrastructure efficiently and securely.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* <!-- Feature 1 --> */}
              <div className="flex flex-col gap-4">
                <div
                  className="w-full aspect-4/3 bg-cover bg-center rounded-xl shadow-sm border border-[#ededed] dark:border-neutral-800"
                  data-alt="UI showing a shared inbox with multiple user avatars assigned to email threads"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuD54T5UhPPcK_8cO3gDvCqpqTLrgKVs4FY4UZsPNCwanRff3b49MUCXphM7PGj0ynXMrKs4dgCKVgfdWfriatxJaeqMa4CwKiCyt4ZS8CuAKHVfB8qLKSWU3isVJOhHbogs3OcsH7t70NoiBD8WtYRQkMwD2GuMzR_SpTj79pLB_nN8P-ySeJAfPfKQ06WTIozV_Qrls-sD8RnOuvPOReR6IdMTRdm-o0SBaR8Sc-hw0bHfAxb164ZgZkh9HD4bbxNrKPKp1ybCQO4")' }}>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-primary dark:text-white text-xl font-bold leading-tight">Shared Inboxes</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
                    Handle support and sales together. Assign emails, comment internally, and close tickets without forwarding chains.
                  </p>
                </div>
              </div>
              {/* <!-- Feature 2 --> */}
              <div className="flex flex-col gap-4">
                <div
                  className="w-full aspect-4/3 bg-cover bg-center rounded-xl shadow-sm border border-[#ededed] dark:border-neutral-800"
                  data-alt="Admin dashboard interface displaying user list and permission settings"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAYsAvsLdkfywook4ew9CZa1Q1JjKIVQAkjU8u2ksrtqgZD3oTtAeEDeWWxEU0bI3p8Fp_OeouN_0cVR22-91MeAREk9o6A53Xgn5VBxcGxwty35pEz3QRq0IxR526r3AbyFLykF8QD_ss4PFuz3uSfT-nSLKQgHQoc6rEy_SFxitIfY76Hu7tUyJquVH7WDB6ZJpJ47iUgzFSKAZmTN2hOvqFi6Lb3lDxAbU2gLY86421aSrQyFx6FixyVyptzpy1EC5TWCLmzNXQ")' }}>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-primary dark:text-white text-xl font-bold leading-tight">Admin Power</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
                    Onboard and offboard employees in seconds. Centralized user management gives you full control over who sees what.
                  </p>
                </div>
              </div>
              {/* <!-- Feature 3 --> */}
              <div className="flex flex-col gap-4">
                <div
                  className="w-full aspect-4/3 bg-cover bg-center rounded-xl shadow-sm border border-[#ededed] dark:border-neutral-800"
                  data-alt="Domain management screen showing multiple verified custom domains"
                  style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuApOEe2t_Lyg_pN_7UsfZEO9hAr41xeAnyaOPm8CHp9-bKszYpjAsx850R2qH3jd0cYENTULazurGe6TkMZaFoFylEX2pbHF14bI7orESSi4q6cbip2JewY5dS2pZgqqRa5d38vqNfb9YlskgELRZaHwNFBvAuSih2oIMrSodLxN-zhJZLAs0KwmF75B8u_6Gfn9wUu7EywhaHx9Q_HunjNunDf7UuE6DcgOw6e3PV7gi1GeePnohTttU1-bfemjOyYHsAA7QNh76Q")' }}>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-primary dark:text-white text-xl font-bold leading-tight">Custom Domains</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
                    Bring your own identity. Easily verify and manage multiple custom domains (yourname@company.com) from one place.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}