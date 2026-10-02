import { idParamSchema } from '../schemas/common.js';
import { dutyAdminListQuerySchema, dutyCreateSchema, dutyUpdateSchema } from '../schemas/dutySchedule.js';
import * as dutyScheduleService from '../services/dutyScheduleService.js';
import { asyncHandler, sendList, sendSuccess } from '../utils/http.js';

export const getPublicDutySchedules = asyncHandler(async (_req, res) => {
  // Website thăm dò định kỳ (polling) — luôn lấy dữ liệu mới, không cache
  res.setHeader('Cache-Control', 'no-store');
  sendSuccess(res, await dutyScheduleService.getPublicDutySchedules());
});

export const listDutySchedules = asyncHandler(async (req, res) => {
  const filter = dutyAdminListQuerySchema.parse(req.query);
  const schedules = await dutyScheduleService.listDutySchedules(filter);
  sendList(res, schedules, schedules.length);
});

export const createDutySchedule = asyncHandler(async (req, res) => {
  const input = dutyCreateSchema.parse(req.body);
  sendSuccess(res, await dutyScheduleService.createDutySchedule(input), 201);
});

export const updateDutySchedule = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = dutyUpdateSchema.parse(req.body);
  sendSuccess(res, await dutyScheduleService.updateDutySchedule(id, input));
});

export const deleteDutySchedule = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await dutyScheduleService.deleteDutySchedule(id);
  sendSuccess(res, { id });
});
