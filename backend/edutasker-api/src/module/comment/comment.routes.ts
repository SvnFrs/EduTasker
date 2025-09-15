import { Router } from "express";
import { authGuard } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as CommentController from './comment.controller.js';
import {
  createCommentSchema,
  commentListQuerySchema,
  taskCommentParamSchema,
  deleteCommentParamSchema
} from './comment.schema.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Comment:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Comment unique identifier
 *         content:
 *           type: string
 *           description: Comment text content
 *         taskId:
 *           type: string
 *           format: uuid
 *           description: Task ID this comment belongs to
 *         author:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             username:
 *               type: string
 *             name:
 *               type: string
 *             email:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     CommentResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               $ref: '#/components/schemas/Comment'
 *     CommentListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Comment'
 *             pagination:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Comment'
 *                 page:
 *                   type: number
 *                 size:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 totalElements:
 *                   type: number
 */

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/comments:
 *   post:
 *     tags:
 *       - Comments
 *     summary: Add comment to task
 *     description: Creates a new comment on the specified task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 2000
 *                 description: Comment text content
 *                 example: "This task is progressing well. Need to add more tests."
 *     responses:
 *       200:
 *         description: Comment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentResponse'
 *             example:
 *               message: "Comment created successfully"
 *               content:
 *                 id: "def01234-e89b-12d3-a456-426614174003"
 *                 content: "This task is progressing well. Need to add more tests."
 *                 taskId: "789e0123-e89b-12d3-a456-426614174002"
 *                 author:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "johndoe"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Comment created successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Project ID or Task ID is required
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
 *       403:
 *         description: Forbidden - No access to this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task or project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:projectId/tasks/:taskId/comments", authGuard, validate({ params: taskCommentParamSchema, body: createCommentSchema }), CommentController.createComment);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/comments:
 *   get:
 *     tags:
 *       - Comments
 *     summary: List comments for task
 *     description: Retrieves a paginated list of comments for the specified task
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of comments per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Comments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CommentListResponse'
 *             example:
 *               message: "Comments retrieved successfully"
 *               content:
 *                 - id: "def01234-e89b-12d3-a456-426614174003"
 *                   content: "This task is progressing well. Need to add more tests."
 *                   taskId: "789e0123-e89b-12d3-a456-426614174002"
 *                   author:
 *                     id: "456e7890-e89b-12d3-a456-426614174001"
 *                     username: "johndoe"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Comments retrieved successfully"]
 *               code: "200"
 *               success: true
 *               pagination:
 *                 content: []
 *                 page: 1
 *                 size: 10
 *                 totalPages: 1
 *                 totalElements: 1
 *       400:
 *         description: Bad request - Project ID or Task ID is required
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
 *       403:
 *         description: Forbidden - No access to this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task or project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:projectId/tasks/:taskId/comments", authGuard, validate({ params: taskCommentParamSchema, query: commentListQuerySchema }), CommentController.listComments);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/comments/{commentId}:
 *   delete:
 *     tags:
 *       - Comments
 *     summary: Delete comment
 *     description: Permanently deletes a comment (only comment author can delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Task ID
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Comment ID
 *         example: "def01234-e89b-12d3-a456-426614174003"
 *     responses:
 *       200:
 *         description: Comment deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ServiceWrapperResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       type: object
 *                       properties:
 *                         message:
 *                           type: string
 *             example:
 *               message: "Comment deleted successfully"
 *               content:
 *                 message: "Comment deleted successfully"
 *               messages: ["Comment deleted successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Project ID, Task ID, or Comment ID is required
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
 *       403:
 *         description: Forbidden - Only comment author can delete
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Comment, task, or project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:projectId/tasks/:taskId/comments/:commentId", authGuard, validate({ params: deleteCommentParamSchema }), CommentController.deleteComment);

export default router;
