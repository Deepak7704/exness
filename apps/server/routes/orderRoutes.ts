import { Router } from "express";
import { openOrderController } from "../controllers/orderController";
import { authenticationMiddleware } from "../middleware/AuthenticationMiddleware";

const orderRoutes = Router();

orderRoutes.post("/open",authenticationMiddleware,openOrderController);

export default orderRoutes