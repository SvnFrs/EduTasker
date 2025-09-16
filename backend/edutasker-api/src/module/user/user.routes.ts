import { Router } from "express";
import { authGuard } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import * as UserController from "./user.controller.js";
import {
  updateProfileSchema,
  changePasswordSchema,
  updateAvatarSchema,
  userListQuerySchema,
  userIdParamSchema,
  updateUserByIdSchema,
} from "./user.schema.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: User unique identifier
 *         username:
 *           type: string
 *           description: Username
 *         email:
 *           type: string
 *           format: email
 *           description: User email address
 *         name:
 *           type: string
 *           description: User display name
 *         avatarUrl:
 *           type: string
 *           format: uri
 *           description: Avatar image URL
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Account creation timestamp
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Last update timestamp
 *     UserResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               $ref: '#/components/schemas/User'
 *     UserListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *             pagination:
 *               type: object
 *               properties:
 *                 content:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/User'
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
 * /users/me:
 *   get:
 *     tags:
 *       - User Profile
 *     summary: Get current user profile
 *     description: Retrieves the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               message: "Profile retrieved successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "john@example.com"
 *                 name: "John Doe"
 *                 avatarUrl: "https://example.com/avatar.jpg"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Profile retrieved successfully"]
 *               code: "200"
 *               success: true
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", authGuard, UserController.getProfile);

/**
 * @openapi
 * /users/me:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update current user profile
 *     description: Updates the authenticated user's profile information
 *     security:
 *       - bearerAuth: []
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
 *                 description: User display name
 *                 example: "John Doe"
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 description: Avatar image URL
 *                 example: "https://example.com/avatar.jpg"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               message: "Profile updated successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "john@example.com"
 *                 name: "John Doe Updated"
 *                 avatarUrl: "https://example.com/new-avatar.jpg"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Profile updated successfully"]
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
router.put("/me", authGuard, validate({ body: updateProfileSchema }), UserController.updateProfile);

/**
 * @openapi
 * /users/me/password:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Change user password
 *     description: Changes the authenticated user's password
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - currentPassword
 *               - newPassword
 *             properties:
 *               currentPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: Current password
 *                 example: "currentPassword123"
 *               newPassword:
 *                 type: string
 *                 minLength: 6
 *                 description: New password
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Password changed successfully
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
 *               message: "Password changed successfully"
 *               content:
 *                 message: "Password changed successfully"
 *               messages: ["Password changed successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Current password incorrect or validation error
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
router.put(
  "/me/password",
  authGuard,
  validate({ body: changePasswordSchema }),
  UserController.changePassword,
);

/**
 * @openapi
 * /users/me/avatar:
 *   put:
 *     tags:
 *       - User Profile
 *     summary: Update user avatar
 *     description: Updates the authenticated user's avatar image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - avatarUrl
 *             properties:
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 description: New avatar image URL
 *                 example: "https://example.com/new-avatar.jpg"
 *     responses:
 *       200:
 *         description: Avatar updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               message: "Avatar updated successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "john@example.com"
 *                 name: "John Doe"
 *                 avatarUrl: "https://example.com/new-avatar.jpg"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["Avatar updated successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Invalid URL or validation error
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
router.put(
  "/me/avatar",
  authGuard,
  validate({ body: updateAvatarSchema }),
  UserController.updateAvatar,
);

/**
 * @openapi
 * /users/:
 *   get:
 *     tags:
 *       - User Management
 *     summary: List all users
 *     description: Retrieves a paginated list of all users (admin only)
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
 *         description: Number of users per page
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for username, name, or email
 *         example: "john"
 *     responses:
 *       200:
 *         description: Users retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserListResponse'
 *             example:
 *               message: "Users retrieved successfully"
 *               content:
 *                 - id: "123e4567-e89b-12d3-a456-426614174000"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                   name: "John Doe"
 *                   avatarUrl: "https://example.com/avatar1.jpg"
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *                 - id: "456e7890-e89b-12d3-a456-426614174001"
 *                   username: "janedoe"
 *                   email: "jane@example.com"
 *                   name: "Jane Doe"
 *                   avatarUrl: "https://example.com/avatar2.jpg"
 *                   createdAt: "2023-01-01T00:00:00Z"
 *                   updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["Users retrieved successfully"]
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
router.get("/", authGuard, validate({ query: userListQuerySchema }), UserController.listUsers);

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     tags:
 *       - User Management
 *     summary: Get user by ID
 *     description: Retrieves a specific user's profile by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: User retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               message: "User retrieved successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "john@example.com"
 *                 name: "John Doe"
 *                 avatarUrl: "https://example.com/avatar.jpg"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-01T00:00:00Z"
 *               messages: ["User retrieved successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - User ID is required or invalid format
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authGuard, validate({ params: userIdParamSchema }), UserController.getUserById);

/**
 * @openapi
 * /users/{id}:
 *   put:
 *     tags:
 *       - User Management
 *     summary: Update user by ID
 *     description: Updates a specific user's profile by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
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
 *                 description: User display name
 *                 example: "John Doe Updated"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "john.updated@example.com"
 *               avatarUrl:
 *                 type: string
 *                 format: uri
 *                 description: Avatar image URL
 *                 example: "https://example.com/new-avatar.jpg"
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserResponse'
 *             example:
 *               message: "User updated successfully"
 *               content:
 *                 id: "123e4567-e89b-12d3-a456-426614174000"
 *                 username: "johndoe"
 *                 email: "john.updated@example.com"
 *                 name: "John Doe Updated"
 *                 avatarUrl: "https://example.com/new-avatar.jpg"
 *                 createdAt: "2023-01-01T00:00:00Z"
 *                 updatedAt: "2023-01-02T00:00:00Z"
 *               messages: ["User updated successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Validation error or User ID required
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put(
  "/:id",
  authGuard,
  validate({ params: userIdParamSchema, body: updateUserByIdSchema }),
  UserController.updateUserById,
);

/**
 * @openapi
 * /users/{id}:
 *   delete:
 *     tags:
 *       - User Management
 *     summary: Delete user by ID
 *     description: Permanently deletes a user account by ID (admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *         example: "123e4567-e89b-12d3-a456-426614174000"
 *     responses:
 *       200:
 *         description: User deleted successfully
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
 *               message: "User deleted successfully"
 *               content:
 *                 message: "User deleted successfully"
 *               messages: ["User deleted successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - User ID is required
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
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete(
  "/:id",
  authGuard,
  validate({ params: userIdParamSchema }),
  UserController.deleteUserById,
);

export default router;
