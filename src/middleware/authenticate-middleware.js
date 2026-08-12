import jwt from "jsonwebtoken";
import prisma from "../config/db.js";
import ResponseError from "../error/response-error.js";

const authMiddleware = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ResponseError(401, 'Unauthorized'));
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id }
        });

        if (!user) {
            throw new ResponseError(401, 'Unauthorized');
        }

        delete user.password;
        req.user = user;

        next();
    } catch (e) {
        return next(new ResponseError(401, 'Unauthorized'));
    }
}

export default authMiddleware;