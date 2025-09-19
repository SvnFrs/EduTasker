import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { handleExcelUpload } from "../../middleware/upload.middleware.js";
import {
  validateQuery,
  validateFileUpload,
} from "../../middleware/validate-multipart.middleware.js";
import * as ImportController from "./import.controller.js";
import {
  studentTemplateQuerySchema,
  bulkImportOptionsSchema,
  importJobQuerySchema,
  importJobIdParamSchema,
  previewImportSchema,
} from "./import.schema.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     StudentImportRow:
 *       type: object
 *       required:
 *         - name
 *         - email
 *       properties:
 *         name:
 *           type: string
 *           minLength: 1
 *           maxLength: 255
 *           description: Student's full name
 *           example: "John Doe"
 *         email:
 *           type: string
 *           format: email
 *           description: Student's email address (must be unique)
 *           example: "john.doe@school.edu"
 *         studentId:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *           description: Optional student ID or number
 *           example: "STU001"
 *         defaultPassword:
 *           type: string
 *           minLength: 6
 *           description: Optional default password for the student
 *           example: "password123"
 *
 *     StudentImportResult:
 *       type: object
 *       properties:
 *         totalProcessed:
 *           type: number
 *           description: Total number of rows processed
 *           example: 10
 *         successCount:
 *           type: number
 *           description: Number of students successfully created
 *           example: 8
 *         failureCount:
 *           type: number
 *           description: Number of rows that failed to process
 *           example: 2
 *         createdUsers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/User'
 *           description: Successfully created student accounts
 *         failures:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               row:
 *                 type: number
 *                 description: Row number that failed
 *                 example: 3
 *               data:
 *                 type: object
 *                 description: Original row data
 *               error:
 *                 type: string
 *                 description: Error message
 *                 example: "Email already exists in system"
 *           description: Failed rows with error details
 *         warnings:
 *           type: array
 *           items:
 *             type: string
 *           description: Warning messages during import
 *           example: ["Generated random password for jane@example.com"]
 *
 *     ImportPreview:
 *       type: object
 *       properties:
 *         headers:
 *           type: array
 *           items:
 *             type: string
 *           description: Column headers from Excel file
 *           example: ["Name", "Email", "Student ID", "Password"]
 *         data:
 *           type: array
 *           items:
 *             type: array
 *             items:
 *               type: string
 *           description: Preview of data rows
 *         totalRows:
 *           type: number
 *           description: Total number of data rows in file
 *           example: 50
 *         detectedColumns:
 *           type: object
 *           properties:
 *             name:
 *               type: number
 *               nullable: true
 *               description: Index of name column (-1 if not found)
 *             email:
 *               type: number
 *               nullable: true
 *               description: Index of email column (-1 if not found)
 *             studentId:
 *               type: number
 *               nullable: true
 *               description: Index of student ID column (-1 if not found)
 *             password:
 *               type: number
 *               nullable: true
 *               description: Index of password column (-1 if not found)
 *
 *     ImportValidation:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *           description: Whether the import data is valid
 *         errors:
 *           type: array
 *           items:
 *             type: string
 *           description: Validation errors that prevent import
 *         warnings:
 *           type: array
 *           items:
 *             type: string
 *           description: Warnings that don't prevent import
 *         duplicateEmails:
 *           type: array
 *           items:
 *             type: string
 *           description: Duplicate email addresses found in file
 *         invalidEmails:
 *           type: array
 *           items:
 *             type: string
 *           description: Invalid email addresses found in file
 */

