export interface StudentImportRow {
  name: string;
  email: string;
  studentId?: string;
  defaultPassword?: string;
}

export interface StudentImportDTO {
  students: StudentImportRow[];
  generateDefaultPassword?: boolean;
  sendWelcomeEmail?: boolean;
}

export interface StudentTemplateQuery {
  format?: "xlsx";
  includeExample?: boolean;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface StudentImportResult {
  totalProcessed: number;
  successCount: number;
  failureCount: number;
  createdUsers: UserProfileResponse[];
  failures: {
    row: number;
    data: StudentImportRow;
    error: string;
  }[];
  warnings: string[];
}

export interface ImportJobStatus {
  id: string;
  status: "pending" | "processing" | "completed" | "failed";
  progress: number;
  totalRows: number;
  processedRows: number;
  successCount: number;
  failureCount: number;
  startedAt: Date;
  completedAt?: Date;
  createdBy: string;
  results?: StudentImportResult;
  error?: string;
}

export interface BulkImportOptions {
  generateDefaultPassword?: boolean;
  sendWelcomeEmail?: boolean;
  overwriteExisting?: boolean;
  validateOnly?: boolean;
  batchSize?: number;
}
