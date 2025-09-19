import * as XLSX from "xlsx";
import bcrypt from "bcryptjs";
import { prisma } from "../../config/database.js";
import type {
  ColumnMapping,
  ExcelParseResult,
  ImportValidationResult,
  StudentImportRow,
} from "./import.type.js";

export const generateRandomPassword = (length: number = 8): string => {
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
};

export const parseExcelFile = (fileBuffer: Buffer): ExcelParseResult => {
  try {
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
    const dataRows = rawData
      .slice(1)
      .filter((row) => row && row.some((cell) => cell !== undefined && cell !== ""));

    return {
      headers,
      dataRows,
      totalRows: dataRows.length,
      isValid: true,
      error: null,
    };
  } catch (error) {
    return {
      headers: [],
      dataRows: [],
      totalRows: 0,
      isValid: false,
      error: error instanceof Error ? error.message : "Unknown parsing error",
    };
  }
};

export const detectColumnMappings = (headers: string[]): ColumnMapping => {
  const headerLower = headers.map((h) => h.toLowerCase().trim());

  return {
    name: headerLower.findIndex((h) => h.includes("name")),
    email: headerLower.findIndex((h) => h.includes("email")),
    studentId: headerLower.findIndex((h) => h.includes("student") && h.includes("id")),
    password: headerLower.findIndex((h) => h.includes("password")),
  };
};

export const transformRowToStudentData = (
  row: any[],
  columnMapping: ColumnMapping,
  rowNumber: number,
): { data: StudentImportRow | null; error: string | null } => {
  try {
    if (!row || row.length === 0) {
      return { data: null, error: "Empty row" };
    }

    const studentData: StudentImportRow = {
      name:
        columnMapping.name !== -1 && row[columnMapping.name]
          ? row[columnMapping.name].toString().trim()
          : "",
      email:
        columnMapping.email !== -1 && row[columnMapping.email]
          ? row[columnMapping.email].toString().trim().toLowerCase()
          : "",
      studentId:
        columnMapping.studentId !== -1 && row[columnMapping.studentId]
          ? row[columnMapping.studentId].toString().trim()
          : undefined,
      defaultPassword:
        columnMapping.password !== -1 && row[columnMapping.password]
          ? row[columnMapping.password].toString().trim()
          : undefined,
    };

    return { data: studentData, error: null };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : "Unknown transformation error",
    };
  }
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validateStudentData = (studentData: StudentImportRow): string[] => {
  const errors: string[] = [];

  if (!studentData.name || studentData.name.trim() === "") {
    errors.push("Name is required");
  }

  if (!studentData.email || studentData.email.trim() === "") {
    errors.push("Email is required");
  } else if (!isValidEmail(studentData.email)) {
    errors.push("Invalid email format");
  }

  return errors;
};

export const findDuplicateEmails = (students: StudentImportRow[]): string[] => {
  const emailCount = new Map<string, number>();
  const duplicates: string[] = [];

  students.forEach((student) => {
    if (student.email) {
      const email = student.email.toLowerCase();
      const count = emailCount.get(email) || 0;
      emailCount.set(email, count + 1);

      if (count === 1) {
        duplicates.push(email);
      }
    }
  });

  return duplicates;
};

export const checkExistingUsers = async (emails: string[]): Promise<string[]> => {
  if (emails.length === 0) return [];

  const existingUsers = await prisma.user.findMany({
    where: {
      email: {
        in: emails,
      },
    },
    select: { email: true },
  });

  return existingUsers.map((user) => user.email);
};

