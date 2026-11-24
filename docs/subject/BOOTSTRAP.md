<!-- Condensed restatement of the AREA bootstrap sandbox (v1.1.1): what each exercise asks and where its output lives in this repository. -->

# AREA bootstrap (condensed)

Restates [`area-bootstrap.pdf`](area-bootstrap.pdf), the bootstrap sandbox "Choose. Plan. Ship." (v1.1.1), nothing more; the PDF wins. It is offered, not imposed: pick the exercises the team needs, drop the rest. Each exercise:

- takes 40 to 90 minutes;
- runs independently of the others;
- **produces a committed file**: a decision you cannot show is a decision you did not make.

**Whatever else you skip**, do at least one exercise from each section. Stack-only teams arrive with prototypes and no schedule; planning-only teams arrive with a schedule for a stack they cannot use.

**MUST-DOs** when time is tight: the three timeboxed spikes, and the thirty tasks to move out (`moving-wbs.md`).

## Where outputs live here

The bootstrap names its own paths. We keep them under [`../plan/`](../plan/README.md), with no new top-level folders.

| Bootstrap output              | Our file                                                                                                                                                                                 | Status on 2026-11-24                                                   |
| ----------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- |
| `spikes/<tech>/SPIKE.md`      | The "Tests made" section of each `tech-*.md`; logs in [`../plan/spikes/`](../plan/spikes/) (spike code stays in a scratch repository)                                                    | Back-end and persistence done; front-end logs to commit                |
| `spikes/DISTANCE.md`          | The results table of that same section                                                                                                                                                   | Runs compared, but "distance travelled" is not defined yet             |
| Weighted matrix               | The criteria and candidates tables of [`tech-backend.md`](../plan/tech-backend.md), [`tech-frontend.md`](../plan/tech-frontend.md), [`tech-persistence.md`](../plan/tech-persistence.md) | Owners' scores done; each member's in [`scores.md`](../plan/scores.md) |
| `decision/RECOMMENDATION.md`  | The decision section of each `tech-*.md`                                                                                                                                                 | Done                                                                   |
| `docs/adr/NNNN-<slug>.md`     | [`../adr/`](../adr/README.md) (same path)                                                                                                                                                | Done, all `Proposed`                                                   |
| `planning/moving-wbs.md`      | `docs/plan/exercises/moving-wbs.md` (practice)                                                                                                                                           | Not done; a MUST-DO of the bootstrap                                   |
| `planning/project-wbs.md`     | [`../plan/task-breakdown.md`](../plan/task-breakdown.md)                                                                                                                                 | Not done: no task, duration and predecessor table yet                  |
| `planning/moscow-v1.md`, `v2` | `docs/plan/exercises/moscow-v1.md`, `moscow-v2.md` (practice); the feature sort goes in [`features-selection.md`](../plan/features-selection.md)                                         | Not done                                                               |
| `planning/board-*.md`         | `docs/plan/exercises/board-before.md`, `board-after.md` (practice); `board-project.md`, the real board, in [`management.md`](../plan/management.md)                                      | Not done                                                               |

## Section 1: Stack Attack

Goal: select a language, a framework and a database for a real constraint set. Defend it with evidence you produced yourself, not a comparison blog.

### Three timeboxed spikes

A spike buys information in a fixed slice of time. When the timer rings, **stop**, working or not.

- Pick three backend technologies nobody on the team has shipped with.
- Agree on one timebox per technology; write down why that length.
- Same target in each timebox, for all three:
  - a server listening on port 8080;
  - `GET /ping` answering exactly `{"status":"ok"}`;
  - the port read from an environment variable, not a literal.
- Check with `curl http://localhost:8080/ping`.
- On stop, write `SPIKE.md` per technology: where you were when time ran out, what consumed the most minutes, what you would need to go further.
- Write `DISTANCE.md`: a table comparing the three runs. You define "distance travelled" and justify the definition; that is the point.
- Never extend the timebox for the technology you already like: that reflex is the bias being exposed.

### Weighted decision matrix

Run it **after** the spikes, so scores are defensible, not invented.

1. Lock 5 to 8 criteria that matter for this project and team. Weight each 1 to 3. Agree what the weights mean before anyone scores.
2. Each member fills the matrix **independently**, no discussion: score every option 1 to 5 per criterion, compute the weighted total.
3. Compare. Two members diverging by more than 2 points on a criterion is a **finding**: they are not evaluating the same thing.
4. Close with a recommendation of 250 to 300 words: the chosen stack, the two criteria that drove it, one trade-off knowingly accepted and how to survive it, one team disagreement and how it was settled.

### Architecture decision records

One ADR per stack decision. Two non-negotiable constraints:

- each record states its **status** explicitly;
- each record names at least one **negative consequence** accepted. An ADR with no cost is a press release.

Self-check: someone outside the team must restate the decision and its cost without asking a question.

### Other selection methods

Technology Radar (adopt, trial, assess, hold) · Choose Boring Technology (innovation tokens) · ATAM · trade study · AHP (derive weights by pairwise comparison) · Delphi (anonymous convergence, no loudest voice) · Wardley map · total cost of ownership · RFC · proof of concept and bake-off.

## Section 2: Keep Calm And Carry On

Goal: break work into schedulable tasks, spot which tasks drag the rest, and defend a scope decision under a constraint you cannot negotiate away. The mechanics are practised on everyday projects first: a planning mistake is easier to see when it costs a wasted Saturday.

### Thirty tasks to move out

Moving out in three weeks; handing the keys over on the wrong day costs another month of rent.

- Break the move into tasks of half a day or less, about thirty: give notice, book the van, find boxes, pack, final inspection, forward mail, move the internet contract, get the deposit back, clean.
- Table: `| Task | Duration | Predecessors |`.
- Highlight the longest chain of dependent tasks.
- Answer in the same file:
  - which task can slip two days without moving the handover date;
  - which task moves everything when it slips one hour;
  - where two tasks fight over the same person on the same day.
- Repeat on the weeks between today and the first deadline of the real project. People get the second one wrong, rarely because the project is harder.

### A party on a fixed budget

Forty people, a fixed date, a budget that cannot grow.

1. List everything wanted, then sort into four MoSCoW buckets: must, should, could, won't have this time.
2. The **won't** bucket cannot be empty. Say each dropped item out loud to the group, never silently delete it.
3. Redo the sort with the budget cut by 30%; note which items moved and what that says about the first pass.
4. Apply the same buckets to your own feature list. Choose how much effort each bucket may consume and justify the split: everything a must is a plan with no room for one bad week.

### The flatshare kanban

Four people share a flat for a week. Model it on a board: to do, doing, blocked, done.

1. Run it once with no limits, then with a work-in-progress limit per column. A full column means nobody pulls anything new.
2. Answer in writing: the limit per column and its basis; what became visible with the limit that was invisible before; who stopped being able to start things, and whether that was a problem or the point.
3. Save the board before and after, then set up the real project board with its own limits. The blocked column filling while nobody may start anything is information: it is the week-three discomfort of the project, which otherwise stays silent.

### Other project management methods

WBS and critical path · float and slack · Gantt and PERT · MoSCoW · Kanban and WIP limits · Scrum, XP, SAFe · PRINCE2 and the V-model · premortem · planning fallacy and reference class forecasting · planning poker and burndown · RACI · Kano and OKR · retrospective.

## Evaluator link

The Plan milestone checks that every member took part in the exploration and that stack, methods and tools are justified ([`SUBJECT.md`](SUBJECT.md#1-plan)). The spikes, matrices and ADRs are that evidence.
