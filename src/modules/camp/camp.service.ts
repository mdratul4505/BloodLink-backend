import httpStatus from "http-status";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";

export const createCamp = async (
  userId: string,
  userRole: string,
  payload: {
    organizationId: string;
    title: string;
    description?: string;
    venue: string;
    district: string;
    date: string;
  },
) => {
  // Check organization exists and is verified
  const organization = await prisma.organization.findUnique({
    where: { id: payload.organizationId },
    include: {
      members: {
        where: { userId },
      },
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  if (organization.verificationStatus !== "APPROVED" && userRole !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only approved and verified organizations can organize donation camps",
    );
  }

  const isOwner = organization.ownerId === userId;
  const isMember = organization.members.length > 0;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isMember && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You are not affiliated with this organization",
    );
  }

  const camp = await prisma.donationCamp.create({
    data: {
      organizationId: payload.organizationId,
      title: payload.title,
      description: payload.description,
      venue: payload.venue,
      district: payload.district,
      date: new Date(payload.date),
      status: "UPCOMING",
    },
    include: {
      organization: {
        select: { id: true, name: true, contactPhone: true },
      },
    },
  });

  return camp;
};

export const getAllCamps = async (query: {
  district?: string;
  status?: any;
  organizationId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive",
    };
  }
  if (query.status) {
    whereClause.status = query.status;
  }
  if (query.organizationId) {
    whereClause.organizationId = query.organizationId;
  }

  const [camps, total] = await Promise.all([
    prisma.donationCamp.findMany({
      where: whereClause,
      include: {
        organization: {
          select: { id: true, name: true, district: true, contactPhone: true },
        },
        _count: {
          select: { registrations: true, donations: true },
        },
      },
      skip,
      take: limit,
      orderBy: { date: "asc" },
    }),
    prisma.donationCamp.count({ where: whereClause }),
  ]);

  return {
    camps,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getCampById = async (id: string) => {
  const camp = await prisma.donationCamp.findUnique({
    where: { id },
    include: {
      organization: true,
      registrations: {
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true },
          },
        },
      },
      donations: {
        include: {
          donor: {
            select: { id: true, name: true },
          },
        },
      },
    },
  });

  if (!camp) {
    throw new AppError(httpStatus.NOT_FOUND, "Donation camp not found");
  }

  return camp;
};

export const registerForCamp = async (campId: string, userId: string) => {
  const camp = await prisma.donationCamp.findUnique({
    where: { id: campId },
  });

  if (!camp) {
    throw new AppError(httpStatus.NOT_FOUND, "Donation camp not found");
  }

  if (camp.status === "COMPLETED" || camp.status === "CANCELLED") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot register for a ${camp.status.toLowerCase()} camp`,
    );
  }

  // Prevent duplicate registration
  const existing = await prisma.campRegistration.findUnique({
    where: {
      campId_userId: {
        campId,
        userId,
      },
    },
  });

  if (existing) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You are already registered for this donation camp",
    );
  }

  const registration = await prisma.campRegistration.create({
    data: {
      campId,
      userId,
      attendance: "REGISTERED",
    },
    include: {
      camp: true,
    },
  });

  // Create in-app notification
  try {
    await prisma.notification.create({
      data: {
        userId,
        type: "CAMP_UPDATE",
        title: "Camp Registration Confirmed",
        message: `You are registered for "${camp.title}" at ${camp.venue} on ${camp.date.toDateString()}.`,
      },
    });
  } catch (err) {
    console.error("Failed to send camp notification:", err);
  }

  return registration;
};

export const updateCampStatus = async (
  campId: string,
  userId: string,
  userRole: string,
  status: any,
) => {
  const camp = await prisma.donationCamp.findUnique({
    where: { id: campId },
    include: {
      organization: {
        include: { members: { where: { userId } } },
      },
    },
  });

  if (!camp) {
    throw new AppError(httpStatus.NOT_FOUND, "Donation camp not found");
  }

  const isOwner = camp.organization.ownerId === userId;
  const isMember = camp.organization.members.length > 0;
  const isAdmin = userRole === "ADMIN";

  if (!isOwner && !isMember && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to change this camp's status",
    );
  }

  const updatedCamp = await prisma.donationCamp.update({
    where: { id: campId },
    data: { status },
  });

  return updatedCamp;
};

export const CampService = {
  createCamp,
  getAllCamps,
  getCampById,
  registerForCamp,
  updateCampStatus,
};

export default CampService;
