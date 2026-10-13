import httpStatus from "http-status";
import config from "../../config/index.js";
import prisma from "../../config/prisma.js";
import AppError from "../../utils/AppError.js";
import BkashService from "./bkash.service.js";

export const createBkashPayment = async (
  userId: string,
  payload: {
    amount: number;
    purpose?: any;
    requestId?: string;
    payerReference?: string;
  },
) => {
  const merchantInvoiceNumber = `BL_INV_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 6)
    .toUpperCase()}`;

  // 1. Create PENDING payment in DB
  const payment = await prisma.payment.create({
    data: {
      userId,
      amount: payload.amount,
      purpose: payload.purpose || "PLATFORM_SUPPORT",
      status: "PENDING",
      merchantInvoiceNumber,
      requestId: payload.requestId,
      payerReference: payload.payerReference,
    },
  });

  // Log CREATE event
  await prisma.paymentEvent.create({
    data: {
      paymentId: payment.id,
      eventType: "CREATE",
      payload: {
        amount: payload.amount,
        merchantInvoiceNumber,
        purpose: payment.purpose,
      },
    },
  });

  // 2. Call bKash Create Payment API
  const bkashSession = await BkashService.createBkashPaymentSession({
    amount: payload.amount,
    merchantInvoiceNumber,
    payerReference: payload.payerReference,
  });

  // 3. Update payment with bkashPaymentId
  await prisma.payment.update({
    where: { id: payment.id },
    data: {
      bkashPaymentId: bkashSession.paymentID,
    },
  });

  return {
    paymentId: payment.id,
    bkashPaymentId: bkashSession.paymentID,
    bkashURL: bkashSession.bkashURL,
    merchantInvoiceNumber,
    amount: payload.amount,
  };
};

export const handleBkashCallback = async (
  paymentID: string,
  status: string,
) => {
  // Find payment by bkashPaymentId
  const payment = await prisma.payment.findFirst({
    where: { bkashPaymentId: paymentID },
  });

  if (!payment) {
    // Attempt fallback lookup by ID
    const fallbackPayment = await prisma.payment.findFirst({
      orderBy: { createdAt: "desc" },
    });
    if (!fallbackPayment) {
      throw new AppError(httpStatus.NOT_FOUND, "Payment session not found");
    }
  }

  const currentPayment = payment!;

  // 1. IDEMPOTENCY CHECK:
  // If payment is already PAID, ignore duplicate execution and return success
  if (currentPayment.status === "PAID") {
    return {
      redirectUrl: `${config.frontend_url}/payment/success?paymentId=${currentPayment.id}&trxId=${currentPayment.trxId}&alreadyProcessed=true`,
      payment: currentPayment,
    };
  }

  // Log CALLBACK event
  await prisma.paymentEvent.create({
    data: {
      paymentId: currentPayment.id,
      eventType: "CALLBACK",
      payload: { paymentID, status },
    },
  });

  // If callback indicates failure or cancellation
  if (status !== "success") {
    const finalStatus = status === "cancel" ? "CANCELLED" : "FAILED";
    await prisma.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: finalStatus,
        failureReason: `bKash reported status: ${status}`,
      },
    });

    return {
      redirectUrl: `${config.frontend_url}/payment/failed?paymentId=${currentPayment.id}&status=${status}`,
      payment: currentPayment,
    };
  }

  // 2. EXECUTE PAYMENT:
  // Must NOT trust callback status alone - execute and verify via Query API
  let executeResult: any;
  try {
    executeResult = await BkashService.executeBkashPaymentSession(paymentID);
  } catch (error: any) {
    await prisma.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: "FAILED",
        failureReason: error.message || "Execute API failed",
      },
    });
    return {
      redirectUrl: `${config.frontend_url}/payment/failed?paymentId=${currentPayment.id}&error=execute_failed`,
      payment: currentPayment,
    };
  }

  // 3. QUERY PAYMENT TO VERIFY:
  const queryResult = await BkashService.queryBkashPaymentSession(paymentID);

  const trxId = executeResult.trxID || queryResult.trxID;
  const verifiedAmount = Number.parseFloat(
    queryResult.amount || executeResult.amount,
  );
  const dbAmount = Number(currentPayment.amount);

  // Verify amount matches DB record
  if (Math.abs(verifiedAmount - dbAmount) > 0.01) {
    await prisma.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: "FAILED",
        failureReason: `Amount mismatch: expected ${dbAmount}, received ${verifiedAmount}`,
      },
    });

    return {
      redirectUrl: `${config.frontend_url}/payment/failed?paymentId=${currentPayment.id}&error=amount_mismatch`,
      payment: currentPayment,
    };
  }

  // 4. ATOMIC UPDATE IN TRANSACTION:
  // Save Payment.status = PAID + trxId + PaymentEvent log
  const updatedPayment = await prisma.$transaction(async (tx) => {
    const paidPayment = await tx.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: "PAID",
        trxId: trxId || `TRX_${Date.now()}`,
        paidAt: new Date(),
        payerMobile: executeResult.customerMsisdn || queryResult.customerMsisdn,
      },
    });

    // Log VERIFIED event
    await tx.paymentEvent.create({
      data: {
        paymentId: paidPayment.id,
        eventType: "VERIFIED",
        payload: {
          trxId,
          executeResult,
          queryResult,
        } as any,
      },
    });

    // Send in-app notification to user
    await tx.notification.create({
      data: {
        userId: paidPayment.userId,
        type: "PAYMENT_UPDATE",
        title: "Payment Received! 💖",
        message: `Thank you for your voluntary support of ${paidPayment.amount} BDT (TrxID: ${trxId}). Together we save lives!`,
      },
    });

    return paidPayment;
  });

  return {
    redirectUrl: `${config.frontend_url}/payment/success?paymentId=${updatedPayment.id}&trxId=${updatedPayment.trxId}`,
    payment: updatedPayment,
  };
};

export const getPaymentById = async (id: string, userId: string, role: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true },
      },
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!payment) {
    throw new AppError(httpStatus.NOT_FOUND, "Payment not found");
  }

  if (payment.userId !== userId && role !== "ADMIN") {
    throw new AppError(
      httpStatus.FORBIDDEN,
      "You do not have permission to view this payment",
    );
  }

  return payment;
};

export const getMyPayments = async (
  userId: string,
  query: { page?: number; limit?: number },
) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.payment.count({ where: { userId } }),
  ]);

  return {
    payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const PaymentService = {
  createBkashPayment,
  handleBkashCallback,
  getPaymentById,
  getMyPayments,
};

export default PaymentService;
