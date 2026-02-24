# Modern Design Best Practices

## Philosophy

Create unique, memorable experiences while maintaining consistency through modern design principles. Every project should feel distinct yet professional, innovative yet intuitive.

---

## Landing Pages & Marketing Sites

### Hero Sections
**Go beyond static backgrounds:**
- Animated gradients with subtle movement
- Particle systems or geometric shapes floating
- Interactive canvas backgrounds (Three.js, WebGL)
- Video backgrounds with proper fallbacks
- Parallax scrolling effects
- Gradient mesh animations
- Morphing blob animations


### Layout Patterns
**Use modern grid systems:**
- Bento grids (asymmetric card layouts)
- Masonry layouts for varied content
- Feature sections with diagonal cuts or curves
- Overlapping elements with proper z-index
- Split-screen designs with scroll-triggered reveals

**Avoid:** Traditional 3-column equal grids

### Scroll Animations
**Engage users as they scroll:**
- Fade-in and slide-up animations for sections
- Scroll-triggered parallax effects
- Progress indicators for long pages
- Sticky elements that transform on scroll
- Horizontal scroll sections for portfolios
- Text reveal animations (word by word, letter by letter)
- Number counters animating into view

**Avoid:** Static pages with no scroll interaction

### Call-to-Action Areas
**Make CTAs impossible to miss:**
- Gradient buttons with hover effects
- Floating action buttons with micro-interactions
- Animated borders or glowing effects
- Scale/lift on hover
- Interactive elements that respond to mouse position
- Pulsing indicators for primary actions

---

## Dashboard Applications

### Layout Structure
**Always use collapsible side navigation:**
- Sidebar that can collapse to icons only
- Smooth transition animations between states
- Persistent navigation state (remember user preference)
- Mobile: drawer that slides in/out
- Desktop: sidebar with expand/collapse toggle
- Icons visible even when collapsed

**Structure:**
```
/dashboard (layout wrapper with sidebar)
  /dashboard/overview
  /dashboard/analytics
  /dashboard/settings
  /dashboard/users
  /dashboard/projects
```

All dashboard pages should be nested inside the dashboard layout, not separate routes.

### Data Tables
**Modern table design:**
- Sticky headers on scroll
- Row hover states with subtle elevation
- Sortable columns with clear indicators
- Pagination with items-per-page control
- Search/filter with instant feedback
- Selection checkboxes with bulk actions
- Responsive: cards on mobile, table on desktop
- Loading skeletons, not spinners
- Empty states with illustrations or helpful text

**Use modern table libraries:**
- TanStack Table (React Table v8)
- AG Grid for complex data
- Data Grid from MUI (if using MUI)

### Charts & Visualizations
**Use the latest charting libraries:**
- Recharts (for React, simple charts)
- Chart.js v4 (versatile, well-maintained)
- Apache ECharts (advanced, interactive)
- D3.js (custom, complex visualizations)
- Tremor (for dashboards, built on Recharts)

**Chart best practices:**
- Animated transitions when data changes
- Interactive tooltips with detailed info
- Responsive sizing
- Color scheme matching design system
- Legend placement that doesn't obstruct data
- Loading states while fetching data

### Dashboard Cards
**Metric cards should stand out:**
- Gradient backgrounds or colored accents
- Trend indicators (↑ ↓ with color coding)
- Sparkline charts for historical data
- Hover effects revealing more detail
- Icon representing the metric
- Comparison to previous period

---

## Color & Visual Design

### Color Palettes
**Create depth with gradients:**
- Primary gradient (not just solid primary color)
- Subtle background gradients
- Gradient text for headings
- Gradient borders on cards
- Elevated surfaces for depth

**Color usage:**
- 60-30-10 rule (dominant, secondary, accent)
- Consistent semantic colors (success, warning, error)
- Accessible contrast ratios (WCAG AA minimum)

