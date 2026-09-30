import { idParamSchema, slugParamSchema } from '../schemas/common.js';
import { postCreateSchema, postListQuerySchema, postUpdateSchema } from '../schemas/post.js';
import * as postService from '../services/postService.js';
import { asyncHandler, sendList, sendSuccess } from '../utils/http.js';

export const listPosts = asyncHandler(async (req, res) => {
  const filters = postListQuerySchema.parse(req.query);
  const { items, total } = await postService.listPublishedPosts(filters);
  sendList(res, items, total);
});

export const getPostBySlug = asyncHandler(async (req, res) => {
  const { slug } = slugParamSchema.parse(req.params);
  sendSuccess(res, await postService.getPublishedPostBySlug(slug));
});

export const createPost = asyncHandler(async (req, res) => {
  const input = postCreateSchema.parse(req.body);
  sendSuccess(res, await postService.createPost(input), 201);
});

export const updatePost = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  const input = postUpdateSchema.parse(req.body);
  sendSuccess(res, await postService.updatePost(id, input));
});

export const deletePost = asyncHandler(async (req, res) => {
  const { id } = idParamSchema.parse(req.params);
  await postService.deletePost(id);
  sendSuccess(res, { id });
});
