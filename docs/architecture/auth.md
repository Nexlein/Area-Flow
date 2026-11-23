# Authentication and delegated access

**Status:** To design. The subject asks us to document identity linking and the lifecycle of delegated credentials.

OIDC answers who the user is (login). OAuth 2.0 answers what the product may do in a Service on the user's behalf (subscriptions). One provider can take part in both, but the flows stay separate.

## Local accounts

- Registration and confirmation: how an account is confirmed, what an unconfirmed account can do.
- Password storage: algorithm and parameters.
- Sessions or tokens issued to the clients: format, lifetime, storage on web and on Android, revocation.

## OIDC login

- Providers supported.
- Flow on web and on Android: redirect targets, state, PKCE.
- Linking an external identity to a local user: first login, same email as an existing account, unlinking.

## OAuth2 subscriptions

- Per Service: scopes requested and why each is needed.
- Where delegated credentials are stored and how they are protected.
- Lifecycle: refresh, expiry, revocation by the user or the Service, what the hooks do when a token stops working, what happens on account deletion.

## Never

- A third-party token is never sent to a client and never written to a log.
