---
name: Reduced-motion preview behavior
description: How to verify animated hero effects when automated app previews show the accessibility fallback.
---

Automated app-preview screenshots may report `prefers-reduced-motion: reduce`, causing motion-aware components to render their static fallback instead of WebGL animation.

**Why:** A Vanta animation was correctly configured and built, but local screenshots consistently showed the particle-grid fallback. A screenshot of the deployed page exercised the normal-motion path and confirmed the intended cloud animation.

**How to apply:** Keep the reduced-motion fallback. For animation changes, verify fallback readability locally, confirm the animation library/CDN is available, and inspect the deployed page with an external screenshot before concluding that the animation failed.