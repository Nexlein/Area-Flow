// Moves the cards of the GitHub Project board when issues, branches and pull requests change, and closes issues released to main.
// Run by .github/workflows/project-board.yml with Node, no build: PROJECT_TOKEN for the board, GITHUB_TOKEN for the repository.

import { readFileSync } from 'node:fs';

export const STATUS = {
  backlog: 'Backlog',
  ready: 'Ready',
  inProgress: 'In progress',
  inReview: 'In review',
  onDev: 'On dev',
  onMain: 'On main',
} as const;

/** Statuses in board order: a card only ever moves forward along it, except on explicit steps back. */
const RANK: readonly string[] = Object.values(STATUS);

const CLOSING_KEYWORDS =
  /\b(?:close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved)\s*:?\s+#(\d+)/gi;

const MAX_ISSUE_PAGES = 5;

/** Sends one GraphQL query with one token and returns its `data`. */
export type GraphQL = <T>(query: string, variables: Record<string, unknown>) => Promise<T>;
/** Sends one REST request with one token. */
export type Rest = (method: string, path: string, body?: unknown) => Promise<void>;

export interface Config {
  owner: string;
  number: number;
  devBranch: string;
  mainBranch: string;
  defaultPriority: string;
}

export interface Issue {
  id: string;
  number: number;
  state: 'OPEN' | 'CLOSED';
  /** `owner/name` of the repository the issue belongs to. */
  repository: string;
}

interface Item {
  id: string;
  issue: Issue;
  status: string | null;
  priority: string | null;
}

interface Field {
  id: string;
  options: Map<string, string>;
}

type IssueNode = {
  id: string;
  number: number;
  state: 'OPEN' | 'CLOSED';
  repository: { nameWithOwner: string };
};

const ISSUE_FIELDS = 'id number state repository { nameWithOwner }';

export const QUERY_PROJECT = `
  query($owner: String!, $number: Int!) {
    repositoryOwner(login: $owner) {
      ... on ProjectV2Owner {
        projectV2(number: $number) {
          id
          fields(first: 50) {
            nodes { ... on ProjectV2SingleSelectField { id name options { id name } } }
          }
        }
      }
    }
  }`;

export const MUTATION_ADD_ITEM = `
  mutation($projectId: ID!, $contentId: ID!) {
    addProjectV2ItemById(input: { projectId: $projectId, contentId: $contentId }) {
      item {
        id
        status: fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name } }
        priority: fieldValueByName(name: "Priority") { ... on ProjectV2ItemFieldSingleSelectValue { name } }
      }
    }
  }`;

export const MUTATION_SET_FIELD = `
  mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
    updateProjectV2ItemFieldValue(input: {
      projectId: $projectId, itemId: $itemId, fieldId: $fieldId, value: { singleSelectOptionId: $optionId }
    }) { projectV2Item { id } }
  }`;

export const QUERY_ITEMS = `
  query($projectId: ID!, $after: String) {
    node(id: $projectId) {
      ... on ProjectV2 {
        items(first: 100, after: $after) {
          pageInfo { hasNextPage endCursor }
          nodes {
            id
            status: fieldValueByName(name: "Status") { ... on ProjectV2ItemFieldSingleSelectValue { name } }
            content { ... on Issue { ${ISSUE_FIELDS} } }
          }
        }
      }
    }
  }`;

export const QUERY_LINKED_BRANCHES = `
  query($owner: String!, $repo: String!, $after: String) {
    repository(owner: $owner, name: $repo) {
      issues(first: 100, after: $after, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC }) {
        pageInfo { hasNextPage endCursor }
        nodes { ${ISSUE_FIELDS} linkedBranches(first: 20) { nodes { ref { name } } } }
      }
    }
  }`;

export const QUERY_ISSUE = `
  query($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) { issue(number: $number) { ${ISSUE_FIELDS} } }
  }`;

