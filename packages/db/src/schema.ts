import { index, integer, jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core"

export const documents = pgTable('documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  title: text('title'),
  source: text('source'),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
})

export const chunks = pgTable(
  'chunks',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    // ID of the document this chunk belongs to
    documentId: uuid('document_id')
      .references(() => documents.id, { onDelete: 'cascade' })
      .notNull(),
    content: text('content').notNull(),
    // Position of this chunk within the document
    chunkIndex: integer('chunk_index').notNull(),
    // Additional chunk metadata such as page, section, or source
    metadata: jsonb('metadata').default({}),
    // Vector embedding used for semantic search
    // Stored as text temporarily; pgvector will be handled via raw SQL
    embedding: text('embedding'),
    // Full-text search vector for lexical/BM25 search
    // Will be generated using a trigger or computed column
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (table) => ({
    // Speeds up queries filtering chunks by document
    documentIdIdx: index('chunks_document_id_idx').on(table.documentId),

    // Speeds up queries filtering/searching chunk metadata
    metadataIdx: index('chunks_metadata_idx').on(table.metadata),
  })
);