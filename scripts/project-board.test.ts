// Tests for the project board script: card moves per event, closing only on main, and the GitHub API callers.

import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  Board,
  type Config,
  type GraphQL,
  graphqlWith,
  handle,
  issueNumbersFromText,
  MUTATION_ADD_ITEM,
  MUTATION_SET_FIELD,
  QUERY_ISSUE,
  QUERY_ITEMS,
  QUERY_LINKED_BRANCHES,
  QUERY_PROJECT,
  Repo,
  type Rest,
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

/** An in-memory GitHub: one project, its cards, the repository's issues and the branches linked to them. */
function world(issues: FakeIssue[], linked: Record<number, string[]> = {}) {
  const cards = new Map<
    string,
    { id: string; status: string | null; priority: string | null; issue: FakeIssue }
  >();
  const closed: number[] = [];
  const option = (name: string) => ({ id: `opt:${name}`, name });
  const byId = (id: string) => issues.find((i) => i.id === id);
  const graphql = (async (query: string, vars: Record<string, any>) => {
    if (query === QUERY_PROJECT) {
      return {
        repositoryOwner: {
          projectV2: {
            id: 'P',
            fields: {
              nodes: [
                { id: 'F:status', name: 'Status', options: Object.values(STATUS).map(option) },
                { id: 'F:priority', name: 'Priority', options: ['P0', 'P1', 'P2'].map(option) },
                {},
              ],
            },
          },
        },
      };
    }
    if (query === MUTATION_ADD_ITEM) {
      const issue = byId(vars['contentId']);
      assert.ok(issue, `unknown issue ${vars['contentId']}`);
      const card = cards.get(issue.id) ?? {
        id: `C:${issue.id}`,
        status: null,
        priority: null,
        issue,
      };
      cards.set(issue.id, card);
      const value = (name: string | null) => (name ? { name } : null);
      return {
        addProjectV2ItemById: {
          item: { id: card.id, status: value(card.status), priority: value(card.priority) },
        },
      };
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
      const nodes = [...cards.values()].map((c) => ({
        id: c.id,
        status: c.status ? { name: c.status } : null,
        content: c.issue,
      }));
      return { node: { items: { pageInfo: { hasNextPage: false, endCursor: null }, nodes } } };
    }
    if (query === QUERY_ISSUE)
      return { repository: { issue: issues.find((i) => i.number === vars['number']) ?? null } };
    if (query === QUERY_LINKED_BRANCHES) {
      const nodes = issues.map((i) => ({
        ...i,
        linkedBranches: { nodes: (linked[i.number] ?? []).map((name) => ({ ref: { name } })) },
      }));
      return {
        repository: { issues: { pageInfo: { hasNextPage: false, endCursor: null }, nodes } },
      };
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
  return { deps, cards, closed, status };
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

test('closing keywords give issue numbers; plain mentions do not', () => {
  assert.deepEqual(
    [...issueNumbersFromText('Closes #34, fixes: #35 and resolved #2')],
    [34, 35, 2],
  );
  assert.deepEqual([...issueNumbersFromText('see #36, part of #37')], []);
  assert.deepEqual([...issueNumbersFromText(null)], []);
});

test('an opened issue goes to Backlog with the default priority, assignment moves it to Ready and back', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  const payload = (action: string, assignees: unknown[]) => ({
    action,
    issue: { node_id: 'I7', number: 7, state: 'open', assignees },
  });
  await handle(deps, 'issues', payload('opened', []));
  assert.equal(w.status(7), STATUS.backlog);
  assert.equal(w.cards.get('I7')?.priority, 'P1');
  await handle(deps, 'issues', payload('assigned', [{ login: 'a' }]));
  assert.equal(w.status(7), STATUS.ready);
  await handle(deps, 'issues', payload('unassigned', []));
  assert.equal(w.status(7), STATUS.backlog);
});

test('a branch linked to the issue moves it to In progress', async () => {
  const w = world([issue(7)], { 7: ['feat/board'] });
  const deps = await w.deps();
  await handle(deps, 'create', { ref_type: 'branch', ref: 'feat/board' });
  assert.equal(w.status(7), STATUS.inProgress);
});

test('a draft PR is In progress, a ready one In review, back to draft is In progress again', async () => {
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
});

test('merged into dev, the card is On dev and the issue stays open', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', {
    action: 'closed',
    pull_request: pr({ merged: true }),
  });
  assert.equal(w.status(7), STATUS.onDev);
  assert.deepEqual(w.closed, []);
  await handle(deps, 'push', {
    ref: 'refs/heads/dev',
    commits: [{ message: 'feat: x (#41)\n\nCloses #7' }],
  });
  assert.deepEqual(w.closed, []);
});

test('a card never moves back: an edited PR does not pull On dev back to In review', async () => {
  const w = world([issue(7)]);
  const deps = await w.deps();
  await handle(deps, 'pull_request_target', {
    action: 'closed',
    pull_request: pr({ merged: true }),
  });
  await handle(deps, 'pull_request_target', { action: 'edited', pull_request: pr({}) });
  assert.equal(w.status(7), STATUS.onDev);
});

test('a release from dev into main promotes every On dev card of this repository and closes its issue', async () => {
  const w = world([issue(7), issue(8), issue(9, 'Someone/else')]);
  const deps = await w.deps();
  for (const n of [7, 8, 9]) {
    await handle(deps, 'pull_request_target', {
      action: 'closed',
      pull_request: pr({ merged: true, body: `Closes #${n}` }),
    });
  }
  // Issue 9 belongs to another repository: GitHub would not find it here, so give it a card directly.
  await deps.board.setStatus(
    await deps.board.item({ id: 'I9', number: 9, state: 'OPEN', repository: 'Someone/else' }),
    STATUS.onDev,
  );
  await handle(deps, 'pull_request_target', {
    action: 'closed',
    pull_request: pr({
      merged: true,
      body: 'Release',
      base: { ref: 'main' },
      head: { ref: 'dev', repo: { full_name: REPO } },
    }),
  });
  assert.equal(w.status(7), STATUS.onMain);
  assert.equal(w.status(8), STATUS.onMain);
  assert.equal(w.status(9), STATUS.onDev);
  assert.deepEqual(w.closed.sort(), [7, 8]);
});

test('the GraphQL caller sends the token and fails on API errors', async () => {
  let auth = '';
  const ok = (async (_url: string, init: RequestInit) => {
    auth = new Headers(init.headers).get('authorization') ?? '';
    return new Response(JSON.stringify({ data: { viewer: { login: 'x' } } }));
  }) as typeof fetch;
  assert.deepEqual(await graphqlWith('t0k', ok)('query { viewer { login } }', {}), {
    viewer: { login: 'x' },
  });
  assert.equal(auth, 'Bearer t0k');
  const failing = (async () =>
    new Response(JSON.stringify({ errors: [{ message: 'Bad credentials' }] }), {
      status: 401,
    })) as typeof fetch;
  await assert.rejects(graphqlWith('t0k', failing)('query { x }', {}), /401: Bad credentials/);
});
