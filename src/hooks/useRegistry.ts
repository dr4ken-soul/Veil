import { useReadContract, useReadContracts } from 'wagmi'
import { REGISTRY_ADDRESS, REGISTRY_ABI, ERC20_ABI } from '../lib/contracts'
import type { WrapperPair } from '../types'

/**
 * Hook to read all registered ERC-20 to ERC-7984 wrapper pairs from the Zama registry.
 * Fetches token name, symbol, and decimals for each underlying ERC-20,
 * then returns the full list sorted alphabetically by symbol.
 * @returns Object containing the sorted pairs list, loading state, and error status.
 */
export function useRegistry(): { pairs: WrapperPair[]; isLoading: boolean; error: Error | null } {
  // 1. Read all pairs from the WrapperRegistry contract
  const {
    data: rawPairs,
    isLoading: isRegistryLoading,
    error: registryError,
  } = useReadContract({
    address: REGISTRY_ADDRESS,
    abi: REGISTRY_ABI,
    functionName: 'getTokenConfidentialTokenPairs',
  })

  // 2. Prepare contracts array for batch reading ERC-20 metadata
  const contracts = (rawPairs || []).flatMap((pair) => [
    { address: pair.token, abi: ERC20_ABI, functionName: 'name' as const },
    { address: pair.token, abi: ERC20_ABI, functionName: 'symbol' as const },
    { address: pair.token, abi: ERC20_ABI, functionName: 'decimals' as const },
  ])

  // 3. Batch read name, symbol, and decimals for all underlying tokens
  const {
    data: metadataResults,
    isLoading: isMetadataLoading,
    error: metadataError,
  } = useReadContracts({
    contracts,
    query: {
      enabled: contracts.length > 0,
    },
  })

  // 4. Map raw blockchain pairs and metadata results into WrapperPair objects
  const pairs: WrapperPair[] = (rawPairs || []).map((pair, index) => {
    const nameResult = metadataResults?.[index * 3]
    const symbolResult = metadataResults?.[index * 3 + 1]
    const decimalsResult = metadataResults?.[index * 3 + 2]

    const name = (nameResult?.result as string) || ''
    const symbol = (symbolResult?.result as string) || ''
    const decimals = (decimalsResult?.result as number) || 18

    // Classify as mock token if name contains "mock" or symbol starts with "c" or "mock"
    const isMock = name.toLowerCase().includes('mock') || symbol.toLowerCase().startsWith('c')

    return {
      underlyingAddress: pair.token,
      wrapperAddress: pair.confidentialToken,
      name,
      symbol,
      decimals,
      isMock,
      isValid: pair.isValid,
    }
  })

  // 5. Sort alphabetically by token symbol
  const sortedPairs = [...pairs].sort((a, b) => a.symbol.localeCompare(b.symbol))

  const isLoading = isRegistryLoading || (!!rawPairs && rawPairs.length > 0 && isMetadataLoading)
  const error = (registryError as Error) || (metadataError as Error) || null

  return {
    pairs: sortedPairs,
    isLoading,
    error,
  }
}
