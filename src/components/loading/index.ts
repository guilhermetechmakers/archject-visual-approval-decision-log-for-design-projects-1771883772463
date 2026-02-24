/**
 * Loading / Skeleton States
 *
 * Reusable, cross-platform Loading and Skeleton system for async content.
 * Use across pages for: global overlays, list/card/table skeletons, inline loaders.
 *
 * @example Page loading
 * import { LoadingOverlay } from '@/components/loading'
 * <LoadingOverlay isOpen={isLoading} title="Loading..." />
 *
 * @example List loading
 * import { SkeletonList } from '@/components/loading'
 * {isLoading ? <SkeletonList items={5} avatar /> : <ItemList items={data} />}
 *
 * @example Card loading
 * import { SkeletonCard } from '@/components/loading'
 * {isLoading ? <SkeletonCard hasHeader hasFooter /> : <ContentCard data={data} />}
 *
 * @example File upload/export
 * import { SkeletonInlineLoader } from '@/components/loading'
 * <SkeletonInlineLoader type="progress" label="Exporting..." progress={45} />
 */

export { Shimmer } from './shimmer'
export { LoadingOverlay } from './loading-overlay'
export { SkeletonList } from './skeleton-list'
export { SkeletonCard } from './skeleton-card'
export { SkeletonTable } from './skeleton-table'
export { SkeletonInlineLoader } from './skeleton-inline-loader'
export { SkeletonImagePlaceholder } from './skeleton-image-placeholder'

export type { ShimmerProps } from './shimmer'
export type { LoadingOverlayProps } from './loading-overlay'
export type { SkeletonListProps } from './skeleton-list'
export type { SkeletonCardProps, SkeletonCardLine } from './skeleton-card'
export type { SkeletonTableProps } from './skeleton-table'
export type { SkeletonInlineLoaderProps } from './skeleton-inline-loader'
export type { SkeletonImagePlaceholderProps } from './skeleton-image-placeholder'
