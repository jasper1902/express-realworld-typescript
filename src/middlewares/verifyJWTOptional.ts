/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  loggedin: boolean | JwtPayload;
  userId?: string | JwtPayload;
  userEmail?: string | JwtPayload;
  userHashedPwd?: string | JwtPayload;
}

export const verifyJWTOptional = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader =
    (req.headers.authorization as string) ||
    (req.headers.Authorization as string);

  if (!authHeader?.startsWith("Token ")) {
    (req as any).loggedin = false;
    return next();
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.TOKEN as string,
    (err: unknown, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (decoded && typeof decoded === "object" && "user" in decoded) {
        (req as any).loggedin = true;
        (req as any).userId = decoded.user.id;
        (req as any).userEmail = decoded.user.email;
        (req as any).userHashedPwd = decoded.user.password;
        next();
      }
    }
  );
};

module.exports = { verifyJWTOptional };
