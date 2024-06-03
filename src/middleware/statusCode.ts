import { Request, Response, NextFunction } from 'express';

const setStatusCode = (req: Request, res: Response, next: NextFunction) => {
  const originalJson = res.json;

  res.json = function (body) {
    if (body.errors) {
      const errorCode = body.errors[0]?.extensions?.statusCode || 500;
      res.status(errorCode);
    }
    return originalJson.call(this, body);
  };

  next();
};

export default setStatusCode;