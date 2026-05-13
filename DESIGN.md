---
name: RCSA Form
description: Risk and Control Self-Assessment for banking operational risk management
colors:
  primary: "#0f172a"
  accent: "#14b8a6"
  neutral-bg: "#f8fafc"
  surface: "#ffffff"
  border: "#e2e8f0"
  text-primary: "#1e293b"
  text-secondary: "#334155"
  text-muted: "#64748b"
  danger: "#e11d48"
  success: "#059669"
  warning: "#d97706"
  info: "#2563eb"
  risk-low: "#10b981"
  risk-medium: "#f59e0b"
  risk-high: "#f97316"
  risk-critical: "#f43f5e"
typography:
  body:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 0.875rem
    fontWeight: 400
    lineHeight: 1.625
  title:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1.5rem
    fontWeight: 700
    lineHeight: 1.3
  headline:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 1.25rem
    fontWeight: 700
    lineHeight: 1.3
  label:
    fontFamily: Inter, system-ui, sans-serif
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: 0.1em
    textTransform: uppercase
rounded:
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
spacing:
  xxs: 8px
  xs: 12px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 40px
  xxl: 48px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: 12px 40px
    fontWeight: 700
    fontSize: 0.875rem
  button-primary-hover:
    backgroundColor: "#1e293b"
  button-secondary:
    backgroundColor: "#f1f5f9"
    textColor: "#334155"
    rounded: "{rounded.sm}"
    padding: 8px 16px
    fontWeight: 600
  button-secondary-hover:
    backgroundColor: "#e2e8f0"
  button-danger:
    backgroundColor: "{colors.danger}"
    textColor: "#ffffff"
    rounded: "{rounded.sm}"
    padding: 8px 16px
    fontWeight: 600
  button-danger-hover:
    backgroundColor: "#be123c"
  input:
    backgroundColor: "{colors.neutral-bg}"
    textColor: "{colors.text-secondary}"
    borderColor: "{colors.border}"
    rounded: "{rounded.sm}"
    padding: 10px 16px
    fontSize: 0.875rem
    borderWidth: 1px
  input-focus:
    borderColor: "{colors.accent}"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: 32px
    borderColor: "{colors.border}"
    borderWidth: 1px
  table-header:
    backgroundColor: "#f8fafc"
    textColor: "{colors.text-muted}"
    padding: 16px
    fontSize: 0.75rem
    fontWeight: 600
    letterSpacing: 0.1em
  table-cell:
    padding: 16px
    borderColor: "#f1f5f9"
    borderWidth: 0 0 1px 0
---

# Design System: RCSA Form

## 1. Overview

**Creative North Star: "The Risk Register"**

A quiet, methodical tool for banking risk professionals. This is the visual language of a well-kept logbook: organized, trustworthy, every entry exact. The interface steps back so the data steps forward. No decorative flourishes, no dashboard theatrics. Just clear structure, consistent behavior, and the confidence that comes from knowing every score computes correctly.

The system is a **product register** for an internal banking application. Layout renders as layered surfaces on a tinted neutral ground. Form sections carry distinct visual breaks (borders, spacing) that guide the eye through the assessment workflow without handholding. Interactive elements are **tactile and confident** — buttons press into the surface, inputs glow on focus, state changes feel immediate.

**Key Characteristics:**
- Layered surfaces on a light neutral background (slate-50)
- One accent color (teal-500) reserved for focus indicators
- Risk scores stand alone with bold color: green, amber, orange, rose in increasing severity
- Single sans-serif typeface (Inter) across all roles — body, labels, headings, data
- Tables as a first-class citizen: dense, scannable, predictable column layouts
- Modals are rare: reserved for confirmations, process management, and the reference guide

## 2. Colors

A restrained palette built on Tailwind's slate neutral axis with a teal accent and a four-step semantic risk spectrum. The base is warm-ish slate; the accent is cool teal. The combination avoids both the generic SaaS-cream default and the navy-plus-gold banking cliché — it is specific to this tool without being decorative.

