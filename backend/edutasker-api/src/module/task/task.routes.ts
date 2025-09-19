import { Router } from "express";
import { authGuard, validate } from "../../middleware/index.js";
import * as TaskController from "./task.controller.js";
import {
  assignTaskSchema,
  createTaskSchema,
  moveTaskSchema,
  projectIdParamSchema,
  projectTaskParamSchema,
  taskListQuerySchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "./task.schema.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Task:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Task unique identifier
 *         title:
 *           type: string
 *           description: Task title
 *         description:
 *           type: string
 *           description: Task description
 *         priority:
 *           type: string
 *           enum: [low, medium, high, critical]
 *           description: Task priority level
 *         status:
 *           type: string
 *           enum: [todo, in-progress, review, done]
 *           description: Task status
 *         projectId:
 *           type: string
 *           format: uuid
 *           description: Project ID this task belongs to
 *         assignedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 format: uuid
 *               username:
 *                 type: string
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Task deadline
 *         createdBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             username:
 *               type: string
 *             name:
 *               type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     TaskResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               $ref: '#/components/schemas/Task'
 *     TaskListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Task'
 *             pagination:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Task'
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
 * /projects/{projectId}/tasks:
 *   post:
 *     tags:
 *       - Tasks
 *     summary: Create new task in project
 *     description: Creates a new task within the specified project
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Task title
 *                 example: "Implement user authentication"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Task description
 *                 example: "Implement JWT-based authentication system"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 default: medium
 *                 description: Task priority level
 *                 example: "high"
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *                 default: todo
 *                 description: Task status
 *                 example: "todo"
 *               assignedTo:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of user IDs to assign this task to
 *                 example: ["456e7890-e89b-12d3-a456-426614174001"]
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Task deadline
 *                 example: "2024-03-15T23:59:59Z"
 *     responses:
 *       200:
 *         description: Task created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               message: "Task created successfully"
 *               content:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 title: "Implement user authentication"
 *                 description: "Implement JWT-based authentication system"
 *                 priority: "high"
 *                 status: "todo"
 *                 projectId: "123e4567-e89b-12d3-a456-426614174000"
 *                 assignedUsers: []
 *                 deadline: "2024-03-15T23:59:59Z"
 *                 createdBy:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "johndoe"
 *                   name: "John Doe"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Task created successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Project ID is required or validation error
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
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/:projectId/tasks",
  authGuard,
  validate({ params: projectIdParamSchema, body: createTaskSchema }),
  TaskController.createTask,
);