/** An issue in the shape the handlers use. */
function toIssue(node: IssueNode): Issue {
  return {
    id: node.id,
    number: node.number,
    state: node.state,
    repository: node.repository.nameWithOwner,
  };
}

/** Issue numbers after a closing keyword ("Closes #12", "fixes: #3"), in any text. */
export function issueNumbersFromText(text: string | null | undefined): Set<number> {
  const numbers = new Set<number>();
  for (const match of (text ?? '').matchAll(CLOSING_KEYWORDS)) numbers.add(Number(match[1]));
  return numbers;
}

/** The project board: its Status and Priority fields, and the moves of its cards. */
export class Board {
  readonly #graphql: GraphQL;
  readonly #cfg: Config;
  readonly #log: (line: string) => void;
  #projectId = '';
  #status: Field = { id: '', options: new Map() };
  #priority: Field | null = null;

  constructor(graphql: GraphQL, cfg: Config, log: (line: string) => void) {
    this.#graphql = graphql;
    this.#cfg = cfg;
    this.#log = log;
  }

  /** Reads the project and checks that every status the automation uses exists. */
  async load(): Promise<void> {
    type Data = {
      repositoryOwner: {
        projectV2?: {
          id: string;
          fields: {
            nodes: { id?: string; name?: string; options?: { id: string; name: string }[] }[];
          };
        };
      } | null;
    };
    const data = await this.#graphql<Data>(QUERY_PROJECT, {
      owner: this.#cfg.owner,
      number: this.#cfg.number,
    });
    const project = data.repositoryOwner?.projectV2;
    if (!project)
      throw new Error(
        `project #${this.#cfg.number} of ${this.#cfg.owner} not found: check PROJECT_TOKEN's "project" scope`,
      );
    this.#projectId = project.id;
    const fields = new Map(
      project.fields.nodes.flatMap((f) => (f.id && f.name && f.options ? [[f.name, f]] : [])),
    );
    const field = (name: string): Field | null => {
      const f = fields.get(name);
      return f?.id && f.options
        ? { id: f.id, options: new Map(f.options.map((o) => [o.name, o.id])) }
        : null;
    };
    const status = field('Status');
    if (!status) throw new Error('single-select field "Status" not found on the project');
    for (const name of RANK)
      if (!status.options.has(name))
        throw new Error(`Status field is missing the option "${name}"`);
    this.#status = status;
    this.#priority = field('Priority');
  }

  /** The card of an issue, added to the board if it is not there yet. */
  async item(issue: Issue): Promise<Item> {
    type Data = {
      addProjectV2ItemById: {
        item: { id: string; status: { name?: string } | null; priority: { name?: string } | null };
      };
    };
    const data = await this.#graphql<Data>(MUTATION_ADD_ITEM, {
      projectId: this.#projectId,
      contentId: issue.id,
    });
    const item = data.addProjectV2ItemById.item;
    return {
      id: item.id,
      issue,
      status: item.status?.name ?? null,
      priority: item.priority?.name ?? null,
    };
  }

  async setStatus(item: Item, status: string): Promise<void> {
    if (item.status === status) return;
    await this.#set(item.id, this.#status, status);
    this.#log(`#${item.issue.number}: ${item.status ?? '(none)'} -> ${status}`);
    item.status = status;
  }

  /** Moves a card forward to `status`, never back. */
  async advance(item: Item, status: string): Promise<void> {
    if (RANK.indexOf(item.status ?? '') < RANK.indexOf(status)) await this.setStatus(item, status);
  }

  /** Gives a card the default priority when it has none. */
  async ensurePriority(item: Item): Promise<void> {
    const wanted = this.#cfg.defaultPriority;
    if (!wanted || !this.#priority || item.priority) return;
    if (!this.#priority.options.has(wanted)) {
      this.#log(`warning: "${wanted}" is not an option of the Priority field`);
      return;
    }
    await this.#set(item.id, this.#priority, wanted);
    item.priority = wanted;
  }

  /** Every card whose status is `status`, with its issue. */
  async itemsWithStatus(status: string): Promise<Item[]> {
    type Data = {
      node: {
        items: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: {
            id: string;
            status: { name?: string } | null;
            content: Partial<IssueNode> | null;
          }[];
        };
      };
    };
    const found: Item[] = [];
    let after: string | null = null;
    do {
      const data: Data = await this.#graphql<Data>(QUERY_ITEMS, {
        projectId: this.#projectId,
        after,
      });
      for (const node of data.node.items.nodes) {
        const content = node.content;
        if (
          node.status?.name === status &&
          content?.id &&
          content.number !== undefined &&
          content.state &&
          content.repository
        ) {
          found.push({ id: node.id, issue: toIssue(content as IssueNode), status, priority: null });
        }
      }
      after = data.node.items.pageInfo.hasNextPage ? data.node.items.pageInfo.endCursor : null;
    } while (after);
    return found;
  }

  async #set(itemId: string, field: Field, option: string): Promise<void> {
    await this.#graphql(MUTATION_SET_FIELD, {
      projectId: this.#projectId,
      itemId,
      fieldId: field.id,
      optionId: field.options.get(option),
    });
  }
}

