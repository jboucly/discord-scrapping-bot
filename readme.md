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

### Commands :

1. Daily command :

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

2. Mission command :

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

3. LBC tracker command :

If you want to have notifications of the latest LBC announcements you can set it up !!

Example :

```bash
# List all lbc trackers notifications configured
/lbc-tracker list

# Configure lbc trackers ads notification
/lbc-tracker enabled

# Remove lbc trackers notification
/lbc-tracker disabled

# Update lbc trackers notification
/lbc-tracker update
```

## Installation

```bash
$ yarn --frozen-lockfile
```

## Running the app

```bash
# development
$ yarn dev

# production mode
$ yarn build && yarn start
```

## Generate Prisma client

```bash
# To create only
$ yarn db:generate:create

# To create and apply
$ yarn db:generate:dev
```
