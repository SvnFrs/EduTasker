import { prisma } from "../../config/database.js";
import type {
  BulkImportOptions,
  ColumnMapping,
  ImportJobStatus,
  StudentImportResult,
  StudentImportRow,
  StudentTemplateQuery,
  UserProfileResponse,
} from "./import.type.js";
import {
  createTemplateData,
  detectColumnMappings,
  generateExcelWorkbook,
  generateRandomPassword,
  hashPassword,
  parseExcelFile,
  processBatch,
  transformRowToStudentData,
  validateImportData,
  validateStudentData,
} from "./import.util.js";

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
  const { templateHeader, templateData, headerLabels } = createTemplateData(query.includeExample);

  return generateExcelWorkbook(
    templateData,
    templateHeader,
    headerLabels,
    "Student Import Template",
    [20, 30, 20, 25],
  );
};

const processStudentRecord = async (
  studentData: StudentImportRow,
  options: BulkImportOptions,
  rowNumber: number,
): Promise<{
  success: boolean;
  user?: UserProfileResponse;
  error?: string;
  warnings: string[];
}> => {
  const warnings: string[] = [];
  const { generateDefaultPassword = true, overwriteExisting = false } = options;

  try {
    const validationErrors = validateStudentData(studentData);
    if (validationErrors.length > 0) {
      return {
        success: false,
        error: validationErrors.join(", "),
        warnings,
      };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: studentData.email },
    });

    if (existingUser && !overwriteExisting) {
      return {
        success: false,
        error: "Email already exists in system",
        warnings,
      };
    }

    if (existingUser && overwriteExisting) {
      warnings.push(`User with email ${studentData.email} will be updated`);
    }

    let password = studentData.defaultPassword;
    if (!password && generateDefaultPassword) {
      password = generateRandomPassword();
      warnings.push(`Generated random password for ${studentData.email}`);
    }

    if (!password) {
      return {
        success: false,
        error: "No password provided and password generation is disabled",
        warnings,
      };
    }

    const hashedPassword = await hashPassword(password);

    let user;
    if (existingUser && overwriteExisting) {
      user = await prisma.user.update({
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
      user = await prisma.user.create({
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

    return {
      success: true,
      user: mapToUserProfileResponse(user),
      warnings,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
      warnings,
    };
  }
};

const processBatchedStudents = async (
  students: Array<{ data: StudentImportRow; rowNumber: number }>,
  options: BulkImportOptions,
): Promise<{
  results: Array<{
    success: boolean;
    user?: UserProfileResponse;
    error?: string;
    warnings: string[];
    rowNumber: number;
  }>;
}> => {
  const { batchSize = 50 } = options;

  const processStudent = async (
    item: { data: StudentImportRow; rowNumber: number },
    index: number,
  ) => {
    const result = await processStudentRecord(item.data, options, item.rowNumber);
    return {
      ...result,
      rowNumber: item.rowNumber,
    };
  };

  const results = await processBatch(students, processStudent, batchSize);

  return { results };
};

const parseAndValidateExcelData = async (
  fileBuffer: Buffer,
): Promise<{
  students: Array<{ data: StudentImportRow; rowNumber: number }>;
  columnMapping: ColumnMapping;
  errors: string[];
}> => {
  const errors: string[] = [];

  const parseResult = parseExcelFile(fileBuffer);
  if (!parseResult.isValid) {
    throw new Error(parseResult.error || "Failed to parse Excel file");
  }

  const { headers, dataRows } = parseResult;

  if (dataRows.length === 0) {
    throw new Error("Excel file must contain at least one data row");
  }

  const columnMapping = detectColumnMappings(headers);

  if (columnMapping.name === -1 || columnMapping.email === -1) {
    throw new Error("Excel file must contain 'Name' and 'Email' columns");
  }

  const students: Array<{ data: StudentImportRow; rowNumber: number }> = [];

  for (let i = 0; i < dataRows.length; i++) {
    const rowNumber = i + 2;
    const { data, error } = transformRowToStudentData(dataRows[i] || [], columnMapping, rowNumber);

    if (error) {
      errors.push(`Row ${rowNumber}: ${error}`);
      continue;
    }

    if (data) {
      students.push({ data, rowNumber });
    }
  }

  return { students, columnMapping, errors };
};

export const importStudentsFromExcel = async (
  fileBuffer: Buffer,
  options: BulkImportOptions = {},
): Promise<StudentImportResult> => {
  const { validateOnly = false, sendWelcomeEmail = false } = options;

  try {
    const { students, errors: parseErrors } = await parseAndValidateExcelData(fileBuffer);

    const result: StudentImportResult = {
      totalProcessed: students.length,
      successCount: 0,
      failureCount: parseErrors.length,
      createdUsers: [],
      failures: [],
      warnings: [],
    };

    parseErrors.forEach((error) => {
      result.failures.push({
        row: 0,
        data: {} as StudentImportRow,
        error,
      });
    });

    if (students.length === 0) {
      return result;
    }

    const studentData = students.map((s) => s.data);
    const validation = await validateImportData(studentData, {
      checkExistingEmails: !options.overwriteExisting,
    });

    if (!validation.isValid && !validateOnly) {
      validation.errors.forEach((error) => {
        result.failures.push({
          row: 0,
          data: {} as StudentImportRow,
          error,
        });
        result.failureCount++;
      });
    }

    result.warnings.push(...validation.warnings);

    if (validateOnly) {
      result.successCount = validation.validRecords;
      return result;
    }

    const validStudents = students.filter((_, index) => {
      const hasRowError = validation.invalidRows.some((invalid) => invalid.row === index + 2);
      return !hasRowError;
    });

    if (validStudents.length === 0) {
      return result;
    }

    const { results } = await processBatchedStudents(validStudents, options);

    results.forEach((processResult) => {
      if (processResult.success && processResult.user) {
        result.successCount++;
        result.createdUsers.push(processResult.user);
      } else {
        result.failureCount++;
        const studentIndex = validStudents.findIndex(
          (s) => s.rowNumber === processResult.rowNumber,
        );
        const studentData =
          studentIndex >= 0 ? validStudents[studentIndex]!.data : ({} as StudentImportRow);

        result.failures.push({
          row: processResult.rowNumber,
          data: studentData,
          error: processResult.error || "Unknown error",
        });
      }

      result.warnings.push(...processResult.warnings);
    });

    if (sendWelcomeEmail && result.createdUsers.length > 0) {
      result.warnings.push(
        `Welcome email functionality not implemented for ${result.createdUsers.length} users`,
      );
    }

    result.totalProcessed = students.length;

    return result;
  } catch (error) {
    throw new Error(`Import failed: ${error instanceof Error ? error.message : "Unknown error"}`);
  }
};

export const getImportHistory = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  status?: string,
) => {
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
