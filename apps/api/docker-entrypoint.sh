#!/bin/sh
set -e
cd /workspace/apps/api
if [ "${RUN_MIGRATIONS:-true}" = "true" ]; then
  npx prisma migrate deploy
fi
exec node dist/main.js
