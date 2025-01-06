import { CacheType, Client, CommandInteractionOption } from 'discord.js';

export interface ICommand<K = readonly CommandInteractionOption<CacheType>[]> {
	execute(options?: K): Promise<void>;
	execute(optChannel: K, client: Client): Promise<void>;
}
