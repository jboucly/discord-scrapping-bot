import { prismaClient } from '@common/clients/prisma.client';
import { AdTrackerLocalStorage } from '@prisma/client';

export class AdTrackerLocalStorageRepository {
	/**
	 * @description Method to delete an existing ad tracker local storage and create new one
	 */
	public async updateExisting(
		adTrackerId: number,
		adTrackerLocalStorage: Partial<AdTrackerLocalStorage>
	): Promise<AdTrackerLocalStorage> {
		return await prismaClient.adTrackerLocalStorage.update({
			where: { id: adTrackerId },
			data: adTrackerLocalStorage
		});
	}
}
