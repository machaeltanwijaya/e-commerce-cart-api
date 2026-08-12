import bcrypt from "bcrypt";
import prisma from "../../config/db.js";
import ResponseError from "../../error/response-error.js";
import { uploadToCloudinary, deleteFromCloudinary } from "../../utils/cloudinary-helper.js";

const toUserResponse = (user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl
});

export const getUserOrThrow = async (userId) => {
    const user = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!user) {
        throw new ResponseError(404, "User not found");
    }

    return user;
}

const getCurrentUser = async (userId) => {
    const user = await getUserOrThrow(userId);

    return toUserResponse(user);
}

const updatePassword = async (userId, payload) => {
    const { oldPassword, newPassword } = payload;

    if (oldPassword === newPassword) {
        throw new ResponseError(400, "New password cannot be the same as the old password");
    }

    const user = await getUserOrThrow(userId);

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);

    if (!isPasswordValid) {
        throw new ResponseError(400, "Current password is incorrect");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword }
    });

    return {
        message: "Password updated successfully"
    };
};

const createUser = async (userData, file) => {
    const userExists = await prisma.user.findUnique({
        where: { email: userData.email }
    });

    if (userExists) {
        throw new ResponseError(400, "User already exists");
    }

    let avatarUrl = null;
    let avatarPublicId = null;

    if (file) {
        const uploaded = await uploadToCloudinary(file.path, "avatars");
        avatarUrl = uploaded.url;
        avatarPublicId = uploaded.publicId;
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const newUser = await prisma.user.create({
        data: {
            ...userData,
            password: hashedPassword,
            avatarUrl,
            avatarPublicId
        }
    });

    return toUserResponse(newUser);
}

const updateUserById = async (userId, payload, file) => {
    // Verify user exists first to throw 404
    const user = await getUserOrThrow(userId);

    const updates = {};

    if (payload.name !== undefined) {
        updates.name = payload.name;
    }

    if (payload.email !== undefined) {
        const emailTaken = await prisma.user.findFirst({
            where: {
                email: payload.email,
                id: { not: userId }
            }
        });

        if (emailTaken) {
            throw new ResponseError(400, "Email already taken");
        }

        updates.email = payload.email;
    }

    if (file) {
        if (user.avatarPublicId) {
            await deleteFromCloudinary(user.avatarPublicId);
        }

        const uploaded = await uploadToCloudinary(file.path, "avatars");
        updates.avatarUrl = uploaded.url;
        updates.avatarPublicId = uploaded.publicId;
    }

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: updates
    });

    return toUserResponse(updatedUser);
};

const deleteUserById = async (userId) => {
    // Verify user exists first to throw 404
    await getUserOrThrow(userId);

    await prisma.user.delete({
        where: { id: userId }
    });

    return {
        message: "User deleted successfully"
    };
}

const createAddress = async (userId, payload) => {
    await getUserOrThrow(userId);

    return await prisma.address.create({
        data: {
            userId: userId,
            ...payload
        }
    });
};

const getAddressesByUserId = async (userId) => {
    await getUserOrThrow(userId);

    return await prisma.address.findMany({
        where: { userId: userId }
    });
};

const getAddressById = async (userId, addressId) => {
    await getUserOrThrow(userId);

    const address = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId: userId
        }
    });

    if (!address) {
        throw new ResponseError(404, "Address not found");
    }

    return address;
};

const updateAddress = async (userId, addressId, payload) => {
    await getUserOrThrow(userId);

    const address = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId: userId
        }
    });

    if (!address) {
        throw new ResponseError(404, "Address not found");
    }

    return await prisma.address.update({
        where: { id: addressId },
        data: payload
    });
};

const deleteAddress = async (userId, addressId) => {
    await getUserOrThrow(userId);

    const address = await prisma.address.findFirst({
        where: {
            id: addressId,
            userId: userId
        }
    });

    if (!address) {
        throw new ResponseError(404, "Address not found");
    }

    await prisma.address.delete({
        where: { id: addressId }
    });

    return {
        message: "Address deleted successfully"
    };
}
    
const updateAvatar = async (userId, file) => {
    const user = await getUserOrThrow(userId);

    if (user.avatarPublicId) {
        await deleteFromCloudinary(user.avatarPublicId);
    }

    const uploaded = await uploadToCloudinary(file.path, "avatars");

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            avatarUrl: uploaded.url,
            avatarPublicId: uploaded.publicId
        }
    });

    return toUserResponse(updatedUser);
};

export default {
    createUser,
    getCurrentUser,
    updatePassword,
    updateUserById,
    updateAvatar,
    deleteUserById,
    createAddress,
    getAddressesByUserId,
    getAddressById,
    updateAddress,
    deleteAddress
};
