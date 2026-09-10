# Moving this to Claude Code

## 1. Set up the folder on your machine

```bash
mkdir moveapp && cd moveapp
git init
mkdir -p docs/screens docs/stitch-export
```

Then place:

- `CLAUDE.md` at the repo root
- `docs/DESIGN_SYSTEM.md`, `docs/SCREENS.md`, `docs/DATA_MODEL.md`,
  `docs/BUILD_PLAN.md`
- all 24 numbered PNGs **and** the `asset_*.png` files into `docs/screens/`
  (keep the exact filenames — the docs reference them)
- `MOVE_DOCUMENTATION.pdf` into `docs/`

## 2. Export from Stitch — this is the highest-value step

Don't hand Claude Code only the PNGs. For each screen, use Stitch's **HTML /
Tailwind export** and save it as `docs/stitch-export/01_landing_home.html` and
so on, matching the PNG numbering. Reading real markup beats inferring layout
from an image: exact spacing, exact hex values, exact class names, exact copy.

If Stitch offers a `DESIGN.md` handoff file, export that too and drop it in
`docs/`. It will supersede parts of my `DESIGN_SYSTEM.md`, which is fine — I
wrote that by reading the images.

At minimum export the seven load-bearing screens: 01, 04, 06, 15, 17, 20, 23.

## 3. Commit before you start

```bash
git add . && git commit -m "Design system, screens, and build plan"
```

Claude Code works far better with a clean git history to diff against, and you
can always roll back a phase that goes sideways.

## 4. First prompt in Claude Code

Open the folder with `claude` and send:

> Read CLAUDE.md and everything in docs/, including the screen PNGs in
> docs/screens/ and the HTML exports in docs/stitch-export/. Then give me your
> understanding of the product in your own words, flag anything in the docs that
> is ambiguous or that you think is wrong, and propose the file structure for
> Phase 0. Don't write any code yet.

Making it play the docs back to you catches misreadings before they become a
codebase. Only after that: "Proceed with Phase 0."

## 5. Habits that will save you

- **One phase per session.** Start a fresh conversation for each phase in
  `BUILD_PLAN.md`. Long sessions drift and start re-styling finished pages.
- **Point at the screen every time.** "Build /listings — match
  docs/screens/04_search_results_westlands.png and the HTML export beside it."
  Without the pointer it will invent a layout.
- **Commit at every green checkpoint**, not at the end of a phase.
- **Keep CLAUDE.md alive.** When you make a decision in conversation ("deposit
  is always shown next to rent"), tell Claude Code to append it to CLAUDE.md.
  Decisions that only live in chat are lost next session.
- **Screenshot-diff the important pages.** Once a page is built, run it, take a
  screenshot, and hand it back with the Stitch PNG: "compare these two and fix
  the differences." This is the fastest way to close the gap between generated
  design and built page.
- **Seed first, style second.** Pages built against empty tables always look
  wrong and get over-designed to compensate.

## 6. What to bring back here

This chat is still useful for things Claude Code shouldn't burn context on:
writing the presentation narrative, the report chapter on system design,
diagrams of the verification flow, or reworking copy. Build in Claude Code,
think out loud here.
