import { pool } from '../config/db.js';

export async function findUserByUsername(username) {
  const [rows] = await pool.query(
    'SELECT id, username, password FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0] || null;
}
