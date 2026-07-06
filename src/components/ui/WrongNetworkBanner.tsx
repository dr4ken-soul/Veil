import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useChainId, useSwitchChain } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { AlertTriangle, ArrowRight } from 'lucide-react'

/**
 * WrongNetworkBanner renders a persistent full-width warning banner when the
 * connected wallet is on a chain other than Sepolia (chain 11155111).
 * Shows a one-click "Switch to Sepolia" button that triggers the wallet prompt.
 * Disappears when the wallet is on the correct chain or not connected.
 * @returns AnimatePresence-driven banner or null.
 */
export function WrongNetworkBanner() {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending } = useSwitchChain()

  const isWrongNetwork = isConnected && chainId !== sepolia.id

  return (
    <AnimatePresence>
      {isWrongNetwork && (
        <motion.div
          key="wrong-network"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-20 left-0 right-0 z-40 flex items-center justify-center px-4 py-2.5 bg-[rgba(239,68,68,0.08)] border-b border-[rgba(239,68,68,0.2)]"
        >
          <div className="flex items-center gap-3 max-w-7xl w-full">
            <AlertTriangle size={15} className="text-[var(--error)] shrink-0" />
            <p className="font-body text-sm text-[var(--text-primary)]">
              Your wallet is on the wrong network. Veil requires{' '}
              <span className="text-[var(--error)] font-medium">Sepolia testnet</span>.
            </p>
            <button
              onClick={() => switchChain({ chainId: sepolia.id })}
              disabled={isPending}
              className="ml-auto flex items-center gap-1.5 font-body text-xs font-semibold text-[var(--error)] border border-[rgba(239,68,68,0.35)] hover:bg-[rgba(239,68,68,0.1)] px-3 py-1.5 rounded-[var(--radius-md)] transition-colors cursor-pointer bg-transparent shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Switching…' : (
                <>
                  Switch to Sepolia
                  <ArrowRight size={11} />
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
