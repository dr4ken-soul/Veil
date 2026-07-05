# Veil — Build Guide

## Hackathon Timeline

| Date | Milestone |
|---|---|
| Jul 4 2026 | Build starts |
| Jul 6 2026 | All pages functional on Sepolia testnet |
| Jul 7 2026 23:59 AOE | Submission deadline |

Three days. Every day has one clear goal. Do not start the next day's work before the current day's goal is confirmed working.

---

## Environment Setup

```bash
npm create vite@latest veil -- --template react-ts
cd veil
npm install
npm install tailwindcss @tailwindcss/vite
npm install framer-motion
npm install zustand
npm install react-router-dom
npm install lucide-react
npm install wagmi viem @tanstack/react-query
npm install @zama-fhe/react-sdk @zama-fhe/sdk
npx tailwindcss init -p
```

Create `.env` from `.env.example`:

```
VITE_RELAYER_URL=         # Zama public Sepolia relayer — check https://docs.zama.org/protocol/sdk
VITE_SEPOLIA_RPC_URL=     # Your Alchemy or Infura Sepolia endpoint
VITE_REGISTRY_ADDRESS=    # WrapperRegistry address — check https://docs.zama.org/protocol/protocol-apps/addresses/testnet/sepolia
```

---

## Day 1: SDK, Config and Registry Reads

**Goal:** The registry reads real on-chain data in the browser. Nothing visual yet.

### Step 1: Configure wagmi and the Zama SDK

Build `src/lib/zama.ts`. The Zama React SDK wraps wagmi and requires a combined config.

```typescript
import { createConfig as createZamaConfig, sepoliaFhe } from '@zama-fhe/react-sdk/wagmi'
import { createConfig as createWagmiConfig } from 'wagmi'
import { sepolia } from 'viem/chains'
import { injected, walletConnect } from 'wagmi/connectors'
import { http } from 'viem'

/**
 * Creates the combined wagmi and Zama FHE config for Sepolia.
 * The relayerUrl is required for all shield and unshield operations.
 */
export const zamaConfig = createZamaConfig({
  chain: {
    ...sepoliaFhe,
    relayerUrl: import.meta.env.VITE_RELAYER_URL,
  },
  wagmi: createWagmiConfig({
    chains: [sepolia],
    connectors: [injected(), walletConnect({ projectId: 'your-walletconnect-project-id' })],
    transports: {
      [sepolia.id]: http(import.meta.env.VITE_SEPOLIA_RPC_URL),
    },
  }),
})
```

### Step 2: Set up the provider tree

In `src/main.tsx` wrap the app in the correct provider order:

```tsx
import { ZamaProvider } from '@zama-fhe/react-sdk'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider } from 'wagmi'
import { zamaConfig } from './lib/zama'

const queryClient = new QueryClient()

createRoot(document.getElementById('root')!).render(
  <WagmiProvider config={zamaConfig.wagmi}>
    <QueryClientProvider client={queryClient}>
      <ZamaProvider config={zamaConfig}>
        <App />
      </ZamaProvider>
    </QueryClientProvider>
  </WagmiProvider>
)
```

### Step 3: Add contract addresses and ABIs

Build `src/lib/contracts.ts`. Add the WrapperRegistry address and its ABI. The registry ABI needs at minimum the `getTokenConfidentialTokenPairs` read function. Fetch the full ABI from the Zama GitHub repo or the deployed contract on Sepolia via Etherscan.

```typescript
/** WrapperRegistry contract address on Sepolia testnet */
export const REGISTRY_ADDRESS = import.meta.env.VITE_REGISTRY_ADDRESS as `0x${string}`

/** Minimal ABI for reading all registered wrapper pairs */
export const REGISTRY_ABI = [
  {
    name: 'getTokenConfidentialTokenPairs',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [
      {
        type: 'tuple[]',
        components: [
          { name: 'token', type: 'address' },
          { name: 'confidentialToken', type: 'address' },
          { name: 'isValid', type: 'bool' },
        ],
      },
    ],
  },
] as const
```

Also add the minimal ERC-20 ABI (name, symbol, decimals, approve, balanceOf, mint) and the ERC-7984 ABI (shield, unshield, balanceOf via EIP-712).

### Step 4: Build the useRegistry hook

