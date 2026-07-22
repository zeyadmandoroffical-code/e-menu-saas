import type { Metadata } from 'next'
import { Readex_Pro } from 'next/font/google'
import './globals.css'

const readexPro = Readex_Pro({
  subsets: ['arabic', 'latin'],
  weight: ['200', '300', '400', '500', '600', '700'],
  variable: '--font-readex-pro',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'منصة القائمة الإلكترونية | E-Menu SaaS System',
  description: 'منصة القائمة الإلكترونية الذكية للمطاعم والمقاهي بأعلى معايير الجودة والتصميم',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={`${readexPro.variable} scroll-smooth`}
      suppressHydrationWarning
    >
      <body
        className={`font-sans antialiased bg-slate-50 text-slate-900 selection:bg-rose-500 selection:text-white min-h-screen flex flex-col`}
        suppressHydrationWarning
      >
        {children}
      </body>
    </html>
  )
}
