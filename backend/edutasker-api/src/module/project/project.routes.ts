import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as ProjectController from "./project.controller.js";
import {
  addMemberSchema,
  createProjectSchema,
  projectIdParamSchema,
  projectListQuerySchema,
  removeMemberParamSchema,
  updateProjectSchema,
} from "./project.schema.js";

const router = Router();

/**
 * @openapi
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *   schemas:
 *     Project:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Project unique identifier
 *         name:
 *           type: string
 *           description: Project name
 *         description:
 *           type: string
 *           description: Project description
 *         status:
 *           type: string
 *           enum: [active, completed, cancelled, on-hold]
 *           description: Project status
 *         deadline:
 *           type: string
 *           format: date-time
 *           description: Project deadline
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *         createdBy:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             email:
 *               type: string
 *           description: Project creator information
 *         members:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectMember'
 *           description: Project members
 *         mentors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ProjectMentor'
 *           description: Project mentors
 *         boards:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Board'
 *           description: Project boards
 *         _count:
 *           type: object
 *           properties:
 *             tasks:
 *               type: number
 *             members:
 *               type: number
 *             mentors:
 *               type: number
 *             boards:
 *               type: number
 *           description: Count of related entities
 *     ProjectMember:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *           enum: [LEADER, MEMBER]
 *         joinedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             avatarUrl:
 *               type: string
 *     ProjectMentor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         role:
 *           type: string
 *         joinedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: string
 *               format: uuid
 *             name:
 *               type: string
 *             email:
 *               type: string
 *             avatarUrl:
 *               type: string
 *     Board:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         name:
 *           type: string
 *         order:
 *           type: number
 *         projectId:
 *           type: string
 *           format: uuid
 *     ProjectResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               $ref: '#/components/schemas/Project'
 *     ProjectListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Project'
 *             pagination:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Project'
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
 * /projects:
 *   post:
 *     tags:
 *       - Projects
 *     summary: Create new project
 *     description: Creates a new project with the authenticated user as owner
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Project name
 *                 example: "EduTasker Mobile App"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Project description
 *                 example: "Mobile application for task management"
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled, on-hold]
 *                 default: active
 *                 description: Project status
 *                 example: "active"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Project deadline
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Project created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *             example:
 *               message: "Project created successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "EduTasker Mobile App"
 *                 description: "Mobile application for task management"
 *                 status: "active"
 *                 deadline: "2024-12-31T23:59:59Z"
 *                 ownerId: "456e7890-e89b-12d3-a456-426614174001"
 *                 members: []
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Project created successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Validation error
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
  "/",
  authGuard,
  validate({ body: createProjectSchema }),
  ProjectController.createProject,
);

/**
 * @openapi
 * /projects/me:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get my projects
 *     description: Retrieves all projects where the authenticated user is owner, member, or mentor
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of projects per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for project name or description
 *         example: "mobile"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled, on-hold]
 *         description: Filter by project status
 *         example: "active"
 *       - in: query
 *         name: deadline
 *         schema:
 *           type: string
 *           enum: [upcoming, overdue, this-week, this-month]
 *         description: Filter by deadline status
 *         example: "upcoming"
 *     responses:
 *       200:
 *         description: My projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 *             example:
 *               message: "My projects retrieved successfully"
 *               content:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "EduTasker Mobile App"
 *                   description: "Mobile application for task management"
 *                   status: "active"
 *                   deadline: "2024-12-31T23:59:59Z"
 *                   createdBy:
 *                     id: "456e7890-e89b-12d3-a456-426614174001"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                   members:
 *                     - id: "mem1"
 *                       role: "LEADER"
 *                       joinedAt: "2023-01-01T00:00:00Z"
 *                       user:
 *                         id: "456e7890-e89b-12d3-a456-426614174001"
 *                         name: "John Doe"
 *                         email: "john@example.com"
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *               pagination:
 *                 page: 1
 *                 size: 10
 *                 totalPages: 1
 *                 totalElements: 1
 *               messages: ["My projects retrieved successfully"]
 *               code: "200"
 *               success: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get(
  "/me",
  authGuard,
  validate({ query: projectListQuerySchema }),
  ProjectController.getMyProjects,
);

/**
 * @openapi
 * /projects:
 *   get:
 *     tags:
 *       - Projects
 *     summary: List projects
 *     description: Retrieves a paginated list of projects accessible to the authenticated user
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of projects per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for project name or description
 *         example: "mobile"
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, completed, cancelled, on-hold]
 *         description: Filter by project status
 *         example: "active"
 *     responses:
 *       200:
 *         description: Projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectListResponse'
 *             example:
 *               message: "Projects retrieved successfully"
 *               content:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "EduTasker Mobile App"
 *                   description: "Mobile application for task management"
 *                   status: "active"
 *                   deadline: "2024-12-31T23:59:59Z"
 *                   ownerId: "456e7890-e89b-12d3-a456-426614174001"
 *                   members: []
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *                 - id: "789e0123-e89b-12d3-a456-426614174002"
 *                   name: "EduTasker Web Dashboard"
 *                   description: "Web dashboard for project management"
 *                   status: "active"
 *                   deadline: "2024-06-30T23:59:59Z"
 *                   ownerId: "456e7890-e89b-12d3-a456-426614174001"
 *                   members: []
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Projects retrieved successfully"]
 *               code: "200"
 *               success: true
 *               pagination:
 *                 content: []
 *                 page: 1
 *                 size: 10
 *                 totalPages: 1
 *                 totalElements: 2
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", validate({ query: projectListQuerySchema }), ProjectController.listProjects);

/**
 * @openapi
 * /projects/{id}:
 *   get:
 *     tags:
 *       - Projects
 *     summary: Get project by ID
 *     description: Retrieves detailed information about a specific project
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Project retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *             example:
 *               message: "Project retrieved successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "EduTasker Mobile App"
 *                 description: "Mobile application for task management"
 *                 status: "active"
 *                 deadline: "2024-12-31T23:59:59Z"
 *                 ownerId: "456e7890-e89b-12d3-a456-426614174001"
 *                 members:
 *                   - id: "789e0123-e89b-12d3-a456-426614174002"
 *                     username: "johndoe"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Project retrieved successfully"]
 *               code: "200"
 *               success: true
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
  "/:id",
  authGuard,
  validate({ params: projectIdParamSchema }),
  ProjectController.getProjectById,
);

/**
 * @openapi
 * /projects/{id}:
 *   put:
 *     tags:
 *       - Projects
 *     summary: Update project
 *     description: Updates project information (only project owner can update)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 255
 *                 description: Project name
 *                 example: "EduTasker Mobile App Updated"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Project description
 *                 example: "Updated mobile application for task management"
 *               status:
 *                 type: string
 *                 enum: [active, completed, cancelled, on-hold]
 *                 description: Project status
 *                 example: "completed"
 *               deadline:
 *                 type: string
 *                 format: date-time
 *                 description: Project deadline
 *                 example: "2024-12-31T23:59:59Z"
 *     responses:
 *       200:
 *         description: Project updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *             example:
 *               message: "Project updated successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "EduTasker Mobile App Updated"
 *                 description: "Updated mobile application for task management"
 *                 status: "completed"
 *                 deadline: "2024-12-31T23:59:59Z"
 *                 ownerId: "456e7890-e89b-12d3-a456-426614174001"
 *                 members: []
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Project updated successfully"]
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
 *         description: Forbidden - Only project owner can update
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
router.put(
  "/:id",
  authGuard,
  validate({ params: projectIdParamSchema, body: updateProjectSchema }),
  ProjectController.updateProject,
);

/**
 * @openapi
 * /projects/{id}:
 *   delete:
 *     tags:
 *       - Projects
 *     summary: Delete project
 *     description: Permanently deletes a project and all associated data (only project owner can delete)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Project deleted successfully
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
 *               message: "Project deleted successfully"
 *               content:
 *                 message: "Project deleted successfully"
 *               messages: ["Project deleted successfully"]
 *               code: "200"
 *               success: true
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
 *         description: Forbidden - Only project owner can delete
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
router.delete(
  "/:id",
  authGuard,
  validate({ params: projectIdParamSchema }),
  ProjectController.deleteProject,
);

/**
 * @openapi
 * /projects/{id}/members:
 *   post:
 *     tags:
 *       - Project Members
 *     summary: Add member to project
 *     description: Adds a user as a member to the project (only project owner can add members)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *                 description: ID of user to add as member
 *                 example: "789e0123-e89b-12d3-a456-426614174002"
 *               role:
 *                 type: string
 *                 enum: [member, admin]
 *                 default: member
 *                 description: Member role in the project
 *                 example: "member"
 *     responses:
 *       200:
 *         description: Member added successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ProjectResponse'
 *             example:
 *               message: "Member added successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "EduTasker Mobile App"
 *                 description: "Mobile application for task management"
 *                 status: "active"
 *                 deadline: "2024-12-31T23:59:59Z"
 *                 ownerId: "456e7890-e89b-12d3-a456-426614174001"
 *                 members:
 *                   - id: "789e0123-e89b-12d3-a456-426614174002"
 *                     username: "johndoe"
 *                     name: "John Doe"
 *                     email: "john@example.com"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Member added successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Project ID is required or user already a member
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
 *         description: Forbidden - Only project owner can add members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Project or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post(
  "/:id/members",
  authGuard,
  validate({ params: projectIdParamSchema, body: addMemberSchema }),
  ProjectController.addMember,
);

/**
 * @openapi
 * /projects/{id}/members/{userId}:
 *   delete:
 *     tags:
 *       - Project Members
 *     summary: Remove member from project
 *     description: Removes a user from the project (only project owner can remove members)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Project ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID to remove from project
 *         example: "789e0123-e89b-12d3-a456-426614174002"
 *     responses:
 *       200:
 *         description: Member removed successfully
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
 *               message: "Member removed successfully"
 *               content:
 *                 message: "Member removed successfully"
 *               messages: ["Member removed successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Project ID or User ID is required
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
 *         description: Forbidden - Only project owner can remove members
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Project or user not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id/members/:userId",
  authGuard,
  validate({ params: removeMemberParamSchema }),
  ProjectController.removeMember,
);

export default router;
