import Joi from "joi";
import { Schema } from "joi";

import { IData } from "../types/request";

const BILLION: number = 1000000000;

class Checker {
    public inputSchema: Schema = Joi.object({
        number: Joi.number().integer().min(0).max(BILLION * 10).required(),
        type: Joi.number().required(),
        data: {
            start: Joi.number().required(),
            common: Joi.number().required()
        }
    });

    async validate(schema: Schema, data: IData) {
        let success: boolean = false, message: string;

        try {
            await schema.validateAsync(data);

            success = true;
            message = 'OK';
        } catch (err: any) {
            success = false;
            message = `[Validation failed] ${err}`;
        }

        return {
            success: success,
            message: message
        };
    }
}

const checker: any = new Checker();

export default checker;