'use client'

import { useState } from "react"
import PricingCards from "./pricing-cards"

export default function PricingHero() {
  const [billing, setBilling] = useState('monthly')

  return (
    <section className="pt-20 pb-16 sm:py-24 px-4">
      <div className="mx-auto max-w-4xl text-center flex flex-col items-center gap-6">
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-neutral-900 dark:text-white leading-tight">
          Simple, transparent pricing <br className="hidden sm:block" /> for everyone.
        </h1>
        <p className="text-lg text-neutral-500 dark:text-neutral-400 max-w-2xl">
          No hidden fees. No ads. Just pure email. Start with a 14-day free trial on any plan.
        </p>
        {/* <!-- Billing Toggle --> */}
        <div className="mt-4 flex items-center justify-center">
          <div className="bg-neutral-200 dark:bg-neutral-800 p-1 rounded-lg inline-flex relative">
            <label
              className="relative z-10 cursor-pointer px-6 py-2 rounded-lg transition-all duration-200 has-checked:bg-white dark:has-checked:bg-neutral-700 has-checked:shadow-sm has-checked:text-primary dark:has-checked:text-white text-neutral-500 dark:text-neutral-400 text-sm font-bold">
              <span className="">Monthly</span>
              <input 
                value='monthly'
                checked={billing === 'monthly'}
                onChange={() => setBilling('monthly')}
                className="hidden" 
                name="billing" 
                type="radio" 
              />
            </label>
            <label
              className="relative z-10 cursor-pointer px-6 py-2 rounded-lg transition-all duration-200 has-checked:bg-white dark:has-checked:bg-neutral-700 has-checked:shadow-sm has-checked:text-primary dark:has-checked:text-white text-neutral-500 dark:text-neutral-400 text-sm font-bold">
              <span className="">Yearly (Save 20%)</span>
              <input 
                value='yearly'
                checked={billing === 'yearly'}
                onChange={() => setBilling('yearly')}
                className="hidden" 
                name="billing" 
                type="radio" 
              />
            </label>
          </div>
        </div>
      </div>

      <PricingCards billing={billing} setBilling={setBilling} />
    </section>
  )
}