import { Router } from 'express';
import {
    listProductsCtrl,
    getProductCtrl,
    createProductManualCtrl,  // ← Baru
    createProductTikTokCtrl,  // ← Baru
    updateProductCtrl,
    deleteProductCtrl,
    findProductCtrl,
} from '../controllers/products.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { uploadProductPhoto } from '../middlewares/upload.js';

const r = Router();

// Public Routes
r.get('/', listProductsCtrl);
r.get('/:id', getProductCtrl);
r.post('/find', findProductCtrl);

// Protected Routes
r.post('/add-product/manual', requireAuth, uploadProductPhoto, createProductManualCtrl);  // ← Upload file
r.post('/add-product/tiktok', requireAuth, createProductTikTokCtrl);  // ← JSON biasa
r.patch('/:id', requireAuth, updateProductCtrl);
r.delete('/:id', requireAuth, deleteProductCtrl);

export default r;