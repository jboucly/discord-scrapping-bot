import { Client, InteractionCallbackResponse, Message } from 'discord.js';
import { isNil } from 'lodash';

export async function SetDevBotReact(client: Client, message: InteractionCallbackResponse | Message): Promise<void> {
	const reactEmoji = client.emojis.cache.find((e) => e.name === 'devbot')?.id;

	if (!isNil(reactEmoji)) {
		switch (message.constructor.name) {
			case 'InteractionCallbackResponse':
				await (message as InteractionCallbackResponse).resource?.message?.react(reactEmoji);
				break;

			case 'Message':
				await (message as Message).react(reactEmoji);
				break;
		}
	}
}
