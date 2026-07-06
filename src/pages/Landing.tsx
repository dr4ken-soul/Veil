import { useEffect } from 'react'
import { LandingNav } from '../components/layout/LandingNav'
import { ParticleField } from '../components/ui/ParticleField'
import { Hero } from '../components/sections/Hero'
import { RegistryPreview } from '../components/sections/RegistryPreview'
import { ProtocolStrip } from '../components/sections/ProtocolStrip'
import { HowItWorks } from '../components/sections/HowItWorks'
import { LandingCta } from '../components/sections/LandingCta'

/**
 * Landing Page Component.
 * Sets background, loads ParticleField, and presents all promotional sections.
 * Cleans up app-interior class on body when active.
 * @returns React JSX Element.
 */
export default function Landing() {
  useEffect(() => {
    // Ensure the app-interior class is disabled on the landing page
    document.body.classList.remove('app-interior')
    return () => {
      // Clean up if navigating away
      document.body.classList.add('app-interior')
    }
  }, [])

  return (
    <div className="relative min-h-screen bg-[var(--bg-primary)] overflow-x-hidden w-full">
      {/* Background Canvas Particles */}
      <ParticleField />

      {/* Navigation Header */}
      <LandingNav />

      {/* Hero Section */}
      <Hero />

      {/* Live Registry Preview */}
      <RegistryPreview />

      {/* Technology Specifications Strip */}
      <ProtocolStrip />

      {/* Guide Flow */}
      <HowItWorks />

      {/* Final Call to Action */}
      <LandingCta />

      {/* Footer */}
      <footer className="py-12 border-t border-[var(--border-subtle)] text-center relative z-10">
        <p className="font-mono text-xs text-[var(--text-muted)]">
          &copy; {new Date().getFullYear()} Veil. Built for the Zama Developer Program. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
