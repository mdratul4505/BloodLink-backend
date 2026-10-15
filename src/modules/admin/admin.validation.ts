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
      verificationStatus: z.string().optional(),
      status: z.string().optional(),
      rejectionReason: z.string().optional(),
    })
    .optional()
    .default({})
    .transform((data) => {
      const raw = data?.verificationStatus || data?.status;
      let status: "APPROVED" | "REJECTED" = "APPROVED";
      if (raw) {
        const upper = raw.trim().toUpperCase();
        if (["REJECT", "REJECTED", "DECLINE", "DECLINED"].includes(upper)) {
          status = "REJECTED";
        } else {
          status = "APPROVED";
        }
      }
      return {
        verificationStatus: status,
        rejectionReason: data?.rejectionReason,
      };
    }),
});

export const AdminValidation = {
  updateUserStatusSchema,
  verifyOrganizationSchema,
};

export default AdminValidation;
