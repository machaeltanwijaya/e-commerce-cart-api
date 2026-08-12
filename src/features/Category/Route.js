import express from "express";
import upload from "../../middleware/upload-middleware.js";
import { validate } from "../../middleware/validate-middleware.js";
import { createCategorySchema, updateCategorySchema } from "./Schema.js";
import categoryController from "./Controller.js";

const categoryRouter = express.Router();

categoryRouter.post("/", upload.single("image"), validate(createCategorySchema), categoryController.createCategory);
categoryRouter.get("/", categoryController.getAllCategories);
categoryRouter.get("/:categoryId", categoryController.getCategoryById);
categoryRouter.get("/slug/:slug", categoryController.getCategoryBySlug);
categoryRouter.patch("/:categoryId", upload.single("image"), validate(updateCategorySchema), categoryController.updateCategory);
categoryRouter.delete("/:categoryId", categoryController.deleteCategory);

export default categoryRouter;