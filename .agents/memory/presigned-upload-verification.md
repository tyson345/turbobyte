---
name: Presigned upload verification
description: Public presigned-URL upload flows must verify the stored object server-side at submit time
---
Rule: when a public form uploads via presigned URL and then submits an object path, the submit handler must re-verify the *stored* object — existence under the expected prefix (e.g. `/objects/uploads/`), actual metadata size, and content-type allowlist — never trust client-declared fileName/fileSize from the URL-request step.

**Why:** Code review flagged that extension/size checks at URL-issuance are client-asserted; an attacker can under-report size or spoof extension and still PUT arbitrary payloads (storage abuse, path tampering for admin downloads).

**How to apply:** Fetch the object entity and `getMetadata()` at submit; 400 on missing/oversize/bad type. Also give upload-URL requests a separate rate-limit bucket (`upload:<ip>`) so retried uploads don't starve the form submission budget. Private object entities stay admin-only via the existing storage gate as long as they're never referenced by published content.
