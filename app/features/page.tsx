import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Wand2, LayoutGrid, Palette, ImageIcon, Clock, Zap } from "lucide-react"

export default function FeaturesPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="border-b border-border/40 py-4">
        <div className="container flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <span className="text-primary text-2xl">AdCrafty</span>
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/features" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
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
                  Powerful Features for <br />
                  All Your Visual Content Needs
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl mt-6">
                  Create ads, social media posts, stock photos, and product images with advanced AI - all within a few
                  clicks
                </p>
              </div>
              <div className="mt-8">
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base">
                    Start Free Trial <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Main Features */}
        <section className="py-20 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Wand2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">AI-Powered Generation</h3>
                <p className="text-muted-foreground">
                  Create professional ads with just a text prompt. Our AI understands your requirements and generates
                  high-quality visuals that match your brand.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <LayoutGrid className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Multiple Aspect Ratios</h3>
                <p className="text-muted-foreground">
                  Generate ads in all standard sizes for Meta and Google platforms. Create once and adapt to all
                  required formats automatically.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Brand Consistency</h3>
                <p className="text-muted-foreground">
                  Maintain your brand identity across all ads. Our AI ensures consistent colors, styles, and messaging
                  that align with your brand guidelines.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Product Photography</h3>
                <p className="text-muted-foreground">
                  Create professional product images for your e-commerce store without expensive photoshoots. Generate
                  consistent, high-quality product visuals that boost conversion rates.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <Clock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Time-Saving</h3>
                <p className="text-muted-foreground">
                  Create multiple ad variations in minutes, not hours. Reduce your design time by 90% while maintaining
                  professional quality.
                </p>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <ImageIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3">Stock Photo Creation</h3>
                <p className="text-muted-foreground">
                  Generate custom stock photos for any purpose with just a text prompt. Create unique visuals without
                  expensive photoshoots or stock photo subscriptions.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                How AdCrafty Works
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Create professional ads, stock photos, and social media content in three simple steps
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              <div className="bg-secondary p-8 rounded-lg border border-border/40 h-full flex flex-col relative">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Describe Your Content</h3>
                <p className="text-muted-foreground flex-grow">
                  Enter a detailed description of what you want to create - whether it's an ad, stock photo, social
                  media post, or product image. Include key details about style and content.
                </p>
              </div>

              <div className="bg-secondary p-8 rounded-lg border border-border/40 h-full flex flex-col relative">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Select Formats</h3>
                <p className="text-muted-foreground flex-grow">
                  Choose the aspect ratios and platforms for your ad. Generate multiple formats simultaneously to save
                  time.
                </p>
              </div>

              <div className="bg-secondary p-8 rounded-lg border border-border/40 h-full flex flex-col relative">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Generate & Download</h3>
                <p className="text-muted-foreground flex-grow">
                  Our AI generates your ads in seconds. Review, download, and use them directly in your marketing
                  campaigns.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Advanced Features */}
        <section className="py-20 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                Advanced AI Features
              </h2>
              <p className="mt-4 text-muted-foreground md:text-lg max-w-3xl mx-auto">
                Powered by cutting-edge artificial intelligence for all your visual content needs
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              <div className="bg-background p-8 rounded-lg border border-border/40">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Unlimited Generations</h3>
                    <p className="text-muted-foreground">
                      Create as many ads as you need without limitations. Perfect for agencies and marketing teams with
                      high-volume requirements.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background p-8 rounded-lg border border-border/40">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Website Product Images</h3>
                    <p className="text-muted-foreground">
                      Create professional product images for your e-commerce store or website. Generate consistent,
                      high-quality visuals that boost conversion rates.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background p-8 rounded-lg border border-border/40">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Batch Processing</h3>
                    <p className="text-muted-foreground">
                      Generate multiple ad variations at once. Create different messaging and visuals for A/B testing
                      your campaigns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-background p-8 rounded-lg border border-border/40">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                    <Zap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold mb-2">Advanced Analytics</h3>
                    <p className="text-muted-foreground">
                      Track which ads perform best and gain insights into your creative process. Optimize your ad
                      creation strategy over time.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Link href="/pricing">
                <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base">
                  View Pricing Plans <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-background">
          <div className="container px-4 md:px-6">
            <div className="bg-secondary p-8 md:p-12 rounded-lg border border-border/40 text-center">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl gradient-text mb-4">
                Ready to Transform Your Content Creation?
              </h2>
              <p className="text-muted-foreground md:text-lg max-w-2xl mx-auto mb-8">
                Join thousands of marketers who are saving time and creating better ads, social media posts, stock
                photos, and product images with AdCrafty AI.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-md text-base w-full sm:w-auto">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/examples">
                  <Button variant="outline" className="px-8 py-6 rounded-md text-base w-full sm:w-auto">
                    View Examples
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
            <span className="text-primary">AdCrafty</span>
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
