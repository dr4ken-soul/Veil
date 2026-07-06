import { useState } from 'react'
import { useWriteContract, usePublicClient } from 'wagmi'
import { ERC20_ABI, ERC7984_ABI } from '../lib/contracts'
import type { WrapperPair } from '../types'

export type WrapDirection = 'wrap' | 'unwrap'

export type WrapStep =
  | 'idle'
  | 'approve-signing'
  | 'approve-confirming'
  | 'approve-confirmed'
  | 'execute-signing'
  | 'execute-confirming'
  | 'execute-confirmed'

/**
 * Custom hook to handle wrapping (shielding) and unwrapping (unshielding) tokens.
 * Wrap flow:
 * 1. Approve wrapper contract to spend underlying ERC-20.
 * 2. Call shield() on the wrapper.
 * Unwrap flow:
 * 1. Call unshield() on the wrapper.
 * @param pair - The active token pair to execute the operations on.
 * @returns Object with execution functions, active step status, transaction hashes, and errors.
 */
export function useWrap(pair: WrapperPair | null) {
  const [step, setStep] = useState<WrapStep>('idle')
  const [error, setError] = useState<Error | null>(null)
  const [approveHash, setApproveHash] = useState<`0x${string}` | null>(null)
  const [executeHash, setExecuteHash] = useState<`0x${string}` | null>(null)

  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  /**
   * Executes the wrap (shield) flow.
   * Approves the underlying ERC-20, then shields the tokens.
   * @param amount - Plaintext amount scaled to decimals.
   */
  const wrap = async (amount: bigint) => {
    if (!pair || !publicClient) {
      setError(new Error('Required parameters missing'))
      return
    }

    setError(null)
    setApproveHash(null)
    setExecuteHash(null)

    try {
      // Step 1: Approve ERC-20
      setStep('approve-signing')
      const approveTxHash = await writeContractAsync({
        address: pair.underlyingAddress,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [pair.wrapperAddress, amount],
      })
      setApproveHash(approveTxHash)

      setStep('approve-confirming')
      const approveReceipt = await publicClient.waitForTransactionReceipt({ hash: approveTxHash })
      if (approveReceipt.status === 'reverted') throw new Error('Approval transaction reverted on-chain.')
      setStep('approve-confirmed')

      // Step 2: Call shield on ERC-7984 wrapper
      setStep('execute-signing')
      const shieldTxHash = await writeContractAsync({
        address: pair.wrapperAddress,
        abi: ERC7984_ABI,
        functionName: 'shield',
        args: [amount],
      })
      setExecuteHash(shieldTxHash)

      setStep('execute-confirming')
      const shieldReceipt = await publicClient.waitForTransactionReceipt({ hash: shieldTxHash })
      if (shieldReceipt.status === 'reverted') throw new Error('Shield transaction reverted by the wrapper contract.')
      setStep('execute-confirmed')
    } catch (err) {
      setError(err as Error)
      setStep('idle')
    }
  }

  /**
   * Executes the unwrap (unshield) flow.
   * Calls unshield on the wrapper directly.
   * @param amount - Plaintext amount scaled to decimals.
   */
  const unwrap = async (amount: bigint) => {
    if (!pair || !publicClient) {
      setError(new Error('Required parameters missing'))
      return
    }

    setError(null)
    setApproveHash(null)
    setExecuteHash(null)

    try {
      // Step 1: Call unshield on ERC-7984 wrapper (Approval not required)
      setStep('execute-signing')
      const unshieldTxHash = await writeContractAsync({
        address: pair.wrapperAddress,
        abi: ERC7984_ABI,
        functionName: 'unshield',
        args: [amount],
      })
      setExecuteHash(unshieldTxHash)

      setStep('execute-confirming')
      const unshieldReceipt = await publicClient.waitForTransactionReceipt({ hash: unshieldTxHash })
      if (unshieldReceipt.status === 'reverted') throw new Error('Unshield transaction reverted on-chain.')
      setStep('execute-confirmed')
    } catch (err) {
      setError(err as Error)
      setStep('idle')
    }
  }

  /**
   * Resets the step status, error, and hashes to initial values.
   */
  const reset = () => {
    setStep('idle')
    setError(null)
    setApproveHash(null)
    setExecuteHash(null)
  }

  return {
    wrap,
    unwrap,
    reset,
    step,
    error,
    approveHash,
    executeHash,
  }
}
