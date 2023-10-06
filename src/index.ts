import 'dotenv/config';
import express from 'express';
import { DiscordClient } from './discord-bot';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
// Run discord bot
new DiscordClient();

app.post('/', async function (req, res) {
	return res.send({
		type: 'InteractionResponse',
		data: {
			content: 'hello world 🚀',
		},
	});
});

app.listen(PORT, () => {
	console.log('Listening on port', PORT);
});
