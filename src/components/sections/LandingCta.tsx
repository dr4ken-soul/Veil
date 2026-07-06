import { useRef } from 'react'
import { motion } from 'framer-motion'
import { useMagneticButton } from '../../hooks/useMagneticButton'

/**
 * LandingCta section for the Landing page.
 * Displays a full-width call-to-action panel with liquid-glass-strong styling
 * and a magnetic CTA button to route to the app interior.
 * @returns React JSX Element.
 */
export function LandingCta() {
  const buttonRef = useRef<HTMLAnchorElement | null>(null)
  const { x, y } = useMagneticButton(buttonRef)

  return (
    <section className="py-24 w-full z-10 relative">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="liquid-glass-strong rounded-[var(--radius-2xl)] p-12 md:p-20 text-center relative overflow-hidden">
          {/* Glow element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[var(--accent-glow)] rounded-full blur-[80px] pointer-events-none" />

          <h2 className="font-display font-bold text-3xl md:text-5xl text-[var(--text-primary)] mb-6 z-10 relative max-w-2xl mx-auto leading-tight">
            Wrap anything. Reveal nothing.
          </h2>

          <p className="font-body text-[var(--text-secondary)] text-sm md:text-base mb-10 z-10 relative max-w-md mx-auto">
            Start shielding your assets with Fully Homomorphic Encryption on Sepolia testnet.
          </p>

          <motion.div className="flex justify-center items-center z-10 relative">
            <motion.a
              ref={buttonRef}
              style={{ x, y }}
              href="/app/registry"
              className="inline-block font-body font-semibold text-xs tracking-wider uppercase bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] px-8 py-4 rounded-[var(--radius-md)] transition-colors no-underline cursor-pointer shadow-[var(--shadow-md)]"
            >
              Launch app
            </motion.a>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
