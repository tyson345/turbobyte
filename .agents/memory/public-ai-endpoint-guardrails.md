---
name: Public AI endpoint guardrails
description: Protections required whenever a public endpoint triggers paid LLM calls
---

Any public endpoint that triggers a paid AI call needs, beyond per-IP rate limiting: a global per-window budget cap, a concurrency cap, and honeypot/validation before invoking the model.

**Why:** Per-IP limits alone are bypassable — clients can prepend spoofed `X-Forwarded-For` values. Read the LAST hop of the XFF chain (appended by the trusted proxy), never the first. One bypass = unbounded credit spend.

**How to apply:** See the demo prototype endpoint: trusted-proxy IP resolution in the lead-tracking helpers, plus global window counter + in-flight cap in the demo routes. Also inject a restrictive CSP meta tag into AI-generated HTML before storing/serving it — the system prompt is not a security boundary.
