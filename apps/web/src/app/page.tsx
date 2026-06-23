import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ToolShowcase } from "@/components/landing/ToolShowcase";
import { TESTIMONIALS, TOOLS } from "@/lib/data";
import { Play } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="font-bold text-xl text-slate-900">
            Vid<span className="text-indigo-600">Edge</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600">
            <a href="#features" className="hover:text-slate-900">Features</a>
            <a href="#testimonials" className="hover:text-slate-900">Testimonials</a>
          </nav>
          <Button href="/dashboard/extension" size="sm">Open Dashboard</Button>
        </div>
      </header>

      <main>
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-indigo-600 font-medium mb-4">✨ Founded by 7-figure YouTube experts</p>
            <h1 className="text-5xl md:text-7xl font-bold text-slate-900 leading-tight mb-6">
              The All-In-One Tool For{" "}
              <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
                Faceless Creators
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10">
              Scripts, thumbnails, a full AI video editor, channel analytics, and your production board —
              every tool you need to grow a faceless channel, in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button href="/dashboard/extension" size="lg">Get started</Button>
              <Button variant="secondary" size="lg">
                <Play className="w-5 h-5 mr-2" /> Watch Demo
              </Button>
            </div>
          </div>
        </section>

        <ToolShowcase />

        <section id="features" className="py-20 px-4 bg-slate-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl font-bold text-center text-slate-900 mb-4">Everything a faceless channel needs</h2>
            <p className="text-center text-slate-500 mb-12 max-w-2xl mx-auto">
              From your first idea to the final upload — VidEdge handles every step of the process.
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TOOLS.map((tool) => (
                <Link
                  key={tool.id}
                  href={tool.href}
                  className="p-6 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-lg transition-all group"
                >
                  <span className="text-3xl">{tool.emoji}</span>
                  <h3 className="font-bold text-lg mt-4 group-hover:text-indigo-600 transition-colors">{tool.label}</h3>
                  <p className="text-sm text-slate-500 mt-2">{getFeatureDescription(tool.id)}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="testimonials" className="py-20 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-indigo-600 font-medium mb-2">4.9/5 from creators</p>
              <h2 className="text-4xl font-bold text-slate-900">Loved by faceless creators</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="p-6 bg-white rounded-2xl border border-slate-200">
                  <p className="text-sm font-medium text-indigo-600 mb-3">{t.tool}</p>
                  <p className="text-slate-700 mb-4">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold">
                      {t.author[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.author}</p>
                      <p className="text-xs text-slate-500">{t.niche}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4 bg-gradient-to-br from-indigo-600 to-violet-700">
          <div className="max-w-3xl mx-auto text-center text-white">
            <h2 className="text-4xl font-bold mb-4">Your entire channel workflow. One tool.</h2>
            <p className="text-indigo-100 text-lg mb-8">
              Join faceless creators producing better videos, faster — without juggling five tools.
            </p>
            <Button href="/dashboard/extension" size="lg" className="!bg-white !text-indigo-600 hover:!bg-indigo-50">
              Get started
            </Button>
          </div>
        </section>
      </main>

      <footer className="py-8 px-4 border-t border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p>© 2026 VidEdge Personal Edition</p>
          <p>Built for personal use — all tools included</p>
        </div>
      </footer>
    </div>
  );
}

function getFeatureDescription(id: string): string {
  const descriptions: Record<string, string> = {
    extension: "Analyze any YouTube channel directly. See outlier scores, video tags, monetization status, and channel analytics.",
    "niche-finder": "Discover high-performing faceless channels across niches. Find untapped opportunities with our growing database.",
    branding: "Chat with the Branding AI to generate a matching channel profile picture and banner — on-brand art with your channel name baked in.",
    "video-ideas": "Generate scored, ready-to-make video ideas tailored to your niche — each with a hook and a one-click path to a full script.",
    "thumbnail-studio": "Canva-style editor with AI image generation. Design click-worthy thumbnails with text, shapes, and layers.",
    "script-writer": "Generate research-backed scripts section by section, with hooks optimized for retention and watch time.",
    voiceover: "Transform your scripts into natural-sounding AI voiceovers with multiple voice options and speed control.",
    "video-editor": "Turn a narration into a fully generated video — scene-by-scene AI imagery, animated clips, and a full timeline editor.",
    "production-board": "Kanban-style workflow to manage every video from brainstorming to upload. Set deadlines and track progress.",
    monetize: "Discover revenue streams for your channel. Calculate potential earnings and explore monetization strategies.",
    "ai-coach": "Chat with Caleb AI, your 24/7 YouTube growth coach. Ask anything about niches, titles, and getting views.",
  };
  return descriptions[id] || "";
}
