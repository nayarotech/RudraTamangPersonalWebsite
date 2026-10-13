import "dotenv/config";
import path from "node:path";

const root = process.cwd();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

const isProd = process.env.NODE_ENV === "production";

export const config = {
  isProd,
  port: Number(process.env.PORT ?? 4000),
  jwtSecret: isProd ? required("JWT_SECRET") : required("JWT_SECRET", "dev-only-secret-change-me"),
  databaseFile: path.resolve(root, process.env.DATABASE_FILE ?? "data/site.db"),
  uploadDir: path.resolve(root, process.env.UPLOAD_DIR ?? "uploads"),
  /** Comma-separated list of origins allowed to call the API from a browser. */
  corsOrigins: (process.env.CORS_ORIGINS ?? "http://localhost:3000").split(",").map((s) => s.trim()),
  maxUploadMb: Number(process.env.MAX_UPLOAD_MB ?? 40),
};
