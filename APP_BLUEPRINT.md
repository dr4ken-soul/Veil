# Veil — App Blueprint

## Product Summary

Veil is the production-ready interface for the Zama Wrappers Registry on Sepolia. It surfaces every ERC-20 to ERC-7984 confidential wrapper pair registered on-chain, lets users wrap and unwrap any pair, decrypts encrypted balances through the EIP-712 user-decryption flow and provides a Sepolia faucet for the official cTokenMock underlying tokens.

Built for the Zama Developer Program Mainnet Season 3 Bounty Track and cross-submitted to the Builder Track. The product is defined by the Bounty Track spec. The execution quality, the UX completeness and the production-readiness of the implementation are what determine the winner.

---

## Market Context

**Who this is for:**

1. Developers exploring the Zama Protocol on Sepolia who want to test confidential token wrapping without deploying their own registry or wrapper contracts
2. Protocol builders integrating ERC-7984 tokens into their applications who need a canonical reference for which pairs exist and what their addresses are
3. Users and researchers learning how FHE-based confidential tokens work on Ethereum and wanting a working end-to-end interface to interact with

**What the problem is:** Today developers spin up their own ERC-20 testnet tokens and ERC-7984 wrappers instead of using the ones already in the official Zama Wrappers Registry. That fragments the ecosystem and leaves the registry without a usable product surface. Veil turns the registry into something every developer and user can point to.

---

## MVP Feature Set

### Feature 1: Registry Page

**User story:** As a developer I want to see every wrapper pair registered on Sepolia so that I know which confidential tokens exist and where their contracts are.

**How it works:** The Registry page calls `getTokenConfidentialTokenPairs` on the WrapperRegistry contract via viem read. Each pair returns the underlying ERC-20 address, the ERC-7984 wrapper address and a validity flag. The page fetches the token name, symbol and decimals from each underlying ERC-20 and renders the pairs as interactive cards with 3D tilt on hover. A search input filters by token name or symbol client-side.

**Acceptance criteria:** All registered pairs appear within three seconds of page load. Search filters correctly in real time. Each card shows the token name, symbol, ERC-20 address, ERC-7984 address and a Wrap button linking to the Wrap page pre-filled with that pair.

**Complexity:** Medium

---

### Feature 2: Wrap and Unwrap

**User story:** As a user I want to wrap my ERC-20 tokens into their confidential ERC-7984 equivalents so that my balance becomes encrypted on-chain.

**How it works:** The user selects a pair from a dropdown (pre-filled if arriving from the Registry page), enters an amount and clicks Wrap. The flow is two steps: first approve the ERC-20 for the wrapper contract via a wagmi `writeContract` call, then call `shield` on the ERC-7984 wrapper via the Zama SDK. The Unwrap flow calls `unshield` on the wrapper. Both flows show a clear two-step progress indicator. Balances update after confirmation.

**Acceptance criteria:** Approval and shield both confirm on-chain. Unwrap confirms on-chain. The UI reflects the correct step state throughout and does not advance before a transaction confirms.

**Complexity:** High

---

### Feature 3: Balance Decryption

**User story:** As a user I want to view my encrypted ERC-7984 balance without revealing it to anyone else on-chain.

**How it works:** The user clicks Decrypt balance on any pair card or on the Wrap page. The Zama SDK generates an EIP-712 permit signed by the user's wallet. The SDK uses the signed permit to decrypt the ciphertext balance client-side. The decrypted balance displays in the UI for the duration of the session only and is never stored or transmitted.

**Acceptance criteria:** The decrypted balance matches the actual wrapped amount. The balance is never visible in any network request, console output or persisted state. Closing and reopening the modal clears it.

**Complexity:** High

---

### Feature 4: Faucet

**User story:** As a developer I want to claim test tokens from the cTokenMock underlying ERC-20s so that I have tokens to wrap and test with.

**How it works:** The Faucet page lists all mock underlying ERC-20s from the registry. The user selects a token and clicks Claim. The frontend calls the public `mint(address, amount)` function on the selected underlying ERC-20 with a fixed amount of 1000 tokens (scaled to decimals). A per-address cooldown of 24 hours is tracked in localStorage to prevent spam. The transaction confirms and the user's balance updates.

