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

export const donorFilterValidationSchema = z.object({
  query: z.object({
    bloodGroup: bloodGroupEnum.optional(),
    district: z.string().optional(),
    upazila: z.string().optional(),
    isAvailable: z
      .string()
      .optional()
      .transform((val) => (val === undefined ? undefined : val === "true")),
    page: z
      .string()
      .optional()
      .transform((val) => (val ? Number.parseInt(val, 10) : 1)),
    limit: z
      .string()
      .optional()
      .transform((val) => (val ? Number.parseInt(val, 10) : 10)),
    sortBy: z.string().optional(),
    sortOrder: z.enum(["asc", "desc"]).optional(),
  }),
});

export const DonorValidation = {
  donorFilterValidationSchema,
};

export default DonorValidation;
