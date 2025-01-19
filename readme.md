```bash

  _____  _                       _   _____               ____        _
 |  __ \(_)                     | | |  __ \             |  _ \      | |
 | |  | |_ ___  ___ ___  _ __ __| | | |  | | _____   __ | |_) | ___ | |_
 | |  | | / __|/ __/ _ \| '__/ _` | | |  | |/ _ \ \ / / |  _ < / _ \| __|
 | |__| | \__ \ (_| (_) | | | (_| | | |__| |  __/\ V /  | |_) | (_) | |_
 |_____/|_|___/\___\___/|_|  \__,_| |_____/ \___| \_/   |____/ \___/ \__|


```

<div align="center">
	<img src="https://img.shields.io/badge/DiscordJS-7289da?style=for-the-badge&logo=Discord&logoColor=white" style="margin-right: 10px"></img>
	<img src="https://img.shields.io/badge/prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white" style="margin-right: 10px"></img>
</div>

## Description

Discord bot with several functionalities for web development.
It includes various features ranging from freelance mission notifications to new ad notifications on online sales sites. It also allows for some jokes to lighten the mood on Discord servers, such as "Quoi ?" => "FEUR !".

## Features

### Notifications :

#### Daily command :

Command allowing the configuration of a daily reminder. (agile methodology)

Example :

```bash
# List all daily configured
/daily list

# Configure daily
/daily enabled

# Remove daily
/daily disabled
```

#### Mission command :

If you are freelance and looking for a new mission, this command will allow you to receive the latest available missions based on the keywords you give them.

Example :

```bash
# List all mission notifications configured
/mission list

# Configure mission notification, pass keywords with this syntax : java,python,typescript
/mission enabled

# Remove mission notification
/daily disabled

# Update mission notification
/daily update
```

#### Ads tracker command :

If you want to have notifications of the latest LBC or other announcements you can set it up !!

Example :

```bash
# List all ads trackers notifications configured
/lbc-tracker list

# Configure ads trackers ads notification
/lbc-tracker enabled

# Remove ads trackers notification
/lbc-tracker disabled

# Update ads trackers notification
/lbc-tracker update
```

## Development

### Prerequisites

- Node.js
- Yarn
- Docker
- Docker-compose
- Discord bot token
- Discord bot client id
- Discord bot public key
- Discord bot guild id

### Installation

Install dependencies :

```bash
$ yarn --frozen-lockfile
```

Create your `.env` file with the following content from the `.env.example` file.
Replace the values with your own.

```bash
$ cp .env.example .env
```

Run your local database with or without PgAdmin :

```bash
# Run database with PgAdmin
$ docker-compose up -d

# Run database without PgAdmin
$ docker-compose up -d postgresql
```

### Running the app

Before running the app, you need to generate the Prisma client.

```bash
$ yarn db:generate
```

Run the app :

```bash
# development
$ yarn dev

# production mode
$ yarn build && yarn start
```

If you want to run the bot with debug mode, you can run with F5 in VSCode.

### Prisma

```bash
# To generate client
$ yarn db:generate

# To deploy migration
$ yarn db:deploy

# To reset migration
$ yarn db:migrate:reset

# To create only migration
$ yarn db:migrate:create

# To apply migration
$ yarn db:migrate:dev
```

## Build docker image

Create your `.env.prd` file with the following content from the `.env.example` file.

Run the following command to build the docker image.

```bash
$ docker build -t discord-bot .
```

Run the following command to start the docker container.

```bash
$ docker run -d --name discord-bot-prd --env-file .env.prd --add-host=host.docker.internal:host-gateway discord-bot
```
