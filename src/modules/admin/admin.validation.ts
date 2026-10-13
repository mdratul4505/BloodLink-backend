import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"]),
    reason: z.string().optional(),
  }),
});

export const verifyOrganizationSchema = z.object({
  body: z.object({
    verificationStatus: z.enum(["APPROVED", "REJECTED"]),
    rejectionReason: z.string().optional(),
  }),
});

export const AdminValidation = {
  updateUserStatusSchema,
  verifyOrganizationSchema,
};

export default AdminValidation;
