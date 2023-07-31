import * as fs from 'fs';
import { join } from 'path';

interface Data {
	[key: string]: any;
}

class JsonStorage {
	private fileName: string;

	constructor(fileName: string) {
		this.fileName = fileName;
	}

	private readData(): Data {
		try {
			const data = fs.readFileSync(join('data', this.fileName), 'utf-8');
			return JSON.parse(data);
		} catch (error) {
			return {};
		}
	}

	private writeData(data: Data): void {
		fs.writeFileSync(join('data', this.fileName), JSON.stringify(data, null, 2), 'utf-8');
	}

	public set(key: string, value: any, opts?: { isArray: boolean }): void {
		const data = this.readData();

		if (opts?.isArray) {
			data[key] = data.hasOwnProperty(key) ? [...data[key], value] : [value];
			this.writeData(data);
			return;
		}

		data[key] = value;
		this.writeData(data);
	}

	public get(key: string): Record<string, any> | null {
		const data = this.readData();
		return data.hasOwnProperty(key) ? data[key] : null;
	}

	public delete(key: string): void {
		const data = this.readData();
		if (data.hasOwnProperty(key)) {
			delete data[key];
			this.writeData(data);
		}
	}

	public update(key: string, value: any): void {
		const data = this.readData();
		if (data.hasOwnProperty(key)) {
			data[key] = value;
			this.writeData(data);
		}
	}
}

export default JsonStorage;
