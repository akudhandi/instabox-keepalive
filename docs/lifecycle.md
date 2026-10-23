# Lifecycle

Sumber: <https://instabox.sh/docs/api/lifecycle>

Start, stop, pause and resume machines.

Each of these answers `202 Accepted` with an [operation](operations.md) and needs an `Idempotency-Key`. A paused machine keeps its memory and running programs; a stopped one keeps only its files.

- `POST /v1/machines/{id}/start`: Start a machine
- `POST /v1/machines/{id}/stop`: Stop a machine
- `POST /v1/machines/{id}/suspend`: Pause a machine
- `POST /v1/machines/{id}/resume`: Resume a machine

## Start a machine

`POST /v1/machines/{id}/start`

Boots a stopped machine. On a paused one it resumes it, or boots fresh if its programs cannot be brought back.

**Path parameters**

- `id` (string, required): The machine's ID (`m_agqteugyy5px6hzeadbh4ldjo4`).

**Headers**

- `Idempotency-Key` (string, required): A unique string, such as a UUID; a retry with the same key is not applied twice (see the [API overview](api-overview.md)).

**Request**

```bash
curl -X POST https://api.instabox.sh/v1/machines/m_agqteugyy5px6hzeadbh4ldjo4/start -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)"
```

**Response** (202 Accepted)

```json
{
  "id": "op_7xk2mq4tz5rbw3vn6pd2hs4jye",
  "machineId": "m_agqteugyy5px6hzeadbh4ldjo4",
  "type": "start",
  "state": "queued",
  "error": null,
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:04Z"
}
```

## Stop a machine

`POST /v1/machines/{id}/stop`

Shuts a running machine down: programs end, files are kept. A paused machine cannot be stopped; resume or delete it.

**Path parameters**

- `id` (string, required): The machine's ID (`m_agqteugyy5px6hzeadbh4ldjo4`).

**Headers**

- `Idempotency-Key` (string, required): A unique string, such as a UUID; a retry with the same key is not applied twice (see the [API overview](api-overview.md)).

**Body**

- `timeoutSeconds` (integer): Seconds to wait for a clean shutdown before forcing it off (0 to 600). Default: 60.

**Request**

```bash
curl -X POST https://api.instabox.sh/v1/machines/m_agqteugyy5px6hzeadbh4ldjo4/stop -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)"
```

**Response** (202 Accepted)

```json
{
  "id": "op_7xk2mq4tz5rbw3vn6pd2hs4jye",
  "machineId": "m_agqteugyy5px6hzeadbh4ldjo4",
  "type": "stop",
  "state": "queued",
  "error": null,
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:04Z"
}
```

## Pause a machine

`POST /v1/machines/{id}/suspend`

Pauses a running machine, keeping its memory and running programs.

**Path parameters**

- `id` (string, required): The machine's ID (`m_agqteugyy5px6hzeadbh4ldjo4`).

**Headers**

- `Idempotency-Key` (string, required): A unique string, such as a UUID; a retry with the same key is not applied twice (see the [API overview](api-overview.md)).

**Request**

```bash
curl -X POST https://api.instabox.sh/v1/machines/m_agqteugyy5px6hzeadbh4ldjo4/suspend -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)"
```

**Response** (202 Accepted)

```json
{
  "id": "op_7xk2mq4tz5rbw3vn6pd2hs4jye",
  "machineId": "m_agqteugyy5px6hzeadbh4ldjo4",
  "type": "suspend",
  "state": "queued",
  "error": null,
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:04Z"
}
```

## Resume a machine

`POST /v1/machines/{id}/resume`

Continues a paused machine where it left off.

**Path parameters**

- `id` (string, required): The machine's ID (`m_agqteugyy5px6hzeadbh4ldjo4`).

**Headers**

- `Idempotency-Key` (string, required): A unique string, such as a UUID; a retry with the same key is not applied twice (see the [API overview](api-overview.md)).

**Request**

```bash
curl -X POST https://api.instabox.sh/v1/machines/m_agqteugyy5px6hzeadbh4ldjo4/resume -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)"
```

**Response** (202 Accepted)

```json
{
  "id": "op_7xk2mq4tz5rbw3vn6pd2hs4jye",
  "machineId": "m_agqteugyy5px6hzeadbh4ldjo4",
  "type": "resume",
  "state": "queued",
  "error": null,
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:04Z"
}
```
