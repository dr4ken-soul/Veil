import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useMagneticButton } from '../../hooks/useMagneticButton'

/**
 * Hero section for the Landing page.
 * Features the centered wordmark, tagline, and a magnetic Launch App CTA button.
 * Elements enter via a staggered blur-in sequence.
 * @returns React JSX Element.
 */
export function Hero() {
  const buttonRef = useRef<HTMLAnchorElement | null>(null)
  const { x, y } = useMagneticButton(buttonRef)

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  }

  const childVariants = {
    hidden: { opacity: 0, filter: 'blur(8px)', y: 20 },
    visible: {
      opacity: 1,
      filter: 'blur(0px)',
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative min-h-screen flex flex-col justify-center items-center text-center px-6 z-10"
    >
      {/* Wordmark */}
      <motion.h1
        variants={childVariants}
        className="font-display font-bold text-6xl md:text-8xl tracking-tight text-[var(--text-primary)] mb-4"
      >
        Veil
      </motion.h1>

      {/* Tagline */}
      <motion.p
        variants={childVariants}
        className="font-body font-light text-lg md:text-2xl text-[var(--text-secondary)] tracking-wide mb-10 max-w-xl"
      >
        Wrap anything. Reveal nothing.
      </motion.p>

      {/* Magnetic CTA Button */}
      <motion.div variants={childVariants} className="flex justify-center items-center">
        <motion.a
          ref={buttonRef}
          style={{ x, y }}
          href="/app/registry"
          className="inline-block font-body font-semibold text-sm tracking-wider uppercase bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] px-8 py-4 rounded-[var(--radius-md)] transition-colors no-underline cursor-pointer shadow-[var(--shadow-md)]"
        >
          Launch app
        </motion.a>
      </motion.div>
    </motion.section>
  )
}
