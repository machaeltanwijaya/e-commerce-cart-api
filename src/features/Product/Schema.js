import Joi from "joi";

export const createProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
    description: Joi.string().trim().allow("", null).optional(),
    price: Joi.number().positive().required(),
    stock: Joi.number().integer().min(0).default(0),
    categoryId: Joi.string().uuid().required(),
    isActive: Joi.boolean().default(true)
});

export const updateProductSchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().allow("", null),
    price: Joi.number().positive(),
    stock: Joi.number().integer().min(0),
    categoryId: Joi.string().uuid(),
    isActive: Joi.boolean()
}).min(1);

export const toggleProductStatusSchema = Joi.object({
    isActive: Joi.boolean().required()
});

export const updateProductStockSchema = Joi.object({
    stock: Joi.number().integer().min(0).required()
});