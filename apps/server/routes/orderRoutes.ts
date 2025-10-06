import { Router } from "express";
import { openOrderController,closeOrderController, getClosedOrdersController, getOpenOrdersController } from "../controllers/orderController";
import { authenticationMiddleware } from "../middleware/AuthenticationMiddleware";

const orderRoutes = Router();

orderRoutes.post("/open",authenticationMiddleware,openOrderController);
orderRoutes.post("/close",authenticationMiddleware,closeOrderController);
orderRoutes.get("/open",authenticationMiddleware,getOpenOrdersController);
orderRoutes.get("/close",authenticationMiddleware,getClosedOrdersController)

export default orderRoutes