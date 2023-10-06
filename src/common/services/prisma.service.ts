import { PrismaClient } from '@prisma/client';

type PrismaServiceLog = [
	{
		emit: 'event';
		level: 'query';
	},
	{
		emit: 'event';
		level: 'error';
	},
	{
		emit: 'stdout';
		level: 'info';
	},
	{
		emit: 'stdout';
		level: 'warn';
	}
];

export class PrismaService extends PrismaClient<{ log: PrismaServiceLog }> {
	constructor() {
		super({
			log: [
				{
					emit: 'event',
					level: 'query',
				},
				{
					emit: 'event',
					level: 'error',
				},
				{
					emit: 'stdout',
					level: 'info',
				},
				{
					emit: 'stdout',
					level: 'warn',
				},
			],
		});
	}

	async onModuleInit() {
		await this.$connect();
		this.$on('query', (e) => {
			console.info('Query: ' + e.query);
			console.info('Params: ' + e.params);
			console.info('Duration: ' + e.duration + 'ms');
		});

		this.$on('error', (e) => {
			console.error(e);
		});
	}
}
