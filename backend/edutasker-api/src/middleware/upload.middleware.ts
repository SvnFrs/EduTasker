import type { Request } from "express";
import multer from "multer";

const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
  ];

  const allowedExtensions = [".xlsx", ".xls"];
  const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf("."));

  if (allowedMimeTypes.includes(file.mimetype) || allowedExtensions.includes(fileExtension)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only Excel files (.xlsx, .xls) are allowed."));
  }
};
const storage = multer.memoryStorage();

export const uploadExcel = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
  },
}).single("file");

export const handleExcelUpload = (req: Request, res: any, next: any) => {
  uploadExcel(req, res, (err: any) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({
          success: false,
          message: "File too large. Maximum size is 5MB.",
          code: "FILE_TOO_LARGE",
        });
      }
      if (err.code === "LIMIT_FILE_COUNT") {
        return res.status(400).json({
          success: false,
          message: "Too many files. Only one file is allowed.",
          code: "TOO_MANY_FILES",
        });
      }
      return res.status(400).json({
        success: false,
        message: `Upload error: ${err.message}`,
        code: "UPLOAD_ERROR",
      });
    }

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
        code: "INVALID_FILE",
      });
    }

    next();
  });
};