### Typography
**Create hierarchy through contrast:**
- Large, bold headings (48-72px for heroes)
- Clear size differences between levels
- Variable font weights (300, 400, 600, 700)
- Letter spacing for small caps
- Line height 1.5-1.7 for body text
- Inter, Poppins, or DM Sans for modern feel

### Shadows & Depth
**Layer UI elements:**
- Multi-layer shadows for realistic depth
- Colored shadows matching element color
- Elevated states on hover
- Neumorphism for special elements (sparingly)

---

## Interactions & Micro-animations

### Button Interactions
**Every button should react:**
- Scale slightly on hover (1.02-1.05)
- Lift with shadow on hover
- Ripple effect on click
- Loading state with spinner or progress
- Disabled state clearly visible
- Success state with checkmark animation

### Card Interactions
**Make cards feel alive:**
- Lift on hover with increased shadow
- Subtle border glow on hover
- Tilt effect following mouse (3D transform)
- Smooth transitions (200-300ms)
- Click feedback for interactive cards

### Form Interactions
**Guide users through forms:**
- Input focus states with border color change
- Floating labels that animate up
- Real-time validation with inline messages
- Success checkmarks for valid inputs
- Error states with shake animation
- Password strength indicators
- Character count for text areas

### Page Transitions
**Smooth between views:**
- Fade + slide for page changes
- Skeleton loaders during data fetch
- Optimistic UI updates
- Stagger animations for lists
- Route transition animations

---

## Mobile Responsiveness

### Mobile-First Approach
**Design for mobile, enhance for desktop:**
- Touch targets minimum 44x44px
- Generous padding and spacing
- Sticky bottom navigation on mobile
- Collapsible sections for long content
- Swipeable cards and galleries
- Pull-to-refresh where appropriate

### Responsive Patterns
**Adapt layouts intelligently:**
- Hamburger menu → full nav bar
- Card grid → stack on mobile
- Sidebar → drawer
- Multi-column → single column
- Data tables → card list
- Hide/show elements based on viewport

---

## Loading & Empty States

### Loading States
**Never leave users wondering:**
- Skeleton screens matching content layout
- Progress bars for known durations
- Animated placeholders
- Spinners only for short waits (<3s)
- Stagger loading for multiple elements
- Shimmer effects on skeletons

### Empty States
**Make empty states helpful:**
- Illustrations or icons
- Helpful copy explaining why it's empty
- Clear CTA to add first item
- Examples or suggestions
- No "no data" text alone

---

## Unique Elements to Stand Out

### Distinctive Features
**Add personality:**
- Custom cursor effects on landing pages
- Animated page numbers or section indicators
- Unusual hover effects (magnification, distortion)
- Custom scrollbars
- Glassmorphism for overlays
- Animated SVG icons
- Typewriter effects for hero text
- Confetti or celebration animations for actions

### Interactive Elements
**Engage users:**
- Drag-and-drop interfaces
- Sliders and range controls
- Toggle switches with animations
- Progress steps with animations
- Expandable/collapsible sections
- Tabs with slide indicators
- Image comparison sliders
- Interactive demos or playgrounds

---

## Consistency Rules

### Maintain Consistency
**What should stay consistent:**
- Spacing scale (4px, 8px, 16px, 24px, 32px, 48px, 64px)
- Border radius values
- Animation timing (200ms, 300ms, 500ms)
- Color system (primary, secondary, accent, neutrals)
- Typography scale
- Icon style (outline vs filled)
- Button styles across the app
- Form element styles

### What Can Vary
**Project-specific customization:**
- Color palette (different colors, same system)
- Layout creativity (grids, asymmetry)
- Illustration style
- Animation personality
- Feature-specific interactions
- Hero section design
- Card styling variations
- Background patterns or textures

---

## Technical Excellence

### Performance
- Optimize images (WebP, lazy loading)
- Code splitting for faster loads
- Debounce search inputs
- Virtualize long lists
- Minimize re-renders
- Use proper memoization

