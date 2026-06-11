# Styling & Theming

subnet.fit uses a **Solarized**-based design system ("Obsidian"), Tailwind CSS v4 with a semantic token layer, class-based dark mode, shared UI primitives, and Motion for animations.

## Tailwind CSS v4 Setup

Tailwind v4 is configured as a Vite plugin — **not** via PostCSS:

```typescript
// vite.config.ts
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

The CSS entry point imports Tailwind directly:

```css
@import "tailwindcss";
```

## Semantic Token Layer

Theming is driven by **semantic CSS custom properties** defined in `src/index.css`. Light values live on `:root`, dark values on `.dark`, and Tailwind's `@theme inline` directive surfaces them as colour utilities that resolve at the use-site:

```css
:root {
  --canvas: #fdf6e3;   /* base3  — page background */
  --surface: #eee8d5;  /* base2  — cards, chips */
  --well: #fdf6e3;     /* base3  — inputs, inset areas on a surface */
  --ink: #586e75;      /* base01 — emphasized text */
  --ink-body: #657b83; /* base00 — body text */
  --ink-muted: #93a1a1;/* base1  — secondary text */
  --line: #93a1a1;     /* base1  — borders, dividers */
}

.dark {
  --canvas: #002b36;
  --surface: #073642;
  --well: #002b36;
  --ink: #93a1a1;
  --ink-body: #839496;
  --ink-muted: #586e75;
  --line: #586e75;
}

@theme inline {
  --color-canvas: var(--canvas);
  --color-surface: var(--surface);
  /* ...one --color-* entry per token */
}
```

The seven semantic tokens:

| Token | Utility examples | Role | Light | Dark |
|-------|-----------------|------|-------|------|
| `canvas` | `bg-canvas` | Page background | base3 `#fdf6e3` | base03 `#002b36` |
| `surface` | `bg-surface` | Cards, chips, modal panels | base2 `#eee8d5` | base02 `#073642` |
| `well` | `bg-well` | Inputs, inset areas on a surface | base3 `#fdf6e3` | base03 `#002b36` |
| `ink` | `text-ink` | Emphasized text | base01 `#586e75` | base1 `#93a1a1` |
| `ink-body` | `text-ink-body` | Body text | base00 `#657b83` | base0 `#839496` |
| `ink-muted` | `text-ink-muted` | Secondary text | base1 `#93a1a1` | base01 `#586e75` |
| `line` | `border-line/20` | Borders, dividers | base1 `#93a1a1` | base01 `#586e75` |

Because the underlying custom property flips with the `.dark` class, components write `bg-surface text-ink border-line/20` and theming is automatic — **no `dark:` prefixes and no hardcoded base-tone hex values** like `bg-[#eee8d5] dark:bg-[#073642]`.

Accents are unchanged and mode-invariant: `sol-cyan`, `sol-blue`, `sol-magenta`, `sol-green`, `sol-red`, `sol-yellow`, `sol-violet`, `sol-orange` (plus `network-bit`, `host-bit`, and the cloud provider colours). A mode-invariant `sol-base03` … `sol-base3` scale exists for the rare fixed-colour case — uppercase micro-labels use `text-sol-base01`, which reads as emphasized in light mode and secondary in dark mode by design.

### @layer base Gotcha

Element-level rules in `index.css` (e.g. `text-wrap: balance` on headings) live in `@layer base` so Tailwind utilities such as `whitespace-nowrap` can still override them. Unlayered element selectors would beat utility classes in the cascade.

## Dark Mode

Dark mode uses a custom variant that targets the `.dark` class on any ancestor:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

The `dark` class is toggled on `<html>` by the theme store. Most components never need `dark:` utilities — the semantic tokens flip automatically. The variant remains available for the rare case a component genuinely diverges between modes.

### Toggle Behavior

The shared `ThemeToggle` component (used by both app headers) renders a sun/moon toggle button. Clicking it calls `toggleTheme()` from the theme store, which:
1. Flips between `'dark'` and `'light'`
2. Adds/removes the `dark` class on `<html>`
3. Persists the choice to `localStorage`

## Typography

Two Google Fonts are loaded in `index.html`:

| Role | Font | Weight range |
|------|------|-------------|
| Display / UI | **Schibsted Grotesk** | 400–900 |
| Monospace / Data | **Martian Mono** | 300–700 |

