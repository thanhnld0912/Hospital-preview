import { Router } from 'express';
import * as authController from '../controllers/authController.js';
import * as dutyScheduleController from '../controllers/dutyScheduleController.js';
import { health } from '../controllers/healthController.js';
import * as locationController from '../controllers/locationController.js';
import * as postController from '../controllers/postController.js';
import * as serviceController from '../controllers/serviceController.js';
import * as siteSettingsController from '../controllers/siteSettingsController.js';
import * as staffController from '../controllers/staffController.js';
import { authenticate } from '../middleware/auth.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { adminRouter } from './admin.js';

export const apiRouter = Router();

apiRouter.get('/health', health);

// Auth
// Giới hạn đủ rộng cho người dùng thật, chặn dò mật khẩu / spam (đếm theo IP, dùng chung mọi instance)
const loginLimit = rateLimit({
  bucket: 'auth-login',
  windowSeconds: 15 * 60,
  max: 10,
  message: 'Bạn đã thử đăng nhập quá nhiều lần. Vui lòng thử lại sau ít phút.',
});

apiRouter.post('/auth/login', loginLimit, authController.login);
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
apiRouter.get('/duty-schedules', dutyScheduleController.getPublicDutySchedules);

// Quản trị (JWT + ADMIN)
apiRouter.use('/admin', adminRouter);
