import Link from "next/link";

export default function Footer() {
  return (

    <footer className="bg-primary text-white py-12 px-4 border-t border-neutral-800">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="size-6 flex items-center justify-center rounded bg-white text-primary">
                <svg className="size-4" fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                  <path clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z"
                    fill="currentColor" fillRule="evenodd"></path>
                </svg>
              </div>
              <span className="font-bold text-lg">INVERX</span>
            </div>
            <p className="text-neutral-400 text-sm max-w-xs">
              Fast, private, and distraction-free email for modern teams and individuals.
            </p>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase text-neutral-500">Product</h4>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li><Link className="hover:text-white transition-colors" href="/teams">Teams</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/pricing">Pricing</Link></li>
              {/* <li><Link className="hover:text-white transition-colors" href="#">Download</Link></li> */}
              {/* <li><Link className="hover:text-white transition-colors" href="#">Changelog</Link></li> */}
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase text-neutral-500">Company</h4>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li><Link href='/about' className="hover:text-white transition-colors">About</Link></li>
              <li><Link href='/blog' className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href='/security' className="hover:text-white transition-colors">Security</Link></li>
              <li><Link href='/contact' className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-4 text-sm tracking-wider uppercase text-neutral-500">Legal</h4>
            <ul className="space-y-3 text-sm text-neutral-300">
              <li><Link className="hover:text-white transition-colors" href="/privacy-policy">Privacy Policy</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/terms">Terms of Service</Link></li>
              <li><Link className="hover:text-white transition-colors" href="/security">Security</Link></li>
              {/* <li><Link className="hover:text-white transition-colors" href="/gdpr">GDPR</Link></li> */}
            </ul>
          </div>
        </div>
        <div
          className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-neutral-500">
          <p>© 2026 Inverx Webmail. All rights reserved.</p>
          <div className="flex gap-6">
            <a className="hover:text-white transition-colors" target="_blank" href="https://x.com/dubem_umeh">Twitter</a>
            <a className="hover:text-white transition-colors" target="_blank" href="https://github.com/dubemUmeh">GitHub</a>
            {/* <a className="hover:text-white transition-colors" href="#">LinkedIn</a> */}
          </div>
        </div>
      </div>
    </footer>
  )
}