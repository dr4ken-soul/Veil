import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAccount, useChainId } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { formatUnits } from 'viem'
import { Copy, Check, ArrowRight, Search } from 'lucide-react'
import { useRegistry } from '../hooks/useRegistry'
import { useCardTilt } from '../hooks/useCardTilt'
import { useDecryptBalance } from '../hooks/useDecryptBalance'
import { truncateAddress } from '../lib/utils'
import { SkeletonShimmer } from '../components/ui/SkeletonShimmer'
import { AppNav } from '../components/layout/AppNav'
import { FadeIn } from '../components/ui/FadeIn'
import { WrongNetworkBanner } from '../components/ui/WrongNetworkBanner'
import type { WrapperPair } from '../types'

interface RegistryCardProps {
  pair: WrapperPair
}

/**
 * Registry card detailing a wrapper pair.
 * Includes interactive 3D tilt, details copy buttons, and an inline decryption panel.
 * @param props - The wrapper pair metadata.
 * @returns React JSX Element.
 */
function RegistryCard({ pair }: RegistryCardProps) {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useCardTilt()
  const { balance, isLoading, error, decrypt } = useDecryptBalance(pair.wrapperAddress)
  const { isConnected } = useAccount()
  const chainId = useChainId()
  const isWrongNetwork = chainId !== sepolia.id
  const [copiedErc20, setCopiedErc20] = useState(false)
  const [copiedFhe, setCopiedFhe] = useState(false)

  /**
   * Copy address helper.
   * @param text - The address string.
   * @param setCopied - State setter to show checkmark.
   */
  const handleCopy = (text: string, setCopied: (val: boolean) => void) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--accent-dim)] transition-colors duration-300 flex flex-col justify-between"
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="flex flex-col h-full justify-between"
      >
        <div>
          {/* Title Info */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="font-display font-semibold text-lg text-[var(--text-primary)]">
                {pair.name}
              </h3>
              <span className="font-mono text-xs text-[var(--text-secondary)]">
                {pair.symbol}
              </span>
            </div>
            {pair.isMock && (
              <span className="font-mono text-[10px] bg-[var(--accent-glow)] border border-[var(--accent-dim)] text-[var(--accent)] px-2 py-0.5 rounded-[var(--radius-sm)] uppercase tracking-wider">
                Mock
              </span>
            )}
          </div>

          {/* Addresses */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="font-body text-[var(--text-secondary)]">ERC-20:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[var(--text-primary)] text-right">
                  {truncateAddress(pair.underlyingAddress)}
                </span>
                <button
                  onClick={() => handleCopy(pair.underlyingAddress, setCopiedErc20)}
                  className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)] transition-colors bg-transparent border-none cursor-pointer"
                >
                  {copiedErc20 ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="font-body text-[var(--text-secondary)]">ERC-7984:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[var(--accent)] text-right">
                  {truncateAddress(pair.wrapperAddress)}
                </span>
                <button
                  onClick={() => handleCopy(pair.wrapperAddress, setCopiedFhe)}
                  className="p-1 hover:text-[var(--accent)] text-[var(--text-secondary)] transition-colors bg-transparent border-none cursor-pointer"
                >
                  {copiedFhe ? <Check size={12} className="text-[var(--success)]" /> : <Copy size={12} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div>
          {/* Actions */}
          <Link
            to={`/app/wrap?pair=${pair.wrapperAddress}`}
            className="flex items-center justify-center space-x-2 w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--accent-dim)] bg-transparent hover:bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-semibold uppercase tracking-wider transition-all duration-300 no-underline cursor-pointer"
          >
            <span>Wrap Asset</span>
            <ArrowRight size={12} />
          </Link>

          {/* Inline Decryption Section */}
          <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
            {balance !== null ? (
              <div className="text-center py-2 bg-[var(--accent-glow)] rounded-[var(--radius-md)] border border-[var(--accent-dim)]">
                <span className="font-mono text-[10px] text-[var(--text-secondary)] block uppercase tracking-wider mb-0.5">
                  Decrypted Balance
                </span>
                <span className="font-mono font-bold text-sm text-[var(--success)]">
                  {formatUnits(balance, pair.decimals)} {pair.symbol}
                </span>
              </div>
            ) : (
              <button
                onClick={() => decrypt()}
                disabled={isLoading || !isConnected || isWrongNetwork}
                className="w-full py-2 bg-[var(--bg-elevated)] hover:bg-[var(--accent-glow)] text-[var(--text-primary)] hover:text-[var(--accent)] text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-md)] border border-[var(--border-default)] hover:border-[var(--accent-dim)] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Decrypting...' : 'Decrypt Balance'}
              </button>
            )}
            {error && (
              <span className="block text-[var(--error)] text-[10px] mt-1 text-center font-body">
                {isWrongNetwork
                  ? 'Switch to Sepolia to decrypt'
                  : error.message?.includes('rejected') || error.message?.includes('denied')
                  ? 'Signature rejected'
                  : error.message?.includes('same chain')
                  ? 'Switch to Sepolia to decrypt'
                  : 'Decryption failed — try again'}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

/**
 * Registry Page Component.
 * Lists all wrapper pairs on Sepolia with search capability and inline balance decryption.
 * @returns React JSX Element.
 */
export default function Registry() {
  const { pairs, isLoading, error } = useRegistry()
  const { isConnected } = useAccount()
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Add app-interior styling to the body element
    document.body.classList.add('app-interior')
    return () => {
      document.body.classList.remove('app-interior')
    }
  }, [])

  // Filter pairs based on search string matching name or symbol
  const filteredPairs = pairs.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.symbol.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <FadeIn className="min-h-screen pt-28 pb-16 bg-[var(--bg-primary)] text-[var(--text-primary)] relative z-10">
      <AppNav />
      <WrongNetworkBanner />

      <main className="max-w-7xl mx-auto px-8 md:px-16">
        {/* Page Title Header */}
        <div className="mb-10 text-left">
          <h1 className="font-display font-bold text-4xl text-[var(--text-primary)] mb-2 mt-0">
            Registry
          </h1>
          <p className="font-body text-[var(--text-secondary)]">
            All registered wrapper pairs on Sepolia
          </p>
        </div>

        {/* Wallet connection banner if disconnected */}
        {!isConnected && (
          <div className="mb-8 p-4 rounded-[var(--radius-md)] border border-[var(--border-default)] bg-[var(--bg-secondary)] flex justify-between items-center">
            <p className="font-body text-sm text-[var(--text-secondary)]">
              Connect your wallet to wrap assets and decrypt FHE balances.
            </p>
          </div>
        )}

        {/* Search Input */}
        <div className="relative mb-10">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--text-secondary)]">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search by name or symbol..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] pl-10 pr-4 py-3 rounded-[var(--radius-md)] border border-[var(--border-default)] focus:border-[var(--accent)] outline-none transition-colors font-body text-sm"
          />
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)]">
            <p className="text-[var(--error)] font-body">
              Could not read registry. Check your connection and try again.
            </p>
          </div>
        )}

        {/* Loading / Grid States */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonShimmer key={idx} className="h-[280px]" />
            ))}
          </div>
        ) : filteredPairs.length === 0 ? (
          <div className="text-center py-12 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)]">
            <p className="text-[var(--text-secondary)] font-body">
              No pairs found. The registry may still be loading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPairs.map((pair) => (
              <RegistryCard key={pair.wrapperAddress} pair={pair} />
            ))}
          </div>
        )}
      </main>
    </FadeIn>
  )
}