Configured in `src/index.css`:

```css
@theme {
  --font-sans: 'Schibsted Grotesk', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'Martian Mono', ui-monospace, monospace;
}
```

## Accent & Fixed-Colour Tokens

Mode-invariant colours are defined in `src/index.css` using a plain `@theme` block (the semantic tokens above use `@theme inline` because their values are CSS variables):

```css
@theme {
  /* Solarized accents (mode-invariant) */
  --color-network-bit: #268bd2;   /* sol blue */
  --color-host-bit: #d33682;      /* sol magenta */
  --color-sol-cyan: #2aa198;
  --color-sol-blue: #268bd2;
  --color-sol-magenta: #d33682;
  --color-sol-green: #859900;
  --color-sol-red: #dc322f;
  --color-sol-yellow: #b58900;
  --color-sol-violet: #6c71c4;
  --color-sol-orange: #cb4b16;

  /* Solarized base scale (mode-invariant, for the rare fixed-colour case) */
  --color-sol-base03: #002b36;
  --color-sol-base02: #073642;
  --color-sol-base01: #586e75;
  --color-sol-base00: #657b83;
  --color-sol-base0: #839496;
  --color-sol-base1: #93a1a1;
  --color-sol-base2: #eee8d5;
  --color-sol-base3: #fdf6e3;

  /* Cloud providers - mapped to Solarized */
  --color-aws: #cb4b16;    /* sol orange */
  --color-azure: #268bd2;  /* sol blue */
  --color-gcp: #6c71c4;    /* sol violet */
}
```

These tokens are available as Tailwind utilities (e.g. `text-network-bit`, `bg-aws`, `text-sol-cyan`). Components use the semantic tokens for base tones and these named accent utilities for colour — hardcoded hex values in Tailwind classes (e.g. `text-[#2aa198]`) are no longer used.

## Solarized Color System

### Base Tones — Dark Mode (Solarized Dark)

| Role | Solarized name | Hex |
|------|---------------|-----|
| Background | base03 | `#002b36` |
| Card / Surface | base02 | `#073642` |
| Secondary content | base01 | `#586e75` |
| Body text | base0 | `#839496` |
| Emphasized text | base1 | `#93a1a1` |

### Base Tones — Light Mode (Solarized Light)

| Role | Solarized name | Hex |
|------|---------------|-----|
| Background | base3 | `#fdf6e3` |
| Card / Surface | base2 | `#eee8d5` |
| Secondary content | base1 | `#93a1a1` |
| Body text | base00 | `#657b83` |
| Emphasized text | base01 | `#586e75` |

### Accent Colors (same in both modes)

| Role | Color | Hex |
|------|-------|-----|
| Primary accent / links / active states | Cyan | `#2aa198` |
| Network bits (binary breakdown) | Blue | `#268bd2` |
| Host bits (binary breakdown) | Magenta | `#d33682` |
| Valid input / success | Green | `#859900` |
| Error / invalid | Red | `#dc322f` |
| Warnings / highlights | Yellow | `#b58900` |
| Secondary accent | Violet | `#6c71c4` |
| Tertiary accent | Orange | `#cb4b16` |

### Cloud Provider Colors

| Provider | Solarized mapping | Hex |
|----------|------------------|-----|
| AWS | Orange | `#cb4b16` |
| Azure | Blue | `#268bd2` |
| GCP | Violet | `#6c71c4` |

Subnet splits use a rotating palette of 16 colors defined in `subnet-math.ts`.

## Shared Primitives

`src/components/shared/` provides the building blocks all features compose. Everything is built on the semantic tokens:

