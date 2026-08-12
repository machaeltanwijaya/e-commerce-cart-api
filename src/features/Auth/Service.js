import bcrypt from "bcrypt";
import prisma from "../../config/db.js";
import ResponseError from "../../error/response-error.js";
import userService from "../User/Service.js";
import generateToken from "../../utils/generate-token.js";

const register = async (userData, file) => {
    return userService.createUser(userData, file);
};

const login = async (userCredential) => {
    const user = await prisma.user.findUnique({
        where: { email: userCredential.email.toLowerCase() }
    });

    if (!user) {
        throw new ResponseError(400, "Invalid Email or Password");
    }

    const isPasswordValid = await bcrypt.compare(userCredential.password, user.password);

    if (!isPasswordValid) {
        throw new ResponseError(400, "Invalid Email or Password");
    }

    const token = generateToken(user);

    return {
        token: token,
        data: {
            id: user.id,
            name: user.name,
            email: user.email
        }
    };
};

export default {
    register,
    login
};