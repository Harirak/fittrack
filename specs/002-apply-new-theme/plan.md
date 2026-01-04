# Implementation Plan: Apply Fresh Lime Theme

**Branch**: `002-apply-new-theme` | **Date**: 2026-01-04 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-apply-new-theme/spec.md`

## Summary

The "Fresh Lime" theme update is a visual overhaul to transition FitTrack Pro from a dark, purple-heavy aesthetic to a modern, light, and energetic design system. Key changes include adopting `#A8D922` (Lime Green) as the primary brand color, `#F6F6F6` (Whitesmoke) for backgrounds, and ensuring PWA compliance with the new palette.

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Tailwind CSS 3.x, shadcn/ui
**Storage**: N/A (Visual update only)
**Testing**: Visual regression via manual checks, Playwright for E2E flow verification
**Target Platform**: Mobile Web (PWA)
**Project Type**: Next.js 15 Web Application
**Performance Goals**: No regression in LCP/CLS
**Constraints**: Must override any existing dark mode preferences to force the "Fresh Lime" light theme.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. PWA-First Mobile Experience | ✅ PASS | FR-008 ensures PWA manifests align with new theme. |
| II. Fresh Lime Design System | ✅ PASS | FR-001, SC-001/002 explicitly implement the new palette and typography. |
| III. Authentication & User Management | ✅ PASS | No changes to auth logic, only visual styling. |
| IV. Serverless Database Architecture | ✅ PASS | No database changes. |
| V. AI-Powered Workout Generation | ✅ PASS | No changes to AI logic. |
| VI. Test-First Development | ✅ PASS | Testing section defines visual verification steps. |
| VII. Simplicity & Progressive Enhancement | ✅ PASS | Scope limited to visual tokens and CSS variables. |

**Gate Status**: ✅ PASSED - All constitution principles aligned.

## Project Structure

### Documentation (this feature)

```text
specs/002-apply-new-theme/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Visual research & decision log
├── data-model.md        # N/A (No schema changes)
├── quickstart.md        # N/A
├── contracts/           # N/A
└── tasks.md             # Implementation tasks
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── globals.css      # Core CSS variable updates
│   └── layout.tsx       # Metadata updates for PWA theme color
├── components/
│   └── ui/              # Component overrides if needed (e.g. Card, Button)
└── public/
    └── manifest.ts      # (or manifest.json) PWA manifest updates
```

**Structure Decision**: Standard Next.js styling update. visual changes confined to `globals.css`, component primitives, and PWA configuration files.

## Complexity Tracking

> No constitution violations requiring justification.
