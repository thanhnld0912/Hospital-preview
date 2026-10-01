import { idParamSchema } from '../schemas/common.js';
import { serviceCreateSchema, serviceUpdateSchema } from '../schemas/service.js';
import * as medicalServiceService from '../services/medicalServiceService.js';
import { asyncHandler, sendList, sendSuccess } from '../utils/http.js';

export const listServices = asyncHandler(async (_req, res) => {
  const services = await medicalServiceService.listActiveServices();
  sendList(res, services, services.length);
});

export const listAllServices = asyncHandler(async (_req, res) => {
  const services = await medicalServiceService.listAllServices();
  sendList(res, services, services.length);
});

export const getService =asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  sendSuccess(res, await medicalServiceService.getActiveService(id));
});

export const createService = asyncHandler(async (req, res) => {
  const input = serviceCreateSchema.parse(req.body);
  sendSuccess(res, await medicalServiceService.createService(input), 201);
});

export const updateService = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = serviceUpdateSchema.parse(req.body);
  sendSuccess(res, await medicalServiceService.updateService(id, input));
});

export const deleteService = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await medicalServiceService.deleteService(id);
  sendSuccess(res, { id });
});
