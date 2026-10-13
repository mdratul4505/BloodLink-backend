import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"], {
      required_error: "Status must be either ACTIVE or SUSPENDED",
    }),
    reason: z.string().optional(),
  }),
});

export const verifyOrganizationSchema = z.object({
  body: z.object({
    verificationStatus: z.enum(["APPROVED", "REJECTED"], {
      required_error: "Status must be APPROVED or REJECTED",
    }),
    rejectionReason: z.string().optional(),
  }),
});

export const AdminValidation = {
  updateUserStatusSchema,
  verifyOrganizationSchema,
};

export default AdminValidation;
