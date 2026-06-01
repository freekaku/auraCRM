import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  console.error('[Express Error Handler]:', err);

  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      error: 'Validation Error',
      details: Object.values(err.errors).map((e: any) => e.message),
    });
    return;
  }

  // Handle Mongoose duplicate key error (e.g. non-unique emails)
  if (err.code === 11000) {
    const key = Object.keys(err.keyValue)[0];
    res.status(400).json({
      error: 'Conflict Error',
      message: `A record with this ${key} already exists.`,
    });
    return;
  }

  // General error response
  res.status(statusCode).json({
    error: err.name || 'Server Error',
    message: message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};
