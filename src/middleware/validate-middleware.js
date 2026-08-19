import ResponseError from "../error/response-error.js";

export const validate = (schema, property = "body") => {
    return (req, res, next) => {
        const { value, error } = schema.validate(req[property], {
            abortEarly: false,
            stripUnknown: true,
        });

        if (error) {
            const message = error.details
                .map((detail) => detail.message)
                .join(", ");

            return next(new ResponseError(400, message));
        }

        if (property === "query") {
            Object.keys(req.query).forEach((key) => delete req.query[key]);
            Object.assign(req.query, value);
        } else {
            req[property] = value;
        }

        next();
    };
};