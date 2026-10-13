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

const urgencyEnum = z.enum(["NORMAL", "URGENT", "CRITICAL"]);
const requestStatusEnum = z.enum([
  "OPEN",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELLED",
  "EXPIRED",
]);

export const createBloodRequestSchema = z.object({
  body: z.object({
    patientName: z.string().optional(),
    bloodGroup: bloodGroupEnum,
    units: z.number().int().min(1, "At least 1 unit is required"),
    hospitalName: z.string().min(2, "Hospital name is required"),
    district: z.string().min(2, "District is required"),
    upazila: z.string().optional(),
    contactPhone: z.string().min(6, "Contact phone is required"),
    note: z.string().optional(),
    urgency: urgencyEnum.optional(),
    neededBy: z.string(),
    organizationId: z.string().optional(),
  }),
});

export const updateBloodRequestSchema = z.object({
  body: z.object({
    patientName: z.string().optional(),
    bloodGroup: bloodGroupEnum.optional(),
    units: z.number().int().min(1).optional(),
    hospitalName: z.string().min(2).optional(),
    district: z.string().min(2).optional(),
    upazila: z.string().optional(),
    contactPhone: z.string().min(6).optional(),
    note: z.string().optional(),
    urgency: urgencyEnum.optional(),
    neededBy: z.string().optional(),
    organizationId: z.string().optional(),
  }),
});

export const updateRequestStatusSchema = z.object({
  body: z.object({
    status: requestStatusEnum,
  }),
});

export const donorRespondSchema = z.object({
  body: z.object({
    status: z.enum(["AVAILABLE", "UNABLE"]).default("AVAILABLE"),
    message: z.string().optional(),
  }),
});

export const completeDonationSchema = z.object({
  body: z.object({
    donorId: z.string().min(1, "Donor ID is required"),
    units: z.number().int().min(1).default(1),
    donatedAt: z.string().optional(),
  }),
});

export const BloodRequestValidation = {
  createBloodRequestSchema,
  updateBloodRequestSchema,
  updateRequestStatusSchema,
  donorRespondSchema,
  completeDonationSchema,
};

export default BloodRequestValidation;
