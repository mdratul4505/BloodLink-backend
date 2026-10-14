import { z } from "zod";

const bloodGroupEnum = z.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE",
]);

export const registerValidationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    phone: z.string().optional(),
    isDonor: z.boolean().optional(),
    bloodGroup: bloodGroupEnum.optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
  }),
});

export const loginValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(1, "Password is required"),
  }),
});

export const googleAuthValidationSchema = z.object({
  body: z
    .object({
      idToken: z.string().optional(),
      credential: z.string().optional(),
      token: z.string().optional(),
      googleId: z.string().optional(),
      email: z.string().email("Invalid email address").optional(),
      name: z.string().optional(),
      avatar: z.string().optional(),
    })
    .refine(
      (data) =>
        (data.googleId && data.email) ||
        data.idToken ||
        data.credential ||
        data.token,
      {
        message:
          "Google authentication requires either (googleId and email) or a valid Google (idToken / credential).",
      },
    ),
});

export const refreshTokenValidationSchema = z.object({
  body: z.object({
    refreshToken: z.string().optional(),
  }),
  cookies: z
    .object({
      refreshToken: z.string().optional(),
    })
    .optional(),
});

export const forgotPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
  }),
});

export const verifyOtpValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
  }),
});

export const resetPasswordValidationSchema = z.object({
  body: z.object({
    email: z.string().email("Invalid email address"),
    otp: z.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
    newPassword: z.string().min(6, "New password must be at least 6 characters"),
  }),
});

export const changePasswordValidationSchema = z.object({
  body: z
    .object({
      oldPassword: z.string().optional(),
      currentPassword: z.string().optional(),
      newPassword: z.string().min(6, "New password must be at least 6 characters"),
    })
    .refine((data) => !!(data.oldPassword || data.currentPassword), {
      message: "Old password (oldPassword or currentPassword) is required",
    }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  googleAuthValidationSchema,
  refreshTokenValidationSchema,
  forgotPasswordValidationSchema,
  verifyOtpValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
};

export default AuthValidation;
