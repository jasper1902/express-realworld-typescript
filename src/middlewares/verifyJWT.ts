import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface AuthRequest extends Request {
  userId: string | JwtPayload;
  userEmail: string | JwtPayload;
  userHashedPwd: string | JwtPayload;
}

export const verifyJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader =
    (req.headers.authorization as string) ||
    (req.headers.Authorization as string);

  if (!authHeader?.startsWith("Token ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(
    token,
    process.env.TOKEN as string,

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (err: unknown, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (decoded && typeof decoded === "object" && "user" in decoded) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).userId = decoded.user.id;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).userEmail = decoded.user.email;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (req as any).userHashedPwd = decoded.user.password;
        next();
      }
    }
  );
};

module.exports = { verifyJWT };
