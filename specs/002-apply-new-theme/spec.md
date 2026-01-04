# Feature Specification: Apply Fresh Lime Theme

**Feature Branch**: `002-apply-new-theme`
**Created**: 2026-01-04
**Status**: Draft
**Input**: User description: "i have change the theme of the app in constituion. I would like you to change accordingly."

## Clarifications

### Session 2026-01-04
- Q: How should PWA `theme_color` and `background_color` be updated? → A: Match App Background (#F6F6F6)
- Q: What color palette should chart components use? → A: Monochrome Brand (#A8D922)
- Q: How should interactive states (hover/pressed) for Primary buttons receive feedback? → A: Darken (-10% Lightness)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - App Visual Overhaul (Priority: P1)

As a user, I want to experience the application with the new "Fresh Lime" design system so that it feels modern, energetic, and approachable.

**Why this priority**: This is the core request to align the application with the updated Constitution.

**Independent Test**: Can be tested by navigating through the app and verifying the color palette, typography, and spacing match the "Fresh Lime" specification.

**Acceptance Scenarios**:

1. **Given** the user opens the application, **When** the page loads, **Then** the background should be Whitesmoke (`#F6F6F6`) and cards should be White (`#FFFFFF`) with soft shadows.
2. **Given** the user views primary buttons or active states, **When** observing the color, **Then** they should be Lime Green (`#A8D922`) with Black text.
3. **Given** the user views text content, **When** reading headings and body, **Then** the font should be Inter, headings in Black (`#000000`), and secondary text in Dark Gray (`#9D9D9D`).
4. **Given** the user views UI components (cards, dialogs), **When** checking borders, **Then** they should have rounded corners (20px-30px radius) and no harsh borders.

---

### User Story 2 - Dark Mode Removal/Supersession (Priority: P2)

As a user, I want the interface to be consistently "Fresh Lime" (Light) regardless of my system preference, as the design system has shifted away from Dark/Purple.

**Why this priority**: Ensures consistency and prevents broken "dark mode" artifacts from the previous design system.

**Independent Test**: Can be tested by toggling system theme to Dark and ensuring the app remains in the "Fresh Lime" light theme.

**Acceptance Scenarios**:

1. **Given** the user has system dark mode enabled, **When** they visit the app, **Then** the app should still render in the "Fresh Lime" light theme (Whitesmoke background, White cards).

### Edge Cases

- What happens if a legacy component still uses hardcoded dark colors?
  - It should be refactored to use the new CSS variables/utility classes.
- How does the system handle images/icons designed for dark mode?
  - Icons are specified as "Minimalist Icons: Simple strokes or solid shapes" in Black/Gray. They should potentially be inverted or checked for visibility on light backgrounds.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement the "Fresh Lime" color palette as the default and only theme:
  - Primary: `#A8D922` (Lime Green)
  - Background: `#F6F6F6` (Whitesmoke)
  - Surface/Card: `#FFFFFF` (White)
  - Text Primary: `#000000` (Black)
  - Text Secondary: `#9D9D9D` (Dark Gray)
  - Success: `#A8D922`
  - Error: `#EF4444`
- **FR-002**: The system MUST use the "Inter" font family for all text.
- **FR-003**: UI components (Cards, Dialogs, etc.) MUST use a border radius of 20px-30px.
- **FR-004**: Cards MUST use soft diffuse shadows (e.g., `0 10px 30px -10px rgba(0,0,0,0.1)`) instead of borders where possible.
- **FR-005**: The application's design configuration MUST be updated to reflect the new color extensions and border radius variables defined in the Constitution.
- **FR-006**: The global style definitions MUST be updated to map the semantic tokens (background, foreground, primary) to the new "Fresh Lime" color values.
- **FR-007**: Dark mode support MUST be removed or forced to the "Fresh Lime" (light) theme to align with the "Complete visual overhaul to Light Mode/Lime" directive.
- **FR-008**: The PWA manifest and browser meta tags MUST be updated to set `theme_color` and `background_color` to `#F6F6F6` (Whitesmoke) to ensure a seamless native experience.
- **FR-009**: All data visualization components (charts, graphs) MUST use the Primary Lime Green (`#A8D922`) for the main data series, avoiding introducing new unsubstantiated colors.
- **FR-010**: Interactive elements (buttons, links) MUST use a slightly darker shade of their base color (approx. 10% darkening) for hover and active states to provide clear visual feedback.

### Key Entities

- **Design Tokens**: Colors, Typography, Spacing, Radius, Shadows.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of pages render with `#F6F6F6` background.
- **SC-002**: Primary buttons verify as `#A8D922` in computed styles.
- **SC-003**: Text contrast ratios meet WCAG AA standards for accessibility (Black on Whitesmoke/White is high contrast).
