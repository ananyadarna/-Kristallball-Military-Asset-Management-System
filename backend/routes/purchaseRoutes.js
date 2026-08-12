import express from 'express';
import { getPurchases, createPurchase } from '../controllers/purchaseController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, enforceBaseScope, getPurchases);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createPurchase);

export default router;
