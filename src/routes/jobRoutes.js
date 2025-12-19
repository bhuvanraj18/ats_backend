import express from "express";
import {
  createJob,
  deleteJob,
  getJobById,
  getJobs,
  updateJob
} from "../controllers/jobController.js";
import { authenticate, authorizeRoles } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", authenticate, authorizeRoles("RECRUITER"), createJob);
router.get("/", getJobs);
router.get("/:id", getJobById);
router.put("/:id", authenticate, authorizeRoles("RECRUITER"), updateJob);
router.delete("/:id", authenticate, authorizeRoles("RECRUITER"), deleteJob);

export default router;
