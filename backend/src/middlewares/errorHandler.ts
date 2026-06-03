import { Request, Response, NextFunction } from "express";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  if (err.name === "SequelizeValidationError") {
    error.statusCode = 400;
    error.message = err.errors.map((e: any) => e.message).join(", ");
  }

  if (err.name === "SequelizeUniqueConstraintError") {
    error.statusCode = 409;
    error.message = "Email already exists";
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal server error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

export default errorHandler;
