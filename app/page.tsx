import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Plus } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border/40 py-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl transition-colors hover:text-primary">
            <span className="text-primary text-2xl">AdCreatify</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/examples"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Examples
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden hero-gradient">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl gradient-text">
                  The Complete <br />
                  Ad Creation Platform
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
                  Generate professional static image ads for Meta and Google in seconds. Try it now - no signup
                  required!
                </p>
              </div>
              <div className="mt-16 flex flex-col sm:flex-row gap-4">
                <Link href="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base w-full sm:w-auto">
                    Try Now - No Signup <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="px-8 py-6 rounded-md text-base w-full sm:w-auto">
                    Create Account
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Product Screenshot */}
          <div className="mt-16 md:mt-20 max-w-6xl mx-auto px-4">
            <div className="relative rounded-lg overflow-hidden border border-border/40 shadow-2xl">
              <div className="absolute top-0 left-0 right-0 h-8 bg-secondary flex items-center px-3 gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              </div>
              <div className="pt-8">
                <img
                  src="/placeholder.svg?height=600&width=1200&text=AdCreatify+Dashboard"
                  alt="AdCreatify Dashboard"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                Create Stunning Ads in Minutes
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Our AI-powered platform makes it easy to create professional ads for any platform.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-background p-8 rounded-lg border border-border/40">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">No Signup Required</h3>
                <p className="text-muted-foreground">
                  Try the tool instantly without creating an account. Sign up later to save your creations.
                </p>
              </div>

              <div className="bg-background p-8 rounded-lg border border-border/40">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">All Standard Formats</h3>
                <p className="text-muted-foreground">
                  Automatically generate ads in all common aspect ratios for Meta and Google.
                </p>
              </div>

              <div className="bg-background p-8 rounded-lg border border-border/40">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Plus className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Ad Library</h3>
                <p className="text-muted-foreground">
                  Access your history of created ads anytime in your personal library.
                </p>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/features">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md">
                  Explore All Features <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                  Simple, Transparent Pricing
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                  Start with 3 free generations. Upgrade when you're ready.
                </p>
              </div>
            </div>

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {/* Free Plan */}
              <div className="flex flex-col p-8 bg-secondary rounded-lg border border-border/40">
                <div>
                  <h3 className="text-xl font-bold">Free</h3>
                  <div className="mt-4 text-3xl font-bold">$0</div>
                  <p className="text-muted-foreground mt-2">Forever free</p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>3 ad generations per month</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>3 downloads per month</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>Basic aspect ratios</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link href="/dashboard">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="flex flex-col p-8 bg-secondary rounded-lg border-2 border-primary relative">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pro</h3>
                  <div className="mt-4 text-3xl font-bold">$19</div>
                  <p className="text-muted-foreground mt-2">Per month</p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>50 ad generations per month</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>50 downloads per month</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>All aspect ratios</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link href="/signup">
                    <Button className="w-full bg-primary hover:bg-primary/90">Upgrade Now</Button>
                  </Link>
                </div>
              </div>

              {/* Business Plan */}
              <div className="flex flex-col p-8 bg-secondary rounded-lg border border-border/40">
                <div>
                  <h3 className="text-xl font-bold">Business</h3>
                  <div className="mt-4 text-3xl font-bold">$49</div>
                  <p className="text-muted-foreground mt-2">Per month</p>
                  <ul className="mt-6 space-y-3">
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>Unlimited ad generations</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>Unlimited downloads</span>
                    </li>
                    <li className="flex items-center">
                      <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                      </div>
                      <span>Team collaboration</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8">
                  <Link href="/signup">
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/pricing">
                <Button variant="outline" className="px-6 py-2 rounded-md">
                  View Full Pricing Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-secondary border-t border-border/40">
          <div className="container px-4 md:px-6">
            <p className="text-center text-sm text-muted-foreground mb-8">Loved by 1,000+ Brands & Agencies</p>
            <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-70">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8">
                  <div className="w-24 h-8 bg-muted/30 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <Link href="/" className="text-primary hover:text-primary/90 transition-colors">
              AdCreatify
            </Link>
            <span className="text-xs text-muted-foreground">
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
          </div>
          <div className="flex gap-6">
            <Link href="/terms" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Terms
            </Link>
            <Link href="/privacy" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Privacy
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
