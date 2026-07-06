import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Copy, Check, ArrowRight } from 'lucide-react'
import { useRegistry } from '../../hooks/useRegistry'
import { useCardTilt } from '../../hooks/useCardTilt'
import { truncateAddress } from '../../lib/utils'
import { SkeletonShimmer } from '../ui/SkeletonShimmer'
import type { WrapperPair } from '../../types'

interface PreviewCardProps {
  pair: WrapperPair
}

/**
 * Preview card representing a wrapper pair.
 * Incorporates 3D card tilt, address truncation, copy buttons, and standard tags.
 * @param props - The wrapper pair data.
 * @returns React JSX Element.
 */
function PreviewCard({ pair }: PreviewCardProps) {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave } = useCardTilt()
  const [copiedErc20, setCopiedErc20] = useState(false)
  const [copiedFhe, setCopiedFhe] = useState(false)

  /**
   * Copies text to clipboard and flashes a checkmark icon.
   * @param text - The address hex string.
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
      className="p-6 rounded-[var(--radius-lg)] bg-[var(--bg-surface)] border border-[var(--border-default)] hover:border-[var(--accent-dim)] transition-colors duration-300"
      style={{ perspective: 1000 }}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="flex flex-col h-full justify-between"
      >
        <div>
          {/* Header info */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h4 className="font-display font-semibold text-lg text-[var(--text-primary)]">
                {pair.name}
              </h4>
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

          {/* Contract Addresses */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center text-xs">
              <span className="font-body text-[var(--text-secondary)]">ERC-20:</span>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-[var(--text-primary)]">
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
                <span className="font-mono text-[var(--accent)]">
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

        {/* Action button */}
        <Link
          to={`/app/wrap?pair=${pair.wrapperAddress}`}
          className="mt-2 flex items-center justify-center space-x-2 w-full py-2.5 rounded-[var(--radius-md)] border border-[var(--accent-dim)] bg-transparent hover:bg-[var(--accent-glow)] text-[var(--accent)] text-xs font-semibold uppercase tracking-wider transition-all duration-300 no-underline cursor-pointer"
        >
          <span>Wrap Asset</span>
          <ArrowRight size={12} />
        </Link>
      </motion.div>
    </div>
  )
}

/**
 * RegistryPreview section for the Landing page.
 * Displays the first 6 pairs loaded from the registry or skeleton cards if loading.
 * @returns React JSX Element.
 */
export function RegistryPreview() {
  const { pairs, isLoading, error } = useRegistry()

  // Display only the first 6 pairs for the landing page preview
  const previewPairs = pairs.slice(0, 6)

  return (
    <section className="py-24 z-10 relative w-full">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
          <div>
            <h2 className="font-display font-bold text-3xl md:text-5xl text-[var(--text-primary)] mb-4">
              Wrapper Registry
            </h2>
            <p className="font-body text-[var(--text-secondary)] max-w-2xl mr-8">
              Surfacing on-chain confidential assets registered on Sepolia. Convert standard ERC-20 tokens to FHE shielded tokens.
            </p>
          </div>
          <Link
            to="/app/registry"
            className="inline-flex items-center space-x-2 text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors no-underline font-body text-sm font-semibold mt-4 md:mt-0 shrink-0"
          >
            <span>View all pairs</span>
            <ArrowRight size={14} />
          </Link>
        </div>

        {error ? (
          <div className="text-center py-12 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)]">
            <p className="text-[var(--error)] font-body">
              Could not read registry. Check your connection and try again.
            </p>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, idx) => (
              <SkeletonShimmer key={idx} className="h-56" />
            ))}
          </div>
        ) : previewPairs.length === 0 ? (
          <div className="text-center py-12 border border-[var(--border-default)] rounded-[var(--radius-lg)] bg-[var(--bg-surface)]">
            <p className="text-[var(--text-secondary)] font-body">
              No pairs found. The registry may still be loading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {previewPairs.map((pair) => (
              <PreviewCard key={pair.wrapperAddress} pair={pair} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
