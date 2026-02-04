export default function Hero() {
    return (
    <section className="relative pt-5 pb-16 lg:pb-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <div className="mx-auto max-w-4xl flex flex-col items-center gap-6">
                <div
                    className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-medium text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-300">
                    <span className="flex size-2 rounded-full bg-blue-500"></span>
                    Early Access
                </div>
                <h1
                    className="text-5xl md:text-7xl font-black leading-[1.1] tracking-[-0.033em] text-primary dark:text-white">
                    Email at the speed<br />of thought.
                </h1>
                <p className="text-lg md:text-xl text-neutral-600 dark:text-neutral-400 max-w-2xl leading-relaxed">
                    INVERX is a modern webmail platform that empowers you to manage your messages efficiently, and stay in full control without ads, tracking, or clutter.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full justify-center">
                    <a href="/waitlists">
                    <button
                        className="h-12 px-8 rounded-lg bg-primary dark:bg-white text-white dark:text-primary text-base font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                        Join Waitlist
                    </button>
                    </a>
                    <button
                        className="h-12 px-8 rounded-lg border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 text-primary dark:text-white text-base font-bold hover:bg-neutral-50 dark:hover:bg-neutral-700 transition-colors">
                        View Demo
                    </button>
                </div>
            </div>
            {/* <!-- Product Visual --> */}
            <div className="mt-16 md:mt-24 relative mx-auto max-w-6xl">
                <div
                    className="rounded-xl bg-neutral-900/5 p-2 ring-1 ring-inset ring-neutral-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 dark:bg-white/5 dark:ring-white/10">
                    <div
                        className="rounded-lg bg-white shadow-2xl ring-1 ring-neutral-900/10 overflow-hidden dark:bg-[#121212] dark:ring-white/10 aspect-16/10 relative group">
                        {/* <!-- Abstract UI Representation (since we can't use real screenshots) --> */}
                        <div className="absolute inset-0 bg-cover bg-center"
                            data-alt="Screenshot of Airmailly inbox interface showing a clean, list-based email view with sidebar navigation"
                            style={{ backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAOOc53qY4visJ3tMC-pWaMGs7E42KwjBpE95uAi46t_WrRsF1qycKIfDXIOTRnEedFCkDwEKPTCBi1a2Yf7gqxr093CFabq7MGgucYTG8qMT598sq6eMQNIesffe6Z15yRKT0O2wVHtTYiFqsXJMUFXm4jScHPs69iad2vVmpHBhX-5og7QaM16dKghohlequanveKcskQfyOt91QJWUB8Vqb28F5Wzj9AapBSy6B2zOxwWldPe3bPu8c_3Xblx-Kk1wRMOrqhYc0")'}}>
                            {/* <!-- Overlay to simulate UI structure --> */}
                            <div className="absolute inset-0 bg-white/95 dark:bg-[#121212]/95 backdrop-blur-sm flex">
                                {/* <!-- Sidebar --> */}
                                <div
                                    className="w-64 border-r border-neutral-200 dark:border-neutral-800 p-4 hidden md:flex flex-col gap-4">
                                    <div className="h-8 w-32 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                                    <div className="space-y-2 mt-4">
                                        <div className="h-6 w-full bg-neutral-100 dark:bg-neutral-800 rounded opacity-70"></div>
                                        <div className="h-6 w-full bg-primary/5 dark:bg-white/10 rounded"></div>
                                        <div className="h-6 w-full bg-neutral-100 dark:bg-neutral-800 rounded opacity-70"></div>
                                    </div>
                                </div>
                                {/* <!-- Main List --> */}
                                <div className="flex-1 p-6 flex flex-col gap-4">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="h-8 w-48 bg-neutral-100 dark:bg-neutral-800 rounded"></div>
                                        <div className="flex gap-2"><div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-800"></div></div>
                                    </div>
                                    {/* <!-- Email Items --> */}
                                    <div className="space-y-3">
                                        <div className="h-16 w-full border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center px-4 gap-4 bg-white dark:bg-[#1a1a1a] shadow-sm">
                                            <div
                                                className="size-4 rounded border border-neutral-300 dark:border-neutral-600">
                                            </div>
                                            <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-700">
                                            </div>
                                            <div className="h-3 w-32 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                            <div className="flex-1"></div>
                                            <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                        </div>
                                        <div className="h-16 w-full border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center px-4 gap-4 bg-neutral-50 dark:bg-[#141414]">
                                            <div className="size-4 rounded border border-neutral-300 dark:border-neutral-600"></div>
                                            <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-700"></div>
                                            <div className="h-3 w-40 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                            <div className="flex-1"></div>
                                            <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                        </div>
                                        <div
                                            className="h-16 w-full border border-neutral-200 dark:border-neutral-800 rounded-lg flex items-center px-4 gap-4 bg-white dark:bg-[#1a1a1a] shadow-sm">
                                            <div
                                                className="size-4 rounded border border-neutral-300 dark:border-neutral-600">
                                            </div>
                                            <div className="size-8 rounded-full bg-neutral-100 dark:bg-neutral-700">
                                            </div>
                                            <div className="h-3 w-24 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                            <div className="flex-1"></div>
                                            <div className="h-3 w-16 bg-neutral-100 dark:bg-neutral-700 rounded"></div>
                                        </div>
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