# Operations

Sumber: <https://instabox.sh/docs/api/operations>

Follow a change to a machine until it is done.

Creating, starting, stopping, pausing, resuming and deleting a machine each return an operation. Wait for it before the next change to that machine: a machine runs one operation at a time.

- `GET /v1/operations/{id}`: Get an operation

## The operation object

**Properties**

- `id` (string): `op_` and 26 characters.
- `machineId` (string): The machine it changes.
- `type` (string): `create`, `start`, `stop`, `suspend` (pause), `resume` or `delete`.
- `state` (string): `queued`, `running`, then `succeeded` or `failed`.
- `phase` (string): Progress, such as `booting` or `snapshotting`.
- `error` (object | null): Why it failed: an error `code` and `message`.
- `machine` (object): Once it succeeded: the machine as it is now.

## Get an operation

`GET /v1/operations/{id}`

With `wait`, the request waits until the operation is done or changes, so a loop of these needs no sleeping.

**Path parameters**

- `id` (string, required): The operation's ID.

**Query parameters**

- `wait` (string): Wait up to this long for a change, such as `25s` (at most 30s).

**Request**

```bash
curl "https://api.instabox.sh/v1/operations/op_7xk2mq4tz5rbw3vn6pd2hs4jye?wait=25s" -H "X-API-Key: $INSTABOX_API_KEY"
```

**Response** (200 OK)

```json
{
  "id": "op_7xk2mq4tz5rbw3vn6pd2hs4jye",
  "machineId": "m_agqteugyy5px6hzeadbh4ldjo4",
  "type": "create",
  "state": "succeeded",
  "error": null,
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:04Z"
}
```
