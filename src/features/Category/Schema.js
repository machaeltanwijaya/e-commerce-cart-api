import Joi from "joi";

export const createCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100).required(),
	slug: Joi.string().trim().lowercase().optional(),
    description: Joi.string().trim().allow("", null).optional(),
    imageUrl: Joi.string().uri().allow("", null).optional(),
});

export const updateCategorySchema = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    slug: Joi.string().trim().lowercase(),
    description: Joi.string().trim().allow("", null),
    imageUrl: Joi.string().uri().allow("", null),
}).min(1);