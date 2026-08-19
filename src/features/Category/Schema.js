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

export const getCategoryQuerySchema = Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    size: Joi.number().integer().min(1).max(100).optional(),
    search: Joi.string().trim().allow("", null).optional(),
    name: Joi.string().trim().allow("", null).optional(),
    sortBy: Joi.string().valid("createdAt", "updatedAt", "name").default("createdAt"),
    sortOrder: Joi.string().valid("asc", "desc").default("desc")
});