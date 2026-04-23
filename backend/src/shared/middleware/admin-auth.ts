import { Request, Response, NextFunction } from "express";

export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const user = req.headers["x-admin-user"];
  const token = req.headers["x-admin-token"];
  const expectedUser = process.env.ADMIN_USERNAME ?? "admin";
  const expectedToken = process.env.ADMIN_TOKEN ?? "admin";

  if (user !== expectedUser || token !== expectedToken) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  next();
}
