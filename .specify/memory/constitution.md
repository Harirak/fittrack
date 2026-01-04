<!--
  Sync Impact Report
  ===================
  Version change: 1.2.0 → 1.3.0
  Modified principles:
    - II. Fresh Lime Design System: Added new Forest Green accent color.
  Modified sections:
    - Color Palette: Added `#495F41` (Forest Green).
    - Tailwind Configuration: Added `brand.forest` mapping.
  Added sections: None
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅
  Follow-up TODOs:
    - Update `globals.css` and `tailwind.config.ts` to include the new `forest` color token.
  
  Bump rationale: MINOR - Introduction of new secondary color token to the design system.
-->

# FitTrack Pro Constitution

A PWA-first mobile fitness application for tracking treadmill workouts and providing AI-powered personalized workout plans using home equipment (dumbbells, barbells, kettlebells).

## Core Principles

### I. PWA-First Mobile Experience

The application MUST be designed as a Progressive Web App (PWA) optimized for mobile devices. All features MUST work seamlessly on mobile browsers with native app-like experience including:

- **Installability**: Web App Manifest with proper icons, splash screens, and display modes
- **Offline Capability**: Service workers MUST cache critical assets and enable offline workout tracking
- **Responsive Design**: Mobile-first approach with touch-friendly UI (minimum 44px touch targets)
- **Performance**: Core Web Vitals MUST meet "Good" thresholds (LCP < 2.5s, FID < 100ms, CLS < 0.1)

**Rationale**: PWA approach enables cross-platform deployment without app store friction while maintaining native-like UX.

### II. Fresh Lime Design System

All UI components MUST adhere to the established design system derived from reference design (template1-3.png):

- **Color Palette** (Strict adherence to Template 2):
  - Primary: `#A8D922` (Lime Green) - Used for primary actions, active states, highlights.
  - Secondary: `#495F41` (Forest Green) - Used for deeper accents, borders, or high-contrast elements.
  - Background: `#F6F6F6` (Whitesmoke) - Main app background.
  - Surface/Card: `#FFFFFF` (White) - Component background.
  - Text Primary: `#000000` (Black) - Headings, main text.
  - Text Secondary: `#9D9D9D` (Dark Gray) - Subtitles, metadata.
  - Success: `#A8D922` (Matches Primary)
  - Error: `#EF4444` (Standard Red)

- **Typography**: 
  - Font Family: Inter (San Serif similar to Mori Gothic)
  - Weights: Regular (400), Medium (500), SemiBold (600), Bold (700)
  - Headings: Bold, high contrast.

- **Grid & Spacing** (Adherence to Template 3):
  - Mobile Grid: 4 Columns
  - Margins: 16px (side edges)
  - Gutters: 20px (between cards)
  - Border Radius: 20px-30px (Highly rounded aesthetic)

- **Visual Effects**:
  - Soft Shadows: Large, diffuse shadows for depth (e.g., `box-shadow: 0 10px 30px -10px rgba(0,0,0,0.1)`)
  - Clean Layouts: High whitespace, no clutter.
  - Minimalist Icons: Simple strokes or solid shapes.

**Rationale**: The "Fresh Lime" aesthetic creates a clean, energetic, and modern environment that feels approachable and professional, differentiating it from "dark mode" gamers aesthetics.

### III. Authentication & User Management

All user authentication and session management MUST be handled by Clerk:

- **Provider**: Clerk (`@clerk/nextjs`) for authentication
- **Routes**: Protected routes MUST use `clerkMiddleware()` at edge
- **Defense-in-Depth**: Authentication MUST be verified at both middleware AND data access layer
- **Session Management**: Use Clerk's built-in session handling, never store tokens in localStorage
- **User Metadata**: Fitness preferences, equipment ownership stored in Clerk user metadata

**Rationale**: Clerk provides battle-tested authentication with SSR/edge support, reducing security implementation burden.

### IV. Serverless Database Architecture

All data persistence MUST use Neon serverless Postgres with proper connection management:

- **Provider**: Neon (`@neondatabase/serverless`)
- **ORM**: Drizzle ORM for type-safe database operations
- **Connection Pattern**: Singleton pattern to prevent connection pool exhaustion
- **Environment**: All connection strings MUST be stored in environment variables
- **Branching**: Use Neon database branching for development/staging environments
- **Schema Migrations**: Drizzle Kit for schema migrations, versioned in source control

**Rationale**: Neon's serverless architecture scales automatically and integrates seamlessly with Vercel edge functions.

### V. AI-Powered Workout Generation

All generative AI features MUST use LiteLLM for OpenAI-compatible API abstraction:

- **Provider**: LiteLLM proxy or direct SDK integration
- **Configuration**: Model definitions in `litellm.config.yaml` or environment variables
- **Fallback**: Configure backup models for API failure resilience
- **Rate Limiting**: Implement user-level rate limits for AI endpoints
- **Caching**: Cache AI-generated workout plans with appropriate TTL
- **Prompt Engineering**: Store prompts as versioned templates, not hardcoded strings
- **Guardrails**: Implement content moderation for AI inputs/outputs

**Rationale**: LiteLLM enables provider flexibility and unified API while supporting OpenAI-compatible endpoints.

### VI. Test-First Development (STRONGLY RECOMMENDED)

Testing is strongly recommended for all business logic and critical paths:

- **Unit Tests**: Vitest for service layer and utility functions
- **Integration Tests**: API route testing with realistic database fixtures
- **E2E Tests**: Playwright for critical user journeys (login, workout logging, plan generation)
- **Coverage Target**: Minimum 70% for services, 50% for components
- **CI/CD**: Tests MUST pass before deployment to Vercel

**Rationale**: Testing ensures reliability for fitness tracking data that users depend on for progress measurement.

### VII. Simplicity & Progressive Enhancement

Start simple, enhance progressively. Avoid premature optimization:

- **YAGNI**: Don't implement features until actually needed
- **MVP First**: Each user story MUST be independently deployable and valuable
- **Feature Flags**: Use environment variables or Vercel feature flags for gradual rollouts
- **Complexity Justification**: Any pattern beyond CRUD MUST be explicitly justified

**Rationale**: Fitness apps succeed through consistent, reliable core features rather than complex rarely-used functionality.

## Technology Stack

### Mandatory Technologies

| Layer | Technology | Version | Notes |
|-------|------------|---------|-------|
| Framework | Next.js | 15.x | App Router, Server Components |
| Language | TypeScript | 5.x | Strict mode enabled |
| UI Components | shadcn/ui | Latest | Radix primitives, highly customized |
| Styling | Tailwind CSS | 3.x | Design system implementation |
| Auth | Clerk | Latest | `@clerk/nextjs` |
| Database | Neon | - | `@neondatabase/serverless` |
| ORM | Drizzle | Latest | Type-safe, lightweight |
| AI | LiteLLM | Latest | OpenAI-compatible proxy |
| Deployment | Vercel | - | Edge functions, automatic HTTPS |
| PWA | Native Next.js | 15+ | Manifest + Service Worker |
| Icons | Lucide React | Latest | Consistent icon set |

### shadcn/ui Configuration

shadcn/ui MUST be configured with the following settings:

```json
{
  "style": "default",
  "rsc": true,
  "tsx": true,
  "tailwind": {
    "config": "tailwind.config.ts",
    "css": "src/app/globals.css",
    "baseColor": "slate",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Core shadcn/ui Components

The following components MUST be installed and customized to "Fresh Lime" theme:

- `button` - Solid Black, Outline, and Ghost variants
- `card` - White background, soft shadow (no border)
- `input` - Light gray background (#F6F6F6), no border unless active
- `dialog` - Clean white modal
- `dropdown-menu` - Minimalist white popover
- `tabs` - Lime indicator
- `progress` - Lime fill, light gray track
- `avatar` - Circular
- `badge` - Lime soft background with dark text
- `calendar` - Rounded selection zones
- `toast` - Clean simple notifications

### Development Dependencies

| Tool | Purpose |
|------|---------|
| ESLint | Code linting with Next.js config |
| Prettier | Code formatting |
| Vitest | Unit/integration testing |
| Playwright | E2E testing |
| Drizzle Kit | Database migrations |
| tailwind-merge | Tailwind class merging |
| clsx | Conditional classnames |

### Environment Variables

Required environment variables (stored in `.env.local`):

```
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Neon Database
DATABASE_URL=