### Accessibility
- Keyboard navigation throughout
- ARIA labels where needed
- Focus indicators visible
- Screen reader friendly
- Sufficient color contrast
- Respect reduced motion preferences

---

## Key Principles

1. **Be Bold** - Don't be afraid to try unique layouts and interactions
2. **Be Consistent** - Use the same patterns for similar functions
3. **Be Responsive** - Design works beautifully on all devices
4. **Be Fast** - Animations are smooth, loading is quick
5. **Be Accessible** - Everyone can use what you build
6. **Be Modern** - Use current design trends and technologies
7. **Be Unique** - Each project should have its own personality
8. **Be Intuitive** - Users shouldn't need instructions


---

# Project-Specific Customizations

**IMPORTANT: This section contains the specific design requirements for THIS project. The guidelines above are universal best practices - these customizations below take precedence for project-specific decisions.**

## User Design Requirements

Client Portal and Internal Decision Detail.
  - Card-based, grid layouts, accessible components, responsive behavior (mobile-first).
  - Inline media annotation tools with zoom/pan, scrubber for media timeline (if applicable).
  - Rich text input with mention suggestions, emoji support optional.

---

## Implementation Requirements

### Frontend
- Build a cohesive design system-aligned UI:
  - Reusable React/Vue/Svelte components (Card, Button, Input, Tag, Tabs, MediaViewer, AnnotationOverlay, CommentThread).
  - MediaAnnotationOverlay component capable of rendering shapes, showing metadata, and allowing edits by authorized users.
  - CommentThread component with nested replies, edit/delete windows, mention highlighting, and inline actions (edit, delete, resolve).
  - Side-by-side OptionComparison component: responsive grid that adapts to viewport; shows media, specs, cost, and decision notes per option.
  - Real-time update indicators (typing, new comments, annotation changes).

- Pages:
  - Client Portal (No-login Link):
    - Route: /client-portal/:decisionToken
    - Features: authentication via token, side-by-side comparison, comment composer with mentions, annotation-capable media, approve/change-request actions, optional OTP flow.
  - Decision Detail (Internal):
    - Route: /internal/decisions/:decisionId
    - Features: full decision data, option-by-option annotations, audit trail, export controls, moderation tools, admin actions.

- Accessibility:
  - ARIA roles, keyboard navigable, proper focus management, readable contrast (WCAG 2.1 AA).

- Internationalization:
  - Prepare for i18n (text keys, date/number localization) if needed.

- Performance:
  - Lazy loading of options/media, pagination for comments, efficient annotation rendering for large media.
  - Debounced input for comment typing, optimistic UI updates.

- Mobile-first considerations:
  - Stacked layout with collapsible sections, touch-friendly controls, and large tap targets.

- Testing:
  - Unit tests for models and services, integration tests for end-to-end comment flow, WebSocket events, and export generation.

### Backend
- Data Models (SQL/NoSQL as appropriate):
  - User: id, name, email, role, preferences.
  - Project: id, name, branding tokens, default settings.
  - Decision: id, project_id, title, status (pending/approved/revoked/needs_changes), created_at, updated_at, approved_by, approved_at, revoked_at.
  - Option: id, decision_id, title, description, media_ids, specs, price, comparison_rank.
  - Media: id, asset_url, type (image/pdf/3d), media_metadata, linked_annotations (array of annotation_ids).
  - Annotation: id, media_id, option_id (nullable), shape_type (point/rect/polygon), coordinates (JSON), created_by, created_at, updated_by, updated_at, note.
  - Comment: id, decision_id, option_id (nullable), parent_id (nullable for threading), author_id, text, mentions (array of user_ids), created_at, updated_at, edited_by, edited_at, status (active/edited/deleted).
  - Notification: id, user_id, type (mention/comment/approval), reference_id, read_at, created_at.
  - ApprovalHistory: id, decision_id, user_id, action (created/approved/rejected/edited), timestamp, details (JSON).
  - Export: id, decision_id, type (pdf/json/csv), generated_at, url.

