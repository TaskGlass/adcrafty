"use client"

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

  return (
    <div className="w-full overflow-hidden">
      <div className="flex space-x-12 py-4">
        {logos.map((logo, index) => (
          <div key={index} className="flex-shrink-0 h-8 w-24 relative">
            <img
              src={logo || "/placeholder.svg"}
              alt={`Brand logo ${index + 1}`}
              className="h-full w-full object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
        {/* Duplicate logos for continuous scrolling effect */}
        {logos.map((logo, index) => (
          <div key={`duplicate-${index}`} className="flex-shrink-0 h-8 w-24 relative">
            <img
              src={logo || "/placeholder.svg"}
              alt={`Brand logo ${index + 1}`}
              className="h-full w-full object-contain opacity-60 hover:opacity-100 transition-opacity"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
