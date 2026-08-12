import ResponseError from "../error/response-error.js";

export const errorMiddleware = (err, req, res, next) => {
    if (err instanceof ResponseError) {
        return res.status(err.status).json({ error: err.message });
    }

    console.error("Unhandled Error Details:", err);
    res.status(500).json({ error: "Internal Server Error" });
};