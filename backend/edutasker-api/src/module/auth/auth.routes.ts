import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import * as AuthController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     ServiceWrapperResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           description: Primary message
 *         content:
 *           type: object
 *           description: Response data
 *         messages:
 *           type: array
 *           items:
 *             type: string
 *           description: Array of messages
 *         code:
 *           type: string
 *           description: Response code
 *         success:
 *           type: boolean
 *           description: Success status
 *         pagination:
 *           type: object
 *           description: Pagination info (if applicable)
 *           properties:
 *             content:
 *               type: array
 *               items:
 *                 type: object
 *             page:
 *               type: number
 *             size:
 *               type: number
 *             totalPages:
 *               type: number
 *             totalElements:
 *               type: number
 *     AuthResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *                 token:
 *                   type: string
 *                 refreshToken:
 *                   type: string
 *     ErrorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             success:
 *               type: boolean
 *               example: false
 *             content:
 *               type: null
 *               example: null
 */

/**
 * @openapi
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new user
 *     description: Creates a new user account with username and password
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *               - email
 *             properties:
 *               username:
 *                 type: string
 *                 description: Unique username
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "securePassword123"
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User email address
 *                 example: "john@example.com"
 *     responses:
 *       200:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "User registered successfully"
 *               content:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               messages: ["User registered successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Bad request - Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Username already exists"
 *               content: null
 *               messages: ["Username already exists"]
 *               code: "400"
 *               success: false
 */
router.post("/register", [validate({
  body: registerSchema
})], AuthController.register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login a user
 *     description: Authenticates user and returns JWT tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 description: Username or email
 *                 example: "johndoe"
 *               password:
 *                 type: string
 *                 description: User password
 *                 example: "securePassword123"
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *             example:
 *               message: "User logged in successfully"
 *               content:
 *                 user:
 *                   id: "123e4567-e89b-12d3-a456-426614174000"
 *                   username: "johndoe"
 *                   email: "john@example.com"
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               messages: ["User logged in successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               message: "Invalid username or password"
 *               content: null
 *               messages: ["Invalid username or password"]
 *               code: "400"
 *               success: false
 */
router.post("/login", validate({
  body: loginSchema
}), AuthController.login);

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Refresh authentication token
 *     description: Generates new access token using refresh token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Valid refresh token
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: Token refreshed successfully
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
 *                         token:
 *                           type: string
 *                         refreshToken:
 *                           type: string
 *             example:
 *               message: "Token refreshed successfully"
 *               content:
 *                 token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *                 refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *               messages: ["Token refreshed successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Invalid refresh token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/refresh", AuthController.refreshToken);

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Logout user
 *     description: Invalidates user session and tokens
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token to invalidate
 *                 example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *     responses:
 *       200:
 *         description: User logged out successfully
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
 *               message: "User logged out successfully"
 *               content:
 *                 message: "Session terminated"
 *               messages: ["User logged out successfully"]
 *               code: "200"
 *               success: true
 *       400:
 *         description: Logout failed
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post("/logout", AuthController.logout);

export default router;
