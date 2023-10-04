import { ChatInputCommandInteraction, Client, SlashCommandBuilder } from 'discord.js';
import { isArray, isNil, uniq } from 'lodash';
import JsonStorage from '../../common/services/json-storage.service';
import { CommandOptionsUtils } from '../../common/utils/command-options.utils';
import { MissionOptions } from './enums/mission-option.enum';
import { MissionStorage } from './enums/mission-storage.enum';
import { MissionNotificationSaved } from './interfaces/mission-notification-saved.interface';

function getWords(words: string): string[] | string {
	if (words.includes(',') || words.includes(' ')) {
		return words.split(/,|\s/).filter((w) => w !== '');
	}

	return words;
}

function removeDuplicate(
	words: MissionNotificationSaved[],
	newWords: string[],
	channel: string
): MissionNotificationSaved[] {
	const exist = words.find((w) => w.channel === channel);

	if (exist) {
		const uniqWords = uniq([...newWords, ...exist.words]);

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
		.setDescription('Configure your mission notification. If you search freelancer job, you can use this ! 🔥')
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
		const alreadyExist = storage.get(MissionStorage.NOTIFICATIONS) as MissionNotificationSaved[];

		if (optEnabled.value === false) {
			if (!isNil(alreadyExist)) {
				alreadyExist.forEach((mission) => {
					if (mission.channel === channel.id) {
						storage.update(
							MissionStorage.NOTIFICATIONS,
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
					storage.update(MissionStorage.NOTIFICATIONS, removeDuplicate(alreadyExist, newWords, channel.id));
				} else {
					storage.update(MissionStorage.NOTIFICATIONS, [
						...alreadyExist.filter((r) => r.channel !== channel.id),
						{ channel: channel.id, words: newWords },
					]);
				}
			} else {
				storage.set(MissionStorage.NOTIFICATIONS, [{ channel: channel.id, words: [optWords.value as string] }]);
			}

			await interaction.reply('🚀 Notification mission enabled');
		}
	},
};

export default MissionCommand;