/** This repository: its issues, read and closed with GITHUB_TOKEN. */
export class Repo {
  readonly fullName: string;
  readonly #graphql: GraphQL;
  readonly #rest: Rest;
  readonly #log: (line: string) => void;

  constructor(fullName: string, graphql: GraphQL, rest: Rest, log: (line: string) => void) {
    this.fullName = fullName;
    this.#graphql = graphql;
    this.#rest = rest;
    this.#log = log;
  }

  get #parts(): { owner: string; repo: string } {
    const [owner = '', repo = ''] = this.fullName.split('/');
    return { owner, repo };
  }

  /** The issue with this number, or null when the number is a pull request or does not exist. */
  async issue(number: number): Promise<Issue | null> {
    try {
      const data = await this.#graphql<{ repository: { issue: IssueNode | null } }>(QUERY_ISSUE, {
        ...this.#parts,
        number,
      });
      return data.repository.issue ? toIssue(data.repository.issue) : null;
    } catch (error) {
      this.#log(
        `#${number}: not an issue of ${this.fullName}, skipped (${error instanceof Error ? error.message : error})`,
      );
      return null;
    }
  }

  /** Open issues with a linked branch of this name (created from the issue's Development panel). */
  async issuesLinkedTo(branch: string): Promise<Issue[]> {
    type Data = {
      repository: {
        issues: {
          pageInfo: { hasNextPage: boolean; endCursor: string | null };
          nodes: (IssueNode & { linkedBranches: { nodes: { ref: { name: string } | null }[] } })[];
        };
      };
    };
    const found: Issue[] = [];
    let after: string | null = null;
    for (let page = 0; page < MAX_ISSUE_PAGES; page++) {
      const data: Data = await this.#graphql<Data>(QUERY_LINKED_BRANCHES, {
        ...this.#parts,
        after,
      });
      for (const node of data.repository.issues.nodes) {
        if (node.linkedBranches.nodes.some((b) => b.ref?.name === branch))
          found.push(toIssue(node));
      }
      after = data.repository.issues.pageInfo.hasNextPage
        ? data.repository.issues.pageInfo.endCursor
        : null;
      if (!after) break;
    }
    return found;
  }

  /** Closes an issue of this repository as completed; issues of other repositories are left alone. */
  async close(issue: Issue): Promise<void> {
    if (issue.state === 'CLOSED' || issue.repository !== this.fullName) return;
    await this.#rest('PATCH', `/repos/${this.fullName}/issues/${issue.number}`, {
      state: 'closed',
      state_reason: 'completed',
    });
    this.#log(`#${issue.number}: closed`);
    issue.state = 'CLOSED';
  }
}

