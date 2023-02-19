import { Request, Response, NextFunction } from "express";

export const catchInvalidJsonError = (
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (
    err instanceof SyntaxError &&
    err.message.indexOf("Unexpected token") !== -1
  ) {
    return res.status(400).json({ message: "Invalid JSON format" });
  }
  next(err);
};
