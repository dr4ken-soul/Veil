import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useConnect, useAccount } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { X, Wallet, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface WalletConnectModalProps {
  isOpen: boolean
  onClose: () => void
  /** Redirect destination after successful connection. Defaults to /app/registry */
  redirectTo?: string
}

type ConnectionStep = 'idle' | 'connecting' | 'success' | 'error'

/**
 * WalletConnectModal is a glass-morphism modal that orchestrates the wallet
 * connection flow with three visible states: connecting, success, and error.
 * On success it briefly shows a confirmation state then navigates to the app.
 * @param props - isOpen, onClose, optional redirectTo destination.
 * @returns AnimatePresence-driven modal overlay or null.
 */
export function WalletConnectModal({ isOpen, onClose, redirectTo = '/app/registry' }: WalletConnectModalProps) {
  const navigate = useNavigate()
  const { isConnected } = useAccount()
  const { connect, isPending, isError, error, reset } = useConnect()
  const stepRef = useRef<ConnectionStep>('idle')

  // Determine current display step
  let step: ConnectionStep = 'idle'
  if (isPending) step = 'connecting'
  else if (isError) step = 'error'
  else if (isConnected && isOpen) step = 'success'

  // On success: wait briefly then close + navigate
  useEffect(() => {
    if (step === 'success') {
      const timer = setTimeout(() => {
        onClose()
        navigate(redirectTo, { replace: true })
      }, 900)
      return () => clearTimeout(timer)
    }
  }, [step, navigate, onClose, redirectTo])

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && step !== 'connecting') {
        onClose()
        reset()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, step, onClose, reset])

  const handleConnect = () => {
    reset()
    connect({ connector: injected() })
  }

  const handleBackdropClick = () => {
    if (step === 'connecting') return // don't close while pending
    onClose()
    reset()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Modal panel */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-6 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-sm liquid-glass-strong rounded-[var(--radius-xl)] p-8 relative"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button — hidden while connecting */}
              {step !== 'connecting' && step !== 'success' && (
                <button
                  onClick={() => { onClose(); reset() }}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-[var(--radius-md)] text-[var(--text-muted)] hover:text-[var(--text-secondary)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                  aria-label="Close"
                >
                  <X size={16} />
                </button>
              )}

              {/* ── Idle / initial state ── */}
              <AnimatePresence mode="wait">
                {step === 'idle' && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--accent-glow)] border border-[var(--border-default)] flex items-center justify-center">
                      <Wallet size={24} className="text-[var(--accent)]" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-xl text-[var(--text-primary)] mb-2">
                        Connect Wallet
                      </h2>
                      <p className="font-body text-sm text-[var(--text-secondary)] leading-relaxed">
                        Connect your wallet to access the Veil app and start wrapping tokens with FHE encryption.
                      </p>
                    </div>
                    <button
                      onClick={handleConnect}
                      className="w-full py-3.5 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] font-body font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer border-none shadow-[var(--shadow-md)]"
                    >
                      Connect MetaMask
                    </button>
                    <p className="font-body text-xs text-[var(--text-muted)]">
                      By connecting you confirm you are on Sepolia testnet.
                    </p>
                  </motion.div>
                )}

                {/* ── Connecting state ── */}
                {step === 'connecting' && (
                  <motion.div
                    key="connecting"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center gap-6 py-4"
                  >
                    <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[var(--accent-glow)] border border-[var(--border-default)] flex items-center justify-center">
                      <Loader2 size={24} className="text-[var(--accent)] animate-spin" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-xl text-[var(--text-primary)] mb-2">
                        Waiting for approval
                      </h2>
                      <p className="font-body text-sm text-[var(--text-secondary)]">
                        Check your MetaMask extension and approve the connection request.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── Success state ── */}
                {step === 'success' && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex flex-col items-center text-center gap-6 py-4"
                  >
                    <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[rgba(34,197,94,0.12)] border border-[rgba(34,197,94,0.2)] flex items-center justify-center">
                      <CheckCircle size={24} className="text-[var(--success)]" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-xl text-[var(--text-primary)] mb-2">
                        Wallet connected
                      </h2>
                      <p className="font-body text-sm text-[var(--text-secondary)]">
                        Entering Veil…
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ── Error state ── */}
                {step === 'error' && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center text-center gap-6"
                  >
                    <div className="w-14 h-14 rounded-[var(--radius-lg)] bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center">
                      <AlertCircle size={24} className="text-[var(--error)]" />
                    </div>
                    <div>
                      <h2 className="font-display font-semibold text-xl text-[var(--text-primary)] mb-2">
                        Connection failed
                      </h2>
                      <p className="font-body text-sm text-[var(--text-secondary)] leading-relaxed">
                        {error?.message?.includes('rejected')
                          ? 'You rejected the connection request. Try again when ready.'
                          : error?.message ?? 'Something went wrong. Make sure MetaMask is installed and unlocked.'}
                      </p>
                    </div>
                    <button
                      onClick={handleConnect}
                      className="w-full py-3.5 rounded-[var(--radius-md)] bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] font-body font-semibold text-sm tracking-wider uppercase transition-colors cursor-pointer border-none shadow-[var(--shadow-md)]"
                    >
                      Try Again
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
