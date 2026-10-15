import { z } from "zod";

export const updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"]),
    reason: z.string().optional(),
  }),
});

export const verifyOrganizationSchema = z.object({
  body: z
    .object({
      verificationStatus: z.enum(["APPROVED", "REJECTED"]).optional(),
      status: z.enum(["APPROVED", "REJECTED"]).optional(),
      rejectionReason: z.string().optional(),
    })
    .default({ verificationStatus: "APPROVED" })
    .transform((data) => ({
      verificationStatus: (data.verificationStatus || data.status || "APPROVED") as
        | "APPROVED"
        | "REJECTED",
      rejectionReason: data.rejectionReason,
    })),
});

export const AdminValidation = {
  updateUserStatusSchema,
  verifyOrganizationSchema,
};

export default AdminValidation;
