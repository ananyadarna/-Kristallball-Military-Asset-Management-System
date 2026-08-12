import db from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const getDashboardMetrics = async (req, res) => {
  const baseId = req.query.baseId ? parseInt(req.query.baseId) : null;

  try {
    const summaryQuery = `
      SELECT 
        COALESCE(SUM(p.quantity), 0) AS purchases,
        COALESCE(SUM(ti.quantity), 0) AS transfers_in,
        COALESCE(SUM(to_sum.quantity), 0) AS transfers_out,
        COALESCE(SUM(a.quantity), 0) AS assigned,
        COALESCE(SUM(e.quantity), 0) AS expended
      FROM (SELECT 1) dummy
      LEFT JOIN (SELECT quantity FROM purchases WHERE $1::int IS NULL OR base_id = $1) p ON true
      LEFT JOIN (SELECT quantity FROM transfers WHERE ($1::int IS NULL OR destination_base_id = $1) AND status = 'COMPLETED') ti ON true
      LEFT JOIN (SELECT quantity FROM transfers WHERE ($1::int IS NULL OR source_base_id = $1) AND status = 'COMPLETED') to_sum ON true
      LEFT JOIN (SELECT quantity FROM assignments WHERE $1::int IS NULL OR base_id = $1) a ON true
      LEFT JOIN (SELECT quantity FROM expenditures WHERE $1::int IS NULL OR base_id = $1) e ON true;
    `;

    const summaryResult = await db.query(summaryQuery, [baseId]);
    const summary = summaryResult.rows[0];

    const purchases = parseInt(summary.purchases);
    const transfersIn = parseInt(summary.transfers_in);
    const transfersOut = parseInt(summary.transfers_out);
    const assigned = parseInt(summary.assigned);
    const expended = parseInt(summary.expended);

    const netMovement = purchases + transfersIn - transfersOut;
    const closingBalance = netMovement - assigned - expended;

    // Fetch individual asset balances
    const assetQuery = `
      SELECT 
        et.id,
        et.name,
        et.category,
        COALESCE(p.total, 0) AS purchases,
        COALESCE(ti.total, 0) AS transfers_in,
        COALESCE(to_sum.total, 0) AS transfers_out,
        COALESCE(a.total, 0) AS assigned,
        COALESCE(e.total, 0) AS expended,
        (COALESCE(p.total, 0) + COALESCE(ti.total, 0) - COALESCE(to_sum.total, 0)) AS net_movement,
        (COALESCE(p.total, 0) + COALESCE(ti.total, 0) - COALESCE(to_sum.total, 0) - COALESCE(a.total, 0) - COALESCE(e.total, 0)) AS closing_balance
      FROM equipment_types et
      LEFT JOIN (
        SELECT equipment_type_id, SUM(quantity) AS total FROM purchases WHERE $1::int IS NULL OR base_id = $1 GROUP BY equipment_type_id
      ) p ON p.equipment_type_id = et.id
      LEFT JOIN (
        SELECT equipment_type_id, SUM(quantity) AS total FROM transfers WHERE ($1::int IS NULL OR destination_base_id = $1) AND status = 'COMPLETED' GROUP BY equipment_type_id
      ) ti ON ti.equipment_type_id = et.id
      LEFT JOIN (
        SELECT equipment_type_id, SUM(quantity) AS total FROM transfers WHERE ($1::int IS NULL OR source_base_id = $1) AND status = 'COMPLETED' GROUP BY equipment_type_id
      ) to_sum ON to_sum.equipment_type_id = et.id
      LEFT JOIN (
        SELECT equipment_type_id, SUM(quantity) AS total FROM assignments WHERE $1::int IS NULL OR base_id = $1 GROUP BY equipment_type_id
      ) a ON a.equipment_type_id = et.id
      LEFT JOIN (
        SELECT equipment_type_id, SUM(quantity) AS total FROM expenditures WHERE $1::int IS NULL OR base_id = $1 GROUP BY equipment_type_id
      ) e ON e.equipment_type_id = et.id;
    `;

    const assetsResult = await db.query(assetQuery, [baseId]);

    res.json({
      summary: {
        openingBalance: 0,
        purchases,
        transfersIn,
        transfersOut,
        netMovement,
        assigned,
        expended,
        closingBalance
      },
      assets: assetsResult.rows
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getBases = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM bases ORDER BY name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getEquipmentTypes = async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM equipment_types ORDER BY category, name');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAuditLogs = async (req, res) => {
  try {
    const result = await db.query(`
      SELECT a.*, u.username, u.role
      FROM audit_logs a
      LEFT JOIN users u ON a.user_id = u.id
      ORDER BY a.created_at DESC
    `);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAssignments = async (req, res) => {
  const baseId = req.query.baseId ? parseInt(req.query.baseId) : null;
  try {
    const result = await db.query(`
      SELECT a.*, b.name AS base_name, et.name AS equipment_name, et.category
      FROM assignments a
      JOIN bases b ON a.base_id = b.id
      JOIN equipment_types et ON a.equipment_type_id = et.id
      WHERE ($1::int IS NULL OR a.base_id = $1)
      ORDER BY a.created_at DESC
    `, [baseId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAssignment = async (req, res) => {
  const { baseId, equipmentTypeId, quantity, assignedTo } = req.body;
  const userId = req.user.id;

  try {
    // 1. Verify availability of stock before assigning
    const balanceQuery = `
      SELECT 
        (COALESCE(p.total, 0) + COALESCE(ti.total, 0) - COALESCE(to_sum.total, 0) - COALESCE(a.total, 0) - COALESCE(e.total, 0)) AS balance
      FROM (SELECT 1) dummy
      LEFT JOIN (SELECT SUM(quantity) AS total FROM purchases WHERE base_id = $1 AND equipment_type_id = $2) p ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM transfers WHERE destination_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED') ti ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM transfers WHERE source_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED') to_sum ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM assignments WHERE base_id = $1 AND equipment_type_id = $2) a ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM expenditures WHERE base_id = $1 AND equipment_type_id = $2) e ON true;
    `;
    
    const balanceResult = await db.query(balanceQuery, [baseId, equipmentTypeId]);
    const balance = parseInt(balanceResult.rows[0]?.balance || 0);

    if (balance < quantity) {
      return res.status(400).json({ message: `Insufficient inventory. Available balance is ${balance}.` });
    }

    // 2. Create assignment
    const insertQuery = `
      INSERT INTO assignments (base_id, equipment_type_id, quantity, assigned_to)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const result = await db.query(insertQuery, [baseId, equipmentTypeId, quantity, assignedTo]);
    const assignment = result.rows[0];

    // 3. Log audit event
    const eqResult = await db.query('SELECT name FROM equipment_types WHERE id = $1', [equipmentTypeId]);
    const eqName = eqResult.rows[0]?.name;
    const baseResult = await db.query('SELECT name FROM bases WHERE id = $1', [baseId]);
    const baseName = baseResult.rows[0]?.name;

    await logAudit(userId, 'ASSIGNMENT', `Assigned ${quantity}x ${eqName} to ${assignedTo} at ${baseName}`);

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getExpenditures = async (req, res) => {
  const baseId = req.query.baseId ? parseInt(req.query.baseId) : null;
  try {
    const result = await db.query(`
      SELECT e.*, b.name AS base_name, et.name AS equipment_name, et.category
      FROM expenditures e
      JOIN bases b ON e.base_id = b.id
      JOIN equipment_types et ON e.equipment_type_id = et.id
      WHERE ($1::int IS NULL OR e.base_id = $1)
      ORDER BY e.created_at DESC
    `, [baseId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createExpenditure = async (req, res) => {
  const { baseId, equipmentTypeId, quantity, reason } = req.body;
  const userId = req.user.id;

  try {
    // 1. Verify availability before expenditure
    const balanceQuery = `
      SELECT 
        (COALESCE(p.total, 0) + COALESCE(ti.total, 0) - COALESCE(to_sum.total, 0) - COALESCE(a.total, 0) - COALESCE(e.total, 0)) AS balance
      FROM (SELECT 1) dummy
      LEFT JOIN (SELECT SUM(quantity) AS total FROM purchases WHERE base_id = $1 AND equipment_type_id = $2) p ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM transfers WHERE destination_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED') ti ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM transfers WHERE source_base_id = $1 AND equipment_type_id = $2 AND status = 'COMPLETED') to_sum ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM assignments WHERE base_id = $1 AND equipment_type_id = $2) a ON true
      LEFT JOIN (SELECT SUM(quantity) AS total FROM expenditures WHERE base_id = $1 AND equipment_type_id = $2) e ON true;
    `;
    
    const balanceResult = await db.query(balanceQuery, [baseId, equipmentTypeId]);
    const balance = parseInt(balanceResult.rows[0]?.balance || 0);

    if (balance < quantity) {
      return res.status(400).json({ message: `Insufficient inventory. Available balance is ${balance}.` });
    }

    // 2. Create expenditure
    const insertQuery = `
      INSERT INTO expenditures (base_id, equipment_type_id, quantity, reason)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `;
    const result = await db.query(insertQuery, [baseId, equipmentTypeId, quantity, reason]);
    const expenditure = result.rows[0];

    // 3. Log audit event
    const eqResult = await db.query('SELECT name FROM equipment_types WHERE id = $1', [equipmentTypeId]);
    const eqName = eqResult.rows[0]?.name;
    const baseResult = await db.query('SELECT name FROM bases WHERE id = $1', [baseId]);
    const baseName = baseResult.rows[0]?.name;

    await logAudit(userId, 'EXPENDITURE', `Expended ${quantity}x ${eqName} at ${baseName} (Reason: ${reason})`);

    res.status(201).json(expenditure);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
