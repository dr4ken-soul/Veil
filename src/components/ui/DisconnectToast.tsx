import { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WifiOff } from 'lucide-react'

interface DisconnectToastProps {
  visible: boolean
  onDismiss: () => void
}

/**
 * DisconnectToast renders a brief notification at the top of the screen
 * when a wallet is disconnected mid-session and the user is redirected to landing.
 * Auto-dismisses after 4 seconds.
 * @param props - visible flag and onDismiss callback.
 * @returns AnimatePresence-driven toast or null.
 */
export function DisconnectToast({ visible, onDismiss }: DisconnectToastProps) {
  useEffect(() => {
    if (!visible) return
    const timer = setTimeout(onDismiss, 4000)
    return () => clearTimeout(timer)
  }, [visible, onDismiss])

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="disconnect-toast"
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-24 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-3 px-5 py-3 rounded-[var(--radius-lg)] liquid-glass border border-[rgba(239,68,68,0.2)] shadow-[var(--shadow-md)]"
        >
          <WifiOff size={15} className="text-[var(--error)] shrink-0" />
          <p className="font-body text-sm text-[var(--text-primary)]">
            Wallet disconnected — connect again to enter the app.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
