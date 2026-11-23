# AREA — Subject (condensed)

Sources, in this folder: [`area-project.pdf`](area-project.pdf) (common base), [`area-additional_features.pdf`](area-additional_features.pdf) (v6.4.0, catalogue condensed in [`FEATURES.md`](FEATURES.md)), [`area-security_evidence.pdf`](area-security_evidence.pdf) (v6.3.2, turned into [`../security/0000-template.md`](../security/0000-template.md)). This file only restates the PDFs; our own decisions live in [`../adr/`](../adr/README.md) and [`../architecture/`](../architecture/README.md). When in doubt, the PDF wins.

## Role and spirit

We act as software architects: understand the need, compare alternatives (state of the art), check them with quick demos (proof of concept), decide, integrate existing components, and defend the consequences. Our own code is mostly the business glue between the chosen components. The hard part is not linking two APIs: it is one product that runs on its own, survives its own failures and can be handed over. Every feature must answer a real need of its users.

## Product

A suite inspired by IFTTT and Zapier:

- **Application server**: implements every feature; all business logic and rules live here.
- **Web client**: uses the server from a browser.
- **Mobile client**: Android (iOS is a bonus), with the server's network address configurable in the app.

Full-stack frameworks are strongly discouraged: a single codebase blurs the boundary the project requires between clients and server, and makes splitting the work between members much harder. Clients and server are built in parallel by different members.

## Functional requirements

### Accounts and delegated access

- Create and confirm an account, then log in.
- Local authentication (username and password) **and** login through an external identity provider with OpenID Connect (OIDC).
- When a Service must act later for the user, use that Service's own authorization mechanism (usually OAuth 2.0) and store the delegated credentials unattended hooks need.
- OIDC answers who the user is; OAuth 2.0 answers what the app may do on their behalf. One provider can take part in both.
- Document how external identities link to local users, and the lifecycle of delegated credentials.

### Services, Actions, REActions

- The user picks the Services they hold an account on and subscribes to them.
- Each Service offers at least two components:
  - **Action**: an event inside the Service that the product detects (a message posted, a file added, a deadline coming up). Detecting it is the job of a **hook**.
  - **REAction**: a task the product performs inside a Service once a hook detected something.
- The server declares the available Services, Actions and REActions and exposes them to the clients.
- Any Service is allowed. One we use ourselves gets tested more and makes a better demo. A connector is worth its use case, not its place in a count.

### Workflows

A workflow is a chain of nodes the server walks in order once the Action is detected. Node kinds: one **trigger** node (the Action), **reaction** nodes (REActions), and an optional **condition** node that sends the run into one of two branches. An **AREA** (one Action, one REAction) is the smallest workflow.

Bounds of the common base:

- the normal chain is linear;
- a condition has two successors;
- at most one condition, never nested;
- branches end the workflow and never merge;
- workflows without a condition, or with a single reaction, stay valid;
- the engine must demo a meaningful workflow with **at least four reaction nodes**, and the data model must not make four a structural maximum;
- structural validity is checked **when the workflow is saved**.

Cases the subject leaves open (for example: is an empty branch valid?) are ours to decide, document and apply consistently. Each workflow we offer should save its user real time or effort.

**Builder**: the part of the interface where users assemble workflows. Free form, but justified (canvas, list of steps, form wizard...). It is **web only**: nodes and the data mapping between them are edited from the web client alone. The mobile client lists workflows, enables and disables them, and shows what they did; building on mobile is out of scope.

### Data between nodes

Every node publishes a declared set of values; later nodes reference earlier results through key paths such as `{{ trigger.subject }}` or `{{ node_2.file_id }}`. Required properties, implementation free:

- each node type declares the keys it may publish;
- a reference outside that declaration is rejected when the workflow is saved;
- a value missing at run time is handled deterministically, following our documented model;
- substitution replaces data only and never evaluates user-supplied code.

### Hooks

Hooks detect Actions and start the matching workflow with no client open. The same occurrence must never be treated as a new event again and again. How events are identified, scheduled and persisted is an architecture decision to document and defend.

## Technical requirements

- **API contract**: the server serves an OpenAPI description of its HTTP API with a browsable interface. It is the contract between the members building clients and server: it covers every endpoint the clients call, error responses included, and a test fails when implementation and description disagree.
- **Clients**: the web client supports common browsers; the Android client lets the user set the server address.
- **Accessibility**: both clients meet WCAG level **AA**. A committed audit report states what was measured, with which tool, on which screens, what was fixed, and what was left unfixed and why.
- **Languages**: both clients work in at least two languages over the whole main flow, from registration to creating an AREA.
- **Docker Compose**: the whole product builds and runs reproducibly with Docker Compose; the container split is ours to choose. The stack makes the server and the web client reachable locally and produces an installable Android app. The docs give the commands and the resulting endpoints and artifacts.
- **Service discovery**: while the stack runs, the server exposes a machine-readable description of the Services, Actions and REActions (identifiers, descriptions, parameters), so clients never hard-code the catalogue. The schema is ours: documented, versionable, consistent with what the clients offer. The catalogue calls it `about.json`.

