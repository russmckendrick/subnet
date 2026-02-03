# Styling & Theming

subnet.fit uses Tailwind CSS v4 with custom theme tokens, class-based dark mode, glassmorphism card patterns, and Motion for animations.

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

The `dark` class is toggled on `<html>` by the theme store. This enables `dark:` utilities throughout the app (e.g. `dark:bg-slate-800`, `dark:text-white`).

### Toggle Behavior

The Header component renders a sun/moon toggle button. Clicking it calls `toggleTheme()` from the theme store, which:
1. Flips between `'dark'` and `'light'`
2. Adds/removes the `dark` class on `<html>`
3. Persists the choice to `localStorage`

## Custom Theme Tokens

Defined in `src/index.css` using Tailwind's `@theme` directive:

```css
@theme {
  --font-sans: 'Inter', ui-sans-serif, system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;

  --color-network-bit: #06b6d4;
  --color-host-bit: #f59e0b;
  --color-aws: #ff9900;
  --color-azure: #0078d4;
  --color-gcp: #4285f4;
}
```

These tokens are available as Tailwind utilities (e.g. `text-network-bit`, `bg-aws`).

## Color Conventions

| Color | Hex | Usage |
|-------|-----|-------|
| Cyan (`network-bit`) | `#06b6d4` | Network portion bits in binary breakdown |
| Amber (`host-bit`) | `#f59e0b` | Host portion bits in binary breakdown |
| AWS orange | `#ff9900` | AWS provider card accent |
| Azure blue | `#0078d4` | Azure provider card accent |
| GCP blue | `#4285f4` | GCP provider card accent |

Subnet splits use a rotating palette of 16 colors defined in `subnet-math.ts`.

## Glassmorphism Cards

The `AnimatedCard` shared component applies a frosted-glass effect using the `.glass-card` utility:

```css
.glass-card {
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
}
```

Cards combine this with semi-transparent backgrounds (`bg-white/60 dark:bg-white/[0.04]`) and subtle borders (`border-black/[0.06] dark:border-white/[0.08]`).

## Background Treatment

### Background Orbs

Two fixed, blurred orbs provide subtle depth:

```tsx
<div className="bg-orb absolute -top-48 -left-48 w-[600px] h-[600px] bg-indigo-500" />
<div className="bg-orb absolute top-1/2 -right-64 w-[500px] h-[500px] bg-cyan-500" />
```

The `.bg-orb` class applies `border-radius: 50%`, `filter: blur(120px)`, and reduced opacity (0.04 light / 0.06 dark).

### Body Gradients

Radial gradients provide a subtle ambient glow:

- **Dark mode** — Deep navy (`#0c0f1a`) with indigo and cyan radial gradients at low opacity
- **Light mode** — Slate white (`#f8fafc`) with the same gradients at even lower opacity

## Animation Patterns

The app uses the `motion` library (Framer Motion) for:

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

The `AnimatedCard` wraps content in a `motion.div` for layout animations when cards appear/disappear.

## Custom Scrollbar

A slim custom scrollbar is defined for WebKit browsers:

- 6px width
- Transparent track
- Semi-transparent thumb with rounded corners and hover highlight

## Selection Color

Text selection uses a cyan tint:

```css
::selection {
  background: rgba(6, 182, 212, 0.2);
}
```
