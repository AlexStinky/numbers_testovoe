require('dotenv').config();

const express = require('express'),
    app = express();

const middlewares = require('./scripts/middlewares');

const { db } = require('./services/db');
const { queue } = require('./services/queue');

const MILLION = 1000000;

app.set('port', process.env.PORT);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/output', async (req, res) => {
    const { ticket } = req.query;
    const data = await db.get(ticket);

    if (data) {
        const response = (data.inProgress) ?
            'Try one more time later' :
            {
                number_series: data.number_series
            };

        res.status(200).send(response);
    } else {
        res.status(400).send('Failed');
    }
});

app.get('/inprogress', async (req, res) => {
    const keys = await db.getAll();

    let list = '';

    for (let i = 0; i < keys.length; i++) {
        const data = await db.get(keys[i]);

        if (data && data.inProgress) {
            list += keys[i] + '\n';
        }
    }

    res.status(200).send(`List of numbers still on progress:\n${list}`);
});

app.post('/input', middlewares.validate, async (req, res) => {
    const { body } = req;
    const multiplier = (body.number > MILLION) ?
        Math.round(body.number / MILLION) : 0;
    const counter = multiplier;
    const data = {
        inProgress: true,
        number_series: 0,
        progression: [],
        multiplier: multiplier,
        counter: counter,
        ...body
    };
    const dbRes = await db.set(data);

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
    const keys = await db.getAll();

    for (let i = 0; i < keys.length; i++) {
        const data = await db.get(keys[i]);

        if (data && data.inProgress && data.data.start) {
            queue.enqueue(data);
        }
    }
})();

module.exports = {
    app
}