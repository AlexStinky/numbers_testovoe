const { db } = require("./db");

const MILLION = 1000000;

class Queue {
    constructor() {
        this._oldestIndex = 1;
        this._newestIndex = 1;
        this._storage = {};
    }

    size() {
        return this._newestIndex - this._oldestIndex;
    }

    enqueue(data) {
        this._storage[this._newestIndex] = data;
        this._newestIndex++;
    }

    dequeue() {
        let oldestIndex = this._oldestIndex;
        let newestIndex = this._newestIndex;
        let deletedData;

        if (oldestIndex !== newestIndex) {
            deletedData = this._storage[oldestIndex];
            delete this._storage[oldestIndex];
            this._oldestIndex++;

            return deletedData;
        }
    };

    run() {
        for (let i = this._oldestIndex; i < this._newestIndex; i++) {
            this.calculation(this._storage[i]);
            this.dequeue();
        }

        setTimeout(() => this.run(), 100);
    }

    async calculation(data) {
        const from = (data.progression.length > 0) ?
            data.progression.length : (data.type === 4) ?
            3 : 0;
        const to = (data.counter > 0) ?
            MILLION : data.number - (MILLION * data.multiplier);
        const start = (data.multiplier === data.counter) ?
            data.data.start : data.number_series + data.data.common;
        const common = data.data.common;
        const j = (data.type === 4) ? 1 : 0;

        let a = 1;
        let b = 1;

        for (let i = from; i < to + j; i++) {
            if (i === 0) {
                data.progression[i] = start;
            } else {
                const length = data.progression.length;
                const last = data.progression[length - 1];
                switch(data.type) {
                    case 1:
                        data.progression[i] = last + common;
                        data.number_series = data.progression[i];
                        break;
                    case 2:
                        data.progression[i] = last * common;
                        data.number_series = data.progression[i];
                        break;
                    case 3:
                        const temp_harmonic = data.number_series + common;
                        data.progression[i] = 1 / temp_harmonic;
                        data.number_series = temp_harmonic;
                        break;
                    case 4:
                        let c = a + b;
                        a = b;
                        b = c;
                        data.number_series = b;
                        break;
                }
            }
        }

        if (data.counter > 0) {
            data.counter--;
            data.progression = [];

            await db.set(data);
            this.calculation(data);
        } else {
            data.inProgress = false;

            if (data.type === 3) {
                data.number_series = 1 / data.number_series;
            }

            await db.set(data);
        }
    }
}

const queue = new Queue();
queue.run();

module.exports = {
    queue
}