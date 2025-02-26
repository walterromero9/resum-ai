CREATE EXTENSION IF NOT EXISTS vector;

-- CREATE TABLE IF NOT EXISTS documents (
--   id UUID PRIMARY KEY,
--   file_name VARCHAR NOT NULL,
--   file_size INTEGER NOT NULL,
--   mime_type VARCHAR NOT NULL,
--   file_path VARCHAR NOT NULL,
--   content TEXT NOT NULL,
--   summary TEXT,
--   key_phrases VARCHAR[],
--   topics VARCHAR[],
--   metadata JSONB,
--   embedding VECTOR(1536),
--   created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
--   updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
-- );

-- CREATE INDEX ON documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100); 