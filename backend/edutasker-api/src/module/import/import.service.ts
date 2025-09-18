import bcrypt from "bcryptjs";
import * as XLSX from "xlsx";
import { prisma } from "../../config/database.js";
import type {
  BulkImportOptions,
  ImportJobStatus,
  StudentImportResult,
  StudentImportRow,
  StudentTemplateQuery,
  UserProfileResponse,
} from "./import.type.js";
import { generateRandomPassword } from "./import.util.js";

const mapToUserProfileResponse = (user: {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): UserProfileResponse => ({
  id: user.id,
  name: user.name,
  email: user.email,
  avatarUrl: user.avatarUrl ?? undefined,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
});

export const generateStudentImportTemplate = async (
  query: StudentTemplateQuery,
): Promise<Buffer> => {
  const templateData = [
    {
      name: "Name*",
      email: "Email*",
      studentId: "Student ID (Optional)",
      defaultPassword: "Default Password (Optional)",
    },
  ];

  if (query.includeExample) {
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
        defaultPassword: "",
      },
      {
        name: "Bob Johnson",
        email: "bob.johnson@example.com",
        studentId: "",
        defaultPassword: "mypassword",
      },
    );
  }

  const worksheet = XLSX.utils.json_to_sheet(templateData);

  worksheet["!cols"] = [{ width: 20 }, { width: 30 }, { width: 20 }, { width: 25 }];

  const headerRange = XLSX.utils.decode_range(worksheet["!ref"] || "A1:D1");
  for (let col = headerRange.s.c; col <= headerRange.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    if (!worksheet[cellAddress]) continue;
    worksheet[cellAddress].s = {
      font: { bold: true },
      fill: { fgColor: { rgb: "CCCCCC" } },
    };
  }

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Student Import Template");

  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
};

export const importStudentsFromExcel = async (
  fileBuffer: Buffer,
  options: BulkImportOptions = {},
): Promise<StudentImportResult> => {
  const {
    generateDefaultPassword = true,
    sendWelcomeEmail = false,
    overwriteExisting = false,
    validateOnly = false,
    batchSize = 50,
  } = options;

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

  if (rawData.length < 2) {
    throw new Error("Excel file must contain at least a header row and one data row");
  }

  const headers = rawData[0]?.map((h: any) => h?.toString().toLowerCase().trim()) || [];
  const dataRows = rawData
    .slice(1)
    .filter((row) => row && row.some((cell) => cell !== undefined && cell !== ""));

  const nameIndex = headers.findIndex((h: string) => h && h.includes("name"));
  const emailIndex = headers.findIndex((h: string) => h && h.includes("email"));
  const studentIdIndex = headers.findIndex(
    (h: string) => h && h.includes("student") && h.includes("id"),
  );
  const passwordIndex = headers.findIndex((h: string) => h && h.includes("password"));

  if (nameIndex === -1 || emailIndex === -1) {
    throw new Error("Excel file must contain 'Name' and 'Email' columns");
  }

  const result: StudentImportResult = {
    totalProcessed: dataRows.length,
    successCount: 0,
    failureCount: 0,
    createdUsers: [],
    failures: [],
    warnings: [],
  };

  for (let batchStart = 0; batchStart < dataRows.length; batchStart += batchSize) {
    const batchEnd = Math.min(batchStart + batchSize, dataRows.length);
    const batch = dataRows.slice(batchStart, batchEnd);

    for (let i = 0; i < batch.length; i++) {
      const row = batch[i];
      if (!row) continue;

      const rowNumber = batchStart + i + 2;

      try {
        const studentData: StudentImportRow = {
          name: row[nameIndex]?.toString().trim() || "",
          email: row[emailIndex]?.toString().trim().toLowerCase() || "",
          studentId:
            studentIdIndex !== -1 && row[studentIdIndex]
              ? row[studentIdIndex].toString().trim()
              : undefined,
          defaultPassword:
            passwordIndex !== -1 && row[passwordIndex]
              ? row[passwordIndex].toString().trim()
              : undefined,
        };

        if (!studentData.name) {
          result.failures.push({
            row: rowNumber,
            data: studentData,
            error: "Name is required",
          });
          result.failureCount++;
          continue;
        }

        if (!studentData.email) {
          result.failures.push({
            row: rowNumber,
            data: studentData,
            error: "Email is required",
          });
          result.failureCount++;
          continue;
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(studentData.email)) {
          result.failures.push({
            row: rowNumber,
            data: studentData,
            error: "Invalid email format",
          });
          result.failureCount++;
          continue;
        }

        const existingUser = await prisma.user.findUnique({
          where: { email: studentData.email },
        });

        if (existingUser && !overwriteExisting) {
          result.failures.push({
            row: rowNumber,
            data: studentData,
            error: "Email already exists in system",
          });
          result.failureCount++;
          continue;
        }

        if (existingUser && overwriteExisting) {
          result.warnings.push(`User with email ${studentData.email} will be updated`);
        }

        let password = studentData.defaultPassword;
        if (!password && generateDefaultPassword) {
          password = generateRandomPassword();
          result.warnings.push(`Generated random password for ${studentData.email}`);
        }

        if (!password) {
          result.failures.push({
            row: rowNumber,
            data: studentData,
            error: "No password provided and password generation is disabled",
          });
          result.failureCount++;
          continue;
        }

        if (validateOnly) {
          result.successCount++;
          continue;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let newUser;

        if (existingUser && overwriteExisting) {
          newUser = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
              name: studentData.name,
              passwordHash: hashedPassword,
            },
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        } else {
          newUser = await prisma.user.create({
            data: {
              name: studentData.name,
              email: studentData.email,
              passwordHash: hashedPassword,
              roles: {
                create: {
                  role: {
                    connect: {
                      name_code: { name: "Student", code: "STUDENT" },
                    },
                  },
                },
              },
            },
            select: {
              id: true,
              name: true,
              email: true,
              avatarUrl: true,
              createdAt: true,
              updatedAt: true,
            },
          });
        }

        result.createdUsers.push(mapToUserProfileResponse(newUser));
        result.successCount++;

        if (sendWelcomeEmail) {
          result.warnings.push(
            `Welcome email functionality not implemented for ${studentData.email}`,
          );
        }
      } catch (error) {
        result.failures.push({
          row: rowNumber,
          data: row as any,
          error: error instanceof Error ? error.message : "Unknown error occurred",
        });
        result.failureCount++;
      }
    }
  }

  return result;
};

export const getImportHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
) => {
  const skip = (page - 1) * limit;

  const where: any = { createdBy: userId };
  if (status) {
    where.status = status;
  }

  return {
    jobs: [] as ImportJobStatus[],
    total: 0,
    page,
    limit,
    totalPages: 0,
  };
};

export const getImportJob = async (
  jobId: string,
  userId: string,
): Promise<ImportJobStatus | null> => {
  return null;
};

export const cancelImportJob = async (jobId: string, userId: string): Promise<boolean> => {
  return false;
};
