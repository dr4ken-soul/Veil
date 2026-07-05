import { useSpring } from 'framer-motion'
import React, { useEffect } from 'react'

/**
 * Hook to apply a magnetic pull effect to a button element.
 * The button translates up to 6px toward the cursor when hovered within proximity.
 * Uses spring physics for smooth interpolation.
 * @param ref - Ref object pointing to the HTML button or link element.
 * @returns Object with x and y motion values to apply to the element's transform.
 */
export function useMagneticButton(ref: React.RefObject<HTMLElement | null>) {
  const x = useSpring(0, { stiffness: 120, damping: 15 })
  const y = useSpring(0, { stiffness: 120, damping: 15 })

  useEffect(() => {
    const el = ref.current
    if (!el) return

    /**
     * Handles window-level mouse movement to check for proximity.
     * @param event - Standard DOM MouseEvent.
     */
    const handleMouseMove = (event: MouseEvent) => {
      const rect = el.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      const distanceX = event.clientX - centerX
      const distanceY = event.clientY - centerY

      const distance = Math.hypot(distanceX, distanceY)
      // Proximity threshold is based on button dimensions
      const proximity = Math.max(rect.width, rect.height) * 1.5

      if (distance < proximity) {
        // Calculate a progressive pull up to 6px
        const pullX = (distanceX / proximity) * 6
        const pullY = (distanceY / proximity) * 6
        x.set(pullX)
        y.set(pullY)
      } else {
        x.set(0)
        y.set(0)
      }
    }

    /**
     * Resets button position when cursor exits completely.
     */
    const handleMouseLeave = () => {
      x.set(0)
      y.set(0)
    }

    window.addEventListener('mousemove', handleMouseMove)
    el.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      el.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [ref, x, y])

  return { x, y }
}