### Primary
- **Midnight Surface** (#0f172a / oklch(0.21 0.03 264)): All primary action buttons, the login submit. The darkest element in the system — reserved for commitment points.

### Accent
- **Teal Marker** (#14b8a6 / oklch(0.7 0.14 185)): Focus ring on inputs and selects. Used on roughly 5% of any screen — its scarcity is the point.

### Neutral
- **Page Ground** (#f8fafc / oklch(0.97 0.005 240)): Body background. Tinted barely-blue — cold enough to feel deliberate, not so cold as to be clinical.
- **Card White** (#ffffff): All elevated surfaces (cards, modal interiors, tables). Pure white is permitted here because it sits inside the tinted ground.
- **Border Line** (#e2e8f0 / oklch(0.89 0.01 250)): All borders between surfaces.
- **Heading Ink** (#1e293b / oklch(0.25 0.02 260)): All headings and bold table content.
- **Body Ink** (#334155 / oklch(0.35 0.02 260)): Body text, form input values.
- **Muted Ink** (#64748b / oklch(0.53 0.02 250)): Labels, placeholders, secondary table headers, empty-state text.

### Semantic States
- **Danger** (#e11d48 / oklch(0.55 0.24 10)): Delete buttons, destructive actions, error banners.
- **Success** (#059669 / oklch(0.6 0.16 165)): "Closed" status badge, positive states.
- **Warning** (#d97706 / oklch(0.65 0.19 70)): "Open" status badge.
- **Info** (#2563eb / oklch(0.5 0.2 260)): "In Progress" status badge, tutorial highlights.

### Risk Spectrum
- **Low — Emerald** (#10b981 / oklch(0.65 0.17 158)): Risk level 1. Used for score badges and matrix cells.
- **Medium — Amber** (#f59e0b / oklch(0.75 0.19 75)): Risk level 2.
- **High — Orange** (#f97316 / oklch(0.65 0.22 40)): Risk level 3.
- **Critical — Rose** (#f43f5e / oklch(0.55 0.24 10)): Risk level 4. Never used outside risk scores and residual displays.

### Named Rules
**The One Accent Rule.** Teal appears on focus rings only. It must never exceed 5% of any screen. Its rarity is the measure of the system's restraint.

**The Risk-Only Spectrum Rule.** Saturated green, amber, orange, and rose appear exclusively on risk score badges and matrix cells. These colors carry meaning — do not repurpose them for UI chrome, link colors, or decorative elements.

## 3. Typography

**Display Font:** Inter
**Body Font:** Inter, system-ui, sans-serif
**Label Font:** Inter, system-ui, sans-serif (same stack, weight + tracking differentiate)

Inter is the single typeface across the entire system. A product UI does not need a display/body pairing — one well-tuned sans carries everything from headings to data cells. The stack compiles to system-native on every platform.

**Character:** Precise, professional, unhurried. Inter's generous x-height and controlled letterforms keep the densest tables readable. The system never uses italic, never uses condensed widths, and never uses weights below 400 for UI text.

### Hierarchy

- **Headline** (700 / 1.5rem / 1.3): Primary page title ("Risk and Control Self-Assessment") and section titles ("Manage Processes", "Reference Guide"). Appears once per view.
- **Title** (700 / 1.25rem / 1.3): Card headings ("Logged Risks (N)"), modal titles, form "New Risk Entry" heading.
- **Body** (400 / 0.875rem / 1.625): All form content, table cells, descriptions, paragraphs. Line length varies: prose content at 65-75ch, table cells unconstrained.
- **Label** (600 / 0.75rem / 1 / 0.1em tracking, uppercase): Form field labels, table headers, section header labels. This is the most distinctive treatment in the system — tiny, bold, wide-tracked, uppercase. The form relies on these labels as landmarks.
- **Data display** (700 / 1.5rem / 1): Computed risk scores in the form score-display boxes. The large weight contrast against surrounding body text makes scores immediately findable.
- **Caption** (600 / 0.6875rem / 1 / 0.05em tracking, uppercase): Status badges, score-level badges, risk matrix labels. Tightened tracking relative to labels, compact form factor.

## 4. Elevation

The system uses **layered surfaces** on a tinted ground. Elevation is conveyed through a combination of borders, background tints, and shadow steps. The ground (slate-50) is the lowest layer. Surfaces at rest sit one layer above the ground, distinguished by white fill and a 1px border.

- **Surface (level 1) — card, form section, table wrapper:** `box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)` (Tailwind `shadow-sm`). A near-flat shadow that separates the card from the ground without simulating depth.
- **Elevated (level 2) — login card, modals:** `box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` (Tailwind `shadow-lg`) for the login card; `box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25)` (Tailwind `shadow-2xl`) for modals and the editing-active form state.
- **Drawer (level 3) — examples drawer:** `box-shadow: 0 20px 50px rgba(0,0,0,0.2)`. The highest surface; sits above the modal layer when both are present.
- **Tonal overlay — modal/drawer backdrop:** `background: rgba(30, 41, 59, 0.6)` with `backdrop-filter: blur(4px)`. The overlay darkens the entire viewport to focus attention on the active surface.
- **Tonal row — table rows:** Alternate rows at `background: rgba(248, 250, 252, 0.5)` reduce scanning fatigue without adding a visible shadow.

### Named Rules
**The Flat-By-Default Rule.** Surfaces at rest use the minimum shadow necessary to separate from the ground. Shadows grow only for active states (form editing), modal elevation, or the drawer. Rested surfaces do not float.

## 5. Components

### Buttons

- **Shape:** Gently curved edges (6px / `rounded-md`).
- **Primary ("Save Entry", "Sign In"):** Dark slate background (#0f172a), white text, 12px 40px padding. Hover: one step lighter (#1e293b). Focus: ring-2 ring-slate-900. Active: `scale(0.95)` contract. Disabled: 50% opacity, no shadow.
- **Secondary ("Cancel", "Close", "Back"):** Slate-100 background (#f1f5f9), slate-700 text (#334155), 8px 16px padding. Hover: slate-200 (#e2e8f0). Focus: ring-2 ring-slate-400. Paired primary + secondary sets are always primary on the right, secondary on the left.
- **Danger ("Delete"):** Rose-600 (#e11d48), white text, 8px 16px. Hover: rose-700 (#be123c). Used exclusively for destructive confirmation actions.
- **Outline/Soft ("How to Use", "Reference Guide"):** 1px border in the color's 200 shade, background at 50 shade, text at 700 shade. Each accent maps: blue-50/blue-200/blue-700 for tutorial, emerald-50/emerald-200/emerald-700 for reference. Hover: background shifts to the 100 shade.
- **Icon-only (table row actions):** 32x32px square, 6px radius. Default: transparent, slate-400 icon. Hover: tinted background (indigo-50 for view/edit, rose-50 for delete) with matching icon color.

All buttons share: 600ms cubic-bezier transitions on background-color and transform, `active:scale-95` for press feedback, and `cursor:not-allowed` at disabled.

### Chips / Badges

- **Status badges (`rounded-full`, 10px font, bold, uppercase, 0.1em tracking):** Compact pills for status and score levels. Open: amber-100/amber-700. Closed: emerald-100/emerald-700. In Progress: blue-100/blue-700. Score level: tinted background at 18% opacity of the color, same color for text and border — applied inline via `RISK_COLORS[n]`.
- **Category tags (risk root cause, event type, control type):** Inline flex items, 10px font, bold, uppercase, 0.05em tracking, rounded-md. Colored per semantic category: indigo for root cause, rose for event type, emerald for control type, blue for treatment.

### Cards

- **Corner style:** 16px radius (`rounded-2xl`). Generous rounding distinguishes cards from the page ground.
- **Background:** White.
- **Border:** 1px solid slate-200.
- **Shadow:** `shadow-sm` at rest.
- **Internal padding:** 32px (form sections), 32px (table sections). Cards contain either a form or a table wrapper, never both.
- **Form cards** have a title bar with a bottom border (slate-100, 1px) and 24px bottom padding. The form sections inside are separated by border-top + 32px top padding.

### Inputs / Fields

- **Style:** Inline stroke — 1px solid slate-200 border, slate-50 background, 6px radius. Internal padding: 10px 16px with 2.75rem minimum height (44px touch target).
- **Textareas:** Same rules with 5rem minimum height for three rows of text.
- **Typeahead/Select:** Custom chevron via inline SVG background, extra 2.5rem right padding to avoid text-chevron overlap.
- **Focus:** Border shifts to teal-500 with `ring-2 ring-teal-500/10`. The teal glow is the only colored state; there is no filled/active variant.
- **Error:** Border shifts to red-500 with `ring-2 ring-red-100`. Error message banner appears above the form.
- **Disabled:** Standard Tailwind `opacity-50` + `cursor-not-allowed` (view-only mode).
- **Labels:** Placed above each input. Uppercase, 0.75rem, bold, 0.1em tracking, slate-500. Margin-bottom of 10px keeps labels visibly bound to their field.

### Tables

- **Wrapper:** 12px radius (`rounded-xl`), 1px slate-200 border, `shadow-sm`.
- **Headers:** Slate-50/80 background, 16px padding, 0.75rem bold uppercase 0.1em tracking slate-500 text.
- **Cells:** 16px padding, single bottom border (slate-100, 1px). Alternate rows at slate-50/50 tint.
- **Hover:** Rows shift to slate-50 on hover for scannability.
- **Empty state:** Single cell spanning all columns, centered, 48px padding, italic slate-400 text ("No risks logged yet.").
- **Pagination:** Below the table on large result sets (20 rows/page). Two-outcome layout: Previous + page count + Next, all in 0.75rem font.

### Navigation (Surface-level)

- **Department indicator:** An inline tag in the header area showing the current department with an "X" button to change. Displayed as a 1px border, slate-200, white fill, rounded-lg, 8px 16px padding.
- **Tabs (Reference Guide):** Underline-style. Active tab: 2px bottom border in slate-800, slate-50 background, slate-800 text. Inactive: transparent border, slate-400 text. Tab set is wrapped in a single bottom border (slate-100, 1px) that the active tab's border overlaps.

### Score Display (Signature Component)

The computed score display boxes are a distinctive pattern in the system. Each has:
- A background tint (slate-100 at 80% opacity) distinguishing them from editable inputs
- The score value in 1.5rem bold, colored by the risk level (RISK_COLORS mapping)
- An adjacent label badge: 11px, bold, uppercase, wider tracking (0.05em), with same-color background at 18% opacity

These appear in the Inherent Risk Scoring, Control Rating, and Residual Risk sections. They are **output-only** — never editable, always computed.

### Modals

- **Overlay:** Fixed full-screen, z-1100, centered flex, 60% opacity slate-900 background, 4px blur.
- **Card:** 420px max-width, 2xl rounded, white fill, 32px padding, `shadow-2xl`.
- **Close:** "X" icon button in the top-right area, slate-400, hover to slate-600.

The process management variant uses a wider variant (90vw, 600px max) to accommodate the table and input row.

### Tutorial Overlay

- **Step indicator:** 10px bold uppercase blue-500 tracking widest at the top.
- **Highlight rings:** Target elements get a 4px ring in blue-500 (for form fields) or emerald-500 (for computed values) at z-1300, with 4px offset.
- **Tooltip:** Floating card positioned via Floating UI. White fill, 2xl rounded, 24px padding, `shadow-2xl`. Contains a morph animation that smoothly transitions tooltip dimensions between steps.

## 6. Do's and Don'ts

### Do:
- **Do** use the teal accent (teal-500) for focus rings only. Never for decorative borders, badges, or buttons.
- **Do** reserve the risk spectrum colors (green, amber, orange, rose) exclusively for risk score displays and matrix cells.
- **Do** keep inputs at minimum 44px height for touch targeting.
- **Do** place form labels above fields, not as placeholder text.
- **Do** use the full card radius (16px / rounded-2xl) consistently for all major surface containers.
- **Do** separate form sections with border-top + generous padding (32px), not with card-inside-card nesting.
- **Do** use `active:scale-95` on all interactive elements for tactile press feedback.
- **Do** use 0.75rem bold uppercase 0.1em tracking for all form labels and table headers.
- **Do** use skeletal/spinner loading states for data fetches; never render partially-populated forms.

### Don't:
- **Don't** use side-stripe borders (border-left / border-right greater than 1px as a colored accent). Use the teal-500 marker stripe on section headers or nothing.
- **Don't** use gradient text (`background-clip: text` + gradient). All text is solid color.
- **Don't** use glassmorphism — no blurred glass cards, no frosted backdrops beyond the modal overlay.
- **Don't** use display fonts in UI labels, buttons, or data cells. Inter is the only typeface.
- **Don't** reinvent standard affordances — no custom scrollbars, no non-standard form controls.
- **Don't** use the hero-metric template (big number, small label, supporting stats, gradient accent). Score displays are functional, not decorative.
- **Don't** use identical card grids with icon + heading + text repeated endlessly.
- **Don't** use modals as the first thought for interactions — exhaust inline and progressive patterns first.
- **Don't** use decorative motion that does not convey state — no entrance choreography, no page-load sequences.
- **Don't** use heavy color or full-saturation accents on inactive states.
