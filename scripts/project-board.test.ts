// Tests for the project board script: card moves per event, closing only on main, and the GitHub API callers.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  Board,
  type Config,
  type GraphQL,
  GraphQLError,
  graphqlWith,
  handle,
  issueNumbersFromText,
  MAX_ISSUES,
  MUTATION_ADD_ITEM,
  MUTATION_SET_FIELD,
  QUERY_ISSUE,
  QUERY_ITEMS,
  QUERY_PROJECT,
  Repo,
  type Rest,
  restWith,
  STATUS,
} from './project-board.ts';

const REPO = 'Nexlein/Area-Flow';
const CFG: Config = {
  owner: 'Nexlein',
  number: 12,
  devBranch: 'dev',
  mainBranch: 'main',
  defaultPriority: 'P1',
};

interface FakeIssue {
  id: string;
  number: number;
  state: 'OPEN' | 'CLOSED';
  repository: { nameWithOwner: string };
}

/**
 * An in-memory GitHub: one project and its cards, the repository's issues. Unknown issue numbers fail with
 * NOT_FOUND as on GitHub, cards are listed one per page so pagination is exercised, and `between` runs after
 * every card read, to simulate another run moving the card meanwhile.
 */
function world(issues: FakeIssue[]) {
  const cards = new Map<
    string,
    { id: string; status: string | null; priority: string | null; issue: FakeIssue }
  >();
  const closed: number[] = [];
  const hooks: { between?: () => void; issueError?: Error } = {};
  const option = (name: string) => ({ id: `opt:${name}`, name });
  const graphql = (async (query: string, vars: Record<string, any>) => {
    if (query === QUERY_PROJECT) {
      const fields = [
        { id: 'F:status', name: 'Status', options: Object.values(STATUS).map(option) },
        { id: 'F:priority', name: 'Priority', options: ['P0', 'P1', 'P2'].map(option) },
        {},
      ];
      return { repositoryOwner: { projectV2: { id: 'P', fields: { nodes: fields } } } };
    }
    if (query === MUTATION_ADD_ITEM) {
      const issue = issues.find((i) => i.id === vars['contentId']);
      assert.ok(issue, `unknown issue ${vars['contentId']}`);
      const card = cards.get(issue.id) ?? {
        id: `C:${issue.id}`,
        status: null,
        priority: null,
        issue,
      };
      cards.set(issue.id, card);
      const value = (name: string | null) => (name ? { name } : null);
      const read = {
        addProjectV2ItemById: {
          item: { id: card.id, status: value(card.status), priority: value(card.priority) },
        },
      };
      hooks.between?.();
      return read;
    }
    if (query === MUTATION_SET_FIELD) {
      const card = [...cards.values()].find((c) => c.id === vars['itemId']);
      assert.ok(card);
      const name = String(vars['optionId']).slice('opt:'.length);
      if (vars['fieldId'] === 'F:status') card.status = name;
      else card.priority = name;
      return { updateProjectV2ItemFieldValue: { projectV2Item: { id: card.id } } };
    }
    if (query === QUERY_ITEMS) {
      const all = [...cards.values()];
      const at = vars['after'] ? Number(vars['after']) : 0;
      const c = all[at];
      const nodes = c
        ? [{ id: c.id, status: c.status ? { name: c.status } : null, content: c.issue }]
        : [];
      const more = at + 1 < all.length;
      return {
        node: {
          items: {
            pageInfo: { hasNextPage: more, endCursor: more ? String(at + 1) : null },
            nodes,
          },
        },
      };
    }
    if (query === QUERY_ISSUE) {
      if (hooks.issueError) throw hooks.issueError;
      const found = issues.find(
        (i) => i.number === vars['number'] && i.repository.nameWithOwner === REPO,
      );
      if (!found)
        throw new GraphQLError(
          `Could not resolve to an issue with the number of ${vars['number']}.`,
          ['NOT_FOUND'],
        );
      return { repository: { issue: found } };
    }
    throw new Error(`unexpected query: ${query.slice(0, 40)}`);
  }) as GraphQL;
  const rest: Rest = async (method, path) => {
    assert.equal(method, 'PATCH');
    closed.push(Number(path.split('/').pop()));
  };
  const log = () => {};
  const deps = async () => {
    const board = new Board(graphql, CFG, log);
    await board.load();
    return { board, repo: new Repo(REPO, graphql, rest, log), cfg: CFG, log };
  };
  const status = (number: number) =>
    [...cards.values()].find((c) => c.issue.number === number)?.status ?? null;
  const setStatus = (number: number, value: string) => {
    const card = [...cards.values()].find((c) => c.issue.number === number);
    assert.ok(card);
    card.status = value;
  };
  return { deps, cards, closed, status, setStatus, hooks };
}

