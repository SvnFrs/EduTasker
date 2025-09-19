import { Router } from "express";
import { authGuard, validate } from "../../middleware/index.js";
import * as RoleController from "./role.controller.js";
import {
  createRoleSchema,
  roleIdParamSchema,
  roleListQuerySchema,
  updateRoleSchema,
} from "./role.schema.js";

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
 *         code:
 *           type: string
 *           description: Role code
 *         _count:
 *           type: object
 *           properties:
 *             users:
 *               type: number
 *               description: Number of users with this role
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
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Role code
 *                 example: "PROJECT_MANAGER"
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
 *                 code: "PROJECT_MANAGER"
 *                 _count:
 *                   users: 5
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
 *         name: limit
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
 *                   code: "PROJECT_MANAGER"
 *                   _count:
 *                     users: 5
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
router.get("/", validate({ query: roleListQuerySchema }), RoleController.listRoles);

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
 *                 code: "PROJECT_MANAGER"
 *                 _count:
 *                   users: 5
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
router.get("/:id", validate({ params: roleIdParamSchema }), RoleController.getRoleById);

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
 *               code:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 50
 *                 description: Role code
 *                 example: "SENIOR_PROJECT_MANAGER"
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
 *                 code: "SENIOR_PROJECT_MANAGER"
 *                 _count:
 *                   users: 3
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
router.put(
  "/:id",
  authGuard,
  validate({ params: roleIdParamSchema, body: updateRoleSchema }),
  RoleController.updateRole,
);

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
router.delete(
  "/:id",
  authGuard,
  validate({ params: roleIdParamSchema }),
  RoleController.deleteRole,
);

export default router;
