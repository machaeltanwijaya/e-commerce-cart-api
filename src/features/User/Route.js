import express from "express";
import userController from "./Controller.js";
import upload from "../../middleware/upload-middleware.js";
import { validate } from "../../middleware/validate-middleware.js";
import { updateUserSchema, updatePasswordSchema, createAddressSchema, updateAddressSchema } from "./Schema.js";
import authMiddleware from "../../middleware/authenticate-middleware.js";

const userRouter = express.Router();
userRouter.use(authMiddleware);

userRouter.get("/me", userController.getMe);
userRouter.patch("/me", upload.single("avatar"), validate(updateUserSchema), userController.updateMe);
userRouter.patch("/me/avatar", upload.single("avatar"), userController.updateAvatar);
userRouter.patch("/me/password", validate(updatePasswordSchema), userController.updatePassword);
userRouter.delete("/me", userController.deleteMe);

userRouter.post("/me/addresses", validate(createAddressSchema), userController.createAddress);
userRouter.get("/me/addresses", userController.getAddresses);
userRouter.get("/me/addresses/:addressId", userController.getAddressDetail);
userRouter.patch("/me/addresses/:addressId", validate(updateAddressSchema), userController.updateAddress);
userRouter.delete("/me/addresses/:addressId", userController.deleteAddress);

export default userRouter;
