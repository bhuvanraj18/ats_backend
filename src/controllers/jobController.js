import prisma from "../config/prismaClient.js";

/**
 * CREATE JOB
 */
export const createJob = async (req, res) => {
  try {
    const { title, description, status } = req.body;

    const job = await prisma.job.create({
      data: {
        title,
        description,
        status,
        companyId: req.user.companyId
      }
    });

    res.status(201).json(job);
  } catch (err) {
    console.error("Create job error:", err);
    res.status(500).json({ error: "Failed to create job" });
  }
};

/**
 * GET ALL JOBS
 */
export const getJobs = async (req, res) => {
  try {
    const jobs = await prisma.job.findMany();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch jobs" });
  }
};

/**
 * GET JOB BY ID
 */
export const getJobById = async (req, res) => {
  try {
    const job = await prisma.job.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!job) {
      return res.status(404).json({ error: "Job not found" });
    }

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch job" });
  }
};

/**
 * UPDATE JOB
 */
export const updateJob = async (req, res) => {
  try {
    const job = await prisma.job.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });

    res.json(job);
  } catch (err) {
    res.status(500).json({ error: "Failed to update job" });
  }
};

/**
 * DELETE JOB  ✅ THIS WAS MISSING
 */
export const deleteJob = async (req, res) => {
  try {
    await prisma.job.delete({
      where: { id: Number(req.params.id) }
    });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: "Failed to delete job" });
  }
};
