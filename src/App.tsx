import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import Landing from './pages/Landing'
import Registry from './pages/Registry'
import Wrap from './pages/Wrap'
import Faucet from './pages/Faucet'

/**
 * AnimatedRoutes component that handles page switching transitions.
 * Wraps routes in AnimatePresence with location-based keys to enable exit animations.
 * All /app/* routes are wrapped in ProtectedRoute which redirects to / if wallet is
 * not connected, or if the wallet disconnects mid-session.
 * @returns React JSX Element.
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing Page — always public */}
        <Route path="/" element={<Landing />} />

        {/* Protected App Pages — require connected wallet */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app/registry" element={<Registry />} />
          <Route path="/app/wrap" element={<Wrap />} />
          <Route path="/app/faucet" element={<Faucet />} />
        </Route>

        {/* Fallback to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  )
}

/**
 * Main App Component.
 * Sets up routing for the entire application.
 * @returns React JSX Element.
 */
function App() {
  return (
    <Router>
      <AnimatedRoutes />
    </Router>
  )
}

export default App
