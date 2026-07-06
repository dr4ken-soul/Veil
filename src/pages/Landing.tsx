import { useEffect, useState, useCallback } from 'react'
import { useLocation } from 'react-router-dom'
import { LandingNav } from '../components/layout/LandingNav'
import { ParticleField } from '../components/ui/ParticleField'
import { Hero } from '../components/sections/Hero'
import { RegistryPreview } from '../components/sections/RegistryPreview'
import { ProtocolStrip } from '../components/sections/ProtocolStrip'
import { HowItWorks } from '../components/sections/HowItWorks'
import { LandingCta } from '../components/sections/LandingCta'
import { WalletConnectModal } from '../components/ui/WalletConnectModal'
import { DisconnectToast } from '../components/ui/DisconnectToast'

/**
 * Landing Page Component.
 * Owns the wallet connection modal and disconnect toast state.
 * Passes onConnectClick down to LandingNav, Hero, and LandingCta.
 * Reads router location state to detect mid-session disconnect redirects.
 * @returns React JSX Element.
 */
export default function Landing() {
  const [showModal, setShowModal] = useState(false)
  const [showDisconnectToast, setShowDisconnectToast] = useState(false)
  const location = useLocation()

  // Detect redirect from ProtectedRoute after mid-session disconnect
  useEffect(() => {
    if (location.state?.disconnected) {
      setShowDisconnectToast(true)
      // Clear the state so refresh doesn't re-trigger
      window.history.replaceState({}, '')
    }
  }, [location.state])

  // Ensure the app-interior class is disabled on the landing page
  useEffect(() => {
    document.body.classList.remove('app-interior')
    return () => {
      document.body.classList.add('app-interior')
    }
  }, [])

  const openModal = useCallback(() => setShowModal(true), [])
  const closeModal = useCallback(() => setShowModal(false), [])
  const dismissToast = useCallback(() => setShowDisconnectToast(false), [])

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] overflow-x-hidden w-full">
      {/* Background Canvas Particles */}
      <ParticleField />

      {/* Disconnect toast — shown when redirected from app after disconnect */}
      <DisconnectToast visible={showDisconnectToast} onDismiss={dismissToast} />

      {/* Wallet Connect Modal */}
      <WalletConnectModal isOpen={showModal} onClose={closeModal} />

      {/* Navigation Header */}
      <LandingNav onConnectClick={openModal} />

      {/* Hero Section */}
      <Hero onConnectClick={openModal} />

      {/* Live Registry Preview */}
      <RegistryPreview />

      {/* Technology Specifications Strip */}
      <ProtocolStrip />

      {/* Guide Flow */}
      <HowItWorks />

      {/* Final Call to Action */}
      <LandingCta onConnectClick={openModal} />

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border-subtle)] text-center relative z-10">
        <p className="font-mono text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} Veil. Built for the Zama Developer Program. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
