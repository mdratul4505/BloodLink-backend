import httpStatus from "http-status";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { deleteCacheByPattern } from "../../utils/cache.js";

export const createBloodRequest = async (
  userId: string,
  payload: {
    patientName?: string;
    bloodGroup: any;
    units: number;
    hospitalName: string;
    district: string;
    upazila?: string;
    contactPhone: string;
    note?: string;
    urgency?: any;
    neededBy: string;
    organizationId?: string;
  },
) => {
  // Create blood request
  const bloodRequest = await prisma.bloodRequest.create({
    data: {
      requesterId: userId,
      organizationId: payload.organizationId,
      patientName: payload.patientName,
      bloodGroup: payload.bloodGroup,
      units: payload.units,
      hospitalName: payload.hospitalName,
      district: payload.district,
      upazila: payload.upazila,
      contactPhone: payload.contactPhone,
      note: payload.note,
      urgency: payload.urgency || "NORMAL",
      neededBy: new Date(payload.neededBy),
      status: "OPEN",
    },
    include: {
      requester: {
        select: { id: true, name: true, phone: true, email: true },
      },
      organization: {
        select: { id: true, name: true, contactPhone: true },
      },
    },
  });

  // Business rule: Matching donor notification without failing the request creation
  try {
    const matchingDonors = await prisma.donorProfile.findMany({
      where: {
        bloodGroup: payload.bloodGroup,
        district: {
          contains: payload.district,
          mode: "insensitive",
        },
        isAvailable: true,
        user: {
          id: { not: userId },
          deletedAt: null,
          status: "ACTIVE",
        },
      },
      select: {
        userId: true,
      },
      take: 20, // Notify top 20 matching donors
    });

    if (matchingDonors.length > 0) {
      await prisma.notification.createMany({
        data: matchingDonors.map((donor) => ({
          userId: donor.userId,
          requestId: bloodRequest.id,
          type: "NEW_MATCHING_REQUEST",
          title: `Urgent: ${payload.bloodGroup.replace("_", " ")} blood needed`,
          message: `${payload.units} unit(s) of ${payload.bloodGroup} needed at ${payload.hospitalName}, ${payload.district}.`,
        })),
      });
    }
  } catch (error) {
    console.error("Failed to notify matching donors:", error);
    // Silent fail so request creation is NOT rolled back
  }

  return bloodRequest;
};

export const getAllBloodRequests = async (query: {
  status?: any;
  bloodGroup?: any;
  district?: string;
  urgency?: any;
  organizationId?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {
    deletedAt: null,
  };

  if (query.status) {
    whereClause.status = query.status;
  }
  if (query.bloodGroup) {
    whereClause.bloodGroup = query.bloodGroup;
  }
  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive",
    };
  }
  if (query.urgency) {
    whereClause.urgency = query.urgency;
  }
  if (query.organizationId) {
    whereClause.organizationId = query.organizationId;
  }

  const [requests, total] = await Promise.all([
    prisma.bloodRequest.findMany({
      where: whereClause,
      include: {
        requester: {
          select: { id: true, name: true, phone: true },
        },
        organization: {
          select: { id: true, name: true, district: true },
        },
        _count: {
          select: { responses: true, donations: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.bloodRequest.count({ where: whereClause }),
  ]);

  return {
    requests,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getMyBloodRequests = async (userId: string) => {
  const requests = await prisma.bloodRequest.findMany({
    where: {
      requesterId: userId,
      deletedAt: null,
    },
    include: {
      responses: {
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              donorProfile: true,
            },
          },
        },
      },
      donations: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return requests;
};

export const getBloodRequestById = async (id: string) => {
  const bloodRequest = await prisma.bloodRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: { id: true, name: true, phone: true, email: true },
      },
      organization: {
        select: { id: true, name: true, district: true, contactPhone: true },
      },
      responses: {
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              phone: true,
              donorProfile: true,
            },
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

  if (!bloodRequest || bloodRequest.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood request not found");
  }

  return bloodRequest;
};

export const updateBloodRequest = async (
  requestId: string,
  userId: string,
  userRole: string,
  payload: any,
) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood request not found");
  }

  // Authorization check: creator, associated org, or admin
  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isCreator && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to edit this request",
    );
  }

  const updated = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: {
      ...payload,
      neededBy: payload.neededBy ? new Date(payload.neededBy) : undefined,
    },
  });

  return updated;
};

export const deleteBloodRequest = async (
  requestId: string,
  userId: string,
  userRole: string,
) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood request not found");
  }

  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isCreator && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to delete this request",
    );
  }

  await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { deletedAt: new Date(), status: "CANCELLED" },
  });

  return true;
};

export const updateRequestStatus = async (
  requestId: string,
  userId: string,
  userRole: string,
  status: any,
) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood request not found");
  }

  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isCreator && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the creator, associated organization, or Admin can update request status",
    );
  }

  const updated = await prisma.bloodRequest.update({
    where: { id: requestId },
    data: { status },
  });

  return updated;
};

