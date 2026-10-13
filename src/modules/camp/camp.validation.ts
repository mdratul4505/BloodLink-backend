import { z } from "zod";

const campStatusEnum = z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]);
const attendanceStatusEnum = z.enum(["REGISTERED", "ATTENDED", "MISSED"]);

export const createCampSchema = z.object({
  body: z.object({
    organizationId: z.string().min(1, "Organization ID is required"),
    title: z.string().min(3, "Camp title is required"),
    description: z.string().optional(),
    venue: z.string().min(3, "Venue is required"),
    district: z.string().min(2, "District is required"),
    date: z.string().min(1, "Date is required"),
  }),
});

export const updateCampStatusSchema = z.object({
  body: z.object({
    status: campStatusEnum,
  }),
});

export const updateAttendanceSchema = z.object({
  body: z.object({
    userId: z.string().min(1, "User ID is required"),
    attendance: attendanceStatusEnum,
  }),
});

export const CampValidation = {
  createCampSchema,
  updateCampStatusSchema,
  updateAttendanceSchema,
};

export default CampValidation;
