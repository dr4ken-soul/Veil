import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAccount } from 'wagmi'
import { useMagneticButton } from '../../hooks/useMagneticButton'

interface HeroProps {
  /** Called when Launch App is clicked while wallet is not connected. */
  onConnectClick: () => void
}

/**
 * Hero section for the Landing page.
 * Features the centered wordmark, tagline, and a magnetic Launch App CTA button.
 * If wallet is connected, Launch App navigates directly to /app/registry.
 * If not connected, Launch App opens the WalletConnectModal via onConnectClick.
 * Elements enter via a staggered blur-in sequence.
 * @param props - onConnectClick handler.
 * @returns React JSX Element.
 */
export function Hero({ onConnectClick }: HeroProps) {
  const buttonRef = useRef<HTMLButtonElement | null>(null)
  const { x, y } = useMagneticButton(buttonRef)
  const { isConnected } = useAccount()
  const navigate = useNavigate()

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

  const handleLaunch = () => {
    if (isConnected) {
      navigate('/app/registry')
    } else {
      onConnectClick()
    }
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
        className="font-body font-light text-lg md:text-2xl text-[var(--text-secondary)] tracking-wide mb-10 max-w-xl mx-auto text-center"
      >
        Wrap anything. Reveal nothing.
      </motion.p>

      {/* Magnetic CTA Button */}
      <motion.div variants={childVariants} className="flex justify-center items-center">
        <motion.button
          ref={buttonRef}
          style={{ x, y }}
          onClick={handleLaunch}
          className="inline-block font-body font-semibold text-sm tracking-wider uppercase bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] px-8 py-4 rounded-[var(--radius-md)] transition-colors cursor-pointer shadow-[var(--shadow-md)] border-none outline-none"
        >
          Launch app
        </motion.button>
      </motion.div>
    </motion.section>
  )
}
