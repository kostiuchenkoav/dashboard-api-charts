# Contributing

Thanks for your interest in improving the Weather Dashboard. This guide explains how to set up the project, what we expect from changes, and how to submit them.

## Setup

```bash
npm install
npm run dev
```

Before opening a pull request, make sure these pass locally:

```bash
npm run build    # type-check and production build
npm test         # full test suite
```

## Guidelines

- **Keep layers separated.** Components should not call `fetch` directly; put requests in `src/api`. Put reusable stateful logic in `src/hooks`.
- **Validate external data.** Any new API response needs a zod schema in `src/api/schemas.ts` and a test for the rejection path.
- **Test behaviour, not implementation.** Prefer Testing Library queries by role or label over test IDs. Use `data-testid` only when no accessible query fits.
- **Accessibility matters.** New interactive elements need a label, visible focus styles, and correct ARIA state when they are toggles.
- **No new dependencies without a reason.** Explain in the pull request why an existing tool cannot do the job.
- **Update docs with the code.** If behaviour, configuration or API usage changes, update the README and the relevant file in `docs/`.

## Commit messages

Use short, imperative subjects, for example `Add hourly forecast view` or `Fix retry button focus after error`. Describe the reason in the body when it is not obvious.

## Pull requests

1. Fork the repository and create a branch from `main`.
2. Make focused changes. One feature or fix per pull request.
3. Add or update tests for the change.
4. Run `npm run build` and `npm test`.
5. Open the pull request and describe what changed, why, and how you tested it. Add screenshots for visual changes.

CI runs the same build and test steps on every pull request.

## Reporting bugs

Open an issue with:

- What you expected and what happened
- Steps to reproduce
- Browser and operating system
- Screenshots or console output, if relevant

## Code of conduct

Be respectful and constructive. Assume good intent, and focus feedback on the code rather than the person.
