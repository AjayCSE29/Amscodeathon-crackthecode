---
name: Technical Assessment Grid
colors:
  surface: '#faf8ff'
  surface-dim: '#d2d9f4'
  surface-bright: '#faf8ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f3ff'
  surface-container: '#eaedff'
  surface-container-high: '#e2e7ff'
  surface-container-highest: '#dae2fd'
  on-surface: '#131b2e'
  on-surface-variant: '#3f4850'
  inverse-surface: '#283044'
  inverse-on-surface: '#eef0ff'
  outline: '#707881'
  outline-variant: '#bfc7d2'
  surface-tint: '#006398'
  primary: '#006194'
  on-primary: '#ffffff'
  primary-container: '#007bb9'
  on-primary-container: '#fdfcff'
  inverse-primary: '#93ccff'
  secondary: '#712ae2'
  on-secondary: '#ffffff'
  secondary-container: '#8a4cfc'
  on-secondary-container: '#fffbff'
  tertiary: '#006947'
  on-tertiary: '#ffffff'
  tertiary-container: '#00855b'
  on-tertiary-container: '#f5fff6'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#cce5ff'
  primary-fixed-dim: '#93ccff'
  on-primary-fixed: '#001d31'
  on-primary-fixed-variant: '#004b73'
  secondary-fixed: '#eaddff'
  secondary-fixed-dim: '#d2bbff'
  on-secondary-fixed: '#25005a'
  on-secondary-fixed-variant: '#5a00c6'
  tertiary-fixed: '#6ffbbe'
  tertiary-fixed-dim: '#4edea3'
  on-tertiary-fixed: '#002113'
  on-tertiary-fixed-variant: '#005236'
  background: '#faf8ff'
  on-background: '#131b2e'
  surface-variant: '#dae2fd'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 36px
    fontWeight: '700'
    lineHeight: 44px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 22px
  code-body:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 20px
  code-inline:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.04em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1.5rem
  gutter-mobile: 0.75rem
  margin: 2rem
  margin-mobile: 1rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

The design system is engineered for competitive technical evaluations, hackathon qualification tiers, and collegiate engineering assessments. The user demographic comprises ambitious computer science undergraduates, high-performance competitive coders, and academic evaluators operating under high-stakes, time-compressed testing scenarios.

The visual style synthesizes **Corporate / Modern Precision** with **Engineering-Grade Technical Clarity**:
- **Atmosphere**: Focus-inducing, institutional yet cutting-edge, razor-sharp, and distraction-free.
- **Visual Stance**: Ultra-crisp off-white canvases against pure white interactive tiles, framed with hairline slate borders and accented by high-frequency electric cyan and deep indigo-violet.
- **Cognitive Load**: Minimized through strict state signaling (Emerald for verified/answered, Amber for review-flagged, Ruby for negative-marking and terminal countdown alerts).
- **Physical Metaphor**: Architectural code-review suites and glass-honed IDE command palettes rather than gamified consumer apps.

## Colors

The system employs a high-contrast, clinical light-mode palette optimized for extended reading, complex code analysis, and split-second status identification.

### Palette Roles
- **Canvas & Surfaces**:
  - `surface-canvas`: `#f8fafc` to `#f1f5f9` (prevents screen fatigue under prolonged exam conditions).
  - `surface-card`: `#ffffff` (dedicated exclusively to elevated question panels, code containers, and modal sheets).
  - `surface-subtle`: `#f1f5f9` (docked sidebars, question navigation rails, and non-editable metadata tags).
- **Outlines & Dividers**:
  - `border-default`: `#e2e8f0` (hairline structural containment).
  - `border-focus`: `#0ea5e9` (dynamic focus rings and active question selections).
  - `border-subtle`: `#f1f5f9` (table and list item subdivisions).
- **Typography & Ink**:
  - `text-primary`: `#0f172a` (highest legibility for stems, mathematical notation, and terminal output).
  - `text-secondary`: `#334155` (supporting explanations, option labels, and instructions).
  - `text-muted`: `#64748b` (metadata, keyboard shortcut hints, timestamp tracking).
- **Functional Semantics**:
  - `primary` (`#0284c7` / `#0ea5e9` / `#0369a1`): Action confirmation, primary navigation, active radio states.
  - `secondary` (`#7c3aed` / `#6366f1`): Tier badges, editorial problem setters, algorithm challenge tags.
  - `success` (`#10b981`): Answered states, test-case passes, positive differential scores.
  - `warning` (`#f59e0b`): Marked for review, bookmark flags, pending sync.
  - `danger` (`#ef4444` / `#dc2626`): Negative marking penalizations, countdown alerts below 5 minutes, destructive reset actions.

## Typography

The typographic hierarchy pairs the geometric neutrality of Plus Jakarta Sans for UI framing and body content with the strict tabular discipline of JetBrains Mono for code blocks, badges, timers, and quantitative readouts.

### Usage Standards
- **Question Stems**: Rendered in `headline-md` or `body-lg` at 600/400 weights. Line lengths must be capped at 72ch to prevent visual wandering when reading long logic puzzles.
- **Monospace Integration**: All question IDs (`Q-042`), memory/time complexity indicators (`O(n log n)`), option markers (`[A]`, `[B]`), timer digits (`00:42:19`), and code snippets use `JetBrains Mono`.
- **Inline Math & Syntax**: Inline code must maintain a balanced x-height against Plus Jakarta Sans with a slight tint overlay (`#f1f5f9` fill, `#0f172a` text, `#e2e8f0` stroke).

