FROM node:22.11.0 AS base

# Install Chromium and dependencies
RUN apt-get update && apt-get install -y \
	chromium \
	libatk-bridge2.0-0 \
	libatk1.0-0 \
	libcups2 \
	libdbus-1-3 \
	libgconf-2-4 \
	libgdk-pixbuf2.0-0 \
	libnss3 \
	libx11-xcb1 \
	libxrandr2 \
	libxss1 \
	libxtst6 \
	&& rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn db:generate \
	&& yarn build

EXPOSE $PORT

CMD ["yarn", "start"]
