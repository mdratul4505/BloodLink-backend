import httpStatus from "http-status";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { getCache, setCache } from "../../utils/cache.js";

const STATS_CACHE_KEY = "admin:stats";

export const getAllUsers = async (query: {
  role?: any;
  status?: any;
  search?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    deletedAt: null,
  };

  if (query.role) whereClause.role = query.role;
  if (query.status) whereClause.status = query.status;
  if (query.search) {
    whereClause.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        donorProfile: true,
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where: whereClause }),
  ]);

  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const updateUserStatus = async (
  userId: string,
  adminId: string,
  payload: { status: "ACTIVE" | "SUSPENDED"; reason?: string },
) => {
  const targetUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!targetUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  if (targetUser.role === "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Cannot suspend an administrator account",
    );
  }

  const updatedUser = await prisma.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { status: payload.status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
    });

    // Record Audit Log
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `USER_STATUS_${payload.status}`,
        targetType: "User",
        targetId: userId,
        details: { reason: payload.reason, newStatus: payload.status },
      },
    });

    return user;
  });

  return updatedUser;
};

export const verifyOrganization = async (
  organizationId: string,
  adminId: string,
  payload: {
    verificationStatus: "APPROVED" | "REJECTED";
    rejectionReason?: string;
  },
) => {
  const organization = await prisma.organization.findUnique({
    where: { id: organizationId },
    include: { owner: true },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  const updatedOrg = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: {
        verificationStatus: payload.verificationStatus,
        rejectionReason: payload.rejectionReason,
      },
    });

    // If approved, elevate owner role to ORGANIZATION (Security rule compliance)
    if (payload.verificationStatus === "APPROVED" && organization.owner.role === "USER") {
      await tx.user.update({
        where: { id: organization.ownerId },
        data: { role: "ORGANIZATION" },
      });
    }

    // Record Audit Log
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `ORGANIZATION_VERIFICATION_${payload.verificationStatus}`,
        targetType: "Organization",
        targetId: organizationId,
        details: {
          name: organization.name,
          verificationStatus: payload.verificationStatus,
          rejectionReason: payload.rejectionReason,
        },
      },
    });

    // In-app notification to organization owner
    await tx.notification.create({
      data: {
        userId: organization.ownerId,
        type: "SYSTEM",
        title: `Organization ${payload.verificationStatus === "APPROVED" ? "Approved! ✅" : "Rejected"}`,
        message:
          payload.verificationStatus === "APPROVED"
            ? `Congratulations! Your organization "${organization.name}" has been approved. You can now coordinate blood requests and host camps.`
            : `Your organization application for "${organization.name}" was rejected. Reason: ${payload.rejectionReason || "Requirements not met"}`,
      },
    });

    return org;
  });

  return updatedOrg;
};

export const getDashboardStats = async () => {
  // Check Redis cache: admin:stats (TTL 5 minutes)
  const cachedStats = await getCache<any>(STATS_CACHE_KEY);
  if (cachedStats) {
    return cachedStats;
  }

  const [
    totalUsers,
    totalDonors,
    activeDonors,
    totalRequests,
    fulfilledRequests,
    totalOrganizations,
    verifiedOrganizations,
    totalCamps,
    totalDonations,
    paymentsAgg,
    recentRequests,
  ] = await Promise.all([
    prisma.user.count({ where: { deletedAt: null } }),
    prisma.donorProfile.count(),
    prisma.donorProfile.count({ where: { isAvailable: true } }),
    prisma.bloodRequest.count({ where: { deletedAt: null } }),
    prisma.bloodRequest.count({ where: { status: "FULFILLED" } }),
    prisma.organization.count(),
    prisma.organization.count({ where: { verificationStatus: "APPROVED" } }),
    prisma.donationCamp.count(),
    prisma.donation.count(),
    prisma.payment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: "PAID" },
    }),
    prisma.bloodRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { name: true, phone: true } },
      },
    }),
  ]);

  const stats = {
    overview: {
      totalUsers,
      totalDonors,
      activeDonors,
      totalRequests,
      fulfilledRequests,
      totalOrganizations,
      verifiedOrganizations,
      totalCamps,
      totalDonations,
      totalCollectedFunds: paymentsAgg._sum.amount || 0,
      totalPaidDonationsCount: paymentsAgg._count.id || 0,
    },
    recentRequests,
  };

  // Cache stats for 5 minutes (300 seconds)
  await setCache(STATS_CACHE_KEY, stats, 300);

  return stats;
};

export const getAuditLogs = async (query: { page?: number; limit?: number }) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.auditLog.count(),
  ]);

  return {
    logs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAdminPayments = async (query: {
  status?: any;
  page?: number;
  limit?: number;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const skip = (page - 1) * limit;

  const whereClause: any = {};
  if (query.status) whereClause.status = query.status;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where: whereClause }),
  ]);

  return {
    payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const AdminService = {
  getAllUsers,
  updateUserStatus,
  verifyOrganization,
  getDashboardStats,
  getAuditLogs,
  getAdminPayments,
};

export default AdminService;
