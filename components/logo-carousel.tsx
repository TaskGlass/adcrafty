"use client"

import { useEffect, useRef } from "react"
import Image from "next/image"

// Define the logos with their names and paths
const logos = [
  { name: "Shopify", path: "/logos/shopify.svg" },
  { name: "Amazon", path: "/logos/amazon.svg" },
  { name: "Etsy", path: "/logos/etsy.svg" },
  { name: "eBay", path: "/logos/ebay.svg" },
  { name: "Walmart", path: "/logos/walmart.svg" },
  { name: "Target", path: "/logos/target.svg" },
  { name: "Wayfair", path: "/logos/wayfair.svg" },
  { name: "Best Buy", path: "/logos/bestbuy.svg" },
  { name: "Nike", path: "/logos/nike.svg" },
  { name: "Adidas", path: "/logos/adidas.svg" },
  { name: "Zara", path: "/logos/zara.svg" },
  { name: "H&M", path: "/logos/hm.svg" },
]

export function LogoCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollContainer = scrollRef.current
    if (!scrollContainer) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5 // pixels per frame

    const scroll = () => {
      if (!scrollContainer) return

      scrollPosition += scrollSpeed

      // Reset position when we've scrolled the width of one logo set
      if (scrollPosition >= scrollContainer.firstElementChild?.clientWidth || 0) {
        scrollPosition = 0
      }

      scrollContainer.style.transform = `translateX(-${scrollPosition}px)`
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  // Duplicate the logos to create a seamless loop
  const allLogos = [...logos, ...logos]

  return (
    <div className="overflow-hidden w-full">
      <div ref={scrollRef} className="flex items-center">
        <div className="flex items-center gap-16 px-8">
          {allLogos.map((logo, index) => (
            <div
              key={`${logo.name}-${index}`}
              className="flex-shrink-0 h-8 w-32 relative flex items-center justify-center"
            >
              <Image
                src={logo.path || "/placeholder.svg"}
                alt={`${logo.name} logo`}
                width={120}
                height={32}
                className="object-contain opacity-70 hover:opacity-100 transition-opacity filter invert brightness-75"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
