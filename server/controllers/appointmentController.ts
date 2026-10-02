import {
  adminAppointmentListQuerySchema,
  adminAppointmentUpdateSchema,
  appointmentCreateSchema,
  appointmentLookupSchema,
  availabilityQuerySchema,
} from '../schemas/appointment.js';
import { idParamSchema } from '../schemas/common.js';
import * as appointmentService from '../services/appointmentService.js';
import { unauthorized } from '../utils/errors.js';
import { asyncHandler, sendList, sendSuccess } from '../utils/http.js';

// Lưu ý: không log body request ở bất kỳ handler nào (chứa SĐT/CCCD)

export const getBookingOptions = asyncHandler(async (_req, res) => {
  sendSuccess(res, await appointmentService.getBookingOptions());
});

export const getAvailability = asyncHandler(async (req, res) => {
  const { locationId, date } = availabilityQuerySchema.parse(req.query);
  res.setHeader('Cache-Control', 'no-store');
  sendSuccess(res, await appointmentService.getAvailability(locationId, date));
});

export const createAppointment = asyncHandler(async (req, res) => {
  const input = appointmentCreateSchema.parse(req.body);
  sendSuccess(res, await appointmentService.createAppointment(input), 201);
});

export const lookupAppointment = asyncHandler(async (req, res) => {
  const input = appointmentLookupSchema.parse(req.body);
  sendSuccess(res, await appointmentService.lookupAppointment(input));
});

function actorId(user: { id: string } | undefined): string {
  if (!user) throw unauthorized('UNAUTHORIZED', 'Chưa xác thực');
  return user.id;
}

export const listAppointments = asyncHandler(async (req, res) => {
  const filter = adminAppointmentListQuerySchema.parse(req.query);
  const { items, total } = await appointmentService.listAppointments(filter);
  sendList(res, items, total);
});

export const getAppointment = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  sendSuccess(res, await appointmentService.getAppointmentDetail(id, actorId(req.user)));
});

export const revealSensitiveData = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  sendSuccess(res, await appointmentService.revealSensitiveData(id, actorId(req.user)));
});

export const updateAppointment = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = adminAppointmentUpdateSchema.parse(req.body);
  sendSuccess(res, await appointmentService.updateAppointment(id, input, actorId(req.user)));
});

export const deleteAppointment = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await appointmentService.softDeleteAppointment(id, actorId(req.user));
  sendSuccess(res, { id });
});