## Additional features

A catalogue of 24 features, condensed with their acceptance criteria in [`FEATURES.md`](FEATURES.md). Each has an identifier naming its domain (AI, ENG, SEC, SYS) and a difficulty: 1 small, 2 medium, 3 large, testing and docs included.

- Chosen and justified at milestone 1, revisable once at milestone 2, then frozen and graded at milestone 3.
- Choose against the group's weaknesses rather than for comfort, across several domains when possible.
- A feature much harder than estimated: tell the local manager early, while the selection can still change, and say it again in the post-mortem.
- A feature is delivered only when **all** its acceptance criteria can be observed. A half-delivered feature gives no points, only material for the post-mortem and the defense.
- A document counts as evidence only if its claims can be defended or reproduced live; the evaluator may pick a claim and ask for a demo.

## Quantities

M = members, S = server Services available to both clients, A = Actions, R = REActions (across all Services), D = total difficulty of the selected features.

| Condition                               | With M = 2                   |
| --------------------------------------- | ---------------------------- |
| S ≥ 1 + M, at least half of them OAuth2 | S ≥ 3, at least 2 via OAuth2 |
| A + R ≥ 2 × M + 2                       | A + R ≥ 6                    |
| D ≥ 2 × M                               | D ≥ 4                        |

- Counted on the less complete of the two clients.
- Services, Actions and REActions picked only to reach a count, with no concrete use, are not valued.
- Unfinished features count for nothing.
- Spread the work fairly: concentrating it on a few members puts them and the project at risk.

## Documentation

- `README.md`: setup, operation and the public API.
- `HOWTOCONTRIBUTE.md`: how to add Services, Actions, REActions and workflow nodes.
- Technical documentation of: the workflow model and its failure semantics; the persistence model and important data structures; the selected features and where each acceptance criterion can be observed; important architecture decisions, with alternatives, consequences and later revisions.
- **Individual defense**: at Plan, each member names at least one significant technical question to investigate or contribute to. By Final, each member explains one architecture decision they materially contributed to: need, alternatives, evidence, decision, trade-offs, observed result. Git history supports that explanation, it does not replace it.

## Milestones

A milestone is evidence of progress, not a contract. A decision may change when evidence invalidates it, if the change, its reason and its consequences are documented.

### 1. Plan (one week after the start)

Deliver:

- three technology selection documents: front-end, back-end, persistence. Each compares several technologies against relevant criteria (security included), documents the comparison and ends with a short, justified choice backed by practical evidence such as exploratory code;
- the selection of additional features, with its learning rationale and ownership;
- the significant architecture question of each member;
- a task breakdown of the whole project: every task actionable, scheduled, assigned, with its dependencies;
- the project management method and the tools chosen.

Expected: the main lines are understood; every member took part in the exploration; choices (stack, methods, tools, features) are professionally justified; the plan covers the common base, the selected features, documentation, verification and the MVP deadline.

### 2. Minimum Viable Product (four weeks after the start)

Deliver:

- a reproducibly deployable product;
- one workflow running end to end, with a trigger, at least two reactions and one condition;
- a first technical documentation of the core architecture;
- an updated plan and a written analysis of meaningful changes;
- observable progress on at least one third of the selected catalogue points;
- optionally, an updated feature selection: the last chance to change it.

Expected: some tests cover important behaviors; on every contribution, automation runs the linter, the tests and the build, and a failure shows on that contribution; the OpenAPI description is served and covers the MVP endpoints; each member explains their own contribution; plan changes come with the evidence that caused them and their cost (an unchanged plan is not better per se); several selected features are advanced enough to be demonstrated, not merely started.

### 3. Final product

Deliver:

- a complete working product, all selected features included;
- up-to-date documentation, at least `README.md` and `HOWTOCONTRIBUTE.md`;
- an honest accessibility audit of both clients: method, tools, findings;
- final planning artifacts showing what actually happened;
- a post-mortem: what succeeded, failed and changed, which evidence changed our mind, what we would do differently, lessons from failed experiments;
- a presentation with a live demonstration and a technical defense.

Expected:

- anyone can build and run the project by following the docs;
- choices of architecture, persistence and data structures are justified;
- hooks run autonomously, and business logic is isolated behind abstractions;
- both clients are responsive, visually consistent, intuitive, WCAG AA and multilingual;
- every acceptance criterion of the selected features can be observed; SEC evidence follows the template;
- some tests prove the OpenAPI description matches the implementation;
- unit and functional tests cover important success and failure paths;
- automation runs the linter, the tests and the build on every contribution, and deploys the product without manual steps;
- the presentation communicates the product and its context; we demo and explain a meaningful workflow with at least four reaction nodes;
- visual polish supports, never replaces, technical evidence; the defense focuses on decisions, trade-offs, evidence, limits and individual understanding.

Evaluators can ask to verify any claim live and to demo any feature. Keep a fallback recording for demos that depend on unreliable third parties.
