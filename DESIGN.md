---
name: Scholar Script
colors:
  surface: '#f9f9ff'
  surface-dim: '#cfdaf2'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f0f3ff'
  surface-container: '#e7eeff'
  surface-container-high: '#dee8ff'
  surface-container-highest: '#d8e3fb'
  on-surface: '#111c2d'
  on-surface-variant: '#464555'
  inverse-surface: '#263143'
  inverse-on-surface: '#ecf1ff'
  outline: '#777587'
  outline-variant: '#c7c4d8'
  surface-tint: '#4d44e3'
  primary: '#3525cd'
  on-primary: '#ffffff'
  primary-container: '#4f46e5'
  on-primary-container: '#dad7ff'
  inverse-primary: '#c3c0ff'
  secondary: '#0058be'
  on-secondary: '#ffffff'
  secondary-container: '#2170e4'
  on-secondary-container: '#fefcff'
  tertiary: '#703a00'
  on-tertiary: '#ffffff'
  tertiary-container: '#934e00'
  on-tertiary-container: '#ffd2b1'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e2dfff'
  primary-fixed-dim: '#c3c0ff'
  on-primary-fixed: '#0f0069'
  on-primary-fixed-variant: '#3323cc'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a42'
  on-secondary-fixed-variant: '#004395'
  tertiary-fixed: '#ffdcc3'
  tertiary-fixed-dim: '#ffb77d'
  on-tertiary-fixed: '#2f1500'
  on-tertiary-fixed-variant: '#6e3900'
  background: '#f9f9ff'
  on-background: '#111c2d'
  surface-variant: '#d8e3fb'
typography:
  display-lg:
    fontFamily: Source Serif 4
    fontSize: 40px
    fontWeight: '600'
    lineHeight: 48px
  display-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 30px
    fontWeight: '600'
    lineHeight: 38px
  headline-lg:
    fontFamily: Source Serif 4
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-md:
    fontFamily: Source Serif 4
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  headline-sm:
    fontFamily: Source Serif 4
    fontSize: 20px
    fontWeight: '500'
    lineHeight: 28px
  body-doc-lg:
    fontFamily: Source Serif 4
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 30px
  body-doc-md:
    fontFamily: Source Serif 4
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  body-ui-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-ui-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-ui-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 13px
    fontWeight: '400'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 11px
    fontWeight: '500'
    lineHeight: 14px
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-md: 1.5rem
  gutter-lg: 2rem
  margin: 1rem
  margin-md: 2rem
  margin-lg: 3rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

The design system embodies the tactile, focused serenity of a high-end scholarly reading room combined with the precision of modern document engineering software. Designed for researchers, graduate students, and professionals processing complex academic literature and dense PDF forms, the interface strips away cognitive noise to induce sustained deep work.

The aesthetic fuses **Editorial Minimalism** with **Digital Paper Craft**:
- **Tactile Paper Experience**: The canvas honors physical parchment without skeuomorphic clichés, using warm off-whites, crisp hairline dividers, and whisper-soft boundaries.
- **Quiet Precision**: UI controls behave like specialized writing and drafting instruments—restrained, responsive, and disappearing completely during active reading.
- **Academic Authority**: Pairing an editorial serif for intellectual rigor with an ultra-clean geometric sans-serif for contextual tools and data entry.
- **Focused State Awareness**: Color is reserved strictly for semantic feedback (form detection, active citations, annotation states, and sync indicators), preserving visual tranquility across hours of exposure.

## Colors

The palette reproduces the optical comfort of archival book paper paired with graphite ink, accented by focused scholarly indigo and semantic study indicators.

### Palette Roles
- **Base & Canvas**:
  - `bg-canvas`: `#F8F9FA` (Warm archival paper base)
  - `bg-surface`: `#FFFFFF` (Document sheet and elevation base)
  - `bg-muted`: `#F1F3F5` (Toolbars, sidebars, and structural wells)
  - `border-hairline`: `rgba(30, 41, 59, 0.08)` (Subtle separation lines)
