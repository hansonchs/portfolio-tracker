"use client"

import { useAuth } from "@clerk/nextjs"
import { SignInButton } from "@clerk/nextjs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, TrendingUp, BarChart3, Target, CheckCircle2, LogIn, LayoutGrid, Activity, DollarSign, LineChart } from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function LandingPage() {
  const { isLoaded, isSignedIn } = useAuth()
  const router = useRouter()

  // Redirect to dashboard if already signed in (only after auth loads)
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push("/")
    }
  }, [isLoaded, isSignedIn, router])

  // Return null silently if signed in (avoid flash)
  if (isSignedIn) {
    return null
  }

  const features = [
    {
      icon: <LineChart className="h-6 w-6" />,
      title: "Real-Time Portfolio Dashboard",
      description: "View complete portfolio overview with net worth, P/L tracking, and market breakdown across HK and US markets with live price updates."
    },
    {
      icon: <Target className="h-6 w-6" />,
      title: "Target Allocation & Rebalancing",
      description: "Set target percentages for each ticker and get actionable buy/sell recommendations to maintain your desired portfolio mix."
    },
    {
      icon: <Activity className="h-6 w-6" />,
      title: "Position Size Alerts",
      description: "Configure custom thresholds (5-50%) to highlight over-concentrated positions and manage portfolio risk effectively."
    },
    {
      icon: <BarChart3 className="h-6 w-6" />,
      title: "Multi-Market Support",
      description: "Track investments across Hong Kong and US markets with automatic currency conversion (USD/HKD) and unified reporting."
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Cash Balance Tracking",
      description: "Monitor cash balances across multiple broker accounts in different currencies with real-time calculations."
    },
    {
      icon: <LayoutGrid className="h-6 w-6" />,
      title: "Visual Analytics",
      description: "Four interactive charts showing market allocation, asset types, account breakdown, and top holdings at a glance."
    }
  ]

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-background to-background py-20 md:py-32 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <TrendingUp className="h-4 w-4" />
              Smart Portfolio Tracking
            </div>
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
              Track Your Investments
              <span className="block bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Like a Pro
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A powerful, free portfolio tracker for HK and US markets. Monitor positions,
              set target allocations, and get rebalancing insights—all in one place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <SignInButton mode="modal">
                <Button size="lg" className="text-lg px-8 py-6">
                  <LogIn className="h-5 w-5 mr-2" />
                  Get Started Free
                </Button>
              </SignInButton>
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Learn More
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              No credit card required • Free forever • Secure sign-in
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Track Your Portfolio</h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Powerful features designed for individual investors managing multi-market portfolios.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, i) => (
              <Card key={i} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="p-6 space-y-4">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 md:py-24 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Get Started in Minutes</h2>
            <p className="text-lg md:text-xl text-muted-foreground">
              Simple three-step process to start tracking your investments
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                step: "01",
                title: "Create Your Account",
                description: "Sign up securely with Clerk. Your data is private, encrypted, and always under your control."
              },
              {
                step: "02",
                title: "Add Your Positions",
                description: "Manually enter your stocks, options, and cash positions across multiple broker accounts."
              },
              {
                step: "03",
                title: "Track & Optimize",
                description: "View real-time updates, analyze your portfolio distribution, and get smart rebalancing recommendations."
              }
            ].map((step, i) => (
              <div key={i} className="relative">
                <div className="text-6xl md:text-7xl font-bold text-primary/10 absolute -top-4 md:-top-6 -left-2">
                  {step.step}
                </div>
                <div className="relative pl-8 md:pl-10 pt-4 space-y-3">
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Why Choose Portfolio Tracker?
              </h2>
              <p className="text-lg md:text-xl text-muted-foreground mb-8">
                Built by investors, for investors. Simple, powerful, and always free.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: "Free Forever", value: "No subscription fees" },
                  { label: "Unlimited", value: "No position limits" },
                  { label: "Private", value: "Your data stays yours" },
                  { label: "Multi-Currency", value: "HKD & USD support" },
                  { label: "Secure", value: "Protected by Clerk" },
                  { label: "Fast", value: "Built on Next.js 15" }
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-medium">{benefit.label}</div>
                      <div className="text-sm text-muted-foreground">{benefit.value}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative">
              <Card className="border-2 shadow-xl">
                <CardContent className="p-8">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Net Worth</span>
                      <span className="text-2xl font-bold">HKD 1,234,567</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Total P/L</span>
                      <span className="text-2xl font-bold text-green-600">+23.4%</span>
                    </div>
                    <div className="h-px bg-border" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>HK Market</span>
                        <span>45%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: "45%" }} />
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>US Market</span>
                        <span>55%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: "55%" }} />
                      </div>
                    </div>
                    <SignInButton mode="modal">
                      <Button className="w-full" size="lg">
                        <span>View Your Portfolio</span>
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </SignInButton>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 md:py-24 px-4 bg-primary text-primary-foreground">
        <div className="container mx-auto max-w-4xl text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold">
            Ready to Take Control of Your Investments?
          </h2>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl mx-auto">
            Join investors tracking their portfolios with confidence. Free forever, no hidden fees, no data limits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <SignInButton mode="modal">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <LogIn className="h-5 w-5 mr-2" />
                Start Tracking Now — It's Free
              </Button>
            </SignInButton>
          </div>
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-bold text-lg">Portfolio Tracker</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Your personal investment companion for HK & US markets
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <a href="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="/terms" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="/disclaimer" className="hover:text-foreground transition-colors">Disclaimer</a>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              <p>© 2025 Portfolio Tracker. All rights reserved.</p>
              <p className="mt-1">Built with Next.js, Clerk, and shadcn/ui</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
