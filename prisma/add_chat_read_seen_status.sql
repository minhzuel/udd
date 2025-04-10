-- Add read and seen status fields to chat_messages
ALTER TABLE "public"."chat_messages" ADD COLUMN "is_read" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."chat_messages" ADD COLUMN "read_at" TIMESTAMP NULL;
ALTER TABLE "public"."chat_messages" ADD COLUMN "is_seen" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "public"."chat_messages" ADD COLUMN "seen_at" TIMESTAMP NULL; 