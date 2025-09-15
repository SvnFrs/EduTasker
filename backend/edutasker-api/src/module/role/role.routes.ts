import { Router } from "express";
import { authGuard } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as RoleController from './role.controller.js';
import {
  assignPermissionsSchema,
  createRoleSchema,
  roleIdParamSchema,
  roleListQuerySchema,
  updateRoleSchema
} from './role.schema.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Permission:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Permission unique identifier
 *         name:
 *           type: string
 *           description: Permission name
 *         description:
 *           type: string
 *           description: Permission description
 *         module:
 *           type: string
 *           description: Module this permission belongs to
 *     Role:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Role unique identifier
 *         name:
 *           type: string
 *           description: Role name
 *         description:
 *           type: string
 *           description: Role description
 *         permissions:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Permission'
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     RoleResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               $ref: '#/components/schemas/Role'
 *     RoleListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 *             pagination:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Role'
 *                 page:
 *                   type: number
 *                 size:
 *                   type: number
 *                 totalPages:
 *                   type: number
 *                 totalElements:
 *                   type: number
 *     PermissionListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Permission'
 */

/**
 * @openapi
 * /roles:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Create new role
 *     description: Creates a new role with specified permissions (admin only)
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
 *                 maxLength: 100
 *                 description: Role name
 *                 example: "Project Manager"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Role description
 *                 example: "Manages projects and tasks within the organization"
 *     responses:
 *       200:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *             example:
 *               message: "Role created successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Project Manager"
 *                 description: "Manages projects and tasks within the organization"
 *                 permissions: []
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Role created successfully"]
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
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/", authGuard, validate({ body: createRoleSchema }), RoleController.createRole);

/**
 * @openapi
 * /roles:
 *   get:
 *     tags:
 *       - Roles
 *     summary: List all roles
 *     description: Retrieves a paginated list of all roles (admin only)
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
 *         name: size
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of roles per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for role name or description
 *         example: "manager"
 *     responses:
 *       200:
 *         description: Roles retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleListResponse'
 *             example:
 *               message: "Roles retrieved successfully"
 *               content:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   name: "Project Manager"
 *                   description: "Manages projects and tasks within the organization"
 *                   permissions:
 *                     - id: "456e7890-e89b-12d3-a456-426614174001"
 *                       name: "project:create"
 *                       description: "Create new projects"
 *                       module: "projects"
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Roles retrieved successfully"]
 *               code: "200"
 *               success: true
 *               pagination:
 *                 content: []
 *                 page: 1
 *                 size: 10
 *                 totalPages: 1
 *                 totalElements: 1
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authGuard, validate({ query: roleListQuerySchema }), RoleController.listRoles);

/**
 * @openapi
 * /roles/{id}:
 *   get:
 *     tags:
 *       - Roles
 *     summary: Get role by ID
 *     description: Retrieves detailed information about a specific role
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Role retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *             example:
 *               message: "Role retrieved successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Project Manager"
 *                 description: "Manages projects and tasks within the organization"
 *                 permissions:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     name: "project:create"
 *                     description: "Create new projects"
 *                     module: "projects"
 *                   - id: "789e0123-e89b-12d3-a456-426614174002"
 *                     name: "task:manage"
 *                     description: "Manage tasks"
 *                     module: "tasks"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Role retrieved successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Role ID is required
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
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authGuard, validate({ params: roleIdParamSchema }), RoleController.getRoleById);

/**
 * @openapi
 * /roles/{id}:
 *   put:
 *     tags:
 *       - Roles
 *     summary: Update role
 *     description: Updates role information (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
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
 *                 maxLength: 100
 *                 description: Role name
 *                 example: "Senior Project Manager"
 *               description:
 *                 type: string
 *                 maxLength: 500
 *                 description: Role description
 *                 example: "Senior level project manager with extended permissions"
 *     responses:
 *       200:
 *         description: Role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *             example:
 *               message: "Role updated successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Senior Project Manager"
 *                 description: "Senior level project manager with extended permissions"
 *                 permissions:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     name: "project:create"
 *                     description: "Create new projects"
 *                     module: "projects"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Role updated successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Role ID is required or validation error
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
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", authGuard, validate({ params: roleIdParamSchema, body: updateRoleSchema }), RoleController.updateRole);

/**
 * @openapi
 * /roles/{id}:
 *   delete:
 *     tags:
 *       - Roles
 *     summary: Delete role
 *     description: Permanently deletes a role (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: Role deleted successfully
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
 *               message: "Role deleted successfully"
 *               content:
 *                 message: "Role deleted successfully"
 *               messages: ["Role deleted successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Role ID is required
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
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Role not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authGuard, validate({ params: roleIdParamSchema }), RoleController.deleteRole);

/**
 * @openapi
 * /roles/{id}/permissions:
 *   post:
 *     tags:
 *       - Roles
 *     summary: Assign permissions to role
 *     description: Assigns or updates permissions for a specific role (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Role ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - permissionIds
 *             properties:
 *               permissionIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *                 description: Array of permission IDs to assign to this role
 *                 example: ["456e7890-e89b-12d3-a456-426614174001", "789e0123-e89b-12d3-a456-426614174002"]
 *     responses:
 *       200:
 *         description: Permissions assigned successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoleResponse'
 *             example:
 *               message: "Permissions assigned successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 name: "Project Manager"
 *                 description: "Manages projects and tasks within the organization"
 *                 permissions:
 *                   - id: "456e7890-e89b-12d3-a456-426614174001"
 *                     name: "project:create"
 *                     description: "Create new projects"
 *                     module: "projects"
 *                   - id: "789e0123-e89b-12d3-a456-426614174002"
 *                     name: "task:manage"
 *                     description: "Manage tasks"
 *                     module: "tasks"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Permissions assigned successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Role ID is required or validation error
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
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Role or permissions not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/:id/permissions", authGuard, validate({ params: roleIdParamSchema, body: assignPermissionsSchema }), RoleController.assignPermissions);

/**
 * @openapi
 * /permissions:
 *   get:
 *     tags:
 *       - Permissions
 *     summary: List all permissions
 *     description: Retrieves all available permissions in the system (admin only)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/PermissionListResponse'
 *             example:
 *               message: "Permissions retrieved successfully"
 *               content:
 *                 - id: "456e7890-e89b-12d3-a456-426614174001"
 *                   name: "project:create"
 *                   description: "Create new projects"
 *                   module: "projects"
 *                 - id: "789e0123-e89b-12d3-a456-426614174002"
 *                   name: "task:manage"
 *                   description: "Manage tasks"
 *                   module: "tasks"
 *                 - id: "abc12345-e89b-12d3-a456-426614174003"
 *                   name: "user:admin"
 *                   description: "Administer users"
 *                   module: "users"
 *               messages: ["Permissions retrieved successfully"]
 *               code: "200"
 *               success: true
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin access required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/permissions", authGuard, RoleController.listPermissions);

export default router;
