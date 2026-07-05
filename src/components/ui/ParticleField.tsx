import { useEffect, useRef } from 'react'
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  radius: number
  opacity: number
}

/**
 * ParticleField component that renders an animated particle network on canvas.
 * Includes cursor parallax motion via Framer Motion useMotionValue and useTransform.
 * Uses requestAnimationFrame for performance.
 * @returns React JSX Element.
 */
export function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const particlesRef = useRef<Particle[]>([])

  // Parallax motion tracking
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  // Map mouse positions to canvas translation offsets (-10 to 10 on X, -6 to 6 on Y)
  const transformX = useTransform(mouseX, [0, typeof window !== 'undefined' ? window.innerWidth : 1920], [-10, 10])
  const transformY = useTransform(mouseY, [0, typeof window !== 'undefined' ? window.innerHeight : 1080], [-6, 6])

  // Apply smooth springs
  const springX = useSpring(transformX, { stiffness: 80, damping: 20 })
  const springY = useSpring(transformY, { stiffness: 80, damping: 20 })

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      mouseX.set(event.clientX)
      mouseY.set(event.clientY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    /**
     * Resizes the canvas to match client dimensions.
     */
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      initParticles()
    }

    /**
     * Initializes the particles array with randomized properties.
     */
    const initParticles = () => {
      const count = 80
      const particles: Particle[] = []
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 0.2, // slow horizontal drift
          vy: -(Math.random() * 0.2 + 0.1), // drift upward (0.1 to 0.3px)
          radius: Math.random() * 1.0 + 1.5, // 1.5 to 2.5px radius
          opacity: Math.random() * 0.3 + 0.3, // 30% to 60% opacity
        })
      }
      particlesRef.current = particles
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    /**
     * Main animation loop drawing particles and connection lines.
     */
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const particles = particlesRef.current

      // 1. Update and draw particles
      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        // Wrap around screen boundaries
        if (p.x < 0) p.x = canvas.width
        if (p.x > canvas.width) p.x = 0
        if (p.y < 0) p.y = canvas.height
        if (p.y > canvas.height) p.y = canvas.height // Wrap to bottom

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(110, 231, 247, ${p.opacity})` // #6ee7f7 with opacity
        ctx.fill()
      })

      // 2. Draw connection lines (if distance is less than 120px)
      const threshold = 120
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const p1 = particles[i]
          const p2 = particles[j]
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.hypot(dx, dy)

          if (dist < threshold) {
            // Proportional opacity
            const alpha = (1 - dist / threshold) * 0.25
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(110, 231, 247, ${alpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <motion.div
      style={{
        x: springX,
        y: springY,
      }}
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </motion.div>
  )
}
