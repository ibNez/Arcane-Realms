# API Reference

## REST Endpoints

All routes are served over HTTP on port **8080**. In production, requests must include an `Authorization: Bearer <JWT>` header;
local development still bypasses authentication. The plan is to prefix stable routes with `/v1/` once the API hardens.
Requests should include a `Content-Type: application/json` header. Rate limiting is enforced at **100 requests per minute**
per IP and **10 000** requests per day per token.

### POST `/llm`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `messages` | ChatMessage[] | Conversation history |
| `tools`? | { name: string; schema: object; strict?: boolean }[] | Optional tool specs |

<details><summary>ChatMessage</summary>

| Field | Type | Description |
|-------|------|-------------|
| `role` | `"system" | "user" | "assistant"` | Message role |
| `content` | string | Message text |

</details>

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Model reply |
| `toolCalls`? | { name: string; args: any }[] | Tool call results |

**Errors**

| Code | Meaning |
|------|---------|
| `400` | Invalid request shape or empty `messages` array |
| `500` | Upstream model failure |
Clients should retry with exponential backoff on `500` responses.

### POST `/embed`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `texts` | string[] | Texts to embed |

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `vectors` | number[][] | Embedding vectors |

Embeddings are generated using the `nomic-embed-text` model and are **768** dimensions.  
Use of other models will alter the dimensionality.

### POST `/memory/search`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `collection` | string | Memory collection name |
| `vector` | number[] | Query embedding |
| `topK` | number | Maximum hits to return |
| `filter`? | any | Optional metadata filter |

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `hits` | { doc: object; score: number }[] | Matching documents |

Milvus is queried in **consistency level: eventual** mode; newly upserted rows may take a few seconds to appear.  
Typical latency for 10K rows is under **50 ms** on a local machine.

### POST `/memory/upsert`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `collection` | string | Memory collection name |
| `rows` | any[] | Rows to upsert (each must include `embedding`) |

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `ok` | boolean | Upsert success flag |

Upserts are idempotent per document `id`; later writes overwrite existing rows.  
There is no transaction isolation—clients should avoid concurrent updates to the same `id`.

### POST `/stt`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `audioWavBase64` | string | Base64 WAV audio |

Accepts 16‑bit PCM WAVs sampled at 16 kHz. Payloads above **5 MB** will be rejected.

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Transcribed text |

### POST `/tts`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Text to synthesize |

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `audioWavBase64` | string | Base64 WAV audio |

Voice is fixed to an `en-US` neutral speaker. Future versions may expose a `voice` parameter for selection. Output is 16‑bit PCM WAV.

### POST `/gen/image`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `prompt` | string | Image prompt |

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `imagePngBase64` | string | Base64 PNG image |
| `assetKey` | string | Identifier for caching |

Images are generated at **1024×1024** by default and may take up to **20 s** to return.  
Custom resolutions are currently unsupported.

## WebSocket Messages

The WebSocket server speaks raw JSON over a standard upgrade handshake. Clients attempt reconnect with exponential backoff.
Messages are unsigned and unencrypted on localhost; TLS and HMAC signing will be evaluated for remote deployments.

### `move`
Client → Server payload:

| Field | Type | Description |
|-------|------|-------------|
| `t` | `"move"` | Message type |
| `x` | number | X position |
| `y` | number | Y position |

Server broadcast:

| Field | Type | Description |
|-------|------|-------------|
| `t` | `"pos"` | Message type |
| `id` | string | Client id |
| `x` | number | X position |
| `y` | number | Y position |

### `chat`
Client → Server payload:

| Field | Type | Description |
|-------|------|-------------|
| `t` | `"chat"` | Message type |
| `text` | string | Chat message |

Server broadcast:

| Field | Type | Description |
|-------|------|-------------|
| `t` | `"chat"` | Message type |
| `id` | string | Sender id |
| `text` | string | Chat message |
