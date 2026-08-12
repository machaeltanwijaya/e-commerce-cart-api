import express from "express";
import authController from "./Controller.js";
import upload from "../../middleware/upload-middleware.js";
import { validate } from "../../middleware/validate-middleware.js";
import { registerSchema, loginSchema } from "./Schema.js";
import authMiddleware from "../../middleware/authenticate-middleware.js";

const authRouter = express.Router();

authRouter.post("/register", upload.single("avatar"), validate(registerSchema), authController.register);
authRouter.post("/login", validate(loginSchema), authController.login);
authRouter.post("/logout", authMiddleware, authController.logout);

export default authRouter;
