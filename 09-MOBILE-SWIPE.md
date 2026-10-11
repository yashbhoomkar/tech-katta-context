# Mobile Swipe Navigation

## Feature intent

The user wanted Chrome-like left/right swipe navigation on mobile.

Implementation is in:

`frontend/src/App.jsx`

Commit sequence:
1. `13c11e23898af5b5a61d6098edfc540a691cc065`
   - Add mobile swipe back and forward navigation.
2. `f3a4058c48f928c33e939bce9762040e6602711a`
   - Fix runtime error by initializing `useNavigate()`.
3. `6af1c16793d4f4dd3b9e76ce04898a9f84ba07e1`
   - Home right swipe opens sidebar.

## Current behavior

### Home page

Path:
`/`

Right swipe:
→ opens mobile sidebar.

Left swipe:
→ no navigation action.

### Other pages

Right swipe:
→ `navigate(-1)`
→ back.

Left swipe:
→ `navigate(1)`
→ forward.

### Sidebar open

Left swipe:
→ closes sidebar.

Other gesture:
→ no navigation.

## Gesture threshold

The implementation ignores gestures when:
- horizontal movement is below 70px
- horizontal movement is not sufficiently dominant over vertical movement

Current dominance condition:

`abs(deltaX) <= abs(deltaY) * 1.25`

This reduces accidental navigation while scrolling vertically.

## Horizontal scroll protection

Before triggering navigation, the implementation checks whether the gesture started inside:

- `.doc-code`
- `.doc-table-wrap`
- `.doc-figure`
- `.diagram-static-frame`
- `[data-horizontal-scroll]`

If the matching element has horizontal overflow, the native horizontal swipe behavior is preserved.

## Important ordering detail

Home right swipe is handled before the horizontal-scroll check.

This matches the intended home navigation gesture, but if future home-page horizontal scrolling is introduced, revisit the ordering carefully.

## React Router

The implementation uses:

`useLocation()`

and:

`useNavigate()`

A previous version forgot `useNavigate()`, causing the entire site to fail at runtime. The fix is in `f3a4058...`.

## Verification matrix

| Scenario | Expected |
|---|---|
| Home + right swipe | Open sidebar |
| Home + left swipe | No navigation |
| Article + right swipe | Back |
| Article + left swipe | Forward |
| Sidebar open + left swipe | Close sidebar |
| Short horizontal swipe | Ignore |
| Mostly vertical swipe | Ignore |
| Horizontal code scroll | Native scroll |
| Horizontal table scroll | Native scroll |
| Horizontal diagram scroll | Native scroll |

## Testing status

The code has been inspected and the behavior matrix is consistent with the implementation.

A full interactive browser/mobile test should be treated separately. Do not claim it happened unless an actual browser/sandbox test was performed.

## Future improvements

If this feature evolves, consider:
- touchcancel handling
- pointer events if cross-input consistency becomes important
- iOS Safari edge-swipe interaction
- history-boundary behavior
- preserving native browser navigation gestures
- avoiding conflicts with horizontally scrollable content

Do not add animation or gesture complexity unless it materially improves the behavior.


## Audit follow-up — route-state closure fix (2026-10-11)

Application branch `fix/audit-frontend-state-metadata` contains commit `f1e657c21673bf64ff71f6d067f1231e72d1956f` to include `location.pathname` in the swipe effect dependencies. This prevents the touch listener from retaining the route captured before SPA navigation. PR #19 is open; CI and actual mobile touch verification are pending. The commit is recorded in MongoDB `techkatta_history.frontend_git_commits`.


### PR #19 merged — CI validation (2026-10-11)

PR #19 was squash-merged as application commit `62c4b3ee59a99a57ec98ad221a34d38f37953eb2`. Frontend CI build and CodeQL passed on PR head `a1f3b3a803779f5082e3f8a37d65137dd10fc38e`. The merge commit is recorded in MongoDB `techkatta_history.frontend_git_commits`. Source fix and build are verified; actual mobile touch interaction remains untested.


## Home left-swipe forward-history regression fixed — PR #25 (2026-10-11)

PR #25 merged as application commit `e1f35b765015f182d32aaf645c4c4eb8387f5936`. The previous implementation handled home right-swipe specially but let home left-swipe fall through to `navigate(1)`. If browser history contained a forward entry, this could navigate away from the home page, contrary to the intended behavior. The fix returns early for a left swipe on `/` after preserving horizontal-scroll protection.

The Playwright browser workflow now exercises the built frontend in a mobile viewport with touch-event simulation. It passed the home sidebar open gesture, home left swipe with a forward-history entry, article back/forward gestures, short and mostly vertical gesture rejection, and closing the open sidebar with a left swipe. Run: https://github.com/yashbhoomkar/tech-katta/actions/runs/38142409155.

This is mobile-emulated Chromium coverage, not a physical Android/iOS device test. Actual-device testing remains pending if a device lab becomes available. All nine branch commits and the merge SHA are recorded in MongoDB `techkatta_history.frontend_git_commits`.
