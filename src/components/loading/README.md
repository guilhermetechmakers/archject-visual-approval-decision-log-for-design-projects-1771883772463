# Loading / Skeleton States

Reusable, cross-platform Loading and Skeleton system for async content. Use across pages for: global overlays, list/card/table skeletons, inline loaders.

## Components

### LoadingOverlay

Full-screen overlay for critical async operations. Renders a dimmed backdrop with centered spinner and optional progress.

**Props:** `isOpen`, `title?`, `progress?`, `blurBackground?`, `dismissible?`, `onDismiss?`

```tsx
// Page loading
<LoadingOverlay isOpen={isLoading} title="Loading..." />

// With progress
<LoadingOverlay isOpen={uploading} title="Uploading..." progress={45} />

// Dismissible (Esc to close)
<LoadingOverlay
  isOpen={loading}
  dismissible
  onDismiss={() => setLoading(false)}
/>
```

### SkeletonList

Vertical list of skeleton rows mimicking data list items.

**Props:** `items?`, `rowHeight?`, `avatar?`, `showActions?`

```tsx
// List loading
{isLoading ? (
  <SkeletonList items={5} avatar showActions />
) : (
  <ItemList items={data} />
)}

// Custom row height
<SkeletonList items={3} rowHeight="h-16" />
<SkeletonList items={3} rowHeight={72} />
```

### SkeletonCard

Card-styled skeleton with header, body lines, and optional footer.

**Props:** `lines?`, `hasHeader?`, `hasFooter?`

```tsx
// Card loading
{isLoading ? (
  <SkeletonCard hasHeader hasFooter lines={[0.9, 0.6, 0.4]} />
) : (
  <ContentCard data={data} />
)}

// Varied line heights
<SkeletonCard
  lines={[
    { width: 1, height: 4 },
    { width: 0.8, height: 3 },
  ]}
/>
```

### SkeletonTable

Table-like skeleton grid with header and body row placeholders.

**Props:** `rows?`, `columns?`, `withHeader?`

```tsx
{isLoading ? (
  <SkeletonTable rows={5} columns={4} withHeader />
) : (
  <DataTable data={data} />
)}
```

### SkeletonInlineLoader

Inline loading indicator for content blocks (uploads, exports).

**Props:** `type?`, `size?`, `label?`, `progress?`

```tsx
// Spinner
<SkeletonInlineLoader type="spinner" size="medium" label="Uploading..." />

// Progress bar
<SkeletonInlineLoader type="progress" label="Exporting..." progress={45} />

// Pulse
<SkeletonInlineLoader type="pulse" size="small" />
```

### SkeletonImagePlaceholder

Placeholder block mimicking image or media thumbnail.

**Props:** `width?`, `height?`, `aspectRatio?`

```tsx
<SkeletonImagePlaceholder aspectRatio="16/9" />
<SkeletonImagePlaceholder width={200} height={150} />
```

### Shimmer

Low-level utility for shimmer animation. Used internally by skeleton components.

```tsx
<Shimmer className="h-4 w-32 rounded" />
<Shimmer duration={2} direction="rtl" className="h-8 w-full" />
```

## Global Loading Context

Use `LoadingProvider` and `useLoading()` for app-wide overlay:

```tsx
// App.tsx
<LoadingProvider>
  <App />
</LoadingProvider>

// Any component
const { showLoading, hideLoading, setProgress } = useLoading()
showLoading({ title: 'Saving...' })
setProgress(50)
hideLoading()

// Dismissible overlay
showLoading({ title: 'Processing...', dismissible: true })
```

## Design Tokens

All components use Archject design tokens:

- **Colors:** muted (#F7F8FA), border (#E6E8F0), warning (#FFE8A3) for progress
- **Spacing:** 8px grid, 24–32px container padding
- **Card:** 12–16px radius, shadows, ≥24px internal padding
