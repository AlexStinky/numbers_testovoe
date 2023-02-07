import db from './db';

import { IData } from '../types/request';

const MILLION = 1000000;

class Queue {
    _oldestIndex: number = 1;
    _newestIndex: number = 1;
    _storage: Object = {};

    size(): number {
        return this._newestIndex - this._oldestIndex;
    }

    enqueue(data: IData): void {
        this._storage[this._newestIndex] = data;
        this._newestIndex++;
    }

    dequeue(): IData | void {
        let oldestIndex: number = this._oldestIndex;
        let newestIndex: number = this._newestIndex;
        let deletedData: IData;

        if (oldestIndex !== newestIndex) {
            deletedData = this._storage[oldestIndex];
            delete this._storage[oldestIndex];
            this._oldestIndex++;

            return deletedData;
        }
    };

    run(): void {
        for (let i = this._oldestIndex; i < this._newestIndex; i++) {
            this.calculation(this._storage[i]);
            this.dequeue();
        }

        setTimeout(() => this.run(), 100);
    }

    async calculation(data: IData): Promise<void> {
        const from: number = (data.progression.length > 0) ?
            data.progression.length : (data.type === 4) ?
            3 : 0;
        const to: number = (data.counter > 0) ?
            MILLION : data.number - (MILLION * data.multiplier);
        const start: number = (data.multiplier === data.counter) ?
            data.data.start : data.number_series + data.data.common;
        const common: number = data.data.common;
        const j: number = (data.type === 4) ? 1 : 0;

        let a: number = 1;
        let b: number = 1;

        for (let i: number = from; i < to + j; i++) {
            if (i === 0) {
                data.progression[i] = start;
            } else {
                const length: number = data.progression.length;
                const last: number = data.progression[length - 1];
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
                        const temp_harmonic: number = data.number_series + common;
                        data.progression[i] = 1 / temp_harmonic;
                        data.number_series = temp_harmonic;
                        break;
                    case 4:
                        let c: number = a + b;
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

const queue: any = new Queue();
queue.run();

export default queue;