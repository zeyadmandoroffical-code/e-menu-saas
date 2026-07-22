import Link from 'next/link'
import { Utensils, Globe, ShieldCheck, Sparkles, Smartphone, ArrowLeft } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-rose-500 flex flex-col justify-between relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header Navigation */}
      <header className="container mx-auto px-6 py-6 flex justify-between items-center z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center shadow-lg shadow-rose-500/30">
            <Utensils className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            منصة القائمة الإلكترونية
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/menu/burger"
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
          >
            معاينة المطعم (Burger)
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-6 py-12 flex-1 flex flex-col items-center justify-center text-center z-10 max-w-4xl">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm font-medium mb-8 backdrop-blur-md">
          <Sparkles className="w-4 h-4" />
          <span>منصة متعددة المستأجرين Multi-Tenant SaaS</span>
        </div>

        <h1 className="text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-6 bg-gradient-to-b from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
          أنشئ منيو إلكتروني تفاعلي وفاخر لمطعمك بدقائق معدودة
        </h1>

        <p className="text-lg md:text-xl text-slate-400 leading-relaxed mb-10 max-w-2xl">
          دعم النطاقات الفرعية المخصصة Subdomains، سرعةائقة، تجربة مخصصة للأجهزة الذكية بلمسة Apple وتكامل تام مع Supabase.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center max-w-md">
          <Link
            href="/menu/burger"
            className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-semibold flex items-center justify-center gap-3 shadow-xl shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-[1.02] transition-all"
          >
            <span>تجربة المنيو العرض (burger)</span>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full text-right">
          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-4">
              <Globe className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">نطاقات فرعية ديناميكية</h3>
            <p className="text-sm text-slate-400">
              كل مطعم يحصل على رابط مخصص مثل <code className="text-rose-400">burger.domain.com</code> ويعاد توجيهه بلحظة.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 mb-4">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">تصميم عربي عصري</h3>
            <p className="text-sm text-slate-400">
              خط Readex Pro وتنسيق RTL مع لمسات جمالية دقيقة وتصميم متوافق مع كافة الهواتف.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">قواعد بيانات Supabase</h3>
            <p className="text-sm text-slate-400">
              أمان كامل وسياسات Row Level Security وربط أداء فائق بين المنتجات والأقسام.
            </p>
          </div>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-6 text-center text-sm text-slate-500 border-t border-slate-800/60">
        جميع الحقوق محفوظة © {new Date().getFullYear()} منصة القائمة الإلكترونية Multi-Tenant E-Menu
      </footer>
    </div>
  )
}
