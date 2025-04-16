"use client"

import Link from "next/link"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Zap, Layout, Library } from "lucide-react"
import { motion } from "framer-motion"
import { ParticlesBackground } from "@/components/ui/particles-background"
import { AnimatedFeatureCard } from "@/components/ui/animated-feature-card"
import { PricingToggle } from "@/components/ui/pricing-toggle"
import { FloatingElements } from "@/components/ui/floating-elements"
import { LogoCarousel } from "@/components/logo-carousel"

export default function Home() {
  const [isYearly, setIsYearly] = useState(false)

  // Pricing data with monthly and yearly options
  const pricingPlans = [
    {
      name: "Free",
      price: { monthly: 0, yearly: 0 },
      description: "Forever free",
      features: ["3 ad generations per month", "3 downloads per month", "Basic aspect ratios"],
    },
    {
      name: "Pro",
      price: { monthly: 19, yearly: 180 }, // 15/mo when paid yearly (20% discount)
      description: isYearly ? "Per year" : "Per month",
      popular: true,
      features: ["50 ad generations per month", "50 downloads per month", "All aspect ratios"],
    },
    {
      name: "Business",
      price: { monthly: 49, yearly: 468 }, // 39/mo when paid yearly (20% discount)
      description: isYearly ? "Per year" : "Per month",
      features: ["Unlimited ad generations", "Unlimited downloads", "Team collaboration"],
    },
  ]

  return (
    <div className="flex flex-col min-h-screen bg-background relative">
      {/* Particles Background */}
      <ParticlesBackground />

      {/* Noise Texture Overlay */}
      <div className="noise-overlay" />

      <header className="border-b border-border/40 py-4 relative z-10">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl transition-colors hover:text-primary">
            <motion.span
              className="text-primary text-2xl"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              AdCreatify
            </motion.span>
          </Link>
          <motion.nav
            className="hidden md:flex items-center gap-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
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
          </motion.nav>
          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link href="/login">
              <Button variant="ghost" size="sm" className="hidden md:flex">
                Login
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm" className="bg-primary hover:bg-primary/90 glow">
                Sign Up
              </Button>
            </Link>
          </motion.div>
        </div>
      </header>

      <main className="flex-1 relative z-10">
        {/* Hero Section */}
        <section className="relative py-20 md:py-32 overflow-hidden hero-gradient">
          <FloatingElements />
          <div className="container px-4 md:px-6 relative z-10">
            <motion.div
              className="flex flex-col items-center space-y-4 text-center max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
            >
              <div className="space-y-2">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl gradient-text pb-1">
                  The Complete <br />
                  Ad Creation Platform
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
                  Generate professional static image ads for Meta and Google in seconds. Try it now - no signup
                  required!
                </p>
              </div>
              <motion.div
                className="mt-16 flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.7 }}
              >
                <Link href="/dashboard">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base w-full sm:w-auto glow">
                    Try Now - No Signup <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button variant="outline" className="px-8 py-6 rounded-md text-base w-full sm:w-auto">
                    Get Started
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>

          {/* Product Screenshot */}
          <motion.div
            className="mt-16 md:mt-20 max-w-6xl mx-auto px-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <div className="relative rounded-lg overflow-hidden border border-border/40 shadow-2xl animated-border">
              <div className="absolute top-0 left-0 right-0 h-8 bg-secondary flex items-center px-3 gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/70"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/70"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/70"></div>
              </div>
              <div className="pt-8">
                <img
                  src="/images/dashboard-screenshot.png"
                  alt="AdCreatify Dashboard Interface"
                  className="w-full h-auto"
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-20 md:py-32 bg-secondary relative overflow-hidden">
          <div className="container px-4 md:px-6">
            <motion.div
              className="text-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text pb-1">
                Create Stunning Ads in Minutes
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Our AI-powered platform makes it easy to create professional ads for any platform.
              </p>
            </motion.div>

            <div className="grid gap-8 md:grid-cols-3">
              <AnimatedFeatureCard
                icon={<Zap className="h-6 w-6 text-primary" />}
                title="No Signup Required"
                description="Try the tool instantly without creating an account. Sign up later to save your creations."
              />

              <AnimatedFeatureCard
                icon={<Layout className="h-6 w-6 text-primary" />}
                title="All Standard Formats"
                description="Automatically generate ads in all common aspect ratios for Meta and Google."
              />

              <AnimatedFeatureCard
                icon={<Library className="h-6 w-6 text-primary" />}
                title="Ad Library"
                description="Access your history of created ads anytime in your personal library."
              />
            </div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href="/features">
                <Button className="bg-primary hover:bg-primary/90 text-white px-6 py-2 rounded-md glow">
                  Explore All Features <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 md:py-32 bg-background">
          <div className="container px-4 md:px-6">
            <motion.div
              className="flex flex-col items-center justify-center space-y-4 text-center mb-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text pb-1">
                  Simple, Transparent Pricing
                </h2>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-lg">
                  Start with 3 free generations. Upgrade when you're ready.
                </p>
              </div>
            </motion.div>

            <PricingToggle onToggle={setIsYearly} />

            <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
              {pricingPlans.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  className={`flex flex-col p-8 bg-secondary rounded-lg ${
                    plan.popular ? "border-2 border-primary relative" : "border border-border/40"
                  }`}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                  whileHover={{ y: -5 }}
                >
                  {plan.popular && (
                    <div className="absolute top-0 right-0 transform translate-x-2 -translate-y-2">
                      <span className="bg-primary text-white text-xs font-bold px-3 py-1 rounded-full">POPULAR</span>
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="mt-4 text-3xl font-bold">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                      {plan.price.monthly === 0 && ""}
                    </div>
                    <p className="text-muted-foreground mt-2">{plan.description}</p>
                    <ul className="mt-6 space-y-3">
                      {plan.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          className="flex items-center"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }}
                        >
                          <div className="w-4 h-4 bg-primary/20 rounded-full mr-3 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          </div>
                          <span>{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-8">
                    <Link href={plan.name === "Free" ? "/dashboard" : "/signup"}>
                      <Button
                        variant={plan.popular ? "default" : "outline"}
                        className={`w-full ${plan.popular ? "bg-primary hover:bg-primary" : "outline"} `}
                      >
                        Get Started
                      </Button>
                    </Link>
                  </div>
                </motion.div>
              ))}
            </div>

            <motion.div
              className="mt-12 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href="/pricing">
                <Button variant="outline" className="px-6 py-2 rounded-md">
                  View Full Pricing Details <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="py-16 bg-secondary/90 border-t border-border/40">
          <div className="container px-4 md:px-6">
            <motion.p
              className="text-center text-sm text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Loved by 1,000+ Brands & Agencies
            </motion.p>
            <LogoCarousel />
          </div>
        </section>
      </main>

      <footer className="border-t border-border/40 py-8 relative z-10">
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
