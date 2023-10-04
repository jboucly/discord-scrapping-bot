import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { includes, isArray, isNil } from 'lodash';
import { MissionOptions } from '../enums/mission-option.enum';
import JsonStorage from '../shared/services/json-storage.service';
import { CommandOptionsUtils } from '../shared/utils/command-options.utils';

function getWords(words: string): string[] | string {
	if (words.includes(',') || words.includes(' ')) {
		return words.split(/,|\s/).filter((w) => w !== '');
	}

	return words;
}

function removeDuplicate(words: string[], newWords: string[]): string[] {
	return [...newWords.filter((w) => !includes(words, w)), ...words];
}

const MissionCommand = {
	data: new SlashCommandBuilder()
		.setName('mission')
		.setDescription('Configure your mission notification')
		.addBooleanOption((opts) =>
			opts
				.setRequired(true)
				.setName(MissionOptions.ENABLED)
				.setDescription('Enable or disable the mission notification')
		)
		.addStringOption((opts) => opts.setName(MissionOptions.WORDS).setDescription('Set keyword to search mission'))
		.toJSON(),
	async execute(interaction: ChatInputCommandInteraction, client: Client) {
		const optEnabled = CommandOptionsUtils.getRequired(interaction, MissionOptions.ENABLED);
		const optWords = CommandOptionsUtils.getNotRequired(interaction, MissionOptions.WORDS);

		const storage = new JsonStorage('mission.json');
		const alreadyExist = storage.get('words') as string[];

		if (optEnabled.value === false) {
			if (!isNil(alreadyExist)) {
				storage.delete('words');
			}
			await interaction.reply('🚀 Notification mission disabled');
			return;
		} else if (isNil(optWords)) {
			await interaction.reply('🚀 Please input keyword');
			return;
		} else {
			if (!isNil(alreadyExist)) {
				const newWords = getWords(optWords.value as string);

				if (isArray(newWords)) {
					storage.update('words', removeDuplicate(alreadyExist, newWords));
				} else {
					storage.update('words', [newWords, ...alreadyExist.filter((r) => r !== newWords)] as string[]);
				}
			} else {
				storage.set('words', [optWords.value]);
			}

			await interaction.reply('🚀 Notification mission enabled');
		}
	},
};

export default MissionCommand;
