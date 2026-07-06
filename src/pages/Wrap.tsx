import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAccount, useReadContract, useChainId } from 'wagmi'
import { sepolia } from 'wagmi/chains'
import { parseUnits, formatUnits } from 'viem'
import { useRegistry } from '../hooks/useRegistry'
import { useWrap } from '../hooks/useWrap'
import { useDecryptBalance } from '../hooks/useDecryptBalance'
import { ERC20_ABI } from '../lib/contracts'
import { AppNav } from '../components/layout/AppNav'
import { FadeIn } from '../components/ui/FadeIn'
import { WrongNetworkBanner } from '../components/ui/WrongNetworkBanner'
import { truncateAddress } from '../lib/utils'

/**
 * Wrap Page Component.
 * Allows users to wrap (shield) and unwrap (unshield) assets.
 * Fetches balances, handles approvals, executes transactions, and shows step progress.
 * @returns React JSX Element.
 */
export default function Wrap() {
  const { address, isConnected } = useAccount()
  const chainId = useChainId()
  const isWrongNetwork = chainId !== sepolia.id
  const { pairs, isLoading: registryLoading } = useRegistry()
  const [searchParams] = useSearchParams()

  const [selectedPairAddress, setSelectedPairAddress] = useState<string>('')
  const [direction, setDirection] = useState<'wrap' | 'unwrap'>('wrap')
  const [amount, setAmount] = useState<string>('')

  // Find selected pair object
  const selectedPair = pairs.find(
    (p) => p.wrapperAddress.toLowerCase() === selectedPairAddress.toLowerCase()
  ) || null

  // Wrap hook
  const { wrap, unwrap, reset: resetWrap, step, error: wrapError, approveHash, executeHash } = useWrap(selectedPair)

  // Decrypt balance hook for wrapped asset
  const {
    balance: wrappedDecryptedBalance,
    isLoading: isDecrypting,
    decrypt: decryptWrappedBalance,
    error: decryptError,
  } = useDecryptBalance(selectedPair ? selectedPair.wrapperAddress : null)

  // Read underlying ERC-20 balance
  const { data: underlyingBalance, refetch: refetchUnderlying } = useReadContract({
    address: selectedPair?.underlyingAddress,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: {
      enabled: !!selectedPair && !!address,
    },
  })

  // Pre-fill selected pair address from query parameter if present
  useEffect(() => {
    const pairParam = searchParams.get('pair')
    if (pairParam) {
      setSelectedPairAddress(pairParam)
    } else if (pairs.length > 0 && !selectedPairAddress) {
      setSelectedPairAddress(pairs[0].wrapperAddress)
    }
  }, [searchParams, pairs, selectedPairAddress])

  // Refetch balances after transaction completes
  useEffect(() => {
    if (step === 'execute-confirmed') {
      refetchUnderlying()
    }
  }, [step, refetchUnderlying])

  // Reset wrap hook state when switching pairs, directions, or amounts
  const handlePairChange = (addr: string) => {
    setSelectedPairAddress(addr)
    setAmount('')
    resetWrap()
  }

  const handleDirectionChange = (dir: 'wrap' | 'unwrap') => {
    setDirection(dir)
    setAmount('')
    resetWrap()
  }

  const handleAmountChange = (val: string) => {
    setAmount(val)
    if (step === 'execute-confirmed' || wrapError) {
      resetWrap()
    }
  }

  // Handle action trigger
  const handleAction = async () => {
    if (!selectedPair || !amount) return
    const parsedAmount = parseUnits(amount, selectedPair.decimals)

    if (direction === 'wrap') {
      if (step === 'idle') {
        await wrap(parsedAmount)
      } else if (step === 'approve-confirmed') {
        // Step 2 of wrap
        await wrap(parsedAmount)
      }
    } else {
      await unwrap(parsedAmount)
    }
  }

  // Formatting balances
  const displayUnderlyingBalance =
    underlyingBalance !== undefined && selectedPair
      ? formatUnits(underlyingBalance, selectedPair.decimals)
      : '0.00'

  const displayWrappedBalance =
    wrappedDecryptedBalance !== null && selectedPair
      ? formatUnits(wrappedDecryptedBalance, selectedPair.decimals)
      : null

  // Determine helper text for primary action button
  let buttonLabel = direction === 'wrap' ? 'Approve & Wrap' : 'Unwrap'
  if (direction === 'wrap') {
    if (step === 'idle') buttonLabel = 'Approve ERC-20'
    else if (step === 'approve-signing') buttonLabel = 'Signing Approval...'
    else if (step === 'approve-confirming') buttonLabel = 'Confirming Approval...'
    else if (step === 'approve-confirmed') buttonLabel = 'Wrap Asset (Shield)'
    else if (step === 'execute-signing') buttonLabel = 'Signing Wrap...'
    else if (step === 'execute-confirming') buttonLabel = 'Confirming Wrap...'
    else if (step === 'execute-confirmed') buttonLabel = 'Transaction Confirmed'
  } else {
    if (step === 'idle') buttonLabel = 'Unwrap Asset (Unshield)'
    else if (step === 'execute-signing') buttonLabel = 'Signing Unwrap...'
    else if (step === 'execute-confirming') buttonLabel = 'Confirming Unwrap...'
    else if (step === 'execute-confirmed') buttonLabel = 'Transaction Confirmed'
  }

  const isButtonDisabled =
    !isConnected ||
    isWrongNetwork ||
    !amount ||
    registryLoading ||
    ['approve-signing', 'approve-confirming', 'execute-signing', 'execute-confirming'].includes(step)

  return (
    <FadeIn className="min-h-screen pt-28 pb-16 bg-[var(--bg-primary)] text-[var(--text-primary)] relative z-10">
      <AppNav />
      <WrongNetworkBanner />

      <main className="max-w-xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10 text-center">
          <h1 className="font-display font-bold text-4xl text-[var(--text-primary)] mb-2 mt-0">
            Wrap
          </h1>
          <p className="font-body text-[var(--text-secondary)]">
            Shield your ERC-20s or unshield back to public tokens
          </p>
        </div>

        <div className="liquid-glass rounded-[var(--radius-lg)] p-8">
          {/* Direction Toggle */}
          <div className="flex bg-[var(--bg-secondary)] p-1 rounded-[var(--radius-md)] border border-[var(--border-default)] mb-6">
            <button
              onClick={() => handleDirectionChange('wrap')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-sm)] transition-all cursor-pointer ${
                direction === 'wrap'
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Wrap
            </button>
            <button
              onClick={() => handleDirectionChange('unwrap')}
              className={`flex-1 py-2 text-xs font-semibold uppercase tracking-wider rounded-[var(--radius-sm)] transition-all cursor-pointer ${
                direction === 'unwrap'
                  ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              Unwrap
            </button>
          </div>

          {/* Pair Selector */}
          <div className="mb-6">
            <label className="block font-display text-xs text-[var(--text-secondary)] uppercase tracking-wider mb-2">
              Select Token Pair
            </label>
            {registryLoading ? (
              <div className="h-10 skeleton-shimmer rounded-[var(--radius-md)]" />
            ) : (
              <select
                value={selectedPairAddress}
                onChange={(e) => handlePairChange(e.target.value)}
                className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3 outline-none focus:border-[var(--accent)] font-body text-sm"
              >
                {pairs.map((p) => (
                  <option key={p.wrapperAddress} value={p.wrapperAddress}>
                    {p.name} ({p.symbol} &harr; {p.symbol})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Input Amount */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline mb-2">
              <label className="font-display text-xs text-[var(--text-secondary)] uppercase tracking-wider">
                Amount
              </label>
              <span className="font-body text-xs text-[var(--text-secondary)]">
                {direction === 'wrap' ? (
                  <>Available: {displayUnderlyingBalance} {selectedPair?.symbol}</>
                ) : (
                  <>
                    Wrapped:{' '}
                    {displayWrappedBalance !== null ? (
                      `${displayWrappedBalance} ${selectedPair?.symbol}`
                    ) : (
                      <button
                        onClick={decryptWrappedBalance}
                        disabled={isDecrypting || !isConnected}
                        className="text-[var(--accent)] bg-transparent border-none cursor-pointer hover:underline outline-none"
                      >
                        {isDecrypting ? 'Decrypting...' : '[Decrypt]'}
                      </button>
                    )}
                  </>
                )}
              </span>
            </div>

            <div className="relative">
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                disabled={!isConnected}
                className="w-full bg-[var(--bg-surface)] text-[var(--text-primary)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-4 py-3 outline-none focus:border-[var(--accent)] font-mono text-sm pr-16 disabled:opacity-50"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-xs text-[var(--text-secondary)] uppercase">
                {selectedPair?.symbol}
              </span>
            </div>
            {decryptError && (
              <span className="block text-[var(--error)] text-[10px] mt-1">
                Decryption failed: {decryptError.message}
              </span>
            )}
          </div>

          {/* Stepper Progress Bar (Only visible if wrap is active or finished) */}
          {direction === 'wrap' && step !== 'idle' && (
            <div className="mb-8 border border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--bg-secondary)] p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-body text-[var(--text-secondary)]">Step 1: Approve Underlying Token</span>
                <span className="font-mono font-medium text-[var(--accent)]">
                  {step.startsWith('approve-')
                    ? step === 'approve-signing'
                      ? 'Signing...'
                      : step === 'approve-confirming'
                      ? 'Confirming...'
                      : 'Confirmed'
                    : 'Confirmed'}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full transition-all duration-500"
                  style={{
                    width: step.startsWith('approve-')
                      ? step === 'approve-signing'
                        ? '25%'
                        : step === 'approve-confirming'
                        ? '50%'
                        : '100%'
                      : '100%',
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-xs pt-2">
                <span className="font-body text-[var(--text-secondary)]">Step 2: Shield to Wrapper Contract</span>
                <span className="font-mono font-medium text-[var(--accent)]">
                  {step.startsWith('execute-')
                    ? step === 'execute-signing'
                      ? 'Signing...'
                      : step === 'execute-confirming'
                      ? 'Confirming...'
                      : 'Confirmed'
                    : 'Awaiting Step 1'}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full transition-all duration-500"
                  style={{
                    width: step.startsWith('execute-')
                      ? step === 'execute-signing'
                        ? '33%'
                        : step === 'execute-confirming'
                        ? '66%'
                        : '100%'
                      : '0%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Stepper Progress Bar (For Unwrap) */}
          {direction === 'unwrap' && step !== 'idle' && (
            <div className="mb-8 border border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--bg-secondary)] p-4 space-y-4">
              <div className="flex justify-between items-center text-xs">
                <span className="font-body text-[var(--text-secondary)]">Step 1: Unshield from Wrapper</span>
                <span className="font-mono font-medium text-[var(--accent)]">
                  {step === 'execute-signing'
                    ? 'Signing...'
                    : step === 'execute-confirming'
                    ? 'Confirming...'
                    : 'Confirmed'}
                </span>
              </div>
              <div className="w-full bg-[var(--bg-surface)] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[var(--accent)] h-full transition-all duration-500"
                  style={{
                    width:
                      step === 'execute-signing' ? '33%' : step === 'execute-confirming' ? '66%' : '100%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Action Trigger Button */}
          <button
            onClick={handleAction}
            disabled={isButtonDisabled}
            className="w-full py-4 bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-[var(--bg-primary)] font-body font-semibold text-sm uppercase tracking-wider rounded-[var(--radius-md)] border-none outline-none transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-[var(--shadow-md)]"
          >
            {isConnected ? buttonLabel : 'Connect Wallet to Wrap'}
          </button>

          {/* Error and Confirmation Displays */}
          {wrapError && (
            <p className="text-[var(--error)] text-xs text-center mt-4 font-body">
              {wrapError.message || 'Transaction failed'}
            </p>
          )}

          {step === 'execute-confirmed' && (
            <div className="mt-6 text-center space-y-2">
              <p className="text-[var(--success)] text-xs font-semibold uppercase tracking-wider font-body">
                Transaction Confirmed Successfully
              </p>
              {approveHash && (
                <div className="text-xs">
                  <span className="text-[var(--text-secondary)] font-body">Approve: </span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${approveHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[var(--accent)] hover:underline text-[10px]"
                  >
                    {truncateAddress(approveHash)}
                  </a>
                </div>
              )}
              {executeHash && (
                <div className="text-xs">
                  <span className="text-[var(--text-secondary)] font-body">
                    {direction === 'wrap' ? 'Shield' : 'Unshield'}:{' '}
                  </span>
                  <a
                    href={`https://sepolia.etherscan.io/tx/${executeHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[var(--accent)] hover:underline text-[10px]"
                  >
                    {truncateAddress(executeHash)}
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </FadeIn>
  )
}
