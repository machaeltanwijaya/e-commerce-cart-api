import Joi from "joi";

export const updateUserSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    email: Joi.string().trim().lowercase().email()
}).min(1);

export const updatePasswordSchema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(72).required()
});

export const createAddressSchema = Joi.object({
    label: Joi.string().required().trim(),
    recipient: Joi.string().required().trim(),
    phone: Joi.string().required().trim(),
    street: Joi.string().required().trim(),
    city: Joi.string().required().trim(),
    province: Joi.string().required().trim(),
    postalCode: Joi.string().required().trim(),
});

export const updateAddressSchema = Joi.object({
    label: Joi.string().trim(),
    recipient: Joi.string().trim(),
    phone: Joi.string().trim(),
    street: Joi.string().trim(),
    city: Joi.string().trim(),
    province: Joi.string().trim(),
    postalCode: Joi.string().trim(),
}).min(1);
