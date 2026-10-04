import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const requestIdMiddleware = (req: Request, res: Response, next: NextFunction) => {
  (req as any).id = req.headers['x-request-id'] as string || crypto.randomUUID();
  res.setHeader('X-Request-ID', (req as any).id);
  next();
};

export const globalErrorHandler = (err: any, req: Request, res: Response, _next: NextFunction) => {
  const statusCode = err.status || err.statusCode || 500;
  const reqId = (req as any).id || 'unknown';
  
  // Safe default message
  let message = 'Something went wrong. Please try again.';
  let code = 'INTERNAL_SERVER_ERROR';

  if (statusCode < 500) {
    // Client errors (4xx) are generally safe to pass through, but we ensure we format them consistently
    message = err.message || 'Bad Request';
    code = err.code || 'BAD_REQUEST';
  } else {
    // 5xx Server errors - NEVER expose implementation details
    // Log detailed diagnostics internally
    console.error(`[ERROR] [ReqID: ${reqId}] ${req.method} ${req.url} - ${err.name}: ${err.message}`);
    console.error(`[ERROR_STACK] [ReqID: ${reqId}]`, err.stack);
    
    // In production, we obscure 500 errors
    if (process.env.NODE_ENV !== 'development') {
      message = 'Our servers couldn\'t complete this request.';
      code = 'INTERNAL_SERVER_ERROR';
    } else {
      message = err.message;
      code = err.code || 'INTERNAL_SERVER_ERROR';
    }
  }

  // Consistent API error response format
  res.status(statusCode).json({
    success: false,
    error: {
      code,
      message,
      requestId: reqId
    }
  });
};
