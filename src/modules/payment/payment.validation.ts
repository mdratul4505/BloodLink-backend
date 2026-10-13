import { z } from "zod";

const paymentPurposeEnum = z.enum(["PLATFORM_SUPPORT", "EMERGENCY_FUND"]);

export const createPaymentSchema = z.object({
  body: z.object({
    amount: z
      .number({ required_error: "Amount is required" })
      .min(10, "Minimum voluntary contribution is 10 BDT"),
    purpose: paymentPurposeEnum.default("PLATFORM_SUPPORT"),
    requestId: z.string().optional(),
    payerReference: z.string().optional(),
  }),
});

export const callbackPaymentSchema = z.object({
  query: z.object({
    paymentID: z.string({ required_error: "paymentID is required" }),
    status: z.string({ required_error: "status is required" }),
  }),
});

export const PaymentValidation = {
  createPaymentSchema,
  callbackPaymentSchema,
};

export default PaymentValidation;
