const { parentPort } = require("worker_threads");

const MILLION = 1000000;
const BILLION = 1000000000;

function calculation(data) {
    const from = (data.type === 4) ?
        3 : 0;
    const to = (data.counter > 0) ?
        MILLION : data.number - (MILLION * data.multiplier);
    const start = (data.multiplier === data.counter) ?
        data.data.start : data.number_series + data.data.common;
    const j = (data.type === 4) ? 1 : 0;

    let common = data.data.common;
    let a = 1;
    let b = 1;

    for(let i = from; i < to + j; i++) {
        if (data.number_series === 0 && i === 0) {
            data.number_series = start;
        } else {
            let last = data.number_series;
            switch (data.type) {
                case 1:
                    data.number_series = last + common;
                    break;
                case 2:
                    last = (data.number_series > BILLION) ?
                        data.number_series / BILLION : data.number_series;
                    common = (data.number_series > BILLION) ?
                        (common / BILLION) : common;
                    data.number_series = last * common;
                    break;
                case 3:
                    data.number_series = last + common;
                    break;
                case 4:
                    let c = a + b;
                    a = b;
                    b = c;
                    data.number_series = (b > BILLION) ? b / BILLION : b;
                    break;
            }
        }
    }

    if (data.counter > 0) {
        data.counter--;

        return calculation(data);
    } else {
        data.inProgress = false;

        if (data.type === 3) {
            data.number_series = 1 / data.number_series;
        }
    }

    return data;
}

parentPort.on("message", async (data) => {
    const result = calculation(data);

    parentPort.postMessage(result);
    process.exit();
});