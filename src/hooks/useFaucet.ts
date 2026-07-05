import { useState, useEffect } from 'react'
import { useAccount, useWriteContract, usePublicClient } from 'wagmi'
import { parseUnits } from 'viem'
import { ERC20_ABI } from '../lib/contracts'

const COOLDOWN_MS = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Custom hook to manage the faucet claim process.
 * Calls the mint() function on cTokenMock underlying tokens with a fixed amount of 1000 tokens.
 * Tracks claim cooldown in localStorage per user address and token address.
 * @param tokenAddress - The underlying ERC-20 token address.
 * @param decimals - The decimals of the token to properly scale the claim amount.
 * @returns Object with claim execution function, claiming state, error state, transaction hash, and remaining cooldown.
 */
export function useFaucet(tokenAddress: `0x${string}` | null, decimals: number) {
  const { address } = useAccount()
  const [isClaiming, setIsClaiming] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState<number>(0) // in milliseconds

  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const localStorageKey = address && tokenAddress ? `faucet-cooldown-${address.toLowerCase()}-${tokenAddress.toLowerCase()}` : ''

  // Effect to calculate and update remaining cooldown
  useEffect(() => {
    if (!localStorageKey) {
      setCooldownRemaining(0)
      return
    }

    /**
     * Updates the countdown timer.
     */
    const updateCooldown = () => {
      const lastClaimed = localStorage.getItem(localStorageKey)
      if (lastClaimed) {
        const elapsed = Date.now() - parseInt(lastClaimed, 10)
        const remaining = COOLDOWN_MS - elapsed
        if (remaining > 0) {
          setCooldownRemaining(remaining)
        } else {
          setCooldownRemaining(0)
          localStorage.removeItem(localStorageKey)
        }
      } else {
        setCooldownRemaining(0)
      }
    }

    updateCooldown()
    const timer = setInterval(updateCooldown, 1000)

    return () => clearInterval(timer)
  }, [localStorageKey])

  /**
   * Executes the faucet claim transaction.
   * Enforces the 24-hour cooldown.
   */
  const claim = async () => {
    if (!tokenAddress || !address || !publicClient) {
      setError(new Error('Wallet not connected or invalid token address'))
      return
    }

    if (cooldownRemaining > 0) {
      setError(new Error('Cooldown active. Please wait 24 hours between claims.'))
      return
    }

    setError(null)
    setTxHash(null)
    setIsClaiming(true)

    try {
      // Scale fixed amount of 1000 tokens to correct decimals
      const claimAmount = parseUnits('1000', decimals)

      const hash = await writeContractAsync({
        address: tokenAddress,
        abi: ERC20_ABI,
        functionName: 'mint',
        args: [address, claimAmount],
      })
      setTxHash(hash)

      // Wait for confirmation on-chain
      await publicClient.waitForTransactionReceipt({ hash })

      // Save claim time on success
      if (localStorageKey) {
        localStorage.setItem(localStorageKey, Date.now().toString())
      }
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsClaiming(false)
    }
  }

  return {
    claim,
    isClaiming,
    error,
    txHash,
    cooldownRemaining,
  }
}
