# 404 Not Found Components

## NotFoundPage

**Location:** `src/pages/errors/not-found.tsx`

The main 404 page component. Renders when a user navigates to a non-existent route.

### Behavior

- **Auth-aware primary CTA:** Shows "Go to Dashboard" when authenticated, "Go to Home" when not.
- **Secondary actions:** Search (focuses inline search), Back (uses `history.back()` or falls back to Dashboard/Home).
- **Inline search:** Quick lookup for projects, decisions, or files (mock results for now).
- **Layout:** Full-width centered card with illustration, copy, and actions. Uses `HeaderNav` for global consistency.

### Routes

- `/404` – Explicit 404 route
- `*` – Catch-all for any non-matched path

---

## NotFoundIllustration

**Location:** `src/components/illustrations/not-found-illustration.tsx`

Brand-consistent SVG illustration for 404 and empty states. Dashed path + magnifying glass with "?" motif.

### Props

| Prop    | Type   | Default | Description                    |
|---------|--------|---------|--------------------------------|
| className | string | -     | Additional CSS classes         |
| size    | number | 240    | Width in px (height scales)    |

---

## InlineSearch

**Location:** `src/components/inline-search/inline-search.tsx`

Reusable search component with optional dropdown suggestions. Used on 404 page and can be used elsewhere.

### Props

| Prop       | Type                    | Default                               | Description                          |
|------------|-------------------------|---------------------------------------|--------------------------------------|
| placeholder| string                  | "Search projects, decisions, or files…" | Input placeholder                  |
| results    | SearchResult[]          | -                                     | External results (omit for mock)     |
| onSelect   | (r: SearchResult) => void | -                                   | Called when user selects a result    |
| onSearch   | (query: string) => void | -                                   | Called on Enter (when query not empty) |
| inputRef   | RefObject               | -                                     | Ref to focus input from parent       |
| aria-label | string                  | "Search projects, decisions, or files" | Accessibility label              |

### SearchResult

```ts
interface SearchResult {
  id: string
  title: string
  type: 'project' | 'decision' | 'file'
  href: string
}
```

### Keyboard

- **Enter:** Navigate to selected result (or call `onSearch` if no dropdown)
- **Arrow Up/Down:** Traverse suggestions
- **Escape:** Close dropdown

### Mock Results

When `results` is not provided and the user types, mock results are shown for demo purposes. Wire `results` and `onSearch` for real API integration.
