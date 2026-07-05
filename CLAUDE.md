# Veil — Agent Context

## What This Is

Veil is the production-ready interface for the Zama Wrappers Registry on Sepolia. It surfaces every ERC-20 to ERC-7984 wrapper pair, lets users wrap and unwrap any pair, decrypts encrypted balances via the EIP-712 user-decryption flow and includes a Sepolia faucet for the official cTokenMocks. No custom Solidity is needed. Every contract is already deployed.

Built for the Zama Developer Program Mainnet Season 3 Bounty Track and cross-submitted to the Builder Track. Deadline: July 7 2026 23:59 AOE.

---

## One-Line Pitch

The registry, made usable.

---

## Tagline

Wrap anything. Reveal nothing.

---

## MVP Features

1. Registry page — reads all ERC-20 to ERC-7984 wrapper pairs from the on-chain WrapperRegistry contract and displays them with token metadata, contract addresses and live pair status
2. Wrap and unwrap — users approve and shield an ERC-20 into its ERC-7984 counterpart or unshield back to plaintext ERC-20, all via the Zama SDK
3. Balance decryption — users decrypt their encrypted ERC-7984 balance through the EIP-712 user-decryption flow, client-side via the SDK, with the balance never transmitted in plaintext
4. Faucet — users claim test tokens from the cTokenMock underlying ERC-20s by calling their public mint function, with a per-address cooldown tracked in local state

---

## Hackathon Tracks

Primary: Zama Developer Program Mainnet Season 3 Bounty Track
Cross-submit: Builder Track (same codebase, separate submission form)

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS v3 |
| Animations | Framer Motion |
| Wallet | wagmi + viem |
| FHE SDK | @zama-fhe/react-sdk + @zama-fhe/sdk |
| Server state | @tanstack/react-query |
| State management | Zustand |
| Routing | React Router v6 |
| Icons | Lucide React |

No backend. All FHE operations run client-side via the Zama SDK. The wallet signs every transaction directly.

---

## Contract Addresses (Sepolia Testnet)

Fetch the canonical addresses from:
https://docs.zama.org/protocol/protocol-apps/addresses/testnet/sepolia

Store all addresses in `src/lib/contracts.ts` and reference them via named exports. Never hardcode an address directly in a component.

---

## Project Structure

```
veil/
├── public/
│   ├── logo.svg                      (user provides — plain comment slot until then)
│   └── favicon.ico                   (user provides — plain comment slot until then)
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── FadeIn.tsx
│   │   │   ├── SkeletonShimmer.tsx
│   │   │   └── ParticleField.tsx
│   │   ├── layout/
│   │   │   ├── LandingNav.tsx
│   │   │   └── AppNav.tsx
│   │   └── sections/
│   │       ├── Hero.tsx
│   │       ├── RegistryPreview.tsx
│   │       ├── ProtocolStrip.tsx
│   │       ├── HowItWorks.tsx
│   │       └── LandingCta.tsx
│   ├── pages/
│   │   ├── Landing.tsx
│   │   ├── Registry.tsx
│   │   ├── Wrap.tsx
│   │   └── Faucet.tsx
│   ├── hooks/
│   │   ├── useRegistry.ts
│   │   ├── useWrap.ts
│   │   ├── useFaucet.ts
│   │   └── useDecryptBalance.ts
│   ├── lib/
│   │   ├── zama.ts                   (SDK and wagmi config)
│   │   ├── contracts.ts              (all addresses and ABIs)
│   │   └── utils.ts
│   ├── store/
│   │   └── useAppStore.ts
│   ├── types/
│   │   └── index.ts
│   ├── styles/
│   │   └── globals.css
│   ├── App.tsx
│   └── main.tsx
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── .env.example
```

---

## Design System

All design decisions locked across seven gates. Do not deviate from these values.

**Aesthetic:** Dark editorial

**Fonts:**

- Display: Syne (geometric, architectural weight)
- Body: Outfit (clean, modern, readable)
- Mono: JetBrains Mono (addresses, amounts, code)

Load via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

**Colour palette — Void Slate:**
```css
--bg-primary:     #070810;
--bg-secondary:   #0c0d1a;
--bg-surface:     #11121f;
--bg-elevated:    #181926;
--accent:         #6ee7f7;
--accent-hover:   #a5f0fb;
--accent-glow:    rgba(110, 231, 247, 0.10);
--accent-dim:     #1e6070;
--text-primary:   #e8eaf2;
--text-secondary: #7a7e9a;
--text-muted:     #363855;
--border-subtle:  rgba(255, 255, 255, 0.04);
--border-default: rgba(255, 255, 255, 0.08);
--success:        #22c55e;
--error:          #ef4444;
```

