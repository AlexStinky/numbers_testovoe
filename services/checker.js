const Joi = require('joi');

class Checker {
    constructor() {
        this.inputSchema = Joi.object({
            number: Joi.number().integer().min(0).required(),
            type: Joi.number().required(),
            data: {
                start: Joi.number().required(),
                common: Joi.number().required()
            }
        });
    }

    async validate(schema, data) {
        let success = false, message;

        try {
            const value = await schema.validateAsync(data);

            success = true;
            message = 'OK';
        } catch (err) {
            success = false;
            message = `[Validation failed] ${err}`;
        }

        return {
            success: success,
            message: message
        };
    }
}

const checker = new Checker();

module.exports = {
    checker
};