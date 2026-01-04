# Research & Decisions: Fresh Lime Theme

**Status**: Complete
**Date**: 2026-01-04

## Decisions

### 1. Theme Implementation Strategy
- **Decision**: Use CSS variables (Custom Properties) in `globals.css` to define the theme, rather than hardcoding values in Tailwind config.
- **Rationale**: Allows for runtime adjustments if needed and maintains a single source of truth for semantic colors (background, foreground, primary).
- **Context**: The `globals.css` file already uses `@theme` and `:root` blocks. We will update the `:root` block to reflect the "Fresh Lime" palette and remove/neutralize the `.dark` block overrides to enforce the light theme.

### 2. Dark Mode Handling
- **Decision**: Remove `.dark` class support effectively by ensuring `:root` and `.dark` variables resolve to the same "Fresh Lime" values, or simply removing the dark mode toggle capability.
- **Rationale**: Constitution Principle II explicitly states "Complete visual overhaul to Light Mode/Lime". Supporting a separate dark mode contradicts the "Fresh Lime" branding strategy defined in this version.
- **Implementation**: We will map the standard shadcn/ui semantic tokens (`--background`, `--foreground`, etc.) to the new palette in `:root`.

### 3. Chart Color Strategy
- **Decision**: Use Monochrome Brand (`#A8D922`) for primary data series.
- **Rationale**: FR-009 requires avoiding unsubstantiated colors. Using the primary brand color ensures charts feel integrated with the rest of the application. Secondary data can use neutral grays or designated "muted" lime tones if strictly necessary for contrast.

### 4. Interactive States
- **Decision**: Darken primary color by 10% for hover/active states.
- **Rationale**: FR-010. Lightening a bright lime green would result in poor contrast against a white background. Darkening it maintains hue identity while providing clear visual feedback.

## Alternatives Considered

- **Alternative**: Keep Dark Mode.
  - **Reason for Rejection**: Explicitly overruled by the user request and updated Constitution.
- **Alternative**: Use Tailwind Utility Classes for everything.
  - **Reason for Rejection**: Harder to maintain global consistency than updating the CSS variables in `globals.css` which filter down to all shadcn/ui components.
