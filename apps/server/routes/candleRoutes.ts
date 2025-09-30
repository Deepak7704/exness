import { Router } from 'express';
import { getCandles } from '../controllers/candleController';
import { authenticationMiddleware } from '../middleware/AuthenticationMiddleware';
const candleRoutes = Router();
candleRoutes.get('/:asset_name/:interval', getCandles);

export default candleRoutes;