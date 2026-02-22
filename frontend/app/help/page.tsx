'use client'

import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import { fa } from '@/lib/fa'

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-100/80 dark:bg-gray-950">
      <Navbar />
      <main id="main-content" className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{fa.settings.help}</h1>
        <div className="card p-6 space-y-6 text-gray-700 dark:text-gray-300">
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">شروع کار</h2>
            <p className="text-sm">حساب کاربری بسازید، سپس از بخش حساب‌ها اولین حساب خود را اضافه کنید. تراکنش‌ها را دستی یا با ورود CSV یا از پیامک بانکی اضافه کنید.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">حساب‌ها و تراکنش‌ها</h2>
            <p className="text-sm">در صفحه تراکنش‌ها می‌توانید جستجو و فیلتر (حساب، دسته، مبلغ، تاریخ) اعمال کنید. در صورت تراکنش تکراری (همان روز و همان حساب و مبلغ) هشدار داده می‌شود.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">بودجه و اهداف</h2>
            <p className="text-sm">بودجه برای محدودیت هزینه و اهداف برای پس‌انداز. پیشرفت در داشبورد و نوار وضعیت نمایش داده می‌شود.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">تراکنش تکرارشونده</h2>
            <p className="text-sm">در صفحه تکرارشونده می‌توانید درآمد/هزینه دوره‌ای (مثلاً اجاره ماهانه) تعریف کنید. دکمه «اجرای اکنون» تراکنش‌های سررسیدشده را ایجاد می‌کند.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">کلیدهای API و پشتیبان</h2>
            <p className="text-sm">در تنظیمات می‌توانید کلید API برای دسترسی برنامه‌نویسی بسازید و پشتیبان JSON دانلود یا اعتبارسنجی بازیابی کنید.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">میانبرهای صفحه‌کلید</h2>
            <p className="text-sm"><kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">?</kbd> راهنما، <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">N</kbd> تراکنش جدید، <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">/</kbd> جستجو، <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">G</kbd> سپس <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">D</kbd> داشبورد، <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-700">Esc</kbd> بستن.</p>
          </section>
          <Link href="/dashboard" className="inline-block text-primary-600 dark:text-primary-400 hover:underline text-sm font-medium">
            بازگشت به داشبورد
          </Link>
        </div>
      </main>
    </div>
  )
}
