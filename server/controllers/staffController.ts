import { idParamSchema } from '../schemas/common.js';
import { staffCreateSchema, staffUpdateSchema } from '../schemas/staff.js';
import * as staffService from '../services/staffService.js';
import { asyncHandler, sendList, sendSuccess } from '../utils/http.js';

export const listStaff = asyncHandler(async (_req, res) => {
  const staff = await staffService.listActiveStaff();
  sendList(res, staff, staff.length);
});

export const listAllStaff = asyncHandler(async (_req, res) => {
  const staff = await staffService.listAllStaff();
  sendList(res, staff, staff.length);
});

export const createStaff = asyncHandler(async (req, res) => {
  const input = staffCreateSchema.parse(req.body);
  sendSuccess(res, await staffService.createStaff(input), 201);
});

export const updateStaff = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = staffUpdateSchema.parse(req.body);
  sendSuccess(res, await staffService.updateStaff(id, input));
});

export const deleteStaff = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await staffService.deleteStaff(id);
  sendSuccess(res, { id });
});