| Primitive | Purpose |
|-----------|---------|
| `Button` | The app's one button. Variants `soft` / `primary` / `ghost` / `danger` / `outline`, sizes `xs` / `sm` / `md`, an `active` prop for a cyan-tinted pressed/selected state, and renders an `<a>` when given `href`. |
| `IconButton` | Square icon-only button (`aria-label` required). Variants `soft` / `ghost` / `danger`. |
| `Input` / `Select` / `Textarea` | Form fields sharing a single focus/border treatment (`bg-well`, `border-line/25`, cyan focus ring, `invalid` and `mono` props). |
| `SectionLabel` / `LabelValue` | The uppercase micro-label (`text-sol-base01`) and the label-over-value data-display pattern, with optional copy button. |
| `SegmentedControl` | Pill-style segmented switch for mode toggles, provider pickers, and tab bars (`role` of `radiogroup` or `tablist`). |
| `Modal` | Shared dialog: backdrop, Escape handling, body scroll lock, focus restore, pop animation. `chrome="default"` renders a titled header bar; `chrome="none"` leaves the chrome to the caller (used by the command palette). |
| `Drawer` | Right-hand slide-in sheet (Quick Reference, Supernet tool, designer overlay panels). |
| `ThemeToggle` | Sun/moon theme switch used in both app headers. |
| `Badge` | Pill badge with colours `green` / `violet` / `yellow` / `cyan` / `red` / `neutral`. |
| `AnimatedCard` / `CollapsibleSection` | Card entrance animation and expandable card sections. |
| `CopyButton` | Clipboard copy with feedback state. |
| `motion.ts` | Shared animation presets (see [Animation Patterns](#animation-patterns)). |

## Card Styling

The `AnimatedCard` shared component provides solid Solarized surfaces with no glassmorphism:

- **Surface:** `bg-surface` with a `border-line/30` border (both flip with the theme)
- **Shadows:** subtle `shadow-sm` in light mode, none in dark (`dark:shadow-none`)
- **Corners:** `rounded-lg` (8px)

## Background Treatment

### Dot Grid

The body background uses a subtle CSS dot grid pattern instead of gradient orbs, built from the semantic variables so it flips with the theme automatically:

```css
body {
  background-color: var(--canvas);
  background-image: radial-gradient(circle, var(--surface) 1px, transparent 1px);
  background-size: 24px 24px;
}
```

The dot grid provides subtle texture without distraction. No fixed-position blurred orbs or radial ambient gradients.

## Border Conventions

Borders use the `line` semantic token at varying opacities (the token flips between base1 and base01 with the theme):

| Context | Classes |
|---------|---------|
| Card borders | `border-line/30` |
| Dividers / separators | `border-line/20` or `border-line/15` |
| Input borders (default) | `border-line/25` |
| Input borders (invalid) | `border-sol-red/50` |
| Input borders (focus) | `border-sol-cyan/40` + `ring-sol-cyan/15` |
| Inline dividers | `bg-line/20` |

The CidrInput component uses a transparent background with a single `border` (no shadow), matching the lightweight feel of surrounding content panels. All other form fields share the single focus treatment baked into the `Input`/`Select`/`Textarea` primitives.

## Animation Patterns

The app uses the `motion` library (Motion, imported from `motion/react`). Shared presets live in `src/components/shared/motion.ts` — pick one instead of inventing new numbers:

| Export | Type | Use |
|--------|------|-----|
| `EASE` | Cubic-bezier tuple | The one easing curve for entrances/exits |
| `DUR` | `{ fast: 0.15, base: 0.25, slow: 0.4 }` | Standard durations |
| `fadeIn` | Variant props | Simple opacity fade (backdrops, tab content swaps) |
| `cardEntrance(delay?)` | Variant factory | Card rises from below (used by `AnimatedCard`) |
| `modalPop` | Variant props | Subtle scale pop for modals/popovers (used by `Modal`) |
| `collapse` | Variant props | Height collapse for expandable sections (used by `CollapsibleSection`) |
| `drawerSpring` | `Transition` | Spring used by slide-in drawers (used by `Drawer`) |

### Staggered Entrances

Components use `initial` / `animate` props for fade-and-slide entrances:

```tsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
>
```

### Theme Toggle Animation

The sun/moon icon in `ThemeToggle` rotates on theme switch:

```tsx
<motion.div
  key={theme}
  initial={{ rotate: -90, opacity: 0 }}
  animate={{ rotate: 0, opacity: 1 }}
  transition={{ duration: 0.3 }}
>
```

### Shared Layout

Tab indicators use `layoutId` for smooth spring-animated transitions between active states.

## Custom Scrollbar

A slim custom scrollbar is defined for WebKit browsers:

- 6px width
- Transparent track
- Thumb built from the `--line` token via `color-mix()` (40% opacity, 60% on hover) with rounded corners, so it flips with the theme

## Selection Color

Text selection uses a Solarized cyan tint:

```css
::selection {
  background: rgba(42, 161, 152, 0.25);
}
```