export const validateImportData = async (
  students: StudentImportRow[],
  options: { checkExistingEmails?: boolean } = {},
): Promise<ImportValidationResult> => {
  const errors: string[] = [];
  const warnings: string[] = [];
  const invalidRows: Array<{ row: number; errors: string[] }> = [];

  students.forEach((student, index) => {
    const rowErrors = validateStudentData(student);
    if (rowErrors.length > 0) {
      invalidRows.push({ row: index + 2, errors: rowErrors });
    }
  });

  const duplicateEmails = findDuplicateEmails(students);
  if (duplicateEmails.length > 0) {
    errors.push(`Duplicate emails found in import data: ${duplicateEmails.join(", ")}`);
  }

  let existingEmails: string[] = [];
  if (options.checkExistingEmails) {
    const validEmails = students
      .filter((s) => s.email && isValidEmail(s.email))
      .map((s) => s.email);

    existingEmails = await checkExistingUsers(validEmails);

    if (existingEmails.length > 0) {
      warnings.push(`${existingEmails.length} email(s) already exist in the system`);
    }
  }

  return {
    isValid: errors.length === 0 && invalidRows.length === 0,
    errors,
    warnings,
    invalidRows,
    duplicateEmails,
    existingEmails,
    totalRecords: students.length,
    validRecords: students.length - invalidRows.length,
  };
};

export const previewImportData = async (
  fileBuffer: Buffer,
  maxRows: number = 10,
): Promise<{
  headers: string[];
  data: any[][];
  totalRows: number;
  columnMapping: ColumnMapping;
  validation: ImportValidationResult;
  hasRequiredColumns: boolean;
}> => {
  const parseResult = parseExcelFile(fileBuffer);

  if (!parseResult.isValid) {
    throw new Error(parseResult.error || "Failed to parse Excel file");
  }

  const { headers, dataRows } = parseResult;
  const columnMapping = detectColumnMappings(headers);
  const previewData = dataRows.slice(0, maxRows);

  const students: StudentImportRow[] = [];
  for (let i = 0; i < Math.min(dataRows.length, 100); i++) {
    const { data } = transformRowToStudentData(dataRows[i] || [], columnMapping, i + 2);
    if (data) {
      students.push(data);
    }
  }

  const validation = await validateImportData(students, { checkExistingEmails: true });
  const hasRequiredColumns = columnMapping.name !== -1 && columnMapping.email !== -1;

  return {
    headers,
    data: previewData,
    totalRows: dataRows.length,
    columnMapping,
    validation,
    hasRequiredColumns,
  };
};

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 10);
};

export const processBatch = async <T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  batchSize: number = 50,
): Promise<R[]> => {
  const results: R[] = [];

  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map((item, batchIndex) => processor(item, i + batchIndex)),
    );
    results.push(...batchResults);
  }

  return results;
};

export const createTemplateData = (includeExample: boolean = false) => {
  const templateHeader = ["name", "email", "studentId", "defaultPassword"];

  const headerLabels = ["Name", "Email", "Student ID", "Default Password"];

  const templateData: {
    name: string;
    email: string;
    studentId: string;
    defaultPassword: string;
  }[] = [];

  if (includeExample) {
    templateData.push(
      {
        name: "John Doe",
        email: "john.doe@example.com",
        studentId: "STU001",
        defaultPassword: "password123",
      },
      {
        name: "Jane Smith",
        email: "jane.smith@example.com",
        studentId: "STU002",
        defaultPassword: "password123",
      },
      {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        studentId: "STU003",
        defaultPassword: "mypassword",
      },
    );
  }

  return {
    templateHeader,
    headerLabels,
    templateData,
  };
};

export const generateExcelWorkbook = (
  data: any[],
  header: string[],
  headerLabel: string[],
  sheetName: string = "Sheet1",
  columnWidths?: number[],
): Buffer => {
  const worksheet = XLSX.utils.json_to_sheet(data, { header, skipHeader: true });
  XLSX.utils.sheet_add_aoa(worksheet, [headerLabel], { origin: "A1" });

  if (columnWidths) {
    worksheet["!cols"] = columnWidths.map((width) => ({ width }));
  } else {
    worksheet["!cols"] = [{ width: 20 }, { width: 30 }, { width: 20 }, { width: 25 }];
  }

  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1:D1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (worksheet[cellAddress]) {
      worksheet[cellAddress].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "CCCCCC" } },
      };
    }
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
};