# LiteLLM / OpenAI-compatible
LITELLM_API_BASE=
LITELLM_API_KEY=

# App Config
NEXT_PUBLIC_APP_URL=
```

## Design System

### Component Library Structure

```
src/
├── components/
│   ├── ui/              # shadcn/ui base components (auto-generated)
│   ├── layout/          # Layout components (Header, BottomNav, Container)
│   ├── workout/         # Workout-specific components
│   │   ├── ActivityRing.tsx
│   │   ├── WorkoutCard.tsx
│   │   ├── ExerciseList.tsx
│   │   └── StatsDisplay.tsx
│   ├── charts/          # Data visualization components
│   └── ai/              # AI-related components (chat, suggestions)
├── lib/
│   └── utils.ts         # cn() helper and utilities
└── app/
    └── globals.css      # Tailwind + custom CSS variables
```

### Tailwind Configuration

Custom Tailwind config extending shadcn/ui defaults:

```typescript
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          lime: "#A8D922", // Primary
          forest: "#495F41", // Secondary
          black: "#000000",
          whitesmoke: "#F6F6F6", // Background
          darkgray: "#9D9D9D", // Secondary Text
        },
        background: "#F6F6F6",
        foreground: "#000000",
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#000000",
        },
        primary: {
          DEFAULT: "#A8D922",
          foreground: "#000000",
        },
        secondary: {
          DEFAULT: "#495F41",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F6F6F6",
          foreground: "#9D9D9D",
        },
        border: "#E5E5E5",
      },
      borderRadius: {
        "xl": "20px",
        "2xl": "30px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
```

### Key UI Patterns (from Reference)

1. **Clean Cards**: White cards on Whitesmoke background, large border radius (20px).
2. **Lime Accents**: Primary actions and active states use `#A8D922`.
3. **Bottom Navigation**: Floating or fixed bottom nav with ample padding.
4. **Typography**: Large, bold headings in Black; metadata in Dark Gray.
5. **Avatars**: Illustrated avatars (if possible) or clean photos.

### Equipment Icons

The app tracks workouts with specific equipment:
- Bodyweight
- Dumbbells
- Barbells
- Kettlebells
- Treadmill

## Development Workflow

### Git Branch Strategy

- `main` - Production branch
- `develop` - Integration branch
- `feature/[issue-id]-description` - Feature branches
- `fix/[issue-id]-description` - Bug fix branches

### Commit Convention

Follow Conventional Commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Formatting
- `refactor:` Code restructuring
- `test:` Adding tests
- `chore:` Maintenance

### PR Requirements

1. Pass all CI checks
2. Descriptive title
3. Screenshots for UI changes
4. Update documentation

### Deployment Pipeline

1. Push to `develop` → Preview
2. Merge to `main` → Production
3. DB migrations automatic

## Governance

### Constitution Authority

This constitution is the authoritative source for project standards.

### Amendment Process

1. Create a proposal
2. Document impact
3. Update version (MAJOR/MINOR/PATCH)
4. Update dependent templates

### Compliance Review

- [ ] UI follows Fresh Lime design (#A8D922, #F6F6F6)
- [ ] Mobile-first responsive grid (4 col, 16px margin)
- [ ] Auth & DB security standards met
- [ ] PWA functionality verified

### Guidance Files

- `/README.md`
- `/docs/setup.md`
- `/docs/api.md`
- `/docs/design-system.md`

**Version**: 1.3.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-04
