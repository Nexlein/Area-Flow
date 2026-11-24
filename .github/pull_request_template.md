<!-- Pull request description: the linked issue, what changed, how it was verified, and the review checklist. -->

Closes #

## What

<!-- What changes, and why. One line per file or concern. -->

## Verified

<!-- Commands run and their results, screens checked. Say what was NOT verified. -->

## Checklist

- [ ] Linked to its issue (`Closes #N`), with the issue's "Done when" criteria met
- [ ] `npm run check` passes, and the stack's lint, tests and build once they exist; conventional commit title
- [ ] OpenAPI description updated if an endpoint the clients call changed, error responses included
- [ ] Decision recorded or updated in an ADR (`docs/adr/`, from `0000-template.md`, indexed in its README) if a choice was made
- [ ] Docs updated if behavior changed (`docs/architecture/`, `docs/features/`, `HOWTOCONTRIBUTE.md`)
- [ ] Client screens touched: both languages present, WCAG AA checked
- [ ] A SEC feature changed: its evidence note updated (`docs/security/`)
- [ ] The plan changed: a row in the changes table of `docs/plan/README.md`
- [ ] No secret, token, `.env` file or personal data committed
