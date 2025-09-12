

import { Router } from "express";
import { authGuard } from '../../middleware/auth.middleware.ts';
import * as UserController from './user.controller.ts';

const router = Router();

/**
 * @openapi
 * /me:
 *   get:
 *     summary: Get current user profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authGuard, UserController.getProfile);

export default router;
