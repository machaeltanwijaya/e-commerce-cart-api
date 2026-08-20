import "dotenv/config";
import express from "express";

import authRouter from "./features/Auth/Route.js";
import userRouter from "./features/User/Route.js";
import categoryRouter from "./features/Category/Route.js";
import productRouter from "./features/Product/Route.js";
import cartRouter from "./features/Cart/Route.js";

import { errorMiddleware } from "./middleware/error-middleware.js";


const app = express();

app.use(express.json());

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/cart", cartRouter);

app.use(errorMiddleware);

export default app;