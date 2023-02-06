const { createClient } = require('redis');

class DBMethod {
    constructor() {
        this.db = createClient();
    }

    async run() {
        return await this.db.connect();
    }

    async last() {
        const keys = await this.db.keys('*');

        return keys.length;
    }

    async get(key) {
        try {
            return JSON.parse(await this.db.get(key));
        } catch (e) {
            return null;
        }
    }

    async getAll() {
        return await this.db.keys('*');
    }

    async set(data) {
        const key = (data.key) ?
            data.key : await this.last() + 1;

        data.key = key;

        try {
            await this.db.set(key, JSON.stringify(data));
        } catch (e) {
            return null;
        }

        return key;
    }
}

const db = new DBMethod();
db.run();

module.exports = {
    db
}