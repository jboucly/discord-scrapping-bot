import { Client, Message } from 'discord.js';
import { isNil } from 'lodash';

export async function SetDevBotReact(client: Client, message: Message): Promise<void> {
	const reactEmoji = client.emojis.cache.find((e) => e.name === 'devbot')?.id;

	if (!isNil(reactEmoji)) {
		await message.react(reactEmoji);
	}
}
