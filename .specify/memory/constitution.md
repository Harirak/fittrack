<!--
  Sync Impact Report
  ===================
  Version change: 1.0.0 → 1.1.0
  Modified principles:
    - II. Dark Glassmorphism Design System → II. Dark Gradient Design System (updated colors and styling to match reference)
  Modified sections:
    - Technology Stack: Changed Vanilla CSS → shadcn/ui + Tailwind CSS
    - Design System: Updated to match template1.png reference exactly
  Added sections: None
  Removed sections: None
  Templates requiring updates:
    - .specify/templates/plan-template.md ✅ (reviewed, compatible)
    - .specify/templates/spec-template.md ✅ (reviewed, compatible)
    - .specify/templates/tasks-template.md ✅ (reviewed, compatible)
  Follow-up TODOs: None
  
  Bump rationale: MINOR - Material expansion of design system guidance and technology stack change (shadcn/ui addition)
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

### II. Dark Gradient Design System

All UI components MUST adhere to the established design system derived from reference design (template1.png):

- **Color Palette**:
  - Background Primary: `#000000` (pure black)
  - Background Secondary: `#0a0a0a` (near-black for elevated surfaces)
  - Background Tertiary: `#1a1a1a` (dark gray for cards)
  - Gradient Primary: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)` (purple-violet)
  - Gradient Accent: `linear-gradient(135deg, #f093fb 0%, #f5576c 100%)` (pink-coral)
  - Gradient Success: `linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)` (cyan-blue)
  - Gradient Warning: `linear-gradient(135deg, #fa709a 0%, #fee140 100%)` (pink-yellow)
  - Accent Primary: `#667eea` (purple)
  - Accent Secondary: `#f5576c` (coral pink)
  - Accent Cyan: `#00f2fe` (bright cyan)
  - Text Primary: `#ffffff`
  - Text Secondary: `rgba(255, 255, 255, 0.7)`
  - Text Muted: `rgba(255, 255, 255, 0.5)`
  - Border: `rgba(255, 255, 255, 0.1)`

- **Typography**: 
  - Font Family: Inter (via `next/font`)
  - Weights: 400 (regular), 500 (medium), 600 (semibold), 700 (bold)
  - Large Numbers: 700 weight, 2-3rem size for stats/metrics

- **Border Radius**: 
  - Cards: 20px (xl rounded)
  - Buttons: 12px (lg)
  - Inputs: 10px (md)
  - Pills/Tags: 9999px (full/rounded-full)

- **Visual Effects**:
  - Gradient overlays on cards and buttons
  - Subtle border: `1px solid rgba(255, 255, 255, 0.1)`
  - No heavy shadows, use gradients for depth
  - Activity rings with gradient strokes

- **Animations**: 
  - Smooth micro-interactions (200-300ms duration, ease-out timing)
  - Progress ring animations
  - Button press feedback

**Rationale**: The dark gradient aesthetic with vibrant color accents creates an energetic, premium feel that motivates users during fitness activities.

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
| UI Components | shadcn/ui | Latest | Radix primitives, customizable |
| Styling | Tailwind CSS | 3.x | Required by shadcn/ui |
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
    "baseColor": "zinc",
    "cssVariables": true
  },
  "aliases": {
    "components": "@/components",
    "utils": "@/lib/utils"
  }
}
```

### Core shadcn/ui Components

The following components MUST be installed and customized:

- `button` - Gradient variants added
- `card` - Dark gradient backgrounds
- `input` - Dark theme styling
- `dialog` - Modal overlays
- `dropdown-menu` - Dark popover menus
- `tabs` - Navigation tabs
- `progress` - Activity rings (customized)
- `avatar` - User profile
- `badge` - Tags and status indicators
- `calendar` - Workout scheduling
- `toast` - Notifications

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
        // Brand gradients as solid colors for utilities
        brand: {
          purple: "#667eea",
          violet: "#764ba2",
          pink: "#f093fb",
          coral: "#f5576c",
          cyan: "#00f2fe",
          blue: "#4facfe",
        },
        // Override shadcn defaults for dark theme
        background: "#000000",
        foreground: "#ffffff",
        card: {
          DEFAULT: "#0a0a0a",
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#1a1a1a",
          foreground: "rgba(255, 255, 255, 0.5)",
        },
        accent: {
          DEFAULT: "#667eea",
          foreground: "#ffffff",
        },
        border: "rgba(255, 255, 255, 0.1)",
      },
      backgroundImage: {
        "gradient-primary": "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "gradient-accent": "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "gradient-success": "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "gradient-warning": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
      },
      borderRadius: {
        "2xl": "20px",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### Key UI Patterns (from Reference)

1. **Gradient Cards**: Workout cards use gradient backgrounds with rounded corners
2. **Activity Rings**: Circular progress indicators with gradient strokes (like Apple Watch)
3. **Bottom Navigation**: Fixed bottom nav with 4-5 icons, gradient active state
4. **Stat Displays**: Large bold numbers with small labels below
5. **Calendar View**: Week strip at top showing daily workout completion
6. **Exercise Lists**: Horizontal scrollable cards for exercise selection

### Custom Component: Activity Ring

```tsx
// Example pattern for activity ring component
interface ActivityRingProps {
  progress: number; // 0-100
  size?: "sm" | "md" | "lg";
  gradient?: "primary" | "accent" | "success";
}
```

### Equipment Icons

The app tracks workouts with specific equipment using Lucide icons:
- Bodyweight: `User` or custom icon
- Dumbbells: `Dumbbell`
- Barbells: Custom SVG
- Kettlebells: Custom SVG
- Treadmill: `Activity` or custom icon

Each equipment type MUST have consistent iconography throughout the app.

## Development Workflow

### Git Branch Strategy

- `main` - Production branch, deployed to Vercel automatically
- `develop` - Integration branch for features
- `feature/[issue-id]-description` - Feature branches
- `fix/[issue-id]-description` - Bug fix branches

### Commit Convention

Follow Conventional Commits:
- `feat:` New features
- `fix:` Bug fixes
- `docs:` Documentation changes
- `style:` Formatting, no code change
- `refactor:` Code restructuring
- `test:` Adding/updating tests
- `chore:` Build process, dependencies

### PR Requirements

All pull requests MUST:
1. Pass all CI checks (lint, type-check, tests)
2. Have descriptive title following commit convention
3. Include screenshots for UI changes
4. Update relevant documentation

### Deployment Pipeline

1. Push to `develop` → Preview deployment on Vercel
2. Merge to `main` → Production deployment on Vercel
3. Database migrations run automatically via Drizzle

## Governance

### Constitution Authority

This constitution is the authoritative source for project standards. All development decisions MUST align with these principles. In case of conflict:

1. Constitution principles take precedence
2. If principle is ambiguous, discuss and amend constitution
3. Temporary exceptions MUST be documented in PR with justification

### Amendment Process

To amend this constitution:
1. Create a proposal with rationale
2. Document impact on existing code
3. Update version number following semver:
   - MAJOR: Breaking changes to principles
   - MINOR: New principles or significant expansions
   - PATCH: Clarifications, typo fixes
4. Update all dependent templates if needed

### Compliance Review

Before each release:
- [ ] All new code follows design system (dark gradients, shadcn/ui)
- [ ] Authentication implemented at all data access points
- [ ] Database operations use Drizzle ORM
- [ ] AI features have rate limiting and error handling
- [ ] PWA manifest and service worker are functional
- [ ] Core Web Vitals pass "Good" thresholds

### Guidance Files

- `/README.md` - Project overview and quickstart
- `/docs/setup.md` - Development environment setup
- `/docs/api.md` - API documentation
- `/docs/design-system.md` - Component usage guide

**Version**: 1.1.0 | **Ratified**: 2026-01-03 | **Last Amended**: 2026-01-03