const issue = (number: number, repository = REPO): FakeIssue => ({
  id: `I${number}`,
  number,
  state: 'OPEN',
  repository: { nameWithOwner: repository },
});
const pr = (fields: Record<string, unknown>) => ({
  title: 'feat: x',
  body: 'Closes #7',
  draft: false,
  merged: false,
  base: { ref: 'dev' },
  head: { ref: 'feat/x', repo: { full_name: REPO } },
  ...fields,
});
const issuePayload = (action: string, assignees: unknown[]) => ({
  action,
  issue: { node_id: 'I7', number: 7, state: 'open', assignees },
});
const merged = (fields: Record<string, unknown> = {}) => ({
  action: 'closed',
  pull_request: pr({ merged: true, ...fields }),
});

test('closing keywords give issue numbers; plain mentions do not', () => {
  assert.deepEqual(
    [...issueNumbersFromText('Closes #34, fixes: #35 and resolved #2')],
    [34, 35, 2],
  );
  assert.deepEqual([...issueNumbersFromText('see #36, part of #37')], []);
  assert.deepEqual([...issueNumbersFromText(null)], []);
});

test('an opened issue goes to Backlog with the default priority; assignment moves it to Ready and back', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'issues', issuePayload('opened', []));
  assert.equal(w.status(7), STATUS.backlog);
  assert.equal(w.cards.get('I7')?.priority, 'P1');
  await handle(deps, 'issues', issuePayload('assigned', [{ login: 'a' }]));
  assert.equal(w.status(7), STATUS.ready);
  await handle(deps, 'issues', issuePayload('unassigned', [{ login: 'b' }]));
  assert.equal(w.status(7), STATUS.ready, 'still assigned to someone');
  await handle(deps, 'issues', issuePayload('unassigned', []));
  assert.equal(w.status(7), STATUS.backlog);
});

test('a reopened issue starts over from Backlog or Ready', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', merged());
  await handle(deps, 'issues', issuePayload('reopened', []));
  assert.equal(w.status(7), STATUS.backlog);
});

test('a draft PR is In progress, a ready one In review; back to draft, or closed unmerged, is In progress again', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', {
    action: 'opened',
    pull_request: pr({ draft: true }),
  });
  assert.equal(w.status(7), STATUS.inProgress);
  await handle(deps, 'pull_request_target', { action: 'ready_for_review', pull_request: pr({}) });
  assert.equal(w.status(7), STATUS.inReview);
  await handle(deps, 'pull_request_target', {
    action: 'converted_to_draft',
    pull_request: pr({ draft: true }),
  });
  assert.equal(w.status(7), STATUS.inProgress);
  await handle(deps, 'pull_request_target', { action: 'ready_for_review', pull_request: pr({}) });
  await handle(deps, 'pull_request_target', {
    action: 'closed',
    pull_request: pr({ merged: false }),
  });
  assert.equal(w.status(7), STATUS.inProgress);
});

test('merged into dev, the card is On dev and the issue stays open, by PR or by push', async () => {
  const w = world([issue(7), issue(8)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', merged());
  assert.equal(w.status(7), STATUS.onDev);
  await handle(deps, 'push', {
    ref: 'refs/heads/dev',
    commits: [{ message: 'feat: y (#42)\n\nCloses #8' }],
  });
  assert.equal(w.status(8), STATUS.onDev);
  assert.deepEqual(w.closed, []);
});

test('a push to main closes the issues its commits name; other branches and deletions are ignored', async () => {
  const w = world([issue(7), issue(8)]);
  const deps = await w.deps();
  await handle(deps, 'push', { ref: 'refs/heads/feat/x', commits: [{ message: 'Closes #8' }] });
  await handle(deps, 'push', {
    ref: 'refs/heads/main',
    deleted: true,
    commits: [{ message: 'Closes #8' }],
  });
  assert.equal(w.status(8), null);
  await handle(deps, 'push', {
    ref: 'refs/heads/main',
    commits: [{ message: 'fix: z\n\nFixes #7' }],
  });
  assert.equal(w.status(7), STATUS.onMain);
  assert.deepEqual(w.closed, [7]);
});

test('a card never moves back: an edited PR does not pull On dev back to In review', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', merged());
  await handle(deps, 'pull_request_target', { action: 'edited', pull_request: pr({}) });
  assert.equal(w.status(7), STATUS.onDev);
});

test('a move re-reads the card: another run that moved it meanwhile is not overwritten', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'issues', issuePayload('assigned', [{ login: 'a' }]));
  // The draft PR run reads Ready, then another run moves the card to In review before this one writes.
  let once = true;
  w.hooks.between = () => {
    if (once && w.status(7) === STATUS.ready) {
      once = false;
      w.setStatus(7, STATUS.inReview);
    }
  };
  await handle(deps, 'pull_request_target', {
    action: 'opened',
    pull_request: pr({ draft: true }),
  });
  assert.equal(w.status(7), STATUS.inReview);
});

