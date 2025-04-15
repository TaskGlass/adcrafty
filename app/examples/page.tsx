import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export default function ExamplesPage() {
  // Sample ad examples with realistic images
  const adExamples = [
    {
      id: 1,
      title: "E-commerce Product Showcase",
      description: "Perfect for showcasing products with clean backgrounds and compelling visuals.",
      prompt:
        "A sleek smartphone displayed on a minimalist white surface with soft lighting, showing a shopping app interface with colorful product cards.",
      imageUrl: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?q=80&w=600&h=600&auto=format&fit=crop",
      aspectRatio: "1:1",
    },
    {
      id: 2,
      title: "Fashion Brand Story",
      description: "Ideal for fashion brands looking to create an emotional connection.",
      prompt:
        "A stylish model wearing elegant clothing walking down a Parisian street at sunset, with soft bokeh lights in the background.",
      imageUrl: "https://images.unsplash.com/photo-1581044777550-4cfa60707c03?q=80&w=600&h=750&auto=format&fit=crop",
      aspectRatio: "4:5",
    },
    {
      id: 3,
      title: "Lead Generation Ad",
      description: "Designed to capture attention and drive form submissions.",
      prompt:
        "A professional business meeting with diverse team members collaborating around a modern conference table with digital screens showing growth charts.",
      imageUrl: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?q=80&w=600&h=600&auto=format&fit=crop",
      aspectRatio: "1:1",
    },
    {
      id: 4,
      title: "App Install Campaign",
      description: "Showcase your app's features and benefits to drive installs.",
      prompt:
        "A person holding a smartphone with a fitness app open, showing workout statistics and progress charts, with a subtle gym background.",
      imageUrl: "https://images.unsplash.com/photo-1605296867304-46d5465a13f1?q=80&w=600&h=1067&auto=format&fit=crop",
      aspectRatio: "9:16",
    },
    {
      id: 5,
      title: "Restaurant Promotion",
      description: "Highlight delicious food and ambiance to attract diners.",
      prompt:
        "A beautifully plated gourmet dish with vibrant colors on a rustic wooden table, with soft restaurant lighting and elegant table setting in the background.",
      imageUrl: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1067&h=600&auto=format&fit=crop",
      aspectRatio: "16:9",
    },
    {
      id: 6,
      title: "Travel Destination",
      description: "Inspire wanderlust and travel bookings with stunning visuals.",
      prompt:
        "A breathtaking beach sunset view with palm trees, crystal clear turquoise water, and a small beachfront resort with overwater bungalows in the distance.",
      imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=600&h=600&auto=format&fit=crop",
      aspectRatio: "1:1",
    },
  ]

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
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link href="/examples" className="text-sm font-medium text-foreground hover:text-primary transition-colors">
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
        <section className="py-12 md:py-16 bg-background hero-gradient">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center space-y-4 text-center mb-12">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl gradient-text">
                  Ad Examples
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  See what you can create with AdCreator AI. These examples showcase the quality and variety of ads you
                  can generate.
                </p>
              </div>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {adExamples.map((example) => (
                <div
                  key={example.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-border/40 bg-secondary"
                >
                  <div className="relative">
                    <img
                      src={example.imageUrl || "/placeholder.svg"}
                      alt={example.title}
                      className="object-cover w-full h-64"
                    />
                    <div className="absolute top-2 right-2">
                      <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">{example.aspectRatio}</span>
                    </div>
                  </div>
                  <div className="flex flex-col flex-1 p-4 space-y-2">
                    <h3 className="text-lg font-semibold">{example.title}</h3>
                    <p className="text-sm text-muted-foreground">{example.description}</p>
                    <div className="mt-2 pt-2 border-t border-border/40">
                      <p className="text-xs text-muted-foreground font-medium">Example prompt:</p>
                      <p className="text-sm italic mt-1">{example.prompt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link href="/signup">
                <Button className="bg-primary hover:bg-primary/90">
                  Create Your Own Ads <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t border-border/40 py-8">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
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
