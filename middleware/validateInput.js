const validateInput = (schema) => {
    return (req, res, next) => {
        const { error, value } = schema.validate(req.body, {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const errorMessages = error.details.map((detail) => detail.message);
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errorMessages,
            });
        }
        req.body = value;
        next();
    };
};

module.exports = validateInput;