test('a release from dev into main promotes every On dev card of this repository, across pages, and closes its issue', async () => {
  const w = world([issue(7), issue(8), issue(9, 'Someone/else')]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', merged({ body: 'Closes #7' }));
  await handle(deps, 'pull_request_target', merged({ body: 'Closes #8' }));
  // Issue 9 belongs to another repository: give its card On dev directly.
  await deps.board.setStatus(
    await deps.board.item({ id: 'I9', number: 9, state: 'OPEN', repository: 'Someone/else' }),
    STATUS.onDev,
  );
  const release = {
    body: 'Release',
    base: { ref: 'main' },
    head: { ref: 'dev', repo: { full_name: REPO } },
  };
  await handle(deps, 'pull_request_target', merged(release));
  assert.equal(w.status(7), STATUS.onMain);
  assert.equal(w.status(8), STATUS.onMain);
  assert.equal(w.status(9), STATUS.onDev);
  assert.deepEqual(w.closed.sort(), [7, 8]);
});

test("a fork's dev merged into main promotes nothing beyond the issues it names", async () => {
  const w = world([issue(7), issue(8)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', merged({ body: 'Closes #8' }));
  const fromFork = {
    body: 'Closes #7',
    base: { ref: 'main' },
    head: { ref: 'dev', repo: { full_name: 'Fork/Area-Flow' } },
  };
  await handle(deps, 'pull_request_target', merged(fromFork));
  assert.equal(w.status(8), STATUS.onDev);
  assert.deepEqual(w.closed, [7]);
});

test('unknown numbers are skipped, but any other API error stops the run', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', merged({ body: 'Closes #404, closes #7' }));
  assert.equal(w.status(7), STATUS.onDev);
  w.hooks.issueError = new GraphQLError('API rate limit exceeded', ['RATE_LIMITED']);
  await assert.rejects(
    handle(deps, 'pull_request_target', merged({ body: 'Closes #7' })),
    /rate limit/,
  );
});

test(`at most ${MAX_ISSUES} issues are taken from one pull request`, async () => {
  const many = Array.from({ length: MAX_ISSUES + 5 }, (_, i) => issue(i + 1));
  const w = world(many);
  const deps = await w.deps();
  await handle(
    deps,
    'pull_request_target',
    merged({ body: many.map((i) => `Closes #${i.number}`).join(' ') }),
  );
  assert.equal([...w.cards.values()].length, MAX_ISSUES);
});

test('the API callers send the token, and fail with the error types GitHub reports', async () => {
  const seen: { url: string; auth: string; method: string; body: string }[] = [];
  const ok = (async (url: string, init: RequestInit) => {
    seen.push({
      url,
      auth: new Headers(init.headers).get('authorization') ?? '',
      method: init.method ?? '',
      body: String(init.body),
    });
    return new Response(JSON.stringify({ data: { viewer: { login: 'x' } } }));
  }) as typeof fetch;
  assert.deepEqual(await graphqlWith('t0k', ok)('query { viewer { login } }', {}), {
    viewer: { login: 'x' },
  });
  await restWith('t0k', ok)('PATCH', '/repos/a/b/issues/7', { state: 'closed' });
  assert.deepEqual(
    seen.map((s) => [s.url, s.auth, s.method]),
    [
      ['https://api.github.com/graphql', 'Bearer t0k', 'POST'],
      ['https://api.github.com/repos/a/b/issues/7', 'Bearer t0k', 'PATCH'],
    ],
  );
  assert.equal(seen[1]?.body, '{"state":"closed"}');
  const notFound = (async () =>
    new Response(
      JSON.stringify({ errors: [{ message: 'Could not resolve', type: 'NOT_FOUND' }] }),
    )) as typeof fetch;
  await assert.rejects(
    graphqlWith('t0k', notFound)('query { x }', {}),
    (e: unknown) => e instanceof GraphQLError && e.types.includes('NOT_FOUND'),
  );
  const denied = (async () => new Response('{}', { status: 403 })) as typeof fetch;
  await assert.rejects(restWith('t0k', denied)('PATCH', '/repos/a/b/issues/7', {}), /403/);
});
