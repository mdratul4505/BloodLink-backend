import { z } from "zod";

const campStatusEnum = z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]);
const attendanceStatusEnum = z.enum(["REGISTERED", "ATTENDED", "MISSED"]);

export const createCampSchema = z.object({
  body: z.object({
    organizationId: z.string({ required_error: "Organization ID is required" }),
    title: z.string({ required_error: "Camp title is required" }).min(3),
    description: z.string().optional(),
    venue: z.string({ required_error: "Venue is required" }).min(3),
    district: z.string({ required_error: "District is required" }).min(2),
    date: z.string().datetime("Date must be a valid ISO string"),
  }),
});

export const updateCampStatusSchema = z.object({
  body: z.object({
    status: campStatusEnum,
  }),
});

export const updateAttendanceSchema = z.object({
  body: z.object({
    userId: z.string({ required_error: "User ID is required" }),
    attendance: attendanceStatusEnum,
  }),
});

export const CampValidation = {
  createCampSchema,
  updateCampStatusSchema,
  updateAttendanceSchema,
};

export default CampValidation;
