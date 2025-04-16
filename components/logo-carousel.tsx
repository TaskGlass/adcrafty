"use client"

import { useRef, useEffect } from "react"
import { motion } from "framer-motion"

export function LogoCarousel() {
  const logos = [
    "/logos/shopify.svg",
    "/logos/amazon.svg",
    "/logos/etsy.svg",
    "/logos/ebay.svg",
    "/logos/walmart.svg",
    "/logos/target.svg",
    "/logos/wayfair.svg",
  ]

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let animationId: number
    let scrollPosition = 0
    const scrollSpeed = 0.5

    const scroll = () => {
      if (!container) return

      scrollPosition += scrollSpeed

      // Reset position when we've scrolled the width of the first set of logos
      const firstSetWidth = container.children[0]?.clientWidth || 0
      if (scrollPosition >= firstSetWidth) {
        scrollPosition = 0
      }

      container.style.transform = `translateX(-${scrollPosition}px)`
      animationId = requestAnimationFrame(scroll)
    }

    animationId = requestAnimationFrame(scroll)

    return () => {
      cancelAnimationFrame(animationId)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden">
      <div className="relative">
        <div ref={containerRef} className="flex space-x-12 py-4" style={{ willChange: "transform" }}>
          {logos.map((logo, index) => (
            <motion.div
              key={index}
              className="flex-shrink-0 h-8 w-24 relative"
              whileHover={{ scale: 1.1, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
                src={logo || "/placeholder.svg"}
                alt={`Brand logo ${index + 1}`}
                className="h-full w-full object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
          {/* Duplicate logos for continuous scrolling effect */}
          {logos.map((logo, index) => (
            <motion.div
              key={`duplicate-${index}`}
              className="flex-shrink-0 h-8 w-24 relative"
              whileHover={{ scale: 1.1, y: -5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <img
                src={logo || "/placeholder.svg"}
                alt={`Brand logo ${index + 1}`}
                className="h-full w-full object-contain opacity-60 hover:opacity-100 transition-opacity"
              />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
