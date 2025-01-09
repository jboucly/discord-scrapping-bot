import 'dotenv/config';
import 'module-alias/register';

import express from 'express';
import { DiscordClient } from './discord-bot';

const app = express();
const PORT = process.env.PORT ?? 3000;

app.use(express.json());
// Run discord bot
const client = new DiscordClient();
client.init();

app.get('/', (_req, res) => {
	res.send({
		type: 'InteractionResponse',
		data: {
			content: 'hello world 🚀'
		}
	});
});

app.listen(PORT, () => {
	console.log('Listening on port', PORT);
});
