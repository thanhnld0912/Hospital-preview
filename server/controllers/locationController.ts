import { idParamSchema } from '../schemas/common.js';
import { locationCreateSchema, locationUpdateSchema } from '../schemas/location.js';
import * as locationService from '../services/locationService.js';
import { asyncHandler, sendList, sendSuccess } from '../utils/http.js';

export const listLocations = asyncHandler(async (_req, res) => {
  const locations = await locationService.listActiveLocations();
  sendList(res, locations, locations.length);
});

export const getLocation = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  sendSuccess(res, await locationService.getActiveLocation(id));
});

export const createLocation = asyncHandler(async (req, res) => {
  const input = locationCreateSchema.parse(req.body);
  sendSuccess(res, await locationService.createLocation(input), 201);
});

export const updateLocation = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = locationUpdateSchema.parse(req.body);
  sendSuccess(res, await locationService.updateLocation(id, input));
});

export const deleteLocation = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await locationService.deleteLocation(id);
  sendSuccess(res, { id });
});
