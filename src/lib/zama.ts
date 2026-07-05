import { createConfig as createWagmiConfig } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { http } from 'viem'
import { createConfig as createZamaConfig } from '@zama-fhe/react-sdk/wagmi'
import { sepolia as sepoliaFhe, type FheChain } from '@zama-fhe/sdk/chains'
import { web } from '@zama-fhe/sdk/web'

const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
const relayerUrl = import.meta.env.VITE_RELAYER_URL || 'https://relayer.testnet.zama.cloud'

/**
 * Standard Wagmi configuration for Ethereum Sepolia.
 */
export const wagmiConfig = createWagmiConfig({
  chains: [sepolia],
  transports: {
    [sepolia.id]: http(rpcUrl),
  },
})

/**
 * Custom FHE chain configuration combining Zama Sepolia presets
 * with custom RPC and relayer endpoints.
 */
export const mySepolia: FheChain = {
  ...sepoliaFhe,
  relayerUrl,
  network: rpcUrl,
}

/**
 * Combined Zama FHE configuration wrapping standard Wagmi config
 * and setting up web relayer hooks.
 */
export const zamaConfig = createZamaConfig({
  chains: [mySepolia],
  wagmiConfig,
  relayers: {
    [mySepolia.id]: web(),
  },
})