**Acceptance criteria:** Mint confirms on-chain and the user receives the correct amount. The cooldown blocks a second claim within 24 hours with a clear remaining time display. Tokens appear in the user's wallet after confirmation.

**Complexity:** Low

---

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Frontend | React 18 + Vite + TypeScript | Fast build, strong typing, standard for dApp frontends |
| Styling | Tailwind CSS v3 | Utility-first, no runtime overhead |
| Animations | Framer Motion | Production-grade entrance animations, useMotionValue for interactive patterns |
| Wallet connection | wagmi + viem | Best-in-class EVM wallet integration, pairs directly with the Zama React SDK |
| FHE SDK | @zama-fhe/react-sdk | Official React bindings for the Zama Protocol, handles shield, unshield and EIP-712 balance decryption |
| Server state | @tanstack/react-query | Required peer dependency of the Zama React SDK, also used for registry reads |
| State management | Zustand | Lightweight global state with no boilerplate |
| Routing | React Router v6 | Standard SPA routing with nested routes |
| Icons | Lucide React | Clean outline icons, tree-shakeable |

No backend server. All FHE operations are client-side. The wallet signs every transaction directly.

---

## App Pages and Routes

| Route | Page | Description |
|---|---|---|
| `/` | Landing | Marketing landing page, particle field background, no wallet required |
| `/app/registry` | Registry | All wrapper pairs with search, 3D card tilt, inline decrypt balance, Wrap shortcut |
| `/app/wrap` | Wrap | Select pair, enter amount, approve and wrap or unwrap |
| `/app/faucet` | Faucet | Select a cTokenMock, claim underlying test tokens |

---

## Data Structures

```typescript
/** A single ERC-20 to ERC-7984 wrapper pair from the on-chain registry */
interface WrapperPair {
  underlyingAddress: `0x${string}`
  wrapperAddress: `0x${string}`
  name: string
  symbol: string
  decimals: number
  isMock: boolean
  isValid: boolean
}

/** Decrypted balance result returned from the EIP-712 flow */
interface DecryptedBalance {
  pairAddress: `0x${string}`
  symbol: string
  amount: bigint
  decryptedAt: number   // unix timestamp, session only, never persisted
}

/** Faucet claim state per underlying token address */
interface FaucetClaim {
  tokenAddress: `0x${string}`
  lastClaimedAt: number   // unix timestamp stored in localStorage
  cooldownHours: 24
}

/** Global app store shape */
interface AppStore {
  connectedAddress: `0x${string}` | null
  pairs: WrapperPair[]
  pairsLoading: boolean
  decryptedBalances: Record<string, DecryptedBalance>
  setConnectedAddress: (address: `0x${string}` | null) => void
  setPairs: (pairs: WrapperPair[]) => void
  setDecryptedBalance: (pairAddress: string, balance: DecryptedBalance) => void
}
```

---

## Environment Variables

```
VITE_RELAYER_URL=              # Zama relayer URL for Sepolia — get from Zama Discord or docs
VITE_SEPOLIA_RPC_URL=          # Sepolia RPC endpoint (Alchemy or Infura)
VITE_REGISTRY_ADDRESS=         # WrapperRegistry contract address on Sepolia
```

---

## What Is Not Being Built in MVP

- Mainnet support (Sepolia only for this submission)
- Multi-hop wrapping across chains
- Portfolio view aggregating all wrapped balances in one dashboard
- Historical wrap and unwrap transaction history
- Notifications for completed transactions
- Mobile-optimised layout (desktop-first for hackathon)

These are deferred until after the hackathon if the project gains traction.

---

## Hackathon Build Priority

Deadline: July 7 2026 23:59 AOE

Priority order:
1. SDK and wagmi config working with Sepolia and the relayer
2. Registry reads returning real on-chain data
3. Wrap and unwrap flow confirmed end-to-end on testnet
4. Balance decryption confirmed working via EIP-712
5. Faucet confirmed minting real tokens
6. Landing page live and deployed
7. App interior fully polished with interactive patterns applied

Deploy to Vercel. Push to a public GitHub repo with a clear README before recording the demo video.
