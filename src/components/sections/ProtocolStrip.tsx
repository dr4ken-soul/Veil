import { motion } from 'framer-motion'

/**
 * ProtocolStrip section for the Landing page.
 * Displays three information columns detailing FHE Encryption, the ERC-7984 Standard,
 * and EIP-712 Decryption. Uses scroll-triggered animations.
 * @returns React JSX Element.
 */
export function ProtocolStrip() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const childVariants = {
    hidden: { opacity: 0, y: 30, filter: 'blur(4px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  return (
    <section className="py-20 border-y border-[var(--border-subtle)] bg-[var(--bg-secondary)] relative z-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-12"
      >
        {/* Column 1: FHE */}
        <motion.div
          variants={childVariants}
          className="flex flex-col items-start text-left px-6 md:border-r border-[var(--border-subtle)]"
        >
          <h3 className="font-display font-semibold text-lg md:text-xl text-[var(--accent)] mb-4">
            FHE encryption
          </h3>
          <p className="font-body font-normal text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm">
            Your balance becomes an encrypted integer only you can decrypt.
          </p>
        </motion.div>

        {/* Column 2: ERC-7984 */}
        <motion.div
          variants={childVariants}
          className="flex flex-col items-start text-left px-6 md:border-r border-[var(--border-subtle)]"
        >
          <h3 className="font-display font-semibold text-lg md:text-xl text-[var(--text-primary)] mb-4">
            ERC-7984 standard
          </h3>
          <p className="font-body font-normal text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm">
            Every wrapper pair is registered on-chain and readable by anyone.
          </p>
        </motion.div>

        {/* Column 3: EIP-712 */}
        <motion.div
          variants={childVariants}
          className="flex flex-col items-start text-left px-6"
        >
          <h3 className="font-display font-semibold text-lg md:text-xl text-[var(--accent)] mb-4">
            EIP-712 decryption
          </h3>
          <p className="font-body font-normal text-sm md:text-base text-[var(--text-secondary)] leading-relaxed max-w-sm">
            A signed permit unlocks your balance client-side without touching the chain.
          </p>
        </motion.div>
      </motion.div>
    </section>
  )
}