export const respondToRequest = async (
  requestId: string,
  donorId: string,
  payload: { status: "AVAILABLE" | "UNABLE"; message?: string },
) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood request not found");
  }

  // Business rule: FULFILLED/CANCELLED/EXPIRED request-এ নতুন response বন্ধ
  if (["FULFILLED", "CANCELLED", "EXPIRED"].includes(request.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot respond to a ${request.status.toLowerCase()} request.`,
    );
  }

  // Business rule: duplicate response prevented via DB unique constraint + explicit check
  const existingResponse = await prisma.donorResponse.findUnique({
    where: {
      requestId_donorId: {
        requestId,
        donorId,
      },
    },
  });

  if (existingResponse) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already responded to this request.",
    );
  }

  const response = await prisma.donorResponse.create({
    data: {
      requestId,
      donorId,
      status: payload.status,
      message: payload.message,
    },
    include: {
      donor: {
        select: { id: true, name: true, phone: true },
      },
    },
  });

  // Notify requester
  try {
    await prisma.notification.create({
      data: {
        userId: request.requesterId,
        requestId: request.id,
        type: "DONOR_RESPONDED",
        title: "A donor has responded to your request",
        message: `${response.donor.name} marked their status as ${payload.status} for your ${request.bloodGroup} request.`,
      },
    });
  } catch (err) {
    console.error("Failed to notify requester:", err);
  }

  return response;
};

export const getResponsesForRequest = async (
  requestId: string,
  userId: string,
  userRole: string,
) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood request not found");
  }

  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isCreator && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view responses for this request",
    );
  }

  const responses = await prisma.donorResponse.findMany({
    where: { requestId },
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          donorProfile: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return responses;
};

/**
 * TECHNICAL CHALLENGE:
 * Complete donation marks donation in an atomic prisma.$transaction:
 * 1. Creates Donation record
 * 2. Updates DonorResponse status to DONATED
 * 3. Updates BloodRequest status (PARTIALLY_FULFILLED or FULFILLED) & unitsFulfilled
 * 4. Updates donor's lastDonationDate & totalDonations
 */
export const completeDonation = async (
  requestId: string,
  userId: string,
  userRole: string,
  payload: {
    donorId: string;
    units?: number;
    donatedAt?: string;
  },
) => {
  const request = await prisma.bloodRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "Blood request not found");
  }

  if (["CANCELLED", "EXPIRED"].includes(request.status)) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      `Cannot complete donation on a ${request.status.toLowerCase()} request`,
    );
  }

  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";

  if (!isCreator && !isAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Only the request creator or Admin can mark a donation as completed",
    );
  }

  const donationTime = payload.donatedAt ? new Date(payload.donatedAt) : new Date();
  const donatedUnits = payload.units || 1;
  const newUnitsFulfilled = request.unitsFulfilled + donatedUnits;
  const nextStatus =
    newUnitsFulfilled >= request.units ? "FULFILLED" : "PARTIALLY_FULFILLED";

  // TECHNICAL CHALLENGE ATOMIC TRANSACTION
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create Donation record
    const donation = await tx.donation.create({
      data: {
        requestId,
        donorId: payload.donorId,
        donatedAt: donationTime,
      },
    });

    // 2. Update DonorResponse status to DONATED (upsert in case of direct confirmation)
    await tx.donorResponse.upsert({
      where: {
        requestId_donorId: {
          requestId,
          donorId: payload.donorId,
        },
      },
      update: {
        status: "DONATED",
      },
      create: {
        requestId,
        donorId: payload.donorId,
        status: "DONATED",
      },
    });

    // 3. Update BloodRequest unitsFulfilled and status
    const updatedRequest = await tx.bloodRequest.update({
      where: { id: requestId },
      data: {
        unitsFulfilled: newUnitsFulfilled,
        status: nextStatus,
      },
    });

    // 4. Update donor's lastDonationDate and totalDonations
    await tx.donorProfile.updateMany({
      where: { userId: payload.donorId },
      data: {
        lastDonationDate: donationTime,
        totalDonations: { increment: donatedUnits },
      },
    });

    // 5. In-app notification to donor
    await tx.notification.create({
      data: {
        userId: payload.donorId,
        requestId,
        type: "RESPONSE_CONFIRMED",
        title: "Donation Completed! 🎉",
        message: `Your donation of ${donatedUnits} unit(s) for request #${requestId.slice(0, 8)} has been confirmed. Thank you for saving a life!`,
      },
    });

    return { donation, updatedRequest };
  });

  // Invalidate donor caches
  await deleteCacheByPattern("donors:*");

  return result;
};

export const BloodRequestService = {
  createBloodRequest,
  getAllBloodRequests,
  getMyBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  updateRequestStatus,
  respondToRequest,
  getResponsesForRequest,
  completeDonation,
};

export default BloodRequestService;
