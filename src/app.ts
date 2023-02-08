import dotenv from 'dotenv';

dotenv.config();

import express from 'express';
import { Request, Response } from "express";

import * as middlewares from './scripts/middlewares';
import * as worker from './scripts/worker';

import db from './services/db';

import { IData, IKeys } from './types/request';

const MILLION: number = 1000000;

const app = express();

app.set('port', process.env.PORT);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/output', async (req: Request, res: Response) => {
    const { ticket } = req.query;
    const data = await db.get(ticket as string);

    if (data) {
        const response = (data.inProgress) ?
            'Try one more time later' :
            {
                number_series: data.number_series
            };

        res.status(200).send(response);
    } else {
        res.status(400).send('Not found');
    }
});

app.get('/inprogress', async (req: Request, res: Response) => {
    const keys: IKeys = await db.getAll();

    let list = '';

    for (let i: number = 0; i < keys.length; i++) {
        const data: IData | null = await db.get(keys[i]);

        if (data && data.inProgress) {
            list += keys[i] + '\n';
        }
    }

    res.status(200).send(`List of numbers still on progress:\n${list}`);
});

app.get('/add', async (req: Request, res: Response) => {
    setTimeout(async () => {
        for (let i: number = 0; i < 10000; i++) {
            const num = 100 + i;
            const multiplier: number = (num > MILLION) ?
                Math.round(num / MILLION) : 0;
            const counter: number = multiplier;
            await worker.addWork({
                inProgress: true,
                number_series: 0,
                multiplier: multiplier,
                counter: counter,
                number: num,
                type: 2,
                data: {
                    start: 1,
                    common: 2
                },
                key: (300 + i).toString()
            });
        }
    }, 100);

    res.status(200).send('Numbers added');
});

app.get('/reset', async (req: Request, res: Response) => {
    await db.reset();
    res.status(200).send('DB reset');
});

app.post('/input', middlewares.validate, async (req: Request, res: Response) => {
    const { body } = req;
    const multiplier: number = (body.number > MILLION) ?
        Math.round(body.number / MILLION) : 0;
    const counter: number = multiplier;
    const data: IData = {
        inProgress: true,
        number_series: 0,
        multiplier: multiplier,
        counter: counter,
        ...body
    };
    const dbRes: string | null = await db.set(data);

    if (dbRes) {
        worker.addWork(data);

        res.status(200).send({
            ticket: dbRes
        });
    } else {
        res.status(400).send('Failed');
    }
});

const port = app.get('port');

app.listen(port, () =>
    console.log(`Server started on port ${port}`)
);

(async () => {
    const keys: IKeys = await db.getAll();

    for (let i: number = 0; i < keys.length; i++) {
        const data: IData | null = await db.get(keys[i]);

        if (data && data.inProgress && data.data.start) {
            await worker.addWork(data);
        }
    }
})();

export default app;