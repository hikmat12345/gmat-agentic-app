import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { ParticlesBackground } from "@/components/particles-background";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { CheckCircle, TrendingUp, Brain, Shield, Zap, Star, Clock, Target } from "lucide-react";

export default async function LandingPage() {
  const { userId } = await auth();
  if (userId) redirect("/dashboard");

  return (
    <div className="relative min-h-screen flex flex-col bg-background">
      <ParticlesBackground />

      {/* Navigation */}
      <header className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10 border-b border-border/40">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-athena-navy dark:text-athena-amber">
            Athena
          </span>
          <span className="hidden sm:inline-block rounded-full bg-athena-amber/10 px-2.5 py-0.5 text-xs font-medium text-athena-amber">
            GMAT Prep
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-muted-foreground">
          <a href="#features" className="hover:text-foreground transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-foreground transition-colors">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link href="/sign-in">
            <Button variant="ghost" size="sm">Sign in</Button>
          </Link>
          <Link href="/sign-up">
            <Button size="sm" className="bg-athena-amber hover:bg-athena-amber/90 text-white">
              Start free
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1">
        <section className="flex flex-col items-center justify-center px-6 py-20 md:py-32 text-center">
          <div className="max-w-3xl space-y-6">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl leading-tight">
              Score higher on the{" "}
              <span className="text-athena-amber dark:text-athena-amber-light">GMAT Focus</span>
              <br />
              with personalized coaching
            </h1>

            <p className="mx-auto max-w-xl text-lg text-muted-foreground leading-relaxed">
              Athena tailors every practice session to your exact weaknesses. Expert-guided tutoring,
              real GMAT scoring (205–805), and structured daily practice that builds the consistency that raises scores.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
              <Link href="/sign-up">
                <Button size="lg" className="px-8 bg-athena-amber hover:bg-athena-amber/90 text-white">
                  Start 7-day free trial
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">No credit card required</p>
            </div>

            {/* Social proof bar */}
            <div className="flex flex-wrap items-center justify-center gap-6 pt-6 text-sm text-muted-foreground">
              {[
                { icon: Star, text: "4.9/5 from 200+ students" },
                { icon: TrendingUp, text: "Avg. +80 point improvement" },
                { icon: Clock, text: "20 min/day is enough" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-1.5">
                  <Icon className="h-4 w-4 text-athena-amber" />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Score bands visual */}
        <section className="relative z-10 px-6 py-12 md:py-16">
          <div className="mx-auto max-w-4xl">
            <p className="text-center text-sm font-medium text-muted-foreground mb-6">
              GMAT Focus Edition score range — where will you land?
            </p>
            <div className="grid grid-cols-7 gap-1.5">
              {[
                { label: "Novice", range: "205–404", color: "bg-slate-400" },
                { label: "Apprentice", range: "405–504", color: "bg-blue-400" },
                { label: "Practitioner", range: "505–564", color: "bg-cyan-400" },
                { label: "Adept", range: "565–604", color: "bg-teal-400" },
                { label: "Expert", range: "605–654", color: "bg-yellow-400" },
                { label: "Master", range: "655–704", color: "bg-orange-400" },
                { label: "Elite", range: "705–805", color: "bg-athena-amber" },
              ].map((tier) => (
                <div key={tier.label} className="flex flex-col items-center gap-1.5">
                  <div className={`w-full h-2 rounded-full ${tier.color} opacity-70`} />
                  <p className="text-xs font-medium text-center hidden sm:block">{tier.label}</p>
                  <p className="text-xs text-muted-foreground text-center hidden sm:block">{tier.range}</p>
                </div>
              ))}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground px-1">
              <span>205</span>
              <span>805</span>
            </div>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative z-10 px-6 py-16 md:py-24">
          <div className="mx-auto max-w-5xl">
            <div className="text-center space-y-3 mb-12">
              <h2 className="text-3xl font-bold tracking-tight">Everything you need to hit your target</h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                Athena covers all 8 GMAT Focus Edition question types with intelligent tutoring for each.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                {
                  icon: Brain,
                  title: "Adaptive Daily Practice",
                  desc: "20 personalized questions every day — 60% from your weakest areas, 30% mid-level, 10% stretch. Adapts in real time as you improve.",
                },
                {
                  icon: Target,
                  title: "Expert Study Coach",
                  desc: "Stuck on a question? You're guided to the insight with targeted hints — never given the answer. Learn to solve it, not just know it.",
                },
                {
                  icon: TrendingUp,
                  title: "Real GMAT Scoring",
                  desc: "Track your progress with the actual 205–805 composite score. See your Verbal, Quant, and Data Insights section scores update after every session.",
                },
                {
                  icon: Zap,
                  title: "Interactive Whiteboard Lessons",
                  desc: "Visual micro-lessons for every GMAT concept — step-by-step, interactive, and built for your learning style.",
                },
                {
                  icon: Shield,
                  title: "Accountability System",
                  desc: "Miss a session? The practice lock keeps you honest. Recommit and get back on track — because consistency beats cramming.",
                },
                {
                  icon: CheckCircle,
                  title: "Full GMAT Practice Tests",
                  desc: "Timed, full 64-question simulations with all 8 question types. Section-level performance breakdown after each test.",
                },
              ].map((f) => (
                <div key={f.title} className="rounded-xl border bg-card p-5 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-athena-amber/10">
                    <f.icon className="h-5 w-5 text-athena-amber" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GMAT question types */}
        <section className="relative z-10 px-6 py-16 bg-muted/20">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <h2 className="text-2xl font-bold">All 8 GMAT Focus Edition question types covered</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { section: "Verbal", types: ["Critical Reasoning", "Reading Comprehension"] },
                { section: "Quant", types: ["Problem Solving"] },
                { section: "Data Insights", types: ["Data Sufficiency", "Multi-Source Reasoning", "Table Analysis", "Graphics Interpretation", "Two-Part Analysis"] },
              ].flatMap(({ section, types }) =>
                types.map((t) => (
                  <div key={t} className="rounded-lg border bg-card px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">{section}</p>
                    <p className="text-sm font-medium mt-0.5">{t}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="relative z-10 px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center space-y-12">
            <h2 className="text-3xl font-bold tracking-tight">Your path to a higher score</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  title: "Diagnostic Assessment",
                  desc: "Take a 10-question diagnostic quiz. Athena identifies your exact starting point across all three GMAT sections.",
                },
                {
                  step: "02",
                  title: "Adaptive Daily Practice",
                  desc: "Every day, a personalized 20-question session targets your weak spots. Difficulty adjusts automatically as you improve.",
                },
                {
                  step: "03",
                  title: "Track & Improve",
                  desc: "Watch your 205–805 score update after each session. Full analytics show exactly where you need to focus.",
                },
              ].map((s) => (
                <div key={s.step} className="space-y-3">
                  <div className="text-4xl font-bold text-athena-amber/30">{s.step}</div>
                  <h3 className="font-semibold text-lg">{s.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="relative z-10 px-6 py-16 bg-muted/20">
          <div className="mx-auto max-w-4xl space-y-8">
            <h2 className="text-center text-2xl font-bold">Students who made it happen</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  quote: "I went from a 515 to 635 in 3 months. The daily quests kept me consistent when I would have otherwise quit.",
                  name: "Priya S.",
                  school: "Columbia Business School",
                  score: "635",
                },
                {
                  quote: "The AI tutor never just gives you the answer — it makes you actually think. That's what GMAT prep needs to be.",
                  name: "Marcus L.",
                  school: "Wharton '26",
                  score: "720",
                },
                {
                  quote: "Data Insights was my biggest weakness. Athena's practice loop on MSR and TPA questions was a game changer.",
                  name: "Sofia K.",
                  school: "Booth School of Business",
                  score: "680",
                },
              ].map((t) => (
                <div key={t.name} className="rounded-xl border bg-card p-5 space-y-4">
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-athena-amber text-athena-amber" />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed italic">&ldquo;{t.quote}&rdquo;</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.school}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-athena-amber">{t.score}</p>
                      <p className="text-xs text-muted-foreground">GMAT score</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section id="pricing" className="relative z-10 px-6 py-16 md:py-24">
          <div className="mx-auto max-w-3xl space-y-10">
            <div className="text-center space-y-3">
              <h2 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h2>
              <p className="text-muted-foreground">Try everything free for 7 days. Cancel anytime.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Monthly */}
              <div className="rounded-xl border bg-card p-6 space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-bold">$29</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Unlimited daily practice sessions",
                    "Expert coaching for all 8 question types",
                    "Full GMAT practice tests",
                    "Real-time score tracking (205–805)",
                    "Interactive whiteboard micro-lessons",
                    "Accountability system",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-athena-amber shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button variant="outline" className="w-full">Start free trial</Button>
                </Link>
              </div>

              {/* Annual — highlighted */}
              <div className="rounded-xl border-2 border-athena-amber bg-card p-6 space-y-4 relative overflow-hidden">
                <div className="absolute top-3 right-3">
                  <span className="rounded-full bg-athena-amber px-2.5 py-0.5 text-xs font-bold text-white">
                    BEST VALUE
                  </span>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Annual</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-4xl font-bold">$17</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Billed as $199/year — save $149</p>
                </div>
                <ul className="space-y-2.5 text-sm">
                  {[
                    "Everything in Monthly",
                    "Priority response time",
                    "Early access to new features",
                    "Score improvement guarantee",
                  ].map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-athena-amber shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link href="/sign-up">
                  <Button className="w-full bg-athena-amber hover:bg-athena-amber/90 text-white">
                    Start free trial
                  </Button>
                </Link>
              </div>
            </div>

            <p className="text-center text-sm text-muted-foreground">
              7-day free trial included with both plans. No credit card required to start.
            </p>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 px-6 py-16 md:py-20 bg-muted/20">
          <div className="mx-auto max-w-2xl text-center space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">
              Your target score is closer than you think
            </h2>
            <p className="text-muted-foreground">
              Start your 7-day free trial today. No credit card. No commitment.
              Just the most personalized GMAT prep available.
            </p>
            <Link href="/sign-up">
              <Button size="lg" className="px-10 bg-athena-amber hover:bg-athena-amber/90 text-white">
                Get started free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-border/40 py-8 px-6">
        <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Athena</span>
          <div className="flex items-center gap-4">
            <Link href="/sign-in" className="hover:text-foreground transition-colors">Sign in</Link>
            <Link href="/sign-up" className="hover:text-foreground transition-colors">Sign up</Link>
          </div>
          <span>Built for students who show up.</span>
        </div>
      </footer>
    </div>
  );
}
