# Service discovery (`about.json`)

The server exposes the Services, Actions and REActions (identifiers, descriptions, parameters) so clients never hard-code the catalogue. Schema is ours: documented, versionable, consistent with the clients (subject).

| Question                                                                                         | Answer |
| ------------------------------------------------------------------------------------------------ | ------ |
| URL, method, authentication                                                                      |        |
| Schema version: where exposed, policy on change                                                  |        |
| Per Service: id, name, description, OAuth2 needed                                                |        |
| Per Action / REAction: id, description, parameters (type, required, constraints), published keys |        |
| Built from the registered nodes (no second list), and the test that checks the clients offer it  |        |

Annotated example once decided.