- APIs (REST or GraphQL):
  - Decisions
    - GET /api/decisions/{id}
    - POST /api/decisions
    - PUT /api/decisions/{id}
    - POST /api/decisions/{id}/approve
    - POST /api/decisions/{id}/revoke
    - GET /api/decisions/{id}/export
  - Options
    - GET /api/decisions/{id}/options
    - POST /api/decisions/{id}/options
  - Media-Annotations
    - POST /api/media/{media_id}/annotations
    - PUT /api/annotations/{id}
    - DELETE /api/annotations/{id}
    - GET /api/media/{media_id}/annotations
  - Comments
    - GET /api/decisions/{id}/comments
    - POST /api/decisions/{id}/comments
    - PUT /api/comments/{id}
    - DELETE /api/comments/{id}
  - Mentions & Notifications
    - POST /api/notifications/mention
    - GET /api/notifications?user_id=...
  - Real-time
    - WebSocket channel endpoints for /ws/decisions/{decisionId}
  - Exports
    - GET /api/exports/{export_id}
  - Auth
    - OAuth2 / JWT-based authentication; token validation; role checks.

- Database indexing and constraints:
  - Index on decision_id for comments, annotations; index on media_id; composite indexes for option and decision lookups.
  - Foreign keys: decision -> project; option -> decision; annotation -> media/option; comment -> decision/option/parent; notification -> user.

- Real-time & Messaging:
  - WebSocket channels per decision for comments and annotation updates.
  - Fallback to long-polling if WebSockets unavailable.
  - Debounce rapid comment streams; ensure at-least-once delivery semantics.

- Security:
  - No-login access tokens for client portal with expiration; token rotation.
  - Server-side validation for all inputs; server-side enforcement of business rules (e.g., cannot approve after revoke).
  - Rate limiting on comment POSTs and OTP validation; detect and mitigate abuse.

- Data Integrity & Auditing:
  - Immutable audit entries for approvals and edits; versioning for comments and annotations (with delta diffs if feasible).
  - Export exports reproduce exact state snapshots with timestamps.

### Integration
- Client Portal and Internal Decision Detail both consume the same backend APIs:
  - Shared data models for decisions, options, media, comments, and annotations.
  - Client Portal uses a token-based access path with read/write scoped permissions; Limited comment actions, no admin controls.
  - Internal view uses full permissions (create/edit/delete, export, revoke).

- Branding & Theming:
  - Centralized design tokens for colors, font sizes, spacing, radii.
  - Components should adapt to the brand’s palette and be override-ready for client-specific branding.

- Error Handling:
  - Consistent error payload structure; user-friendly messages; telemetry hooks for errors.

---

## User Experience Flow

1) Client Portal (No-login Link)
- Client opens a shareable link to a decision with side-by-side options.
- Client views media and option details; annotations are visible and can be added by authorized clients if permitted.
- Client adds a comment, optionally mentioning internal team members. Comment appears in real-time or near real-time.
- Client annotates media coordinates to indicate preferences or concerns (where allowed).
- Client can approve or request changes, optionally leaving a short note; action triggers a notification to internal stakeholders.
- If OTP/verification is enabled:
  - Client enters email (if captured) or phone to receive an OTP.
  - Client enters OTP to validate before submitting approval or comments beyond a basic level.
- Notifications: when a new comment or mention appears, the client gets a notification via the chosen channel.

2) Internal Decision Detail (Admin)
- Internal user logs in to /internal/decisions/{decisionId}.
- See the decision overview with status, timestamps, and approval history.
- Open each option to view side-by-side comparisons, related media, and inline annotations.
- View and reply to comments; edit or delete comments within allowed windows; resolve comments if applicable.
- Add annotations to media; modify existing annotations or create new ones; link annotations to specific options if needed.
- Admin actions:
  - Edit decision details, revise option data, or adjust approvals.
  - Revoke approvals with rationale; log revoke reason in ApprovalHistory.
  - Export decision logs to PDF/JSON/CSV; download or share export URL.
