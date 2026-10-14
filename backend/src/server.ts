import fs from "node:fs";
import express, { type NextFunction, type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import multer from "multer";
import { config } from "./config.js";
import { migrate } from "./db.js";
import { ValidationError } from "./lib/content.js";
import { adminRouter, authRouter } from "./routes/admin.js";
import { publicRouter } from "./routes/public.js";
import { surveyAdminRouter, surveyPublicRouter } from "./routes/surveys.js";

const app = express();
app.set("trust proxy", 1);
app.disable("x-powered-by");

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.corsOrigins, credentials: true }));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

fs.mkdirSync(config.uploadDir, { recursive: true });
app.use(
  "/uploads",
  express.static(config.uploadDir, {
    maxAge: "30d",
    immutable: true,
    index: false,
    dotfiles: "deny",
  }),
);

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api/public", publicRouter);
app.use("/api/public", surveyPublicRouter);
app.use("/api/auth", authRouter);
app.use("/api/admin", adminRouter);
app.use("/api/admin", surveyAdminRouter);

app.use("/api", (_req, res) => res.status(404).json({ error: "Not found" }));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof ValidationError) return res.status(422).json({ error: err.message, fields: err.fields });
  if (err instanceof multer.MulterError) {
    const msg = err.code === "LIMIT_FILE_SIZE" ? `File is too large (max ${config.maxUploadMb} MB).` : err.message;
    return res.status(413).json({ error: msg });
  }
  if (err instanceof Error && /not an allowed file type/.test(err.message)) {
    return res.status(415).json({ error: err.message });
  }
  console.error(err);
  res.status(500).json({ error: "Something went wrong on the server." });
});

try {
  await migrate();
} catch (err) {
  console.error(
    `Could not connect to MySQL database "${config.db.name}" as "${config.db.user}"@${config.db.host}. ` +
      "Check DB_HOST, DB_NAME, DB_USER and DB_PASSWORD in .env.",
  );
  throw err;
}

app.listen(config.port, () => {
  console.log(`API ready on http://localhost:${config.port}`);
});
