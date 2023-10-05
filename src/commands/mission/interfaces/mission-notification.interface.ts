export interface MissionNotification {
	id: string;
	from: 'pylote' | 'freework';
	name: string;
	url: string;
	date: Date;
	platform: string;
	city: string;
	durationMonth: string;

	iconUrl?: string;
	description?: string;
	skills?: string[];
}
