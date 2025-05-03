import { Router, RequestHandler } from "express";
import { addSubscription, getSubscriptions, updateSubscription } from "../controllers/subscription.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken as RequestHandler);
router.post('/', addSubscription as RequestHandler);
router.get('/', getSubscriptions as RequestHandler);
router.patch('/:id', updateSubscription as RequestHandler);

export default router;