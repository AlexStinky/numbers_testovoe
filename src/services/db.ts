import { createClient } from 'redis';

import { IData } from '../types/request';

class DBMethod {
    private db: ReturnType<typeof createClient>;

    async run(): Promise<void> {
        try {
            this.db = createClient();
            await this.db.connect();
        } catch (err) {
            console.log('Resid Connect Error', err);
        }
    }

    async last(): Promise<number> {
        const keys = await this.db.keys('*');

        return keys.length;
    }

    async get(key: string): Promise<IData | null> {
        try {
            const get: string | null = await this.db.get(key);
            const data: IData = (get) ? JSON.parse(get) : null;

            return data;
        } catch (e) {
            return null;
        }
    }

    async getAll(): Promise<string[]> {
        return await this.db.keys('*');
    }

    async set(data: IData): Promise<string | null> {
        const key = (data.key) ?
            data.key : await this.last() + 1;

        data.key = key.toString();

        try {
            const data_string: string = JSON.stringify(data);
            await this.db.set(data.key, data_string);
        } catch (e) {
            return null;
        }

        return data.key;
    }
}

const db: any = new DBMethod();
db.run();

export default db;