- Real-time updates ensure parallel editors see changes instantly.

3) Notifications & Mentions
- Mentions trigger in-app notifications; mention recipients are auto-tagged and alerted.
- Clients and internal users receive notifications about:
  - New comments, replies, or annotations.
  - Status changes (approved, changes requested, revoked).
  - Mentions and upcoming deadlines/reminders.

4) Moderation
- Moderators can edit/delete inappropriate content within allowed windows.
- Moderation logs captured with user and timestamp.

---

## Technical Specifications

- Data Models: (schemas summarized)
  - User: id, name, email, role (client/internal/admin), preferences.
  - Project: id, name, brandingTokens.
  - Decision: id, project_id, title, status enum, created_at, updated_at, approved_by_id, approved_at, revocation_reason.
  - Option: id, decision_id, title, description, specs, media_ids, price, rank.
  - Media: id, asset_url, type, metadata JSON, linked_annotation_ids.
  - Annotation: id, media_id, option_id (nullable), shape_type (enum: point/rect/polygon), coordinates JSON, note, created_by_id, created_at, updated_by_id, updated_at.
  - Comment: id, decision_id, option_id, parent_id, author_id, text, mentions JSON, created_at, updated_at, status (active/edited/deleted).
  - Notification: id, user_id, type (mention/comment/approval), reference_id, read_at, created_at.
  - ApprovalHistory: id, decision_id, user_id, action (created/approved/rejected/revoked/edited), timestamp, details JSON.
  - Export: id, decision_id, type (pdf/json/csv), generated_at, url.

- API Endpoints (examples; use your tech preference):
  - GET /api/decisions/{decisionId}
  - POST /api/decisions
  - PUT /api/decisions/{decisionId}
  - POST /api/decisions/{decisionId}/approve
  - POST /api/decisions/{decisionId}/revoke
  - GET /api/decisions/{decisionId}/export
  - GET /api/decisions/{decisionId}/options
  - POST /api/decisions/{decisionId}/options
  - GET /api/decisions/{decisionId}/comments
  - POST /api/decisions/{decisionId}/comments
  - PUT /api/comments/{commentId}
  - DELETE /api/comments/{commentId}
  - POST /api/media/{mediaId}/annotations
  - PUT /api/annotations/{annotationId}
  - GET /api/media/{mediaId}/annotations
  - GET /ws/decisions/{decisionId} for real-time events (WebSocket)

- Security:
  - JWT/OAuth2 for internal endpoints; tokenized, single-use or time-limited access tokens for client portal.
  - Scopes: client:view, client:comment, client:annotate, internal:admin, internal:comment, internal:export.
  - Input validation, CSRF protection for REST routes; rate-limiting on comment posting and OTP requests.
  - Data encryption at rest for sensitive fields (e.g., revocation reasons, notes).

- Validation:
  - Mandatory fields: decision title, option title, at least one media reference for annotation, non-empty comment text (trimmed).
  - Annotations: coordinates must be valid JSON per shape_type; coordinates within media bounds.
  - OTP flow: OTP length, expiry, retry limits, and verification result handling.

- Real-time & Offline:
  - Implement WebSocket-based updates with reconnection logic; fallback to long-polling if necessary.
  - Optimistic UI updates for new comments and annotations with reconciliation on server ack.

- Data Ownership & Export:
  - Exports must contain versioned data snapshots; include audit trail and asset references; respect data retention policies.

---

