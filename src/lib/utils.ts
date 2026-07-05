/**
 * Truncates an Ethereum address to the format 0x123456...7890.
 * @param address - the full 42-character hex address
 * @returns the truncated display string
 */
export function truncateAddress(address: string): string {
  if (!address || address.length < 10) {
    return address
  }
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}
