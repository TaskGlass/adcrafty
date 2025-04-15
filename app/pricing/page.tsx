import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Check, X } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border/40 py-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary text-2xl">AdCreator</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/features"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
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
                Start Free Trial
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 md:py-28 overflow-hidden hero-gradient">
          <div className="container px-4 md:px-6 relative z-10">
            <div className="flex flex-col items-center space-y-4 text-center max-w-4xl mx-auto">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl gradient-text">
                  Simple, Transparent Pricing
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
                  Choose the plan that's right for you. Start with 5 free generations, upgrade when you're ready.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Tables */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
              {/* Free Plan */}
              <div className="flex flex-col p-8 bg-secondary rounded-lg border border-border/40 h-full">
                <div>
                  <h3 className="text-xl font-bold">Free</h3>
                  <div className="mt-4 text-4xl font-bold">$0</div>
                  <p className="text-muted-foreground mt-2">Forever free</p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>5 ad generations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Basic aspect ratios (1:1, 4:5, 16:9)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Ad library access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Text-to-image generation</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Team collaboration</span>
                    </li>
                    <li className="flex items-start">
                      <X className="h-5 w-5 text-muted-foreground mr-2 mt-0.5 shrink-0" />
                      <span className="text-muted-foreground">Advanced customization</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-8 border-t border-border/40">
                  <Link href="/signup">
                    <Button variant="outline" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Pro Plan */}
              <div className="flex flex-col p-8 bg-secondary rounded-lg border-2 border-primary relative h-full">
                <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                  <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold">Pro</h3>
                  <div className="mt-4 text-4xl font-bold">$19</div>
                  <p className="text-muted-foreground mt-2">Per month</p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Unlimited ad generations</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>All aspect ratios</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Ad library access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Text-to-image generation</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Priority support</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Image upload & editing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Advanced customization options</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-8 border-t border-border/40">
                  <Link href="/signup">
                    <Button className="w-full bg-primary hover:bg-primary/90">Upgrade Now</Button>
                  </Link>
                </div>
              </div>

              {/* Business Plan */}
              <div className="flex flex-col p-8 bg-secondary rounded-lg border border-border/40 h-full">
                <div>
                  <h3 className="text-xl font-bold">Business</h3>
                  <div className="mt-4 text-4xl font-bold">$49</div>
                  <p className="text-muted-foreground mt-2">Per month</p>
                  <ul className="mt-8 space-y-4">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Everything in Pro</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Team collaboration (up to 5 users)</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Brand asset management</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Advanced analytics</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Batch processing</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>API access</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-primary mr-2 mt-0.5 shrink-0" />
                      <span>Dedicated account manager</span>
                    </li>
                  </ul>
                </div>
                <div className="mt-8 pt-8 border-t border-border/40">
                  <Link href="/signup">
                    <Button variant="outline" className="w-full">
                      Contact Sales
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Comparison */}
        <section className="py-20 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text">Compare Plan Features</h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Find the plan that best suits your needs
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-border/40">
                    <th className="py-4 px-6 text-left font-medium text-muted-foreground">Features</th>
                    <th className="py-4 px-6 text-center font-medium">Free</th>
                    <th className="py-4 px-6 text-center font-medium">Pro</th>
                    <th className="py-4 px-6 text-center font-medium">Business</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-border/40">
                    <td className="py-4 px-6 text-left">Ad Generations</td>
                    <td className="py-4 px-6 text-center">5 per account</td>
                    <td className="py-4 px-6 text-center">Unlimited</td>
                    <td className="py-4 px-6 text-center">Unlimited</td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-4 px-6 text-left">Aspect Ratios</td>
                    <td className="py-4 px-6 text-center">Basic (3)</td>
                    <td className="py-4 px-6 text-center">All</td>
                    <td className="py-4 px-6 text-center">All + Custom</td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-4 px-6 text-left">Image Upload</td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-4 px-6 text-left">Team Members</td>
                    <td className="py-4 px-6 text-center">1</td>
                    <td className="py-4 px-6 text-center">1</td>
                    <td className="py-4 px-6 text-center">Up to 5</td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-4 px-6 text-left">Brand Asset Management</td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-4 px-6 text-left">Analytics</td>
                    <td className="py-4 px-6 text-center">Basic</td>
                    <td className="py-4 px-6 text-center">Advanced</td>
                    <td className="py-4 px-6 text-center">Enterprise</td>
                  </tr>
                  <tr className="border-b border-border/40">
                    <td className="py-4 px-6 text-left">API Access</td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <X className="h-5 w-5 text-muted-foreground mx-auto" />
                    </td>
                    <td className="py-4 px-6 text-center">
                      <Check className="h-5 w-5 text-primary mx-auto" />
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 px-6 text-left">Support</td>
                    <td className="py-4 px-6 text-center">Email</td>
                    <td className="py-4 px-6 text-center">Priority Email</td>
                    <td className="py-4 px-6 text-center">Dedicated Manager</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Everything you need to know about our pricing and plans
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 max-w-5xl mx-auto">
              <div className="bg-secondary p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold mb-3">Can I switch plans later?</h3>
                <p className="text-muted-foreground">
                  Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes will take effect at the
                  start of your next billing cycle.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold mb-3">Do you offer refunds?</h3>
                <p className="text-muted-foreground">
                  We offer a 7-day money-back guarantee for all paid plans. If you're not satisfied, contact our support
                  team within 7 days of your purchase.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold mb-3">What payment methods do you accept?</h3>
                <p className="text-muted-foreground">
                  We accept all major credit cards, including Visa, Mastercard, and American Express. We also support
                  PayPal for business accounts.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold mb-3">Do you offer custom enterprise plans?</h3>
                <p className="text-muted-foreground">
                  Yes, for larger teams or specific requirements, we offer custom enterprise plans. Contact our sales
                  team to discuss your needs.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold mb-3">What happens after I use my 5 free generations?</h3>
                <p className="text-muted-foreground">
                  After using your 5 free generations, you'll need to upgrade to a paid plan to continue creating ads.
                  Your existing ads will remain accessible in your library.
                </p>
              </div>

              <div className="bg-secondary p-6 rounded-lg border border-border/40">
                <h3 className="text-lg font-bold mb-3">Can I cancel anytime?</h3>
                <p className="text-muted-foreground">
                  Yes, you can cancel your subscription at any time. You'll continue to have access to your plan until
                  the end of your current billing period.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="bg-background p-8 md:p-12 rounded-lg border border-border/40 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto mb-8">
                Try AdCreator AI for free and see how it can transform your ad creation process.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base w-full sm:w-auto">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/features">
                  <Button variant="outline" className="px-8 py-6 rounded-md text-base w-full sm:w-auto">
                    Explore Features
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold">
            <span className="text-primary">AdCreator</span>
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
