-- Migration 0012: Add HNSW index on tools.embedding for fast cosine-similarity search.
-- HNSW (Hierarchical Navigable Small World) dramatically speeds up vector similarity
-- queries used by recommendations, "find similar tools", and semantic search features.
-- Uses vector_cosine_ops to match the <=> operator used in application queries.

CREATE INDEX IF NOT EXISTS tools_embedding_hnsw_idx
    ON tools USING hnsw (embedding vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);
