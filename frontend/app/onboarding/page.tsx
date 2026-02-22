'use client'

import Link from 'next/link'
import { fa } from '@/lib/fa'

const STEPS = [
  { title: fa.onboarding.step1Title, desc: fa.onboarding.step1Desc, href: '/register', cta: fa.onboarding.getStarted },
  { title: fa.onboarding.step2Title, desc: fa.onboarding.step2Desc, href: '/accounts', cta: fa.onboarding.addFirstAccount },
  { title: fa.onboarding.step3Title, desc: fa.onboarding.step3Desc, href: '/transactions', cta: fa.transactions.addTransaction },
  { title: fa.onboarding.step4Title, desc: fa.onboarding.step4Desc, href: '/budgets', cta: fa.budgets.createBudget },
] as const

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-[#0f0f14] text-white flex flex-col">
      <header className="border-b border-white/5 bg-[#0f0f14]/95 backdrop-blur sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-emerald-400 flex items-center justify-center font-bold text-sm text-[#0f0f14]">
              NX
            </div>
            <span className="font-semibold text-white">نکسوس</span>
          </Link>
          <div className="flex gap-3">
            <Link href="/login" className="text-sm font-medium text-gray-400 hover:text-white transition">
              {fa.onboarding.signIn}
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium text-[#0f0f14] bg-emerald-400 hover:bg-emerald-300 transition"
            >
              {fa.onboarding.goToDashboard}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="text-center mb-12 sm:mb-16">
          <h1 className="text-3xl sm:text-4xl font-bold text-white">
            {fa.onboarding.title}
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-xl mx-auto">
            {fa.onboarding.subtitle}
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8">
          {STEPS.map((step, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 sm:p-8 hover:bg-white/[0.07] transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <span className="text-sm font-medium text-emerald-400">قدم {i + 1}</span>
                  <h2 className="mt-1 text-xl font-semibold text-white">{step.title}</h2>
                  <p className="mt-2 text-gray-400">{step.desc}</p>
                </div>
                <Link
                  href={step.href}
                  className="shrink-0 inline-flex items-center justify-center px-5 py-2.5 rounded-xl text-sm font-medium bg-emerald-500 text-[#0f0f14] hover:bg-emerald-400 transition"
                >
                  {step.cta}
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-500 text-sm mb-4">{fa.onboarding.alreadyHaveAccount}</p>
          <Link
            href="/login"
            className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-medium border border-gray-600 text-gray-300 hover:bg-white/5 transition"
          >
            {fa.common.signIn}
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-6 mt-auto">
        <div className="max-w-4xl mx-auto px-4 text-center text-gray-500 text-sm">
          {fa.landing.footer}
        </div>
      </footer>
    </div>
  )
}
