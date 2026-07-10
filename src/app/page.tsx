import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background gradients and glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      {/* Navbar Placeholder */}
      <header className="w-full flex justify-between items-center px-8 py-6 z-10 glass-panel border-x-0 border-t-0">
        <div className="text-2xl font-bold tracking-tighter text-gray-900">
          CRM<span className="text-primary">OS</span>
        </div>
        <nav className="flex gap-4 items-center">
          <Link href="/login">
            <Button variant="primary" size="sm">Login</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        
        {/* Hero Section */}
        <section className="flex flex-col items-center justify-center text-center max-w-4xl pt-20 pb-32 animate-[fade-in_1s_ease-out_forwards]">
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-surface-border bg-surface text-sm font-medium text-accent">
            🚀 The future of customer relationships
          </div>
          <h1 className="text-6xl sm:text-7xl font-bold tracking-tight mb-8">
            Manage your business with <br className="hidden sm:block" />
            <span className="text-gray-900 animate-[slide-up_1.2s_ease-out_forwards]">
              ultimate clarity.
            </span>
          </h1>
          <p className="text-xl text-foreground/70 mb-12 max-w-2xl leading-relaxed">
            CRM OS is a premium, open-source operating system designed to streamline your sales pipeline, track leads, and manage your team efficiently.
          </p>
          <div className="flex justify-center w-full sm:w-auto">
            <Link href="/login" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto">Login to Dashboard</Button>
            </Link>
          </div>
        </section>

        {/* Features Grid */}
        <section className="w-full max-w-6xl pb-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="animate-[slide-up_1.4s_ease-out_forwards]">
              <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 border border-primary/30">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Analytics Dashboard</h3>
              <p className="text-foreground/60 leading-relaxed">
                Gain deep insights into your sales performance with beautiful, real-time charts and data visualization.
              </p>
            </Card>

            <Card className="animate-[slide-up_1.6s_ease-out_forwards]">
              <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6 border border-accent/30">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Team Collaboration</h3>
              <p className="text-foreground/60 leading-relaxed">
                Work seamlessly with your entire organization. Assign leads, set permissions, and close deals faster.
              </p>
            </Card>

            <Card className="animate-[slide-up_1.8s_ease-out_forwards]">
              <div className="h-12 w-12 rounded-lg bg-indigo-500/20 flex items-center justify-center mb-6 border border-indigo-500/30">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Pipeline Automation</h3>
              <p className="text-foreground/60 leading-relaxed">
                Set it and forget it. Automate follow-ups, meeting scheduling, and mundane data entry tasks.
              </p>
            </Card>
          </div>
        </section>

      </main>

      <footer className="w-full py-8 text-center text-foreground/40 border-t border-surface-border z-10 glass-panel">
        <p className="text-sm">© {new Date().getFullYear()} CRM OS. All rights reserved.</p>
      </footer>
    </div>
  );
}
