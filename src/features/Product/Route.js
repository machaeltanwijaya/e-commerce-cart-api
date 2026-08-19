import express from "express";
import upload from "../../middleware/upload-middleware.js";
import { validate } from "../../middleware/validate-middleware.js";
import { createProductSchema, updateProductSchema, toggleProductStatusSchema, updateProductStockSchema } from "./Schema.js";
import productController from "./Controller.js";
import authMiddleware from "../../middleware/authenticate-middleware.js";

const productRouter = express.Router();

productRouter.post("/", authMiddleware, upload.single("image"), validate(createProductSchema), productController.createProduct);
productRouter.get("/", productController.getAllProducts);
productRouter.get("/:productId", productController.getProductById);
productRouter.get("/:productId/related", productController.getRelatedProducts);
productRouter.get("/:productId/reviews", productController.getProductReviews);
productRouter.patch("/:productId", authMiddleware, upload.single("image"), validate(updateProductSchema), productController.updateProduct);
productRouter.patch("/:productId/status", authMiddleware, validate(toggleProductStatusSchema), productController.toggleProductStatus);
productRouter.patch("/:productId/stock", authMiddleware, validate(updateProductStockSchema), productController.updateProductStock);
productRouter.delete("/:productId", authMiddleware, productController.deleteProduct);

export default productRouter;