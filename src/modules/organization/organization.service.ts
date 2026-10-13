import httpStatus from "http-status";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";

export const applyOrganization = async (
  userId: string,
  payload: {
    name: string;
    type?: any;
    address: string;
    district: string;
    upazila?: string;
    contactPhone: string;
    email?: string;
  },
) => {
  // Check if organization with same name already exists
  const existingOrg = await prisma.organization.findFirst({
    where: { name: { equals: payload.name, mode: "insensitive" } },
  });

  if (existingOrg) {
    throw new AppError(
      httpStatus.CONFLICT,
      "An organization with this name already exists",
    );
  }

  // Create organization with verificationStatus: PENDING
  const organization = await prisma.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: payload.name,
        type: payload.type || "HOSPITAL",
        address: payload.address,
        district: payload.district,
        upazila: payload.upazila,
        contactPhone: payload.contactPhone,
        email: payload.email,
        verificationStatus: "PENDING",
        ownerId: userId,
      },
    });

    // Add applicant as OrganizationMember with ADMIN role
    await tx.organizationMember.create({
      data: {
        organizationId: org.id,
        userId,
        roleInOrg: "ADMIN",
      },
    });

    // Create Audit Log
    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "ORGANIZATION_APPLICATION_SUBMITTED",
        targetType: "Organization",
        targetId: org.id,
        details: { name: org.name, type: org.type, district: org.district },
      },
    });

    return org;
  });

  return organization;
};

export const getAllOrganizations = async (query: {
  verificationStatus?: any;
  type?: any;
  district?: string;
  page?: number;
  limit?: number;
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const whereClause: any = {};

  if (query.verificationStatus) {
    whereClause.verificationStatus = query.verificationStatus;
  }
  if (query.type) {
    whereClause.type = query.type;
  }
  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive",
    };
  }

  const [organizations, total] = await Promise.all([
    prisma.organization.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true },
        },
        _count: {
          select: { members: true, camps: true, coordinatedRequests: true },
        },
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.organization.count({ where: whereClause }),
  ]);

  return {
    organizations,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getOrganizationById = async (id: string) => {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, phone: true },
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true },
          },
        },
      },
      camps: {
        orderBy: { date: "desc" },
        take: 5,
      },
      coordinatedRequests: {
        orderBy: { createdAt: "desc" },
        take: 5,
      },
      _count: {
        select: { members: true, camps: true, coordinatedRequests: true },
      },
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  return organization;
};

export const updateOrganization = async (
  id: string,
  userId: string,
  userRole: string,
  payload: any,
) => {
  const organization = await prisma.organization.findUnique({
    where: { id },
    include: {
      members: {
        where: { userId, roleInOrg: "ADMIN" },
      },
    },
  });

  if (!organization) {
    throw new AppError(httpStatus.NOT_FOUND, "Organization not found");
  }

  const isOwner = organization.ownerId === userId;
  const isOrgAdmin = organization.members.length > 0;
  const isSystemAdmin = userRole === "ADMIN";

  if (!isOwner && !isOrgAdmin && !isSystemAdmin) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to manage this organization",
    );
  }

  const updated = await prisma.organization.update({
    where: { id },
    data: payload,
  });

  return updated;
};

export const OrganizationService = {
  applyOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization,
};

export default OrganizationService;
