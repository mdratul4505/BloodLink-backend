import type { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync.js";
import sendResponse from "../../utils/sendResponse.js";
import PaymentService from "./payment.service.js";

export const createBkashPayment = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user!.id;
    const result = await PaymentService.createBkashPayment(userId, req.body);

    sendResponse(res, {
      statusCode: httpStatus.CREATED,
      success: true,
      message: "bKash payment session initialized successfully",
      data: result,
    });
  },
);

export const handleBkashCallback = catchAsync(
  async (req: Request, res: Response) => {
    const paymentID = (req.query.paymentID as string) || (req.query.paymentId as string);
    const status = (req.query.status as string) || "cancel";

    const result = await PaymentService.handleBkashCallback(paymentID, status);

    // Redirect to frontend as required by flow
    res.redirect(result.redirectUrl);
  },
);

export const getPaymentById = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user!.id;
  const role = req.user!.role;

  const result = await PaymentService.getPaymentById(id as string, userId, role);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "Payment details fetched successfully",
    data: result,
  });
});

export const getMyPayments = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const result = await PaymentService.getMyPayments(userId, {
    page: req.query.page ? Number(req.query.page) : undefined,
    limit: req.query.limit ? Number(req.query.limit) : undefined,
  });

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: "My payments fetched successfully",
    meta: result.meta,
    data: result.payments,
  });
});

export const PaymentController = {
  createBkashPayment,
  handleBkashCallback,
  getPaymentById,
  getMyPayments,
};

export default PaymentController;
