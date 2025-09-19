import express from "express";
import * as BoardController from "./board.controller.js";
import {
  boardIdParamSchema,
  createBoardSchema,
  getBoardSchema,
  getProjectBoardsSchema,
  projectIdParamSchema,
  reorderBoardsSchema,
  updateBoardSchema,
} from "./board.schema.js";
import { authGuard, validate } from "../../middleware/index.js";

const router = express.Router();

router.use(authGuard);

/**
 * @swagger
 * /boards:
 *   post:
 *     summary: Create a new board
 *     description: Creates a new board within a project. User must be a project member or owner.
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - projectId
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Board name
 *                 example: "To Do"
 *               projectId:
 *                 type: string
 *                 format: uuid
 *                 description: Project ID this board belongs to
 *                 example: "123e4567-e89b-12d3-a456-426614174000"
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 description: Board position order (optional, auto-assigned if not provided)
 *                 example: 0
 *     responses:
 *       201:
 *         description: Board created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Board created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BoardResponse'
 *       400:
 *         description: Invalid input data
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Access denied - Not a project member
 *       404:
 *         description: Project not found
 */
router.post("/", validate({ body: createBoardSchema }), BoardController.createBoard);

/**
 * @swagger
 * /boards/project/{projectId}:
 *   get:
 *     summary: Get all boards for a project
 *     description: Retrieves all boards belonging to a specific project. User must have access to the project.
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - name: includeTasks
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include tasks within each board
 *         example: true
 *       - name: includeTaskCount
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include task count for each board
 *         example: true
 *     responses:
 *       200:
 *         description: Project boards retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Project boards retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BoardListResponse'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Access denied - Not a project member
 *       404:
 *         description: Project not found
 */
router.get(
  "/project/:projectId",
  validate({
    params: projectIdParamSchema,
    query: getProjectBoardsSchema,
  }),
  BoardController.getProjectBoards,
);

/**
 * @swagger
 * /boards/project/{projectId}/reorder:
 *   put:
 *     summary: Reorder boards within a project
 *     description: Updates the order of multiple boards within a project. User must be project member or owner.
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: projectId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boards
 *             properties:
 *               boards:
 *                 type: array
 *                 minItems: 1
 *                 items:
 *                   type: object
 *                   required:
 *                     - boardId
 *                     - newOrder
 *                   properties:
 *                     boardId:
 *                       type: string
 *                       format: uuid
 *                       description: Board ID to reorder
 *                       example: "123e4567-e89b-12d3-a456-426614174001"
 *                     newOrder:
 *                       type: integer
 *                       minimum: 0
 *                       description: New position for the board
 *                       example: 1
 *                 example:
 *                   - boardId: "123e4567-e89b-12d3-a456-426614174001"
 *                     newOrder: 0
 *                   - boardId: "123e4567-e89b-12d3-a456-426614174002"
 *                     newOrder: 1
 *     responses:
 *       200:
 *         description: Boards reordered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Boards reordered successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BoardListResponse'
 *       400:
 *         description: Invalid input data or duplicate orders
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Access denied - Not a project member
 *       404:
 *         description: Project or board not found
 */
router.put(
  "/project/:projectId/reorder",
  validate({
    params: projectIdParamSchema,
    body: reorderBoardsSchema,
  }),
  BoardController.reorderBoards,
);

/**
 * @swagger
 * /boards/{id}:
 *   get:
 *     summary: Get a specific board
 *     description: Retrieves a board by ID with optional task inclusion. User must have access to the board's project.
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board ID
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *       - name: includeTasks
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include tasks within the board
 *         example: true
 *       - name: includeTaskCount
 *         in: query
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include task count for the board
 *         example: true
 *     responses:
 *       200:
 *         description: Board retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Board retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BoardWithPermissions'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Access denied - No permission to view this board
 *       404:
 *         description: Board not found
 */
router.get(
  "/:id",
  validate({
    params: boardIdParamSchema,
    query: getBoardSchema,
  }),
  BoardController.getBoardById,
);

/**
 * @swagger
 * /boards/{id}:
 *   put:
 *     summary: Update a board
 *     description: Updates a board's name or order. User must be project member or owner.
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board ID
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             minProperties: 1
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 description: Updated board name
 *                 example: "In Progress"
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 description: Updated board position
 *                 example: 2
 *           example:
 *             name: "In Progress"
 *             order: 1
 *     responses:
 *       200:
 *         description: Board updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Board updated successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BoardResponse'
 *       400:
 *         description: Invalid input data or no fields provided
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Access denied - No permission to update this board
 *       404:
 *         description: Board not found
 */
router.put(
  "/:id",
  validate({
    params: boardIdParamSchema,
    body: updateBoardSchema,
  }),
  BoardController.updateBoard,
);

