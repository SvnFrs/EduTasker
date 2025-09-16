import { Router } from "express";
import { authGuard } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import * as MentorController from './mentor.controller.js';
import {
  createMentorSchema,
  updateMentorSchema,
  updateMentorByIdSchema,
  mentorListQuerySchema,
  mentorIdParamSchema,
  userIdParamSchema
} from './mentor.schema.js';

const router = Router();

/**
 * @openapi
 * components:
 *   schemas:
 *     Mentor:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Mentor unique identifier
 *         userId:
 *           type: string
 *           format: uuid
 *           description: Associated user ID
 *         expertise:
 *           type: string
 *           description: Mentor's area of expertise
 *         bio:
 *           type: string
 *           description: Mentor's biography
 *         verified:
 *           type: boolean
 *           description: Whether the mentor is verified
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
 *               format: email
 *             avatarUrl:
 *               type: string
 *               format: uri
 *     MentorWithProjects:
 *       allOf:
 *         - $ref: '#/components/schemas/Mentor'
 *         - type: object
 *           properties:
 *             projects:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     format: uuid
 *                   name:
 *                     type: string
 *                   description:
 *                     type: string
 *                   status:
 *                     type: string
 *                   deadline:
 *                     type: string
 *                     format: date-time
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *     MentorResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               $ref: '#/components/schemas/Mentor'
 *     MentorListResponse:
 *       allOf:
 *         - $ref: '#/components/schemas/ServiceWrapperResponse'
 *         - type: object
 *           properties:
 *             content:
 *               type: object
 *               properties:
 *                 mentors:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Mentor'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */

/**
 * @openapi
 * /api/mentors:
 *   post:
 *     tags:
 *       - Mentors
 *     summary: Create a new mentor
 *     security:
 *       - bearerAuth: []
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
 *                 description: User ID to create mentor for
 *               expertise:
 *                 type: string
 *                 description: Mentor's area of expertise
 *                 maxLength: 500
 *               bio:
 *                 type: string
 *                 description: Mentor's biography
 *                 maxLength: 1000
 *           example:
 *             userId: "123e4567-e89b-12d3-a456-426614174000"
 *             expertise: "Web Development, JavaScript, React"
 *             bio: "Experienced full-stack developer with 5+ years in the industry"
 *     responses:
 *       201:
 *         description: Mentor created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       400:
 *         description: Bad request
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
router.post("/", authGuard, validate({ body: createMentorSchema }), MentorController.createMentor);

/**
 * @openapi
 * /api/mentors:
 *   get:
 *     tags:
 *       - Mentors
 *     summary: Get all mentors with filtering and pagination
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of mentors per page
 *       - in: query
 *         name: verified
 *         schema:
 *           type: string
 *           enum: [true, false]
 *         description: Filter by verification status
 *       - in: query
 *         name: expertise
 *         schema:
 *           type: string
 *         description: Filter by expertise (partial match)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in name, expertise, or bio
 *     responses:
 *       200:
 *         description: Mentors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorListResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", authGuard, validate({ query: mentorListQuerySchema }), MentorController.getAllMentors);

/**
 * @openapi
 * /api/mentors/verified:
 *   get:
 *     tags:
 *       - Mentors
 *     summary: Get verified mentors
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of mentors to return
 *     responses:
 *       200:
 *         description: Verified mentors retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ServiceWrapperResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Mentor'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/verified", authGuard, MentorController.getVerifiedMentors);

/**
 * @openapi
 * /api/mentors/me:
 *   get:
 *     tags:
 *       - Mentors
 *     summary: Get my mentor profile
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Mentor profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/me", authGuard, MentorController.getMyMentorProfile);

/**
 * @openapi
 * /api/mentors/me:
 *   put:
 *     tags:
 *       - Mentors
 *     summary: Update my mentor profile
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: string
 *                 maxLength: 500
 *                 description: Mentor's area of expertise
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Mentor's biography
 *           example:
 *             expertise: "Full-stack Development, Node.js, React, TypeScript"
 *             bio: "Passionate developer with expertise in modern web technologies"
 *     responses:
 *       200:
 *         description: Mentor profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       400:
 *         description: Bad request
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
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/me", authGuard, validate({ body: updateMentorSchema }), MentorController.updateMyMentorProfile);

/**
 * @openapi
 * /api/mentors/{id}:
 *   get:
 *     tags:
 *       - Mentors
 *     summary: Get mentor by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mentor ID
 *     responses:
 *       200:
 *         description: Mentor retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id", authGuard, validate({ params: mentorIdParamSchema }), MentorController.getMentorById);

/**
 * @openapi
 * /api/mentors/{id}/projects:
 *   get:
 *     tags:
 *       - Mentors
 *     summary: Get mentor with their projects
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mentor ID
 *     responses:
 *       200:
 *         description: Mentor with projects retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ServiceWrapperResponse'
 *                 - type: object
 *                   properties:
 *                     content:
 *                       $ref: '#/components/schemas/MentorWithProjects'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id/projects", authGuard, validate({ params: mentorIdParamSchema }), MentorController.getMentorWithProjects);

/**
 * @openapi
 * /api/mentors/{id}/verify:
 *   put:
 *     tags:
 *       - Mentors
 *     summary: Verify mentor (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mentor ID
 *     responses:
 *       200:
 *         description: Mentor verified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id/verify", authGuard, validate({ params: mentorIdParamSchema }), MentorController.verifyMentor);

/**
 * @openapi
 * /api/mentors/{id}/unverify:
 *   put:
 *     tags:
 *       - Mentors
 *     summary: Unverify mentor (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mentor ID
 *     responses:
 *       200:
 *         description: Mentor unverified successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id/unverify", authGuard, validate({ params: mentorIdParamSchema }), MentorController.unverifyMentor);

/**
 * @openapi
 * /api/mentors/user/{userId}:
 *   get:
 *     tags:
 *       - Mentors
 *     summary: Get mentor by user ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *     responses:
 *       200:
 *         description: Mentor retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/user/:userId", authGuard, validate({ params: userIdParamSchema }), MentorController.getMentorByUserId);

/**
 * @openapi
 * /api/mentors/{id}:
 *   put:
 *     tags:
 *       - Mentors
 *     summary: Update mentor by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mentor ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               expertise:
 *                 type: string
 *                 maxLength: 500
 *                 description: Mentor's area of expertise
 *               bio:
 *                 type: string
 *                 maxLength: 1000
 *                 description: Mentor's biography
 *               verified:
 *                 type: boolean
 *                 description: Verification status
 *           example:
 *             expertise: "Advanced React, Node.js, GraphQL"
 *             bio: "Senior developer with 8+ years experience"
 *             verified: true
 *     responses:
 *       200:
 *         description: Mentor updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MentorResponse'
 *       400:
 *         description: Bad request
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
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id", authGuard, validate({ params: mentorIdParamSchema, body: updateMentorByIdSchema }), MentorController.updateMentorById);

/**
 * @openapi
 * /api/mentors/{id}:
 *   delete:
 *     tags:
 *       - Mentors
 *     summary: Delete mentor by ID (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Mentor ID
 *     responses:
 *       200:
 *         description: Mentor deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ServiceWrapperResponse'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       403:
 *         description: Forbidden - Admin role required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       404:
 *         description: Mentor not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id", authGuard, validate({ params: mentorIdParamSchema }), MentorController.deleteMentorById);

export default router;
