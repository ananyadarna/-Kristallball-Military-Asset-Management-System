import db from '../config/db.js';
import { logAudit } from '../middlewares/loggerMiddleware.js';

export const getPurchases = async (req, res) => {
  const baseId = req.query.baseId ? parseInt(req.query.baseId) : null;
  try {
    const result = await db.query(`
      SELECT p.*, b.name AS base_name, et.name AS equipment_name, et.category
      FROM purchases p
      JOIN bases b ON p.base_id = b.id
      JOIN equipment_types et ON p.equipment_type_id = et.id
      WHERE ($1::int IS NULL OR p.base_id = $1)
      ORDER BY p.created_at DESC
    `, [baseId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createPurchase = async (req, res) => {
  const { baseId, equipmentTypeId, quantity } = req.body;
  const userId = req.user.id;

  try {
    const result = await db.query(`
      INSERT INTO purchases (base_id, equipment_type_id, quantity)
      VALUES ($1, $2, $3) RETURNING *
    `, [baseId, equipmentTypeId, quantity]);
    const purchase = result.rows[0];

    // Log audit
    const eqResult = await db.query('SELECT name FROM equipment_types WHERE id = $1', [equipmentTypeId]);
    const eqName = eqResult.rows[0]?.name;
    const baseResult = await db.query('SELECT name FROM bases WHERE id = $1', [baseId]);
    const baseName = baseResult.rows[0]?.name;

    await logAudit(userId, 'PURCHASE', `Purchased ${quantity}x ${eqName} for ${baseName}`);

    res.status(201).json(purchase);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
