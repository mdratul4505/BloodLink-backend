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

export const updateUserProfileSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    phone: z.string().optional(),
    avatar: z.string().optional(),
    bloodGroup: bloodGroupEnum.optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    bio: z.string().max(500).optional(),
    isAvailable: z
      .union([
        z.boolean(),
        z.string().transform((val) => val === "true" || val === "1"),
      ])
      .optional(),
    lastDonationDate: z.union([z.string(), z.date()]).optional(),
  }),
});

export const toggleDonorAvailabilitySchema = z.object({
  body: z.object({
    isAvailable: z.union([
      z.boolean(),
      z.string().transform((val) => val === "true" || val === "1"),
    ]),
    lastDonationDate: z.union([z.string(), z.date()]).optional(),
  }),
});

export const UserValidation = {
  updateUserProfileSchema,
  toggleDonorAvailabilitySchema,
};

export default UserValidation;
