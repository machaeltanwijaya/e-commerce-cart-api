import Joi from "joi";

export const addToCartSchema = Joi.object({
    productId: Joi.string().uuid().required(),
    quantity: Joi.number().min(1).max(100).required()
});

export const updateCartSchema = Joi.object({
	quantity: Joi.number().integer().min(1).required()
});