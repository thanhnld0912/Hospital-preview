import type { NextFunction, Request, RequestHandler, Response } from 'express';

type AsyncRequestHandler = (req: Request, res: Response, next: NextFunction) => Promise<void>;

/** Express 4 không tự bắt lỗi của async handler — chuyển lỗi về error handler tập trung */
export function asyncHandler(handler: AsyncRequestHandler): RequestHandler {
  return (req, res, next) => {
    handler(req, res, next).catch(next);
  };
}

export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json({ success: true, data });
}

export function sendList<T>(res: Response, data: T[], total: number): void {
  res.status(200).json({ success: true, data, meta: { total } });
}
