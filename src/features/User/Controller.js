import userService from "./Service.js";

const getMe = async (req, res, next) => {
    try {
        const result = await userService.getCurrentUser(req.user.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const updateMe = async (req, res, next) => {
    try {
        const result = await userService.updateUserById(req.user.id, req.body, req.file);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const updatePassword = async (req, res, next) => {
    try {
        const result = await userService.updatePassword(req.user.id, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const deleteMe = async (req, res, next) => {
    try {
        const result = await userService.deleteUserById(req.user.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const createAddress = async (req, res, next) => {
    try {
        const result = await userService.createAddress(req.user.id, req.body);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getAddresses = async (req, res, next) => {
    try {
        const result = await userService.getAddressesByUserId(req.user.id);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getAddressDetail = async (req, res, next) => {
    try {
        const result = await userService.getAddressById(req.user.id, req.params.addressId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const updateAddress = async (req, res, next) => {
    try {
        const result = await userService.updateAddress(req.user.id, req.params.addressId, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const deleteAddress = async (req, res, next) => {
    try {
        const result = await userService.deleteAddress(req.user.id, req.params.addressId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const updateAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            throw new ResponseError(400, "Avatar file is required");
        }
        const result = await userService.updateAvatar(req.user.id, req.file);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    getMe,
    updateMe,
    updateAvatar,
    updatePassword,
    deleteMe,
    createAddress,
    getAddresses,
    getAddressDetail,
    updateAddress,
    deleteAddress
};