- **Ink & Typography**:
  - `text-primary`: `#1E293B` (Deep slate graphite for continuous high-contrast legibility)
  - `text-secondary`: `#64748B` (Neutral supporting copy, timestamps, metadata)
  - `text-tertiary`: `#94A3B8` (Placeholders, disabled cues, subtle guides)
- **Accent & Semantic Signals**:
  - `primary` (`#4F46E5`): Deep academic indigo for primary action states, active text selection, and active tools.
  - `secondary` (`#3B82F6`): Focus blue used for interactive fillable fields, cross-reference anchors, and link accents.
  - `detected-field` (`#D97706`): Muted warm amber for intelligent auto-detected PDF inputs, optical character suggestions, and highlights awaiting confirmation.
  - `status-success` (`#10B981`): Muted botanical green indicating saved annotations, verified document checksums, and completed forms.
  - `status-danger` (`#EF4444`): Crisp crimson for validation errors, signature rejections, and destructive deletions.

## Typography

Typography establishes an intentional dichotomy between the document payload (scholarly, immersive, editorial) and the application framework (precise, structured, functional).

- **Document & Editorial Heads (`Source Serif 4`)**: Employs classical proportions and generous counterforms suited for high-density reading, paper rendering, section divisions, and extracted excerpts.
- **Interface & Operational Controls (`Plus Jakarta Sans`)**: Delivers geometric clarity and neutral balance in small sizes across sidebars, metadata tables, tooltips, and form elements without competing with reading focus.
- **Technical & Coordinates (`JetBrains Mono`)**: Used exclusively for page numbering (`p. 238-242`), bounding-box coordinates, OCR confidence ratings, and LaTeX formula insertion prompts.

## Layout & Spacing

The layout is anchored around a **Centered Document Stage** flanked by collapsible context rails:

- **Sidebar Rails**: 
  - Left navigation rail (document outlines, page thumbnails, search index) stays fixed at `280px` or folds completely away into a `48px` quick-tool bar.
  - Right annotation/metadata rail (extracted notes, form inspector, study deck) occupies `340px` with an overlay behavior below `1280px` screen width.
- **Document Viewport**: Center stage maintains a fixed minimum gutter of `space-lg` (`1.5rem`) on tablet and expands to `space-xl` (`2.5rem`) on desktop. PDF sheet widths respect standard print proportions (A4/Letter) with an auto-scaling bounded max-width of `860px` for optimal single-page viewing.
- **Responsive Adaptations**:
  - *Desktop (>1280px)*: 3-column continuous reading workspace (Outline + Document + Field Inspector).
  - *Tablet (768px - 1279px)*: Document centered, sidebars behave as push drawers or slide-in sheets.
  - *Mobile (<768px)*: Full-width page view with bottom toolbar sheet for tools and touch-optimized navigation controls.

## Elevation & Depth

Visual hierarchy rejects heavy, muddy drop shadows in favor of **Layered Tonal Surfaces and Whispering Hairline Contours**:

- **Paper Sheet Elevation**: PDF document pages use a single, ultra-diffused ambient shadow (`0 2px 8px rgba(30, 41, 59, 0.04), 0 1px 2px rgba(30, 41, 59, 0.02)`) bordered by a `1px` solid border in `rgba(30, 41, 59, 0.06)`. This lifts the virtual paper slightly above the `#F8F9FA` canvas.
- **Floating Palettes & Context Menus**: Floating text annotation toolbars and selection menus utilize micro-elevation (`0 8px 24px rgba(30, 41, 59, 0.08)`) with a crisp border (`rgba(30, 41, 59, 0.08)`) and a subtle background blur (`backdrop-filter: blur(8px)`) over `#FFFFFF`.
- **Form Overlay Rectangles**: Detected PDF input boxes lie coplanar with the page, indicated through soft fill washes (`rgba(217, 119, 6, 0.08)`) and dotted/dashed borders rather than elevation changes.
- **Modal & Zen Mode Backdrop**: Zen reading mode dims sidebars with an opacity transition to `rgba(248, 249, 250, 0.95)`, removing peripheral elements to preserve uninterrupted visual focus.

