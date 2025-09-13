
import { Router } from "express";
import { validate } from "../../middleware/validate.middleware.js";
import * as AuthController from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.schema.js";
const router = Router();
/**
 * @openapi
 * /register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered
 *       400:
 *         description: Bad request
 */

router.post("/register", [validate({
    body: registerSchema
})], AuthController.register);

/**
 * @openapi
 * /login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Unauthorized
 */
router.post("/login", validate({
    body: loginSchema
}), AuthController.login);


router.post("/refresh", AuthController.refreshToken);

router.post("/logout", AuthController.logout);

export default router;
