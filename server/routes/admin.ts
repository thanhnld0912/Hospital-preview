import { Router } from 'express';
import * as dutyScheduleController from '../controllers/dutyScheduleController.js';
import * as locationController from '../controllers/locationController.js';
import * as postController from '../controllers/postController.js';
import * as serviceController from '../controllers/serviceController.js';
import * as siteSettingsController from '../controllers/siteSettingsController.js';
import * as staffController from '../controllers/staffController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { noStore } from '../middleware/rateLimit.js';

export const adminRouter = Router();

// Phản hồi quản trị (có dữ liệu cá nhân) không được cache
adminRouter.use(noStore, authenticate, requireAdmin);

adminRouter.put('/site-settings', siteSettingsController.updateSiteSettings);

// Danh sách cho trang quản trị: gồm cả mục đang tắt / bản nháp (GET public chỉ trả mục công khai)
adminRouter.get('/locations', locationController.listAllLocations);
adminRouter.get('/posts', postController.listAllPosts);
adminRouter.get('/services', serviceController.listAllServices);
adminRouter.get('/staff', staffController.listAllStaff);
adminRouter.get('/duty-schedules', dutyScheduleController.listDutySchedules);

adminRouter.post('/locations', locationController.createLocation);
adminRouter.put('/locations/:id', locationController.updateLocation);
adminRouter.delete('/locations/:id', locationController.deleteLocation);

adminRouter.post('/posts', postController.createPost);
adminRouter.put('/posts/:id', postController.updatePost);
adminRouter.delete('/posts/:id', postController.deletePost);

adminRouter.post('/services', serviceController.createService);
adminRouter.put('/services/:id', serviceController.updateService);
adminRouter.delete('/services/:id', serviceController.deleteService);

adminRouter.post('/staff', staffController.createStaff);
adminRouter.put('/staff/:id', staffController.updateStaff);
adminRouter.delete('/staff/:id', staffController.deleteStaff);

adminRouter.post('/duty-schedules', dutyScheduleController.createDutySchedule);
adminRouter.put('/duty-schedules/:id', dutyScheduleController.updateDutySchedule);
adminRouter.delete('/duty-schedules/:id', dutyScheduleController.deleteDutySchedule);
