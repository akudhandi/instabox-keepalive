# Account

Sumber: <https://instabox.sh/docs/api/account>

Templates, your usage and limits, and who a key belongs to.

Read-only facts about your account and what machines can start from.

- `GET /v1/templates`: List templates
- `GET /v1/usage`: Get usage and limits
- `GET /v1/me`: Get the current user

## List templates

`GET /v1/templates`

What a machine can start from, with the software each one has.

**Request**

```bash
curl https://api.instabox.sh/v1/templates -H "X-API-Key: $INSTABOX_API_KEY"
```

**Response** (200 OK)

```json
{
  "templates": [
    {
      "id": "universal",
      "version": "2026-10-13.10",
      "description": "dev plus Docker, Python (uv), Go and Rust",
      "arch": "x86_64",
      "defaultSpec": { "vcpus": 4, "memMiB": 8192, "persistentDiskGiB": 20 },
      …
    }
  ]
}
```

## Get usage and limits

`GET /v1/usage`

Your machine and snapshot counts, the data they store (measured about hourly) and your limits.

**Request**

```bash
curl https://api.instabox.sh/v1/usage -H "X-API-Key: $INSTABOX_API_KEY"
```

**Response** (200 OK)

```json
{
  "machines": 2,
  "snapshots": 1,
  "storedBytes": 6442450944,
  "computedAt": "2026-10-13T10:00:00Z",
  "limits": { "maxMachines": 5, "maxSnapshots": 10, "maxStoredGiB": 200, … },
  …
}
```

## Get the current user

`GET /v1/me`

Who the key belongs to. Any key may call it.

**Request**

```bash
curl https://api.instabox.sh/v1/me -H "X-API-Key: $INSTABOX_API_KEY"
```

**Response** (200 OK)

```json
{ "userId": 42, "login": "octocat", "admin": false, … }
```
