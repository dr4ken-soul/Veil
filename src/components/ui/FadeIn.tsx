import { motion } from 'framer-motion'
import React from 'react'

interface FadeInProps {
  children: React.ReactNode
  className?: string
}

/**
 * FadeIn component to wrap pages and apply smooth entrance and exit animations
 * with opacity, blur, and vertical translation.
 * @param props - Children and optional custom class names.
 * @returns React JSX Element.
 */
export function FadeIn({ children, className = '' }: FadeInProps) {
  return (
    <motion.div
      initial={{ opacity: 0, filter: 'blur(6px)', y: 12 }}
      animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
      exit={{ opacity: 0, filter: 'blur(4px)', y: -8 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] as const }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
