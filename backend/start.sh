#!/bin/bash
set -e


echo "🔄 Syncing database schema..."
npx prisma db push --skip-generate --accept-data-loss || true

echo "🌱 Seeding database..."
npx prisma db seed || true

echo "✅ Database ready!"
echo "🚀 Starting Serenova backend..."

node server.js
