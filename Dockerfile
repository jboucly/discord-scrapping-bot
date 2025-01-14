FROM node:22.11.0

RUN echo "DATABASE_URL=$DATABASE_URL" && echo "PORT=$PORT"

WORKDIR /app

COPY package.json yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . .

RUN yarn db:generate \
	&& yarn build

EXPOSE $PORT

CMD ["yarn", "start"]
