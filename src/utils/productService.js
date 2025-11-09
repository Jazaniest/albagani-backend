import fs from 'fs/promises';
import path from 'path';
import { getProductById, deleteProduct } from '../repo/productRepo.js';

const UPLOAD_DIR = path.resolve(__dirname, '../../uploads/products');

async function existsPath(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

export async function deleteProductService(id) {
  const product = await getProductById(id);
  if (!product) return { ok: false, reason: 'not_found' };

  const deletedDb = await deleteProduct(id);
  if (!deletedDb) return { ok: false, reason: 'not_deleted_db' };

  const photo = product.product_photo;
  if (!photo) return { ok: true, fileDeleted: false, note: 'no_photo_field' };

  const lastSeg = photo.split('/').pop() || '';
  const filename = lastSeg.split('?')[0];

  if (!filename) return { ok: true, fileDeleted: false, note: 'no_filename' };

  const full = path.join(UPLOAD_DIR, filename);
  const normalized = path.normalize(full);

  const uploadDirNormalized = path.normalize(UPLOAD_DIR) + path.sep;
  if (!(normalized.startsWith(uploadDirNormalized) || normalized === path.normalize(UPLOAD_DIR))) {
    return { ok: true, fileDeleted: false, note: 'external_or_invalid_path' };
  }

  try {
    const exists = await existsPath(normalized);
    if (!exists) {
      return { ok: true, fileDeleted: false, note: 'file_not_found' };
    }

    await fs.unlink(normalized);
    return { ok: true, fileDeleted: true };
  } catch (err) {
    console.error(`Failed to unlink product file "${normalized}":`, err);
    return { ok: true, fileDeleted: false, note: 'unlink_failed', error: err.message };
  }
}
