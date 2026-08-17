---
name: Verifying below-fold UI (footers)
description: Why the Screenshot tool cannot show footers on this site and what to use instead
---

The Screenshot tool captures only the viewport from the top of the page. Every page on the TurboByte site wraps content in `min-h-screen` (or `min-h-[100dvh]`), so the page body always grows to at least the viewport height — which pushes the footer below the fold for ANY viewport size. No viewport choice can make the footer appear in a Screenshot capture.

**How to apply:** To verify footers or other below-fold/scroll-dependent UI, dispatch the Playwright testing subagent (testing skill) and have it scroll and screenshot. Don't burn rounds trying taller viewports.

Related: framer-motion `whileInView` sections may be captured mid-animation (semi-transparent) in screenshots; it's a capture-timing artifact, not a bug. Screenshot stitching can also produce phantom "duplicated" sections on animated pages.
