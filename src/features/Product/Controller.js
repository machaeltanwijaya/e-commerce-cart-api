import productService from "./Service.js";

const createProduct = async (req, res, next) => {
    try {
        const result = await productService.create(req.body, req.file);
        res.status(201).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getAllProducts = async (req, res, next) => {
    try {
        const result = await productService.getAll(req.query);
        res.status(200).json({
            data: result.products,
            pagination: result.pagination
        });
    } catch (e) {
        next(e);
    }
};

const getProductById = async (req, res, next) => {
    try {
        const result = await productService.getById(req.params.productId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const getRelatedProducts = async (req, res, next) => {
    try {
        const result = await productService.getRelated(req.params.productId, req.query);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const getProductReviews = async (req, res, next) => {
    try {
        const result = await productService.getReviews(req.params.productId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const updateProduct = async (req, res, next) => {
    try {
        const result = await productService.update(req.params.productId, req.body, req.file);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const toggleProductStatus = async (req, res, next) => {
    try {
        const result = await productService.toggleStatus(req.params.productId, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

const updateProductStock = async (req, res, next) => {
    try {
        const result = await productService.updateStock(req.params.productId, req.body);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
}

const deleteProduct = async (req, res, next) => {
    try {
        const result = await productService.remove(req.params.productId);
        res.status(200).json({
            data: result
        });
    } catch (e) {
        next(e);
    }
};

export default {
    createProduct,
    getAllProducts,
    getProductById,
    getRelatedProducts,
    getProductReviews,
    updateProduct,
	toggleProductStatus,
    updateProductStock,
    deleteProduct
};