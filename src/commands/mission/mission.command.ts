import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { isArray, isNil, uniqBy } from 'lodash';
import JsonStorage from '../../common/services/json-storage.service';
import { CommandOptionsUtils } from '../../common/utils/command-options.utils';
import { MissionOptions } from './enums/mission-option.enum';
import { MissionStorage } from './enums/mission-storage.enum';
import { Mission } from './interfaces/mission.interface';

function getWords(words: string): string[] | string {
	if (words.includes(',') || words.includes(' ')) {
		return words.split(/,|\s/).filter((w) => w !== '');
	}

	return words;
}

function removeDuplicate(words: Mission[], newWords: string[], channel: string): Mission[] {
	const exist = words.find((w) => w.channel === channel);

	if (exist) {
		const uniqWords = uniqBy([...newWords, ...exist.words], 'channel');

		return words.map((w) => {
			if (w.channel === channel) {
				w.words = uniqWords;
			}

			return w;
		});
	}

	return [...words, { channel, words: newWords }];
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

		const channel = interaction.channel;
		if (isNil(channel)) throw new Error('Channel not found');

		const storage = new JsonStorage('mission.json');
		const alreadyExist = storage.get(MissionStorage.DATA) as Mission[];

		if (optEnabled.value === false) {
			if (!isNil(alreadyExist)) {
				alreadyExist.forEach((mission) => {
					if (mission.channel === channel.id) {
						storage.update(
							MissionStorage.DATA,
							alreadyExist.filter((r) => r.channel !== mission.channel)
						);
					}
				});
			}
			await interaction.reply('🚀 Notification mission removed');
			return;
		} else if (isNil(optWords)) {
			await interaction.reply('🚀 Please input keyword');
			return;
		} else {
			if (!isNil(alreadyExist)) {
				const newWords = getWords(optWords.value as string);

				if (isArray(newWords)) {
					storage.update(MissionStorage.DATA, removeDuplicate(alreadyExist, newWords, channel.id));
				} else {
					storage.update(MissionStorage.DATA, [
						...alreadyExist.filter((r) => r.channel !== channel.id),
						{ channel: channel.id, words: newWords },
					]);
				}
			} else {
				storage.set(MissionStorage.DATA, [{ channel: channel.id, words: [optWords.value as string] }]);
			}

			await interaction.reply('🚀 Notification mission enabled');
		}
	},
};

export default MissionCommand;
