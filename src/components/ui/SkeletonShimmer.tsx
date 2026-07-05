interface SkeletonShimmerProps {
  className?: string
}

/**
 * SkeletonShimmer component that renders a shimmering placeholder card/element.
 * Used for loading states in compliance with design guidelines.
 * @param props - Custom styles or sizes.
 * @returns React JSX Element.
 */
export function SkeletonShimmer({ className = '' }: SkeletonShimmerProps) {
  return <div className={`skeleton-shimmer rounded-[var(--radius-md)] ${className}`} />
}
