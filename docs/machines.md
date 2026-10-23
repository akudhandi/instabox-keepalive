# Machines

Sumber: <https://instabox.sh/docs/api/machines>

Create, list, change and delete machines.

A machine is a Linux VM of your own: its files under `/data` and the software you install stay across stops and restarts. A machine gets 4 vCPUs, 8 GB of memory and 20 GB of storage unless the create names another size of your plan (Pro: 2/4 and 8/16; Team: 2/4 up to 32/64; `GET /v1/me` lists yours as `allowedSpecs`).

- `POST /v1/machines`: Create a machine
- `GET /v1/machines`: List machines
- `GET /v1/machines/{id}`: Get a machine
- `PATCH /v1/machines/{id}`: Update a machine
- `DELETE /v1/machines/{id}`: Delete a machine

## The machine object

**Properties**

- `id` (string): `m_` and 26 characters.
- `name` (string): Unique among your machines.
- `state` (string): `creating`, `starting`, `running`, `stopping`, `stopped`, `suspending`, `suspended` (paused), `resuming`, `deleting` or `error`.
- `operationId` (string | null): The operation in progress, if any.
- `template` (object): The template it started from: `id`, `version`, `digest`.
- `spec` (object): Its size: `vcpus`, `memMiB`, `persistentDiskGiB`, `rootDiskGiB`.
- `runtime` (object): `ready` is true once it runs and passes its checks.
- `autoSuspendAfterSeconds` (integer | null): Idle time before it pauses (1800 unless your account has manual lifecycle); null: off.
- `metadata` (object): Your labels.
- `createdAt` (string): When it was created.

## Create a machine

`POST /v1/machines`

Starts a machine from a template or one of your snapshots. Returns a `create` operation; the new machine is its `machineId`.

**Headers**

- `Idempotency-Key` (string, required): A unique string, such as a UUID; a retry with the same key is not applied twice (see the [API overview](api-overview.md)).

**Body**

- `name` (string, required): 1-63 lowercase letters, digits and `-`, starting with a letter or digit.
- `templateId` (string): A [template](account.md), such as `universal`. Give this or `snapshotId`.
- `snapshotId` (string): Start from this snapshot of yours instead.
- `guestUser` (string): The Linux user inside, which SSH, exec and the terminal log in as: up to 32 of `a-z`, `0-9`, `_` and `-`, starting with a letter or `_`. Reserved names (`root`, system users and groups) are `400 invalid_guest_user`. Default: `user` (with `snapshotId`: the user of that snapshot). Fixed at create; older templates always get `dev`.
- `autoSuspendAfterSeconds` (integer): Pause the machine once it has been idle this many seconds (120 to 86400; 0: never). Honoured only for accounts with manual lifecycle, an admin setting: every other machine pauses after 1800 seconds (30 minutes) whatever is sent, and the reply says so.
- `metadata` (object): String labels, up to 32 keys. Filter by them when listing. Not for secrets.
- `orgId` (string): Target org; defaults to your personal org. A snapshot determines its own org.
- `vault` (boolean): False disables personal Vault delivery only. It does not change Secret selections.
- `secrets` ("all" | string[]): All current and future proxy Secrets, or explicit names ([] selects none). Env Secrets are never included. Omit both selection fields to keep Vault behavior without Secret enrollment. With envSecrets alone, proxy selection defaults to all.
- `envSecrets` (string[]): Explicit env Secret names ([] selects none). No all mode. Code inside the sandbox can read these values.
- `desiredState` ("running" | "stopped"): `stopped` stops it once it is set up. Default: `running`.

**Request**

```bash
curl -X POST https://api.instabox.sh/v1/machines -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)" -H 'Content-Type: application/json' \
  -d '{"name": "dev", "templateId": "universal"}'
```

**Response** (202 Accepted)

```json
{
  "id": "op_7xk2mq4tz5rbw3vn6pd2hs4jye",
  "machineId": "m_agqteugyy5px6hzeadbh4ldjo4",
  "type": "create",
  "state": "queued",
  "error": null,
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:04Z"
}
```

## List machines

`GET /v1/machines`

Your machines, a page at a time.

**Query parameters**

- `metadata` (string): `key:value`: only machines with that label. Repeat it to require several.
- `limit` (integer): Page size.
- `cursor` (string): The `nextCursor` of the previous page.

