import { ChatInputCommandInteraction, Client } from 'discord.js';
import { isNil } from 'lodash';
import { ICommand } from '../../../common/interfaces/command.interface';
import { PrismaService } from '../../../common/services/prisma.service';
import { CommandOptionsUtils } from '../../../common/utils/command-options.utils';
import { MissionOptions } from '../enums/mission-option.enum';
import { MissionDisabledCommandService } from './mission-disabled.service';
import { EnabledMissionCommandService } from './mission-enabled-command.service';
import { MissionListCommandService } from './mission-list-command.service';
import { UpdateMissionCommandService } from './update-mission-command.service';

export class MissionCommandService implements ICommand {
	constructor(
		private client: Client,
		private interaction: ChatInputCommandInteraction,
		private prismaService: PrismaService = new PrismaService(),
		private enabledMissionCommandService: EnabledMissionCommandService = new EnabledMissionCommandService(
			client,
			prismaService,
			interaction,
		),
		private missionListCommandService: MissionListCommandService = new MissionListCommandService(
			client,
			prismaService,
			interaction,
		),
		private missionDisabledCommandService: MissionDisabledCommandService = new MissionDisabledCommandService(
			client,
			prismaService,
			interaction,
		),
		private updateMissionCommandService: UpdateMissionCommandService = new UpdateMissionCommandService(
			client,
			prismaService,
			interaction,
		),
	) {
		this.execute();
	}

	public async execute(): Promise<void> {
		const isEnabled = CommandOptionsUtils.getNotRequired(this.interaction, MissionOptions.ENABLED);
		const isMissionList = !isNil(CommandOptionsUtils.getNotRequired(this.interaction, MissionOptions.LIST));
		const isDisabled = !isNil(CommandOptionsUtils.getNotRequired(this.interaction, MissionOptions.DISABLED));
		const isToUpdate = !isNil(CommandOptionsUtils.getNotRequired(this.interaction, MissionOptions.UPDATE));

		if (isMissionList) {
			return await this.missionListCommandService.execute();
		} else if (isDisabled) {
			return await this.missionDisabledCommandService.execute();
		} else if (isEnabled && isEnabled.options) {
			return await this.enabledMissionCommandService.execute(isEnabled.options);
		} else if (isToUpdate) {
			return await this.updateMissionCommandService.execute();
		}
	}
}
