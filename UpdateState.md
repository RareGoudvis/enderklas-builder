# UpdateState — Conversation History

Short summaries of what was discussed or changed in each session.
Most recent entry first.

---

**2026-05-27** — Multiple cijferen mask fixes: Getal 1 multiplicand mask fell back to random when applyMask failed range check (hasMask0 guard added); Getal 2 multiplier/divisor masks ignored decimal keys (t/h) because applyMask was called with dp=0 — fixed to pass dp so fractional multipliers/divisors work; header display for fractional operands now uses dp instead of rounding to integer; AlphaPopup wired into App.tsx; mobile/tablet block added; @page margin-top:15mm for consistent top margin on new pages; print-block no longer has break-inside:avoid (blocks can split, individual exercises cannot); partial products in multiplication hidden unless showSolutions; answer rows in add/sub and multiplication moved directly below thick line (removed gap row).

**2026-05-27** — Multiple fixes: header writing lines expand to full width; print produces multiple pages (root cause: `overflow: hidden` + `height: 100vh` on html/body/#root overridden in print CSS); cijferen division quotient columns now always match dividend digit count; multiplication Getal 2 mask was overridden by `minMultiplier` clamp — fixed so masked multiplier only clamps to ≥2; print exercise page-break-inside avoidance added at block and exercise level.

**2026-05-26** — Teruggeven config polish: diagram font/size tuned, middle node shows € + blank line in ingevuld mode, Centpatroon updated to Belgian-only options (25ct/10ct/5ct), added "Leeg" scaffolding level (no diagram, just answer field), Prijsbereik moved to preset buttons with auto-updating betalen-met options.

**2026-05-26** — Added Geld > Wissel (bill + drawing box) and Geld > Teruggeven (change-giving arrow diagram with 5 scaffolding levels, 2 answer types) as new active exercise types; renamed "Tekenen" to "Bedrag tekenen" and removed "Gepast betalen" placeholder.

**2026-05-26** — Rewrote CLAUDE.md with full codebase documentation (directory tree, all 8 exercise types, data flow, step-by-step guide for adding new exercise types, code commenting guidelines for junior devs). Created UpdateState.md and added Stop hook to auto-remind about session summaries.
