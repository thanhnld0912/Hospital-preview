import { siteSettingsUpdateSchema } from '../schemas/siteSettings.js';
import * as siteSettingsService from '../services/siteSettingsService.js';
import { asyncHandler, sendSuccess } from '../utils/http.js';

export const getSiteSettings = asyncHandler(async (_req, res) => {
  sendSuccess(res, await siteSettingsService.getSiteSettings());
});

export const updateSiteSettings = asyncHandler(async (req, res) => {
  const input = siteSettingsUpdateSchema.parse(req.body);
  sendSuccess(res, await siteSettingsService.updateSiteSettings(input));
});