**Nav:**

Landing: a dark glass top bar with a single thin vertical rule at the horizontal centre. Veil wordmark anchors the left zone. Connect Wallet anchors the right zone. No blur. A 0.5px bottom border fades in only as the user scrolls past the first fold.

App interior: the same dark glass bar. The vertical rule is replaced by the active page name in `--accent`. The other pages appear as muted monospace tags to its left and right. The active page has a top-border tick in `--accent` above it.

**Background:**

Landing: `--bg-primary` base with a slow-moving particle field rendered on canvas. Particles are small cyan dots connected by faint lines when within range. The field shifts subtly with cursor position via Framer Motion useMotionValue parallax. No hero image.

App interior: static atmospheric. `--bg-primary` base with faint grain applied via `body::after` and a subtle radial glow centred behind the main content area.

**Noise grain** (app interior only):
```css
body.app-interior::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: 9999;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
  background-size: 128px 128px;
  opacity: 0.03;
}
```

**Liquid glass classes** (defined in globals.css):
```
.liquid-glass
.liquid-glass-strong
.liquid-glass-dark
```

---

## Landing Page Sections

1. Hero — full-viewport, particle field background, copy centre-anchored, cursor parallax on particle layer
2. Registry Preview — live token pair cards pulled from the on-chain registry, 3D card tilt on hover
3. Protocol Strip — three columns: FHE encryption, ERC-7984 standard, EIP-712 decryption
4. How It Works — three-step flow: wrap, use, unwrap
5. CTA — single call to action leading into the app

## App Interior Pages

- `/app/registry` — all wrapper pairs, search and filter, inline decrypt balance per pair
- `/app/wrap` — select a pair, enter amount, approve and wrap or unwrap
- `/app/faucet` — select a cTokenMock, claim underlying test tokens

---

## Logo and Favicon

No logo or favicon exists yet. Leave both as plain text comment slots:

```tsx
{/* Logo slot: replace with public/logo.svg once provided */}
```

```html
<!-- Favicon slot: replace with public/favicon.ico once provided -->
```

Never substitute a hardcoded placeholder, an AI-generated symbol or an emoji in either slot.

---

## Interactive Patterns

Apply all four of the following patterns to this project:

1. Mouse parallax on the hero particle field — shift the canvas layer 8 to 12px with cursor movement via useMotionValue and useTransform
2. 3D card tilt on token pair cards — rotateX and rotateY via useSpring for smooth return to rest
3. Magnetic CTA buttons — primary buttons pull toward the cursor within a defined proximity radius
4. AnimatePresence page transitions — blur-in entry 0.4s, fade-out exit 0.3s, mode set to wait

---

## Code Rules

**TypeScript and React:**
- camelCase for all variables and functions
- JSDoc comments on every function and custom hook
- No inline styles unless a CSS variable or dynamic value requires it
- CSS variables used directly in components, never hardcoded hex values
- No hardcoded logos, favicons or symbols anywhere
- No AI-generated icon symbols or emoji used as visual accents

**Writing rules (all frontend copy, labels, comments, JSDoc):**
- British English throughout
- No em dashes anywhere
- Periods only when necessary
- Commas only when necessary
- No filler phrases: no "seamlessly", "leverage", "powerful", "robust", "cutting-edge"
- Dashboard labels short and precise: "Registry", "Pairs", "Balance", "Status"
- CTA text direct: "Wrap", "Unwrap", "Decrypt balance", "Claim tokens", "Connect wallet"
- Error messages plain and helpful: "Could not read registry. Check your connection and try again"
- Empty states honest: "No pairs found. The registry may still be loading"

**Component rules:**
- CSS class-based hover states only. No inline onMouseEnter or onMouseLeave handlers
- Framer Motion for all entrance animations
- Blur-in entrance: `initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}` with `animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}`
- Stagger sequences via Framer Motion staggerChildren on container
- Loading states use skeleton shimmer, not spinners

**Never do these:**
- Never add a logo, favicon or brand mark the user has not provided
- Never hardcode contract addresses in components, always import from contracts.ts
- Never expose a plaintext balance in any console log, network request or component state
- Never write a transaction record before the on-chain transaction confirms
- Never use console.log in production paths

---

## Hackathon Checklist

- Project name: Veil
- Hackathon: Zama Developer Program Mainnet Season 3
- Primary track: Bounty Track
- Cross-submit: Builder Track (separate form)
- Deadline: July 7 2026 23:59 AOE
- Deployment: Sepolia testnet
- Public repo required with README and 3-minute demo video
- X thread or article required per track submission
- Real-person pitch video only (no AI-generated voice)
