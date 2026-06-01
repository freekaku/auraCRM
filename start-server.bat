@echo off
cd /d "%~dp0server"
npx ts-node-dev --respawn --transpile-only src/server.ts
