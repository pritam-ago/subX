import { Router, RequestHandler } from "express";
import { 
    addSubscription, 
    getSubscriptions, 
    getSubscription,
    updateSubscription,
    deleteSubscription 
} from "../controllers/subscription.controller";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken as RequestHandler);
router.post('/', addSubscription as RequestHandler);
router.get('/', getSubscriptions as RequestHandler);
router.get('/:id', getSubscription as RequestHandler);
router.patch('/:id', updateSubscription as RequestHandler);
router.delete('/:id', deleteSubscription as RequestHandler);

export default router;