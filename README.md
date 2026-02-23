# Archject — Visual Approval & Decision Log for Design Projects

A lightweight, focused platform for architecture and design studios to create, share, and record visual decisions. Replace scattered emails and PDFs with a structured, time-stamped, auditable workflow.

## Features

- **Project workspaces** — Organize decisions by project
- **Decision objects** — Create options, upload visuals, set approvers and due dates
- **Client portal** — Branded no-login links for zero-friction client review
- **Visual comparison** — Side-by-side view, swipe on mobile
- **Exportable audit trail** — Decision Logs (PDF/CSV/JSON) for contracts and compliance
- **Team management** — Invite members, assign roles

## Tech Stack

- React 18 + TypeScript
- Vite
- React Router 6
- Tailwind CSS v3
- TanStack React Query
- React Hook Form + Zod
- Radix UI primitives
- Recharts
- Sonner

## Getting Started

```bash
npm install
npm run build
```

## Scripts

- `npm run dev` — Start development server
- `npm run build` — Build for production
- `npm run preview` — Preview production build
- `npm run lint` — Run ESLint

## Project Structure

```
src/
├── components/     # Reusable UI components
│   ├── landing/    # Landing page sections (HeroBlock, FeatureCardGrid, etc.)
│   ├── layout/     # Sidebar, header, dashboard layout
│   └── ui/         # Button, Card, Input, etc.
├── lib/            # Utilities (api, utils)
├── pages/          # Route pages
│   ├── auth/       # Login, signup, forgot password
│   ├── dashboard/  # Overview, projects, decisions, team, settings
│   ├── landing/    # Landing page + landing-data
│   ├── errors/     # 404, 500
│   └── legal/      # Privacy, terms, cookies
└── router.tsx     # Route configuration
```

## Landing Page Components

Modular, reusable components for the marketing landing page:

- **HeroBlock** — Hero with title, subtitle, primary/secondary CTAs, optional media
- **FeatureCardGrid** — Responsive grid of feature cards with icons
- **HowItWorksSection** — Step-by-step flow with connectors
- **TemplatesGallery** — Clickable template tiles with lightbox preview
- **PricingPreview** — Tier comparison with recommended plan highlight
- **LogosTestimonials** — Logo strip + testimonial cards
- **CTABar** — Inline CTA section (Start free, Request demo)
- **Footer** — Corporate links, social icons
- **NavigationHeader** — Responsive nav with pill tabs, mobile drawer
- **DemoRequestModal** — Demo request form (email, name, company)

## Design System

- **Primary:** Deep green (#195C4A)
- **Success:** Bright green (#7BE495)
- **Warning:** Soft yellow (#FFE8A3)
- **Destructive:** Light red (#FF6C6C)

Font: Inter. Spacing: 8px increments. Border radius: 12–16px for cards.
