# WebSocket Message Schemas

This document defines the JSON structures exchanged between the client and server.
Fields with a `?` suffix are optional.

## Client → Server

### `move`
| field | type | description |
|-------|------|-------------|
| `t`   | string | literal `"move"` identifying the message type |
| `x`   | number | destination x‑coordinate |
| `y`   | number | destination y‑coordinate |

### `chat`
| field | type | description |
|-------|------|-------------|
| `t`   | string | literal `"chat"` |
| `text`| string | chat message text |

### `skill`
| field | type | description |
|-------|------|-------------|
| `t`      | string | literal `"skill"` |
| `id`     | string | skill identifier |
| `target` | string | entity id being targeted |
| `payload?` | object | skill‑specific parameters (e.g. angle, power) |

### `inventory`
| field | type | description |
|-------|------|-------------|
| `t`   | string | literal `"inventory"` |
| `op`  | string | operation name such as `"use"`, `"move"`, or `"drop"` |
| `item`| string | item identifier |
| `qty?`| number | quantity affected |

### `join`
| field | type | description |
|-------|------|-------------|
| `t`     | string | literal `"join"` identifying a connection handshake |
| `name`  | string | player display name |
| `class` | string | chosen character class |

## Server → Client

### `pos`
| field | type | description |
|-------|------|-------------|
| `t`   | string | literal `"pos"` |
| `id`  | string | entity id |
| `x`   | number | current x‑coordinate |
| `y`   | number | current y‑coordinate |

### `chat`
| field | type | description |
|-------|------|-------------|
| `t`   | string | literal `"chat"` |
| `id`  | string | sender id |
| `text`| string | chat message text |

### `inventory`
| field | type | description |
|-------|------|-------------|
| `t`    | string | literal `"inventory"` |
| `items`| array | list of `{ id: string, qty: number }` objects |

### `skill`
| field | type | description |
|-------|------|-------------|
| `t`      | string | literal `"skill"` |
| `id`     | string | skill identifier |
| `target` | string | target entity id |
| `result` | string | outcome such as `"hit"` or `"miss"` |
| `hp?`    | number | updated hit points for the target |

### `error`
| field | type | description |
|-------|------|-------------|
| `t`       | string | literal `"error"` |
| `code`    | string | machine‑readable error code |
| `message` | string | human‑readable description of the problem |

