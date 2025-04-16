"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface AnimatedFeatureCardProps {
  icon: ReactNode
  title: string
  description: string
  className?: string
}

export function AnimatedFeatureCard({ icon, title, description, className }: AnimatedFeatureCardProps) {
  return (
    <motion.div
      className={cn(
        "bg-background p-8 rounded-lg border border-border/40 transition-all duration-300 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5 }}
    >
      <motion.div
        className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6"
        whileHover={{ rotate: 5, scale: 1.1 }}
        transition={{ type: "spring", stiffness: 400, damping: 10 }}
      >
        {icon}
      </motion.div>
      <h3 className="text-xl font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  )
}
