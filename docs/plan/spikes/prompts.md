<!-- The identical prompts, cold-read questions and load settings used for every back-end spike, so no framework got more help than another. -->

# Spike prompts

Used verbatim for each candidate, replacing only `<FRAMEWORK>` with `NestJS`, `Fastify` or `Effect`. Start each probe in a **fresh session** with no chat history, so a probe's result does not depend on an earlier answer. Probe 0 starts in an empty folder; probes 1 to 5 start in the folder holding the code of the probes already passed (the code of a failed probe is removed first). Each probe has a 5-minute wall-clock cap. Do not reword a prompt for one candidate. Summary and decision: [`../tech-backend.md`](../tech-backend.md).

## Shared preamble

Sent at the start of every probe.

> You are writing a throwaway proof of concept in TypeScript with <FRAMEWORK>, in the current folder, which holds the code written so far (or nothing for the first probe). TypeScript only, no JavaScript files, strict mode. Use the latest stable version of <FRAMEWORK> and tell me which version you assumed. Prefer the framework's own documented features; add a third-party library only when the framework has none, and name it. Keep the code simple enough that someone who did not write it can follow it. Do not add features I did not ask for.

## Probe 0: ping

> Build an HTTP server that listens on port 8080, with the port read from the `PORT` environment variable and never written as a literal in the source. `GET /ping` answers exactly `{"status":"ok"}` with a JSON content type. Give me the commands to install, run and check it with `curl http://localhost:8080/ping`.

## Probe 1: OpenAPI and contract test

> Add a served OpenAPI description of the API with a browsable UI. Then add a test that fails when the implementation and the description disagree: for example, if `/ping` returned `{"status":"ko"}` or a different shape, or if a route existed that is missing from the description. Show me how to make the test fail on purpose by changing one route.

## Probe 2: hook

> Add a background job that runs every 5 seconds with no HTTP request involved. Each run fetches a list of events from a function `fetchEvents()` that you stub, each with a stable `id`. The job must never process the same `id` twice, even across runs. It must survive `fetchEvents()` throwing an error, logging it and continuing on the next tick. It must give up on a run that takes longer than 2 seconds. Make the stub able to throw, hang and return duplicates, and add tests for each case.

## Probe 3: save-time key-path check

> Add `POST /workflows`. The body has `nodes`, an ordered list. Each node has an `id`, a `type`, a `publishes` list of key names it makes available, and a `params` object of strings. A string may reference an earlier node's value with `{{ nodeId.key }}`. Reject the request with a 400 and a clear error when a reference points to a node that does not exist, to a later node, or to a key the node does not list in `publishes`. A reference is only data: never evaluate it. Include the new route in the OpenAPI description, errors included, and add tests.

## Probe 4: JWT

> Add `GET /me`, protected: it requires a bearer JWT verified against the public keys of a JWKS endpoint whose URL comes from the `JWKS_URL` environment variable, checking signature, expiry and the `iss` and `aud` claims, which also come from the environment. Answer 401 on any failure and `{"sub": "<subject>"}` otherwise. Test it with a locally generated key pair and a local JWKS, with no external service. Include the route in the OpenAPI description.

## Probe 5: mocked third party

> Add `GET /weather/:city`, which calls an external HTTP API at the URL in `WEATHER_API_URL` and returns a simplified JSON. Write tests where that external call is mocked, with no real network: one success, one 500 from the third party, one timeout. The route must answer 502 on a third-party failure. Include the route in the OpenAPI description.

## Cold-read questions

Asked about the finished code of each candidate, from the code alone, to a member who did not run the spike and to the person who ran it, a day later. Same five questions, answers marked right or wrong, time recorded.

1. Where is the contract of `GET /ping` defined, and what produces the OpenAPI description?
2. What happens when `fetchEvents()` throws, and where is that handled?
3. Where is the check that rejects an undeclared key path, and what does it return?
4. What does the server do when the JWT has expired, and which line decides it?
5. Which parts of the code run only because of a framework convention (a decorator, an implicit injection, a file name) and are not called anywhere explicitly?

## Load settings

Same machine, nothing else running, production build, warm-up of 5 seconds first.

```bash
npx autocannon -d 10 -c 50 http://localhost:8080/ping
```

For probe 3, replace the URL and send a fixed valid body to `POST /workflows`. Record requests per second and p99 latency. The exact runs made (order, warm-ups, body, three runs each): [`runs.md`](runs.md#speed-measurements).
