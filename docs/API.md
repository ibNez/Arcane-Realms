# API Reference

## REST Endpoints

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

### POST `/embed`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `texts` | string[] | Texts to embed |

**Response**

| Field | Type | Description |
|-------|------|-------------|
| `vectors` | number[][] | Embedding vectors |

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

### POST `/stt`
**Request**

| Field | Type | Description |
|-------|------|-------------|
| `audioWavBase64` | string | Base64 WAV audio |

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

## WebSocket Messages

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
