---
name: Tester admin login limits
description: Clerk email-code verification can block the testing subagent from admin pages
---
The Playwright testing subagent sometimes cannot sign in as the Clerk admin: Clerk escalates to an email verification code the tester has no inbox for (both programmatic and interactive sign-in failed in one session even though earlier sessions worked).

**Why:** Clerk dev instances vary the second factor; the tester environment has no email access.

**How to apply:** When admin-page e2e is blocked by Clerk sign-in, don't keep retrying — verify admin behavior via DB queries, unauthenticated 401 checks, and code inspection, and note the limitation to the user. Public-page flows are unaffected.