## Acceptance Criteria
- [ ] Real-time comments and annotations propagate to all connected clients/viewers within 1-2 seconds of creation.
- [ ] Threaded comments support multi-level replies; edit/delete is available within defined time window; moderation actions are auditable.
- [ ] Annotations render accurately on all media types (image, PDF page, etc.) with correct coordinate mapping; shapes are editable by authorized users and persist correctly.
- [ ] Client Portal link functions without login, with OTP verification if enabled; OTP flow is secure, rate-limited, and expires.
- [ ] Internal Decision Detail shows side-by-side comparison with the ability to annotate, comment, view approval history, and perform export actions.
- [ ] Exports (PDF/JSON/CSV) accurately reflect current decision state, including annotations and media references.
- [ ] Security: unauthorized access is prevented; client portal links cannot be abused to access other decisions; all endpoints enforce proper scopes.
- [ ] Accessibility and responsive behavior tested across desktop and mobile.

---

## UI/UX Guidelines

Apply Archject’s design system and branding:
- Cards with white background, soft shadows, rounded corners, and generous padding.
- Navigation: top bar with pill-shaped tabs; active state in #195C4A; white text on active tabs.
- Layout: wide, airy grid; 8px spacing increments; 24-32px container padding; left-aligned content with strong vertical rhythm.
- Data Visuals: clean charts with subtle grids; status badges in green/yellow/red; tooltips on hover.
- Interactive Elements: pill-shaped buttons; primary actions in deep green (#195C4A); hover states with subtle shadows; inputs with light background (#F5F6FA) and clear focus rings.
- Typography: Inter/Manrope/SF Pro family; weights 400 (body), 500 (labels/navigation), 600 (headings/actions).
- Mobile-first: touch targets, collapsible sections, responsive side-by-side to stacked flows.

Visual references:
- Card elevation: 0 4px 16px rgba(34, 42, 89, 0.05)
- Backgrounds: #FFFFFF (cards), #F5F6FA/#F7F8FA (surfaces)
- Text: #23272F (primary), #6B7280 (secondary)

---

## Final Deliverables

- Fully wired frontend (Client Portal and Internal Decision Detail) with reusable components and theming hooks.
- Backend services with models, APIs, WebSocket channels, and database migrations.
- Documentation:
  - API docs with endpoints, request/response schemas, and sample payloads.
  - Data model diagrams (ERD) and flowcharts for comment/annotation lifecycle.
  - Developer guide for extending annotations, workflows, and export formats.
- Test suite:
  - Unit tests for models and services.
  - Integration tests for critical flows: commenting, threading, annotations, real-time updates, OTP verification, and export.
- Deployment guidance:
  - Environment variables, secrets management, and migration strategies.
  - Observability: logging, metrics, and alerting setup for real-time events.

---

If you want, I can tailor this prompt further to your tech stack (e.g., Node.js + NestJS vs. Django, React vs. Vue, PostgreSQL vs. MongoDB) or provide a concrete API contract with JSON schemas and example payloads.

## Implementation Notes

When implementing this project:

1. **Follow Universal Guidelines**: Use the design best practices documented above as your foundation
2. **Apply Project Customizations**: Implement the specific design requirements stated in the "User Design Requirements" section
3. **Priority Order**: Project-specific requirements override universal guidelines when there's a conflict
4. **Color System**: Extract and implement color values as CSS custom properties in RGB format
5. **Typography**: Define font families, sizes, and weights based on specifications
6. **Spacing**: Establish consistent spacing scale following the design system
7. **Components**: Style all Shadcn components to match the design aesthetic
8. **Animations**: Use Motion library for transitions matching the design personality
9. **Responsive Design**: Ensure mobile-first responsive implementation

## Implementation Checklist

- [ ] Review universal design guidelines above
- [ ] Extract project-specific color palette and define CSS variables
- [ ] Configure Tailwind theme with custom colors
- [ ] Set up typography system (fonts, sizes, weights)
- [ ] Define spacing and sizing scales
- [ ] Create component variants matching design
- [ ] Implement responsive breakpoints
- [ ] Add animations and transitions
- [ ] Ensure accessibility standards
- [ ] Validate against user design requirements

---

**Remember: Always reference this file for design decisions. Do not use generic or placeholder designs.**
