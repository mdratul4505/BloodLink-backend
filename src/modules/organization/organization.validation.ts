import { z } from "zod";

const orgTypeEnum = z.enum(["HOSPITAL", "BLOOD_BANK", "VOLUNTEER_GROUP"]);

export const applyOrganizationSchema = z.object({
  body: z.object({
    name: z.string({ required_error: "Organization name is required" }).min(2),
    type: orgTypeEnum.default("HOSPITAL"),
    address: z.string({ required_error: "Address is required" }).min(3),
    district: z.string({ required_error: "District is required" }).min(2),
    upazila: z.string().optional(),
    contactPhone: z.string({ required_error: "Contact phone is required" }).min(6),
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
