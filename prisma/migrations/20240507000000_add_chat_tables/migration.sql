-- Create ChatConversation table
CREATE TABLE "public"."chat_conversations" (
  "id" SERIAL PRIMARY KEY,
  "user_id" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'open',
  "product_id" INTEGER,
  "order_id" INTEGER,
  "last_message_preview" TEXT,
  "unread_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("user_id") REFERENCES "public"."users"("user_id") ON DELETE CASCADE,
  FOREIGN KEY ("product_id") REFERENCES "public"."products"("product_id") ON DELETE SET NULL,
  FOREIGN KEY ("order_id") REFERENCES "public"."orders"("order_id") ON DELETE SET NULL
);

-- Create ChatMessage table
CREATE TABLE "public"."chat_messages" (
  "id" SERIAL PRIMARY KEY,
  "conversation_id" INTEGER NOT NULL,
  "content" TEXT,
  "message_type" TEXT NOT NULL DEFAULT 'text',
  "is_from_customer" BOOLEAN NOT NULL DEFAULT true,
  "attachment_url" TEXT,
  "attachment_type" TEXT,
  "timestamp" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "is_read" BOOLEAN NOT NULL DEFAULT false,
  "read_at" TIMESTAMP NULL,
  "is_seen" BOOLEAN NOT NULL DEFAULT false,
  "seen_at" TIMESTAMP NULL,
  FOREIGN KEY ("conversation_id") REFERENCES "public"."chat_conversations"("id") ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX "chat_conversations_user_id_idx" ON "public"."chat_conversations"("user_id");
CREATE INDEX "chat_conversations_product_id_idx" ON "public"."chat_conversations"("product_id");
CREATE INDEX "chat_conversations_order_id_idx" ON "public"."chat_conversations"("order_id");
CREATE INDEX "chat_messages_conversation_id_idx" ON "public"."chat_messages"("conversation_id");
CREATE INDEX "chat_messages_timestamp_idx" ON "public"."chat_messages"("timestamp");
CREATE INDEX "chat_messages_is_read_idx" ON "public"."chat_messages"("is_read");
CREATE INDEX "chat_messages_is_seen_idx" ON "public"."chat_messages"("is_seen");

-- Add these tables to Prisma schema mapping
ALTER TABLE "public"."chat_conversations" ADD COLUMN "_prisma_id" TEXT UNIQUE GENERATED ALWAYS AS (id::text) STORED;
ALTER TABLE "public"."chat_messages" ADD COLUMN "_prisma_id" TEXT UNIQUE GENERATED ALWAYS AS (id::text) STORED; 