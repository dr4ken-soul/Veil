# Veil — Frontend Spec

## Design Gates Summary

All seven gates confirmed.

| Gate | Decision |
|---|---|
| 1 | Dark editorial |
| 2 | Combined hairline and vertical-split nav |
| 3 | Particle field on landing, static atmospheric on app interior |
| 4 | Syne + Outfit + JetBrains Mono |
| 5 | Void Slate palette |
| 6 | Centre-anchored hero with cursor parallax |
| 7 | Hero, Registry Preview, Protocol Strip, How It Works, CTA on landing. Registry, Wrap, Faucet in app interior |

---

## Typography

```html
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

| Role | Font | Weights |
|---|---|---|
| Display | Syne | 600, 700, 800 |
| Body | Outfit | 300, 400, 500, 600 |
| Mono | JetBrains Mono | 400, 500 |

Apply fonts via CSS variables set on `:root`:

```css
--font-display: 'Syne', sans-serif;
--font-body: 'Outfit', sans-serif;
--font-mono: 'JetBrains Mono', monospace;
```

---

## Colour System — Void Slate

```css
:root {
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

  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  14px;
  --radius-xl:  20px;
  --radius-2xl: 32px;

  --shadow-sm:  0 2px 8px rgba(0, 0, 0, 0.4);
  --shadow-md:  0 8px 24px rgba(0, 0, 0, 0.5);
  --shadow-lg:  0 20px 60px rgba(0, 0, 0, 0.6);

  --duration-fast:   120ms;
  --duration-normal: 280ms;
  --duration-slow:   500ms;
}
```

Never use a hardcoded hex value in any component. Always reference a CSS variable.

---

## globals.css

```css
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=Outfit:wght@300;400;500;600&family=JetBrains+Mono:wght@400;500&display=swap');

*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-body);
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}

/* Grain overlay — app interior only */
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

/* Radial glow — app interior only */
body.app-interior::before {
  content: '';
  position: fixed;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 600px;
  height: 400px;
  background: radial-gradient(ellipse, var(--accent-glow) 0%, transparent 70%);
  pointer-events: none;
  z-index: 0;
}

/* Liquid glass utility classes */
.liquid-glass {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-default);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.liquid-glass-strong {
  background: rgba(255, 255, 255, 0.07);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}

