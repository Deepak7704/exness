import type { Request, Response } from 'express';
import { Router } from 'express';
import { askAgent } from '../agent';
import type { AuthRequest } from '../middleware/AuthenticationMiddleware';
import { authenticationMiddleware } from '../middleware/AuthenticationMiddleware';

const router = Router();
router.post('/help', authenticationMiddleware, async (req: AuthRequest, res: Response) => {
  try {
    const { message } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        answer: 'Authentication required. Please log in.',
      });
    }

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        answer: 'Invalid request. Message is required.',
      });
    }

    const result = await askAgent(message, userId);
    return res.status(200).json(result);

  } catch (error: any) {
    return res.status(500).json({
      success: false,
      answer: 'An error occurred processing your request.',
      error: error?.message || 'Internal server error',
    });
  }
});
export default router;