/**
 * @openapi
 * /projects/{projectId}/tasks:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: List tasks in project
 *     description: Retrieves a paginated list of tasks within the specified project
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
 *         description: Number of tasks per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for task title or description
 *         example: "authentication"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [todo, in-progress, review, done]
 *         description: Filter by task status
 *         example: "todo"
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by task priority
 *         example: "high"
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Filter by assigned user ID
 *         example: "456e7890-e89b-12d3-a456-426614174001"
 *     responses:
 *       200:
 *         description: Tasks retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskListResponse'
 *             example:
 *               message: "Tasks retrieved successfully"
 *               content:
 *                 - id: "789e0123-e89b-12d3-a456-426614174002"
 *                   title: "Implement user authentication"
 *                   description: "Implement JWT-based authentication system"
 *                   priority: "high"
 *                   status: "todo"
 *                   projectId: "123e4567-e89b-12d3-a456-426614174000"
 *                   assignedUsers: []
 *                   deadline: "2024-03-15T23:59:59Z"
 *                   createdBy:
 *                     id: "456e7890-e89b-12d3-a456-426614174001"
 *                     username: "johndoe"
 *                     name: "John Doe"
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Tasks retrieved successfully"]
 *               code: "200"
 *               success: true
 *               pagination:
 *                 content: []
 *                 page: 1
 *                 size: 10
 *                 totalPages: 1
 *                 totalElements: 1
 *       400:
 *         description: Bad request - Project ID is required
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
 *         description: Project not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/:projectId/tasks",
  authGuard,
  validate({ params: projectIdParamSchema, query: taskListQuerySchema }),
  TaskController.listTasks,
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}:
 *   get:
 *     tags:
 *       - Tasks
 *     summary: Get task by ID
 *     description: Retrieves detailed information about a specific task
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
 *     responses:
 *       200:
 *         description: Task retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               message: "Task retrieved successfully"
 *               content:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 title: "Implement user authentication"
 *                 description: "Implement JWT-based authentication system with proper error handling"
 *                 priority: "high"
 *                 status: "in-progress"
 *                 projectId: "123e4567-e89b-12d3-a456-426614174000"
 *                 assignedUsers:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     username: "johndoe"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                 deadline: "2024-03-15T23:59:59Z"
 *                 createdBy:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "johndoe"
 *                   name: "John Doe"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Task retrieved successfully"]
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
router.get(
  "/:projectId/tasks/:taskId",
  authGuard,
  validate({ params: projectTaskParamSchema }),
  TaskController.getTaskById,
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update task
 *     description: Updates task information (only task creator or assigned users can update)
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
 *             properties:
 *               title:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Task title
 *                 example: "Implement user authentication - Updated"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Task description
 *                 example: "Updated description with more details"
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, critical]
 *                 description: Task priority level
 *                 example: "critical"
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *                 description: Task status
 *                 example: "in-progress"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Task deadline
 *                 example: "2024-03-10T23:59:59Z"
 *     responses:
 *       200:
 *         description: Task updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               message: "Task updated successfully"
 *               content:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 title: "Implement user authentication - Updated"
 *                 description: "Updated description with more details"
 *                 priority: "critical"
 *                 status: "in-progress"
 *                 projectId: "123e4567-e89b-12d3-a456-426614174000"
 *                 assignedUsers: []
 *                 deadline: "2024-03-10T23:59:59Z"
 *                 createdBy:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "johndoe"
 *                   name: "John Doe"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Task updated successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Validation error or required parameters missing
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
 *         description: Forbidden - No permission to update this task
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
router.put(
  "/:projectId/tasks/:taskId",
  authGuard,
  validate({ params: projectTaskParamSchema, body: updateTaskSchema }),
  TaskController.updateTask,
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}:
 *   delete:
 *     tags:
 *       - Tasks
 *     summary: Delete task
 *     description: Permanently deletes a task (only task creator or project owner can delete)
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
 *     responses:
 *       200:
 *         description: Task deleted successfully
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
 *               message: "Task deleted successfully"
 *               content:
 *                 message: "Task deleted successfully"
 *               messages: ["Task deleted successfully"]
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
 *         description: Forbidden - No permission to delete this task
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
router.delete(
  "/:projectId/tasks/:taskId",
  authGuard,
  validate({ params: projectTaskParamSchema }),
  TaskController.deleteTask,
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/assign:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Assign users to task
 *     description: Assigns or reassigns users to a specific task
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
 *               - userIds
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of user IDs to assign to this task
 *                 example: ["456e7890-e89b-12d3-a456-426614174001", "def01234-e89b-12d3-a456-426614174003"]
 *     responses:
 *       200:
 *         description: Task assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               message: "Task assigned successfully"
 *               content:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 title: "Implement user authentication"
 *                 description: "Implement JWT-based authentication system"
 *                 priority: "high"
 *                 status: "todo"
 *                 projectId: "123e4567-e89b-12d3-a456-426614174000"
 *                 assignedUsers:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     username: "johndoe"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                   - id: "def01234-e89b-12d3-a456-426614174003"
 *                     username: "janedoe"
 *                     name: "Jane Doe"
 *                     email: "jane@example.com"
 *                 deadline: "2024-03-15T23:59:59Z"
 *                 createdBy:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "johndoe"
 *                   name: "John Doe"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Task assigned successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Required parameters missing or validation error
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
 *         description: Forbidden - No permission to assign users to this task
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Task, project, or users not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:projectId/tasks/:taskId/assign",
  authGuard,
  validate({ params: projectTaskParamSchema, body: assignTaskSchema }),
  TaskController.assignTask,
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/status:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Update task status
 *     description: Updates the status of a specific task
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
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, review, done]
 *                 description: New task status
 *                 example: "done"
 *     responses:
 *       200:
 *         description: Task status updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               message: "Task status updated successfully"
 *               content:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 title: "Implement user authentication"
 *                 description: "Implement JWT-based authentication system"
 *                 priority: "high"
 *                 status: "done"
 *                 projectId: "123e4567-e89b-12d3-a456-426614174000"
 *                 assignedUsers:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     username: "johndoe"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                 deadline: "2024-03-15T23:59:59Z"
 *                 createdBy:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "johndoe"
 *                   name: "John Doe"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Task status updated successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Status is required or invalid status value
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
 *         description: Forbidden - No permission to update this task status
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
router.put(
  "/:projectId/tasks/:taskId/status",
  authGuard,
  validate({ params: projectTaskParamSchema, body: updateTaskStatusSchema }),
  TaskController.updateTaskStatus,
);

/**
 * @openapi
 * /projects/{projectId}/tasks/{taskId}/move:
 *   put:
 *     tags:
 *       - Tasks
 *     summary: Move task to different board or reorder within board
 *     description: Moves a task to a different board and/or changes its position order within the board. Handles both cross-board moves and same-board reordering with proper order management.
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
 *         description: Task ID to move
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - boardId
 *               - order
 *             properties:
 *               boardId:
 *                 type: string
 *                 format: uuid
 *                 description: Target board ID where the task should be moved
 *                 example: "abc12345-e89b-12d3-a456-426614174004"
 *               order:
 *                 type: integer
 *                 minimum: 0
 *                 description: Position order within the target board (0-based index)
 *                 example: 2
 *           example:
 *             boardId: "abc12345-e89b-12d3-a456-426614174004"
 *             order: 2
 *     responses:
 *       200:
 *         description: Task moved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/TaskResponse'
 *             example:
 *               message: "Task moved successfully"
 *               content:
 *                 id: "789e0123-e89b-12d3-a456-426614174002"
 *                 title: "Implement user authentication"
 *                 description: "Implement JWT-based authentication system"
 *                 priority: "high"
 *                 status: "in-progress"
 *                 projectId: "123e4567-e89b-12d3-a456-426614174000"
 *                 board:
 *                   id: "abc12345-e89b-12d3-a456-426614174004"
 *                   name: "In Progress"
 *                   order: 1
 *                 order: 2
 *                 assignees:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     assignedAt: "2023-01-02T00:00:00Z"
 *                     user:
 *                       id: "456e7890-e89b-12d3-a456-426614174001"
 *                       name: "John Doe"
 *                       email: "john@example.com"
 *                       avatarUrl: "https://example.com/avatar.jpg"
 *                 dueDate: "2024-03-15T23:59:59Z"
 *                 createdBy:
 *                   id: "456e7890-e89b-12d3-a456-426614174001"
 *                   name: "John Doe"
 *                   email: "john@example.com"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *                 _count:
 *                   comments: 3
 *               messages: ["Task moved successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Required parameters missing, invalid board ID, or validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Board not found or doesn't belong to this project"
 *               messages: ["Board not found or doesn't belong to this project"]
 *               code: "400"
 *               success: false
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - No permission to move tasks in this project
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "You are not a member of this project"
 *               messages: ["You are not a member of this project"]
 *               code: "403"
 *               success: false
 *       404:
 *         description: Task, project, or target board not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Task not found"
 *               messages: ["Task not found"]
 *               code: "404"
 *               success: false
 */
router.put(
  "/:projectId/tasks/:taskId/move",
  authGuard,
  validate({ params: projectTaskParamSchema, body: moveTaskSchema }),
  TaskController.moveTask,
);

export default router;
