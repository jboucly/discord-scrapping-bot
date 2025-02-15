import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';

export const constructMotorImmoModal = (modalId: string) => {
	const modal = new ModalBuilder().setCustomId(modalId).setTitle('Set config to search ads on "Moteur Immo"');

	const adTrackerJSONInput = new TextInputBuilder()
		.setRequired(true)
		.setCustomId('adTrackerJSON')
		.setStyle(TextInputStyle.Paragraph)
		.setPlaceholder('{"searchType":"classic"...}')
		.setLabel('Set JSON config to search ads (key : query)');

	modal.addComponents(new ActionRowBuilder<TextInputBuilder>().addComponents(adTrackerJSONInput));

	return modal;
};
