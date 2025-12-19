const prisma = require('../utils/prismaClient');
const queue = require('../services/queueService');

const VALID_TRANSITIONS = {
    APPLIED: ['SCREENING', 'REJECTED'],
    SCREENING: ['INTERVIEW', 'REJECTED'],
    INTERVIEW: ['OFFER', 'REJECTED'],
    OFFER: ['HIRED', 'REJECTED'],
    HIRED: [],
    REJECTED: []
};

exports.transitionApplication = async (applicationId, newStage, actorId) => {
    return await prisma.$transaction(async (tx) => {
        // Include candidate to get email
        const application = await tx.application.findUnique({
            where: { id: applicationId },
            include: { candidate: true }
        });
        if (!application) throw new Error('Application not found');

        const currentStage = application.stage;

        // Validate transition
        const allowed = VALID_TRANSITIONS[currentStage];
        if (!allowed || !allowed.includes(newStage)) {
            throw new Error(`Invalid transition from ${currentStage} to ${newStage}`);
        }

        // Update Application
        const updatedApplication = await tx.application.update({
            where: { id: applicationId },
            data: { stage: newStage }
        });

        // Create History
        await tx.applicationHistory.create({
            data: {
                applicationId,
                fromStage: currentStage,
                toStage: newStage,
                changedById: actorId
            }
        });

        // Enqueue Notification
        await queue.addNotification({
            type: 'STAGE_CHANGED',
            email: application.candidate.email,
            applicationId,
            newStage
        });

        return updatedApplication;
    });
};
