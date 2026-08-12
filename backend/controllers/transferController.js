import db from '../config/db.js';

export const getTransfers = async (req, res) => {
  const baseId = req.query.baseId ? parseInt(req.query.baseId) : null;
  try {
    const result = await db.query(`
      SELECT t.*, 
             sb.name AS source_base_name, 
             dbase.name AS destination_base_name, 
             et.name AS equipment_name, 
             et.category,
             u.username AS initiator_username
      FROM transfers t
      JOIN bases sb ON t.source_base_id = sb.id
      JOIN bases dbase ON t.destination_base_id = dbase.id
      JOIN equipment_types et ON t.equipment_type_id = et.id
      LEFT JOIN users u ON t.initiated_by = u.id
      WHERE ($1::int IS NULL OR t.source_base_id = $1 OR t.destination_base_id = $1)
      ORDER BY t.timestamp DESC
    `, [baseId]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createTransfer = async (req, res) => {
  const client = await db.getClient();
  try {
    const { sourceBaseId, destinationBaseId, equipmentTypeId, quantity } = req.body;
    const userId = req.user.id;

    if (parseInt(sourceBaseId) === parseInt(destinationBaseId)) {
      return res.status(400).json({ error: "Source and destination bases must be different." });
    }

    await client.query('BEGIN');

    // 1. Verify availability of stock at source base
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
    const balanceResult = await client.query(balanceQuery, [sourceBaseId, equipmentTypeId]);
    const balance = parseInt(balanceResult.rows[0]?.balance || 0);

    if (balance < quantity) {
      throw new Error(`Insufficient inventory at source base. Available balance is ${balance}.`);
    }

    // 2. Insert Transfer Record
    const transferQuery = `
      INSERT INTO transfers (source_base_id, destination_base_id, equipment_type_id, quantity, initiated_by, status)
      VALUES ($1, $2, $3, $4, $5, 'COMPLETED') RETURNING id;
    `;
    const transferRes = await client.query(transferQuery, [sourceBaseId, destinationBaseId, equipmentTypeId, quantity, userId]);

    // 3. Retrieve Names for Audit Details
    const eqResult = await client.query('SELECT name FROM equipment_types WHERE id = $1', [equipmentTypeId]);
    const eqName = eqResult.rows[0]?.name;
    const srcResult = await client.query('SELECT name FROM bases WHERE id = $1', [sourceBaseId]);
    const srcName = srcResult.rows[0]?.name;
    const destResult = await client.query('SELECT name FROM bases WHERE id = $1', [destinationBaseId]);
    const destName = destResult.rows[0]?.name;

    // 4. Log Action in Audit Table
    const auditQuery = `
      INSERT INTO audit_logs (user_id, action, details)
      VALUES ($1, 'TRANSFER', $2);
    `;
    const details = `Transferred ${quantity}x ${eqName} from ${srcName} to ${destName}`;
    await client.query(auditQuery, [userId, details]);

    await client.query('COMMIT');
    res.status(201).json({ message: "Transfer completed successfully", transferId: transferRes.rows[0].id });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: "Transfer failed: " + error.message });
  } finally {
    client.release();
  }
};
