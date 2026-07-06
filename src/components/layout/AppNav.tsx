import { useLocation, Link } from 'react-router-dom'
import { WalletDropdown } from '../ui/WalletDropdown'

/**
 * App interior navigation bar.
 * Uses a dark glass bar structure. The active page replaces the central rule,
 * and is styled with an accent top-border tick. Inactive pages are shown as
 * muted monospace tags to the left and right.
 * Shows the truncated wallet address on the far right.
 * @returns React JSX Element.
 */
export function AppNav() {
  const location = useLocation()
  const path = location.pathname

  // Define tab navigation based on active route to center the active page name
  let leftTab = { name: 'Faucet', path: '/app/faucet' }
  let centerTab = { name: 'Registry', path: '/app/registry' }
  let rightTab = { name: 'Wrap', path: '/app/wrap' }

  if (path.endsWith('/wrap')) {
    leftTab = { name: 'Registry', path: '/app/registry' }
    centerTab = { name: 'Wrap', path: '/app/wrap' }
    rightTab = { name: 'Faucet', path: '/app/faucet' }
  } else if (path.endsWith('/faucet')) {
    leftTab = { name: 'Wrap', path: '/app/wrap' }
    centerTab = { name: 'Faucet', path: '/app/faucet' }
    rightTab = { name: 'Registry', path: '/app/registry' }
  }

  return (
    <nav className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-8 md:px-16 h-20 bg-[rgba(7,8,16,0.7)] border-b border-[var(--border-subtle)] backdrop-blur-md">
      {/* Left zone: Wordmark */}
      <div className="flex-1 flex justify-start items-center">
        <Link to="/" className="no-underline">
          <span className="font-display font-semibold text-xl tracking-tight text-[var(--text-primary)]">
            Veil
          </span>
        </Link>
      </div>

      {/* Central Zone: Hairline vertical-split navigation tabs */}
      <div className="flex items-center space-x-6 md:space-x-12">
        {/* Left Inactive Tag */}
        <Link
          to={leftTab.path}
          className="font-mono text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors no-underline uppercase tracking-wider"
        >
          {leftTab.name}
        </Link>

        {/* Center Active Tab (accent tick above) */}
        <div className="relative h-20 flex items-center justify-center">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-[var(--accent)]" />
          <span className="font-display font-semibold text-sm text-[var(--accent)] select-none">
            {centerTab.name}
          </span>
        </div>

        {/* Right Inactive Tag */}
        <Link
          to={rightTab.path}
          className="font-mono text-xs text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors no-underline uppercase tracking-wider"
        >
          {rightTab.name}
        </Link>
      </div>

      {/* Right zone: Wallet dropdown */}
      <div className="flex-1 flex justify-end items-center">
        <WalletDropdown />
      </div>
    </nav>
  )
}