export interface Deps {
  board: Board;
  repo: Repo;
  cfg: Config;
  log: (line: string) => void;
}

/** Moves the issues' cards to `status`; closes the issues only when they reach main. */
async function land({ board, repo }: Deps, issues: Issue[], status: string): Promise<void> {
  for (const issue of issues) {
    const item = await board.item(issue);
    await board.advance(item, status);
    await board.ensurePriority(item);
    if (status === STATUS.onMain) await repo.close(issue);
  }
}

async function issuesOf(repo: Repo, numbers: Iterable<number>): Promise<Issue[]> {
  const issues: Issue[] = [];
  for (const number of numbers) {
    const issue = await repo.issue(number);
    if (issue) issues.push(issue);
  }
  return issues;
}

type Payload = Record<string, any>;

async function onIssue(deps: Deps, payload: Payload): Promise<void> {
  const { board, repo } = deps;
  const raw = payload['issue'];
  const issue: Issue = {
    id: raw.node_id,
    number: raw.number,
    state: raw.state === 'closed' ? 'CLOSED' : 'OPEN',
    repository: repo.fullName,
  };
  const assigned = (raw.assignees ?? []).length > 0;
  const item = await board.item(issue);
  switch (payload['action']) {
    case 'opened':
    case 'reopened':
      await board.setStatus(item, assigned ? STATUS.ready : STATUS.backlog);
      break;
    case 'assigned':
      await board.advance(item, STATUS.ready);
      break;
    case 'unassigned':
      if (!assigned && item.status === STATUS.ready) await board.setStatus(item, STATUS.backlog);
      break;
  }
  await board.ensurePriority(item);
}

async function onBranch(deps: Deps, branch: string): Promise<void> {
  const { cfg, repo, board, log } = deps;
  if (branch === cfg.devBranch || branch === cfg.mainBranch) return;
  const issues = await repo.issuesLinkedTo(branch);
  if (issues.length === 0) log(`branch ${branch}: no linked issue`);
  for (const issue of issues) {
    const item = await board.item(issue);
    await board.advance(item, STATUS.inProgress);
    await board.ensurePriority(item);
  }
}

async function onPush(deps: Deps, payload: Payload): Promise<void> {
  const ref: string = payload['ref'] ?? '';
  if (!ref.startsWith('refs/heads/')) return;
  const branch = ref.slice('refs/heads/'.length);
  const { cfg, repo } = deps;
  if (branch !== cfg.devBranch && branch !== cfg.mainBranch) return onBranch(deps, branch);
  const numbers = new Set<number>();
  for (const commit of payload['commits'] ?? [])
    for (const n of issueNumbersFromText(commit.message)) numbers.add(n);
  await land(
    deps,
    await issuesOf(repo, numbers),
    branch === cfg.mainBranch ? STATUS.onMain : STATUS.onDev,
  );
}

async function onPullRequest(deps: Deps, payload: Payload): Promise<void> {
  const { board, repo, cfg, log } = deps;
  const pr = payload['pull_request'];
  const issues = await issuesOf(repo, issueNumbersFromText(`${pr.title}\n${pr.body ?? ''}`));
  const stepBack = async (): Promise<void> => {
    for (const issue of issues) {
      const item = await board.item(issue);
      if (item.status === STATUS.inReview) await board.setStatus(item, STATUS.inProgress);
    }
  };
  switch (payload['action']) {
    case 'opened':
    case 'reopened':
    case 'edited':
    case 'ready_for_review':
      for (const issue of issues) {
        const item = await board.item(issue);
        await board.advance(item, pr.draft ? STATUS.inProgress : STATUS.inReview);
        await board.ensurePriority(item);
      }
      return;
    case 'converted_to_draft':
      return stepBack();
    case 'closed':
      if (!pr.merged) return stepBack();
      if (pr.base.ref === cfg.devBranch) return land(deps, issues, STATUS.onDev);
      if (pr.base.ref !== cfg.mainBranch) return;
      // A release (dev into main) promotes every card waiting on dev, not only the ones its description names.
      if (pr.head.ref === cfg.devBranch && pr.head.repo?.full_name === repo.fullName) {
        const waiting = (await board.itemsWithStatus(STATUS.onDev)).filter(
          (i) => i.issue.repository === repo.fullName,
        );
        log(`${cfg.devBranch} -> ${cfg.mainBranch} merged: promoting ${waiting.length} card(s)`);
        for (const item of waiting) {
          await board.setStatus(item, STATUS.onMain);
          await repo.close(item.issue);
        }
      }
      return land(deps, issues, STATUS.onMain);
  }
}

