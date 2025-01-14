#!/bin/bash

# Stop server
docker stop discord-bot-prd
docker rm discord-bot-prd

# Stop database
docker-compose down
