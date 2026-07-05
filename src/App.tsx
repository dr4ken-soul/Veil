import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import Landing from './pages/Landing'
import Registry from './pages/Registry'
import Wrap from './pages/Wrap'
import Faucet from './pages/Faucet'

/**
 * AnimatedRoutes component that handles page switching transitions.
 * Wraps routes in AnimatePresence with location-based keys to enable exit animations.
 * @returns React JSX Element.
 */
function AnimatedRoutes() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Landing Page */}
        <Route path="/" element={<Landing />} />

        {/* App Pages */}
        <Route path="/app/registry" element={<Registry />} />
        <Route path="/app/wrap" element={<Wrap />} />
        <Route path="/app/faucet" element={<Faucet />} />

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
