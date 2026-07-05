# Veil

Veil is the production-ready interface for the Zama Wrappers Registry on the Sepolia testnet. It surfaces every ERC-20 to ERC-7984 confidential wrapper pair registered on-chain, enables users to wrap and unwrap pairs in two clicks, decrypts encrypted balances client-side via the EIP-712 user-decryption flow, and provides a faucet for claiming test mock tokens.

Built for the Zama Developer Program Bounty Track and cross-submitted to the Builder Track.

---

## Core Features

1. **Registry Directory**: Surfaces all registered wrapper pairs on Sepolia with real-time client-side search.
2. **Confidential Wrap & Unwrap**: Convert standard ERC-20 tokens into FHE-shielded ERC-7984 counterparts.
3. **EIP-712 Balance Decryption**: Allows users to sign an off-chain, gas-free permit to decrypt and view their wrapped FHE balances client-side. The plaintext balance is never stored or transmitted.
4. **Mock Token Faucet**: Claim testnet mock tokens to test wrapping, with a 24-hour claim cooldown tracked in local state.
5. **Interactive UI Effects**: Includes a canvas-based moving particle background, 3D card tilt, magnetic buttons, and exit page transitions.

---

## Technology Stack

- **Framework**: React 19 + Vite + TypeScript
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Blockchain Integration**: Wagmi + Viem + TanStack React Query
- **Fully Homomorphic Encryption**: Zama React SDK (`@zama-fhe/react-sdk`) + Zama SDK (`@zama-fhe/sdk`)
- **State Management**: Zustand

---

## Contract Addresses (Sepolia Testnet)

- **WrapperRegistry**: `0x2f0750Bbb0A246059d80e94c454586a7F27a128e`

---

## Getting Started

### Prerequisites

- Node.js (v18+)
- MetaMask or any injected Web3 wallet connected to the Sepolia testnet

### Installation

1. Clone this repository to your local machine.
2. Install the project dependencies:
   ```bash
   npm install
   ```

### Configuration

Create a `.env` file in the root of the project using the template provided in `.env.example`:

```env
VITE_RELAYER_URL=https://relayer.testnet.zama.cloud
VITE_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
VITE_REGISTRY_ADDRESS=0x2f0750Bbb0A246059d80e94c454586a7F27a128e
```

### Running Locally

To launch the local development server, run:

```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173`.
