import categoryService from "./Service.js";

const createCategory = async (req, res, next) => {
    try {
        const result = await categoryService.create(req.body, req.file);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getAllCategories = async (req, res, next) => {
    try {
        const result = await categoryService.getAll();
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getCategoryById = async (req, res, next) => {
    try {
        const result = await categoryService.getById(req.params.categoryId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getCategoryBySlug = async (req, res, next) => {
    try {
        const result = await categoryService.getBySlug(req.params.slug);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const updateCategory = async (req, res, next) => {
    try {
        const result = await categoryService.update(req.params.categoryId, req.body, req.file);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const deleteCategory = async (req, res, next) => {
    try {
        const result = await categoryService.remove(req.params.categoryId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    createCategory,
    getAllCategories,
    getCategoryById,
    getCategoryBySlug,
    updateCategory,
    deleteCategory
};