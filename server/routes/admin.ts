import { Router } from 'express';
import * as locationController from '../controllers/locationController.js';
import * as postController from '../controllers/postController.js';
import * as serviceController from '../controllers/serviceController.js';
import * as siteSettingsController from '../controllers/siteSettingsController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

export const adminRouter = Router();

adminRouter.use(authenticate, requireAdmin);

adminRouter.put('/site-settings', siteSettingsController.updateSiteSettings);

// Danh sách cho trang quản trị: gồm cả mục đang tắt / bản nháp (GET public chỉ trả mục công khai)
adminRouter.get('/locations', locationController.listAllLocations);
adminRouter.get('/posts', postController.listAllPosts);
adminRouter.get('/services', serviceController.listAllServices);

adminRouter.post('/locations', locationController.createLocation);
adminRouter.put('/locations/:id', locationController.updateLocation);
adminRouter.delete('/locations/:id', locationController.deleteLocation);

adminRouter.post('/posts', postController.createPost);
adminRouter.put('/posts/:id', postController.updatePost);
adminRouter.delete('/posts/:id', postController.deletePost);

adminRouter.post('/services', serviceController.createService);
adminRouter.put('/services/:id', serviceController.updateService);
adminRouter.delete('/services/:id', serviceController.deleteService);
