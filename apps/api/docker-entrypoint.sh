#!/bin/sh
set -e
cd /workspace/apps/api
npx prisma migrate deploy
exec node dist/main.js
