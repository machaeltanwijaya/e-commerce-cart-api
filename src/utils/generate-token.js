import jwt from "jsonwebtoken";

function generateToken (user) {
    const payload = {
        id: user.id
    }

    const secret = process.env.JWT_SECRET;

    const options = {
        expiresIn: '1d'
    }

    return jwt.sign(payload, secret, options);
}

export default generateToken;