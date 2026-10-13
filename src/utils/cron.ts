import cron from "node-cron";
import prisma from "../config/prisma.js";

export const expireOldBloodRequests = async (): Promise<number> => {
  try {
    const now = new Date();

    // Find requests that are past neededBy time and still OPEN or PARTIALLY_FULFILLED
    const expiredRequests = await prisma.bloodRequest.findMany({
      where: {
        status: { in: ["OPEN", "PARTIALLY_FULFILLED"] },
        neededBy: { lt: now },
        deletedAt: null,
      },
      select: {
        id: true,
        requesterId: true,
        bloodGroup: true,
      },
    });

    if (expiredRequests.length === 0) {
      return 0;
    }

    const requestIds = expiredRequests.map((r) => r.id);

    // Update statuses to EXPIRED
    await prisma.bloodRequest.updateMany({
      where: {
        id: { in: requestIds },
      },
      data: {
        status: "EXPIRED",
      },
    });

    // Notify requesters that request has expired
    await prisma.notification.createMany({
      data: expiredRequests.map((req) => ({
        userId: req.requesterId,
        requestId: req.id,
        type: "REQUEST_STATUS_CHANGED",
        title: "Blood Request Expired",
        message: `Your blood request for ${req.bloodGroup} has expired as the needed date/time has passed.`,
      })),
    });

    console.log(`[Cron] Marked ${expiredRequests.length} expired blood requests as EXPIRED.`);
    return expiredRequests.length;
  } catch (error) {
    console.error("[Cron] Error expiring old blood requests:", error);
    return 0;
  }
};

export const initScheduledJobs = (): void => {
  // Run every 10 minutes: */10 * * * *
  cron.schedule("*/10 * * * *", async () => {
    console.log("[Cron] Running expired blood requests check...");
    await expireOldBloodRequests();
  });

  console.log("[Cron] Blood request expiration scheduler initialized.");
};

export default initScheduledJobs;
