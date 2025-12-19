import prisma from "../config/prismaClient.js";

/**
 * APPLY FOR JOB (Candidate only)
 * POST /applications
 */
export const applyForJob = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jobId } = req.body;

    // Check job exists and is open
    const job = await prisma.job.findUnique({
      where: { id: Number(jobId) }
    });

    if (!job || job.status !== "OPEN") {
      return res.status(400).json({ error: "Job is not open or does not exist" });
    }

    // Create application + history in transaction
    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.application.create({
        data: {
          jobId: Number(jobId),
          candidateId: userId,
          stage: "APPLIED"
        }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId: app.id,
          fromStage: null,
          toStage: "APPLIED",
          changedById: userId
        }
      });

      return app;
    });

    res.status(201).json({
      message: "Application submitted successfully",
      application
    });
  } catch (err) {
    console.error("Apply job error:", err);
    res.status(500).json({ error: "Failed to apply for job" });
  }
};

/**
 * UPDATE APPLICATION STAGE (Recruiter only)
 * PATCH /applications/:id/stage
 */
export const updateApplicationStage = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);
    const { stage } = req.body;

    const application = await prisma.application.findUnique({
      where: { id: applicationId }
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    // Simple workflow validation
    const validTransitions = {
      APPLIED: ["SCREENING", "REJECTED"],
      SCREENING: ["INTERVIEW", "REJECTED"],
      INTERVIEW: ["OFFER", "REJECTED"],
      OFFER: ["HIRED", "REJECTED"]
    };

    const currentStage = application.stage;
    const allowedStages = validTransitions[currentStage] || [];

    if (!allowedStages.includes(stage)) {
      return res.status(400).json({
        error: `Invalid stage transition from ${currentStage} to ${stage}`
      });
    }

    // Update application + history
    const updatedApp = await prisma.$transaction(async (tx) => {
      const updated = await tx.application.update({
        where: { id: applicationId },
        data: { stage }
      });

      await tx.applicationHistory.create({
        data: {
          applicationId,
          fromStage: currentStage,
          toStage: stage,
          changedById: req.user.id
        }
      });

      return updated;
    });

    res.json({
      message: "Application stage updated successfully",
      application: updatedApp
    });
  } catch (err) {
    console.error("Update stage error:", err);
    res.status(500).json({ error: "Failed to update stage" });
  }
};

/**
 * GET APPLICATION BY ID
 * GET /applications/:id
 */
export const getApplicationById = async (req, res) => {
  try {
    const applicationId = Number(req.params.id);

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        job: true,
        applicationHistory: true
      }
    });

    if (!application) {
      return res.status(404).json({ error: "Application not found" });
    }

    res.json(application);
  } catch (err) {
    console.error("Get application error:", err);
    res.status(500).json({ error: "Failed to fetch application" });
  }
};

/**
 * GET MY APPLICATIONS (Candidate)
 * GET /applications
 */
export const getMyApplications = async (req, res) => {
  try {
    const userId = req.user.id;

    const applications = await prisma.application.findMany({
      where: { candidateId: userId },
      include: { job: true }
    });

    res.json(applications);
  } catch (err) {
    console.error("Get my applications error:", err);
    res.status(500).json({ error: "Failed to fetch applications" });
  }
};
