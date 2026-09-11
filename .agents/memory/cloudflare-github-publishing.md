---
name: Cloudflare watched GitHub branch
description: How to publish safely when the Cloudflare-connected repository is not the workspace's Git origin.
---

Cloudflare watches `tyson345/turbobyte`, while the workspace's configured Git origin points elsewhere and the two repositories have unrelated histories. Publish updates as commits whose parent is the current watched-repository `main` SHA; never force-push or merge the histories.

**Why:** A direct push from the workspace branch can overwrite or combine unrelated history, and shell Git does not have credentials for the watched repository. The installed GitHub connector's Octokit client can create blobs, a tree, and a commit, then advance `main` with `force: false`.

**How to apply:** Before publishing, confirm the watched branch SHA and compare the pre-change versions of every touched file against that branch. Stop if either differs. Create the Git commit through the GitHub SDK with the confirmed SHA as its only parent, update the ref without force, then wait for both Cloudflare checks and verify the live Pages and Worker URLs.