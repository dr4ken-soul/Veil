import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAccount } from 'wagmi'

interface LandingNavProps {
  /** Called when the user clicks Connect Wallet — opens the connection modal. */
  onConnectClick: () => void
}

/**
 * Landing page navigation bar.
 * Features a dark glass styling with a central vertical hairline rule.
 * The bottom border opacity is updated on window scroll past 80px.
 * Connect Wallet delegates to the parent-controlled modal via onConnectClick.
 * @param props - onConnectClick handler.
 * @returns React JSX Element.
 */
export function LandingNav({ onConnectClick }: LandingNavProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { isConnected } = useAccount()

  useEffect(() => {
    /**
     * Checks scroll depth to toggle navbar border.
     */
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 flex items-center justify-between px-8 md:px-16 h-20 bg-[rgba(7,8,16,0.7)] backdrop-blur-md`}
      style={{
        borderBottom: `0.5px solid ${isScrolled ? 'var(--border-default)' : 'transparent'}`,
      }}
    >
      {/* Left zone: Wordmark */}
      <div className="flex-1 flex justify-start items-center">
        <Link to="/" className="no-underline">
          <span className="font-display font-semibold text-xl tracking-tight text-[var(--text-primary)]">
            Veil
          </span>
        </Link>
      </div>

      {/* Central vertical rule */}
      <div className="hidden md:block w-[1px] h-6 bg-[var(--border-default)]" />

      {/* Right zone: Action */}
      <div className="flex-1 flex justify-end items-center">
        {isConnected ? (
          <Link
            to="/app/registry"
            className="font-body text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] transition-colors relative group no-underline"
          >
            Launch App
            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
          </Link>
        ) : (
          <button
            onClick={onConnectClick}
            className="font-body text-sm font-medium text-[var(--accent)] hover:text-[var(--accent-hover)] cursor-pointer transition-colors relative group bg-transparent border-none outline-none"
          >
            Connect Wallet
            <span className="absolute left-0 bottom-0 w-0 h-[1px] bg-[var(--accent)] transition-all duration-300 group-hover:w-full" />
          </button>
        )}
      </div>
    </nav>
  )
}
