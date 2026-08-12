import authService from "./Service.js";

const register = async (req, res, next) => {
    try {
        const result = await authService.register(req.body, req.file);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.login(req.body);
        res.status(200).json({
            data: result.data,
            token: result.token
        });
    } catch (e) {
        next(e);
    }
};

const logout = async (req, res, next) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/' // Ensure the path matches the one used when setting the cookie
        });
        
        res.status(200).json({
            message: "Logout successful"
        });
    } catch (e) {
        next(e);
    }
};

export default {
    register,
    login,
    logout
};