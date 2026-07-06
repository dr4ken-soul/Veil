import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAccount, useDisconnect, useChainId } from 'wagmi'
import { useNavigate } from 'react-router-dom'
import { Copy, LogOut, Shield, ChevronDown, Check } from 'lucide-react'
import { truncateAddress } from '../../lib/utils'

/**
 * WalletDropdown renders the connected wallet pill in the AppNav right zone.
 * Clicking the pill opens a Veil-styled glass dropdown panel showing:
 *  - FHE shield status indicator
 *  - Full truncated address with copy-to-clipboard
 *  - Network name and active status
 *  - Disconnect button that redirects to landing
 *
 * Closes on outside click, Escape key, or after disconnect.
 * Only used inside the app interior — never on the landing page.
 * @returns React JSX Element.
 */
export function WalletDropdown() {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const chainId = useChainId()
  const navigate = useNavigate()

  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Map chainId to a human-readable name
  const networkName = chainId === 11155111
    ? 'Sepolia'
    : chainId === 1
    ? 'Ethereum'
    : `Chain ${chainId}`

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Close on Escape
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const handleDisconnect = () => {
    setOpen(false)
    disconnect()
    // ProtectedRoute will detect disconnect and redirect, but we push immediately
    // for a snappier feel
    navigate('/', { replace: true, state: { disconnected: true } })
  }

  if (!address) return null

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger pill */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 font-mono text-xs bg-[var(--bg-elevated)] border border-[var(--border-default)] hover:border-[var(--accent-dim)] px-4 py-2 rounded-[var(--radius-md)] text-[var(--text-primary)] transition-all cursor-pointer group"
        aria-expanded={open}
        aria-haspopup="true"
      >
        {/* Live green dot */}
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] shrink-0" />
        <span>{truncateAddress(address)}</span>
        <ChevronDown
          size={12}
          className={`text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="wallet-dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -6 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="absolute top-[calc(100%+10px)] right-0 w-72 liquid-glass-strong rounded-[var(--radius-lg)] overflow-hidden z-50 shadow-[var(--shadow-lg)]"
            style={{ transformOrigin: 'top right' }}
          >
            {/* Header: FHE status bar */}
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--accent-glow)] flex items-center justify-center shrink-0">
                <Shield size={13} className="text-[var(--accent)]" />
              </div>
              <div>
                <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider leading-none mb-0.5">
                  FHE Shield Active
                </p>
                <p className="font-body text-xs text-[var(--text-secondary)]">
                  Veil encryption layer ready
                </p>
              </div>
              <span className="ml-auto w-2 h-2 rounded-full bg-[var(--success)] shrink-0 shadow-[0_0_6px_var(--success)]" />
            </div>

            {/* Address row */}
            <div className="px-4 py-3 border-b border-[var(--border-subtle)]">
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider mb-1.5">
                Connected Wallet
              </p>
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-sm text-[var(--text-primary)] truncate">
                  {truncateAddress(address)}
                </span>
                <button
                  onClick={handleCopy}
                  title={copied ? 'Copied!' : 'Copy full address'}
                  className="shrink-0 w-7 h-7 flex items-center justify-center rounded-[var(--radius-sm)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-white/5 transition-colors cursor-pointer bg-transparent border-none"
                >
                  <AnimatePresence mode="wait">
                    {copied ? (
                      <motion.span
                        key="check"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Check size={13} className="text-[var(--success)]" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="copy"
                        initial={{ scale: 0.6, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.6, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Copy size={13} />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              </div>
            </div>

            {/* Network / status row */}
            <div className="px-4 py-3 border-b border-[var(--border-subtle)] grid grid-cols-2 gap-y-2">
              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider self-center">
                Network
              </p>
              <p className="font-body text-xs text-[var(--text-primary)] text-right">
                {networkName}
              </p>

              <p className="font-mono text-[10px] text-[var(--text-muted)] uppercase tracking-wider self-center">
                Status
              </p>
              <div className="flex items-center justify-end gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                <p className="font-body text-xs text-[var(--success)]">Active</p>
              </div>
            </div>

            {/* Disconnect */}
            <div className="px-4 py-3">
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[var(--radius-md)] text-[var(--error)] border border-[rgba(239,68,68,0.2)] hover:bg-[rgba(239,68,68,0.07)] font-body text-sm font-medium transition-colors cursor-pointer bg-transparent"
              >
                <LogOut size={14} />
                Disconnect
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
