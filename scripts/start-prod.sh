#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Start database
docker-compose up -d postgresql

# Get new version
git pull

# Build new version
yarn build

# Deploy new version
yarn deploy
yarn db:deploy

# Restart server
docker run -d --name discord-bot-prd --env-file .env.prd --add-host=host.docker.internal:host-gateway discord-bot
