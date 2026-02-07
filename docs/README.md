# subnet.fit Documentation

Detailed documentation for the subnet.fit CIDR calculator and network planner.

## Contents

| Document | Description |
|----------|-------------|
| [Features Guide](features.md) | Walkthrough of every user-facing feature: calculator, splitter, supernet, reference table, cloud context, export, keyboard shortcuts, theming, and shareable URLs |
| [Architecture](architecture.md) | High-level layer diagram, data flow, component hierarchy, state management approach, and URL routing strategy |
| [Calculation Engine](calculation-engine.md) | Deep dive into the `lib/` modules: IPv4 parsing, CIDR math, subnet allocation, binary representations, cloud provider constraints, and RFC range detection |
| [State Management](state-management.md) | Zustand store shapes, actions, the `recalcSplits` helper, theme detection cascade, and bidirectional URL sync |
| [Styling & Theming](styling.md) | Solarized "Obsidian" design system, Tailwind CSS v4 setup, `@custom-variant dark`, custom `@theme` tokens, typography (Schibsted Grotesk + Martian Mono), color palette, dot grid backgrounds, border conventions, and Motion animations |
| [URL Sharing](url-sharing.md) | Hash format specification for all three modes, label encoding, `useUrlSync` hook internals, and state restoration flow |
| [Development Guide](development.md) | Prerequisites, setup steps, available scripts, path aliases, TypeScript config, ESLint setup, project structure, and how to add new features |
