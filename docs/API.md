# API Reference

## REST Endpoints

> **TODO:** Document authentication requirements, versioning scheme, and rate limits for all endpoints.

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
> **TODO:** List possible error codes and retry behavior for this endpoint.

### POST `/embed`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `texts` | string[] | Texts to embed |

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `vectors` | number[][] | Embedding vectors |
> **TODO:** Clarify vector dimensionality and embedding model used.

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
> **TODO:** Specify index consistency guarantees and latency expectations.

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
> **TODO:** Describe concurrency handling and conflict resolution strategies.

### POST `/stt`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `audioWavBase64` | string | Base64 WAV audio |
> **TODO:** Note supported audio formats and maximum payload sizes.

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
> **TODO:** Document voice selection parameters and output encoding options.

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
> **TODO:** Include information on image resolution limits and processing timeouts.

## WebSocket Messages

> **TODO:** Outline handshake procedure, reconnection strategy, and message signing or encryption plans.

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