Build `src/hooks/useRegistry.ts`. This hook reads all pairs from the WrapperRegistry then fetches metadata for each underlying ERC-20.

```typescript
/**
 * Reads all ERC-20 to ERC-7984 wrapper pairs from the on-chain registry.
 * Fetches token name, symbol and decimals for each underlying ERC-20.
 * Returns the full pair list sorted alphabetically by symbol.
 */
export function useRegistry(): { pairs: WrapperPair[]; isLoading: boolean; error: Error | null }
```

Use `useReadContract` from wagmi for the registry call and `useReadContracts` for the batched ERC-20 metadata reads. Transform the raw on-chain tuples into `WrapperPair` objects using the type from `types/index.ts`.

### Step 5: Test registry reads in isolation

Before building any UI, add a temporary `console.info` in the hook and confirm the correct number of pairs load in the browser. Then remove the log before continuing.

---

## Day 2: Core Flows (Wrap, Unwrap, Decrypt, Faucet)

**Goal:** All four core interactions confirmed working on Sepolia testnet.

### Step 1: Build the useWrap hook

Build `src/hooks/useWrap.ts`. The wrap flow is two sequential transactions: ERC-20 approval then the shield call via the Zama SDK.

```typescript
/**
 * Handles the full wrap flow for a given token pair.
 * Step 1: approves the underlying ERC-20 for the wrapper contract.
 * Step 2: calls shield on the ERC-7984 wrapper via the Zama SDK.
 * Returns step state, transaction hashes and error for the UI.
 */
export function useWrap(pair: WrapperPair | null)
```

Reference the Zama SDK docs for the correct shield invocation:
https://docs.zama.org/protocol/sdk

The unwrap flow calls unshield on the wrapper. Wrap this in the same hook with a `direction` parameter of `wrap` or `unwrap`.

### Step 2: Build the useDecryptBalance hook

Build `src/hooks/useDecryptBalance.ts`. This calls the Zama SDK's EIP-712 balance decryption flow.

```typescript
/**
 * Decrypts the user's encrypted ERC-7984 balance for a given pair.
 * Uses the EIP-712 user-decryption flow via the Zama SDK.
 * The plaintext balance is never stored outside this hook's return value.
 */
export function useDecryptBalance(wrapperAddress: `0x${string}` | null)
```

Reference the Zama SDK docs for the correct balanceOf decryption invocation. The hook should return the decrypted balance as a bigint, a loading boolean and an error.

### Step 3: Build the useFaucet hook

Build `src/hooks/useFaucet.ts`. This calls mint on the selected cTokenMock underlying ERC-20.

```typescript
/**
 * Claims test tokens from a cTokenMock underlying ERC-20.
 * Calls the public mint function with a fixed amount of 1000 tokens scaled to decimals.
 * Tracks the last claim time in localStorage and enforces a 24-hour cooldown.
 */
export function useFaucet(tokenAddress: `0x${string}` | null, decimals: number)
```

### Step 4: Build the Wrap page

Build `src/pages/Wrap.tsx`. The page accepts an optional `pair` query param (pre-filled when arriving from the Registry page). It shows a pair selector dropdown, an amount input, a direction toggle (Wrap or Unwrap) and the two-step progress indicator. Each step shows a status of pending, signing, confirming or confirmed.

### Step 5: Build the Faucet page

Build `src/pages/Faucet.tsx`. A simple grid of cTokenMock cards, each showing the token name, symbol and a Claim button. A cooldown countdown displays on cards with an active cooldown.

### Step 6: Confirm all flows end-to-end on testnet

Test in this order:
1. Claim from the faucet and confirm tokens arrive in the wallet
2. Wrap the claimed tokens and confirm the on-chain shield
3. Decrypt the wrapped balance and confirm it matches the wrapped amount
4. Unwrap and confirm the unshield returns the correct ERC-20 amount

Only proceed to Day 3 once all four flows confirm on Sepolia.

---

## Day 3: Frontend, Deploy and Submit

**Goal:** A live deployed app with the landing page complete, all pages polished and the submission ready.

### Step 1: Build globals.css

Set up the Void Slate CSS variables, Syne, Outfit and JetBrains Mono font stacks, the liquid-glass classes, and the app-interior grain overlay as specified in FRONTEND_SPEC.md.

