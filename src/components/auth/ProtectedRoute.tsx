import { useEffect } from 'react'
import { Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAccount } from 'wagmi'
import { motion, AnimatePresence } from 'framer-motion'

/**
 * Full-screen loader shown while wagmi is reconnecting from persisted state.
 * Prevents a flash-redirect to landing when the wallet is actually still connected.
 */
function ReconnectingScreen() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col items-center justify-center gap-4">
      <div className="w-6 h-6 rounded-full border-2 border-[var(--accent)] border-t-transparent animate-spin" />
      <p className="font-body text-sm text-[var(--text-secondary)]">Reconnecting wallet…</p>
    </div>
  )
}

/**
 * ProtectedRoute guards all /app/* routes.
 * - If wagmi is still reconnecting from storage, shows a loader to prevent false redirects.
 * - If wallet is not connected, redirects to / immediately.
 * - If wallet disconnects mid-session, navigates back to / with a state flag for the toast.
 * @returns Outlet (app pages) or redirect.
 */
export function ProtectedRoute() {
  const { isConnected, isReconnecting } = useAccount()
  const navigate = useNavigate()

  // Watch for mid-session disconnect and redirect home with toast flag
  useEffect(() => {
    if (!isConnected && !isReconnecting) {
      navigate('/', { replace: true, state: { disconnected: true } })
    }
  }, [isConnected, isReconnecting, navigate])

  if (isReconnecting) return <ReconnectingScreen />
  if (!isConnected) return <Navigate to="/" replace />

  return <Outlet />
}
