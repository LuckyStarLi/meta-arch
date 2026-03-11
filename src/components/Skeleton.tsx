import './Skeleton.css'

interface SkeletonProps {
  variant?: 'text' | 'circle' | 'rectangle' | 'card' | 'button' | 'input' | 'custom'
  size?: 'sm' | 'base' | 'lg' | 'xl'
  width?: string | number
  height?: string | number
  className?: string
  style?: React.CSSProperties
  animation?: 'wave' | 'pulse' | 'shimmer' | 'none'
  delay?: 0 | 1 | 2 | 3
}

export default function Skeleton({
  variant = 'text',
  size = 'base',
  width,
  height,
  className = '',
  style,
  animation = 'wave',
  delay = 0,
}: SkeletonProps) {
  const classes = [
    'skeleton',
    variant !== 'custom' && `skeleton-${variant}`,
    variant !== 'custom' && variant !== 'card' && `skeleton-${variant}--${size}`,
    animation === 'pulse' && 'skeleton--pulse',
    animation === 'shimmer' && 'skeleton--shimmer',
    delay > 0 && `skeleton--delay-${delay}`,
    className,
  ].filter(Boolean).join(' ')

  const combinedStyle: React.CSSProperties = {
    width,
    height,
    ...style,
  }

  if (variant === 'card') {
    return (
      <div className={classes} style={combinedStyle}>
        <div className="skeleton-card__header">
          <div className="skeleton-card__avatar skeleton skeleton-circle skeleton-circle--base" />
          <div className="skeleton-card__title skeleton skeleton-text" />
        </div>
        <div className="skeleton-card__content">
          <div className="skeleton-card__line skeleton skeleton-text" />
          <div className="skeleton-card__line skeleton skeleton-text" />
          <div className="skeleton-card__line skeleton skeleton-text skeleton-card__line--short" />
        </div>
      </div>
    )
  }

  return (
    <div
      className={classes}
      style={combinedStyle}
      role="progressbar"
      aria-busy="true"
      aria-label="Loading..."
    />
  )
}

// 复合组件 - 列表骨架屏
interface SkeletonListProps {
  count?: number
  avatar?: boolean
}

export function SkeletonList({ count = 5, avatar = true }: SkeletonListProps) {
  return (
    <div className="skeleton-list">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-list__item">
          {avatar && (
            <div className="skeleton-list__avatar skeleton skeleton-circle skeleton-circle--sm" />
          )}
          <div className="skeleton-list__content">
            <div className="skeleton-list__line skeleton skeleton-text" />
            <div className="skeleton-list__line skeleton skeleton-text skeleton-list__line--short" />
          </div>
        </div>
      ))}
    </div>
  )
}

// 复合组件 - 表格骨架屏
interface SkeletonTableProps {
  rows?: number
  columns?: number
}

export function SkeletonTable({ rows = 5, columns = 4 }: SkeletonTableProps) {
  return (
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="skeleton-table__row">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className={`skeleton-table__cell skeleton skeleton-text ${
                colIndex === 0 ? 'skeleton-table__cell--sm' : colIndex === columns - 1 ? 'skeleton-table__cell--lg' : ''
              }`}
            />
          ))}
        </div>
      ))}
    </div>
  )
}

// 复合组件 - 卡片骨架屏
interface SkeletonCardsProps {
  count?: number
  columns?: number
}

export function SkeletonCards({ count = 4, columns = 3 }: SkeletonCardsProps) {
  return (
    <div
      className="skeleton-page__content"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(300px, 1fr))`,
      }}
    >
      {Array.from({ length: count }).map((_, index) => (
        <Skeleton key={index} variant="card" />
      ))}
    </div>
  )
}

// 复合组件 - 页面骨架屏
interface SkeletonPageProps {
  showHeader?: boolean
  cardCount?: number
}

export function SkeletonPage({ showHeader = true, cardCount = 4 }: SkeletonPageProps) {
  return (
    <div className="skeleton-page">
      {showHeader && (
        <div className="skeleton-page__header">
          <div className="skeleton-page__title skeleton skeleton-text skeleton-text--xl" />
          <div className="skeleton-page__actions">
            <div className="skeleton-button skeleton skeleton-button--sm" />
            <div className="skeleton-button skeleton skeleton-button--sm" />
          </div>
        </div>
      )}
      <SkeletonCards count={cardCount} />
    </div>
  )
}
