export type IData = {
    inProgress: boolean,
    number_series: number,
    progression: [number] | [],
    multiplier: number,
    counter: number,
    number: number,
    type: number,
    data: {
        start: number,
        common: number
    }
    key: string
};

export type IKeys = [number];