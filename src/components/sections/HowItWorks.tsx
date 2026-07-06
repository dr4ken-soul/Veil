import { motion } from 'framer-motion'

/**
 * HowItWorks section for the Landing page.
 * Details the three-step flow to claim, wrap, and decrypt assets.
 * Animated on scroll using stagger children.
 * @returns React JSX Element.
 */
export function HowItWorks() {
  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
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

  const steps = [
    {
      num: '01',
      title: 'Get Faucet Tokens',
      desc: 'Claim testnet tokens from the faucet to get started immediately.',
    },
    {
      num: '02',
      title: 'Wrap Assets',
      desc: 'Wrap standard ERC-20 tokens into their confidential counterparts in two clicks.',
    },
    {
      num: '03',
      title: 'Decrypt Privately',
      desc: 'Decrypt and check your wrapped balance client-side at any time.',
    },
  ]

  return (
    <section className="py-28 w-full relative z-10">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="text-center mb-16">
          <h2 className="font-display font-bold text-3xl md:text-5xl text-[var(--text-primary)] mb-4">
            How It Works
          </h2>
          <p className="font-body text-[var(--text-secondary)] max-w-lg mx-auto text-center">
            Veil simplifies the interactions with on-chain Fully Homomorphic Encryption.
          </p>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-100px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        >
          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              variants={childVariants}
              className="p-8 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-col"
            >
              <span className="font-mono font-medium text-2xl text-[var(--accent)] block mb-6">
                {step.num}
              </span>
              <h3 className="font-display font-semibold text-lg text-[var(--text-primary)] mb-3">
                {step.title}
              </h3>
              <p className="font-body text-sm text-[var(--text-secondary)] leading-relaxed">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
