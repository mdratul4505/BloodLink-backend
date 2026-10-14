import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import {
  sendOtpEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
} from "../../utils/email.js";
import { createToken, verifyToken } from "../../utils/jwt.js";
import { generateOtp, removeOtp, storeOtp, verifyOtp } from "../../utils/otp.js";
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
    where: { email: payload.email.toLowerCase() },
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
        email: payload.email.toLowerCase(),
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

  // Quality feature: Send attractive Welcome Email to new user
  sendWelcomeEmail(result.email, result.name).catch((err) =>
    console.error("Failed to send welcome email:", err?.message || err),
  );

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

export const loginUser = async (
  payload: { email: string; password: string },
  clientIp?: string,
) => {
  const user = await prisma.user.findUnique({
    where: { email: payload.email.toLowerCase() },
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

export const googleLogin = async (
  payload: {
    googleId: string;
    email: string;
    name: string;
    avatar?: string;
  },
  clientIp?: string,
) => {
  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId: payload.googleId }, { email: payload.email.toLowerCase() }],
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
        email: payload.email.toLowerCase(),
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

    sendWelcomeEmail(user.email, user.name).catch((err) =>
      console.error("Failed to send welcome email:", err?.message || err),
    );
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

// 1. Send OTP to User's Email for Password Reset
export const forgotPassword = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "No account found with this email address");
  }

  if (user.status === "SUSPENDED") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "This account is suspended. Please contact support.",
    );
  }

  // Generate 6-digit OTP and store in Redis/cache (10 min TTL)
  const otp = generateOtp();
  await storeOtp(normalizedEmail, otp);

  // Send OTP via Gmail SMTP
  const emailSent = await sendOtpEmail(normalizedEmail, otp, user.name);

  return {
    success: true,
    message: "A 6-digit OTP verification code has been sent to your email address.",
    email: normalizedEmail,
    emailDelivered: emailSent,
    expiresIn: "10 minutes",
  };
};

// 2. Verify OTP code
export const verifyResetOtp = async (email: string, otp: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const isValid = await verifyOtp(normalizedEmail, otp);

  if (!isValid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired OTP verification code.",
    );
  }

  return {
    success: true,
    message: "OTP verified successfully. You can now reset your password.",
  };
};

// 3. Reset Password using OTP
export const resetPassword = async (payload: {
  email: string;
  otp: string;
  newPassword: string;
}) => {
  const normalizedEmail = payload.email.toLowerCase().trim();

  // Validate OTP
  const isValid = await verifyOtp(normalizedEmail, payload.otp);
  if (!isValid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired OTP verification code. Please request a new OTP.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "User account not found");
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    config.bcrypt_salt_rounds,
  );

  // Update password in DB
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Invalidate OTP immediately so it cannot be reused
  await removeOtp(normalizedEmail);

  // Quality feature: Send Password Changed Confirmation Email
  sendPasswordChangedEmail(user.email, user.name, new Date()).catch((err) =>
    console.error("Failed to send password changed email:", err?.message || err),
  );

  return {
    success: true,
    message:
      "Password has been changed successfully. A security confirmation email has been sent. You can now login with your new password.",
  };
};

// 4. Change Password (Authenticated user with old password or OTP)
export const changePassword = async (
  userId: string,
  payload: {
    oldPassword?: string;
    otp?: string;
    newPassword: string;
  },
) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, "User account not found");
  }

  // If oldPassword provided, verify it
  if (payload.oldPassword) {
    if (!user.password) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Account has no existing password (registered via Google). Please use OTP reset.",
      );
    }
    const isOldMatch = await bcrypt.compare(payload.oldPassword, user.password);
    if (!isOldMatch) {
      throw new AppError(httpStatus.BAD_REQUEST, "Current password is incorrect");
    }
  } else if (payload.otp) {
    // If OTP provided, verify it
    const isValid = await verifyOtp(user.email, payload.otp);
    if (!isValid) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid or expired OTP code");
    }
    await removeOtp(user.email);
  } else {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Either your current password (oldPassword) or an email verification OTP must be provided.",
    );
  }

  // Hash new password
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    config.bcrypt_salt_rounds,
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword },
  });

  // Quality feature: Send security alert
  sendPasswordChangedEmail(user.email, user.name, new Date()).catch((err) =>
    console.error("Failed to send password changed email:", err?.message || err),
  );

  return {
    success: true,
    message: "Password changed successfully. A confirmation email has been sent.",
  };
};

export const AuthService = {
  registerUser,
  loginUser,
  googleLogin,
  refreshToken,
  logoutUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
};

export default AuthService;
