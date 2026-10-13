import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { nanoid } from "nanoid";
import { config } from "../config.js";

/** Only file types a public site should ever serve. Never HTML, SVG or scripts. */
export const ALLOWED: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/avif": ".avif",
  "application/pdf": ".pdf",
  "application/msword": ".doc",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": ".docx",
  "application/vnd.ms-excel": ".xls",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.ms-powerpoint": ".ppt",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": ".pptx",
  "text/csv": ".csv",
  "application/zip": ".zip",
  "video/mp4": ".mp4",
  "audio/mpeg": ".mp3",
};

function storage() {
  return multer.diskStorage({
    destination(_req, _file, cb) {
      const now = new Date();
      const dir = path.join(config.uploadDir, String(now.getFullYear()), String(now.getMonth() + 1).padStart(2, "0"));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const base = path
        .basename(file.originalname, path.extname(file.originalname))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 50);
      cb(null, `${base || "file"}-${nanoid(8)}${ALLOWED[file.mimetype]}`);
    },
  });
}

function makeUploader(allowed: (mime: string) => boolean, maxMb: number) {
  return multer({
    storage: storage(),
    limits: { fileSize: maxMb * 1024 * 1024, files: 30 },
    fileFilter(_req, file, cb) {
      if (ALLOWED[file.mimetype] && allowed(file.mimetype)) cb(null, true);
      else cb(new Error(`"${file.originalname}" is not an allowed file type.`));
    },
  });
}

/** Dashboard uploads: any allowed type. */
export const adminUpload = makeUploader(() => true, config.maxUploadMb);

/** Public uploads (grievance attachments): images and PDFs only, 8 MB. */
export const publicUpload = makeUploader((m) => m.startsWith("image/") || m === "application/pdf", 8);

export function publicUrl(absPath: string) {
  return "/uploads/" + path.relative(config.uploadDir, absPath).split(path.sep).join("/");
}
