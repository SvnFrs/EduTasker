import { Router } from "express";
import { authGuard } from "../../middleware/index.js";
import * as FileController from "./file.controller.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     PresignedUrlRequest:
 *       type: object
 *       required:
 *         - fileName
 *         - contentType
 *       properties:
 *         fileName:
 *           type: string
 *           description: Name of the file to upload
 *           example: "document.pdf"
 *         contentType:
 *           type: string
 *           description: MIME type of the file
 *           example: "application/pdf"
 *     PresignedUrlResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: object
 *               properties:
 *                 uploadUrl:
 *                   type: string
 *                   description: Pre-signed URL for file upload
 *                   example: "https://bucket.s3.amazonaws.com/file.pdf?X-Amz-Algorithm=..."
 *                 fileName:
 *                   type: string
 *                   description: Original file name
 *                   example: "document.pdf"
 *                 contentType:
 *                   type: string
 *                   description: File content type
 *                   example: "application/pdf"
 */

/**
 * @openapi
 * /file/presigned-url:
 *   post:
 *     tags:
 *       - File Management
 *     summary: Generate presigned URL for file upload
 *     description: Creates a presigned URL that allows direct upload to S3 bucket
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/PresignedUrlRequest'
 *           example:
 *             fileName: "project-document.pdf"
 *             contentType: "application/pdf"
 *     responses:
 *       200:
 *         description: Presigned URL generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PresignedUrlResponse'
 *             example:
 *               message: "Presigned URL generated successfully"
 *               content:
 *                 uploadUrl: "https://edutasker-bucket.s3.amazonaws.com/project-document.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=..."
 *                 fileName: "project-document.pdf"
 *                 contentType: "application/pdf"
 *               messages: ["Presigned URL generated successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "fileName and contentType are required"
 *               content: null
 *               messages: ["fileName and contentType are required"]
 *               code: "400"
 *               success: false
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/presigned-url", authGuard, FileController.createPresignedUrl);

export default router;