**Request**

```bash
curl "https://api.instabox.sh/v1/machines?metadata=task:review" -H "X-API-Key: $INSTABOX_API_KEY"
```

**Response** (200 OK)

```json
{
  "machines": [ { "id": "m_agqteugyy5px6hzeadbh4ldjo4", "name": "dev", "state": "running", … } ],
  "nextCursor": null
}
```

## Get a machine

`GET /v1/machines/{id}`

The machine, by ID or by name.

**Path parameters**

- `id` (string, required): The machine's ID or its name.

**Request**

```bash
curl https://api.instabox.sh/v1/machines/dev -H "X-API-Key: $INSTABOX_API_KEY"
```

**Response** (200 OK)

```json
{
  "id": "m_agqteugyy5px6hzeadbh4ldjo4",
  "name": "dev",
  "state": "running",
  "desiredState": "running",
  "revision": 3,
  "operationId": null,
  "template": { "id": "universal", "version": "2026-10-13.10", "digest": "sha256:9f2c…" },
  "spec": { "vcpus": 4, "memMiB": 8192, "persistentDiskGiB": 20 },
  "storage": { "sizeGiB": 20, "mountPath": "/data", "persistent": true, "synced": true },
  "runtime": { "ready": true },
  "autoSuspendAfterSeconds": 1800,
  "metadata": { "task": "review" },
  "guestUser": "alice",
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:31Z"
}
```

## Update a machine

`PATCH /v1/machines/{id}`

Changes the idle pause or labels, in any state and at once. Fields you leave out are unchanged.

**Path parameters**

- `id` (string, required): The machine's ID (`m_agqteugyy5px6hzeadbh4ldjo4`).

**Headers**

- `Idempotency-Key` (string, required): A unique string, such as a UUID; a retry with the same key is not applied twice (see the [API overview](api-overview.md)).

**Body**

- `autoSuspendAfterSeconds` (integer): Pause it once idle this many seconds (120 to 86400); 0 turns it off. Without manual lifecycle any value keeps the fixed 30 minutes; the reply shows the effective value.
- `metadata` (object): Replaces the labels; `{}` clears them.

**Request**

```bash
curl -X PATCH https://api.instabox.sh/v1/machines/m_agqteugyy5px6hzeadbh4ldjo4 -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)" -H 'Content-Type: application/json' \
  -d '{"autoSuspendAfterSeconds": 600}'
```

**Response** (200 OK)

```json
{
  "id": "m_agqteugyy5px6hzeadbh4ldjo4",
  "name": "dev",
  "state": "running",
  "desiredState": "running",
  "revision": 3,
  "operationId": null,
  "template": { "id": "universal", "version": "2026-10-13.10", "digest": "sha256:9f2c…" },
  "spec": { "vcpus": 4, "memMiB": 8192, "persistentDiskGiB": 20 },
  "storage": { "sizeGiB": 20, "mountPath": "/data", "persistent": true, "synced": true },
  "runtime": { "ready": true },
  "autoSuspendAfterSeconds": 1800,
  "metadata": { "task": "review" },
  "guestUser": "alice",
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:31Z"
}
```

## Delete a machine

`DELETE /v1/machines/{id}`

Deletes the machine and its files. Snapshots saved from it are kept.

**Path parameters**

- `id` (string, required): The machine's ID (`m_agqteugyy5px6hzeadbh4ldjo4`).

**Headers**

- `Idempotency-Key` (string, required): A unique string, such as a UUID; a retry with the same key is not applied twice (see the [API overview](api-overview.md)).

**Request**

```bash
curl -X DELETE https://api.instabox.sh/v1/machines/m_agqteugyy5px6hzeadbh4ldjo4 -H "X-API-Key: $INSTABOX_API_KEY" -H "Idempotency-Key: $(uuidgen)"
```

**Response** (202 Accepted)

```json
{
  "id": "op_7xk2mq4tz5rbw3vn6pd2hs4jye",
  "machineId": "m_agqteugyy5px6hzeadbh4ldjo4",
  "type": "delete",
  "state": "queued",
  "error": null,
  "createdAt": "2026-10-13T09:12:04Z",
  "updatedAt": "2026-10-13T09:12:04Z"
}
```
