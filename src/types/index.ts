/**
 * A single ERC-20 to ERC-7984 wrapper pair from the on-chain registry.
 */
export interface WrapperPair {
  underlyingAddress: `0x${string}`
  wrapperAddress: `0x${string}`
  name: string
  symbol: string
  decimals: number
  isMock: boolean
  isValid: boolean
}

/**
 * Decrypted balance result returned from the EIP-712 flow.
 */
export interface DecryptedBalance {
  pairAddress: `0x${string}`
  symbol: string
  amount: bigint
  decryptedAt: number // unix timestamp, session only, never persisted
}

/**
 * Faucet claim state per underlying token address.
 */
export interface FaucetClaim {
  tokenAddress: `0x${string}`
  lastClaimedAt: number // unix timestamp stored in localStorage
  cooldownHours: 24
}
