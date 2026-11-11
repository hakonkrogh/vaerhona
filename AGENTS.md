# Notes for coding agents

Read [README.md](README.md) and [SPEC.md](SPEC.md) first.

## Pull requests: show visual changes with pictures

A reviewer must be able to see what a PR does to the site without running it.
So when a PR changes how something looks, its description shows the change
with before and after pictures from Storybook. Storybook shows each component
on its own with made-up data (see [web/README.md](web/README.md)).

For every PR that changes files in `web/`:

1. **Make sure Storybook shows your change.** Each component you changed needs
   a story (`*.stories.js` next to it) that shows the new look. If none does,
   add or extend a story first. A page in `web/pages/` has no story of its
   own, so show the components it is built from.
2. **From `web/`, run `pnpm visuals`.** It builds Storybook for the base of
   your branch (where it left `origin/main`) and for your working tree, takes
   a picture of every story in both, and keeps the ones that look different.
   The pictures and `visuals.md` go to `web/.visuals/`. It takes 10 to 30
   seconds.
3. **Look at the pictures yourself.** Check that they show what you meant to
   change, and nothing else. A story that changed by accident is a bug: fix
   it, or explain it in the PR.
4. **Run `pnpm visuals --upload`.** It stores the pictures on the `pr-visuals`
   branch on GitHub and prints the Markdown for the PR description.
5. **Put that Markdown in the PR description as it is.** It has its own
   `## Visuals` heading.
6. **After later commits that change the look,** run step 4 again and replace
   the Visuals section.

If `pnpm visuals` finds no visual change, leave the section out. If it finds
none but you changed how something looks, a story is missing: add it.

If a story fails to draw, the command stops with an error. Fix the story.

If it says there is no browser, run `pnpm exec playwright install chromium`
once.

Do not merge the `pr-visuals` branch into anything, and do not delete it. PR
descriptions link to the pictures in it.
