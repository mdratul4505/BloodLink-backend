import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import { createToken, verifyToken } from "../../utils/jwt.js";
import { blacklistToken } from "../../utils/tokenBlacklist.js";

export const registerUser = async (payload: {
  name: string;
  email: string;
  password: string;
  phone?: string;
  isDonor?: boolean;
  bloodGroup?: any;
  district?: string;
  upazila?: string;
}) => {
  const existingUser = await prisma.user.findUnique({
    where: { email: payload.email },
  });

  if (existingUser) {
    throw new AppError(httpStatus.CONFLICT, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds,
  );

  const result = await prisma.$transaction(async (tx) => {
    // ALWAYS role: USER (Security rule)
    const newUser = await tx.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        password: hashedPassword,
        phone: payload.phone,
        role: "USER",
        status: "ACTIVE",
        isVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
      },
    });

    // Create donor profile if bloodGroup and district are provided
    if (payload.bloodGroup && payload.district) {
      await tx.donorProfile.create({
        data: {
          userId: newUser.id,
          bloodGroup: payload.bloodGroup,
          district: payload.district,
          upazila: payload.upazila,
          isAvailable: true,
        },
      });
    }

    return newUser;
  });

  const accessToken = createToken(
    { id: result.id, email: result.email, role: result.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = createToken(
    { id: result.id, email: result.email, role: result.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  return {
    user: result,
    accessToken,
    refreshToken,
  };
};

export const loginUser = async (payload: { email: string; password: string }) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email },
    include: {
      donorProfile: true,
    },
  });

  if (!user) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  if (user.deletedAt) {
    throw new AppError(httpStatus.FORBIDDEN, "This account has been deleted");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your account is suspended. Please contact administrator.",
    );
  }

  if (!user.password) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Account registered via Google. Please sign in with Google.",
    );
  }

  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid email or password");
  }

  const accessToken = createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const googleLogin = async (payload: {
  googleId: string;
  email: string;
  name: string;
  avatar?: string;
}) => {
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: payload.googleId }, { email: payload.email }],
    },
    include: {
      donorProfile: true,
    },
  });

  if (user) {
    if (user.deletedAt) {
      throw new AppError(httpStatus.FORBIDDEN, "This account has been deleted");
    }
    if (user.status === "SUSPENDED") {
      throw new AppError(httpStatus.FORBIDDEN, "Account suspended");
    }
    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.googleId, avatar: payload.avatar || user.avatar },
        include: { donorProfile: true },
      });
    }
  } else {
    // New user via Google OAuth -> always role: USER
    user = await prisma.user.create({
      data: {
        name: payload.name,
        email: payload.email,
        googleId: payload.googleId,
        avatar: payload.avatar,
        role: "USER",
        status: "ACTIVE",
        isVerified: true,
      },
      include: {
        donorProfile: true,
      },
    });
  }

  const accessToken = createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  const { password, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

export const refreshToken = async (token: string) => {
  let decoded: any;
  try {
    decoded = verifyToken(token, config.jwt.refresh_secret);
  } catch (err) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Invalid or expired refresh token");
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
  });

  if (!user || user.deletedAt || user.status === "SUSPENDED") {
    throw new AppError(httpStatus.UNAUTHORIZED, "User is no longer active");
  }

  const newAccessToken = createToken(
    { id: user.id, email: user.email, role: user.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  return {
    accessToken: newAccessToken,
  };
};

export const logoutUser = async (accessToken?: string, refreshToken?: string) => {
  if (accessToken) {
    await blacklistToken(accessToken, 86400); // 1 day blacklist
  }
  if (refreshToken) {
    await blacklistToken(refreshToken, 86400 * 7); // 7 days blacklist
  }
  return true;
};

export const AuthService = {
  registerUser,
  loginUser,
  googleLogin,
  refreshToken,
  logoutUser,
};

export default AuthService;
