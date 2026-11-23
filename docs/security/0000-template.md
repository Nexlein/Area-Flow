# SEC-XXX: Template

**Claim:** the security claim, in one sentence · **Owner:** name · **Last verified:** YYYY-MM-DD, commit `abc1234`

How to use: copy this file to `SEC-XXX.md` (the feature id), fill it in, and add a row to the [index](README.md). Keep it short: evidence, not an audit report. Never put real credentials, tokens or personal data in it.

## Attack scenario

- **Attacker:** what they can do, and where they start from.
- **Target:** the asset at risk.
- **Action:** what they do.
- **Impact without the protection:**

An evaluator must be able to reproduce it with no undocumented manual setup.

## Reproduction

The shortest procedure: a command, a request, a script, a test case, or a sequence of actions.

```bash

```

## Observed evidence

What proves the scenario ran: the response, a test result, a sanitized log line, a screenshot, a trace. "The application is protected" is not evidence.

## Protection

The mechanism that prevents, limits or detects the attack, and where it is implemented (file, configuration).

## Verification

The same scenario against the protected product, and the observed result. It must tell an attempted attack apart from a scenario that never ran.

## Limits

What the protection does not cover: its assumptions and the known residual risks.
