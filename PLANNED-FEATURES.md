# Planned features

Running list of deferred ideas — not built yet. Move an item into a real change when
you pick it up (and follow the doc-sync rule in [CLAUDE.md](CLAUDE.md) if it touches
`src/`).

---

## In-app feedback / bug-report button

**Status:** deferred — design captured, ready to build.

A small "Feedback / probleem melden" button in the sidebar footer (next to
Contact/Help/Donate, same `S.footerIconBtn` pattern in
[sidebar.tsx](src/components/layout/sidebar.tsx)) that opens a modal — mirror the
existing [HelpModal.tsx](src/components/layout/HelpModal.tsx)/AlphaPopup pattern.

**Three report types** (pill toggle):

- **Bug** — description + **auto-attached share link**. The app already encodes the
  *entire* worksheet (every block + every setting) via `encodeShareLink`
  ([persistence.ts:231](src/services/persistence.ts)), so the modal generates it from
  the live store state and includes it. That gives an exact reproduction — **no
  screenshots / html2canvas needed.** Optional extra screenshot upload.
- **Oefening aanvragen** — description + **photo upload** of the wanted exercise
  (`<input type="file" accept="image/*">`), or text-only if they have no example.
- **Suggestie** — just a text description.

Plus an optional **e-mail** field so replies are possible.

**Delivery endpoint (decided — free, no monthly cap that matters at this scale):**

- **Preferred — Apps Script → Google Sheet:** clean in-app POST (no Google login for the
  teacher), share link + description in the request *body* (no URL-length limit), photos
  base64 → a Drive folder, rows appended to a Sheet. Append is bound by script runtime
  (~90 min/day, <1s each) → effectively uncapped. ~30 min one-time setup, you own the
  data. **Do not email from the script** (that hits the 100/day consumer quota) — read
  the Sheet instead.
- **Alternative — Web3Forms:** ~5 min setup (just an access key), file uploads + email
  delivery, free tier 250 submissions/month. At alpha scale you'd need roughly
  3k–20k monthly-active teachers to reach 250/mo, so the cap is irrelevant — but it
  *is* a cap.
- **Considered and rejected — Google Forms prefill:** can auto-attach the share link via
  an `entry.<id>=` prefilled URL, but file-upload questions force the teacher to sign
  into a Google account, and the long share link inside the form URL risks length
  limits. POST-body approaches avoid both.

Endpoint URL goes in a config const (placeholder pattern like the existing
`buymeacoffee.com/REPLACE_ME` in sidebar.tsx).

**On build, also doc-sync:** add `FeedbackModal.tsx` to the directory tree in
[CLAUDE.md](CLAUDE.md), the file map in ARCHITECTURE.md §11, and prepend a dated line to
[UpdateState.md](UpdateState.md).
