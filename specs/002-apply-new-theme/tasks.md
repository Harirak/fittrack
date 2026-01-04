---
description: "Task list for Applying Fresh Lime Theme"
---

# Tasks: Apply Fresh Lime Theme

**Input**: Design documents from `/specs/002-apply-new-theme/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Verify project structure and locate `src/app/globals.css`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T002 Update CSS variables in `src/app/globals.css` to define "Fresh Lime" palette in `:root` and remove `.dark` overrides
- [x] T003 Ensure `tailwind.config.ts` correctly maps semantic tokens to the updated CSS variables

**Checkpoint**: Foundation ready - global theme tokens are live.

---

## Phase 3: User Story 1 - App Visual Overhaul (Priority: P1) 🎯 MVP

**Goal**: Apply the "Fresh Lime" aesthetic to interactive elements, charts, and PWA configurations.

**Independent Test**: Navigate the app; verify primary buttons are Lime Green, charts are monochrome Lime, and PWA install prompt matches the theme.

### Implementation for User Story 1

- [x] T004 [US1] Update `src/app/layout.tsx` metadata with new `themeColor` (#F6F6F6)
- [x] T005 [US1] Update `public/manifest.ts` background_color and theme_color to #F6F6F6
- [x] T006 [P] [US1] Update `src/components/dashboard/WeeklyChart.tsx` to use `var(--primary)` or `#A8D922` for bars
- [x] T007 [P] [US1] Update `src/components/workout/ActivityRing.tsx` to use `var(--primary)` for progress rings
- [x] T008 [US1] Update button hover states in `src/app/globals.css` (or Button component if needed) to darken by 10%
- [x] T009 [US1] Verify and update border-radius globals in `src/app/globals.css` to match 20px-30px requirement

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Dark Mode Removal/Supersession (Priority: P2)

**Goal**: Ensure no legacy dark mode artifacts remain and the theme is consistently light.

**Independent Test**: Switch OS to dark mode; app should remain light.

### Implementation for User Story 2

- [x] T010 [US2] Remove any Dark Mode toggle from `src/components/layout/Header.tsx` or Settings page
- [x] T011 [US2] Scan `src/components/ui/` for any hardcoded `dark:` classes and remove/update them
- [x] T012 [US2] Verify `src/components/layout/BottomNav.tsx` uses correct light theme colors for active/inactive states

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [x] T013 Verify contrast ratios for new Lime Green text/background combinations
- [x] T014 Run visual regression check on all main pages

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel
  - Or sequentially in priority order (P1 → P2)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2)
- **User Story 2 (P2)**: Can start after Foundational (Phase 2)

### Parallel Opportunities

- T006 and T007 can run in parallel (different chart components)
- T011 (Scanning UI) can happen while other styling work proceeds

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Remove Dark Mode (US2) → Test independently → Deploy/Demo
