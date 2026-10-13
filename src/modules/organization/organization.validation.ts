import { z } from "zod";

const orgTypeEnum = z.enum(["HOSPITAL", "BLOOD_BANK", "VOLUNTEER_GROUP"]);

export const applyOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2, "Organization name is required"),
    type: orgTypeEnum.default("HOSPITAL"),
    address: z.string().min(3, "Address is required"),
    district: z.string().min(2, "District is required"),
    upazila: z.string().optional(),
    contactPhone: z.string().min(6, "Contact phone is required"),
    email: z.string().email("Invalid email").optional(),
  }),
});

export const updateOrganizationSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    type: orgTypeEnum.optional(),
    address: z.string().min(3).optional(),
    district: z.string().min(2).optional(),
    upazila: z.string().optional(),
    contactPhone: z.string().min(6).optional(),
    email: z.string().email().optional(),
  }),
});

export const OrganizationValidation = {
  applyOrganizationSchema,
  updateOrganizationSchema,
};

export default OrganizationValidation;
