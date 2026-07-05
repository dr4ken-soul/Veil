import { create } from 'zustand'
import type { WrapperPair, DecryptedBalance } from '../types'

export interface AppStore {
  connectedAddress: `0x${string}` | null
  pairs: WrapperPair[]
  pairsLoading: boolean
  decryptedBalances: Record<string, DecryptedBalance>
  setConnectedAddress: (address: `0x${string}` | null) => void
  setPairs: (pairs: WrapperPair[]) => void
  setPairsLoading: (loading: boolean) => void
  setDecryptedBalance: (pairAddress: string, balance: DecryptedBalance) => void
  clearDecryptedBalances: () => void
}

/**
 * Zustand global store for state management.
 * Manages the wallet address, pairs list, loading states, and session decrypted balances.
 */
export const useAppStore = create<AppStore>((set) => ({
  connectedAddress: null,
  pairs: [],
  pairsLoading: false,
  decryptedBalances: {},

  setConnectedAddress: (address) => set({ connectedAddress: address }),
  setPairs: (pairs) => set({ pairs }),
  setPairsLoading: (loading) => set({ pairsLoading: loading }),
  setDecryptedBalance: (pairAddress, balance) =>
    set((state) => ({
      decryptedBalances: {
        ...state.decryptedBalances,
        [pairAddress.toLowerCase()]: balance,
      },
    })),
  clearDecryptedBalances: () => set({ decryptedBalances: {} }),
}))
