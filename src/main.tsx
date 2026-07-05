import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ZamaProvider } from '@zama-fhe/react-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { wagmiConfig, zamaConfig } from './lib/zama'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={wagmiConfig}>
    <QueryClientProvider client={queryClient}>
      <ZamaProvider config={zamaConfig}>
        <App />
      </ZamaProvider>
    </QueryClientProvider>
  </WagmiProvider>
)
