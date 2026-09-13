import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

const formatZodErrors = (error: ZodError) => {
  return error.issues.map((issue) => ({
    field: issue.path.join('.'),
    message: issue.message
  }));
};

export const validateBody = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Dữ liệu yêu cầu không hợp lệ',
        errors: formatZodErrors(result.error),
        data: null
      });
      return;
    }
    // Replace req.body with sanitized and validated data (prevents mass-assignment)
    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.query);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Tham số truy vấn không hợp lệ',
        errors: formatZodErrors(result.error),
        data: null
      });
      return;
    }
    req.query = result.data;
    next();
  };
};

export const validateParams = (schema: ZodSchema<any>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.params);
    if (!result.success) {
      res.status(400).json({
        success: false,
        message: 'Định danh yêu cầu không hợp lệ',
        errors: formatZodErrors(result.error),
        data: null
      });
      return;
    }
    req.params = result.data;
    next();
  };
};
