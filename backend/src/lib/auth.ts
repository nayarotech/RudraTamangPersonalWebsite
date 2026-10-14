import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import type { NextFunction, Request, Response } from "express";
import { config } from "../config.js";
import { db } from "../db.js";

export const SESSION_COOKIE = "rt_session";
const SESSION_DAYS = 7;

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: "admin" | "editor";
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export const hashPassword = (password: string) => bcrypt.hash(password, 12);
export const verifyPassword = (password: string, hash: string) => bcrypt.compare(password, hash);

export function issueSession(res: Response, user: SessionUser) {
  const token = jwt.sign({ sub: String(user.id) }, config.jwtSecret, { expiresIn: `${SESSION_DAYS}d` });
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: config.isProd,
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
    path: "/",
  });
}

export function clearSession(res: Response) {
  res.clearCookie(SESSION_COOKIE, { path: "/" });
}

function readToken(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) return header.slice(7);
  return req.cookies?.[SESSION_COOKIE];
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = readToken(req);
  if (!token) return res.status(401).json({ error: "Please sign in." });
  let payload: jwt.JwtPayload;
  try {
    payload = jwt.verify(token, config.jwtSecret) as jwt.JwtPayload;
  } catch {
    return res.status(401).json({ error: "Your session has expired. Please sign in again." });
  }
  // A database error here should surface as a 500, not as "please sign in".
  const user = await db.get<SessionUser>(`SELECT id, name, email, role FROM users WHERE id = ?`, [Number(payload.sub)]);
  if (!user) return res.status(401).json({ error: "Your account no longer exists." });
  req.user = user;
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Only administrators can do this." });
  next();
}