/**
 * @swagger
 * /boards/{id}:
 *   delete:
 *     summary: Delete a board
 *     description: Deletes a board if it contains no tasks. Only project owners can delete boards.
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board ID
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Board deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Board deleted successfully"
 *                 data:
 *                   type: object
 *                   properties:
 *                     message:
 *                       type: string
 *                       example: "Board deleted successfully"
 *       400:
 *         description: Cannot delete board with tasks
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 error:
 *                   type: string
 *                   example: "Cannot delete board that contains tasks. Please move or delete all tasks first."
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Access denied - Only project owners can delete boards
 *       404:
 *         description: Board not found
 */
router.delete("/:id", validate({ params: boardIdParamSchema }), BoardController.deleteBoard);

/**
 * @swagger
 * /boards/{id}/stats:
 *   get:
 *     summary: Get board statistics
 *     description: Retrieves statistics for a board including task counts by status and priority.
 *     tags: [Boards]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Board ID
 *         example: "123e4567-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Board statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Board stats retrieved successfully"
 *                 data:
 *                   $ref: '#/components/schemas/BoardStats'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       403:
 *         description: Access denied - No permission to view this board
 *       404:
 *         description: Board not found
 */
router.get("/:id/stats", validate({ params: boardIdParamSchema }), BoardController.getBoardStats);

/**
 * @swagger
 * components:
 *   schemas:
 *     BoardResponse:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Board unique identifier
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         name:
 *           type: string
 *           description: Board name
 *           example: "To Do"
 *         order:
 *           type: integer
 *           description: Board position order
 *           example: 0
 *         projectId:
 *           type: string
 *           format: uuid
 *           description: Project ID this board belongs to
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *         tasks:
 *           type: array
 *           description: Tasks in this board (only included if requested)
 *           items:
 *             $ref: '#/components/schemas/TaskSummary'
 *         _count:
 *           type: object
 *           properties:
 *             tasks:
 *               type: integer
 *               description: Number of tasks in this board
 *               example: 5
 *
 *     BoardWithPermissions:
 *       allOf:
 *         - $ref: '#/components/schemas/BoardResponse'
 *         - type: object
 *           properties:
 *             permissions:
 *               $ref: '#/components/schemas/BoardPermissions'
 *
 *     BoardPermissions:
 *       type: object
 *       properties:
 *         canRead:
 *           type: boolean
 *           description: Can view this board
 *           example: true
 *         canCreate:
 *           type: boolean
 *           description: Can create boards in this project
 *           example: true
 *         canUpdate:
 *           type: boolean
 *           description: Can update this board
 *           example: true
 *         canDelete:
 *           type: boolean
 *           description: Can delete this board
 *           example: false
 *
 *     BoardListResponse:
 *       type: object
 *       properties:
 *         boards:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/BoardResponse'
 *         total:
 *           type: integer
 *           description: Total number of boards
 *           example: 3
 *         projectId:
 *           type: string
 *           format: uuid
 *           description: Project ID
 *           example: "123e4567-e89b-12d3-a456-426614174000"
 *
 *     BoardStats:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Board ID
 *           example: "123e4567-e89b-12d3-a456-426614174001"
 *         name:
 *           type: string
 *           description: Board name
 *           example: "To Do"
 *         totalTasks:
 *           type: integer
 *           description: Total number of tasks in this board
 *           example: 10
 *         tasksByStatus:
 *           type: object
 *           description: Task count grouped by status
 *           additionalProperties:
 *             type: integer
 *           example:
 *             todo: 5
 *             in-progress: 3
 *             done: 2
 *         tasksByPriority:
 *           type: object
 *           description: Task count grouped by priority
 *           properties:
 *             LOW:
 *               type: integer
 *               example: 3
 *             MEDIUM:
 *               type: integer
 *               example: 4
 *             HIGH:
 *               type: integer
 *               example: 2
 *             CRITICAL:
 *               type: integer
 *               example: 1
 *
 *     TaskSummary:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Task unique identifier
 *           example: "123e4567-e89b-12d3-a456-426614174002"
 *         title:
 *           type: string
 *           description: Task title
 *           example: "Implement login feature"
 *         status:
 *           type: string
 *           description: Task status
 *           example: "todo"
 *         priority:
 *           type: string
 *           enum: [LOW, MEDIUM, HIGH, CRITICAL]
 *           description: Task priority
 *           example: "MEDIUM"
 *         order:
 *           type: integer
 *           description: Task position within board
 *           example: 0
 *         dueDate:
 *           type: string
 *           format: date-time
 *           description: Task due date
 *           example: "2024-01-15T10:00:00Z"
 *         assignees:
 *           type: array
 *           description: Users assigned to this task
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *                 example: "123e4567-e89b-12d3-a456-426614174003"
 *               user:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                     example: "123e4567-e89b-12d3-a456-426614174004"
 *                   name:
 *                     type: string
 *                     example: "John Doe"
 *                   avatarUrl:
 *                     type: string
 *                     format: uri
 *                     example: "https://example.com/avatar.jpg"
 *
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         error:
 *           type: string
 *           description: Error message
 *           example: "Board name is required"
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: JWT token obtained from the authentication endpoint
 */

export default router;