/**
 * @openapi
 * /import/students/template:
 *   get:
 *     tags:
 *       - Student Import
 *     summary: Download student import template
 *     description: Downloads an Excel template file for importing students with proper headers and optional example data
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: format
 *         schema:
 *           type: string
 *           enum: [xlsx]
 *           default: xlsx
 *         description: Template file format
 *       - in: query
 *         name: includeExample
 *         schema:
 *           type: boolean
 *           default: true
 *         description: Include example rows in template
 *     responses:
 *       200:
 *         description: Template file downloaded successfully
 *         content:
 *           application/vnd.openxmlformats-officedocument.spreadsheetml.sheet:
 *             schema:
 *               type: string
 *               format: binary
 *         headers:
 *           Content-Disposition:
 *             description: Attachment filename
 *             schema:
 *               type: string
 *               example: attachment; filename="student-import-template.xlsx"
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/students/template", authGuard, ImportController.getStudentImportTemplate);

/**
 * @openapi
 * /import/students/preview:
 *   post:
 *     tags:
 *       - Student Import
 *     summary: Preview import data
 *     description: Upload Excel file to preview data structure and column mapping without importing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file to preview (.xlsx or .xls)
 *               maxRows:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 10
 *                 description: Maximum number of rows to preview
 *     responses:
 *       200:
 *         description: Import preview generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/ImportPreview'
 *       400:
 *         description: Bad request - Invalid file or parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/students/preview",
  authGuard,
  handleExcelUpload,
  validateFileUpload(true),
  validateQuery(previewImportSchema),
  ImportController.previewImportData,
);

/**
 * @openapi
 * /import/students/validate:
 *   post:
 *     tags:
 *       - Student Import
 *     summary: Validate import data
 *     description: Validate Excel file data for errors and warnings before importing
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file to validate (.xlsx or .xls)
 *     responses:
 *       200:
 *         description: Validation completed successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/ImportValidation'
 *       400:
 *         description: Bad request - Invalid file
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/students/validate",
  authGuard,
  handleExcelUpload,
  validateFileUpload(true),
  ImportController.validateImportData,
);

/**
 * @openapi
 * /import/students:
 *   post:
 *     tags:
 *       - Student Import
 *     summary: Import students from Excel file
 *     description: Bulk import student accounts from an Excel file with configurable options
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - file
 *             properties:
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: Excel file containing student data (.xlsx or .xls)
 *               generateDefaultPassword:
 *                 type: boolean
 *                 default: true
 *                 description: Generate random passwords for students without passwords
 *               sendWelcomeEmail:
 *                 type: boolean
 *                 default: false
 *                 description: Send welcome emails to imported students
 *               overwriteExisting:
 *                 type: boolean
 *                 default: false
 *                 description: Update existing users if email matches
 *               validateOnly:
 *                 type: boolean
 *                 default: false
 *                 description: Only validate data without creating users
 *               batchSize:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 100
 *                 default: 50
 *                 description: Number of users to process in each batch
 *     responses:
 *       200:
 *         description: Students imported successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/StudentImportResult'
 *             example:
 *               message: "Students imported successfully"
 *               content:
 *                 totalProcessed: 10
 *                 successCount: 8
 *                 failureCount: 2
 *                 createdUsers: []
 *                 failures: [
 *                   {
 *                     row: 3,
 *                     data: { name: "", email: "invalid-email" },
 *                     error: "Name is required"
 *                   }
 *                 ]
 *                 warnings: ["Generated random password for john@example.com"]
 *               messages: ["Students imported successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Invalid file or data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/students",
  authGuard,
  handleExcelUpload,
  validateFileUpload(true),
  ImportController.importStudents,
);

/**
 * @openapi
 * /import/history:
 *   get:
 *     tags:
 *       - Import History
 *     summary: Get import history
 *     description: Retrieve paginated list of import jobs for the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: number
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: number
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, processing, completed, failed]
 *         description: Filter by import job status
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter imports from this date
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter imports to this date
 *     responses:
 *       200:
 *         description: Import history retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       type: object
 *                       properties:
 *                         jobs:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               id:
 *                                 type: string
 *                                 format: uuid
 *                               status:
 *                                 type: string
 *                                 enum: [pending, processing, completed, failed]
 *                               progress:
 *                                 type: number
 *                                 minimum: 0
 *                                 maximum: 100
 *                               totalRows:
 *                                 type: number
 *                               processedRows:
 *                                 type: number
 *                               successCount:
 *                                 type: number
 *                               failureCount:
 *                                 type: number
 *                               startedAt:
 *                                 type: string
 *                                 format: date-time
 *                               completedAt:
 *                                 type: string
 *                                 format: date-time
 *                                 nullable: true
 *                         total:
 *                           type: number
 *                         page:
 *                           type: number
 *                         limit:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/history",
  authGuard,
  validate({ query: importJobQuerySchema }),
  ImportController.getImportHistory,
);

/**
 * @openapi
 * /import/jobs/{id}:
 *   get:
 *     tags:
 *       - Import History
 *     summary: Get import job details
 *     description: Retrieve detailed information about a specific import job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Import job ID
 *     responses:
 *       200:
 *         description: Import job details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           format: uuid
 *                         status:
 *                           type: string
 *                           enum: [pending, processing, completed, failed]
 *                         progress:
 *                           type: number
 *                           minimum: 0
 *                           maximum: 100
 *                         totalRows:
 *                           type: number
 *                         processedRows:
 *                           type: number
 *                         successCount:
 *                           type: number
 *                         failureCount:
 *                           type: number
 *                         startedAt:
 *                           type: string
 *                           format: date-time
 *                         completedAt:
 *                           type: string
 *                           format: date-time
 *                           nullable: true
 *                         results:
 *                           $ref: '#/components/schemas/StudentImportResult'
 *                         error:
 *                           type: string
 *                           nullable: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Import job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/jobs/:id",
  authGuard,
  validate({ params: importJobIdParamSchema }),
  ImportController.getImportJob,
);

/**
 * @openapi
 * /import/jobs/{id}/cancel:
 *   post:
 *     tags:
 *       - Import History
 *     summary: Cancel import job
 *     description: Cancel a running or pending import job
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Import job ID
 *     responses:
 *       200:
 *         description: Import job cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Cannot cancel job (already completed or failed)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Import job not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/jobs/:id/cancel",
  authGuard,
  validate({ params: importJobIdParamSchema }),
  ImportController.cancelImportJob,
);

export default router;
