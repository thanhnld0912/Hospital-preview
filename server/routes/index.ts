import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import { health } from '../controllers/healthController.js';
import * as locationController from '../controllers/locationController.js';
import * as postController from '../controllers/postController.js';
import * as serviceController from '../controllers/serviceController.js';
import * as siteSettingsController from '../controllers/siteSettingsController.js';
import * as staffController from '../controllers/staffController.js';
import { authenticate } from '../middleware/auth.js';
import { adminRouter } from './admin.js';

export const apiRouter = Router();

apiRouter.get('/health', health);

// Auth
apiRouter.post('/auth/login', authController.login);
apiRouter.get('/auth/me', authenticate, authController.me);

// Public (không cần JWT)
apiRouter.get('/site-settings', siteSettingsController.getSiteSettings);
apiRouter.get('/locations', locationController.listLocations);
apiRouter.get('/locations/:id', locationController.getLocation);
apiRouter.get('/posts', postController.listPosts);
apiRouter.get('/posts/:slug', postController.getPostBySlug);
apiRouter.get('/services', serviceController.listServices);
apiRouter.get('/services/:id', serviceController.getService);
apiRouter.get('/staff', staffController.listStaff);

// Quản trị (JWT + ADMIN)
apiRouter.use('/admin', adminRouter);
