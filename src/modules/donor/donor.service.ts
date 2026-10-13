import httpStatus from "http-status";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { getCache, setCache } from "../../utils/cache.js";

export const getAllDonors = async (query: {
  bloodGroup?: any;
  district?: string;
  upazila?: string;
  isAvailable?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  // Cache key matching requirements: donors:{bloodGroup}:{district}:{page}
  const bgKey = query.bloodGroup || "all";
  const distKey = query.district?.toLowerCase().trim() || "all";
  const cacheKey = `donors:${bgKey}:${distKey}:${page}`;

  // Check cache
  const cachedData = await getCache<{ donors: any[]; meta: any }>(cacheKey);
  if (cachedData) {
    return cachedData;
  }

  const whereClause: any = {
    user: {
      deletedAt: null,
      status: "ACTIVE",
    },
  };

  if (query.bloodGroup) {
    whereClause.bloodGroup = query.bloodGroup;
  }

  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive",
    };
  }

  if (query.upazila) {
    whereClause.upazila = {
      contains: query.upazila,
      mode: "insensitive",
    };
  }

  if (query.isAvailable !== undefined) {
    whereClause.isAvailable = query.isAvailable;
  }

  const [donors, total] = await Promise.all([
    prisma.donorProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true,
          },
        },
      },
      skip,
      take: limit,
      orderBy: query.sortBy
        ? { [query.sortBy]: query.sortOrder || "desc" }
        : { isAvailable: "desc" },
    }),
    prisma.donorProfile.count({ where: whereClause }),
  ]);

  const result = {
    donors,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };

  // Cache for 10 minutes (600s)
  await setCache(cacheKey, result, 600);

  return result;
};

export const getDonorById = async (id: string) => {
  const donor = await prisma.donorProfile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
      user: {
        deletedAt: null,
        status: "ACTIVE",
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
          reviewsReceived: {
            include: {
              reviewer: {
                select: { id: true, name: true, avatar: true },
              },
            },
          },
        },
      },
    },
  });

  if (!donor) {
    throw new AppError(httpStatus.NOT_FOUND, "Donor profile not found");
  }

  return donor;
};

export const DonorService = {
  getAllDonors,
  getDonorById,
};

export default DonorService;
