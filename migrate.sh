#!/bin/sh

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma migrate deploy

echo "Database migrations completed." 