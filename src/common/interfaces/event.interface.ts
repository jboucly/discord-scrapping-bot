export interface IEvent {
	startCronJobs(client: any): Promise<void>;
}
