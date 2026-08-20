import express from "express";
import { validate } from "../../middleware/validate-middleware.js";
import { addToCartSchema, updateCartSchema } from "./Schema.js";
import cartController from "./Controller.js";
import authMiddleware from "../../middleware/authenticate-middleware.js";

const cartRouter = express.Router();

cartRouter.use(authMiddleware);

cartRouter.get("/", cartController.getCartDetail);
cartRouter.get("/count", cartController.getCartCount);
cartRouter.post("/items", validate(addToCartSchema), cartController.addToCart);
cartRouter.post("/items/:productId/save-for-later", cartController.saveForLater);
cartRouter.patch("/items/:productId", validate(updateCartSchema), cartController.updateQuantity);
cartRouter.delete("/items/:productId", cartController.removeCartItem);
cartRouter.delete("/", cartController.removeAllItem);

export default cartRouter;