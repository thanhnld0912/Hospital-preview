import { z } from 'zod';
import { POST_STATUSES, POST_TYPES } from '../types/content.js';
import {
  AT_LEAST_ONE_FIELD_MESSAGE,
  colorSchemeSchema,
  hasAtLeastOneField,
  optionalText,
  optionalUrl,
  requiredText,
  slugSchema,
} from './common.js';

const postFields = z.object({
  type: z.enum(POST_TYPES).optional(),
  title: requiredText(300),
  slug: slugSchema,
  excerpt: optionalText(1000),
  content: z.string().max(100_000).optional(),
  thumbnailUrl: optionalUrl,
  thumbnailAlt: optionalText(300),
  category: optionalText(100),
  colorScheme: colorSchemeSchema.optional(),
  author: optionalText(200),
  issuedBy: optionalText(300),
  isUrgent: z.boolean().optional(),
  status: z.enum(POST_STATUSES).optional(),
  publishedAt: z.iso.datetime({ offset: true, message: 'publishedAt phải là ISO 8601' }).nullable().optional(),
});

export const postCreateSchema = postFields;
export const postUpdateSchema = postFields.partial().refine(hasAtLeastOneField, AT_LEAST_ONE_FIELD_MESSAGE);

export const postListQuerySchema = z.object({
  type: z.enum(POST_TYPES).optional(),
  category: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  offset: z.coerce.number().int().min(0).default(0),
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
export type PostListQuery = z.infer<typeof postListQuerySchema>;
