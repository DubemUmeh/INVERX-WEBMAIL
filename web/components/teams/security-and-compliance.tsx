import { ShieldCheck, UserCog, LockIcon } from 'lucide-react';

export default function SecurityAndcompliance() {
  return (
    <section className="layout-container flex h-full grow flex-col">
      <div className="px-4 md:px-10 lg:px-40 flex flex-1 justify-center py-5">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-col gap-10 px-4 py-20 @container">
            <div className="flex flex-col gap-4">
              <h2 className="text-primary dark:text-white tracking-tight text-3xl font-bold leading-tight">
                Security &amp; Compliance
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400 text-lg font-normal leading-normal max-w-[720px]">
                Built for teams that require strict access controls, data visibility, and compliance standards.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* <!-- Card 1 --> */}
              <div
                className="flex flex-col gap-4 rounded-xl border border-[#ededed] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-primary dark:text-white mb-2">
                  <span className="material-symbols-outlined text-3xl"><ShieldCheck /></span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-primary dark:text-white text-lg font-bold leading-tight">Audit Logs</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
                    Full visibility into access and security events across your organization. Exportable logs for
                    compliance reviews.
                  </p>
                </div>
              </div>
              {/* <!-- Card 2 --> */}
              <div
                className="flex flex-col gap-4 rounded-xl border border-[#ededed] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-primary dark:text-white mb-2">
                  <span className="material-symbols-outlined text-3xl"><UserCog /></span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-primary dark:text-white text-lg font-bold leading-tight">Access Controls</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
                    Granular role-based permissions (RBAC). Define exactly who can view, send, or manage specific
                    inboxes.
                  </p>
                </div>
              </div>
              {/* <!-- Card 3 --> */}
              <div
                className="flex flex-col gap-4 rounded-xl border border-[#ededed] dark:border-neutral-800 bg-white dark:bg-neutral-900 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-primary dark:text-white mb-2">
                  <span className="material-symbols-outlined text-3xl"><LockIcon /></span>
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-primary dark:text-white text-lg font-bold leading-tight">Privacy First</h3>
                  <p className="text-neutral-500 dark:text-neutral-400 text-sm font-normal leading-relaxed">
                    SOC2 compliant infrastructure. We encrypt data at rest and in transit, ensuring your business comms
                    stay private.
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