"use client"

import { motion } from "framer-motion"

export function FloatingElements() {
  const elements = [
    { id: 1, icon: "✨", x: "10%", y: "20%", delay: 0 },
    { id: 2, icon: "🎯", x: "85%", y: "15%", delay: 0.5 },
    { id: 3, icon: "📱", x: "75%", y: "60%", delay: 1 },
    { id: 4, icon: "💡", x: "15%", y: "70%", delay: 1.5 },
    { id: 5, icon: "🚀", x: "50%", y: "85%", delay: 2 },
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {elements.map((element) => (
        <motion.div
          key={element.id}
          className="absolute text-2xl opacity-30"
          style={{ left: element.x, top: element.y }}
          initial={{ opacity: 0, y: 20 }}
          animate={{
            opacity: 0.3,
            y: 0,
            transition: { delay: element.delay, duration: 1 },
          }}
        >
          <motion.div
            animate={{
              y: [0, -10, 0],
              rotate: [0, 5, 0, -5, 0],
            }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 5,
              ease: "easeInOut",
            }}
          >
            {element.icon}
          </motion.div>
        </motion.div>
      ))}
    </div>
  )
}
