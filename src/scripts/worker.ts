import { Worker } from 'worker_threads';

import db from '../services/db';

import { IData } from '../types/request';

export const addWork: any = ((data: IData) => {
    return new Promise((resolve) => {
        const worker = new Worker("./scripts/worker.js");
        worker.postMessage(data);
        worker.once("message", async (result: IData) => {
            await db.set(result);

            resolve(true);
        });
    });
});