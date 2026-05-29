import type { CSSProperties } from 'react'
import type { LucideIcon } from 'lucide-react'

interface IconProps {
  icon: LucideIcon
  size?: number
  strokeWidth?: number
  className?: string
  style?: CSSProperties
}

export function Icon({ icon: Lucide, size = 16, strokeWidth = 2, className, style }: IconProps) {
  return (
    <Lucide
      size={size}
      strokeWidth={strokeWidth}
      className={className}
      style={{ display: 'inline-block', flexShrink: 0, ...style }}
      aria-hidden
    />
  )
}
