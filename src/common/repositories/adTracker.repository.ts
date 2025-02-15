import { prismaClient } from '@common/clients/prisma.client';
import { AdTrackers, AdTrackerType } from '@prisma/client';

export class AdTrackerRepository {
	public async delete(adTrackerIdToRemove: number) {
		await prismaClient.adTrackers.deleteMany({
			where: {
				id: adTrackerIdToRemove
			}
		});
	}

	public findAdTrackerByUserIdAndName(userId: string, name: string) {
		return prismaClient.adTrackers.findFirst({
			where: {
				name,
				userId
			}
		});
	}

	public async saveOrUpdateAdTrackerMotorImmo(adTracker: Partial<AdTrackers>, query: string): Promise<void> {
		await prismaClient.adTrackers.upsert({
			where: {
				id: adTracker.id ?? 0
			},
			update: {
				channelId: adTracker.channelId as string,
				AdTrackerLocalStorage: {
					deleteMany: {
						adTrackerId: adTracker.id
					},
					create: {
						key: 'query',
						value: query
					}
				}
			},
			create: {
				url: adTracker.url as string,
				name: adTracker.name as string,
				userId: adTracker.userId as string,
				type: adTracker.type as AdTrackerType,
				channelId: adTracker.channelId as string,
				AdTrackerLocalStorage: {
					create: {
						key: 'query',
						value: query
					}
				}
			}
		});
	}
}
