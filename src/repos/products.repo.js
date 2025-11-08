import { pool } from '../config/db.js';

/** List products dengan pagination & keyword optional */
export async function listProducts({ page = 1, pageSize = 10, q = '' }) {
  const limit = Math.max(1, Math.min(Number(pageSize) || 10, 100));
  const offset = Math.max(0, (Number(page) || 1) - 1) * limit;
  const kw = `%${q}%`;

  const [rows] = await pool.query(
    `SELECT product_id, product_name, product_price, product_photo, product_link
     FROM products
     WHERE (? = '' OR product_name LIKE ?)
     ORDER BY product_id DESC
     LIMIT ? OFFSET ?`,
    [q ? 'x' : '', kw, limit, offset]
  );

  const [[{ total } = { total: 0 }]] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM products
     WHERE (? = '' OR product_name LIKE ?)`,
    [q ? 'x' : '', kw]
  );

  return { data: rows, meta: { page: Number(page) || 1, pageSize: limit, total } };
}

/** Ambil satu product by id */
export async function getProductById(id) {
  const [rows] = await pool.query(
    `SELECT product_id, product_name, product_price, product_photo, product_link
     FROM products WHERE product_id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

/** Insert product baru */
export async function createProduct({ product_name, product_price, product_photo, product_link, product_category }) {
  const [res] = await pool.query(
    `INSERT INTO products (product_name, product_price, product_photo, product_link, product_category)
     VALUES (?, ?, ?, ?)`,
    [product_name, product_price, product_photo, product_link, product_category]
  );
  return await getProductById(res.insertId);
}

/** Update sebagian kolom (PATCH) */
export async function updateProduct(id, patch) {
  // Build set clause dinamis
  const fields = [];
  const values = [];
  for (const [k, v] of Object.entries(patch)) {
    fields.push(`${k} = ?`);
    values.push(v);
  }
  if (fields.length === 0) return await getProductById(id);

  values.push(id);
  await pool.query(`UPDATE products SET ${fields.join(', ')} WHERE product_id = ?`, values);
  return await getProductById(id);
}

/** Hapus product */
export async function deleteProduct(id) {
  const [res] = await pool.query(`DELETE FROM products WHERE product_id = ?`, [id]);
  return res.affectedRows > 0;
}
