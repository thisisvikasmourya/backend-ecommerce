import { Router } from 'express';
import { healthRoutes } from './health/health.routes.js';
import { authRoutes } from './auth/auth.routes.js';
import { userRoutes } from './users/user.routes.js';
import { addressRoutes } from './addresses/address.routes.js';
import { categoryRoutes } from './categories/category.routes.js';
import { brandRoutes } from './brands/brand.routes.js';
import { productRoutes } from './products/product.routes.js';
import { cartRoutes } from './cart/cart.routes.js';
import { wishlistRoutes } from './wishlist/wishlist.routes.js';
import { inventoryRoutes } from './inventory/inventory.routes.js';
import { orderRoutes } from './orders/order.routes.js';
import { paymentRoutes } from './payments/payment.routes.js';
import { couponRoutes } from './coupons/coupon.routes.js';
import { reviewRoutes } from './reviews/review.routes.js';
import { adminRoutes } from './admin/admin.routes.js';

const router = Router();

// Health Check
router.use('/health', healthRoutes);

// Core Modules
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/addresses', addressRoutes);
router.use('/categories', categoryRoutes);
router.use('/brands', brandRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/wishlist', wishlistRoutes);
router.use('/inventory', inventoryRoutes);
router.use('/orders', orderRoutes);
router.use('/payments', paymentRoutes);
router.use('/coupons', couponRoutes);
router.use('/reviews', reviewRoutes);
router.use('/admin', adminRoutes);

export const apiRouter = router;
