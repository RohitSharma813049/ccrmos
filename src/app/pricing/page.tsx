import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import dbConnect from "@/lib/db";
import SubscriptionPlan from "@/modules/settings/schemas/SubscriptionPlan";

// Force dynamic rendering since plans might change
export const dynamic = 'force-dynamic';

export default async function PricingPage() {
  await dbConnect();
  
  // Fetch active plans, sorted by price
  const plans = await SubscriptionPlan.find({ isActive: true }).sort({ price: 1 }).lean();

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden bg-background">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-accent/20 blur-[120px] pointer-events-none" />

      {/* Navbar Placeholder */}
      <header className="w-full flex justify-between items-center px-8 py-6 z-10 glass-panel border-x-0 border-t-0">
        <Link href="/" className="text-2xl font-bold tracking-tighter text-zinc-100 cursor-pointer">
          CRM<span className="text-primary">OS</span>
        </Link>
        <nav className="flex gap-4 items-center">
          <Link href="/login">
            <Button variant="secondary" size="sm" className="border-surface-border">Log in</Button>
          </Link>
        </nav>
      </header>

      <main className="flex-1 flex flex-col items-center px-6 py-20 relative z-10">
        
        <div className="text-center max-w-3xl mb-16 animate-[fade-in_1s_ease-out_forwards]">
          <h1 className="text-5xl font-bold tracking-tight mb-6">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-foreground/70">
            No hidden fees. No surprise charges. Choose the plan that scales with your business.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan: any, i: number) => {
            const isPro = plan.name.toLowerCase().includes('pro');
            
            return (
              <div key={plan._id.toString()} style={{ animationDelay: `${0.2 * i}s` }}>
                <Card 
                  className={`h-full relative flex flex-col p-8 transition-transform duration-300 hover:scale-[1.02] ${isPro ? 'border-primary/50 shadow-[0_0_40px_-10px_rgba(59,130,246,0.2)]' : 'border-surface-border'}`}
                >
                  {isPro && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-bold rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  
                  <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-foreground/60 mb-6 min-h-[48px]">
                    Perfect for {plan.users} users looking to manage relationships.
                  </p>
                  
                  <div className="mb-8">
                    <span className="text-4xl font-extrabold">${plan.price}</span>
                    <span className="text-foreground/60"> / {plan.billing.toLowerCase()}</span>
                  </div>

                  <Link href={`/signup?planId=${plan._id.toString()}&billing=${plan.billing}`} className="w-full mt-auto mb-8">
                    <Button variant={isPro ? 'primary' : 'secondary'} className="w-full h-12 text-base">
                      Get Started
                    </Button>
                  </Link>

                  <div className="space-y-4 flex-1">
                    <p className="text-sm font-semibold uppercase tracking-wider text-foreground/80 mb-4">What's included:</p>
                  
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-foreground/80">Up to {plan.maxUsers} Users</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                    <span className="text-sm text-foreground/80">Up to {plan.maxCustomForms} Custom Forms</span>
                  </div>
                  
                  {plan.features?.map((feature: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </div>
                  ))}

                  {/* Feature toggles */}
                  {plan.aiFeatures && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-foreground/80">AI Workflow Agent</span>
                    </div>
                  )}
                  {plan.apiIntegration && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-foreground/80">API Access</span>
                    </div>
                  )}
                  {plan.allowWhiteLabeling && (
                    <div className="flex items-center gap-3">
                      <svg className="w-5 h-5 text-emerald-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                      <span className="text-sm text-foreground/80">Custom Domain White-labeling</span>
                    </div>
                  )}
                </div>
              </Card>
              </div>
            );
          })}
        </div>

      </main>

      <footer className="w-full py-8 text-center text-foreground/40 border-t border-surface-border z-10 glass-panel mt-20">
        <p className="text-sm">© {new Date().getFullYear()} CRM OS. All rights reserved.</p>
      </footer>
    </div>
  );
}
