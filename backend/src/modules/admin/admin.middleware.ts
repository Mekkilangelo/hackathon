import { Request, Response, NextFunction } from "express";

/**
 * Auth simple par token — variable d'env ADMIN_TOKEN.
 * Header attendu : Authorization: Bearer <token>
 */
export function adminAuth(req: Request, res: Response, next: NextFunction): void {
  const token = process.env.ADMIN_TOKEN;
  if (!token) {
    res.status(503).json({ error: "Admin token not configured" });
    return;
  }

  const header = req.headers.authorization ?? "";
  const provided = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (provided !== token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  next();
}
