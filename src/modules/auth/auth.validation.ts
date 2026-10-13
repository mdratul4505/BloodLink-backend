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
  body: z.object({
    idToken: z.string().optional(),
    googleId: z.string().min(1, "Google ID is required"),
    email: z.string().email("Invalid email address"),
    name: z.string().min(1, "Name is required"),
    avatar: z.string().optional(),
  }),
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

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  googleAuthValidationSchema,
  refreshTokenValidationSchema,
};

export default AuthValidation;