## Shapes

The design system adopts a **Soft (Level 1)** geometric identity, balancing modern digital product ergonomics with the crisp edges of trimmed physical paper.

- **Base Radius (0.25rem / 4px)**: Applied to text input fields, annotation tags, detected form field overlays, button groups, and toolbar icons.
- **Container Radius (0.5rem / 8px)**: Applied to cards, dropdown menus, sidebar sections, and context sheets.
- **Canvas Sheet Radius (0.125rem / 2px)**: PDF pages preserve sharp, quasi-print corners to prevent distortion of physical document boundaries.
- **Pill Exceptions**: Floating page indicator badges (`Page 12 of 348`) and voice-memo record chips use fully rounded capsules for rapid identification against structural rectangles.

## Components

### Buttons & Tool Triggers
- **Primary Button**: Solid `#4F46E5` background with white text, `0.25rem` radius, `0.5rem` vertical and `1rem` horizontal padding. Minimal scale press effect (`transform: scale(0.98)`).
- **Secondary / Ghost Button**: Transparent background, hairline border `rgba(30, 41, 59, 0.12)`, graphite text `#1E293B`. Hover state shifts surface to `#F1F3F5`.
- **Icon Toolbar Buttons**: Square `32x32px` touch targets with `4px` border radius, subtle hover wash (`rgba(30, 41, 59, 0.04)`), active tool indicated by `#4F46E5` fill or under-dot.

### Input Fields & Detected Form Zones
- **Standard UI Input**: White surface with `1px` border in `#E2E8F0`. Focus state triggers `#3B82F6` ring (`0 0 0 2px rgba(59, 130, 246, 0.2)`).
- **PDF Form Overlay Field**:
  - *Suggested / Auto-detected*: `rgba(217, 119, 6, 0.08)` tint with dashed `1px` amber border `#D97706`. An unobtrusive pill badge floats at top-right indicating OCR confidence.
  - *Confirmed / Active*: Seamless integration with paper; converts to a crisp solid `1px` blue border (`#3B82F6`) upon interaction, typing in graphite slate `#1E293B`.
  - *Saved State*: Border fades to zero, leaving clean typed text with a fleeting micro-checkmark in botanical green (`#10B981`).

### Chips, Badges & Highlights
- **Document Tags**: Subtle tinted pills (`space-xs` vertical, `space-sm` horizontal) with `12px` font size. Neutral background `#E2E8F0` with slate text `#475569`.
- **Study Highlight Chips**: Emulates fluorescent ink with low optical fatigue:
  - Yellow: `rgba(245, 158, 11, 0.18)`
  - Green: `rgba(16, 185, 129, 0.18)`
  - Indigo/Blue: `rgba(79, 70, 229, 0.14)`

### Checkboxes & Selection Controls
- **Form Checkbox**: Sharp `16x16px` box with `3px` corner radius. Unchecked shows `1.5px` border in `#94A3B8`. Checked triggers `#4F46E5` fill with crisp white vector checkmark.
- **Radio Button**: Concentric clean ring, active state shows crisp dot inset by `3px`.

### Cards & Sidebar Elements
- **Document Card**: `#FFFFFF` background, hairline border `rgba(30, 41, 59, 0.06)`, no heavy shadow. Shows thumbnail snapshot of first page with metadata underneath in `body-ui-sm`.
- **Annotation Card**: Attached to PDF coordinates via fine guide line. Compact padding (`space-sm` to `space-md`), containing user notes, timestamp, and optional citation anchor tag.

### Reader Context Toolbar (Floating Selection Bar)
- Floats horizontally above highlighted text: includes Highlighter, Underline, Add Margin Note, Translate/Define, and Copy LaTeX Citation. Wrapped in a solid `#FFFFFF` pill with thin slate stroke and micro-elevation.