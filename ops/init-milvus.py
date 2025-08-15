#!/usr/bin/env python3
"""Initialize Milvus with a sample collection and data."""
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

HOST = "localhost"
PORT = "19530"
COLLECTION = "npc_memory"


def main():
    try:
        connections.connect(host=HOST, port=PORT)
    except Exception as exc:
        print(f"Could not connect to Milvus: {exc}")
        return

    if not utility.has_collection(COLLECTION):
        fields = [
            FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True),
            FieldSchema(name="embedding", dtype=DataType.FLOAT_VECTOR, dim=2),
            FieldSchema(name="content", dtype=DataType.VARCHAR, max_length=512),
        ]
        schema = CollectionSchema(fields, "NPC memory store")
        collection = Collection(COLLECTION, schema)
    else:
        collection = Collection(COLLECTION)

    if collection.num_entities == 0:
        data = [
            [[0.1, 0.2]],
            ["The first memory entry"],
        ]
        collection.insert(data)
        collection.flush()

    print(f"Milvus collection '{COLLECTION}' ready with {collection.num_entities} entities")


if __name__ == "__main__":
    main()
