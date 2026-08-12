import express from 'express';
import { getTransfers, createTransfer } from '../controllers/transferController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.get('/', authenticateToken, enforceBaseScope, getTransfers);
router.post('/', authenticateToken, authorizeRoles('ADMIN', 'LOGISTICS_OFFICER'), createTransfer);

export default router;
