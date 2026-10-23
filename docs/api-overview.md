# API overview

Sumber: <https://instabox.sh/docs/api>

Authentication, operations, idempotency and errors: what every endpoint shares.

## Base URL

```
https://api.instabox.sh
```

Every request and response body is JSON. Times are RFC 3339, in UTC.

## Authentication

Send an [API key](https://instabox.sh/docs/keys-sdk) in the `X-API-Key` header (or as `Authorization: Bearer`). Create keys in the dashboard: **Profile → API keys** (account menu); a restricted key only reaches the endpoints its scopes allow.

```bash
curl https://api.instabox.sh/v1/machines -H "X-API-Key: $INSTABOX_API_KEY"
```

## Changes run as operations

Creating, starting, stopping, pausing, resuming and deleting a machine answer `202 Accepted` with an **operation** at once. Follow it with [Get an operation](operations.md): it ends `succeeded` or `failed`, and a machine runs one operation at a time.

## Idempotency

Endpoints that list `Idempotency-Key` under **Headers** need one: any unique string, such as a UUID. Retrying a completed request with the same key returns its response instead of acting twice; the same key on a different request is `409 idempotency_conflict`. Keys are kept for 7 days.

## Errors

Errors use the HTTP status and a JSON body whose `code` says what went wrong. `retryable` is true when the same request may succeed later.

```json
{
  "error": {
    "code": "machine_not_running",
    "message": "machine is stopped; start it first",
    "requestId": "req_fbckiomplsq3fqin5dvsvzpnli",
    "retryable": false,
    "operationId": null
  }
}
```

| Status | Codes |
|---|---|
| 400 | `bad_request`, `spec_not_allowed` (a size your plan does not offer; `GET /v1/me` lists yours as `allowedSpecs`) |
| 401 | `unauthenticated`, `api_key_expired`, `api_key_revoked` |
| 403 | `permission_denied`, `insufficient_scope` (the key lacks the scope), `template_not_allowed` (the free plan creates from agent-browser only; a snapshot is not limited) |
| 404 | `not_found` |
| 409 | `operation_conflict` (another operation runs, which `operationId` names, or the change is not allowed now), `idempotency_conflict`, `machine_not_running` |
| 429 | `quota_exceeded` (a [limit](https://instabox.sh/docs/limits) was reached; the message says which) |
| 503 | `no_capacity`, `host_unavailable` (usually retryable) |

## OpenAPI

The full machine-readable description, every public endpoint included, is at <https://api.instabox.sh/v1/openapi.json>.
