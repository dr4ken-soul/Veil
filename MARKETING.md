# Veil — Marketing Plan

## Goal

Keep Veil visible during the Zama Developer Program window without sounding like a pitch.

The story is clear: every ERC-20 on the Zama Wrappers Registry already has a confidential wrapper sitting on Sepolia. Nobody had a proper interface for it. Veil is that interface. Every post proves the product works with real on-chain activity.

---

## Posting Style

- all lowercase
- builder voice, not company voice
- one clear idea per post
- short lines with space between thoughts
- show what works, never explain what you plan to build
- screenshots or screen recordings whenever possible

---

## Post Plan

### post 1 — project announcement

```
built veil for zama developer program s3

the zama wrappers registry has every erc-20 to erc-7984 pair already deployed on sepolia

nobody had a clean interface to actually use them

veil surfaces all the pairs, lets you wrap and unwrap in two clicks and decrypts your fhe balance without ever sending the plaintext anywhere

built with the zama sdk on sepolia
```

Attach a screenshot of the live registry page showing real token pairs loaded from the on-chain registry.

---

### post 2 — submission post

```
submitted veil to @zama_fhe developer program s3

wrap any registered erc-20 into its confidential erc-7984 counterpart
decrypt your balance through the eip-712 flow, client-side only
claim testnet tokens from the faucet and start wrapping immediately

the registry is the product now

repo and demo below #ZamaDeveloperProgram
```

Attach the repo link, the live demo URL and the three-minute demo video.

---

## Submission Notes

**Project title:** Veil

**Tagline:** Wrap anything. Reveal nothing.

**Built with:**
- Zama SDK (@zama-fhe/react-sdk)
- wagmi + viem
- React 18
- TypeScript
- Vite
- Framer Motion
- Tailwind CSS
- Sepolia testnet

**Project description (under 200 words):**

Veil is the production-ready interface for the Zama Wrappers Registry on Sepolia. It surfaces every ERC-20 to ERC-7984 wrapper pair registered on-chain, lets users wrap and unwrap any pair, decrypts encrypted balances through the EIP-712 user-decryption flow and includes a Sepolia faucet for the official cTokenMock underlying tokens.

Today developers spin up their own testnet tokens and ERC-7984 wrappers instead of using the ones already in the official registry. That fragments the ecosystem. Veil turns the registry into a product every developer and user can point to.

The wrap flow handles ERC-20 approval and the FHE shield call in two steps. The decrypt flow signs an EIP-712 permit and decrypts the ciphertext balance client-side via the SDK. The plaintext balance never leaves the user's device. The faucet calls the public mint function on each cTokenMock underlying token and tracks a 24-hour cooldown per address. No custom Solidity was written. Every contract was already deployed.

**Demo video flow:**
1. Open the Veil landing page
2. Connect a MetaMask wallet on Sepolia testnet
3. Open the Registry page and show live pair data loading from the chain
4. Claim test tokens from the faucet
5. Wrap the tokens end-to-end, showing both the approval and shield steps
6. Decrypt the wrapped balance via the EIP-712 flow
7. Unwrap the tokens back to ERC-20

---

## Checklist

- [ ] Registry page live with real on-chain data before post 1
- [ ] Wrap and unwrap confirmed working on Sepolia before post 1
- [ ] Post 1 goes out on the same day as deployment
- [ ] Post 2 goes out at submission with repo and demo video
- [ ] Repo is public before either post goes out
- [ ] Demo video under three minutes, real-person narration only
- [ ] Tag @zama_fhe and use #ZamaDeveloperProgram in post 2
