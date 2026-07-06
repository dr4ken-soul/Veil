import { useState, useEffect } from 'react'
import { useAccount, useChainId } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { Check, Copy } from 'lucide-react'
import { useRegistry } from '../hooks/useRegistry'
import { useFaucet } from '../hooks/useFaucet'
import { AppNav } from '../components/layout/AppNav'
import { FadeIn } from '../components/ui/FadeIn'
import { WrongNetworkBanner } from '../components/ui/WrongNetworkBanner'
import { SkeletonShimmer } from '../components/ui/SkeletonShimmer'
import { truncateAddress } from '../lib/utils'
import type { WrapperPair } from '../types'

interface FaucetCardProps {
  pair: WrapperPair
}

/**
 * Faucet card representing a mock token.
 * Incorporates a claim button, countdown timer for cooldown, and addresses list.
 * @param props - The wrapper pair containing the underlying mock token.
 * @returns React JSX Element.
 */
function FaucetCard({ pair }: FaucetCardProps) {
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const isWrongNetwork = chainId !== sepolia.id
  const { claim, isClaiming, error, txHash, cooldownRemaining } = useFaucet(pair.underlyingAddress, pair.decimals)
  const [copiedAddress, setCopiedAddress] = useState(false)

  /**
   * Helper to format remaining cooldown milliseconds into readable text.
   * @param ms - Milliseconds remaining.
   * @returns String representing remaining time.
   */
  const formatCooldown = (ms: number): string => {
    const totalSecs = Math.floor(ms / 1000)
    const hours = Math.floor(totalSecs / 3600)
    const minutes = Math.floor((totalSecs % 3600) / 60)
    return `${hours}h ${minutes}m remaining`
  }

  /**
   * Copy address helper.
   * @param text - The address string.
   */
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopiedAddress(true)
    setTimeout(() => setCopiedAddress(false), 1500)
  }

  return (
    <div className="p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)] flex flex-col justify-between">
      <div>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">
              {pair.name}
            </h3>
            <span className="font-mono text-xs text-[var(--text-secondary)]">
              {pair.symbol}
            </span>
          </div>
          <span className="font-mono text-[10px] bg-[var(--accent-glow)] border border-[var(--accent-dim)] text-[var(--accent)] px-2 py-0.5 rounded-[var(--radius-sm)] uppercase tracking-wider">
            Mock
          </span>
        </div>

        {/* Mock ERC-20 Address */}
        <div className="flex justify-between items-center text-xs mb-6">
          <span className="font-body text-[var(--text-secondary)]">Token Contract:</span>
          <div className="flex items-center space-x-2">
            <span className="font-mono text-[var(--text-primary)]">
              {truncateAddress(pair.underlyingAddress)}
            </span>
            <button
              onClick={() => handleCopy(pair.underlyingAddress)}
              className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)] transition-colors bg-transparent border-none cursor-pointer"
            >
              {copiedAddress ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
            </button>
          </div>
        </div>
      </div>

      <div>
        {/* Claim Trigger Button */}
        {cooldownRemaining > 0 ? (
          <button
            disabled
            className="w-full py-3 bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-md)] border border-[var(--border-default)] cursor-not-allowed text-center"
          >
            {formatCooldown(cooldownRemaining)}
          </button>
        ) : (
          <button
            onClick={() => claim()}
            disabled={isClaiming || !isConnected || isWrongNetwork}
            className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-md)] border-none outline-none transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-[var(--shadow-sm)]"
          >
            {isClaiming ? 'Claiming...' : `Claim 1000 ${pair.symbol}`}
          </button>
        )}

        {/* Transaction confirmation feedback */}
        {txHash && cooldownRemaining > 0 && (
          <div className="mt-3 text-center">
            <p className="text-[var(--success)] text-[11px] font-semibold font-body">
              Claimed successfully!
            </p>
            <a
              href={`https://sepolia.etherscan.io/tx/${txHash}`}
              target="_blank"
              rel="noreferrer"
              className="font-mono text-[var(--accent)] hover:underline text-[10px]"
            >
              {truncateAddress(txHash)}
            </a>
          </div>
        )}

        {/* Error message */}
        {error && (
          <p className="text-[var(--error)] text-[10px] mt-2 text-center font-body">
            {error.message || 'Claim failed'}
          </p>
        )}
      </div>
    </div>
  )
}

/**
 * Faucet Page Component.
 * Surfaces all mock cToken mock contract pairs and enables direct token minting.
 * @returns React JSX Element.
 */
export default function Faucet() {
  const { pairs, isLoading, error } = useRegistry()
  const { isConnected } = useAccount()

  useEffect(() => {
    // Apply app-interior styling to the body
    document.body.classList.add('app-interior')
    return () => {
      document.body.classList.remove('app-interior')
    }
  }, [])

  // Filter registry pairs to only display mock tokens
  const mockPairs = pairs.filter((p) => p.isMock)

  return (
    <FadeIn className="min-h-screen pt-28 pb-16 bg-[var(--bg-primary)] text-[var(--text-primary)] relative z-10">
      <AppNav />
      <WrongNetworkBanner />

      <main className="max-w-7xl mx-auto px-8 md:px-16">
        {/* Page Header */}
        <div className="mb-10 text-left">
          <h1 className="font-display font-bold text-4xl text-[var(--text-primary)] mb-2 mt-0">
            Faucet
          </h1>
          <p className="font-body text-[var(--text-secondary)]">
            Claim testnet tokens to start wrapping
          </p>
        </div>

        {/* Wallet connection reminder */}
        {!isConnected && (
          <div className="mb-8 p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] flex justify-between items-center">
            <p className="font-body text-sm text-[var(--text-secondary)]">
              Connect your wallet to claim testnet mock tokens.
            </p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center py-12 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)]">
            <p className="text-[var(--error)] font-body">
              Could not read registry. Check your connection and try again.
            </p>
          </div>
        )}

        {/* Grid Loading and Render States */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, idx) => (
              <SkeletonShimmer key={idx} className="h-56" />
            ))}
          </div>
        ) : mockPairs.length === 0 ? (
          <div className="text-center py-12 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)]">
            <p className="text-[var(--text-secondary)] font-body">
              No mock token pairs found in the registry.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockPairs.map((pair) => (
              <FaucetCard key={pair.wrapperAddress} pair={pair} />
            ))}
          </div>
        )}
      </main>
    </FadeIn>
  )
}
