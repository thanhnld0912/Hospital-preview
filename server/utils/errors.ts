export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details?: unknown;

  constructor(status: number, code: string, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const notFound = (message: string) => new AppError(404, 'NOT_FOUND', message);
export const unauthorized = (code: string, message: string) => new AppError(401, code, message);
export const forbidden = (message: string) => new AppError(403, 'FORBIDDEN', message);