.liquid-glass-dark {
  background: rgba(7, 8, 16, 0.7);
  border: 1px solid var(--border-subtle);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

/* Skeleton shimmer */
.skeleton-shimmer {
  background: linear-gradient(
    90deg,
    var(--bg-surface) 0%,
    var(--bg-elevated) 50%,
    var(--bg-surface) 100%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```

---

## Navigation

### LandingNav.tsx

A fixed top bar that serves as the primary nav on the landing page.

**Structure:**
- Full-width dark glass bar with no blur, 0.5px bottom border in `--border-subtle`
- The bottom border has opacity 0 initially and transitions to opacity 1 when the user scrolls past 80px via an `onScroll` event on `window`
- A single thin vertical rule sits at the horizontal centre of the bar, 24px tall, colour `--border-default`
- Left zone: Veil wordmark in Syne 600, colour `--text-primary`
- Right zone: Connect Wallet as a text link with `--accent` colour and an underline that appears on hover via a CSS class

```tsx
/**
 * Landing page navigation bar.
 * Dark glass bar with a centre vertical rule.
 * The bottom border fades in on scroll past 80px.
 */
export function LandingNav()
```

Logo slot:
```tsx
{/* Logo slot: replace with public/logo.svg once provided */}
<span className="font-display font-semibold text-lg tracking-tight text-[var(--text-primary)]">
  Veil
</span>
```

### AppNav.tsx

The app interior navigation. Uses the same dark glass bar as LandingNav but with a different centre zone.

**Structure:**
- The vertical rule is replaced by the active page name in Syne 600, colour `--accent`
- A 2px top-border tick in `--accent` sits above the active page name
- Other pages appear as text links in JetBrains Mono 400, colour `--text-muted`, positioned to the left and right of the active page name
- Wallet address shown far right in JetBrains Mono, shortened to first 6 and last 4 characters

Active page tick:
```css
.nav-tab-active {
  color: var(--accent);
  border-top: 2px solid var(--accent);
  padding-top: 2px;
}
```

```tsx
/**
 * App interior navigation bar.
 * Active page name in accent replaces the centre vertical rule.
 * Inactive pages render as muted monospace tags on either side.
 */
export function AppNav()
```

---

## Background

### Landing: ParticleField

The particle field renders on a full-viewport HTML canvas element positioned absolutely behind all landing page content.

**Particle properties:**
- Count: 80 particles maximum
- Size: 1.5 to 2.5px radius, randomised per particle
- Colour: `#6ee7f7` (the accent) at 30 to 60 percent opacity, randomised per particle
- Movement: each particle drifts upward at 0.1 to 0.3px per frame with a slow horizontal drift
- Particles wrap to the bottom when they exit the top edge

**Connection lines:**
- If two particles are within 120px of each other a line draws between them
- Line colour: `#6ee7f7` at opacity proportional to proximity — full opacity at 0px apart, zero opacity at 120px apart
- Line width: 0.5px

**Cursor parallax:**
- The canvas element sits inside a `motion.div`
- `useMotionValue` tracks cursor X and Y
- `useTransform` maps cursor position to a translate range of -10px to 10px on X and -6px to 6px on Y
- Apply `useSpring` to smooth the motion

**Implementation note:**
Use `requestAnimationFrame` for the animation loop. Cancel it with the return value of `useEffect`. Do not use `useState` for particle positions as it causes unnecessary re-renders. Use a `useRef` for the particle array and the canvas context.

```typescript
/**
 * Renders an animated particle field on a full-viewport canvas.
 * Particles drift upward slowly and connect when within 120px.
 * The canvas layer responds to cursor movement via Framer Motion parallax.
 */
export function ParticleField()
```

### App Interior: Atmospheric

- Base colour: `--bg-primary`
- Radial glow: centred behind main content area, applied via `body.app-interior::before` as specified in globals.css
- Grain: applied via `body.app-interior::after` as specified in globals.css
- No animated elements

Toggle the `app-interior` class on `body` inside `useEffect` in the root layout component when the user navigates into the app. Remove it on unmount.

---

## Interactive Patterns

### 1. Mouse Parallax (Hero particle field)

```typescript
const mouseX = useMotionValue(0)
const mouseY = useMotionValue(0)
const fieldX = useTransform(mouseX, [0, window.innerWidth], [-10, 10])
const fieldY = useTransform(mouseY, [0, window.innerHeight], [-6, 6])
const springFieldX = useSpring(fieldX, { stiffness: 80, damping: 20 })
const springFieldY = useSpring(fieldY, { stiffness: 80, damping: 20 })
```

Apply `springFieldX` and `springFieldY` to the `motion.div` wrapping the canvas. Never use `useState` for cursor tracking.

### 2. 3D Card Tilt (Token pair cards on Registry page and RegistryPreview section)

```typescript
/**
 * Returns rotateX and rotateY motion values for a 3D card tilt effect.
 * Attach onMouseMove and onMouseLeave to the card's outer div.
 * Apply rotateX, rotateY and transformPerspective to the card's motion.div.
 */
export function useCardTilt()
```

```typescript
const x = useMotionValue(0)
const y = useMotionValue(0)
const rotateX = useSpring(useTransform(y, [-50, 50], [5, -5]), { stiffness: 150, damping: 20 })
const rotateY = useSpring(useTransform(x, [-50, 50], [-5, 5]), { stiffness: 150, damping: 20 })
```

Wrap the card content in:
```tsx
<motion.div style={{ rotateX, rotateY, transformPerspective: 900 }}>
```

On mouse leave set `x.set(0)` and `y.set(0)`.

### 3. Magnetic CTA Buttons

Apply to the primary Launch App CTA on the landing page and the Wrap and Claim buttons in the app interior.

```typescript
/**
 * Applies a magnetic pull effect to a button element.
 * The button translates up to 6px toward the cursor when hovered within its bounds.
 * Uses Framer Motion useMotionValue and useSpring for smooth interpolation.
 */
export function useMagneticButton(ref: React.RefObject<HTMLElement>)
```

Cap the translation at 6px in any direction. Never apply to secondary or ghost buttons.

### 4. AnimatePresence Page Transitions

Wrap the router outlet in `AnimatePresence` with `mode="wait"`. Every page component wraps its root element in:

```tsx
<motion.div
  initial={{ opacity: 0, filter: 'blur(6px)', y: 12 }}
  animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
  exit={{ opacity: 0, filter: 'blur(4px)', y: -8 }}
  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
>
```

---

## Landing Page Sections

### Hero

- Full-viewport height, `--bg-primary` base
- `ParticleField` canvas fills the full viewport, positioned absolute behind content
- Content sits at the horizontal centre, vertically centred
- Logo slot above the wordmark (comment slot only until Paul provides the file)
- Wordmark "Veil" in Syne 800, large
- Tagline "Wrap anything. Reveal nothing." in Outfit 300, `--text-secondary`
- One CTA button below the tagline: "Launch app" with magnetic button effect

Stagger sequence via Framer Motion `staggerChildren`:
- Wordmark: delay 0.2s
- Tagline: delay 0.4s
- CTA: delay 0.6s

All elements use the blur-in entrance: `initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}`.

### RegistryPreview

Live pair cards from the `useRegistry` hook. Display the first six pairs. Each card shows the token name, symbol and both addresses in JetBrains Mono shortened to six characters each side with a copy button. Apply 3D card tilt to each card. A "View all pairs" link routes to `/app/registry`.

Load state: display six skeleton shimmer cards while the hook is loading.

### ProtocolStrip

Three columns in a row separated by thin vertical borders in `--border-subtle`:

1. FHE encryption — "Your balance becomes an encrypted integer only you can decrypt"
2. ERC-7984 standard — "Every wrapper pair is registered on-chain and readable by anyone"
3. EIP-712 decryption — "A signed permit unlocks your balance client-side without touching the chain"

Column header in Syne 600. Body copy in Outfit 400. Use scroll-triggered stagger reveal.

### HowItWorks

Three steps in a row:

1. Step `01` — "Claim testnet tokens from the faucet"
2. Step `02` — "Wrap any ERC-20 into its confidential counterpart"
3. Step `03` — "Decrypt your balance privately at any time"

Step numbers in JetBrains Mono 500, `--accent`. Step titles in Syne 600. Use scroll-triggered stagger reveal with useInView set to `once: true`.

### LandingCta

A full-width dark panel with liquid-glass-strong styling. The tagline "Wrap anything. Reveal nothing." in Syne 700, large. A single "Launch app" button below it.

---

## App Interior Pages

### Registry (/app/registry)

- Page title "Registry" in Syne 700
- Subtitle line "All registered wrapper pairs on Sepolia" in Outfit 400, `--text-secondary`
- Search input filtering by name or symbol, full width on mobile
- Pair cards in a responsive grid: 1 column mobile, 2 columns tablet, 3 columns desktop
- Each card: token name in Syne 600, symbol in JetBrains Mono, ERC-20 and ERC-7984 addresses in JetBrains Mono with copy buttons, a Decrypt balance button and a Wrap button
- Decrypt balance button triggers the EIP-712 flow inline and reveals the decrypted amount in `--success` below the button once confirmed
- 3D card tilt on all cards
- Skeleton shimmer for all cards while loading

### Wrap (/app/wrap)

- Page title "Wrap" in Syne 700
- A pair selector dropdown showing all registry pairs, pre-filled from query param if present
- Direction toggle with two options: Wrap (ERC-20 to ERC-7984) and Unwrap (ERC-7984 to ERC-20)
- Amount input in Outfit, labelled with the token symbol
- Available balance shown below the input as a small Outfit 400 line
- A two-step progress bar showing Approve and Wrap steps. Each step cycles through states: idle, awaiting signature, confirming, confirmed
- A single primary action button labelled "Approve" in step one and "Wrap" or "Unwrap" in step two
- Transaction hash shown in JetBrains Mono with an Etherscan link once confirmed

### Faucet (/app/faucet)

- Page title "Faucet" in Syne 700
- Subtitle "Claim testnet tokens to start wrapping" in Outfit 400, `--text-secondary`
- Token cards in a grid: each shows the underlying ERC-20 name, symbol, mock contract address and a Claim button
- Claim button transitions to a countdown timer after a successful claim showing hours and minutes remaining
- A small `--success` confirmation line appears below the button on successful mint

---

## Component Patterns

### Entrance Animations

All section content uses the blur-in entrance:

```tsx
initial={{ opacity: 0, filter: 'blur(8px)', y: 20 }}
animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
```

Stagger children via the container variant:

```tsx
const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
```

### Loading States

All loading states use skeleton shimmer via the `.skeleton-shimmer` class applied to a div at the same dimensions as the content it replaces. Never use a spinner.

### Error States

Error messages are short, plain and placed directly below the action that failed. Colour `--error`. No modal overlays for errors.

### Address Display

All wallet addresses and contract addresses render in JetBrains Mono 400 at a reduced font size. Truncate to `0x123456...7890` format. Include a copy icon button that copies the full address to clipboard and shows a brief `--success` tick for 1.5 seconds via a local boolean state.

```typescript
/**
 * Truncates an Ethereum address to the format 0x123456...7890.
 * @param address - the full 42-character hex address
 * @returns the truncated display string
 */
export function truncateAddress(address: string): string
```

---

## Tailwind Config

```typescript
import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        display: ['Syne', 'sans-serif'],
        body: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
    },
  },
  plugins: [],
}

export default config
```

Use Tailwind for layout, spacing and responsive breakpoints. Use CSS variables directly for colours rather than extending the Tailwind theme with them. This keeps all colour references consistent and avoids duplication.

---

## vite.config.ts

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    global: 'globalThis',  // required by the Zama SDK in browser environments
  },
})
```

The `global: 'globalThis'` define is required for the Zama SDK and snarkjs-style libraries that expect a Node.js global environment.
