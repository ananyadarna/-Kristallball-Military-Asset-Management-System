import db from '../config/db.js';

export const logAudit = async (userId, action, details) => {
  try {
    await db.query(
      `INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3)`,
      [userId, action, details]
    );
  } catch (err) {
    console.error("Failed to write audit log:", err);
  }
};
