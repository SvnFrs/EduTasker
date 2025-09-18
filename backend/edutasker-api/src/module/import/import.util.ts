import * as XLSX from "xlsx";
import { prisma } from "../../config/database.js";

const generateRandomPassword = (length: number = 8): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

const validateImportData = async (
  fileBuffer: Buffer,
): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  duplicateEmails: string[];
  invalidEmails: string[];
}> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const duplicateEmails: string[] = [];
  const invalidEmails: string[] = [];

  try {
    const preview = await previewImportData(fileBuffer, 1000);

    if (preview.detectedColumns.name === null) {
      errors.push("Missing required 'Name' column");
    }

    if (preview.detectedColumns.email === null) {
      errors.push("Missing required 'Email' column");
    }

    if (preview.totalRows === 0) {
      errors.push("No data rows found in Excel file");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const seenEmails = new Set<string>();
    const emailColumn = preview.detectedColumns.email;

    if (emailColumn !== null) {
      for (let i = 0; i < preview.data.length; i++) {
        const row = preview.data[i];
        if (!row || !row[emailColumn]) continue;

        const email = row[emailColumn]?.toString().trim().toLowerCase();
        if (!email) continue;

        if (!emailRegex.test(email)) {
          invalidEmails.push(email);
        }

        if (seenEmails.has(email)) {
          duplicateEmails.push(email);
        } else {
          seenEmails.add(email);
        }
      }
    }

    if (seenEmails.size > 0) {
      const existingUsers = await prisma.user.findMany({
        where: {
          email: {
            in: Array.from(seenEmails),
          },
        },
        select: { email: true },
      });

      if (existingUsers.length > 0) {
        warnings.push(`${existingUsers.length} email(s) already exist in the system`);
      }
    }

    if (invalidEmails.length > 0) {
      errors.push(`${invalidEmails.length} invalid email format(s) found`);
    }

    if (duplicateEmails.length > 0) {
      errors.push(`${duplicateEmails.length} duplicate email(s) found in import file`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      duplicateEmails,
      invalidEmails,
    };
  } catch (error) {
    errors.push(error instanceof Error ? error.message : "Unknown validation error");
    return {
      isValid: false,
      errors,
      warnings,
      duplicateEmails,
      invalidEmails,
    };
  }
};

const previewImportData = async (
  fileBuffer: Buffer,
  maxRows: number = 10,
): Promise<{
  headers: string[];
  data: any[][];
  totalRows: number;
  detectedColumns: {
    name: number | null;
    email: number | null;
    studentId: number | null;
    password: number | null;
  };
}> => {
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });

  if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
    throw new Error("Excel file contains no worksheets");
  }

  const sheetName = workbook.SheetNames[0]!;
  const worksheet = workbook.Sheets[sheetName]!;

  if (!worksheet) {
    throw new Error("Cannot read worksheet from Excel file");
  }

  const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as any[][];

  if (rawData.length < 1) {
    throw new Error("Excel file appears to be empty");
  }

  const headers = rawData[0]?.map((h: any) => h?.toString() || "") || [];
  const dataRows = rawData.slice(1);
  const previewData = dataRows.slice(0, maxRows);

  const headerLower = headers.map((h) => h.toLowerCase().trim());
  const detectedColumns = {
    name:
      headerLower.findIndex((h) => h.includes("name")) !== -1
        ? headerLower.findIndex((h) => h.includes("name"))
        : null,
    email:
      headerLower.findIndex((h) => h.includes("email")) !== -1
        ? headerLower.findIndex((h) => h.includes("email"))
        : null,
    studentId:
      headerLower.findIndex((h) => h.includes("student") && h.includes("id")) !== -1
        ? headerLower.findIndex((h) => h.includes("student") && h.includes("id"))
        : null,
    password:
      headerLower.findIndex((h) => h.includes("password")) !== -1
        ? headerLower.findIndex((h) => h.includes("password"))
        : null,
  };

  return {
    headers,
    data: previewData,
    totalRows: dataRows.length,
    detectedColumns,
  };
};

export { generateRandomPassword, previewImportData, validateImportData };
