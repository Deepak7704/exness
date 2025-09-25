import { Router } from "express";
import { signup,signin,getUser, getBalance } from "../controllers/userController";
import { authenticationMiddleware } from "../middleware/AuthenticationMiddleware";

const router = Router();
router.post("/signup",signup);
router.post("/signin",signin);
router.get("/me",authenticationMiddleware,getUser);
router.get("/balance",authenticationMiddleware,getBalance);

export default router;