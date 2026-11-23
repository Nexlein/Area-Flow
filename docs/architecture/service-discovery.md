# Service discovery (`about.json`)

**Status:** To design. The schema is ours: documented, versionable, consistent with what the clients offer (subject).

While the stack runs, the server exposes a machine-readable description of the Services, Actions and REActions, with enough information for the clients to find their identifiers, descriptions and parameters without hard-coding the catalogue.

## Endpoint

- URL and method.
- Authentication needed or not.
- How the schema version is exposed, and the policy when it changes.

## Schema

Annotated example once decided. Per Service: identifier, name, description, whether it needs an OAuth2 subscription. Per Action and REAction: identifier, description, parameters (name, type, required, constraints) and, for Actions, the keys they publish for key paths.

## Single source

How the catalogue is built from the registered Services and nodes, so there is no second hard-coded list (ENG-EXT), and the test that checks the clients offer what the catalogue declares.
