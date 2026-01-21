export default function Hero2() {
  return (
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-32 px-4 overflow-hidden">
        {/* <!-- Background Accents --> */}
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50/50 via-white to-white pointer-events-none">
        </div>
        <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-blue-100/40 via-transparent to-transparent -z-10 pointer-events-none">
        </div>
        <div
            className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 md:gap-8 mb-16 md:mb-24 relative z-10">
            <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
                Now available in Beta
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-[64px] font-black leading-[1.1] tracking-tight text-primary">
                Email &amp; Inbox Management,<br className="hidden md:block" />
                <span
                    className="text-transparent bg-clip-text bg-gradient-to-br from-gray-900 via-gray-700 to-gray-500">Redefined
                    for Speed.</span>
            </h1>
            <p className="text-base md:text-lg text-gray-600 max-w-2xl font-normal leading-relaxed">
                INVERX is a modern webmail platform that empowers you to manage your messages efficiently, maintain
                strong encryption, and stay in full control—without ads, tracking, or clutter.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 w-full justify-center pt-2">
                <button
                    className="h-12 px-8 rounded-xl bg-primary text-white font-bold text-base shadow-xl shadow-primary/10 hover:shadow-2xl hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2">
                    Get Started Free
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </button>
                <button
                    className="h-12 px-8 rounded-xl bg-white border border-gray-200 text-primary font-bold text-base hover:bg-gray-50 transition-all flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-lg">play_circle</span>
                    See how it works
                </button>
            </div>
        </div>
        {/* <!-- Dashboard Mockup Area --> */}
        <div className="relative max-w-6xl mx-auto z-10 group perspective-1000">
            {/* <!-- Floating Elements (Behind/Sides) --> */}
            <div className="absolute -left-4 md:-left-12 top-20 z-20 animate-[float_4s_ease-in-out_infinite]">
                <div
                    className="flex items-center gap-3 bg-white p-3 pr-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100/50">
                    <div className="size-10 rounded-full bg-green-50 flex items-center justify-center text-success">
                        <span className="material-symbols-outlined">shield</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Security Check</p>
                        <p className="text-sm font-bold text-primary">0ms Tracking Pixels</p>
                    </div>
                </div>
            </div>
            <div className="absolute -right-4 md:-right-8 bottom-32 z-20 animate-[float_5s_ease-in-out_infinite_0.5s]">
                <div
                    className="flex items-center gap-3 bg-white p-3 pr-5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-gray-100/50">
                    <div className="size-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined">bolt</span>
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-medium">Performance</p>
                        <p className="text-sm font-bold text-primary">99.99% Uptime</p>
                    </div>
                </div>
            </div>
            {/* <!-- Main Interface Mockup --> */}
            <div
                className="bg-white rounded-2xl shadow-2xl shadow-blue-900/10 border border-gray-200/60 overflow-hidden transform transition-transform duration-700 hover:scale-[1.01]">
                {/* <!-- Browser Header --> */}
                <div className="bg-gray-50 border-b border-gray-200/60 h-10 flex items-center px-4 gap-2">
                    <div className="flex gap-1.5">
                        <div className="w-3 h-3 rounded-full bg-red-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400/80"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400/80"></div>
                    </div>
                    <div className="flex-1 flex justify-center">
                        <div className="h-6 w-64 bg-gray-200/50 rounded-md flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-[10px] text-gray-400">lock</span>
                            <span className="text-[10px] font-medium text-gray-400">app.inverx.com/inbox</span>
                        </div>
                    </div>
                    <div className="w-10"></div>
                </div>
                {/* <!-- App Layout --> */}
                <div className="flex h-[500px] md:h-[600px] bg-white">
                    {/* <!-- Sidebar --> */}
                    <div className="w-16 md:w-64 border-r border-gray-100 flex flex-col p-4 bg-surface/30">
                        <div className="mb-8 px-2 hidden md:block">
                            <button
                                className="w-full bg-primary text-white h-10 rounded-lg text-sm font-bold shadow-md shadow-primary/10 flex items-center justify-center gap-2 hover:bg-black">
                                <span className="material-symbols-outlined text-[18px]">edit_square</span>
                                Compose
                            </button>
                        </div>
                        <div className="flex flex-col gap-1">
                            <div
                                className="flex items-center gap-3 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer">
                                <span className="material-symbols-outlined text-[20px]">inbox</span>
                                <span className="text-sm font-semibold hidden md:block">Inbox</span>
                                <span className="ml-auto text-xs font-bold hidden md:block">4</span>
                            </div>
                            <div
                                className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-[20px]">star</span>
                                <span className="text-sm font-medium hidden md:block">Starred</span>
                            </div>
                            <div
                                className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-[20px]">send</span>
                                <span className="text-sm font-medium hidden md:block">Sent</span>
                            </div>
                            <div
                                className="flex items-center gap-3 px-3 py-2 text-gray-500 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                                <span className="material-symbols-outlined text-[20px]">draft</span>
                                <span className="text-sm font-medium hidden md:block">Drafts</span>
                            </div>
                        </div>
                        <div className="mt-auto pt-4 border-t border-gray-100">
                            <div className="flex items-center gap-3 px-2">
                                <div className="size-8 rounded-full bg-gradient-to-br from-gray-700 to-black"></div>
                                <div className="hidden md:block">
                                    <p className="text-xs font-bold text-primary">Alex Morgan</p>
                                    <p className="text-[10px] text-gray-500">Pro Plan</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* <!-- Main Content --> */}
                    <div className="flex-1 flex flex-col">
                        {/* <!-- Toolbar --> */}
                        <div className="h-14 border-b border-gray-100 flex items-center justify-between px-6 bg-white">
                            <h2 className="text-lg font-bold text-primary">Inbox</h2>
                            <div className="flex items-center gap-2">
                                <div
                                    className="bg-gray-100 text-gray-600 px-3 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1">
                                    <span className="material-symbols-outlined text-sm">filter_list</span> Filter
                                </div>
                                <div
                                    className="bg-gray-100 text-gray-600 p-1.5 rounded-md flex items-center justify-center">
                                    <span className="material-symbols-outlined text-sm">more_horiz</span>
                                </div>
                            </div>
                        </div>
                        {/* <!-- Email List --> */}
                        <div className="flex-1 overflow-y-auto bg-white p-2">
                            {/* <!-- Email Item 1 (Selected/Active) --> */}
                            <div
                                className="group relative flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-blue-100 bg-blue-50/30 hover:bg-blue-50/60 transition-colors cursor-pointer mb-2">
                                <div className="flex items-start justify-between w-full sm:w-auto sm:justify-start gap-4">
                                    <div
                                        className="size-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 font-bold">
                                        JD</div>
                                    <div className="sm:hidden text-xs text-gray-400 font-medium">Just now</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
                                            John Doe
                                            <span
                                                className="bg-green-100 text-green-700 text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1 font-bold border border-green-200">
                                                <span className="material-symbols-outlined text-[10px]">verified</span>
                                                Verified Sender
                                            </span>
                                        </h3>
                                        <span className="hidden sm:block text-xs text-gray-400 font-medium">10:42 AM</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">Project Roadmap Review - Q4 2024
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">Hey Alex, attached is the updated roadmap
                                        for Q4 based on our last discussion. Let me know if...</p>
                                    <div className="flex gap-2 mt-3">
                                        <div
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-gray-600 shadow-sm">
                                            <span className="material-symbols-outlined text-[12px]">lock</span> Encrypted
                                            Message
                                        </div>
                                        <div
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-white border border-gray-200 rounded text-xs font-medium text-blue-600 shadow-sm hover:bg-blue-50">
                                            <span className="material-symbols-outlined text-[12px]">reply</span> Quick Reply
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Email Item 2 --> */}
                            <div
                                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-transparent hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50">
                                <div className="flex items-start justify-between w-full sm:w-auto sm:justify-start gap-4">
                                    <div
                                        className="size-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 font-bold">
                                        S</div>
                                    <div className="sm:hidden text-xs text-gray-400 font-medium">2h ago</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-bold text-primary">Stripe</h3>
                                        <span className="hidden sm:block text-xs text-gray-400 font-medium">9:15 AM</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">Payment successful: INV-2024-001
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">Your payment of $49.00 USD to INVERX Inc.
                                        was successful.</p>
                                    <div className="flex gap-2 mt-2">
                                        <span
                                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide">Transaction</span>
                                    </div>
                                </div>
                            </div>
                            {/* <!-- Email Item 3 --> */}
                            <div
                                className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-transparent hover:bg-gray-50 transition-colors cursor-pointer">
                                <div className="flex items-start justify-between w-full sm:w-auto sm:justify-start gap-4">
                                    <div
                                        className="size-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0 font-bold">
                                        N</div>
                                    <div className="sm:hidden text-xs text-gray-400 font-medium">Yesterday</div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <h3 className="text-sm font-bold text-primary">Netflix</h3>
                                        <span className="hidden sm:block text-xs text-gray-400 font-medium">Yesterday</span>
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 mb-1">New login detected from Mac OS X
                                    </p>
                                    <p className="text-sm text-gray-500 truncate">We noticed a new login to your account. If
                                        this was you, you can ignore this.</p>
                                    <div className="flex gap-2 mt-2">
                                        <span
                                            className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold uppercase tracking-wide">Security</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
  )
}