import { Client } from 'discord.js';

export interface ICommand {
	execute: (interaction: any, client: Client) => Promise<void>;
}