## Layout & Spacing

The layout is built on a split-pane workstation architecture:
- **Assessment Canvas (Desktop)**: A dual-column asymmetrical composition consisting of a primary problem panel (70% fluid, max-width 920px) and a fixed-width question matrix rail (320px).
- **Responsive Adaptations**:
  - **Desktop (>= 1024px)**: 12-column grid or dual-split workstation view with `gutter` (1.5rem) and `margin` (2rem). The sidebar tracks real-time submission status, palette filters, and countdown modules.
  - **Tablet (768px - 1023px)**: Question panel spans 100%; the question index rail collapses into a swipeable sheet or bottom bar.
  - **Mobile (< 768px)**: Single column with tight `margin-mobile` (1rem). Options shift to full-width stacked cards with an persistent bottom docked action strip for "Save & Next" and "Mark for Review".

## Elevation & Depth

This system avoids heavy drop shadows, relying primarily on **crisp structural borders, subtle surface tone separation, and micro-diffused ambient lift**:

- **Layer 0 (Canvas Base)**: `#f8fafc`. Completely flat, non-interactive ground plane.
- **Layer 1 (Cards, Problem Stems, Code Editors)**: Pure `#ffffff` framed with a 1px solid `#e2e8f0` outline. Shadow: `0 1px 2px 0 rgba(15, 23, 42, 0.04)`.
- **Layer 2 (Option Selection & Focused Elements)**: Pure `#ffffff` with a 1.5px `#0284c7` border, paired with an ambient cyan glow: `0 0 0 1px #0284c7, 0 4px 12px -2px rgba(2, 132, 199, 0.12)`.
- **Layer 3 (Modals, Palette Panels, Command Palettes)**: `#ffffff` surface with `0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 8px -2px rgba(15, 23, 42, 0.04)` and a 1px `#cbd5e1` outline.

## Shapes

The geometric framework is calibrated to a disciplined **8px–12px radius profile**:
- **Main Problem Cards & Code Blocks**: `rounded-lg` (12px / 0.75rem) to establish clear enclosure without feeling playful or overly bulbous.
- **Option Tiles & Inputs**: `rounded-md` (8px / 0.5rem) to ensure crisp alignment when stacked in vertical option lists.
- **Badges, Status Pills & Nav Matrix Nodes**: `rounded-sm` (4px to 6px) to maintain a dense, engineering-grade instrument panel aesthetic. Circular shapes (`rounded-full`) are reserved strictly for question matrix dots and avatar chips.

## Components

### Buttons
- **Primary Action ("Save & Next")**: Solid `#0284c7` fill, white text, 8px radius, `JetBrains Mono` medium typography, horizontal padding `space-lg`, height 40px. Subtle hover: `#0369a1`.
- **Secondary Action ("Clear Response", "Previous")**: Transparent fill, `#e2e8f0` border, `#334155` text. Hover: `#f8fafc` surface with `#cbd5e1` border.
- **Warning Action ("Mark for Review & Next")**: Background `#fffbeb`, border `1px solid #fde68a`, text `#b45309`. Hover: `#fef3c7`.
- **Destructive/Terminal ("End Assessment")**: Outline or light-fill ruby: background `#fef2f2`, border `1px solid #fecaca`, text `#dc2626`.

### Question Options (MCQ Radio Tiles)
- Full-width stacked containers with an 8px border-radius, pure white background, and 1px `#e2e8f0` border.
- **Default State**: Inactive letter indicator (`[A]`, `[B]`) in `JetBrains Mono` with `#64748b` color.
- **Hover State**: Border shifts to `#94a3b8`; background transitions to `#f8fafc`.
- **Selected State**: Border scales to 1.5px `#0284c7`, background tint `#f0f9ff`. Option letter turns bold with `#0284c7` text fill.

### Code Display & Snippets
- Embedded inside a card with a clean header bar showing language (e.g., `C++ 20`, `PYTHON 3.11`) and copy triggers.
- Background: `#0f172a` (dark charcoal for the editor window) or `#f8fafc` (light theme snippet option with `#e2e8f0` border).
- Line numbers displayed via `JetBrains Mono` in `#64748b`, non-selectable.

### Assessment Status Matrix (Question Palette)
- A dense numeric grid (e.g., 1 to 50) using 36x36px cells with 6px border-radius:
  - **Answered**: `#10b981` solid background with white text.
  - **Marked for Review**: `#f59e0b` solid background with white text.
  - **Answered & Marked for Review**: `#10b981` background with a prominent `#f59e0b` indicator ring.
  - **Unvisited**: `#f1f5f9` background with `#64748b` text and hairline `#e2e8f0` border.
  - **Current Active**: Deep outline ring `2px solid #0284c7`.

### Exam Timer & Metadata Header
- Persistent top bar pinned above the viewport.
- Timer block constructed with a soft danger threshold: normal state `#0f172a` text; below 5 minutes switches to `#dc2626` text with a pulsating red status pip and `#fef2f2` container.
- Includes instantaneous sync indicator ("Syncing...", "Saved to Cloud") in `label-sm`.