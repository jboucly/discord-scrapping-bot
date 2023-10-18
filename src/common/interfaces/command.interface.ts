import { ChatInputCommandInteraction, Client } from 'discord.js';

export interface ICommand<K = ChatInputCommandInteraction> {
	execute(options?: K): Promise<void>;
	execute(interaction: K, client: Client): Promise<void>;
}
