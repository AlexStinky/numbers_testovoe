const { checker } = require('../services/checker');

const validate = async (req, res, next) => {
    const { body } = req;

    let response = {
        success: false,
        message: 'Validation failed'
    };

    if (body) {
        response = await checker.validate(checker.inputSchema, body);

        if (response.success) {
            return next();
        }
    }

    res.send(response);
}

module.exports = {
    validate
}