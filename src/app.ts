import express from 'express';
import dotenv from 'dotenv';

import { Request, Response } from "express";

dotenv.config();

const app = express();

import * as middlewares from './scripts/middlewares';
import db from './services/db';
import queue from './services/queue';

import { IData, IKeys } from './types/request';

const MILLION = 1000000;

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

app.post('/input', middlewares.validate, async (req: Request, res: Response) => {
    const { body } = req;
    const multiplier: number = (body.number > MILLION) ?
        Math.round(body.number / MILLION) : 0;
    const counter: number = multiplier;
    const data: IData = {
        inProgress: true,
        number_series: 0,
        progression: [],
        multiplier: multiplier,
        counter: counter,
        ...body
    };
    const dbRes: string | null = await db.set(data);

    if (dbRes) {
        queue.enqueue(data);

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
            queue.enqueue(data);
        }
    }
})();

export default app;