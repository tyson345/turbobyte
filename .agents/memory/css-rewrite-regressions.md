---
name: CSS rewrite regressions
description: Design-pass rewrites of a shared index.css silently break other pages
---
When a design subagent rewrites a shared theme/CSS file, it may delete utility classes, keyframes, reduced-motion rules, and token variables still referenced by other pages/components. CSS has no compiler errors, so this fails silently.

**Why:** A Squarespace-style cleanup of the homepage stripped `.gradient-text`/`.glassmorphism`/`.glow-purple`, marquee/float keyframes, the prefers-reduced-motion rule, and `--*-border`/`--button-outline` tokens used by ~20 inner pages and the Button component.

**How to apply:** After any shared-CSS rewrite, diff removed selectors/variables (`git diff | grep '^-'`) and grep the src tree for each removed class/token; restore the ones still referenced and re-add the reduced-motion media query.
