import { describe, it, expect, vi, beforeEach } from "vitest";
import { adminAuth } from "./admin-auth";
import { Request, Response, NextFunction } from "express";

function mockReq(headers: Record<string, string> = {}): Request {
  return { headers } as unknown as Request;
}

function mockRes() {
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
  return res as unknown as Response;
}

describe("adminAuth middleware", () => {
  const next: NextFunction = vi.fn();

  beforeEach(() => {
    vi.stubEnv("ADMIN_USERNAME", "admin");
    vi.stubEnv("ADMIN_TOKEN", "admin");
    vi.clearAllMocks();
  });

  it("appelle next() avec les bons identifiants", () => {
    const req = mockReq({ "x-admin-user": "admin", "x-admin-token": "admin" });
    const res = mockRes();

    adminAuth(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("retourne 401 si le token est manquant", () => {
    const req = mockReq({ "x-admin-user": "admin" });
    const res = mockRes();

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si le username est manquant", () => {
    const req = mockReq({ "x-admin-token": "admin" });
    const res = mockRes();

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si le token est incorrect", () => {
    const req = mockReq({ "x-admin-user": "admin", "x-admin-token": "mauvais" });
    const res = mockRes();

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si le username est incorrect", () => {
    const req = mockReq({ "x-admin-user": "hacker", "x-admin-token": "admin" });
    const res = mockRes();

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("retourne 401 si les deux sont absents", () => {
    const req = mockReq({});
    const res = mockRes();

    adminAuth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