### Step 2: Build ParticleField.tsx

Build the canvas-based particle field for the landing page hero. Particles are small cyan dots on `--bg-primary`. They move upward slowly and form faint connecting lines with nearby particles. On cursor move the particle layer translates slightly via the Framer Motion parallax pattern specified in CLAUDE.md.

```typescript
/**
 * Renders an animated particle field on a full-viewport canvas.
 * Particles drift slowly and connect when within a threshold distance.
 * Responds to cursor position via a Framer Motion parallax layer.
 */
export function ParticleField()
```

### Step 3: Build LandingNav.tsx and AppNav.tsx

Build both nav components as specified in FRONTEND_SPEC.md. The landing nav dark glass bar with the vertical rule. The app nav with the active page name replacing the rule and monospace tags for the other pages.

### Step 4: Build the landing page sections

Build in this order: Hero, RegistryPreview, ProtocolStrip, HowItWorks, LandingCta.

The Hero section centres the wordmark, the tagline "Wrap anything. Reveal nothing." and a Launch App CTA. The particle field canvas fills the full viewport behind it.

The RegistryPreview section shows four to six pair cards with realistic token data pulled live from the registry hook. Apply 3D card tilt to each card.

The ProtocolStrip shows three columns: FHE encryption, ERC-7984 standard, EIP-712 decryption. One sentence each in Outfit body weight. Column headers in Syne.

HowItWorks shows three steps: wrap your ERC-20, use it confidentially, unwrap at any time. Each step has a step number in JetBrains Mono and a short body line.

LandingCta is a single full-width panel with the tagline repeated and a Launch App button.

### Step 5: Build the Registry page

Build `src/pages/Registry.tsx`. This is the primary app page. All pairs display as cards in a responsive grid. The search input filters client-side. Each card shows the token name, symbol, both contract addresses in JetBrains Mono with a copy button, and a Decrypt Balance button that triggers the EIP-712 flow inline. A Wrap button routes to `/app/wrap?pair=wrapperAddress`.

### Step 6: Apply AnimatePresence page transitions

Wrap the router outlet in AnimatePresence with mode set to `wait`. Each page component wraps its root element in a motion.div with the blur-in entrance and fade-out exit as specified in CLAUDE.md.

### Step 7: Deploy

Push to a public GitHub repo. Add a README with a project description, the tech stack, the testnet contract addresses and instructions for running locally. Deploy to Vercel.

Confirm the live URL loads correctly, wallet connects and registry reads succeed before recording the demo video.

### Step 8: Record the demo video

Maximum three minutes. Show in order:
1. The landing page and particle field
2. Connect wallet on Sepolia testnet
3. The Registry page with live pair data
4. Wrap a token end-to-end
5. Decrypt the wrapped balance
6. Unwrap the token
7. Claim from the faucet

Briefly explain what FHE is doing in one sentence during the decrypt step. Keep the video real-person narration only.

### Step 9: Submit

Submit to the Bounty Track form first. Then submit to the Builder Track form separately. Both forms accept the same repo URL, demo URL and video link.

Publish the X thread (Post 1 from MARKETING.md) before submitting. Post 2 goes out after submission is confirmed.

---

## Common Issues

**The relayer URL is not working:**
Get the correct public Sepolia relayer URL from the Zama Discord or the SDK docs. It is not the same as a standard Sepolia RPC endpoint. Without it shield and unshield will fail silently.

**The shield transaction reverts:**
Confirm the ERC-20 approval step completed before calling shield. The approval amount must be greater than or equal to the shield amount. Check that the wrapper contract address in the approval matches the ERC-7984 address for the pair.

**Balance decryption returns nothing:**
Confirm the user has a non-zero encrypted balance. If they have never wrapped any tokens the decryption will return zero which is correct but can appear broken. Test with a known wrapped amount first.

**Registry reads return an empty array:**
Confirm the registry address in .env matches the correct Sepolia address from the Zama docs. If the RPC endpoint has rate limits the batched metadata reads may fail silently. Switch to a paid Alchemy or Infura endpoint if needed.

**Particle field causes performance issues:**
Cap the particle count at 80 and reduce the connection threshold. Use `requestAnimationFrame` for the animation loop and cancel it on component unmount. Avoid re-creating the canvas context on every render.