/** Applies one GitHub event to the board. */
export async function handle(deps: Deps, eventName: string, payload: Payload): Promise<void> {
  switch (eventName) {
    case 'issues':
      return onIssue(deps, payload);
    case 'create':
      if (payload['ref_type'] === 'branch') return onBranch(deps, payload['ref']);
      return;
    case 'push':
      return onPush(deps, payload);
    case 'pull_request':
    case 'pull_request_target':
      return onPullRequest(deps, payload);
    default:
      deps.log(`event ${eventName} ignored`);
  }
}

/** A GraphQL caller for GitHub's API with one token. */
export function graphqlWith(token: string, fetchImpl: typeof fetch = fetch): GraphQL {
  return async <T>(query: string, variables: Record<string, unknown>): Promise<T> => {
    const res = await fetchImpl('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
        'user-agent': 'area-flow-project-board',
      },
      body: JSON.stringify({ query, variables }),
    });
    const body = (await res.json()) as { data?: T; errors?: { message: string }[] };
    if (!res.ok || body.errors?.length || body.data === undefined) {
      throw new Error(
        `GitHub GraphQL ${res.status}: ${body.errors?.map((e) => e.message).join('; ') ?? 'no data'}`,
      );
    }
    return body.data;
  };
}

/** A REST caller for GitHub's API with one token. */
export function restWith(token: string, fetchImpl: typeof fetch = fetch): Rest {
  return async (method, path, body) => {
    const res = await fetchImpl(`https://api.github.com${path}`, {
      method,
      headers: {
        authorization: `Bearer ${token}`,
        accept: 'application/vnd.github+json',
        'content-type': 'application/json',
        'user-agent': 'area-flow-project-board',
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`GitHub REST ${method} ${path}: ${res.status}`);
  };
}

/** Reads the workflow's environment and event, then applies the event. */
async function main(): Promise<void> {
  const env = (name: string): string => {
    const value = process.env[name];
    if (!value) throw new Error(`${name} is not set`);
    return value;
  };
  const cfg: Config = {
    owner: env('PROJECT_OWNER'),
    number: Number(env('PROJECT_NUMBER')),
    devBranch: process.env['DEV_BRANCH'] || 'dev',
    mainBranch: process.env['MAIN_BRANCH'] || 'main',
    defaultPriority: process.env['DEFAULT_PRIORITY'] ?? '',
  };
  if (!Number.isInteger(cfg.number) || cfg.number <= 0)
    throw new Error('PROJECT_NUMBER must be a positive integer');
  const log = (line: string): void => console.log(line);
  const board = new Board(graphqlWith(env('PROJECT_TOKEN')), cfg, log);
  await board.load();
  const repoToken = env('GITHUB_TOKEN');
  const repo = new Repo(env('GITHUB_REPOSITORY'), graphqlWith(repoToken), restWith(repoToken), log);
  const payload = JSON.parse(readFileSync(env('GITHUB_EVENT_PATH'), 'utf8')) as Payload;
  await handle({ board, repo, cfg, log }, env('GITHUB_EVENT_NAME'), payload);
}

if (import.meta.main) await main();
