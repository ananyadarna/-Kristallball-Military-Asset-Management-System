import express from 'express';
import { 
  getDashboardMetrics, 
  getBases, 
  getEquipmentTypes, 
  getAuditLogs,
  getAssignments,
  createAssignment,
  getExpenditures,
  createExpenditure
} from '../controllers/assetController.js';
import { authenticateToken } from '../middlewares/authMiddleware.js';
import { authorizeRoles, enforceBaseScope } from '../middlewares/rbacMiddleware.js';

const router = express.Router();

router.get('/metrics', authenticateToken, enforceBaseScope, getDashboardMetrics);
router.get('/bases', authenticateToken, getBases);
router.get('/equipment-types', authenticateToken, getEquipmentTypes);
router.get('/audit-logs', authenticateToken, authorizeRoles('ADMIN'), getAuditLogs);

router.get('/assignments', authenticateToken, enforceBaseScope, getAssignments);
router.post('/assignments', authenticateToken, authorizeRoles('ADMIN', 'BASE_COMMANDER'), createAssignment);

router.get('/expenditures', authenticateToken, enforceBaseScope, getExpenditures);
router.post('/expenditures', authenticateToken, authorizeRoles('ADMIN', 'BASE_COMMANDER'), createExpenditure);

export default router;
