import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Wand2,
  BarChart3,
  Youtube,
  Clock,
  Zap,
} from "lucide-react";

const FEATURES = [
  {
    icon: TrendingUp,
    title: "AI Trend Research",
    description: "Discover viral topics targeting US viewers with real-time trend analysis.",
  },
  {
    icon: Calendar,
    title: "30-Day Content Calendar",
    description: "Auto-generate a full month of Shorts and TikTok content ideas.",
  },
  {
    icon: Wand2,
    title: "Full Content Pipeline",
    description: "Hooks, scripts, CTAs, descriptions, thumbnails, and video prompts — all AI-generated.",
  },
  {
    icon: Clock,
    title: "Smart Scheduling",
    description: "Queue and auto-publish to YouTube Shorts and TikTok at optimal US times.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track views, engagement, and growth across both platforms.",
  },
  {
    icon: Zap,
    title: "AI Feedback Loop",
    description: "Continuously improve content quality based on performance data.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            Creator<span className="text-indigo-600">Pilot</span> AI
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#how-it-works" className="hover:text-slate-900">How it works</a>
          </nav>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Start free</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-50 text-indigo-700 text-sm font-medium mb-6">
              <Youtube className="w-4 h-4" />
              Built for US faceless Shorts & TikTok creators
            </div>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              Your AI Co-Pilot for{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Faceless Channels
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
              Automatically research trends, generate 30 days of content, write scripts,
              schedule posts, and grow your YouTube Shorts and TikTok — all on autopilot.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link href="/register">Start your free trial</Link>
              </Button>
              <Button variant="secondary" size="lg" asChild>
                <Link href="/login">Sign in to dashboard</Link>
              </Button>
            </div>
          </div>
        </section>

        <section id="features" className="py-20 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-4">Everything you need to run a faceless channel</h2>
            <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
              From trend research to published content — CreatorPilot AI handles the entire pipeline.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {FEATURES.map((f) => (
                <div key={f.title} className="p-6 bg-white rounded-2xl border hover:border-indigo-300 hover:shadow-lg transition-all">
                  <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center mb-4">
                    <f.icon className="w-5 h-5 text-indigo-600" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-500">{f.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="py-20 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-center mb-12">How it works</h2>
            <div className="space-y-8">
              {[
                { step: "1", title: "Set up your channel", desc: "Complete the wizard — niche, tone, target audience (US), and platforms." },
                { step: "2", title: "AI researches trends", desc: "Our agent finds viral topics optimized for US Shorts and TikTok viewers." },
                { step: "3", title: "Generate 30 days of content", desc: "Full calendar with hooks, scripts, CTAs, descriptions, and video prompts." },
                { step: "4", title: "Schedule & publish", desc: "Auto-post to YouTube Shorts and TikTok at peak US engagement times." },
                { step: "5", title: "Analyze & improve", desc: "Track analytics and let the AI feedback loop optimize future content." },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 items-start">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg">{item.title}</h3>
                    <p className="text-slate-500">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-violet-700">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Ready to automate your faceless channel?</h2>
            <p className="text-indigo-100 text-lg mb-8">
              Join creators using CreatorPilot AI to grow on YouTube Shorts and TikTok.
            </p>
            <Button size="lg" className="!bg-white !text-indigo-600 hover:!bg-indigo-50" asChild>
              <Link href="/register">Get started free</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 CreatorPilot AI</p>
          <p>Automated faceless content for US audiences</p>
        </div>
      </footer>
    </div>
  );
}
