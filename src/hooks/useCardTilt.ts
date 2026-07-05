import { useMotionValue, useSpring, useTransform } from 'framer-motion'
import React from 'react'

/**
 * Hook to implement a smooth 3D card tilt effect based on cursor movement.
 * Tracks mouse position over an element and returns motion values for X/Y rotation.
 * @returns Object with rotateX/rotateY motion values and event handlers to attach.
 */
export function useCardTilt() {
  const x = useMotionValue(0)
  const y = useMotionValue(0)

  // Map coordinate offset to degree rotation with smooth spring physics
  const rotateX = useSpring(useTransform(y, [-100, 100], [7, -7]), { stiffness: 150, damping: 20 })
  const rotateY = useSpring(useTransform(x, [-100, 100], [-7, 7]), { stiffness: 150, damping: 20 })

  /**
   * Tracks cursor position within card bounding rect.
   * @param event - React mouse event.
   */
  const handleMouseMove = (event: React.MouseEvent<HTMLElement>) => {
    const el = event.currentTarget
    const rect = el.getBoundingClientRect()
    const width = rect.width
    const height = rect.height
    // Normalize coordinates centered at middle of the card
    const mouseX = event.clientX - rect.left - width / 2
    const mouseY = event.clientY - rect.top - height / 2
    x.set(mouseX)
    y.set(mouseY)
  }

  /**
   * Resets card rotation to flat alignment.
   */
  const handleMouseLeave = () => {
    x.set(0)
    y.set(0)
  }

  return {
    rotateX,
    rotateY,
    handleMouseMove,
    handleMouseLeave,
  }
}
