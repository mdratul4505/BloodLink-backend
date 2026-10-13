import httpStatus from "http-status";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { deleteCacheByPattern } from "../../utils/cache.js";

export const getMyProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      ownedOrganizations: true,
      organizationMembers: {
        include: {
          organization: true,
        },
      },
      _count: {
        select: {
          donations: true,
          requestsMade: true,
          donorResponses: true,
        },
      },
    },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User profile not found");
  }

  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

export const updateMyProfile = async (
  userId: string,
  payload: {
    name?: string;
    phone?: string;
    avatar?: string;
    bloodGroup?: any;
    district?: string;
    upazila?: string;
    bio?: string;
    isAvailable?: boolean;
    lastDonationDate?: string | Date;
  },
) => {
  const result = await prisma.$transaction(async (tx) => {
    // Update user basic info
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        name: payload.name,
        phone: payload.phone,
        avatar: payload.avatar,
      },
    });

    // Check if donor profile exists
    if (
      payload.bloodGroup !== undefined ||
      payload.district !== undefined ||
      payload.upazila !== undefined ||
      payload.bio !== undefined ||
      payload.isAvailable !== undefined ||
      payload.lastDonationDate !== undefined
    ) {
      const existingProfile = await tx.donorProfile.findUnique({
        where: { userId },
      });

      if (existingProfile) {
        await tx.donorProfile.update({
          where: { userId },
          data: {
            bloodGroup: payload.bloodGroup,
            district: payload.district,
            upazila: payload.upazila,
            bio: payload.bio,
            isAvailable: payload.isAvailable,
            lastDonationDate: payload.lastDonationDate
              ? new Date(payload.lastDonationDate)
              : undefined,
          },
        });
      } else if (payload.bloodGroup && payload.district) {
        await tx.donorProfile.create({
          data: {
            userId,
            bloodGroup: payload.bloodGroup,
            district: payload.district,
            upazila: payload.upazila,
            bio: payload.bio,
            isAvailable: payload.isAvailable ?? true,
            lastDonationDate: payload.lastDonationDate
              ? new Date(payload.lastDonationDate)
              : undefined,
          },
        });
      }
    }

    return tx.user.findUnique({
      where: { id: userId },
      include: {
        donorProfile: true,
      },
    });
  });

  // Invalidate donor cache
  await deleteCacheByPattern("donors:*");

  if (!result) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};

export const updateDonorAvailability = async (
  userId: string,
  payload: {
    isAvailable: boolean;
    lastDonationDate?: string | Date;
  },
) => {
  const existingProfile = await prisma.donorProfile.findUnique({
    where: { userId },
  });

  if (!existingProfile) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Donor profile not found. Please setup your donor profile first.",
    );
  }

  const updatedProfile = await prisma.donorProfile.update({
    where: { userId },
    data: {
      isAvailable: payload.isAvailable,
      lastDonationDate: payload.lastDonationDate
        ? new Date(payload.lastDonationDate)
        : undefined,
    },
  });

  // Invalidate donor cache
  await deleteCacheByPattern("donors:*");

  return updatedProfile;
};

export const UserService = {
  getMyProfile,
  updateMyProfile,
  updateDonorAvailability,
};

export default UserService;
