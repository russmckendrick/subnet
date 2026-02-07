# Styling & Theming

subnet.fit uses a **Solarized**-based design system ("Obsidian"), Tailwind CSS v4 with custom theme tokens, class-based dark mode, and Motion for animations.

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

## Dark Mode

Dark mode uses a custom variant that targets the `.dark` class on any ancestor:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

The `dark` class is toggled on `<html>` by the theme store. This enables `dark:` utilities throughout the app (e.g. `dark:bg-[#073642]`, `dark:text-[#93a1a1]`).

### Toggle Behavior

The Header component renders a sun/moon toggle button. Clicking it calls `toggleTheme()` from the theme store, which:
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

## Custom Theme Tokens

Defined in `src/index.css` using Tailwind's `@theme` directive:

```css
@theme {
  /* Solarized accents */
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

  /* Cloud providers - mapped to Solarized */
  --color-aws: #cb4b16;    /* sol orange */
  --color-azure: #268bd2;  /* sol blue */
  --color-gcp: #6c71c4;    /* sol violet */
}
```

These tokens are available as Tailwind utilities (e.g. `text-network-bit`, `bg-aws`). However, most components use hardcoded Solarized hex values directly in Tailwind classes (e.g. `text-[#2aa198]`) for consistency.

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

## Card Styling

The `AnimatedCard` shared component provides solid Solarized surfaces with no glassmorphism:

- **Dark mode:** `bg-[#073642]` background, `border-[#586e75]/30` border, no shadow
- **Light mode:** `bg-[#eee8d5]` background, `border-[#93a1a1]/30` border, subtle `shadow-sm`
- **Corners:** `rounded-lg` (8px)

## Background Treatment

### Dot Grid

The body background uses a subtle CSS dot grid pattern instead of gradient orbs:

```css
.dark body {
  background-color: #002b36;
  background-image: radial-gradient(circle, #073642 1px, transparent 1px);
  background-size: 24px 24px;
}

:not(.dark) body {
  background-color: #fdf6e3;
  background-image: radial-gradient(circle, #eee8d5 1px, transparent 1px);
  background-size: 24px 24px;
}
```

The dot grid provides subtle texture without distraction. No fixed-position blurred orbs or radial ambient gradients.

## Border Conventions

| Context | Dark mode | Light mode |
|---------|-----------|------------|
| Card borders | `border-[#586e75]/30` | `border-[#93a1a1]/30` |
| Dividers / separators | `border-[#586e75]/20` | `border-[#586e75]/20` |
| Input borders (default) | `border-[#586e75]/30` | `border-[#93a1a1]/20` |
| Input borders (valid) | `border-[#859900]/40` | `border-[#859900]/40` |
| Input borders (invalid) | `border-[#dc322f]/40` | `border-[#dc322f]/40` |
| Input borders (focus) | `border-[#2aa198]/40` | `border-[#2aa198]/40` |
| Inline dividers | `bg-[#586e75]/20` | `bg-[#93a1a1]/20` |

The CidrInput component uses a transparent background with a single `border` (no shadow), matching the lightweight feel of surrounding content panels.

## Animation Patterns

The app uses the `motion` library (Motion, imported from `motion/react`) for:

### Staggered Entrances

Components use `initial` / `animate` props for fade-and-slide entrances:

```tsx
<motion.div
  initial={{ opacity: 0, x: -20 }}
  animate={{ opacity: 1, x: 0 }}
>
```

### Theme Toggle Animation

The sun/moon icon rotates on theme switch:

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
- Solarized base01 thumb (`rgba(88, 110, 117, 0.4)`) with rounded corners and hover highlight

## Selection Color

Text selection uses a Solarized cyan tint:

```css
::selection {
  background: rgba(42, 161, 152, 0.25);
}
```
