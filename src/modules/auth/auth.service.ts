import axios from "axios";
import bcrypt from "bcryptjs";
import httpStatus from "http-status";
import config from "../../config/index.js";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import {
  sendLoginAlertEmail,
  sendOtpEmail,
  sendPasswordChangedEmail,
  sendRegistrationOtpEmail,
  sendWelcomeEmail,
} from "../../utils/email.js";
import { createToken, verifyToken } from "../../utils/jwt.js";
import {
  generateOtp,
  removeOtp,
  removeRegistrationOtp,
  storeOtp,
  storeRegistrationOtp,
  verifyOtp,
  verifyRegistrationOtp,
} from "../../utils/otp.js";
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
  otp?: string;
}) => {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser && existingUser.isVerified) {
    throw new AppError(httpStatus.CONFLICT, "User already exists with this email");
  }

  const hashedPassword = await bcrypt.hash(
    payload.password,
    config.bcrypt_salt_rounds,
  );

  let user = existingUser;

  if (!user) {
    user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: payload.name,
          email: normalizedEmail,
          password: hashedPassword,
          phone: payload.phone,
          role: "USER",
          status: "ACTIVE",
          isVerified: false,
        },
      });

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
  } else {
    // If user exists but is unverified, update their details with the latest submission
    user = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: payload.name,
        password: hashedPassword,
        phone: payload.phone || user.phone,
      },
    });
  }

  // If OTP is provided in register request, verify and complete registration immediately
  if (payload.otp) {
    const isValid = await verifyRegistrationOtp(normalizedEmail, payload.otp);
    if (!isValid) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Invalid or expired OTP verification code. Please check your email or request a new code.",
      );
    }

    const verifiedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isVerified: true },
      include: { donorProfile: true },
    });

    await removeRegistrationOtp(normalizedEmail);

    sendWelcomeEmail(verifiedUser.email, verifiedUser.name).catch((err) =>
      console.error("Failed to send welcome email:", err?.message || err),
    );

    const accessToken = createToken(
      { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
      config.jwt.access_secret,
      config.jwt.access_expires_in,
    );

    const refreshToken = createToken(
      { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
      config.jwt.refresh_secret,
      config.jwt.refresh_expires_in,
    );

    const { password, ...userWithoutPassword } = verifiedUser;

    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken,
      message: "OTP matched successfully! Account registered and activated.",
      isVerified: true,
    };
  }

  // If OTP is NOT provided, generate 6-digit OTP and send to user's Gmail
  const otp = generateOtp();
  await storeRegistrationOtp(normalizedEmail, otp);

  // Await email delivery to ensure it arrives before response completes (especially on serverless/Vercel)
  await sendRegistrationOtpEmail(normalizedEmail, otp, payload.name);

  return {
    email: normalizedEmail,
    message:
      "A 6-digit OTP verification code has been sent to your Gmail. Please enter the OTP to complete registration and activate your account.",
    requiresOtp: true,
    isVerified: false,
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

  // Check email verification status for password logins (Admins exempted)
  if (!user.isVerified && user.role !== "ADMIN") {
    // Generate fresh OTP and send via email so user can immediately verify
    const otp = generateOtp();
    await storeRegistrationOtp(user.email, otp);
    await sendRegistrationOtpEmail(user.email, otp, user.name);

    throw new AppError(
      httpStatus.FORBIDDEN,
      "Your email is not verified yet. A 6-digit OTP verification code has been sent to your Gmail. Please verify your email before logging in.",
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

export const googleLogin = async (payload: {
  idToken?: string;
  credential?: string;
  token?: string;
  googleId?: string;
  email?: string;
  name?: string;
  avatar?: string;
}) => {
  let googleId = payload.googleId;
  let email = payload.email;
  let name = payload.name;
  let avatar = payload.avatar;

  const rawToken = payload.idToken || payload.credential || payload.token;

  // If Google ID token is provided, verify it directly against Google OAuth2 tokeninfo API
  if (rawToken && (!googleId || !email)) {
    try {
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${rawToken}`,
      );
      if (response.data) {
        googleId = response.data.sub;
        email = response.data.email;
        name = name || response.data.name || response.data.given_name || "Google User";
        avatar = avatar || response.data.picture;
      }
    } catch (err: any) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "Invalid or expired Google OAuth token: " +
          (err?.response?.data?.error_description || err?.message || "Token verification failed"),
      );
    }
  }

  if (!googleId || !email) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Google login requires either valid googleId and email, or a valid Google idToken / credential.",
    );
  }

  const normalizedEmail = email.toLowerCase().trim();
  const userName = name || "Google User";

  let user = await prisma.user.findFirst({
    where: {
      OR: [{ googleId }, { email: normalizedEmail }],
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
        data: { googleId, avatar: avatar || user.avatar },
        include: { donorProfile: true },
      });
    }
  } else {
    // New user via Google OAuth -> always role: USER
    user = await prisma.user.create({
      data: {
        name: userName,
        email: normalizedEmail,
        googleId,
        avatar,
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
  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is required");
  }

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
    refreshToken: token,
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

  console.log(
    `[Auth] Forgot password OTP requested for "${user.name}" (${normalizedEmail}). Sending OTP email to recipient: "${normalizedEmail}"`,
  );

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

  console.log(
    `[Auth] Password reset with OTP for user "${user.name}" (${user.email}). Dispatching confirmation email to recipient: "${user.email}"`,
  );

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

// 4. Change Password (For Logged In User: requires oldPassword & newPassword)
export const changePassword = async (
  userId: string,
  payload: {
    oldPassword?: string;
    currentPassword?: string;
    newPassword: string;
  },
) => {
  const oldPassword = payload.oldPassword || payload.currentPassword;
  if (!oldPassword) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Old password is required. Please provide oldPassword or currentPassword.",
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "User account not found");
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
      "Account was registered via Google OAuth without a password. Please use Forgot Password with OTP to set a password.",
    );
  }

  // Verify old password
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Incorrect old password. The password you provided does not match your current password. If you do not remember your old password, please use Forgot Password (OTP) to reset it.",
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

  console.log(
    `[Auth] Password changed for user "${user.name}" (ID: ${user.id}). Dispatching confirmation email to recipient: "${user.email}"`,
  );

  // Quality feature: Send security confirmation email
  sendPasswordChangedEmail(user.email, user.name, new Date()).catch((err) =>
    console.error("Failed to send password changed email:", err?.message || err),
  );

  return {
    success: true,
    message:
      "Password changed successfully! A confirmation email has been sent to your registered email.",
  };
};

// 5. Verify Registration Email with OTP
export const verifyEmailOtp = async (payload: { email: string; otp: string }) => {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    include: { donorProfile: true },
  });

  if (!user || user.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "No account found with this email");
  }

  if (user.isVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Your email is already verified. You can log in directly.",
    );
  }

  const isValid = await verifyRegistrationOtp(normalizedEmail, payload.otp);
  if (!isValid) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Invalid or expired OTP code. Please check your email or request a new code.",
    );
  }

  // Update user to verified
  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true },
    include: { donorProfile: true },
  });

  // Invalidate OTP
  await removeRegistrationOtp(normalizedEmail);

  // Send Welcome Email upon successful verification
  sendWelcomeEmail(verifiedUser.email, verifiedUser.name).catch((err) =>
    console.error("Failed to send welcome email:", err?.message || err),
  );

  const accessToken = createToken(
    { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
    config.jwt.access_secret,
    config.jwt.access_expires_in,
  );

  const refreshToken = createToken(
    { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
    config.jwt.refresh_secret,
    config.jwt.refresh_expires_in,
  );

  const { password, ...userWithoutPassword } = verifiedUser;

  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken,
  };
};

// 6. Resend Email Verification OTP
export const resendEmailOtp = async (email: string) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user || user.deletedAt) {
    throw new AppError(httpStatus.NOT_FOUND, "No account found with this email");
  }

  if (user.isVerified) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This account is already verified. Please log in.",
    );
  }

  const otp = generateOtp();
  await storeRegistrationOtp(normalizedEmail, otp);

  await sendRegistrationOtpEmail(normalizedEmail, otp, user.name);

  return {
    success: true,
    message: "A new 6-digit OTP verification code has been sent to your Gmail.",
    expiresIn: "10 minutes",
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
  verifyEmailOtp,
  resendEmailOtp,
};

export default AuthService;
