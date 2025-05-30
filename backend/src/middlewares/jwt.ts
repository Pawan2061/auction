import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface AuthRequest extends Request {
  userId?: string;
}

export const authenticateToken = (
  req: AuthRequest,
  res: any,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid token" });
    }
    req.userId = decoded.userId;
    next();
  });
};
