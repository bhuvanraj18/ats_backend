import express from "express";
import {
  applyForJob,
  updateApplicationStage,
  getApplicationById,
  getMyApplications
} from "../controllers/applicationController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Candidate
router.post(
  "/",
  authenticate,
  authorizeRoles("CANDIDATE"),
  applyForJob
);

// Recruiter
router.patch(
  "/:id/stage",
  authenticate,
  authorizeRoles("RECRUITER"),
  updateApplicationStage
);

// Shared
router.get("/:id", authenticate, getApplicationById);
router.get("/", authenticate, getMyApplications);

export default router;
