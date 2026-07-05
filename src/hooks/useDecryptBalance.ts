import { useState } from 'react'
import { useAccount } from 'wagmi'
import { useHasPermit, useGrantPermit, useConfidentialBalance } from '@zama-fhe/react-sdk'

/**
 * Custom hook to handle the user-decryption flow for a confidential token balance.
 * Uses EIP-712 permit signing via Zama SDK.
 * @param wrapperAddress - The address of the ERC-7984 wrapper contract.
 * @returns Object with the decrypted balance, loading status, error status, and decrypt function.
 */
export function useDecryptBalance(wrapperAddress: `0x${string}` | null) {
  const { address } = useAccount()
  const [isPermitSigning, setIsPermitSigning] = useState(false)
  const [localError, setLocalError] = useState<Error | null>(null)

  const dummyAddress = '0x0000000000000000000000000000000000000000' as const

  // 1. Check if a valid permit exists for this wrapper address
  const { data: hasPermit } = useHasPermit({
    contractAddresses: wrapperAddress ? [wrapperAddress] : [],
  })

  // 2. Hook to request permit signature
  const { mutateAsync: grantPermit } = useGrantPermit()

  // 3. Fetch the confidential balance (automatically decrypts if permit is active)
  const {
    data: balanceData,
    isLoading: isBalanceLoading,
    error: balanceError,
  } = useConfidentialBalance({
    address: wrapperAddress || dummyAddress,
    account: address || dummyAddress,
  })

  /**
   * Triggers the balance decryption. If no permit is active, initiates the
   * EIP-712 signature request to grant the permit.
   */
  const decrypt = async () => {
    if (!wrapperAddress || !address) {
      setLocalError(new Error('Wallet not connected or invalid wrapper address'))
      return
    }
    setLocalError(null)
    try {
      if (!hasPermit) {
        setIsPermitSigning(true)
        // Pass the array of contract addresses directly to grantPermit
        await grantPermit([wrapperAddress])
      }
    } catch (err) {
      setLocalError(err as Error)
    } finally {
      setIsPermitSigning(false)
    }
  }

  // Parse the decrypted balance
  const balance = balanceData !== undefined && balanceData !== null ? BigInt(balanceData.toString()) : null

  return {
    balance,
    isLoading: isBalanceLoading || isPermitSigning,
    error: (balanceError as Error) || localError,
    decrypt,
    hasPermit: !!hasPermit,
  }
}
