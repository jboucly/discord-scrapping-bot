# Discord-dev-bot

## 0.0.1

-   Finish POC and init first version of this bot.
-   Init Prisma
-   Init Heroku config
-   Init Github Actions

## 0.0.2

-   Fix error with `/mission-list` command

## 0.0.3

Total overhaul of commands : `/daily` and `/mission`

1. `/daily` :

-   Remove `'daily-list` command
-   Change all commands `/daily` to have them commands :
    -   `/daily list`
    -   `/daily enable ...opts`
    -   `/daily disabled`

2. `/mission`

-   Remove `'mission-list` command
-   Change all commands `/mission` to have them commands :
    -   `/mission list`
    -   `/mission enable ...opts`
    -   `/mission disabled`

## 0.0.4

-   Fix link of mission

## 0.0.5

-   Added forbidden words list in `Missions` table and generate migration file.
-   Implement forbidden words list in `/mission enable` command.
-   Implement forbidden words list in `/mission list` command.

## 0.0.6

-   Create `/mission update` command
-   Export all logic of `/mission` command to services files
-   Set all message of command to ephemeral
-   Added `userId` in `Missions` table for check if user is the owner of the mission
-   Added `env.example` file
-   Update `procfile` to deploy command on Heroku
-   Update `README.md` file
