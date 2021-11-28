import { Response, Request, NextFunction } from 'express';
import langs from '../constants/langs';

export interface expressHandler {
  params?: object;
  preValidatorMiddlewares?: Array<(req: Request, res: Response, next: NextFunction) => any>;
  customMiddleWares?: Array<(req: Request, res: Response, next: NextFunction) => any>;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'UPDATE' | 'PATCH' | 'ALL';
  action: (req: Request, res: Response, next: NextFunction) => any;
}

export function defaultResponse(
  res: Response,
  message?: String,
  code?: String,
  data?: any,
  httpCode?: number,
) {
  const response: any = {
    success: true,
    code: code || langs.SUCCESS,
  };
  if (message) response.message = message;
  if (data) response.data = data;
  const statusCode: number = httpCode || 200;
  return <Response>res.status(statusCode).json(response);
}

export function defaultError(
  res: Response,
  message?: String,
  code?: String,
  data?: any,
  httpCode?: number,
) {
  const response: any = {
    success: false,
    code: code || langs.INTERNAL_SERVER_ERROR,
  };
  if (message) response.message = message;
  if (data) response.data = data;
  const statusCode: number = httpCode || 500;
  return <Response>res.status(statusCode).json(response);
}

export function pagingResponse(
  res: Response,
  page: number,
  perPage: number,
  total: number,
  message?: String,
  code?: String,
  data?: any,
  httpCode?: number,
) {
  const response: any = {
    success: true,
    code: code || langs.SUCCESS,
    page,
    perPage,
    total,
  };
  if (message) response.message = message;
  if (data) response.data = data;
  const statusCode: number = httpCode || 200;
  return <Response>res.status(statusCode).json(response);
}
