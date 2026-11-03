
      import { createRequire } from 'module';
      const require = createRequire(import.meta.url);
    

// src/app.ts
import path4 from "path";
import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import httpStatus25 from "http-status";

// src/config/index.ts
import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(process.cwd(), ".env") });
var smtpUser = process.env.SMTP_USER || process.env.smtp_user || "";
var smtpPassword = process.env.SMTP_PASSWORD || process.env.smtp_password || "";
var config = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT) || 5e3,
  database_url: (process.env.DATABASE_URL || "").trim(),
  backend_url: (process.env.BACKEND_URL || "http://localhost:5000").trim(),
  frontend_url: (process.env.FRONTEND_URL || "http://localhost:3000").trim(),
  bcrypt_salt_rounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 10,
  jwt: {
    access_secret: process.env.JWT_ACCESS_SECRET || "default_bloodlink_access_secret_key",
    refresh_secret: process.env.JWT_REFRESH_SECRET || "default_bloodlink_refresh_secret_key",
    access_expires_in: process.env.JWT_ACCESS_EXPIRES_IN || "1d",
    refresh_expires_in: process.env.JWT_REFRESH_EXPIRES_IN || "7d"
  },
  google: {
    client_id: (process.env.GOOGLE_CLIENT_ID || "").trim()
  },
  google_client_id: (process.env.GOOGLE_CLIENT_ID || "").trim(),
  admin: {
    name: process.env.ADMIN_NAME || "BloodLink Super Admin",
    email: process.env.ADMIN_EMAIL || "admin@bloodlink.org",
    password: process.env.ADMIN_PASSWORD || "Admin@123456"
  },
  redis: {
    url: process.env.REDIS_URL || void 0,
    host: process.env.REDIS_HOST || "localhost",
    port: Number(process.env.REDIS_PORT) || 6379,
    password: process.env.REDIS_PASSWORD || void 0,
    user: process.env.REDIS_USER || "default"
  },
  email: {
    smtp_user: smtpUser,
    smtp_password: smtpPassword,
    from: process.env.SMTP_FROM || `"BloodLink" <${smtpUser}>`
  },
  smtp_user: smtpUser,
  smtp_password: smtpPassword,
  bkash: {
    app_key: (process.env.BKASH_APP_KEY || "4f6o0cjiki2rfm34kfdadl1eqq").trim(),
    app_secret: (process.env.BKASH_APP_SECRET || "2is7hdktrekvrbljjh44ll3d9l1dtjo4pasmjvs5vl5qr3fug4b").trim(),
    username: (process.env.BKASH_USERNAME || "sandboxTokenizedUser02").trim(),
    password: (process.env.BKASH_PASSWORD || "sandboxTokenizedUser02@12345").trim(),
    base_url: (process.env.BKASH_BASE_URL || "https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized/checkout").trim(),
    callback_url: (process.env.BKASH_CALLBACK_URL || "https://blood-link-backend-one.vercel.app/api/v1/payments/bkash/callback").trim()
  }
};
var config_default = config;

// src/middlewares/errorHandler.ts
import httpStatus from "http-status";
import { ZodError } from "zod";

// src/utils/AppError.ts
var AppError = class extends Error {
  statusCode;
  isOperational;
  constructor(statusCode, message, isOperational = true, stack = "") {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
};
var AppError_default = AppError;

// src/middlewares/errorHandler.ts
var globalErrorHandler = (err, req, res, next) => {
  let statusCode = httpStatus.INTERNAL_SERVER_ERROR;
  let message = "Something went wrong!";
  let errors = [];
  if (err instanceof ZodError) {
    statusCode = httpStatus.BAD_REQUEST;
    message = "Validation failed";
    errors = err.issues.map((issue) => ({
      field: issue.path[issue.path.length - 1]?.toString() || issue.path.join("."),
      message: issue.message
    }));
  } else if (err?.code === "P2002") {
    statusCode = httpStatus.CONFLICT;
    message = "A resource with this unique value already exists";
    const target = Array.isArray(err.meta?.target) ? err.meta.target.join(", ") : err.meta?.target || "field";
    errors = [
      {
        field: target,
        message: `Unique constraint violated on ${target}`
      }
    ];
  } else if (err?.code === "P2025") {
    statusCode = httpStatus.NOT_FOUND;
    message = err.meta?.cause || "Record not found";
    errors = [{ message }];
  } else if (err?.name === "JsonWebTokenError" || err?.name === "TokenExpiredError") {
    statusCode = httpStatus.UNAUTHORIZED;
    message = "Invalid or expired token";
    errors = [{ message: err.message }];
  } else if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
    errors = [{ message: err.message }];
  } else if (err instanceof Error) {
    message = err.message || message;
    errors = [{ message: err.message || message }];
  }
  res.status(statusCode).json({
    success: false,
    message,
    errors
  });
};
var errorHandler_default = globalErrorHandler;

// src/middlewares/notFound.ts
import httpStatus2 from "http-status";
var notFound = (req, res) => {
  res.status(httpStatus2.NOT_FOUND).json({
    success: false,
    message: "API endpoint not found!",
    errors: [
      {
        field: req.originalUrl,
        message: "The requested route does not exist on this server."
      }
    ]
  });
};
var notFound_default = notFound;

// src/routes/index.ts
import { Router as Router10 } from "express";

// src/modules/admin/admin.route.ts
import { Router } from "express";

// src/middlewares/auth.ts
import httpStatus3 from "http-status";

// prisma/generated/prisma/client.js
import * as path2 from "path";
import { fileURLToPath } from "url";

// prisma/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config2 = {
  "previewFeatures": [],
  "clientVersion": "7.10.0",
  "engineVersion": "0edf323efd1d98336f3f0a68684b56f689b900d3",
  "activeProvider": "postgresql",
  "inlineSchema": 'model AuditLog {\n  id         String   @id @default(uuid())\n  actorId    String?\n  action     String\n  targetType String\n  targetId   String?\n  details    Json?\n  createdAt  DateTime @default(now())\n\n  actor User? @relation("ActorRelation", fields: [actorId], references: [id], onDelete: SetNull)\n\n  @@index([actorId, createdAt])\n  @@index([action, targetType])\n  @@map("audit_logs")\n}\n\nmodel Review {\n  id         String   @id @default(uuid())\n  donorId    String\n  reviewerId String\n  rating     Int      @default(5)\n  comment    String?\n  createdAt  DateTime @default(now())\n\n  donor    User @relation("ReviewedDonorRelation", fields: [donorId], references: [id], onDelete: Cascade)\n  reviewer User @relation("ReviewerRelation", fields: [reviewerId], references: [id], onDelete: Cascade)\n\n  @@index([donorId, rating])\n  @@map("reviews")\n}\n\nmodel BloodRequest {\n  id             String  @id @default(uuid())\n  requesterId    String\n  organizationId String?\n\n  patientName    String?\n  bloodGroup     BloodGroup\n  units          Int\n  unitsFulfilled Int        @default(0)\n  hospitalName   String\n  district       String\n  upazila        String?\n  contactPhone   String\n  note           String?\n\n  urgency  UrgencyLevel  @default(NORMAL)\n  status   RequestStatus @default(OPEN)\n  neededBy DateTime\n\n  deletedAt DateTime?\n  createdAt DateTime  @default(now())\n  updatedAt DateTime  @updatedAt\n\n  requester     User            @relation("RequesterRelation", fields: [requesterId], references: [id], onDelete: Restrict)\n  organization  Organization?   @relation(fields: [organizationId], references: [id], onDelete: SetNull)\n  responses     DonorResponse[]\n  donations     Donation[]\n  payments      Payment[]\n  notifications Notification[]\n\n  @@index([status, bloodGroup, district, createdAt])\n  @@index([requesterId, createdAt])\n  @@index([neededBy])\n  @@map("blood_requests")\n}\n\nmodel DonorResponse {\n  id        String         @id @default(uuid())\n  requestId String\n  donorId   String\n  status    ResponseStatus @default(AVAILABLE)\n  message   String?\n  createdAt DateTime       @default(now())\n  updatedAt DateTime       @updatedAt\n\n  request BloodRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)\n  donor   User         @relation(fields: [donorId], references: [id], onDelete: Restrict)\n\n  @@unique([requestId, donorId])\n  @@index([donorId, createdAt])\n  @@map("donor_responses")\n}\n\nmodel Donation {\n  id        String   @id @default(uuid())\n  requestId String?\n  campId    String?\n  donorId   String\n  donatedAt DateTime @default(now())\n  createdAt DateTime @default(now())\n\n  request BloodRequest? @relation(fields: [requestId], references: [id], onDelete: SetNull)\n  camp    DonationCamp? @relation(fields: [campId], references: [id], onDelete: SetNull)\n  donor   User          @relation(fields: [donorId], references: [id], onDelete: Restrict)\n\n  @@index([donorId, donatedAt])\n  @@map("donations")\n}\n\nmodel DonationCamp {\n  id             String     @id @default(uuid())\n  organizationId String\n  title          String\n  description    String?\n  venue          String\n  district       String\n  date           DateTime\n  status         CampStatus @default(UPCOMING)\n  createdAt      DateTime   @default(now())\n  updatedAt      DateTime   @updatedAt\n\n  organization  Organization       @relation(fields: [organizationId], references: [id], onDelete: Cascade)\n  registrations CampRegistration[]\n  donations     Donation[]\n\n  @@index([organizationId, date])\n  @@index([status, district])\n  @@map("donation_camps")\n}\n\nmodel CampRegistration {\n  id         String           @id @default(uuid())\n  campId     String\n  userId     String\n  attendance AttendanceStatus @default(REGISTERED)\n  createdAt  DateTime         @default(now())\n  updatedAt  DateTime         @updatedAt\n\n  camp DonationCamp @relation(fields: [campId], references: [id], onDelete: Cascade)\n  user User         @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([campId, userId])\n  @@map("camp_registrations")\n}\n\nmodel DonorProfile {\n  id               String     @id @default(uuid())\n  userId           String     @unique\n  bloodGroup       BloodGroup\n  district         String\n  upazila          String?\n  isAvailable      Boolean    @default(true)\n  lastDonationDate DateTime?\n  bio              String?\n  totalDonations   Int        @default(0)\n  createdAt        DateTime   @default(now())\n  updatedAt        DateTime   @updatedAt\n\n  user User @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@index([bloodGroup, district, isAvailable])\n  @@map("donor_profiles")\n}\n\nenum Role {\n  USER\n  ORGANIZATION\n  HOSPITAL\n  ADMIN\n}\n\nenum UserStatus {\n  ACTIVE\n  SUSPENDED\n}\n\nenum BloodGroup {\n  A_POSITIVE\n  A_NEGATIVE\n  B_POSITIVE\n  B_NEGATIVE\n  AB_POSITIVE\n  AB_NEGATIVE\n  O_POSITIVE\n  O_NEGATIVE\n}\n\nenum RequestStatus {\n  OPEN\n  PARTIALLY_FULFILLED\n  FULFILLED\n  CANCELLED\n  EXPIRED\n}\n\nenum ResponseStatus {\n  AVAILABLE\n  UNABLE\n  CONFIRMED\n  DONATED\n}\n\nenum UrgencyLevel {\n  NORMAL\n  URGENT\n  CRITICAL\n}\n\nenum OrganizationType {\n  HOSPITAL\n  BLOOD_BANK\n  VOLUNTEER_GROUP\n}\n\nenum VerificationStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nenum OrgMemberRole {\n  ADMIN\n  MEMBER\n}\n\nenum CampStatus {\n  UPCOMING\n  ONGOING\n  COMPLETED\n  CANCELLED\n}\n\nenum AttendanceStatus {\n  REGISTERED\n  ATTENDED\n  MISSED\n}\n\nenum PaymentStatus {\n  PENDING\n  PAID\n  FAILED\n  CANCELLED\n}\n\nenum PaymentProvider {\n  BKASH\n}\n\nenum PaymentPurpose {\n  PLATFORM_SUPPORT\n  EMERGENCY_FUND\n}\n\nenum NotificationType {\n  NEW_MATCHING_REQUEST\n  DONOR_RESPONDED\n  RESPONSE_CONFIRMED\n  REQUEST_STATUS_CHANGED\n  PAYMENT_UPDATE\n  CAMP_UPDATE\n  SYSTEM\n}\n\nmodel Notification {\n  id      String           @id @default(uuid())\n  userId  String\n  type    NotificationType\n  title   String\n  message String\n  isRead  Boolean          @default(false)\n  readAt  DateTime?\n\n  requestId String?\n\n  createdAt DateTime @default(now())\n\n  user    User          @relation(fields: [userId], references: [id], onDelete: Cascade)\n  request BloodRequest? @relation(fields: [requestId], references: [id], onDelete: SetNull)\n\n  @@index([userId, isRead, createdAt])\n  @@map("notifications")\n}\n\nmodel Organization {\n  id                 String             @id @default(uuid())\n  name               String\n  type               OrganizationType   @default(HOSPITAL)\n  address            String\n  district           String\n  upazila            String?\n  contactPhone       String?\n  email              String?\n  verificationStatus VerificationStatus @default(PENDING)\n  rejectionReason    String?\n  ownerId            String\n  createdAt          DateTime           @default(now())\n  updatedAt          DateTime           @updatedAt\n\n  owner               User                 @relation("OrgOwner", fields: [ownerId], references: [id], onDelete: Restrict)\n  members             OrganizationMember[]\n  camps               DonationCamp[]\n  coordinatedRequests BloodRequest[]\n\n  @@index([verificationStatus, district])\n  @@map("organizations")\n}\n\nmodel OrganizationMember {\n  id             String        @id @default(uuid())\n  organizationId String\n  userId         String\n  roleInOrg      OrgMemberRole @default(MEMBER)\n  createdAt      DateTime      @default(now())\n\n  organization Organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)\n  user         User         @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([organizationId, userId])\n  @@map("organization_members")\n}\n\nmodel Payment {\n  id       String          @id @default(uuid())\n  userId   String\n  provider PaymentProvider @default(BKASH)\n  purpose  PaymentPurpose  @default(PLATFORM_SUPPORT)\n  status   PaymentStatus   @default(PENDING)\n\n  amount   Decimal @db.Decimal(10, 2)\n  currency String  @default("BDT")\n\n  // bKash related\n  merchantInvoiceNumber String  @unique\n  bkashPaymentId        String? @unique\n  trxId                 String? @unique\n  payerReference        String?\n  payerMobile           String?\n\n  requestId String?\n\n  failureReason String?\n  paidAt        DateTime?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n\n  user    User           @relation(fields: [userId], references: [id])\n  request BloodRequest?  @relation(fields: [requestId], references: [id])\n  events  PaymentEvent[]\n\n  @@index([userId, createdAt])\n  @@index([status, createdAt])\n  @@map("payments")\n}\n\nmodel PaymentEvent {\n  id        String   @id @default(uuid())\n  paymentId String\n  eventType String // CREATE, CALLBACK, EXECUTE, QUERY, VERIFIED, FAILED\n  payload   Json?\n  createdAt DateTime @default(now())\n\n  payment Payment @relation(fields: [paymentId], references: [id], onDelete: Cascade)\n\n  @@index([paymentId, createdAt])\n  @@map("payment_events")\n}\n\n// This is your Prisma schema file,\n// learn more about it in the docs: https://pris.ly/d/prisma-schema\n\n// Get a free hosted Postgres database in seconds: `npx create-db`\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel User {\n  id         String     @id @default(uuid())\n  name       String\n  email      String     @unique\n  password   String?\n  role       Role       @default(USER)\n  status     UserStatus @default(ACTIVE)\n  googleId   String?    @unique\n  isVerified Boolean    @default(false)\n  phone      String?\n  avatar     String?\n  deletedAt  DateTime?\n  createdAt  DateTime   @default(now())\n  updatedAt  DateTime   @updatedAt\n\n  donorProfile        DonorProfile?\n  ownedOrganizations  Organization[]       @relation("OrgOwner")\n  organizationMembers OrganizationMember[]\n  requestsMade        BloodRequest[]       @relation("RequesterRelation")\n  donorResponses      DonorResponse[]\n  donations           Donation[]\n  campRegistrations   CampRegistration[]\n  notifications       Notification[]\n  payments            Payment[]\n  auditLogs           AuditLog[]           @relation("ActorRelation")\n  reviewsGiven        Review[]             @relation("ReviewerRelation")\n  reviewsReceived     Review[]             @relation("ReviewedDonorRelation")\n\n  @@index([role, status])\n  @@map("users")\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config2.runtimeDataModel = JSON.parse('{"models":{"AuditLog":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"actorId","kind":"scalar","type":"String"},{"name":"action","kind":"scalar","type":"String"},{"name":"targetType","kind":"scalar","type":"String"},{"name":"targetId","kind":"scalar","type":"String"},{"name":"details","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"actor","kind":"object","type":"User","relationName":"ActorRelation"}],"dbName":"audit_logs","schema":null},"Review":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"donorId","kind":"scalar","type":"String"},{"name":"reviewerId","kind":"scalar","type":"String"},{"name":"rating","kind":"scalar","type":"Int"},{"name":"comment","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"donor","kind":"object","type":"User","relationName":"ReviewedDonorRelation"},{"name":"reviewer","kind":"object","type":"User","relationName":"ReviewerRelation"}],"dbName":"reviews","schema":null},"BloodRequest":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requesterId","kind":"scalar","type":"String"},{"name":"organizationId","kind":"scalar","type":"String"},{"name":"patientName","kind":"scalar","type":"String"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"units","kind":"scalar","type":"Int"},{"name":"unitsFulfilled","kind":"scalar","type":"Int"},{"name":"hospitalName","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"upazila","kind":"scalar","type":"String"},{"name":"contactPhone","kind":"scalar","type":"String"},{"name":"note","kind":"scalar","type":"String"},{"name":"urgency","kind":"enum","type":"UrgencyLevel"},{"name":"status","kind":"enum","type":"RequestStatus"},{"name":"neededBy","kind":"scalar","type":"DateTime"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"requester","kind":"object","type":"User","relationName":"RequesterRelation"},{"name":"organization","kind":"object","type":"Organization","relationName":"BloodRequestToOrganization"},{"name":"responses","kind":"object","type":"DonorResponse","relationName":"BloodRequestToDonorResponse"},{"name":"donations","kind":"object","type":"Donation","relationName":"BloodRequestToDonation"},{"name":"payments","kind":"object","type":"Payment","relationName":"BloodRequestToPayment"},{"name":"notifications","kind":"object","type":"Notification","relationName":"BloodRequestToNotification"}],"dbName":"blood_requests","schema":null},"DonorResponse":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"donorId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"ResponseStatus"},{"name":"message","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"request","kind":"object","type":"BloodRequest","relationName":"BloodRequestToDonorResponse"},{"name":"donor","kind":"object","type":"User","relationName":"DonorResponseToUser"}],"dbName":"donor_responses","schema":null},"Donation":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"campId","kind":"scalar","type":"String"},{"name":"donorId","kind":"scalar","type":"String"},{"name":"donatedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"request","kind":"object","type":"BloodRequest","relationName":"BloodRequestToDonation"},{"name":"camp","kind":"object","type":"DonationCamp","relationName":"DonationToDonationCamp"},{"name":"donor","kind":"object","type":"User","relationName":"DonationToUser"}],"dbName":"donations","schema":null},"DonationCamp":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"organizationId","kind":"scalar","type":"String"},{"name":"title","kind":"scalar","type":"String"},{"name":"description","kind":"scalar","type":"String"},{"name":"venue","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"date","kind":"scalar","type":"DateTime"},{"name":"status","kind":"enum","type":"CampStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"organization","kind":"object","type":"Organization","relationName":"DonationCampToOrganization"},{"name":"registrations","kind":"object","type":"CampRegistration","relationName":"CampRegistrationToDonationCamp"},{"name":"donations","kind":"object","type":"Donation","relationName":"DonationToDonationCamp"}],"dbName":"donation_camps","schema":null},"CampRegistration":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"campId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"attendance","kind":"enum","type":"AttendanceStatus"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"camp","kind":"object","type":"DonationCamp","relationName":"CampRegistrationToDonationCamp"},{"name":"user","kind":"object","type":"User","relationName":"CampRegistrationToUser"}],"dbName":"camp_registrations","schema":null},"DonorProfile":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"bloodGroup","kind":"enum","type":"BloodGroup"},{"name":"district","kind":"scalar","type":"String"},{"name":"upazila","kind":"scalar","type":"String"},{"name":"isAvailable","kind":"scalar","type":"Boolean"},{"name":"lastDonationDate","kind":"scalar","type":"DateTime"},{"name":"bio","kind":"scalar","type":"String"},{"name":"totalDonations","kind":"scalar","type":"Int"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"DonorProfileToUser"}],"dbName":"donor_profiles","schema":null},"Notification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"NotificationType"},{"name":"title","kind":"scalar","type":"String"},{"name":"message","kind":"scalar","type":"String"},{"name":"isRead","kind":"scalar","type":"Boolean"},{"name":"readAt","kind":"scalar","type":"DateTime"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"NotificationToUser"},{"name":"request","kind":"object","type":"BloodRequest","relationName":"BloodRequestToNotification"}],"dbName":"notifications","schema":null},"Organization":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"type","kind":"enum","type":"OrganizationType"},{"name":"address","kind":"scalar","type":"String"},{"name":"district","kind":"scalar","type":"String"},{"name":"upazila","kind":"scalar","type":"String"},{"name":"contactPhone","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"verificationStatus","kind":"enum","type":"VerificationStatus"},{"name":"rejectionReason","kind":"scalar","type":"String"},{"name":"ownerId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"owner","kind":"object","type":"User","relationName":"OrgOwner"},{"name":"members","kind":"object","type":"OrganizationMember","relationName":"OrganizationToOrganizationMember"},{"name":"camps","kind":"object","type":"DonationCamp","relationName":"DonationCampToOrganization"},{"name":"coordinatedRequests","kind":"object","type":"BloodRequest","relationName":"BloodRequestToOrganization"}],"dbName":"organizations","schema":null},"OrganizationMember":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"organizationId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"roleInOrg","kind":"enum","type":"OrgMemberRole"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"organization","kind":"object","type":"Organization","relationName":"OrganizationToOrganizationMember"},{"name":"user","kind":"object","type":"User","relationName":"OrganizationMemberToUser"}],"dbName":"organization_members","schema":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"provider","kind":"enum","type":"PaymentProvider"},{"name":"purpose","kind":"enum","type":"PaymentPurpose"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"amount","kind":"scalar","type":"Decimal"},{"name":"currency","kind":"scalar","type":"String"},{"name":"merchantInvoiceNumber","kind":"scalar","type":"String"},{"name":"bkashPaymentId","kind":"scalar","type":"String"},{"name":"trxId","kind":"scalar","type":"String"},{"name":"payerReference","kind":"scalar","type":"String"},{"name":"payerMobile","kind":"scalar","type":"String"},{"name":"requestId","kind":"scalar","type":"String"},{"name":"failureReason","kind":"scalar","type":"String"},{"name":"paidAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"PaymentToUser"},{"name":"request","kind":"object","type":"BloodRequest","relationName":"BloodRequestToPayment"},{"name":"events","kind":"object","type":"PaymentEvent","relationName":"PaymentToPaymentEvent"}],"dbName":"payments","schema":null},"PaymentEvent":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"paymentId","kind":"scalar","type":"String"},{"name":"eventType","kind":"scalar","type":"String"},{"name":"payload","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"payment","kind":"object","type":"Payment","relationName":"PaymentToPaymentEvent"}],"dbName":"payment_events","schema":null},"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"role","kind":"enum","type":"Role"},{"name":"status","kind":"enum","type":"UserStatus"},{"name":"googleId","kind":"scalar","type":"String"},{"name":"isVerified","kind":"scalar","type":"Boolean"},{"name":"phone","kind":"scalar","type":"String"},{"name":"avatar","kind":"scalar","type":"String"},{"name":"deletedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"donorProfile","kind":"object","type":"DonorProfile","relationName":"DonorProfileToUser"},{"name":"ownedOrganizations","kind":"object","type":"Organization","relationName":"OrgOwner"},{"name":"organizationMembers","kind":"object","type":"OrganizationMember","relationName":"OrganizationMemberToUser"},{"name":"requestsMade","kind":"object","type":"BloodRequest","relationName":"RequesterRelation"},{"name":"donorResponses","kind":"object","type":"DonorResponse","relationName":"DonorResponseToUser"},{"name":"donations","kind":"object","type":"Donation","relationName":"DonationToUser"},{"name":"campRegistrations","kind":"object","type":"CampRegistration","relationName":"CampRegistrationToUser"},{"name":"notifications","kind":"object","type":"Notification","relationName":"NotificationToUser"},{"name":"payments","kind":"object","type":"Payment","relationName":"PaymentToUser"},{"name":"auditLogs","kind":"object","type":"AuditLog","relationName":"ActorRelation"},{"name":"reviewsGiven","kind":"object","type":"Review","relationName":"ReviewerRelation"},{"name":"reviewsReceived","kind":"object","type":"Review","relationName":"ReviewedDonorRelation"}],"dbName":"users","schema":null}},"enums":{},"types":{}}');
config2.parameterizationSchema = {
  strings: JSON.parse('["where","user","donorProfile","orderBy","cursor","owner","organization","members","camp","registrations","requester","request","donor","responses","donations","payment","events","_count","payments","notifications","camps","coordinatedRequests","ownedOrganizations","organizationMembers","requestsMade","donorResponses","campRegistrations","auditLogs","reviewer","reviewsGiven","reviewsReceived","actor","AuditLog.findUnique","AuditLog.findUniqueOrThrow","AuditLog.findFirst","AuditLog.findFirstOrThrow","AuditLog.findMany","data","AuditLog.createOne","AuditLog.createMany","AuditLog.createManyAndReturn","AuditLog.updateOne","AuditLog.updateMany","AuditLog.updateManyAndReturn","create","update","AuditLog.upsertOne","AuditLog.deleteOne","AuditLog.deleteMany","having","_min","_max","AuditLog.groupBy","AuditLog.aggregate","Review.findUnique","Review.findUniqueOrThrow","Review.findFirst","Review.findFirstOrThrow","Review.findMany","Review.createOne","Review.createMany","Review.createManyAndReturn","Review.updateOne","Review.updateMany","Review.updateManyAndReturn","Review.upsertOne","Review.deleteOne","Review.deleteMany","_avg","_sum","Review.groupBy","Review.aggregate","BloodRequest.findUnique","BloodRequest.findUniqueOrThrow","BloodRequest.findFirst","BloodRequest.findFirstOrThrow","BloodRequest.findMany","BloodRequest.createOne","BloodRequest.createMany","BloodRequest.createManyAndReturn","BloodRequest.updateOne","BloodRequest.updateMany","BloodRequest.updateManyAndReturn","BloodRequest.upsertOne","BloodRequest.deleteOne","BloodRequest.deleteMany","BloodRequest.groupBy","BloodRequest.aggregate","DonorResponse.findUnique","DonorResponse.findUniqueOrThrow","DonorResponse.findFirst","DonorResponse.findFirstOrThrow","DonorResponse.findMany","DonorResponse.createOne","DonorResponse.createMany","DonorResponse.createManyAndReturn","DonorResponse.updateOne","DonorResponse.updateMany","DonorResponse.updateManyAndReturn","DonorResponse.upsertOne","DonorResponse.deleteOne","DonorResponse.deleteMany","DonorResponse.groupBy","DonorResponse.aggregate","Donation.findUnique","Donation.findUniqueOrThrow","Donation.findFirst","Donation.findFirstOrThrow","Donation.findMany","Donation.createOne","Donation.createMany","Donation.createManyAndReturn","Donation.updateOne","Donation.updateMany","Donation.updateManyAndReturn","Donation.upsertOne","Donation.deleteOne","Donation.deleteMany","Donation.groupBy","Donation.aggregate","DonationCamp.findUnique","DonationCamp.findUniqueOrThrow","DonationCamp.findFirst","DonationCamp.findFirstOrThrow","DonationCamp.findMany","DonationCamp.createOne","DonationCamp.createMany","DonationCamp.createManyAndReturn","DonationCamp.updateOne","DonationCamp.updateMany","DonationCamp.updateManyAndReturn","DonationCamp.upsertOne","DonationCamp.deleteOne","DonationCamp.deleteMany","DonationCamp.groupBy","DonationCamp.aggregate","CampRegistration.findUnique","CampRegistration.findUniqueOrThrow","CampRegistration.findFirst","CampRegistration.findFirstOrThrow","CampRegistration.findMany","CampRegistration.createOne","CampRegistration.createMany","CampRegistration.createManyAndReturn","CampRegistration.updateOne","CampRegistration.updateMany","CampRegistration.updateManyAndReturn","CampRegistration.upsertOne","CampRegistration.deleteOne","CampRegistration.deleteMany","CampRegistration.groupBy","CampRegistration.aggregate","DonorProfile.findUnique","DonorProfile.findUniqueOrThrow","DonorProfile.findFirst","DonorProfile.findFirstOrThrow","DonorProfile.findMany","DonorProfile.createOne","DonorProfile.createMany","DonorProfile.createManyAndReturn","DonorProfile.updateOne","DonorProfile.updateMany","DonorProfile.updateManyAndReturn","DonorProfile.upsertOne","DonorProfile.deleteOne","DonorProfile.deleteMany","DonorProfile.groupBy","DonorProfile.aggregate","Notification.findUnique","Notification.findUniqueOrThrow","Notification.findFirst","Notification.findFirstOrThrow","Notification.findMany","Notification.createOne","Notification.createMany","Notification.createManyAndReturn","Notification.updateOne","Notification.updateMany","Notification.updateManyAndReturn","Notification.upsertOne","Notification.deleteOne","Notification.deleteMany","Notification.groupBy","Notification.aggregate","Organization.findUnique","Organization.findUniqueOrThrow","Organization.findFirst","Organization.findFirstOrThrow","Organization.findMany","Organization.createOne","Organization.createMany","Organization.createManyAndReturn","Organization.updateOne","Organization.updateMany","Organization.updateManyAndReturn","Organization.upsertOne","Organization.deleteOne","Organization.deleteMany","Organization.groupBy","Organization.aggregate","OrganizationMember.findUnique","OrganizationMember.findUniqueOrThrow","OrganizationMember.findFirst","OrganizationMember.findFirstOrThrow","OrganizationMember.findMany","OrganizationMember.createOne","OrganizationMember.createMany","OrganizationMember.createManyAndReturn","OrganizationMember.updateOne","OrganizationMember.updateMany","OrganizationMember.updateManyAndReturn","OrganizationMember.upsertOne","OrganizationMember.deleteOne","OrganizationMember.deleteMany","OrganizationMember.groupBy","OrganizationMember.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","PaymentEvent.findUnique","PaymentEvent.findUniqueOrThrow","PaymentEvent.findFirst","PaymentEvent.findFirstOrThrow","PaymentEvent.findMany","PaymentEvent.createOne","PaymentEvent.createMany","PaymentEvent.createManyAndReturn","PaymentEvent.updateOne","PaymentEvent.updateMany","PaymentEvent.updateManyAndReturn","PaymentEvent.upsertOne","PaymentEvent.deleteOne","PaymentEvent.deleteMany","PaymentEvent.groupBy","PaymentEvent.aggregate","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","User.upsertOne","User.deleteOne","User.deleteMany","User.groupBy","User.aggregate","AND","OR","NOT","id","name","email","password","Role","role","UserStatus","status","googleId","isVerified","phone","avatar","deletedAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","every","some","none","paymentId","eventType","payload","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","userId","PaymentProvider","provider","PaymentPurpose","purpose","PaymentStatus","amount","currency","merchantInvoiceNumber","bkashPaymentId","trxId","payerReference","payerMobile","requestId","failureReason","paidAt","organizationId","OrgMemberRole","roleInOrg","OrganizationType","type","address","district","upazila","contactPhone","VerificationStatus","verificationStatus","rejectionReason","ownerId","NotificationType","title","message","isRead","readAt","BloodGroup","bloodGroup","isAvailable","lastDonationDate","bio","totalDonations","campId","AttendanceStatus","attendance","description","venue","date","CampStatus","donorId","donatedAt","ResponseStatus","requesterId","patientName","units","unitsFulfilled","hospitalName","note","UrgencyLevel","urgency","RequestStatus","neededBy","reviewerId","rating","comment","actorId","action","targetType","targetId","details","requestId_donorId","campId_userId","organizationId_userId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "yQh-4AELHwAAigQAIIgCAACIBAAwiQIAAEYAEIoCAACIBAAwiwIBAAAAAZgCQAC7AwAh8AIBALYDACHxAgEAtQMAIfICAQC1AwAh8wIBALYDACH0AgAAiQQAIAEAAAABACAcAgAAvAMAIA4AAMEDACASAADEAwAgEwAAwwMAIBYAAL0DACAXAAC-AwAgGAAAvwMAIBkAAMADACAaAADCAwAgGwAAxQMAIB0AAMYDACAeAADGAwAgiAIAALQDADCJAgAAAwAQigIAALQDADCLAgEAtQMAIYwCAQC1AwAhjQIBALUDACGOAgEAtgMAIZACAAC3A5ACIpICAAC4A5ICIpMCAQC2AwAhlAIgALkDACGVAgEAtgMAIZYCAQC2AwAhlwJAALoDACGYAkAAuwMAIZkCQAC7AwAhAQAAAAMAIA8BAADwAwAgiAIAAO0DADCJAgAABQAQigIAAO0DADCLAgEAtQMAIZgCQAC7AwAhmQJAALsDACGxAgEAtQMAIccCAQC1AwAhyAIBALYDACHUAgAA7gPUAiLVAiAAuQMAIdYCQAC6AwAh1wIBALYDACHYAgIA7wMAIQEAAAAFACAUBQAA8AMAIAcAAL4DACAUAACtBAAgFQAAvwMAIIgCAACqBAAwiQIAAAcAEIoCAACqBAAwiwIBALUDACGMAgEAtQMAIY0CAQC2AwAhmAJAALsDACGZAkAAuwMAIcUCAACrBMUCIsYCAQC1AwAhxwIBALUDACHIAgEAtgMAIckCAQC2AwAhywIAAKwEywIizAIBALYDACHNAgEAtQMAIQgFAACjBwAgBwAA_gYAIBQAAMYHACAVAAD_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_AgEAtgMAIcACQAC6AwAhCgEAAKMHACALAADCBwAgEAAAxAcAILoCAACuBAAguwIAAK4EACC8AgAArgQAIL0CAACuBAAgvgIAAK4EACC_AgAArgQAIMACAACuBAAgFwEAAPADACALAACRBAAgEAAAmQQAIIgCAACUBAAwiQIAACMAEIoCAACUBAAwiwIBAAAAAZICAACXBLcCIpgCQAC7AwAhmQJAALsDACGxAgEAtQMAIbMCAACVBLMCIrUCAACWBLUCIrcCEACYBAAhuAIBALUDACG5AgEAAAABugIBAAAAAbsCAQAAAAG8AgEAtgMAIb0CAQC2AwAhvgIBALYDACG_AgEAtgMAIcACQAC6AwAhAwAAACMAIAMAACQAMAQAACUAIAEAAAAbACAJDwAAkwQAIIgCAACSBAAwiQIAACgAEIoCAACSBAAwiwIBALUDACGYAkAAuwMAIagCAQC1AwAhqQIBALUDACGqAgAAiQQAIAIPAADDBwAgqgIAAK4EACAJDwAAkwQAIIgCAACSBAAwiQIAACgAEIoCAACSBAAwiwIBAAAAAZgCQAC7AwAhqAIBALUDACGpAgEAtQMAIaoCAACJBAAgAwAAACgAIAMAACkAMAQAACoAIAEAAAAoACAOAQAA8AMAIAsAAJEEACCIAgAAjwQAMIkCAAAtABCKAgAAjwQAMIsCAQC1AwAhmAJAALsDACGxAgEAtQMAIb4CAQC2AwAhxQIAAJAEzwIizwIBALUDACHQAgEAtQMAIdECIAC5AwAh0gJAALoDACEEAQAAowcAIAsAAMIHACC-AgAArgQAINICAACuBAAgDgEAAPADACALAACRBAAgiAIAAI8EADCJAgAALQAQigIAAI8EADCLAgEAAAABmAJAALsDACGxAgEAtQMAIb4CAQC2AwAhxQIAAJAEzwIizwIBALUDACHQAgEAtQMAIdECIAC5AwAh0gJAALoDACEDAAAALQAgAwAALgAwBAAALwAgAQAAABsAIAEAAAAeACABAAAAFwAgAQAAACMAIAEAAAAtACABAAAADwAgAQAAABMAIAEAAAAXACALBgAAwQcAIAoAAKMHACANAACABwAgDgAAgQcAIBIAAIQHACATAACDBwAglwIAAK4EACDBAgAArgQAIMgCAACuBAAg5AIAAK4EACDoAgAArgQAIBsGAACOBAAgCgAA8AMAIA0AAMADACAOAADBAwAgEgAAxAMAIBMAAMMDACCIAgAAiwQAMIkCAAAbABCKAgAAiwQAMIsCAQAAAAGSAgAAjQTsAiKXAkAAugMAIZgCQAC7AwAhmQJAALsDACHBAgEAtgMAIccCAQC1AwAhyAIBALYDACHJAgEAtQMAIdQCAADuA9QCIuMCAQC1AwAh5AIBALYDACHlAgIA7wMAIeYCAgDvAwAh5wIBALUDACHoAgEAtgMAIeoCAACMBOoCIuwCQAC7AwAhAwAAABsAIAMAADkAMAQAADoAIAEAAAALACABAAAADwAgAQAAABsAIAMAAAALACADAAAMADAEAAANACADAAAAGwAgAwAAOQAwBAAAOgAgAwAAAB4AIAMAAB8AMAQAACAAIAMAAAAXACADAAAYADAEAAAZACADAAAAEwAgAwAAFAAwBAAAFQAgAwAAAC0AIAMAAC4AMAQAAC8AIAMAAAAjACADAAAkADAEAAAlACALHwAAigQAIIgCAACIBAAwiQIAAEYAEIoCAACIBAAwiwIBALUDACGYAkAAuwMAIfACAQC2AwAh8QIBALUDACHyAgEAtQMAIfMCAQC2AwAh9AIAAIkEACAEHwAAowcAIPACAACuBAAg8wIAAK4EACD0AgAArgQAIAMAAABGACADAABHADAEAAABACALDAAA8AMAIBwAAPADACCIAgAAhwQAMIkCAABJABCKAgAAhwQAMIsCAQC1AwAhmAJAALsDACHgAgEAtQMAIe0CAQC1AwAh7gICAO8DACHvAgEAtgMAIQMMAACjBwAg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-AwAwiQIAAJsBABCKAgAA_gMAMIsCAQCdAwAhkgIAAIAE7AIilwJAAKIDACGYAkAAowMAIZkCQACjAwAhwQIBAJ4DACHHAgEAnQMAIcgCAQCeAwAhyQIBAJ0DACHUAgAA5wPUAiLjAgEAnQMAIeQCAQCeAwAh5QICAOgDACHmAgIA6AMAIecCAQCdAwAh6AIBAJ4DACHqAgAA_wPqAiLsAkAAowMAIQMAAAAbACADAACaAQAwMQAAmwEAIAMAAAAbACADAAA5ADAEAAA6ACABAAAAIAAgAQAAACAAIAMAAAAeACADAAAfADAEAAAgACADAAAAHgAgAwAAHwAwBAAAIAAgAwAAAB4AIAMAAB8AMAQAACAAIAkLAADHBQAgDAAAhgYAIIsCAQAAAAGSAgAAAOMCApgCQAAAAAGZAkAAAAABvgIBAAAAAdACAQAAAAHgAgEAAAABASUAAKMBACAHiwIBAAAAAZICAAAA4wICmAJAAAAAAZkCQAAAAAG-AgEAAAAB0AIBAAAAAeACAQAAAAEBJQAApQEAMAElAAClAQAwCQsAAMUFACAMAACEBgAgiwIBALIEACGSAgAAwwXjAiKYAkAAuAQAIZkCQAC4BAAhvgIBALIEACHQAgEAswQAIeACAQCyBAAhAgAAACAAICUAAKgBACAHiwIBALIEACGSAgAAwwXjAiKYAkAAuAQAIZkCQAC4BAAhvgIBALIEACHQAgEAswQAIeACAQCyBAAhAgAAAB4AICUAAKoBACACAAAAHgAgJQAAqgEAIAMAAAAgACAsAACjAQAgLQAAqAEAIAEAAAAgACABAAAAHgAgBBEAAK8HACAyAACxBwAgMwAAsAcAINACAACuBAAgCogCAAD6AwAwiQIAALEBABCKAgAA-gMAMIsCAQCdAwAhkgIAAPsD4wIimAJAAKMDACGZAkAAowMAIb4CAQCdAwAh0AIBAJ4DACHgAgEAnQMAIQMAAAAeACADAACwAQAwMQAAsQEAIAMAAAAeACADAAAfADAEAAAgACABAAAAGQAgAQAAABkAIAMAAAAXACADAAAYADAEAAAZACADAAAAFwAgAwAAGAAwBAAAGQAgAwAAABcAIAMAABgAMAQAABkAIAkIAAC4BQAgCwAAtwUAIAwAAPsFACCLAgEAAAABmAJAAAAAAb4CAQAAAAHZAgEAAAAB4AIBAAAAAeECQAAAAAEBJQAAuQEAIAaLAgEAAAABmAJAAAAAAb4CAQAAAAHZAgEAAAAB4AIBAAAAAeECQAAAAAEBJQAAuwEAMAElAAC7AQAwAQAAABsAIAEAAAAPACAJCAAAtQUAIAsAALQFACAMAAD5BQAgiwIBALIEACGYAkAAuAQAIb4CAQCzBAAh2QIBALMEACHgAgEAsgQAIeECQAC4BAAhAgAAABkAICUAAMABACAGiwIBALIEACGYAkAAuAQAIb4CAQCzBAAh2QIBALMEACHgAgEAsgQAIeECQAC4BAAhAgAAABcAICUAAMIBACACAAAAFwAgJQAAwgEAIAEAAAAbACABAAAADwAgAwAAABkAICwAALkBACAtAADAAQAgAQAAABkAIAEAAAAXACAFEQAArAcAIDIAAK4HACAzAACtBwAgvgIAAK4EACDZAgAArgQAIAmIAgAA-QMAMIkCAADLAQAQigIAAPkDADCLAgEAnQMAIZgCQACjAwAhvgIBAJ4DACHZAgEAngMAIeACAQCdAwAh4QJAAKMDACEDAAAAFwAgAwAAygEAMDEAAMsBACADAAAAFwAgAwAAGAAwBAAAGQAgAQAAABEAIAEAAAARACADAAAADwAgAwAAEAAwBAAAEQAgAwAAAA8AIAMAABAAMAQAABEAIAMAAAAPACADAAAQADAEAAARACANBgAAqwcAIAkAANoGACAOAADbBgAgiwIBAAAAAZICAAAA4AICmAJAAAAAAZkCQAAAAAHBAgEAAAABxwIBAAAAAc8CAQAAAAHcAgEAAAAB3QIBAAAAAd4CQAAAAAEBJQAA0wEAIAqLAgEAAAABkgIAAADgAgKYAkAAAAABmQJAAAAAAcECAQAAAAHHAgEAAAABzwIBAAAAAdwCAQAAAAHdAgEAAAAB3gJAAAAAAQElAADVAQAwASUAANUBADANBgAAqgcAIAkAAMMGACAOAADEBgAgiwIBALIEACGSAgAAwQbgAiKYAkAAuAQAIZkCQAC4BAAhwQIBALIEACHHAgEAsgQAIc8CAQCyBAAh3AIBALMEACHdAgEAsgQAId4CQAC4BAAhAgAAABEAICUAANgBACAKiwIBALIEACGSAgAAwQbgAiKYAkAAuAQAIZkCQAC4BAAhwQIBALIEACHHAgEAsgQAIc8CAQCyBAAh3AIBALMEACHdAgEAsgQAId4CQAC4BAAhAgAAAA8AICUAANoBACACAAAADwAgJQAA2gEAIAMAAAARACAsAADTAQAgLQAA2AEAIAEAAAARACABAAAADwAgBBEAAKcHACAyAACpBwAgMwAAqAcAINwCAACuBAAgDYgCAAD1AwAwiQIAAOEBABCKAgAA9QMAMIsCAQCdAwAhkgIAAPYD4AIimAJAAKMDACGZAkAAowMAIcECAQCdAwAhxwIBAJ0DACHPAgEAnQMAIdwCAQCeAwAh3QIBAJ0DACHeAkAAowMAIQMAAAAPACADAADgAQAwMQAA4QEAIAMAAAAPACADAAAQADAEAAARACABAAAAFQAgAQAAABUAIAMAAAATACADAAAUADAEAAAVACADAAAAEwAgAwAAFAAwBAAAFQAgAwAAABMAIAMAABQAMAQAABUAIAgBAADYBgAgCAAAqAUAIIsCAQAAAAGYAkAAAAABmQJAAAAAAbECAQAAAAHZAgEAAAAB2wIAAADbAgIBJQAA6QEAIAaLAgEAAAABmAJAAAAAAZkCQAAAAAGxAgEAAAAB2QIBAAAAAdsCAAAA2wICASUAAOsBADABJQAA6wEAMAgBAADWBgAgCAAApgUAIIsCAQCyBAAhmAJAALgEACGZAkAAuAQAIbECAQCyBAAh2QIBALIEACHbAgAApAXbAiICAAAAFQAgJQAA7gEAIAaLAgEAsgQAIZgCQAC4BAAhmQJAALgEACGxAgEAsgQAIdkCAQCyBAAh2wIAAKQF2wIiAgAAABMAICUAAPABACACAAAAEwAgJQAA8AEAIAMAAAAVACAsAADpAQAgLQAA7gEAIAEAAAAVACABAAAAEwAgAxEAAKQHACAyAACmBwAgMwAApQcAIAmIAgAA8QMAMIkCAAD3AQAQigIAAPEDADCLAgEAnQMAIZgCQACjAwAhmQJAAKMDACGxAgEAnQMAIdkCAQCdAwAh2wIAAPID2wIiAwAAABMAIAMAAPYBADAxAAD3AQAgAwAAABMAIAMAABQAMAQAABUAIA8BAADwAwAgiAIAAO0DADCJAgAABQAQigIAAO0DADCLAgEAAAABmAJAALsDACGZAkAAuwMAIbECAQAAAAHHAgEAtQMAIcgCAQC2AwAh1AIAAO4D1AIi1QIgALkDACHWAkAAugMAIdcCAQC2AwAh2AICAO8DACEBAAAA-gEAIAEAAAD6AQAgBAEAAKMHACDIAgAArgQAINYCAACuBAAg1wIAAK4EACADAAAABQAgAwAA_QEAMAQAAPoBACADAAAABQAgAwAA_QEAMAQAAPoBACADAAAABQAgAwAA_QEAMAQAAPoBACAMAQAAogcAIIsCAQAAAAGYAkAAAAABmQJAAAAAAbECAQAAAAHHAgEAAAAByAIBAAAAAdQCAAAA1AIC1QIgAAAAAdYCQAAAAAHXAgEAAAAB2AICAAAAAQElAACBAgAgC4sCAQAAAAGYAkAAAAABmQJAAAAAAbECAQAAAAHHAgEAAAAByAIBAAAAAdQCAAAA1AIC1QIgAAAAAdYCQAAAAAHXAgEAAAAB2AICAAAAAQElAACDAgAwASUAAIMCADAMAQAAoQcAIIsCAQCyBAAhmAJAALgEACGZAkAAuAQAIbECAQCyBAAhxwIBALIEACHIAgEAswQAIdQCAADSBdQCItUCIAC2BAAh1gJAALcEACHXAgEAswQAIdgCAgDPBAAhAgAAAPoBACAlAACGAgAgC4sCAQCyBAAhmAJAALgEACGZAkAAuAQAIbECAQCyBAAhxwIBALIEACHIAgEAswQAIdQCAADSBdQCItUCIAC2BAAh1gJAALcEACHXAgEAswQAIdgCAgDPBAAhAgAAAAUAICUAAIgCACACAAAABQAgJQAAiAIAIAMAAAD6AQAgLAAAgQIAIC0AAIYCACABAAAA-gEAIAEAAAAFACAIEQAAnAcAIDIAAJ8HACAzAACeBwAgRAAAnQcAIEUAAKAHACDIAgAArgQAINYCAACuBAAg1wIAAK4EACAOiAIAAOYDADCJAgAAjwIAEIoCAADmAwAwiwIBAJ0DACGYAkAAowMAIZkCQACjAwAhsQIBAJ0DACHHAgEAnQMAIcgCAQCeAwAh1AIAAOcD1AIi1QIgAKEDACHWAkAAogMAIdcCAQCeAwAh2AICAOgDACEDAAAABQAgAwAAjgIAMDEAAI8CACADAAAABQAgAwAA_QEAMAQAAPoBACABAAAALwAgAQAAAC8AIAMAAAAtACADAAAuADAEAAAvACADAAAALQAgAwAALgAwBAAALwAgAwAAAC0AIAMAAC4AMAQAAC8AIAsBAADlBQAgCwAAmQUAIIsCAQAAAAGYAkAAAAABsQIBAAAAAb4CAQAAAAHFAgAAAM8CAs8CAQAAAAHQAgEAAAAB0QIgAAAAAdICQAAAAAEBJQAAlwIAIAmLAgEAAAABmAJAAAAAAbECAQAAAAG-AgEAAAABxQIAAADPAgLPAgEAAAAB0AIBAAAAAdECIAAAAAHSAkAAAAABASUAAJkCADABJQAAmQIAMAEAAAAbACALAQAA4wUAIAsAAJcFACCLAgEAsgQAIZgCQAC4BAAhsQIBALIEACG-AgEAswQAIcUCAACVBc8CIs8CAQCyBAAh0AIBALIEACHRAiAAtgQAIdICQAC3BAAhAgAAAC8AICUAAJ0CACAJiwIBALIEACGYAkAAuAQAIbECAQCyBAAhvgIBALMEACHFAgAAlQXPAiLPAgEAsgQAIdACAQCyBAAh0QIgALYEACHSAkAAtwQAIQIAAAAtACAlAACfAgAgAgAAAC0AICUAAJ8CACABAAAAGwAgAwAAAC8AICwAAJcCACAtAACdAgAgAQAAAC8AIAEAAAAtACAFEQAAmQcAIDIAAJsHACAzAACaBwAgvgIAAK4EACDSAgAArgQAIAyIAgAA4gMAMIkCAACnAgAQigIAAOIDADCLAgEAnQMAIZgCQACjAwAhsQIBAJ0DACG-AgEAngMAIcUCAADjA88CIs8CAQCdAwAh0AIBAJ0DACHRAiAAoQMAIdICQACiAwAhAwAAAC0AIAMAAKYCADAxAACnAgAgAwAAAC0AIAMAAC4AMAQAAC8AIAEAAAAJACABAAAACQAgAwAAAAcAIAMAAAgAMAQAAAkAIAMAAAAHACADAAAIADAEAAAJACADAAAABwAgAwAACAAwBAAACQAgEQUAAJgHACAHAADoBgAgFAAA6QYAIBUAAOoGACCLAgEAAAABjAIBAAAAAY0CAQAAAAGYAkAAAAABmQJAAAAAAcUCAAAAxQICxgIBAAAAAccCAQAAAAHIAgEAAAAByQIBAAAAAcsCAAAAywICzAIBAAAAAc0CAQAAAAEBJQAArwIAIA2LAgEAAAABjAIBAAAAAY0CAQAAAAGYAkAAAAABmQJAAAAAAcUCAAAAxQICxgIBAAAAAccCAQAAAAHIAgEAAAAByQIBAAAAAcsCAAAAywICzAIBAAAAAc0CAQAAAAEBJQAAsQIAMAElAACxAgAwEQUAAJcHACAHAACpBgAgFAAAqgYAIBUAAKsGACCLAgEAsgQAIYwCAQCyBAAhjQIBALMEACGYAkAAuAQAIZkCQAC4BAAhxQIAAKYGxQIixgIBALIEACHHAgEAsgQAIcgCAQCzBAAhyQIBALMEACHLAgAApwbLAiLMAgEAswQAIc0CAQCyBAAhAgAAAAkAICUAALQCACANiwIBALIEACGMAgEAsgQAIY0CAQCzBAAhmAJAALgEACGZAkAAuAQAIcUCAACmBsUCIsYCAQCyBAAhxwIBALIEACHIAgEAswQAIckCAQCzBAAhywIAAKcGywIizAIBALMEACHNAgEAsgQAIQIAAAAHACAlAAC2AgAgAgAAAAcAICUAALYCACADAAAACQAgLAAArwIAIC0AALQCACABAAAACQAgAQAAAAcAIAcRAACUBwAgMgAAlgcAIDMAAJUHACCNAgAArgQAIMgCAACuBAAgyQIAAK4EACDMAgAArgQAIBCIAgAA2wMAMIkCAAC9AgAQigIAANsDADCLAgEAnQMAIYwCAQCdAwAhjQIBAJ4DACGYAkAAowMAIZkCQACjAwAhxQIAANwDxQIixgIBAJ0DACHHAgEAnQMAIcgCAQCeAwAhyQIBAJ4DACHLAgAA3QPLAiLMAgEAngMAIc0CAQCdAwAhAwAAAAcAIAMAALwCADAxAAC9AgAgAwAAAAcAIAMAAAgAMAQAAAkAIAEAAAANACABAAAADQAgAwAAAAsAIAMAAAwAMAQAAA0AIAMAAAALACADAAAMADAEAAANACADAAAACwAgAwAADAAwBAAADQAgBwEAAOYGACAGAACbBgAgiwIBAAAAAZgCQAAAAAGxAgEAAAABwQIBAAAAAcMCAAAAwwICASUAAMUCACAFiwIBAAAAAZgCQAAAAAGxAgEAAAABwQIBAAAAAcMCAAAAwwICASUAAMcCADABJQAAxwIAMAcBAADkBgAgBgAAmQYAIIsCAQCyBAAhmAJAALgEACGxAgEAsgQAIcECAQCyBAAhwwIAAJcGwwIiAgAAAA0AICUAAMoCACAFiwIBALIEACGYAkAAuAQAIbECAQCyBAAhwQIBALIEACHDAgAAlwbDAiICAAAACwAgJQAAzAIAIAIAAAALACAlAADMAgAgAwAAAA0AICwAAMUCACAtAADKAgAgAQAAAA0AIAEAAAALACADEQAAkQcAIDIAAJMHACAzAACSBwAgCIgCAADXAwAwiQIAANMCABCKAgAA1wMAMIsCAQCdAwAhmAJAAKMDACGxAgEAnQMAIcECAQCdAwAhwwIAANgDwwIiAwAAAAsAIAMAANICADAxAADTAgAgAwAAAAsAIAMAAAwAMAQAAA0AIAEAAAAlACABAAAAJQAgAwAAACMAIAMAACQAMAQAACUAIAMAAAAjACADAAAkADAEAAAlACADAAAAIwAgAwAAJAAwBAAAJQAgFAEAAPAFACALAACJBQAgEAAAigUAIIsCAQAAAAGSAgAAALcCApgCQAAAAAGZAkAAAAABsQIBAAAAAbMCAAAAswICtQIAAAC1AgK3AhAAAAABuAIBAAAAAbkCAQAAAAG6AgEAAAABuwIBAAAAAbwCAQAAAAG9AgEAAAABvgIBAAAAAb8CAQAAAAHAAkAAAAABASUAANsCACARiwIBAAAAAZICAAAAtwICmAJAAAAAAZkCQAAAAAGxAgEAAAABswIAAACzAgK1AgAAALUCArcCEAAAAAG4AgEAAAABuQIBAAAAAboCAQAAAAG7AgEAAAABvAIBAAAAAb0CAQAAAAG-AgEAAAABvwIBAAAAAcACQAAAAAEBJQAA3QIAMAElAADdAgAwAQAAABsAIBQBAADuBQAgCwAA-gQAIBAAAPsEACCLAgEAsgQAIZICAAD3BLcCIpgCQAC4BAAhmQJAALgEACGxAgEAsgQAIbMCAAD1BLMCIrUCAAD2BLUCIrcCEAD4BAAhuAIBALIEACG5AgEAsgQAIboCAQCzBAAhuwIBALMEACG8AgEAswQAIb0CAQCzBAAhvgIBALMEACG_AgEAswQAIcACQAC3BAAhAgAAACUAICUAAOECACARiwIBALIEACGSAgAA9wS3AiKYAkAAuAQAIZkCQAC4BAAhsQIBALIEACGzAgAA9QSzAiK1AgAA9gS1AiK3AhAA-AQAIbgCAQCyBAAhuQIBALIEACG6AgEAswQAIbsCAQCzBAAhvAIBALMEACG9AgEAswQAIb4CAQCzBAAhvwIBALMEACHAAkAAtwQAIQIAAAAjACAlAADjAgAgAgAAACMAICUAAOMCACABAAAAGwAgAwAAACUAICwAANsCACAtAADhAgAgAQAAACUAIAEAAAAjACAMEQAAjAcAIDIAAI8HACAzAACOBwAgRAAAjQcAIEUAAJAHACC6AgAArgQAILsCAACuBAAgvAIAAK4EACC9AgAArgQAIL4CAACuBAAgvwIAAK4EACDAAgAArgQAIBSIAgAAygMAMIkCAADrAgAQigIAAMoDADCLAgEAnQMAIZICAADNA7cCIpgCQACjAwAhmQJAAKMDACGxAgEAnQMAIbMCAADLA7MCIrUCAADMA7UCIrcCEADOAwAhuAIBAJ0DACG5AgEAnQMAIboCAQCeAwAhuwIBAJ4DACG8AgEAngMAIb0CAQCeAwAhvgIBAJ4DACG_AgEAngMAIcACQACiAwAhAwAAACMAIAMAAOoCADAxAADrAgAgAwAAACMAIAMAACQAMAQAACUAIAEAAAAqACABAAAAKgAgAwAAACgAIAMAACkAMAQAACoAIAMAAAAoACADAAApADAEAAAqACADAAAAKAAgAwAAKQAwBAAAKgAgBg8AAIsHACCLAgEAAAABmAJAAAAAAagCAQAAAAGpAgEAAAABqgKAAAAAAQElAADzAgAgBYsCAQAAAAGYAkAAAAABqAIBAAAAAakCAQAAAAGqAoAAAAABASUAAPUCADABJQAA9QIAMAYPAACKBwAgiwIBALIEACGYAkAAuAQAIagCAQCyBAAhqQIBALIEACGqAoAAAAABAgAAACoAICUAAPgCACAFiwIBALIEACGYAkAAuAQAIagCAQCyBAAhqQIBALIEACGqAoAAAAABAgAAACgAICUAAPoCACACAAAAKAAgJQAA-gIAIAMAAAAqACAsAADzAgAgLQAA-AIAIAEAAAAqACABAAAAKAAgBBEAAIcHACAyAACJBwAgMwAAiAcAIKoCAACuBAAgCIgCAADHAwAwiQIAAIEDABCKAgAAxwMAMIsCAQCdAwAhmAJAAKMDACGoAgEAnQMAIakCAQCdAwAhqgIAAMgDACADAAAAKAAgAwAAgAMAMDEAAIEDACADAAAAKAAgAwAAKQAwBAAAKgAgHAIAALwDACAOAADBAwAgEgAAxAMAIBMAAMMDACAWAAC9AwAgFwAAvgMAIBgAAL8DACAZAADAAwAgGgAAwgMAIBsAAMUDACAdAADGAwAgHgAAxgMAIIgCAAC0AwAwiQIAAAMAEIoCAAC0AwAwiwIBAAAAAYwCAQC1AwAhjQIBAAAAAY4CAQC2AwAhkAIAALcDkAIikgIAALgDkgIikwIBAAAAAZQCIAC5AwAhlQIBALYDACGWAgEAtgMAIZcCQAC6AwAhmAJAALsDACGZAkAAuwMAIQEAAACEAwAgAQAAAIQDACARAgAA_AYAIA4AAIEHACASAACEBwAgEwAAgwcAIBYAAP0GACAXAAD-BgAgGAAA_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-ACIgcRAAClAwAgMgAA-AMAIDMAAPgDACCaAgAAAOACApsCAAAA4AIInAIAAADgAgihAgAA9wPgAiIEmgIAAADgAgKbAgAAAOACCJwCAAAA4AIIoQIAAPgD4AIiCYgCAAD5AwAwiQIAAMsBABCKAgAA-QMAMIsCAQCdAwAhmAJAAKMDACG-AgEAngMAIdkCAQCeAwAh4AIBAJ0DACHhAkAAowMAIQqIAgAA-gMAMIkCAACxAQAQigIAAPoDADCLAgEAnQMAIZICAAD7A-MCIpgCQACjAwAhmQJAAKMDACG-AgEAnQMAIdACAQCeAwAh4AIBAJ0DACEHEQAApQMAIDIAAP0DACAzAAD9AwAgmgIAAADjAgKbAgAAAOMCCJwCAAAA4wIIoQIAAPwD4wIiBxEAAKUDACAyAAD9AwAgMwAA_QMAIJoCAAAA4wICmwIAAADjAgicAgAAAOMCCKECAAD8A-MCIgSaAgAAAOMCApsCAAAA4wIInAIAAADjAgihAgAA_QPjAiIViAIAAP4DADCJAgAAmwEAEIoCAAD-AwAwiwIBAJ0DACGSAgAAgATsAiKXAkAAogMAIZgCQACjAwAhmQJAAKMDACHBAgEAngMAIccCAQCdAwAhyAIBAJ4DACHJAgEAnQMAIdQCAADnA9QCIuMCAQCdAwAh5AIBAJ4DACHlAgIA6AMAIeYCAgDoAwAh5wIBAJ0DACHoAgEAngMAIeoCAAD_A-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_AgEAtgMAIcACQAC6AwAh-AIAACMAIPkCAAAjACAXAQAA8AMAIAsAAJEEACAQAACZBAAgiAIAAJQEADCJAgAAIwAQigIAAJQEADCLAgEAtQMAIZICAACXBLcCIpgCQAC7AwAhmQJAALsDACGxAgEAtQMAIbMCAACVBLMCIrUCAACWBLUCIrcCEACYBAAhuAIBALUDACG5AgEAtQMAIboCAQC2AwAhuwIBALYDACG8AgEAtgMAIb0CAQC2AwAhvgIBALYDACG_AgEAtgMAIcACQAC6AwAhBJoCAAAAswICmwIAAACzAgicAgAAALMCCKECAADWA7MCIgSaAgAAALUCApsCAAAAtQIInAIAAAC1AgihAgAA1AO1AiIEmgIAAAC3AgKbAgAAALcCCJwCAAAAtwIIoQIAANIDtwIiCJoCEAAAAAGbAhAAAAAEnAIQAAAABJ0CEAAAAAGeAhAAAAABnwIQAAAAAaACEAAAAAGhAhAA0AMAIQOlAgAAKAAgpgIAACgAIKcCAAAoACACvgIBAAAAAeACAQAAAAEMCwAAnQQAIAwAAPADACCIAgAAmwQAMIkCAAAeABCKAgAAmwQAMIsCAQC1AwAhkgIAAJwE4wIimAJAALsDACGZAkAAuwMAIb4CAQC1AwAh0AIBALYDACHgAgEAtQMAIQSaAgAAAOMCApsCAAAA4wIInAIAAADjAgihAgAA_QPjAiIdBgAAjgQAIAoAAPADACANAADAAwAgDgAAwQMAIBIAAMQDACATAADDAwAgiAIAAIsEADCJAgAAGwAQigIAAIsEADCLAgEAtQMAIZICAACNBOwCIpcCQAC6AwAhmAJAALsDACGZAkAAuwMAIcECAQC2AwAhxwIBALUDACHIAgEAtgMAIckCAQC1AwAh1AIAAO4D1AIi4wIBALUDACHkAgEAtgMAIeUCAgDvAwAh5gICAO8DACHnAgEAtQMAIegCAQC2AwAh6gIAAIwE6gIi7AJAALsDACH4AgAAGwAg-QIAABsAIAwIAACfBAAgCwAAkQQAIAwAAPADACCIAgAAngQAMIkCAAAXABCKAgAAngQAMIsCAQC1AwAhmAJAALsDACG-AgEAtgMAIdkCAQC2AwAh4AIBALUDACHhAkAAuwMAIRIGAACmBAAgCQAAwgMAIA4AAMEDACCIAgAApAQAMIkCAAAPABCKAgAApAQAMIsCAQC1AwAhkgIAAKUE4AIimAJAALsDACGZAkAAuwMAIcECAQC1AwAhxwIBALUDACHPAgEAtQMAIdwCAQC2AwAh3QIBALUDACHeAkAAuwMAIfgCAAAPACD5AgAADwAgArECAQAAAAHZAgEAAAABCwEAAPADACAIAACjBAAgiAIAAKEEADCJAgAAEwAQigIAAKEEADCLAgEAtQMAIZgCQAC7AwAhmQJAALsDACGxAgEAtQMAIdkCAQC1AwAh2wIAAKIE2wIiBJoCAAAA2wICmwIAAADbAgicAgAAANsCCKECAAD0A9sCIhIGAACmBAAgCQAAwgMAIA4AAMEDACCIAgAApAQAMIkCAAAPABCKAgAApAQAMIsCAQC1AwAhkgIAAKUE4AIimAJAALsDACGZAkAAuwMAIcECAQC1AwAhxwIBALUDACHPAgEAtQMAIdwCAQC2AwAh3QIBALUDACHeAkAAuwMAIfgCAAAPACD5AgAADwAgEAYAAKYEACAJAADCAwAgDgAAwQMAIIgCAACkBAAwiQIAAA8AEIoCAACkBAAwiwIBALUDACGSAgAApQTgAiKYAkAAuwMAIZkCQAC7AwAhwQIBALUDACHHAgEAtQMAIc8CAQC1AwAh3AIBALYDACHdAgEAtQMAId4CQAC7AwAhBJoCAAAA4AICmwIAAADgAgicAgAAAOACCKECAAD4A-ACIhYFAADwAwAgBwAAvgMAIBQAAK0EACAVAAC_AwAgiAIAAKoEADCJAgAABwAQigIAAKoEADCLAgEAtQMAIYwCAQC1AwAhjQIBALYDACGYAkAAuwMAIZkCQAC7AwAhxQIAAKsExQIixgIBALUDACHHAgEAtQMAIcgCAQC2AwAhyQIBALYDACHLAgAArATLAiLMAgEAtgMAIc0CAQC1AwAh-AIAAAcAIPkCAAAHACACsQIBAAAAAcECAQAAAAEKAQAA8AMAIAYAAKYEACCIAgAAqAQAMIkCAAALABCKAgAAqAQAMIsCAQC1AwAhmAJAALsDACGxAgEAtQMAIcECAQC1AwAhwwIAAKkEwwIiBJoCAAAAwwICmwIAAADDAgicAgAAAMMCCKECAADaA8MCIhQFAADwAwAgBwAAvgMAIBQAAK0EACAVAAC_AwAgiAIAAKoEADCJAgAABwAQigIAAKoEADCLAgEAtQMAIYwCAQC1AwAhjQIBALYDACGYAkAAuwMAIZkCQAC7AwAhxQIAAKsExQIixgIBALUDACHHAgEAtQMAIcgCAQC2AwAhyQIBALYDACHLAgAArATLAiLMAgEAtgMAIc0CAQC1AwAhBJoCAAAAxQICmwIAAADFAgicAgAAAMUCCKECAADhA8UCIgSaAgAAAMsCApsCAAAAywIInAIAAADLAgihAgAA3wPLAiIDpQIAAA8AIKYCAAAPACCnAgAADwAgAAAAAAH9AgEAAAABAf0CAQAAAAEB_QIAAACQAgIB_QIAAACSAgIB_QIgAAAAAQH9AkAAAAABAf0CQAAAAAEHLAAA6wYAIC0AAO4GACD6AgAA7AYAIPsCAADtBgAg_gIAAAUAIP8CAAAFACCAAwAA-gEAIAssAACcBgAwLQAAoQYAMPoCAACdBgAw-wIAAJ4GADD8AgAAnwYAIP0CAACgBgAw_gIAAKAGADD_AgAAoAYAMIADAACgBgAwgQMAAKIGADCCAwAAowYAMAssAACNBgAwLQAAkgYAMPoCAACOBgAw-wIAAI8GADD8AgAAkAYAIP0CAACRBgAw_gIAAJEGADD_AgAAkQYAMIADAACRBgAwgQMAAJMGADCCAwAAlAYAMAssAADIBQAwLQAAzQUAMPoCAADJBQAw-wIAAMoFADD8AgAAywUAIP0CAADMBQAw_gIAAMwFADD_AgAAzAUAMIADAADMBQAwgQMAAM4FADCCAwAAzwUAMAssAAC5BQAwLQAAvgUAMPoCAAC6BQAw-wIAALsFADD8AgAAvAUAIP0CAAC9BQAw_gIAAL0FADD_AgAAvQUAMIADAAC9BQAwgQMAAL8FADCCAwAAwAUAMAssAACpBQAwLQAArgUAMPoCAACqBQAw-wIAAKsFADD8AgAArAUAIP0CAACtBQAw_gIAAK0FADD_AgAArQUAMIADAACtBQAwgQMAAK8FADCCAwAAsAUAMAssAACaBQAwLQAAnwUAMPoCAACbBQAw-wIAAJwFADD8AgAAnQUAIP0CAACeBQAw_gIAAJ4FADD_AgAAngUAMIADAACeBQAwgQMAAKAFADCCAwAAoQUAMAssAACLBQAwLQAAkAUAMPoCAACMBQAw-wIAAI0FADD8AgAAjgUAIP0CAACPBQAw_gIAAI8FADD_AgAAjwUAMIADAACPBQAwgQMAAJEFADCCAwAAkgUAMAssAADrBAAwLQAA8AQAMPoCAADsBAAw-wIAAO0EADD8AgAA7gQAIP0CAADvBAAw_gIAAO8EADD_AgAA7wQAMIADAADvBAAwgQMAAPEEADCCAwAA8gQAMAssAADfBAAwLQAA5AQAMPoCAADgBAAw-wIAAOEEADD8AgAA4gQAIP0CAADjBAAw_gIAAOMEADD_AgAA4wQAMIADAADjBAAwgQMAAOUEADCCAwAA5gQAMAssAADUBAAwLQAA2AQAMPoCAADVBAAw-wIAANYEADD8AgAA1wQAIP0CAADJBAAw_gIAAMkEADD_AgAAyQQAMIADAADJBAAwgQMAANkEADCCAwAAzAQAMAssAADFBAAwLQAAygQAMPoCAADGBAAw-wIAAMcEADD8AgAAyAQAIP0CAADJBAAw_gIAAMkEADD_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_AgEAtgMAIcACQAC6AwAhAgAAACUAICUAAPkEACACAAAA8wQAICUAAPQEACAUiAIAAPIEADCJAgAA8wQAEIoCAADyBAAwiwIBALUDACGSAgAAlwS3AiKYAkAAuwMAIZkCQAC7AwAhsQIBALUDACGzAgAAlQSzAiK1AgAAlgS1AiK3AhAAmAQAIbgCAQC1AwAhuQIBALUDACG6AgEAtgMAIbsCAQC2AwAhvAIBALYDACG9AgEAtgMAIb4CAQC2AwAhvwIBALYDACHAAkAAugMAIRSIAgAA8gQAMIkCAADzBAAQigIAAPIEADCLAgEAtQMAIZICAACXBLcCIpgCQAC7AwAhmQJAALsDACGxAgEAtQMAIbMCAACVBLMCIrUCAACWBLUCIrcCEACYBAAhuAIBALUDACG5AgEAtQMAIboCAQC2AwAhuwIBALYDACG8AgEAtgMAIb0CAQC2AwAhvgIBALYDACG_AgEAtgMAIcACQAC6AwAhEIsCAQCyBAAhkgIAAPcEtwIimAJAALgEACGZAkAAuAQAIbMCAAD1BLMCIrUCAAD2BLUCIrcCEAD4BAAhuAIBALIEACG5AgEAsgQAIboCAQCzBAAhuwIBALMEACG8AgEAswQAIb0CAQCzBAAhvgIBALMEACG_AgEAswQAIcACQAC3BAAhAf0CAAAAswICAf0CAAAAtQICAf0CAAAAtwICBf0CEAAAAAGDAxAAAAABhAMQAAAAAYUDEAAAAAGGAxAAAAABEgsAAPoEACAQAAD7BAAgiwIBALIEACGSAgAA9wS3AiKYAkAAuAQAIZkCQAC4BAAhswIAAPUEswIitQIAAPYEtQIitwIQAPgEACG4AgEAsgQAIbkCAQCyBAAhugIBALMEACG7AgEAswQAIbwCAQCzBAAhvQIBALMEACG-AgEAswQAIb8CAQCzBAAhwAJAALcEACEHLAAAtggAIC0AALoIACD6AgAAtwgAIPsCAAC5CAAg_gIAABsAIP8CAAAbACCAAwAAOgAgCywAAPwEADAtAACBBQAw-gIAAP0EADD7AgAA_gQAMPwCAAD_BAAg_QIAAIAFADD-AgAAgAUAMP8CAACABQAwgAMAAIAFADCBAwAAggUAMIIDAACDBQAwBIsCAQAAAAGYAkAAAAABqQIBAAAAAaoCgAAAAAECAAAAKgAgLAAAhwUAIAMAAAAqACAsAACHBQAgLQAAhgUAIAElAAC4CAAwCQ8AAJMEACCIAgAAkgQAMIkCAAAoABCKAgAAkgQAMIsCAQAAAAGYAkAAuwMAIagCAQC1AwAhqQIBALUDACGqAgAAiQQAIAIAAAAqACAlAACGBQAgAgAAAIQFACAlAACFBQAgCIgCAACDBQAwiQIAAIQFABCKAgAAgwUAMIsCAQC1AwAhmAJAALsDACGoAgEAtQMAIakCAQC1AwAhqgIAAIkEACAIiAIAAIMFADCJAgAAhAUAEIoCAACDBQAwiwIBALUDACGYAkAAuwMAIagCAQC1AwAhqQIBALUDACGqAgAAiQQAIASLAgEAsgQAIZgCQAC4BAAhqQIBALIEACGqAoAAAAABBIsCAQCyBAAhmAJAALgEACGpAgEAsgQAIaoCgAAAAAEEiwIBAAAAAZgCQAAAAAGpAgEAAAABqgKAAAAAARILAACJBQAgEAAAigUAIIsCAQAAAAGSAgAAALcCApgCQAAAAAGZAkAAAAABswIAAACzAgK1AgAAALUCArcCEAAAAAG4AgEAAAABuQIBAAAAAboCAQAAAAG7AgEAAAABvAIBAAAAAb0CAQAAAAG-AgEAAAABvwIBAAAAAcACQAAAAAEDLAAAtggAIPoCAAC3CAAggAMAADoAIAQsAAD8BAAw-gIAAP0EADD8AgAA_wQAIIADAACABQAwCQsAAJkFACCLAgEAAAABmAJAAAAAAb4CAQAAAAHFAgAAAM8CAs8CAQAAAAHQAgEAAAAB0QIgAAAAAdICQAAAAAECAAAALwAgLAAAmAUAIAMAAAAvACAsAACYBQAgLQAAlgUAIAElAAC1CAAwDgEAAPADACALAACRBAAgiAIAAI8EADCJAgAALQAQigIAAI8EADCLAgEAAAABmAJAALsDACGxAgEAtQMAIb4CAQC2AwAhxQIAAJAEzwIizwIBALUDACHQAgEAtQMAIdECIAC5AwAh0gJAALoDACECAAAALwAgJQAAlgUAIAIAAACTBQAgJQAAlAUAIAyIAgAAkgUAMIkCAACTBQAQigIAAJIFADCLAgEAtQMAIZgCQAC7AwAhsQIBALUDACG-AgEAtgMAIcUCAACQBM8CIs8CAQC1AwAh0AIBALUDACHRAiAAuQMAIdICQAC6AwAhDIgCAACSBQAwiQIAAJMFABCKAgAAkgUAMIsCAQC1AwAhmAJAALsDACGxAgEAtQMAIb4CAQC2AwAhxQIAAJAEzwIizwIBALUDACHQAgEAtQMAIdECIAC5AwAh0gJAALoDACEIiwIBALIEACGYAkAAuAQAIb4CAQCzBAAhxQIAAJUFzwIizwIBALIEACHQAgEAsgQAIdECIAC2BAAh0gJAALcEACEB_QIAAADPAgIJCwAAlwUAIIsCAQCyBAAhmAJAALgEACG-AgEAswQAIcUCAACVBc8CIs8CAQCyBAAh0AIBALIEACHRAiAAtgQAIdICQAC3BAAhBywAALAIACAtAACzCAAg-gIAALEIACD7AgAAsggAIP4CAAAbACD_AgAAGwAggAMAADoAIAkLAACZBQAgiwIBAAAAAZgCQAAAAAG-AgEAAAABxQIAAADPAgLPAgEAAAAB0AIBAAAAAdECIAAAAAHSAkAAAAABAywAALAIACD6AgAAsQgAIIADAAA6ACAGCAAAqAUAIIsCAQAAAAGYAkAAAAABmQJAAAAAAdkCAQAAAAHbAgAAANsCAgIAAAAVACAsAACnBQAgAwAAABUAICwAAKcFACAtAAClBQAgASUAAK8IADAMAQAA8AMAIAgAAKMEACCIAgAAoQQAMIkCAAATABCKAgAAoQQAMIsCAQAAAAGYAkAAuwMAIZkCQAC7AwAhsQIBALUDACHZAgEAtQMAIdsCAACiBNsCIvYCAACgBAAgAgAAABUAICUAAKUFACACAAAAogUAICUAAKMFACAJiAIAAKEFADCJAgAAogUAEIoCAAChBQAwiwIBALUDACGYAkAAuwMAIZkCQAC7AwAhsQIBALUDACHZAgEAtQMAIdsCAACiBNsCIgmIAgAAoQUAMIkCAACiBQAQigIAAKEFADCLAgEAtQMAIZgCQAC7AwAhmQJAALsDACGxAgEAtQMAIdkCAQC1AwAh2wIAAKIE2wIiBYsCAQCyBAAhmAJAALgEACGZAkAAuAQAIdkCAQCyBAAh2wIAAKQF2wIiAf0CAAAA2wICBggAAKYFACCLAgEAsgQAIZgCQAC4BAAhmQJAALgEACHZAgEAsgQAIdsCAACkBdsCIgUsAACqCAAgLQAArQgAIPoCAACrCAAg-wIAAKwIACCAAwAAEQAgBggAAKgFACCLAgEAAAABmAJAAAAAAZkCQAAAAAHZAgEAAAAB2wIAAADbAgIDLAAAqggAIPoCAACrCAAggAMAABEAIAcIAAC4BQAgCwAAtwUAIIsCAQAAAAGYAkAAAAABvgIBAAAAAdkCAQAAAAHhAkAAAAABAgAAABkAICwAALYFACADAAAAGQAgLAAAtgUAIC0AALMFACABJQAAqQgAMAwIAACfBAAgCwAAkQQAIAwAAPADACCIAgAAngQAMIkCAAAXABCKAgAAngQAMIsCAQAAAAGYAkAAuwMAIb4CAQC2AwAh2QIBALYDACHgAgEAtQMAIeECQAC7AwAhAgAAABkAICUAALMFACACAAAAsQUAICUAALIFACAJiAIAALAFADCJAgAAsQUAEIoCAACwBQAwiwIBALUDACGYAkAAuwMAIb4CAQC2AwAh2QIBALYDACHgAgEAtQMAIeECQAC7AwAhCYgCAACwBQAwiQIAALEFABCKAgAAsAUAMIsCAQC1AwAhmAJAALsDACG-AgEAtgMAIdkCAQC2AwAh4AIBALUDACHhAkAAuwMAIQWLAgEAsgQAIZgCQAC4BAAhvgIBALMEACHZAgEAswQAIeECQAC4BAAhBwgAALUFACALAAC0BQAgiwIBALIEACGYAkAAuAQAIb4CAQCzBAAh2QIBALMEACHhAkAAuAQAIQcsAAChCAAgLQAApwgAIPoCAACiCAAg-wIAAKYIACD-AgAAGwAg_wIAABsAIIADAAA6ACAHLAAAnwgAIC0AAKQIACD6AgAAoAgAIPsCAACjCAAg_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-wcAIC0AAJYIACD6AgAA_AcAIPsCAACVCAAg_gIAAAcAIP8CAAAHACCAAwAACQAgCywAAPwFADAtAACABgAw-gIAAP0FADD7AgAA_gUAMPwCAAD_BQAg_QIAAL0FADD-AgAAvQUAMP8CAAC9BQAwgAMAAL0FADCBAwAAgQYAMIIDAADABQAwCywAAPEFADAtAAD1BQAw-gIAAPIFADD7AgAA8wUAMPwCAAD0BQAg_QIAAK0FADD-AgAArQUAMP8CAACtBQAwgAMAAK0FADCBAwAA9gUAMIIDAACwBQAwCywAAOYFADAtAADqBQAw-gIAAOcFADD7AgAA6AUAMPwCAADpBQAg_QIAAO8EADD-AgAA7wQAMP8CAADvBAAwgAMAAO8EADCBAwAA6wUAMIIDAADyBAAwCywAANsFADAtAADfBQAw-gIAANwFADD7AgAA3QUAMPwCAADeBQAg_QIAAI8FADD-AgAAjwUAMP8CAACPBQAwgAMAAI8FADCBAwAA4AUAMIIDAACSBQAwCQEAAOUFACCLAgEAAAABmAJAAAAAAbECAQAAAAHFAgAAAM8CAs8CAQAAAAHQAgEAAAAB0QIgAAAAAdICQAAAAAECAAAALwAgLAAA5AUAIAMAAAAvACAsAADkBQAgLQAA4gUAIAElAACUCAAwAgAAAC8AICUAAOIFACACAAAAkwUAICUAAOEFACAIiwIBALIEACGYAkAAuAQAIbECAQCyBAAhxQIAAJUFzwIizwIBALIEACHQAgEAsgQAIdECIAC2BAAh0gJAALcEACEJAQAA4wUAIIsCAQCyBAAhmAJAALgEACGxAgEAsgQAIcUCAACVBc8CIs8CAQCyBAAh0AIBALIEACHRAiAAtgQAIdICQAC3BAAhBSwAAI8IACAtAACSCAAg-gIAAJAIACD7AgAAkQgAIIADAACEAwAgCQEAAOUFACCLAgEAAAABmAJAAAAAAbECAQAAAAHFAgAAAM8CAs8CAQAAAAHQAgEAAAAB0QIgAAAAAdICQAAAAAEDLAAAjwgAIPoCAACQCAAggAMAAIQDACASAQAA8AUAIBAAAIoFACCLAgEAAAABkgIAAAC3AgKYAkAAAAABmQJAAAAAAbECAQAAAAGzAgAAALMCArUCAAAAtQICtwIQAAAAAbgCAQAAAAG5AgEAAAABugIBAAAAAbsCAQAAAAG8AgEAAAABvQIBAAAAAb8CAQAAAAHAAkAAAAABAgAAACUAICwAAO8FACADAAAAJQAgLAAA7wUAIC0AAO0FACABJQAAjggAMAIAAAAlACAlAADtBQAgAgAAAPMEACAlAADsBQAgEIsCAQCyBAAhkgIAAPcEtwIimAJAALgEACGZAkAAuAQAIbECAQCyBAAhswIAAPUEswIitQIAAPYEtQIitwIQAPgEACG4AgEAsgQAIbkCAQCyBAAhugIBALMEACG7AgEAswQAIbwCAQCzBAAhvQIBALMEACG_AgEAswQAIcACQAC3BAAhEgEAAO4FACAQAAD7BAAgiwIBALIEACGSAgAA9wS3AiKYAkAAuAQAIZkCQAC4BAAhsQIBALIEACGzAgAA9QSzAiK1AgAA9gS1AiK3AhAA-AQAIbgCAQCyBAAhuQIBALIEACG6AgEAswQAIbsCAQCzBAAhvAIBALMEACG9AgEAswQAIb8CAQCzBAAhwAJAALcEACEFLAAAiQgAIC0AAIwIACD6AgAAiggAIPsCAACLCAAggAMAAIQDACASAQAA8AUAIBAAAIoFACCLAgEAAAABkgIAAAC3AgKYAkAAAAABmQJAAAAAAbECAQAAAAGzAgAAALMCArUCAAAAtQICtwIQAAAAAbgCAQAAAAG5AgEAAAABugIBAAAAAbsCAQAAAAG8AgEAAAABvQIBAAAAAb8CAQAAAAHAAkAAAAABAywAAIkIACD6AgAAiggAIIADAACEAwAgBwgAALgFACAMAAD7BQAgiwIBAAAAAZgCQAAAAAHZAgEAAAAB4AIBAAAAAeECQAAAAAECAAAAGQAgLAAA-gUAIAMAAAAZACAsAAD6BQAgLQAA-AUAIAElAACICAAwAgAAABkAICUAAPgFACACAAAAsQUAICUAAPcFACAFiwIBALIEACGYAkAAuAQAIdkCAQCzBAAh4AIBALIEACHhAkAAuAQAIQcIAAC1BQAgDAAA-QUAIIsCAQCyBAAhmAJAALgEACHZAgEAswQAIeACAQCyBAAh4QJAALgEACEFLAAAgwgAIC0AAIYIACD6AgAAhAgAIPsCAACFCAAggAMAAIQDACAHCAAAuAUAIAwAAPsFACCLAgEAAAABmAJAAAAAAdkCAQAAAAHgAgEAAAAB4QJAAAAAAQMsAACDCAAg-gIAAIQIACCAAwAAhAMAIAcMAACGBgAgiwIBAAAAAZICAAAA4wICmAJAAAAAAZkCQAAAAAHQAgEAAAAB4AIBAAAAAQIAAAAgACAsAACFBgAgAwAAACAAICwAAIUGACAtAACDBgAgASUAAIIIADACAAAAIAAgJQAAgwYAIAIAAADBBQAgJQAAggYAIAaLAgEAsgQAIZICAADDBeMCIpgCQAC4BAAhmQJAALgEACHQAgEAswQAIeACAQCyBAAhBwwAAIQGACCLAgEAsgQAIZICAADDBeMCIpgCQAC4BAAhmQJAALgEACHQAgEAswQAIeACAQCyBAAhBSwAAP0HACAtAACACAAg-gIAAP4HACD7AgAA_wcAIIADAACEAwAgBwwAAIYGACCLAgEAAAABkgIAAADjAgKYAkAAAAABmQJAAAAAAdACAQAAAAHgAgEAAAABAywAAP0HACD6AgAA_gcAIIADAACEAwAgFgYAAIgGACANAACJBgAgDgAAigYAIBIAAIsGACATAACMBgAgiwIBAAAAAZICAAAA7AIClwJAAAAAAZgCQAAAAAGZAkAAAAABwQIBAAAAAccCAQAAAAHIAgEAAAAByQIBAAAAAdQCAAAA1AIC5AIBAAAAAeUCAgAAAAHmAgIAAAAB5wIBAAAAAegCAQAAAAHqAgAAAOoCAuwCQAAAAAEDLAAA-wcAIPoCAAD8BwAggAMAAAkAIAQsAAD8BQAw-gIAAP0FADD8AgAA_wUAIIADAAC9BQAwBCwAAPEFADD6AgAA8gUAMPwCAAD0BQAggAMAAK0FADAELAAA5gUAMPoCAADnBQAw_AIAAOkFACCAAwAA7wQAMAQsAADbBQAw-gIAANwFADD8AgAA3gUAIIADAACPBQAwBQYAAJsGACCLAgEAAAABmAJAAAAAAcECAQAAAAHDAgAAAMMCAgIAAAANACAsAACaBgAgAwAAAA0AICwAAJoGACAtAACYBgAgASUAAPoHADALAQAA8AMAIAYAAKYEACCIAgAAqAQAMIkCAAALABCKAgAAqAQAMIsCAQAAAAGYAkAAuwMAIbECAQC1AwAhwQIBALUDACHDAgAAqQTDAiL3AgAApwQAIAIAAAANACAlAACYBgAgAgAAAJUGACAlAACWBgAgCIgCAACUBgAwiQIAAJUGABCKAgAAlAYAMIsCAQC1AwAhmAJAALsDACGxAgEAtQMAIcECAQC1AwAhwwIAAKkEwwIiCIgCAACUBgAwiQIAAJUGABCKAgAAlAYAMIsCAQC1AwAhmAJAALsDACGxAgEAtQMAIcECAQC1AwAhwwIAAKkEwwIiBIsCAQCyBAAhmAJAALgEACHBAgEAsgQAIcMCAACXBsMCIgH9AgAAAMMCAgUGAACZBgAgiwIBALIEACGYAkAAuAQAIcECAQCyBAAhwwIAAJcGwwIiBSwAAPUHACAtAAD4BwAg-gIAAPYHACD7AgAA9wcAIIADAAAJACAFBgAAmwYAIIsCAQAAAAGYAkAAAAABwQIBAAAAAcMCAAAAwwICAywAAPUHACD6AgAA9gcAIIADAAAJACAPBwAA6AYAIBQAAOkGACAVAADqBgAgiwIBAAAAAYwCAQAAAAGNAgEAAAABmAJAAAAAAZkCQAAAAAHFAgAAAMUCAsYCAQAAAAHHAgEAAAAByAIBAAAAAckCAQAAAAHLAgAAAMsCAswCAQAAAAECAAAACQAgLAAA5wYAIAMAAAAJACAsAADnBgAgLQAAqAYAIAElAAD0BwAwFAUAAPADACAHAAC-AwAgFAAArQQAIBUAAL8DACCIAgAAqgQAMIkCAAAHABCKAgAAqgQAMIsCAQAAAAGMAgEAtQMAIY0CAQC2AwAhmAJAALsDACGZAkAAuwMAIcUCAACrBMUCIsYCAQC1AwAhxwIBALUDACHIAgEAtgMAIckCAQC2AwAhywIAAKwEywIizAIBALYDACHNAgEAtQMAIQIAAAAJACAlAACoBgAgAgAAAKQGACAlAAClBgAgEIgCAACjBgAwiQIAAKQGABCKAgAAowYAMIsCAQC1AwAhjAIBALUDACGNAgEAtgMAIZgCQAC7AwAhmQJAALsDACHFAgAAqwTFAiLGAgEAtQMAIccCAQC1AwAhyAIBALYDACHJAgEAtgMAIcsCAACsBMsCIswCAQC2AwAhzQIBALUDACEQiAIAAKMGADCJAgAApAYAEIoCAACjBgAwiwIBALUDACGMAgEAtQMAIY0CAQC2AwAhmAJAALsDACGZAkAAuwMAIcUCAACrBMUCIsYCAQC1AwAhxwIBALUDACHIAgEAtgMAIckCAQC2AwAhywIAAKwEywIizAIBALYDACHNAgEAtQMAIQyLAgEAsgQAIYwCAQCyBAAhjQIBALMEACGYAkAAuAQAIZkCQAC4BAAhxQIAAKYGxQIixgIBALIEACHHAgEAsgQAIcgCAQCzBAAhyQIBALMEACHLAgAApwbLAiLMAgEAswQAIQH9AgAAAMUCAgH9AgAAAMsCAg8HAACpBgAgFAAAqgYAIBUAAKsGACCLAgEAsgQAIYwCAQCyBAAhjQIBALMEACGYAkAAuAQAIZkCQAC4BAAhxQIAAKYGxQIixgIBALIEACHHAgEAsgQAIcgCAQCzBAAhyQIBALMEACHLAgAApwbLAiLMAgEAswQAIQssAADcBgAwLQAA4AYAMPoCAADdBgAw-wIAAN4GADD8AgAA3wYAIP0CAACRBgAw_gIAAJEGADD_AgAAkQYAMIADAACRBgAwgQMAAOEGADCCAwAAlAYAMAssAAC3BgAwLQAAvAYAMPoCAAC4BgAw-wIAALkGADD8AgAAugYAIP0CAAC7BgAw_gIAALsGADD_AgAAuwYAMIADAAC7BgAwgQMAAL0GADCCAwAAvgYAMAssAACsBgAwLQAAsAYAMPoCAACtBgAw-wIAAK4GADD8AgAArwYAIP0CAADMBQAw_gIAAMwFADD_AgAAzAUAMIADAADMBQAwgQMAALEGADCCAwAAzwUAMBYKAAC2BgAgDQAAiQYAIA4AAIoGACASAACLBgAgEwAAjAYAIIsCAQAAAAGSAgAAAOwCApcCQAAAAAGYAkAAAAABmQJAAAAAAccCAQAAAAHIAgEAAAAByQIBAAAAAdQCAAAA1AIC4wIBAAAAAeQCAQAAAAHlAgIAAAAB5gICAAAAAecCAQAAAAHoAgEAAAAB6gIAAADqAgLsAkAAAAABAgAAADoAICwAALUGACADAAAAOgAgLAAAtQYAIC0AALMGACABJQAA8wcAMAIAAAA6ACAlAACzBgAgAgAAANAFACAlAACyBgAgEYsCAQCyBAAhkgIAANQF7AIilwJAALcEACGYAkAAuAQAIZkCQAC4BAAhxwIBALIEACHIAgEAswQAIckCAQCyBAAh1AIAANIF1AIi4wIBALIEACHkAgEAswQAIeUCAgDPBAAh5gICAM8EACHnAgEAsgQAIegCAQCzBAAh6gIAANMF6gIi7AJAALgEACEWCgAAtAYAIA0AANcFACAOAADYBQAgEgAA2QUAIBMAANoFACCLAgEAsgQAIZICAADUBewCIpcCQAC3BAAhmAJAALgEACGZAkAAuAQAIccCAQCyBAAhyAIBALMEACHJAgEAsgQAIdQCAADSBdQCIuMCAQCyBAAh5AIBALMEACHlAgIAzwQAIeYCAgDPBAAh5wIBALIEACHoAgEAswQAIeoCAADTBeoCIuwCQAC4BAAhBSwAAO4HACAtAADxBwAg-gIAAO8HACD7AgAA8AcAIIADAACEAwAgFgoAALYGACANAACJBgAgDgAAigYAIBIAAIsGACATAACMBgAgiwIBAAAAAZICAAAA7AIClwJAAAAAAZgCQAAAAAGZAkAAAAABxwIBAAAAAcgCAQAAAAHJAgEAAAAB1AIAAADUAgLjAgEAAAAB5AIBAAAAAeUCAgAAAAHmAgIAAAAB5wIBAAAAAegCAQAAAAHqAgAAAOoCAuwCQAAAAAEDLAAA7gcAIPoCAADvBwAggAMAAIQDACALCQAA2gYAIA4AANsGACCLAgEAAAABkgIAAADgAgKYAkAAAAABmQJAAAAAAccCAQAAAAHPAgEAAAAB3AIBAAAAAd0CAQAAAAHeAkAAAAABAgAAABEAICwAANkGACADAAAAEQAgLAAA2QYAIC0AAMIGACABJQAA7QcAMBAGAACmBAAgCQAAwgMAIA4AAMEDACCIAgAApAQAMIkCAAAPABCKAgAApAQAMIsCAQAAAAGSAgAApQTgAiKYAkAAuwMAIZkCQAC7AwAhwQIBALUDACHHAgEAtQMAIc8CAQC1AwAh3AIBALYDACHdAgEAtQMAId4CQAC7AwAhAgAAABEAICUAAMIGACACAAAAvwYAICUAAMAGACANiAIAAL4GADCJAgAAvwYAEIoCAAC-BgAwiwIBALUDACGSAgAApQTgAiKYAkAAuwMAIZkCQAC7AwAhwQIBALUDACHHAgEAtQMAIc8CAQC1AwAh3AIBALYDACHdAgEAtQMAId4CQAC7AwAhDYgCAAC-BgAwiQIAAL8GABCKAgAAvgYAMIsCAQC1AwAhkgIAAKUE4AIimAJAALsDACGZAkAAuwMAIcECAQC1AwAhxwIBALUDACHPAgEAtQMAIdwCAQC2AwAh3QIBALUDACHeAkAAuwMAIQmLAgEAsgQAIZICAADBBuACIpgCQAC4BAAhmQJAALgEACHHAgEAsgQAIc8CAQCyBAAh3AIBALMEACHdAgEAsgQAId4CQAC4BAAhAf0CAAAA4AICCwkAAMMGACAOAADEBgAgiwIBALIEACGSAgAAwQbgAiKYAkAAuAQAIZkCQAC4BAAhxwIBALIEACHPAgEAsgQAIdwCAQCzBAAh3QIBALIEACHeAkAAuAQAIQssAADOBgAwLQAA0gYAMPoCAADPBgAw-wIAANAGADD8AgAA0QYAIP0CAACeBQAw_gIAAJ4FADD_AgAAngUAMIADAACeBQAwgQMAANMGADCCAwAAoQUAMAssAADFBgAwLQAAyQYAMPoCAADGBgAw-wIAAMcGADD8AgAAyAYAIP0CAACtBQAw_gIAAK0FADD_AgAArQUAMIADAACtBQAwgQMAAMoGADCCAwAAsAUAMAcLAAC3BQAgDAAA-wUAIIsCAQAAAAGYAkAAAAABvgIBAAAAAeACAQAAAAHhAkAAAAABAgAAABkAICwAAM0GACADAAAAGQAgLAAAzQYAIC0AAMwGACABJQAA7AcAMAIAAAAZACAlAADMBgAgAgAAALEFACAlAADLBgAgBYsCAQCyBAAhmAJAALgEACG-AgEAswQAIeACAQCyBAAh4QJAALgEACEHCwAAtAUAIAwAAPkFACCLAgEAsgQAIZgCQAC4BAAhvgIBALMEACHgAgEAsgQAIeECQAC4BAAhBwsAALcFACAMAAD7BQAgiwIBAAAAAZgCQAAAAAG-AgEAAAAB4AIBAAAAAeECQAAAAAEGAQAA2AYAIIsCAQAAAAGYAkAAAAABmQJAAAAAAbECAQAAAAHbAgAAANsCAgIAAAAVACAsAADXBgAgAwAAABUAICwAANcGACAtAADVBgAgASUAAOsHADACAAAAFQAgJQAA1QYAIAIAAACiBQAgJQAA1AYAIAWLAgEAsgQAIZgCQAC4BAAhmQJAALgEACGxAgEAsgQAIdsCAACkBdsCIgYBAADWBgAgiwIBALIEACGYAkAAuAQAIZkCQAC4BAAhsQIBALIEACHbAgAApAXbAiIFLAAA5gcAIC0AAOkHACD6AgAA5wcAIPsCAADoBwAggAMAAIQDACAGAQAA2AYAIIsCAQAAAAGYAkAAAAABmQJAAAAAAbECAQAAAAHbAgAAANsCAgMsAADmBwAg-gIAAOcHACCAAwAAhAMAIAsJAADaBgAgDgAA2wYAIIsCAQAAAAGSAgAAAOACApgCQAAAAAGZAkAAAAABxwIBAAAAAc8CAQAAAAHcAgEAAAAB3QIBAAAAAd4CQAAAAAEELAAAzgYAMPoCAADPBgAw_AIAANEGACCAAwAAngUAMAQsAADFBgAw-gIAAMYGADD8AgAAyAYAIIADAACtBQAwBQEAAOYGACCLAgEAAAABmAJAAAAAAbECAQAAAAHDAgAAAMMCAgIAAAANACAsAADlBgAgAwAAAA0AICwAAOUGACAtAADjBgAgASUAAOUHADACAAAADQAgJQAA4wYAIAIAAACVBgAgJQAA4gYAIASLAgEAsgQAIZgCQAC4BAAhsQIBALIEACHDAgAAlwbDAiIFAQAA5AYAIIsCAQCyBAAhmAJAALgEACGxAgEAsgQAIcMCAACXBsMCIgUsAADgBwAgLQAA4wcAIPoCAADhBwAg-wIAAOIHACCAAwAAhAMAIAUBAADmBgAgiwIBAAAAAZgCQAAAAAGxAgEAAAABwwIAAADDAgIDLAAA4AcAIPoCAADhBwAggAMAAIQDACAPBwAA6AYAIBQAAOkGACAVAADqBgAgiwIBAAAAAYwCAQAAAAGNAgEAAAABmAJAAAAAAZkCQAAAAAHFAgAAAMUCAsYCAQAAAAHHAgEAAAAByAIBAAAAAckCAQAAAAHLAgAAAMsCAswCAQAAAAEELAAA3AYAMPoCAADdBgAw_AIAAN8GACCAAwAAkQYAMAQsAAC3BgAw-gIAALgGADD8AgAAugYAIIADAAC7BgAwBCwAAKwGADD6AgAArQYAMPwCAACvBgAggAMAAMwFADAKiwIBAAAAAZgCQAAAAAGZAkAAAAABxwIBAAAAAcgCAQAAAAHUAgAAANQCAtUCIAAAAAHWAkAAAAAB1wIBAAAAAdgCAgAAAAECAAAA-gEAICwAAOsGACADAAAABQAgLAAA6wYAIC0AAO8GACAMAAAABQAgJQAA7wYAIIsCAQCyBAAhmAJAALgEACGZAkAAuAQAIccCAQCyBAAhyAIBALMEACHUAgAA0gXUAiLVAiAAtgQAIdYCQAC3BAAh1wIBALMEACHYAgIAzwQAIQqLAgEAsgQAIZgCQAC4BAAhmQJAALgEACHHAgEAsgQAIcgCAQCzBAAh1AIAANIF1AIi1QIgALYEACHWAkAAtwQAIdcCAQCzBAAh2AICAM8EACEDLAAA6wYAIPoCAADsBgAggAMAAPoBACAELAAAnAYAMPoCAACdBgAw_AIAAJ8GACCAAwAAoAYAMAQsAACNBgAw-gIAAI4GADD8AgAAkAYAIIADAACRBgAwBCwAAMgFADD6AgAAyQUAMPwCAADLBQAggAMAAMwFADAELAAAuQUAMPoCAAC6BQAw_AIAALwFACCAAwAAvQUAMAQsAACpBQAw-gIAAKoFADD8AgAArAUAIIADAACtBQAwBCwAAJoFADD6AgAAmwUAMPwCAACdBQAggAMAAJ4FADAELAAAiwUAMPoCAACMBQAw_AIAAI4FACCAAwAAjwUAMAQsAADrBAAw-gIAAOwEADD8AgAA7gQAIIADAADvBAAwBCwAAN8EADD6AgAA4AQAMPwCAADiBAAggAMAAOMEADAELAAA1AQAMPoCAADVBAAw_AIAANcEACCAAwAAyQQAMAQsAADFBAAw-gIAAMYEADD8AgAAyAQAIIADAADJBAAwBAEAAKMHACDIAgAArgQAINYCAACuBAAg1wIAAK4EACAAAAAAAAAAAAAAAAAABSwAANsHACAtAADeBwAg-gIAANwHACD7AgAA3QcAIIADAAAlACADLAAA2wcAIPoCAADcBwAggAMAACUAIAAAAAAAAAAAAAAABSwAANYHACAtAADZBwAg-gIAANcHACD7AgAA2AcAIIADAACEAwAgAywAANYHACD6AgAA1wcAIIADAACEAwAgAAAAAAAAAAAFLAAA0QcAIC0AANQHACD6AgAA0gcAIPsCAADTBwAggAMAAIQDACADLAAA0QcAIPoCAADSBwAggAMAAIQDACARAgAA_AYAIA4AAIEHACASAACEBwAgEwAAgwcAIBYAAP0GACAXAAD-BgAgGAAA_wYAIBkAAIAHACAaAACCBwAgGwAAhQcAIB0AAIYHACAeAACGBwAgjgIAAK4EACCTAgAArgQAIJUCAACuBAAglgIAAK4EACCXAgAArgQAIAAAAAAAAAUsAADMBwAgLQAAzwcAIPoCAADNBwAg-wIAAM4HACCAAwAACQAgAywAAMwHACD6AgAAzQcAIIADAAAJACAAAAAAAAAAAAAAAAAAAAAAAAAABywAAMcHACAtAADKBwAg-gIAAMgHACD7AgAAyQcAIP4CAAADACD_AgAAAwAggAMAAIQDACADLAAAxwcAIPoCAADIBwAggAMAAIQDACAIBQAAowcAIAcAAP4GACAUAADGBwAgFQAA_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_BAAgGwAAwgQAIB0AAMMEACAeAADEBAAgJQAA1QcAIIsCAQCyBAAhjAIBALIEACGNAgEAsgQAIY4CAQCzBAAhkAIAALQEkAIikgIAALUEkgIikwIBALMEACGUAiAAtgQAIZUCAQCzBAAhlgIBALMEACGXAkAAtwQAIZgCQAC4BAAhmQJAALgEACEYDgAAvgQAIBIAAMEEACATAADABAAgFgAAugQAIBcAALsEACAYAAC8BAAgGQAAvQQAIBoAAL8EACAbAADCBAAgHQAAwwQAIB4AAMQEACCLAgEAsgQAIYwCAQCyBAAhjQIBALIEACGOAgEAswQAIZACAAC0BJACIpICAAC1BJICIpMCAQCzBAAhlAIgALYEACGVAgEAswQAIZYCAQCzBAAhlwJAALcEACGYAkAAuAQAIZkCQAC4BAAhGAIAAPAGACAOAAD1BgAgEgAA-AYAIBMAAPcGACAXAADyBgAgGAAA8wYAIBkAAPQGACAaAAD2BgAgGwAA-QYAIB0AAPoGACAeAAD7BgAgiwIBAAAAAYwCAQAAAAGNAgEAAAABjgIBAAAAAZACAAAAkAICkgIAAACSAgKTAgEAAAABlAIgAAAAAZUCAQAAAAGWAgEAAAABlwJAAAAAAZgCQAAAAAGZAkAAAAABAgAAAIQDACAsAADWBwAgAwAAAAMAICwAANYHACAtAADaBwAgGgAAAAMAIAIAALkEACAOAAC-BAAgEgAAwQQAIBMAAMAEACAXAAC7BAAgGAAAvAQAIBkAAL0EACAaAAC_BAAgGwAAwgQAIB0AAMMEACAeAADEBAAgJQAA2gcAIIsCAQCyBAAhjAIBALIEACGNAgEAsgQAIY4CAQCzBAAhkAIAALQEkAIikgIAALUEkgIikwIBALMEACGUAiAAtgQAIZUCAQCzBAAhlgIBALMEACGXAkAAtwQAIZgCQAC4BAAhmQJAALgEACEYAgAAuQQAIA4AAL4EACASAADBBAAgEwAAwAQAIBcAALsEACAYAAC8BAAgGQAAvQQAIBoAAL8EACAbAADCBAAgHQAAwwQAIB4AAMQEACCLAgEAsgQAIYwCAQCyBAAhjQIBALIEACGOAgEAswQAIZACAAC0BJACIpICAAC1BJICIpMCAQCzBAAhlAIgALYEACGVAgEAswQAIZYCAQCzBAAhlwJAALcEACGYAkAAuAQAIZkCQAC4BAAhEwEAAPAFACALAACJBQAgiwIBAAAAAZICAAAAtwICmAJAAAAAAZkCQAAAAAGxAgEAAAABswIAAACzAgK1AgAAALUCArcCEAAAAAG4AgEAAAABuQIBAAAAAboCAQAAAAG7AgEAAAABvAIBAAAAAb0CAQAAAAG-AgEAAAABvwIBAAAAAcACQAAAAAECAAAAJQAgLAAA2wcAIAMAAAAjACAsAADbBwAgLQAA3wcAIBUAAAAjACABAADuBQAgCwAA-gQAICUAAN8HACCLAgEAsgQAIZICAAD3BLcCIpgCQAC4BAAhmQJAALgEACGxAgEAsgQAIbMCAAD1BLMCIrUCAAD2BLUCIrcCEAD4BAAhuAIBALIEACG5AgEAsgQAIboCAQCzBAAhuwIBALMEACG8AgEAswQAIb0CAQCzBAAhvgIBALMEACG_AgEAswQAIcACQAC3BAAhEwEAAO4FACALAAD6BAAgiwIBALIEACGSAgAA9wS3AiKYAkAAuAQAIZkCQAC4BAAhsQIBALIEACGzAgAA9QSzAiK1AgAA9gS1AiK3AhAA-AQAIbgCAQCyBAAhuQIBALIEACG6AgEAswQAIbsCAQCzBAAhvAIBALMEACG9AgEAswQAIb4CAQCzBAAhvwIBALMEACHAAkAAtwQAIRgCAADwBgAgDgAA9QYAIBIAAPgGACATAAD3BgAgFgAA8QYAIBgAAPMGACAZAAD0BgAgGgAA9gYAIBsAAPkGACAdAAD6BgAgHgAA-wYAIIsCAQAAAAGMAgEAAAABjQIBAAAAAY4CAQAAAAGQAgAAAJACApICAAAAkgICkwIBAAAAAZQCIAAAAAGVAgEAAAABlgIBAAAAAZcCQAAAAAGYAkAAAAABmQJAAAAAAQIAAACEAwAgLAAA4AcAIAMAAAADACAsAADgBwAgLQAA5AcAIBoAAAADACACAAC5BAAgDgAAvgQAIBIAAMEEACATAADABAAgFgAAugQAIBgAALwEACAZAAC9BAAgGgAAvwQAIBsAAMIEACAdAADDBAAgHgAAxAQAICUAAOQHACCLAgEAsgQAIYwCAQCyBAAhjQIBALIEACGOAgEAswQAIZACAAC0BJACIpICAAC1BJICIpMCAQCzBAAhlAIgALYEACGVAgEAswQAIZYCAQCzBAAhlwJAALcEACGYAkAAuAQAIZkCQAC4BAAhGAIAALkEACAOAAC-BAAgEgAAwQQAIBMAAMAEACAWAAC6BAAgGAAAvAQAIBkAAL0EACAaAAC_BAAgGwAAwgQAIB0AAMMEACAeAADEBAAgiwIBALIEACGMAgEAsgQAIY0CAQCyBAAhjgIBALMEACGQAgAAtASQAiKSAgAAtQSSAiKTAgEAswQAIZQCIAC2BAAhlQIBALMEACGWAgEAswQAIZcCQAC3BAAhmAJAALgEACGZAkAAuAQAIQSLAgEAAAABmAJAAAAAAbECAQAAAAHDAgAAAMMCAhgCAADwBgAgDgAA9QYAIBIAAPgGACATAAD3BgAgFgAA8QYAIBcAAPIGACAYAADzBgAgGQAA9AYAIBsAAPkGACAdAAD6BgAgHgAA-wYAIIsCAQAAAAGMAgEAAAABjQIBAAAAAY4CAQAAAAGQAgAAAJACApICAAAAkgICkwIBAAAAAZQCIAAAAAGVAgEAAAABlgIBAAAAAZcCQAAAAAGYAkAAAAABmQJAAAAAAQIAAACEAwAgLAAA5gcAIAMAAAADACAsAADmBwAgLQAA6gcAIBoAAAADACACAAC5BAAgDgAAvgQAIBIAAMEEACATAADABAAgFgAAugQAIBcAALsEACAYAAC8BAAgGQAAvQQAIBsAAMIEACAdAADDBAAgHgAAxAQAICUAAOoHACCLAgEAsgQAIYwCAQCyBAAhjQIBALIEACGOAgEAswQAIZACAAC0BJACIpICAAC1BJICIpMCAQCzBAAhlAIgALYEACGVAgEAswQAIZYCAQCzBAAhlwJAALcEACGYAkAAuAQAIZkCQAC4BAAhGAIAALkEACAOAAC-BAAgEgAAwQQAIBMAAMAEACAWAAC6BAAgFwAAuwQAIBgAALwEACAZAAC9BAAgGwAAwgQAIB0AAMMEACAeAADEBAAgiwIBALIEACGMAgEAsgQAIY0CAQCyBAAhjgIBALMEACGQAgAAtASQAiKSAgAAtQSSAiKTAgEAswQAIZQCIAC2BAAhlQIBALMEACGWAgEAswQAIZcCQAC3BAAhmAJAALgEACGZAkAAuAQAIQWLAgEAAAABmAJAAAAAAZkCQAAAAAGxAgEAAAAB2wIAAADbAgIFiwIBAAAAAZgCQAAAAAG-AgEAAAAB4AIBAAAAAeECQAAAAAEJiwIBAAAAAZICAAAA4AICmAJAAAAAAZkCQAAAAAHHAgEAAAABzwIBAAAAAdwCAQAAAAHdAgEAAAAB3gJAAAAAARgCAADwBgAgDgAA9QYAIBIAAPgGACATAAD3BgAgFgAA8QYAIBcAAPIGACAZAAD0BgAgGgAA9gYAIBsAAPkGACAdAAD6BgAgHgAA-wYAIIsCAQAAAAGMAgEAAAABjQIBAAAAAY4CAQAAAAGQAgAAAJACApICAAAAkgICkwIBAAAAAZQCIAAAAAGVAgEAAAABlgIBAAAAAZcCQAAAAAGYAkAAAAABmQJAAAAAAQIAAACEAwAgLAAA7gcAIAMAAAADACAsAADuBwAgLQAA8gcAIBoAAAADACACAAC5BAAgDgAAvgQAIBIAAMEEACATAADABAAgFgAAugQAIBcAALsEACAZAAC9BAAgGgAAvwQAIBsAAMIEACAdAADDBAAgHgAAxAQAICUAAPIHACCLAgEAsgQAIYwCAQCyBAAhjQIBALIEACGOAgEAswQAIZACAAC0BJACIpICAAC1BJICIpMCAQCzBAAhlAIgALYEACGVAgEAswQAIZYCAQCzBAAhlwJAALcEACGYAkAAuAQAIZkCQAC4BAAhGAIAALkEACAOAAC-BAAgEgAAwQQAIBMAAMAEACAWAAC6BAAgFwAAuwQAIBkAAL0EACAaAAC_BAAgGwAAwgQAIB0AAMMEACAeAADEBAAgiwIBALIEACGMAgEAsgQAIY0CAQCyBAAhjgIBALMEACGQAgAAtASQAiKSAgAAtQSSAiKTAgEAswQAIZQCIAC2BAAhlQIBALMEACGWAgEAswQAIZcCQAC3BAAhmAJAALgEACGZAkAAuAQAIRGLAgEAAAABkgIAAADsAgKXAkAAAAABmAJAAAAAAZkCQAAAAAHHAgEAAAAByAIBAAAAAckCAQAAAAHUAgAAANQCAuMCAQAAAAHkAgEAAAAB5QICAAAAAeYCAgAAAAHnAgEAAAAB6AIBAAAAAeoCAAAA6gIC7AJAAAAAAQyLAgEAAAABjAIBAAAAAY0CAQAAAAGYAkAAAAABmQJAAAAAAcUCAAAAxQICxgIBAAAAAccCAQAAAAHIAgEAAAAByQIBAAAAAcsCAAAAywICzAIBAAAAARAFAACYBwAgFAAA6QYAIBUAAOoGACCLAgEAAAABjAIBAAAAAY0CAQAAAAGYAkAAAAABmQJAAAAAAcUCAAAAxQICxgIBAAAAAccCAQAAAAHIAgEAAAAByQIBAAAAAcsCAAAAywICzAIBAAAAAc0CAQAAAAECAAAACQAgLAAA9QcAIAMAAAAHACAsAAD1BwAgLQAA-QcAIBIAAAAHACAFAACXBwAgFAAAqgYAIBUAAKsGACAlAAD5BwAgiwIBALIEACGMAgEAsgQAIY0CAQCzBAAhmAJAALgEACGZAkAAuAQAIcUCAACmBsUCIsYCAQCyBAAhxwIBALIEACHIAgEAswQAIckCAQCzBAAhywIAAKcGywIizAIBALMEACHNAgEAsgQAIRAFAACXBwAgFAAAqgYAIBUAAKsGACCLAgEAsgQAIYwCAQCyBAAhjQIBALMEACGYAkAAuAQAIZkCQAC4BAAhxQIAAKYGxQIixgIBALIEACHHAgEAsgQAIcgCAQCzBAAhyQIBALMEACHLAgAApwbLAiLMAgEAswQAIc0CAQCyBAAhBIsCAQAAAAGYAkAAAAABwQIBAAAAAcMCAAAAwwICEAUAAJgHACAHAADoBgAgFAAA6QYAIIsCAQAAAAGMAgEAAAABjQIBAAAAAZgCQAAAAAGZAkAAAAABxQIAAADFAgLGAgEAAAABxwIBAAAAAcgCAQAAAAHJAgEAAAABywIAAADLAgLMAgEAAAABzQIBAAAAAQIAAAAJACAsAAD7BwAgGAIAAPAGACAOAAD1BgAgEgAA-AYAIBMAAPcGACAWAADxBgAgFwAA8gYAIBgAAPMGACAaAAD2BgAgGwAA-QYAIB0AAPoGACAeAAD7BgAgiwIBAAAAAYwCAQAAAAGNAgEAAAABjgIBAAAAAZACAAAAkAICkgIAAACSAgKTAgEAAAABlAIgAAAAAZUCAQAAAAGWAgEAAAABlwJAAAAAAZgCQAAAAAGZAkAAAAABAgAAAIQDACAsAAD9BwAgAwAAAAMAICwAAP0HACAtAACBCAAgGgAAAAMAIAIAALkEACAOAAC-BAAgEgAAwQQAIBMAAMAEACAWAAC6BAAgFwAAuwQAIBgAALwEACAaAAC_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_AgEAAAABwAJAAAAAARgCAADwBgAgDgAA9QYAIBIAAPgGACAWAADxBgAgFwAA8gYAIBgAAPMGACAZAAD0BgAgGgAA9gYAIBsAAPkGACAdAAD6BgAgHgAA-wYAIIsCAQAAAAGMAgEAAAABjQIBAAAAAY4CAQAAAAGQAgAAAJACApICAAAAkgICkwIBAAAAAZQCIAAAAAGVAgEAAAABlgIBAAAAAZcCQAAAAAGYAkAAAAABmQJAAAAAAQIAAACEAwAgLAAAjwgAIAMAAAADACAsAACPCAAgLQAAkwgAIBoAAAADACACAAC5BAAgDgAAvgQAIBIAAMEEACAWAAC6BAAgFwAAuwQAIBgAALwEACAZAAC9BAAgGgAAvwQAIBsAAMIEACAdAADDBAAgHgAAxAQAICUAAJMIACCLAgEAsgQAIYwCAQCyBAAhjQIBALIEACGOAgEAswQAIZACAAC0BJACIpICAAC1BJICIpMCAQCzBAAhlAIgALYEACGVAgEAswQAIZYCAQCzBAAhlwJAALcEACGYAkAAuAQAIZkCQAC4BAAhGAIAALkEACAOAAC-BAAgEgAAwQQAIBYAALoEACAXAAC7BAAgGAAAvAQAIBkAAL0EACAaAAC_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_AgEAAAABwAJAAAAAAQaLAgEAAAABmAJAAAAAAfECAQAAAAHyAgEAAAAB8wIBAAAAAfQCgAAAAAEYAgAA8AYAIA4AAPUGACASAAD4BgAgEwAA9wYAIBYAAPEGACAXAADyBgAgGAAA8wYAIBkAAPQGACAaAAD2BgAgGwAA-QYAIB0AAPoGACCLAgEAAAABjAIBAAAAAY0CAQAAAAGOAgEAAAABkAIAAACQAgKSAgAAAJICApMCAQAAAAGUAiAAAAABlQIBAAAAAZYCAQAAAAGXAkAAAAABmAJAAAAAAZkCQAAAAAECAAAAhAMAICwAAL4IACADAAAAAwAgLAAAvggAIC0AAMIIACAaAAAAAwAgAgAAuQQAIA4AAL4EACASAADBBAAgEwAAwAQAIBYAALoEACAXAAC7BAAgGAAAvAQAIBkAAL0EACAaAAC_BAAgGwAAwgQAIB0AAMMEACAlAADCCAAgiwIBALIEACGMAgEAsgQAIY0CAQCyBAAhjgIBALMEACGQAgAAtASQAiKSAgAAtQSSAiKTAgEAswQAIZQCIAC2BAAhlQIBALMEACGWAgEAswQAIZcCQAC3BAAhmAJAALgEACGZAkAAuAQAIRgCAAC5BAAgDgAAvgQAIBIAAMEEACATAADABAAgFgAAugQAIBcAALsEACAYAAC8BAAgGQAAvQQAIBoAAL8EACAbAADCBAAgHQAAwwQAIIsCAQCyBAAhjAIBALIEACGNAgEAsgQAIY4CAQCzBAAhkAIAALQEkAIikgIAALUEkgIikwIBALMEACGUAiAAtgQAIZUCAQCzBAAhlgIBALMEACGXAkAAtwQAIZgCQAC4BAAhmQJAALgEACEFiwIBAAAAAZgCQAAAAAHgAgEAAAAB7gICAAAAAe8CAQAAAAEYAgAA8AYAIA4AAPUGACASAAD4BgAgEwAA9wYAIBYAAPEGACAXAADyBgAgGAAA8wYAIBkAAPQGACAaAAD2BgAgGwAA-QYAIB4AAPsGACCLAgEAAAABjAIBAAAAAY0CAQAAAAGOAgEAAAABkAIAAACQAgKSAgAAAJICApMCAQAAAAGUAiAAAAABlQIBAAAAAZYCAQAAAAGXAkAAAAABmAJAAAAAAZkCQAAAAAECAAAAhAMAICwAAMQIACADAAAAAwAgLAAAxAgAIC0AAMgIACAaAAAAAwAgAgAAuQQAIA4AAL4EACASAADBBAAgEwAAwAQAIBYAALoEACAXAAC7BAAgGAAAvAQAIBkAAL0EACAaAAC_BAAgGwAAwgQAIB4AAMQEACAlAADICAAgiwIBALIEACGMAgEAsgQAIY0CAQCyBAAhjgIBALMEACGQAgAAtASQAiKSAgAAtQSSAiKTAgEAswQAIZQCIAC2BAAhlQIBALMEACGWAgEAswQAIZcCQAC3BAAhmAJAALgEACGZAkAAuAQAIRgCAAC5BAAgDgAAvgQAIBIAAMEEACATAADABAAgFgAAugQAIBcAALsEACAYAAC8BAAgGQAAvQQAIBoAAL8EACAbAADCBAAgHgAAxAQAIIsCAQCyBAAhjAIBALIEACGNAgEAsgQAIY4CAQCzBAAhkAIAALQEkAIikgIAALUEkgIikwIBALMEACGUAiAAtgQAIZUCAQCzBAAhlgIBALMEACGXAkAAtwQAIZgCQAC4BAAhmQJAALgEACEFiwIBAAAAAZgCQAAAAAHtAgEAAAAB7gICAAAAAe8CAQAAAAEBHwQCDQIGAw5CCBEAExJFCxNEDhYKBBc_BRhACRlBChpDBxtIAR1MEh5NEgEBAAIFBQACBw4FEQARFBIGFTsJAgEAAgYABAQGAAQJFgcOGggRABACAQACCAAGAwg2BgscCQwAAgcGHQQKAAINIQoOIggRAA8SJgsTMA4CCwAJDAACBAEAAgsnCRArDBEADQEPAAsBECwAAgEAAgsxCQQNMgAOMwASNAATNQACCTcADjgAAwc8ABQ9ABU-AAIMAAIcAAILDlIAElUAE1QAFk4AF08AGFAAGVEAGlMAG1YAHVcAHlgAAAEfYgIBH2gCAxEAGDIAGTMAGgAAAAMRABgyABkzABoCDAACHAACAgwAAhwAAgURAB8yACIzACNEACBFACEAAAAAAAURAB8yACIzACNEACBFACECBpABBAoAAgIGlgEECgACBREAKDIAKzMALEQAKUUAKgAAAAAABREAKDIAKzMALEQAKUUAKgILAAkMAAICCwAJDAACAxEAMTIAMjMAMwAAAAMRADEyADIzADMDCL8BBgu-AQkMAAIDCMYBBgvFAQkMAAIDEQA4MgA5MwA6AAAAAxEAODIAOTMAOgEGAAQBBgAEAxEAPzIAQDMAQQAAAAMRAD8yAEAzAEECAQACCAAGAgEAAggABgMRAEYyAEczAEgAAAADEQBGMgBHMwBIAQEAAgEBAAIFEQBNMgBQMwBRRABORQBPAAAAAAAFEQBNMgBQMwBRRABORQBPAgEAAgucAgkCAQACC6ICCQMRAFYyAFczAFgAAAADEQBWMgBXMwBYAQUAAgEFAAIDEQBdMgBeMwBfAAAAAxEAXTIAXjMAXwIBAAIGAAQCAQACBgAEAxEAZDIAZTMAZgAAAAMRAGQyAGUzAGYCAQACC-ACCQIBAAIL5gIJBREAazIAbjMAb0QAbEUAbQAAAAAABREAazIAbjMAb0QAbEUAbQEPAAsBDwALAxEAdDIAdTMAdgAAAAMRAHQyAHUzAHYAAAMRAHsyAHwzAH0AAAADEQB7MgB8MwB9IAIBIVkBIloBI1sBJFwBJl4BJ2AUKGEVKWQBKmYUK2cWLmkBL2oBMGsUNG4XNW8bNnASN3ESOHISOXMSOnQSO3YSPHgUPXkcPnsSP30UQH4dQX8SQoABEkOBARRGhAEeR4UBJEiGAQlJhwEJSogBCUuJAQlMigEJTYwBCU6OARRPjwElUJIBCVGUARRSlQEmU5cBCVSYAQlVmQEUVpwBJ1edAS1YngEKWZ8BClqgAQpboQEKXKIBCl2kAQpepgEUX6cBLmCpAQphqwEUYqwBL2OtAQpkrgEKZa8BFGayATBnswE0aLQBCGm1AQhqtgEIa7cBCGy4AQhtugEIbrwBFG-9ATVwwQEIccMBFHLEATZzxwEIdMgBCHXJARR2zAE3d80BO3jOAQZ5zwEGetABBnvRAQZ80gEGfdQBBn7WARR_1wE8gAHZAQaBAdsBFIIB3AE9gwHdAQaEAd4BBoUB3wEUhgHiAT6HAeMBQogB5AEHiQHlAQeKAeYBB4sB5wEHjAHoAQeNAeoBB44B7AEUjwHtAUOQAe8BB5EB8QEUkgHyAUSTAfMBB5QB9AEHlQH1ARSWAfgBRZcB-QFJmAH7AQOZAfwBA5oB_gEDmwH_AQOcAYACA50BggIDngGEAhSfAYUCSqABhwIDoQGJAhSiAYoCS6MBiwIDpAGMAgOlAY0CFKYBkAJMpwGRAlKoAZICDqkBkwIOqgGUAg6rAZUCDqwBlgIOrQGYAg6uAZoCFK8BmwJTsAGeAg6xAaACFLIBoQJUswGjAg60AaQCDrUBpQIUtgGoAlW3AakCWbgBqgIEuQGrAgS6AawCBLsBrQIEvAGuAgS9AbACBL4BsgIUvwGzAlrAAbUCBMEBtwIUwgG4AlvDAbkCBMQBugIExQG7AhTGAb4CXMcBvwJgyAHAAgXJAcECBcoBwgIFywHDAgXMAcQCBc0BxgIFzgHIAhTPAckCYdABywIF0QHNAhTSAc4CYtMBzwIF1AHQAgXVAdECFNYB1AJj1wHVAmfYAdYCC9kB1wIL2gHYAgvbAdkCC9wB2gIL3QHcAgveAd4CFN8B3wJo4AHiAgvhAeQCFOIB5QJp4wHnAgvkAegCC-UB6QIU5gHsAmrnAe0CcOgB7gIM6QHvAgzqAfACDOsB8QIM7AHyAgztAfQCDO4B9gIU7wH3AnHwAfkCDPEB-wIU8gH8AnLzAf0CDPQB_gIM9QH_AhT2AYIDc_cBgwN3-AGFAwL5AYYDAvoBiAMC-wGJAwL8AYoDAv0BjAMC_gGOAxT_AY8DeIACkQMCgQKTAxSCApQDeYMClQMChAKWAwKFApcDFIYCmgN6hwKbA34"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config2.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config2);
}

// prisma/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// prisma/generated/prisma/client.js
globalThis["__dirname"] = path2.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/config/prisma.ts
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
var cleanDatabaseUrl = (config_default.database_url || "").replace(/([?&])sslmode=[^&]+(&|$)/, "$1").replace(/[?&]$/, "");
var pool = globalThis.__prismaPool || new pg.Pool({
  connectionString: cleanDatabaseUrl,
  ssl: {
    rejectUnauthorized: false
  },
  max: 5,
  idleTimeoutMillis: 1e4,
  connectionTimeoutMillis: 1e4,
  keepAlive: true
});
pool.on("error", (err) => {
  console.warn("Postgres pool idle client closed/reset:", err.message);
});
pool.on("connect", (client) => {
  client.on("error", (err) => {
    console.warn("Postgres pool client socket reset:", err.message);
  });
});
globalThis.__prismaPool = pool;
var adapter = new PrismaPg(pool);
var basePrisma = new PrismaClient({ adapter });
var prisma = globalThis.__prismaClient || basePrisma.$extends({
  query: {
    $allOperations: async ({ operation, model, args, query }) => {
      let retries = 3;
      while (retries >= 0) {
        try {
          return await query(args);
        } catch (error) {
          const msg = error?.message || "";
          const isConnError = msg.includes("Connection terminated") || msg.includes("connection timeout") || msg.includes("server conn crashed") || msg.includes("Failed to connect to upstream database") || error?.code === "08P01" || error?.code === "57P01" || error?.code === "P1001" || error?.code === "53300";
          if (isConnError && retries > 0) {
            console.warn(
              `[Prisma Retrying] Transient DB error (${msg.slice(0, 80)}...). Retries remaining: ${retries}`
            );
            retries--;
            await new Promise((r) => setTimeout(r, 800));
            continue;
          }
          throw error;
        }
      }
    }
  }
});
globalThis.__prismaClient = prisma;
var prisma_default = prisma;

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (jwtPayload, secret, expiresIn) => {
  const options = {
    expiresIn
  };
  return jwt.sign(jwtPayload, secret, options);
};
var verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

// src/config/redis.ts
import { Redis } from "ioredis";
var redisClient = null;
var isRedisAvailable = false;
var initRedis = () => {
  try {
    const options = {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      connectTimeout: 4e3,
      retryStrategy: (times) => {
        if (times > 2) {
          return null;
        }
        return 1e3;
      }
    };
    if (config_default.redis.url) {
      redisClient = new Redis(config_default.redis.url, options);
    } else {
      redisClient = new Redis({
        ...options,
        host: config_default.redis.host,
        port: config_default.redis.port,
        username: config_default.redis.user,
        password: config_default.redis.password || void 0
      });
    }
    redisClient.on("connect", () => {
      isRedisAvailable = true;
      console.log("Redis connected successfully.");
    });
    redisClient.on("ready", () => {
      isRedisAvailable = true;
    });
    redisClient.on("error", (err) => {
      isRedisAvailable = false;
    });
    redisClient.on("close", () => {
      isRedisAvailable = false;
    });
    return redisClient;
  } catch (error) {
    isRedisAvailable = false;
    redisClient = null;
    return null;
  }
};
initRedis();
var connectRedis = async () => {
  if (redisClient) {
    try {
      await redisClient.connect();
      isRedisAvailable = true;
      console.log("Redis client connected successfully.");
    } catch (err) {
      isRedisAvailable = false;
      console.warn(
        `[Redis] Notice: Could not connect to Redis server (${err?.message || "connection error"}). The application is running safely with high-performance in-memory cache/OTP fallback.`
      );
    }
  } else {
    console.warn(
      `[Redis] Notice: Redis client not initialized. Running with in-memory fallback.`
    );
  }
};
var getRedisClient = () => {
  return isRedisAvailable ? redisClient : null;
};

// src/utils/cache.ts
var memoryStore = /* @__PURE__ */ new Map();
var getCache = async (key) => {
  try {
    const redis = getRedisClient();
    if (redis) {
      const data = await redis.get(key);
      if (data) return JSON.parse(data);
      return null;
    }
  } catch (err) {
    console.error("Redis get error, falling back to memory:", err);
  }
  const item = memoryStore.get(key);
  if (!item) return null;
  if (Date.now() > item.expiry) {
    memoryStore.delete(key);
    return null;
  }
  return JSON.parse(item.value);
};
var setCache = async (key, value, ttlSeconds = 300) => {
  const serialized = JSON.stringify(value);
  try {
    const redis = getRedisClient();
    if (redis) {
      if (ttlSeconds > 0) {
        await redis.set(key, serialized, "EX", ttlSeconds);
      } else {
        await redis.set(key, serialized);
      }
      return;
    }
  } catch (err) {
    console.error("Redis set error, falling back to memory:", err);
  }
  memoryStore.set(key, {
    value: serialized,
    expiry: Date.now() + ttlSeconds * 1e3
  });
};
var deleteCache = async (key) => {
  try {
    const redis = getRedisClient();
    if (redis) {
      await redis.del(key);
      return;
    }
  } catch (err) {
    console.error("Redis del error:", err);
  }
  memoryStore.delete(key);
};
var deleteCacheByPattern = async (pattern) => {
  try {
    const redis = getRedisClient();
    if (redis) {
      const keys = await redis.keys(pattern);
      if (keys.length > 0) {
        await redis.del(...keys);
      }
      return;
    }
  } catch (err) {
    console.error("Redis pattern del error:", err);
  }
  const prefix = pattern.replace("*", "");
  for (const key of memoryStore.keys()) {
    if (key.startsWith(prefix)) {
      memoryStore.delete(key);
    }
  }
};

// src/utils/tokenBlacklist.ts
var BLACKLIST_PREFIX = "token:blacklist:";
var blacklistToken = async (token, ttlSeconds = 86400) => {
  await setCache(`${BLACKLIST_PREFIX}${token}`, "true", ttlSeconds);
};
var isTokenBlacklisted = async (token) => {
  const result = await getCache(`${BLACKLIST_PREFIX}${token}`);
  return result === "true";
};

// src/middlewares/auth.ts
var extractToken = (req) => {
  let token = req.headers.authorization;
  if (token) {
    token = token.trim();
    if (token.startsWith('"') && token.endsWith('"') || token.startsWith("'") && token.endsWith("'")) {
      token = token.slice(1, -1).trim();
    }
    while (/^bearer\s+/i.test(token)) {
      token = token.replace(/^bearer\s+/i, "").trim();
    }
    return token.length > 0 ? token : null;
  }
  if (req.cookies?.accessToken) {
    return req.cookies.accessToken;
  }
  return null;
};
var auth = (...requiredRoles) => {
  return async (req, res, next) => {
    try {
      const token = extractToken(req);
      if (!token) {
        throw new AppError_default(httpStatus3.UNAUTHORIZED, "You are not authorized!");
      }
      const blacklisted = await isTokenBlacklisted(token);
      if (blacklisted) {
        throw new AppError_default(
          httpStatus3.UNAUTHORIZED,
          "Token has been invalidated. Please log in again."
        );
      }
      let decoded;
      try {
        decoded = verifyToken(token, config_default.jwt.access_secret);
      } catch (err) {
        try {
          verifyToken(token, config_default.jwt.refresh_secret);
          throw new AppError_default(
            httpStatus3.UNAUTHORIZED,
            "You provided a Refresh Token instead of an Access Token! Please use the 'accessToken' in the Authorization header."
          );
        } catch (innerErr) {
          if (innerErr instanceof AppError_default) {
            throw innerErr;
          }
        }
        if (err?.name === "TokenExpiredError") {
          throw new AppError_default(
            httpStatus3.UNAUTHORIZED,
            "Your access token has expired. Please log in again to get a fresh token."
          );
        }
        throw new AppError_default(httpStatus3.UNAUTHORIZED, "Invalid or expired token!");
      }
      const user = await prisma_default.user.findUnique({
        where: { id: decoded.id }
      });
      if (!user) {
        throw new AppError_default(httpStatus3.NOT_FOUND, "User does not exist!");
      }
      if (user.deletedAt) {
        throw new AppError_default(httpStatus3.FORBIDDEN, "This account has been deleted!");
      }
      if (user.status === "SUSPENDED") {
        throw new AppError_default(
          httpStatus3.FORBIDDEN,
          "Your account is currently suspended. Please contact support."
        );
      }
      if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        throw new AppError_default(
          httpStatus3.FORBIDDEN,
          "You do not have permission to access this resource!"
        );
      }
      req.user = {
        id: user.id,
        email: user.email,
        role: user.role
      };
      next();
    } catch (error) {
      next(error);
    }
  };
};
var auth_default = auth;

// src/middlewares/validate.ts
var validateRequest = (schema) => {
  return async (req, res, next) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
        cookies: req.cookies
      });
      if (parsed.body !== void 0) {
        req.body = parsed.body;
      }
      if (parsed.query !== void 0 && req.query) {
        Object.assign(req.query, parsed.query);
      }
      if (parsed.params !== void 0 && req.params) {
        Object.assign(req.params, parsed.params);
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};
var validate_default = validateRequest;

// src/modules/admin/admin.controller.ts
import httpStatus5 from "http-status";

// src/utils/catchAsync.ts
var catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch((err) => next(err));
  };
};
var catchAsync_default = catchAsync;

// src/utils/sendResponse.ts
var sendResponse = (res, data) => {
  res.status(data.statusCode).json({
    success: data.success,
    message: data.message || "Operation successful",
    meta: data.meta,
    data: data.data
  });
};
var sendResponse_default = sendResponse;

// src/modules/admin/admin.service.ts
import httpStatus4 from "http-status";
var STATS_CACHE_KEY = "admin:stats";
var getAllUsers = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereClause = {
    deletedAt: null
  };
  if (query.role) whereClause.role = query.role;
  if (query.status) whereClause.status = query.status;
  if (query.search) {
    whereClause.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } }
    ];
  }
  const [users, total] = await Promise.all([
    prisma_default.user.findMany({
      where: whereClause,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        status: true,
        avatar: true,
        isVerified: true,
        createdAt: true,
        donorProfile: true
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma_default.user.count({ where: whereClause })
  ]);
  return {
    users,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var updateUserStatus = async (userId, adminId, payload) => {
  const targetUser = await prisma_default.user.findUnique({
    where: { id: userId }
  });
  if (!targetUser) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "User not found");
  }
  if (targetUser.role === "ADMIN") {
    throw new AppError_default(
      httpStatus4.FORBIDDEN,
      "Cannot suspend an administrator account"
    );
  }
  const updatedUser = await prisma_default.$transaction(async (tx) => {
    const user = await tx.user.update({
      where: { id: userId },
      data: { status: payload.status },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true
      }
    });
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `USER_STATUS_${payload.status}`,
        targetType: "User",
        targetId: userId,
        details: { reason: payload.reason, newStatus: payload.status }
      }
    });
    return user;
  });
  return updatedUser;
};
var verifyOrganization = async (organizationId, adminId, payload) => {
  const organization = await prisma_default.organization.findUnique({
    where: { id: organizationId },
    include: { owner: true }
  });
  if (!organization) {
    throw new AppError_default(httpStatus4.NOT_FOUND, "Organization not found");
  }
  const updatedOrg = await prisma_default.$transaction(async (tx) => {
    const org = await tx.organization.update({
      where: { id: organizationId },
      data: {
        verificationStatus: payload.verificationStatus,
        rejectionReason: payload.rejectionReason
      }
    });
    if (payload.verificationStatus === "APPROVED" && organization.owner.role === "USER") {
      await tx.user.update({
        where: { id: organization.ownerId },
        data: { role: "ORGANIZATION" }
      });
    }
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `ORGANIZATION_VERIFICATION_${payload.verificationStatus}`,
        targetType: "Organization",
        targetId: organizationId,
        details: {
          name: organization.name,
          verificationStatus: payload.verificationStatus,
          rejectionReason: payload.rejectionReason
        }
      }
    });
    await tx.notification.create({
      data: {
        userId: organization.ownerId,
        type: "SYSTEM",
        title: `Organization ${payload.verificationStatus === "APPROVED" ? "Approved! \u2705" : "Rejected"}`,
        message: payload.verificationStatus === "APPROVED" ? `Congratulations! Your organization "${organization.name}" has been approved. You can now coordinate blood requests and host camps.` : `Your organization application for "${organization.name}" was rejected. Reason: ${payload.rejectionReason || "Requirements not met"}`
      }
    });
    return org;
  });
  return updatedOrg;
};
var getDashboardStats = async () => {
  const cachedStats = await getCache(STATS_CACHE_KEY);
  if (cachedStats) {
    return cachedStats;
  }
  const [
    totalUsers,
    totalDonors,
    activeDonors,
    totalRequests,
    fulfilledRequests,
    totalOrganizations,
    verifiedOrganizations,
    totalCamps,
    totalDonations,
    paymentsAgg,
    recentRequests
  ] = await Promise.all([
    prisma_default.user.count({ where: { deletedAt: null } }),
    prisma_default.donorProfile.count(),
    prisma_default.donorProfile.count({ where: { isAvailable: true } }),
    prisma_default.bloodRequest.count({ where: { deletedAt: null } }),
    prisma_default.bloodRequest.count({ where: { status: "FULFILLED" } }),
    prisma_default.organization.count(),
    prisma_default.organization.count({ where: { verificationStatus: "APPROVED" } }),
    prisma_default.donationCamp.count(),
    prisma_default.donation.count(),
    prisma_default.payment.aggregate({
      _sum: { amount: true },
      _count: { id: true },
      where: { status: "PAID" }
    }),
    prisma_default.bloodRequest.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        requester: { select: { name: true, phone: true } }
      }
    })
  ]);
  const stats = {
    totalUsers,
    totalDonors,
    activeDonors,
    totalRequests,
    openRequests: Math.max(0, totalRequests - fulfilledRequests),
    fulfilledRequests,
    totalOrganizations,
    verifiedOrganizations,
    totalCamps,
    totalDonations,
    totalPaymentsAmount: paymentsAgg._sum.amount || 0,
    totalPaymentsCount: paymentsAgg._count.id || 0,
    totalCollectedFunds: paymentsAgg._sum.amount || 0,
    totalPaidDonationsCount: paymentsAgg._count.id || 0,
    overview: {
      totalUsers,
      totalDonors,
      activeDonors,
      totalRequests,
      openRequests: Math.max(0, totalRequests - fulfilledRequests),
      fulfilledRequests,
      totalOrganizations,
      verifiedOrganizations,
      totalCamps,
      totalDonations,
      totalCollectedFunds: paymentsAgg._sum.amount || 0,
      totalPaidDonationsCount: paymentsAgg._count.id || 0,
      totalPaymentsAmount: paymentsAgg._sum.amount || 0,
      totalPaymentsCount: paymentsAgg._count.id || 0
    },
    recentRequests
  };
  await setCache(STATS_CACHE_KEY, stats, 300);
  return stats;
};
var getAuditLogs = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    prisma_default.auditLog.findMany({
      include: {
        actor: {
          select: { id: true, name: true, email: true, role: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma_default.auditLog.count()
  ]);
  return {
    logs,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getAdminPayments = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 15;
  const skip = (page - 1) * limit;
  const whereClause = {};
  if (query.status) whereClause.status = query.status;
  const [payments, total] = await Promise.all([
    prisma_default.payment.findMany({
      where: whereClause,
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma_default.payment.count({ where: whereClause })
  ]);
  return {
    payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var AdminService = {
  getAllUsers,
  updateUserStatus,
  verifyOrganization,
  getDashboardStats,
  getAuditLogs,
  getAdminPayments
};
var admin_service_default = AdminService;

// src/modules/admin/admin.controller.ts
var getAllUsers2 = catchAsync_default(async (req, res) => {
  const result = await admin_service_default.getAllUsers(req.query);
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Users retrieved successfully",
    meta: result.meta,
    data: result.users
  });
});
var updateUserStatus2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const result = await admin_service_default.updateUserStatus(
      id,
      adminId,
      req.body
    );
    sendResponse_default(res, {
      statusCode: httpStatus5.OK,
      success: true,
      message: `User status successfully updated to ${req.body.status}`,
      data: result
    });
  }
);
var verifyOrganization2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const adminId = req.user.id;
    const result = await admin_service_default.verifyOrganization(
      id,
      adminId,
      req.body
    );
    sendResponse_default(res, {
      statusCode: httpStatus5.OK,
      success: true,
      message: `Organization ${req.body.verificationStatus.toLowerCase()} successfully`,
      data: result
    });
  }
);
var getDashboardStats2 = catchAsync_default(
  async (req, res) => {
    const result = await admin_service_default.getDashboardStats();
    sendResponse_default(res, {
      statusCode: httpStatus5.OK,
      success: true,
      message: "Admin dashboard stats retrieved successfully",
      data: result
    });
  }
);
var getAuditLogs2 = catchAsync_default(async (req, res) => {
  const result = await admin_service_default.getAuditLogs({
    page: req.query.page ? Number(req.query.page) : void 0,
    limit: req.query.limit ? Number(req.query.limit) : void 0
  });
  sendResponse_default(res, {
    statusCode: httpStatus5.OK,
    success: true,
    message: "Audit logs fetched successfully",
    meta: result.meta,
    data: result.logs
  });
});
var getAdminPayments2 = catchAsync_default(
  async (req, res) => {
    const result = await admin_service_default.getAdminPayments(req.query);
    sendResponse_default(res, {
      statusCode: httpStatus5.OK,
      success: true,
      message: "All payments fetched successfully",
      meta: result.meta,
      data: result.payments
    });
  }
);
var AdminController = {
  getAllUsers: getAllUsers2,
  updateUserStatus: updateUserStatus2,
  verifyOrganization: verifyOrganization2,
  getDashboardStats: getDashboardStats2,
  getAuditLogs: getAuditLogs2,
  getAdminPayments: getAdminPayments2
};
var admin_controller_default = AdminController;

// src/modules/admin/admin.validation.ts
import { z } from "zod";
var updateUserStatusSchema = z.object({
  body: z.object({
    status: z.enum(["ACTIVE", "SUSPENDED"]),
    reason: z.string().optional()
  })
});
var verifyOrganizationSchema = z.object({
  body: z.object({
    verificationStatus: z.string().optional(),
    status: z.string().optional(),
    rejectionReason: z.string().optional()
  }).optional().default({}).transform((data) => {
    const raw2 = data?.verificationStatus || data?.status;
    let status = "APPROVED";
    if (raw2) {
      const upper = raw2.trim().toUpperCase();
      if (["REJECT", "REJECTED", "DECLINE", "DECLINED", "CANCEL", "CANCELLED"].includes(
        upper
      )) {
        status = "REJECTED";
      } else {
        status = "APPROVED";
      }
    }
    return {
      verificationStatus: status,
      rejectionReason: data?.rejectionReason
    };
  })
});
var AdminValidation = {
  updateUserStatusSchema,
  verifyOrganizationSchema
};
var admin_validation_default = AdminValidation;

// src/modules/admin/admin.route.ts
var router = Router();
router.use(auth_default("ADMIN"));
router.get("/users", admin_controller_default.getAllUsers);
router.patch(
  "/users/:id/status",
  validate_default(admin_validation_default.updateUserStatusSchema),
  admin_controller_default.updateUserStatus
);
router.patch(
  "/organizations/:id/verify",
  validate_default(admin_validation_default.verifyOrganizationSchema),
  admin_controller_default.verifyOrganization
);
router.get("/dashboard-stats", admin_controller_default.getDashboardStats);
router.get("/audit-logs", admin_controller_default.getAuditLogs);
router.get("/payments", admin_controller_default.getAdminPayments);
var AdminRoutes = router;

// src/modules/auth/auth.route.ts
import { Router as Router2 } from "express";

// src/middlewares/rateLimit.ts
import httpStatus6 from "http-status";
var memoryLimitMap = /* @__PURE__ */ new Map();
var rateLimiter = (options) => {
  return async (req, res, next) => {
    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const key = `rl:${options.keyPrefix}:${String(ip).split(",")[0]?.trim()}`;
    try {
      const redis = getRedisClient();
      if (redis) {
        const current = await redis.incr(key);
        if (current === 1) {
          await redis.expire(key, options.windowSeconds);
        }
        if (current > options.maxRequests) {
          throw new AppError_default(
            httpStatus6.TOO_MANY_REQUESTS,
            options.message || "Too many requests. Please try again later."
          );
        }
        return next();
      }
    } catch (err) {
      if (err instanceof AppError_default) return next(err);
    }
    const now = Date.now();
    const entry = memoryLimitMap.get(key);
    if (!entry || now > entry.resetTime) {
      memoryLimitMap.set(key, {
        count: 1,
        resetTime: now + options.windowSeconds * 1e3
      });
      return next();
    }
    entry.count += 1;
    if (entry.count > options.maxRequests) {
      return next(
        new AppError_default(
          httpStatus6.TOO_MANY_REQUESTS,
          options.message || "Too many requests. Please try again later."
        )
      );
    }
    next();
  };
};
var rateLimit_default = rateLimiter;

// src/modules/auth/auth.controller.ts
import httpStatus9 from "http-status";

// src/modules/auth/auth.service.ts
import bcrypt from "bcryptjs";
import httpStatus8 from "http-status";

// src/lib/googleAuth.ts
import { OAuth2Client } from "google-auth-library";
var googleClient = new OAuth2Client({
  clientId: config_default.google.client_id
});

// src/utils/email.ts
import nodemailer from "nodemailer";
import httpStatus7 from "http-status";
var transporter = null;
var getMailTransporter = () => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: config_default.email.smtp_user,
        pass: config_default.email.smtp_password
      }
    });
  }
  return transporter;
};
var verifySmtpConnection = async () => {
  try {
    if (!config_default.email.smtp_user || !config_default.email.smtp_password) {
      console.warn("[Email] Warning: SMTP_USER or SMTP_PASSWORD not set in .env");
      return false;
    }
    const mailer = getMailTransporter();
    await mailer.verify();
    console.log("Email SMTP service (Gmail) connected successfully.");
    return true;
  } catch (error) {
    console.warn(`[Email] SMTP verification warning: ${error?.message || error}`);
    return false;
  }
};
var sendEmail = async (options) => {
  if (!config_default.email.smtp_user || !config_default.email.smtp_password) {
    throw new AppError_default(
      httpStatus7.INTERNAL_SERVER_ERROR,
      "Email service is not configured. Please set SMTP_USER and SMTP_PASSWORD in your environment variables (or Vercel Project Settings)."
    );
  }
  try {
    const mailer = getMailTransporter();
    const mailOptions = {
      from: config_default.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.subject
    };
    console.log(
      `[Email] Dispatching "${options.subject}" -> To: "${options.to}" (From: "${mailOptions.from}")`
    );
    const info = await mailer.sendMail(mailOptions);
    console.log(
      `[Email] Successfully delivered "${options.subject}" -> To: "${options.to}" (Accepted: ${JSON.stringify(info.accepted)}, MessageId: ${info.messageId})`
    );
    return true;
  } catch (error) {
    console.error(`[Email] Error sending email to "${options.to}":`, error?.message || error);
    throw new AppError_default(
      httpStatus7.INTERNAL_SERVER_ERROR,
      `Failed to send email to ${options.to}: ${error?.message || "SMTP transmission error"}`
    );
  }
};
var sendOtpEmail = async (to, otp, name) => {
  const recipientName = name || "BloodLink User";
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 26px; font-weight: 700; letter-spacing: 0.5px; }
      .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.9; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
      .desc { font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px; }
      .otp-box { text-align: center; margin: 30px 0; padding: 20px; background: #fff5f5; border: 2px dashed #feb2b2; border-radius: 10px; }
      .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #e53e3e; font-family: monospace; }
      .otp-validity { font-size: 13px; color: #718096; margin-top: 8px; }
      .warning { font-size: 13px; color: #742a2a; background: #fed7d7; padding: 12px 16px; border-radius: 8px; margin-top: 24px; line-height: 1.5; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>BloodLink</h1>
        <p>Password Reset Verification Code</p>
      </div>
      <div class="content">
        <div class="greeting">Hello, ${recipientName}!</div>
        <div class="desc">
          We received a request to reset the password for your BloodLink account. Please use the One-Time Password (OTP) below to complete your password change:
        </div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-validity">This code is valid for <strong>10 minutes</strong>.</div>
        </div>
        <div class="warning">
          <strong>Security Notice:</strong> Never share this code with anyone. BloodLink staff will never ask for your OTP. If you did not request this password reset, please ignore this email or review your account security immediately.
        </div>
      </div>
      <div class="footer">
        &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} BloodLink. Saving lives together.<br/>
        This is an automated system email, please do not reply.
      </div>
    </div>
  </body>
  </html>
  `;
  return sendEmail({
    to,
    subject: `Your BloodLink Password Reset OTP: ${otp}`,
    html
  });
};
var sendPasswordChangedEmail = async (to, name, changedAt) => {
  const recipientName = name || "BloodLink User";
  const formattedTime = (changedAt || /* @__PURE__ */ new Date()).toLocaleString("en-US", {
    timeZone: "Asia/Dhaka",
    dateStyle: "full",
    timeStyle: "medium"
  });
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #2b6cb0 0%, #2c5282 100%); padding: 30px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 24px; font-weight: 700; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 18px; font-weight: 600; margin-bottom: 12px; }
      .desc { font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 20px; }
      .status-box { background: #ebf8ff; border-left: 4px solid #3182ce; padding: 14px 18px; border-radius: 6px; margin: 20px 0; font-size: 14px; }
      .alert-box { background: #fffaf0; border: 1px solid #feebc8; border-radius: 8px; padding: 14px 18px; margin-top: 24px; font-size: 13px; color: #7b341e; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>BloodLink Security Alert</h1>
      </div>
      <div class="content">
        <div class="greeting">Hello, ${recipientName},</div>
        <div class="desc">
          Your BloodLink account password has been <strong>successfully changed</strong>.
        </div>
        <div class="status-box">
          <strong>Time of Change:</strong> ${formattedTime} (BST)<br/>
          <strong>Status:</strong> Completed Successfully
        </div>
        <div class="alert-box">
          <strong>Didn't make this change?</strong><br/>
          If you did not initiate this change, someone else may have gained unauthorized access to your account. Please reset your password immediately and contact BloodLink support.
        </div>
      </div>
      <div class="footer">
        &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} BloodLink Platform. All rights reserved.
      </div>
    </div>
  </body>
  </html>
  `;
  return sendEmail({
    to,
    subject: "Security Alert: Your BloodLink password was changed",
    html
  });
};
var sendWelcomeEmail = async (to, name) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #e53e3e 0%, #9b2c2c 100%); padding: 36px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 28px; font-weight: 800; letter-spacing: 0.5px; }
      .header p { margin: 8px 0 0; font-size: 15px; opacity: 0.95; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 20px; font-weight: 700; margin-bottom: 14px; color: #1a202c; }
      .desc { font-size: 15px; line-height: 1.7; color: #4a5568; margin-bottom: 20px; }
      .feature-box { background: #fff5f5; border-radius: 8px; padding: 18px 20px; margin: 20px 0; }
      .feature-box ul { margin: 8px 0 0 20px; padding: 0; }
      .feature-box li { margin-bottom: 8px; font-size: 14px; color: #742a2a; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>Welcome to BloodLink</h1>
        <p>Connecting Donors, Saving Lives</p>
      </div>
      <div class="content">
        <div class="greeting">Welcome aboard, ${name}!</div>
        <p class="desc">
          Thank you for joining <strong>BloodLink</strong>. Your registration brings us one step closer to ensuring no patient has to suffer due to blood unavailability in emergency situations.
        </p>
        <div class="feature-box">
          <strong style="color: #9b2c2c;">With your BloodLink account, you can:</strong>
          <ul>
            <li>Set up your profile and upload an HD avatar</li>
            <li>Register as a voluntary blood donor</li>
            <li>Post urgent blood requests for family and friends</li>
            <li>Connect with verified donors in your district</li>
          </ul>
        </div>
      </div>
      <div class="footer">
        &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} BloodLink Platform. Together we save lives!
      </div>
    </div>
  </body>
  </html>
  `;
  return sendEmail({
    to,
    subject: "Welcome to BloodLink - Empowering Donors & Saving Lives",
    html
  });
};
var sendRegistrationOtpEmail = async (to, otp, name) => {
  const recipientName = name || "BloodLink User";
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f7f9fa; margin: 0; padding: 20px; color: #2d3748; }
      .container { max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.06); }
      .header { background: linear-gradient(135deg, #e53e3e 0%, #c53030 100%); padding: 32px 20px; text-align: center; color: #ffffff; }
      .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: 0.5px; }
      .header p { margin: 6px 0 0; font-size: 14px; opacity: 0.95; }
      .content { padding: 32px 28px; }
      .greeting { font-size: 18px; font-weight: 700; margin-bottom: 12px; color: #1a202c; }
      .desc { font-size: 15px; line-height: 1.6; color: #4a5568; margin-bottom: 24px; }
      .otp-box { text-align: center; margin: 28px 0; padding: 20px; background: #fff5f5; border: 2px dashed #feb2b2; border-radius: 10px; }
      .otp-code { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #e53e3e; font-family: monospace; }
      .otp-validity { font-size: 13px; color: #718096; margin-top: 8px; }
      .instruction { background: #edf2f7; padding: 14px 18px; border-radius: 8px; font-size: 14px; color: #4a5568; line-height: 1.6; }
      .footer { background: #edf2f7; text-align: center; padding: 16px; font-size: 12px; color: #718096; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>BloodLink</h1>
        <p>Verify Your Email Address</p>
      </div>
      <div class="content">
        <div class="greeting">Welcome, ${recipientName}!</div>
        <div class="desc">
          Thank you for joining BloodLink. To complete your registration and activate your account, please verify your email address using this verification code:
        </div>
        <div class="otp-box">
          <div class="otp-code">${otp}</div>
          <div class="otp-validity">This code is valid for <strong>10 minutes</strong>.</div>
        </div>
        <div class="instruction">
          Enter this OTP code on the verification screen to activate your account. Once verified, you will be able to log in, register as a voluntary donor, and access all blood donation services.
        </div>
      </div>
      <div class="footer">
        &copy; ${(/* @__PURE__ */ new Date()).getFullYear()} BloodLink Platform. Saving lives together.<br/>
        If you did not sign up for BloodLink, you can safely ignore this email.
      </div>
    </div>
  </body>
  </html>
  `;
  return sendEmail({
    to,
    subject: `Your BloodLink Verification Code: ${otp}`,
    html
  });
};

// src/utils/otp.ts
import crypto from "crypto";
var OTP_PREFIX = "otp:password_reset:";
var OTP_EXPIRY_SECONDS = 600;
var generateOtp = () => {
  return crypto.randomInt(1e5, 999999).toString();
};
var storeOtp = async (email, otp) => {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  await setCache(key, otp, OTP_EXPIRY_SECONDS);
};
var verifyOtp = async (email, otp) => {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  const storedOtp = await getCache(key);
  if (!storedOtp) {
    return false;
  }
  return String(storedOtp).trim() === String(otp).trim();
};
var removeOtp = async (email) => {
  const key = `${OTP_PREFIX}${email.toLowerCase()}`;
  await deleteCache(key);
};
var REGISTRATION_OTP_PREFIX = "otp:email_verify:";
var storeRegistrationOtp = async (email, otp) => {
  const key = `${REGISTRATION_OTP_PREFIX}${email.toLowerCase()}`;
  await setCache(key, otp, OTP_EXPIRY_SECONDS);
};
var verifyRegistrationOtp = async (email, otp) => {
  const key = `${REGISTRATION_OTP_PREFIX}${email.toLowerCase()}`;
  const storedOtp = await getCache(key);
  if (!storedOtp) {
    return false;
  }
  return String(storedOtp).trim() === String(otp).trim();
};
var removeRegistrationOtp = async (email) => {
  const key = `${REGISTRATION_OTP_PREFIX}${email.toLowerCase()}`;
  await deleteCache(key);
};

// src/modules/auth/auth.service.ts
var registerUser = async (payload) => {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const existingUser = await prisma_default.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (existingUser && existingUser.isVerified) {
    throw new AppError_default(httpStatus8.CONFLICT, "User already exists with this email");
  }
  const hashedPassword = await bcrypt.hash(
    payload.password,
    config_default.bcrypt_salt_rounds
  );
  let user = existingUser;
  if (!user) {
    user = await prisma_default.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: payload.name,
          email: normalizedEmail,
          password: hashedPassword,
          phone: payload.phone,
          role: "USER",
          status: "ACTIVE",
          isVerified: false
        }
      });
      if (payload.bloodGroup && payload.district) {
        await tx.donorProfile.create({
          data: {
            userId: newUser.id,
            bloodGroup: payload.bloodGroup,
            district: payload.district,
            upazila: payload.upazila,
            isAvailable: true
          }
        });
      }
      return newUser;
    });
  } else {
    user = await prisma_default.user.update({
      where: { id: user.id },
      data: {
        name: payload.name,
        password: hashedPassword,
        phone: payload.phone || user.phone
      }
    });
  }
  if (payload.otp) {
    const isValid = await verifyRegistrationOtp(normalizedEmail, payload.otp);
    if (!isValid) {
      throw new AppError_default(
        httpStatus8.BAD_REQUEST,
        "Invalid or expired OTP verification code. Please check your email or request a new code."
      );
    }
    const verifiedUser = await prisma_default.user.update({
      where: { id: user.id },
      data: { isVerified: true },
      include: { donorProfile: true }
    });
    await removeRegistrationOtp(normalizedEmail);
    sendWelcomeEmail(verifiedUser.email, verifiedUser.name).catch(
      (err) => console.error("Failed to send welcome email:", err?.message || err)
    );
    const accessToken = createToken(
      { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
      config_default.jwt.access_secret,
      config_default.jwt.access_expires_in
    );
    const refreshToken3 = createToken(
      { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
      config_default.jwt.refresh_secret,
      config_default.jwt.refresh_expires_in
    );
    const { password, ...userWithoutPassword } = verifiedUser;
    return {
      user: userWithoutPassword,
      accessToken,
      refreshToken: refreshToken3,
      message: "OTP matched successfully! Account registered and activated.",
      isVerified: true
    };
  }
  const otp = generateOtp();
  await storeRegistrationOtp(normalizedEmail, otp);
  await sendRegistrationOtpEmail(normalizedEmail, otp, payload.name);
  return {
    email: normalizedEmail,
    message: "A 6-digit OTP verification code has been sent to your Gmail. Please enter the OTP to complete registration and activate your account.",
    requiresOtp: true,
    isVerified: false
  };
};
var loginUser = async (payload, clientIp) => {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const user = await prisma_default.user.findUnique({
    where: { email: normalizedEmail },
    include: {
      donorProfile: true
    }
  });
  if (!user) {
    throw new AppError_default(httpStatus8.UNAUTHORIZED, "Invalid email or password");
  }
  if (user.deletedAt) {
    throw new AppError_default(httpStatus8.FORBIDDEN, "This account has been deleted");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError_default(
      httpStatus8.FORBIDDEN,
      "Your account is suspended. Please contact administrator."
    );
  }
  if (!user.password) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Account registered via Google. Please sign in with Google."
    );
  }
  const isPasswordMatch = await bcrypt.compare(payload.password, user.password);
  if (!isPasswordMatch) {
    throw new AppError_default(httpStatus8.UNAUTHORIZED, "Invalid email or password");
  }
  if (payload.otp) {
    const isValid = await verifyRegistrationOtp(normalizedEmail, payload.otp);
    if (!isValid) {
      throw new AppError_default(
        httpStatus8.BAD_REQUEST,
        "Invalid or expired OTP verification code."
      );
    }
    if (!user.isVerified) {
      await prisma_default.user.update({
        where: { id: user.id },
        data: { isVerified: true }
      });
      user.isVerified = true;
    }
    await removeRegistrationOtp(normalizedEmail);
  } else if (!user.isVerified && user.role !== "ADMIN") {
    const otp = generateOtp();
    await storeRegistrationOtp(user.email, otp);
    await sendRegistrationOtpEmail(user.email, otp, user.name);
    return {
      requiresOtp: true,
      email: user.email,
      message: "A 6-digit OTP verification code has been sent to your Gmail. Please enter the OTP to complete login."
    };
  }
  const accessToken = createToken(
    { id: user.id, email: user.email, role: user.role },
    config_default.jwt.access_secret,
    config_default.jwt.access_expires_in
  );
  const refreshToken3 = createToken(
    { id: user.id, email: user.email, role: user.role },
    config_default.jwt.refresh_secret,
    config_default.jwt.refresh_expires_in
  );
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken: refreshToken3
  };
};
var googleLogin = async (payload) => {
  const tokenToVerify = (payload.idToken || payload.credential || payload.token)?.trim();
  if (!tokenToVerify) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Google ID token is required for authentication"
    );
  }
  let googleIdTokenPayload = null;
  const audience = (config_default.google?.client_id || config_default.google_client_id || process.env.GOOGLE_CLIENT_ID || "").trim();
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenToVerify,
      ...audience ? { audience } : {}
    });
    googleIdTokenPayload = ticket.getPayload();
  } catch (error) {
    console.error("Google ID Token Verification Failed with audience:", error?.message || error);
    try {
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenToVerify
      });
      googleIdTokenPayload = ticket.getPayload();
    } catch (fallbackError) {
      console.error("Google ID Token Fallback Verification Failed:", fallbackError?.message || fallbackError);
      throw new AppError_default(
        httpStatus8.UNAUTHORIZED,
        "Invalid Or Expired Google Id Token"
      );
    }
  }
  if (!googleIdTokenPayload || !googleIdTokenPayload.sub) {
    throw new AppError_default(
      httpStatus8.UNAUTHORIZED,
      "Invalid Or Expired Google Id Token"
    );
  }
  if (!googleIdTokenPayload.email) {
    throw new AppError_default(httpStatus8.BAD_REQUEST, "Google Email Not Found");
  }
  const email = googleIdTokenPayload.email.trim().toLowerCase();
  const name = googleIdTokenPayload.name || googleIdTokenPayload.given_name || email.split("@")[0] || "Google User";
  const googleId = googleIdTokenPayload.sub;
  const avatar = googleIdTokenPayload.picture;
  let existingUser = await prisma_default.user.findUnique({
    where: { googleId },
    include: {
      donorProfile: true
    }
  });
  if (!existingUser) {
    existingUser = await prisma_default.user.findUnique({
      where: { email },
      include: {
        donorProfile: true
      }
    });
  }
  let user = existingUser;
  if (existingUser) {
    if (existingUser.deletedAt) {
      throw new AppError_default(httpStatus8.FORBIDDEN, "This account has been deleted");
    }
    if (existingUser.status === "SUSPENDED") {
      throw new AppError_default(
        httpStatus8.FORBIDDEN,
        "Account suspended. Please contact administrator."
      );
    }
    if (!existingUser.googleId || !existingUser.isVerified) {
      user = await prisma_default.user.update({
        where: { id: existingUser.id },
        data: {
          googleId,
          isVerified: true,
          avatar: existingUser.avatar || avatar
        },
        include: {
          donorProfile: true
        }
      });
    }
  } else {
    user = await prisma_default.user.create({
      data: {
        name,
        email,
        googleId,
        avatar,
        role: "USER",
        status: "ACTIVE",
        isVerified: true
      },
      include: {
        donorProfile: true
      }
    });
    sendWelcomeEmail(user.email, user.name).catch(
      (err) => console.error("Failed to send welcome email:", err?.message || err)
    );
  }
  if (!user) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "User Not Found");
  }
  if (user.deletedAt) {
    throw new AppError_default(httpStatus8.FORBIDDEN, "This account has been deleted");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError_default(
      httpStatus8.FORBIDDEN,
      "Account suspended. Please contact administrator."
    );
  }
  const jwtPayload = {
    id: user.id,
    userId: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  const accessToken = createToken(
    jwtPayload,
    config_default.jwt.access_secret,
    config_default.jwt.access_expires_in
  );
  const refreshToken3 = createToken(
    jwtPayload,
    config_default.jwt.refresh_secret,
    config_default.jwt.refresh_expires_in
  );
  const { password, ...userWithoutPassword } = user;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken: refreshToken3
  };
};
var refreshToken = async (token) => {
  if (!token) {
    throw new AppError_default(httpStatus8.UNAUTHORIZED, "Refresh token is required");
  }
  let decoded;
  try {
    decoded = verifyToken(token, config_default.jwt.refresh_secret);
  } catch (err) {
    throw new AppError_default(httpStatus8.UNAUTHORIZED, "Invalid or expired refresh token");
  }
  const user = await prisma_default.user.findUnique({
    where: { id: decoded.id }
  });
  if (!user || user.deletedAt || user.status === "SUSPENDED") {
    throw new AppError_default(httpStatus8.UNAUTHORIZED, "User is no longer active");
  }
  const newAccessToken = createToken(
    { id: user.id, email: user.email, role: user.role },
    config_default.jwt.access_secret,
    config_default.jwt.access_expires_in
  );
  return {
    accessToken: newAccessToken,
    refreshToken: token
  };
};
var logoutUser = async (accessToken, refreshToken3) => {
  if (accessToken) {
    await blacklistToken(accessToken, 86400);
  }
  if (refreshToken3) {
    await blacklistToken(refreshToken3, 86400 * 7);
  }
  return true;
};
var forgotPassword = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma_default.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (!user || user.deletedAt) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "No account found with this email address");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError_default(
      httpStatus8.FORBIDDEN,
      "This account is suspended. Please contact support."
    );
  }
  const otp = generateOtp();
  await storeOtp(normalizedEmail, otp);
  console.log(
    `[Auth] Forgot password OTP requested for "${user.name}" (${normalizedEmail}). Sending OTP email to recipient: "${normalizedEmail}"`
  );
  const emailSent = await sendOtpEmail(normalizedEmail, otp, user.name);
  return {
    success: true,
    message: "A 6-digit OTP verification code has been sent to your email address.",
    email: normalizedEmail,
    emailDelivered: emailSent,
    expiresIn: "10 minutes"
  };
};
var verifyResetOtp = async (email, otp) => {
  const normalizedEmail = email.toLowerCase().trim();
  const isValid = await verifyOtp(normalizedEmail, otp);
  if (!isValid) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Invalid or expired OTP verification code."
    );
  }
  return {
    success: true,
    message: "OTP verified successfully. You can now reset your password."
  };
};
var resetPassword = async (payload) => {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const isValid = await verifyOtp(normalizedEmail, payload.otp);
  if (!isValid) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Invalid or expired OTP verification code. Please request a new OTP."
    );
  }
  const user = await prisma_default.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (!user || user.deletedAt) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "User account not found");
  }
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    config_default.bcrypt_salt_rounds
  );
  await prisma_default.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });
  await removeOtp(normalizedEmail);
  console.log(
    `[Auth] Password reset with OTP for user "${user.name}" (${user.email}). Dispatching confirmation email to recipient: "${user.email}"`
  );
  sendPasswordChangedEmail(user.email, user.name, /* @__PURE__ */ new Date()).catch(
    (err) => console.error("Failed to send password changed email:", err?.message || err)
  );
  return {
    success: true,
    message: "Password has been changed successfully. A security confirmation email has been sent. You can now login with your new password."
  };
};
var changePassword = async (userId, payload) => {
  const oldPassword = payload.oldPassword || payload.currentPassword;
  if (!oldPassword) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Old password is required. Please provide oldPassword or currentPassword."
    );
  }
  const user = await prisma_default.user.findUnique({
    where: { id: userId }
  });
  if (!user || user.deletedAt) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "User account not found");
  }
  if (user.status === "SUSPENDED") {
    throw new AppError_default(
      httpStatus8.FORBIDDEN,
      "Your account is suspended. Please contact administrator."
    );
  }
  if (!user.password) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Account was registered via Google OAuth without a password. Please use Forgot Password with OTP to set a password."
    );
  }
  const isMatch = await bcrypt.compare(oldPassword, user.password);
  if (!isMatch) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Incorrect old password. The password you provided does not match your current password. If you do not remember your old password, please use Forgot Password (OTP) to reset it."
    );
  }
  const hashedPassword = await bcrypt.hash(
    payload.newPassword,
    config_default.bcrypt_salt_rounds
  );
  await prisma_default.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });
  console.log(
    `[Auth] Password changed for user "${user.name}" (ID: ${user.id}). Dispatching confirmation email to recipient: "${user.email}"`
  );
  sendPasswordChangedEmail(user.email, user.name, /* @__PURE__ */ new Date()).catch(
    (err) => console.error("Failed to send password changed email:", err?.message || err)
  );
  return {
    success: true,
    message: "Password changed successfully! A confirmation email has been sent to your registered email."
  };
};
var verifyEmailOtp = async (payload) => {
  const normalizedEmail = payload.email.toLowerCase().trim();
  const user = await prisma_default.user.findUnique({
    where: { email: normalizedEmail },
    include: { donorProfile: true }
  });
  if (!user || user.deletedAt) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "No account found with this email");
  }
  if (user.isVerified) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Your email is already verified. You can log in directly."
    );
  }
  const isValid = await verifyRegistrationOtp(normalizedEmail, payload.otp);
  if (!isValid) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "Invalid or expired OTP code. Please check your email or request a new code."
    );
  }
  const verifiedUser = await prisma_default.user.update({
    where: { id: user.id },
    data: { isVerified: true },
    include: { donorProfile: true }
  });
  await removeRegistrationOtp(normalizedEmail);
  sendWelcomeEmail(verifiedUser.email, verifiedUser.name).catch(
    (err) => console.error("Failed to send welcome email:", err?.message || err)
  );
  const accessToken = createToken(
    { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
    config_default.jwt.access_secret,
    config_default.jwt.access_expires_in
  );
  const refreshToken3 = createToken(
    { id: verifiedUser.id, email: verifiedUser.email, role: verifiedUser.role },
    config_default.jwt.refresh_secret,
    config_default.jwt.refresh_expires_in
  );
  const { password, ...userWithoutPassword } = verifiedUser;
  return {
    user: userWithoutPassword,
    accessToken,
    refreshToken: refreshToken3
  };
};
var resendEmailOtp = async (email) => {
  const normalizedEmail = email.toLowerCase().trim();
  const user = await prisma_default.user.findUnique({
    where: { email: normalizedEmail }
  });
  if (!user || user.deletedAt) {
    throw new AppError_default(httpStatus8.NOT_FOUND, "No account found with this email");
  }
  if (user.isVerified) {
    throw new AppError_default(
      httpStatus8.BAD_REQUEST,
      "This account is already verified. Please log in."
    );
  }
  const otp = generateOtp();
  await storeRegistrationOtp(normalizedEmail, otp);
  await sendRegistrationOtpEmail(normalizedEmail, otp, user.name);
  return {
    success: true,
    message: "A new 6-digit OTP verification code has been sent to your Gmail.",
    expiresIn: "10 minutes"
  };
};
var AuthService = {
  registerUser,
  loginUser,
  googleLogin,
  refreshToken,
  logoutUser,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
  changePassword,
  verifyEmailOtp,
  resendEmailOtp
};
var auth_service_default = AuthService;

// src/modules/auth/auth.controller.ts
var register = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.registerUser(req.body);
  if (result.refreshToken) {
    res.cookie("refreshToken", result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1e3
    });
  }
  sendResponse_default(res, {
    statusCode: result.isVerified ? httpStatus9.CREATED : httpStatus9.OK,
    success: true,
    message: result.message,
    data: result.isVerified ? {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    } : {
      email: result.email,
      requiresOtp: result.requiresOtp,
      message: result.message
    }
  });
});
var login = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.loginUser(req.body);
  if (result.requiresOtp) {
    return sendResponse_default(res, {
      statusCode: httpStatus9.OK,
      success: true,
      message: result.message || "A 6-digit OTP verification code has been sent to your Gmail.",
      data: {
        requiresOtp: true,
        email: result.email,
        message: result.message
      }
    });
  }
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Logged in successfully",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});
var googleAuth = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.googleLogin(req.body);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Google login successful",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});
var refreshToken2 = catchAsync_default(async (req, res) => {
  const token = req.cookies?.refreshToken || req.body?.refreshToken;
  const result = await auth_service_default.refreshToken(token);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Token refreshed successfully",
    data: result
  });
});
var logout = catchAsync_default(async (req, res) => {
  const authHeader = req.headers.authorization;
  const accessToken = authHeader?.startsWith("Bearer ") ? authHeader.split(" ")[1] : void 0;
  const refreshToken3 = req.cookies?.refreshToken || req.body?.refreshToken;
  await auth_service_default.logoutUser(accessToken, refreshToken3);
  res.clearCookie("refreshToken");
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Logged out successfully",
    data: null
  });
});
var forgotPassword2 = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.forgotPassword(req.body.email);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: result.message,
    data: result
  });
});
var verifyResetOtp2 = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.verifyResetOtp(req.body.email, req.body.otp);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: result.message,
    data: result
  });
});
var resetPassword2 = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.resetPassword(req.body);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: result.message,
    data: result
  });
});
var changePassword2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await auth_service_default.changePassword(userId, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: result.message,
    data: result
  });
});
var verifyEmailOtp2 = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.verifyEmailOtp(req.body);
  res.cookie("refreshToken", result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1e3
  });
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: "Email verified successfully! You are now logged in.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
      refreshToken: result.refreshToken
    }
  });
});
var resendEmailOtp2 = catchAsync_default(async (req, res) => {
  const result = await auth_service_default.resendEmailOtp(req.body.email);
  sendResponse_default(res, {
    statusCode: httpStatus9.OK,
    success: true,
    message: result.message,
    data: result
  });
});
var AuthController = {
  register,
  verifyEmailOtp: verifyEmailOtp2,
  resendEmailOtp: resendEmailOtp2,
  login,
  googleAuth,
  refreshToken: refreshToken2,
  logout,
  forgotPassword: forgotPassword2,
  verifyResetOtp: verifyResetOtp2,
  resetPassword: resetPassword2,
  changePassword: changePassword2
};
var auth_controller_default = AuthController;

// src/modules/auth/auth.validation.ts
import { z as z2 } from "zod";
var bloodGroupEnum = z2.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE"
]);
var registerValidationSchema = z2.object({
  body: z2.object({
    name: z2.string().min(2, "Name must be at least 2 characters"),
    email: z2.string().email("Invalid email address"),
    password: z2.string().min(6, "Password must be at least 6 characters"),
    phone: z2.string().optional(),
    isDonor: z2.boolean().optional(),
    bloodGroup: bloodGroupEnum.optional(),
    district: z2.string().optional(),
    upazila: z2.string().optional(),
    otp: z2.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits").optional()
  })
});
var loginValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address"),
    password: z2.string().min(1, "Password is required"),
    otp: z2.string().optional()
  })
});
var googleAuthValidationSchema = z2.object({
  body: z2.object({
    idToken: z2.string().optional(),
    credential: z2.string().optional(),
    token: z2.string().optional()
  }).refine((data) => Boolean(data.idToken || data.credential || data.token), {
    message: "Google authentication requires a genuine Google OAuth credential or ID token."
  })
});
var refreshTokenValidationSchema = z2.object({
  body: z2.object({
    refreshToken: z2.string().optional()
  }).optional(),
  cookies: z2.object({
    refreshToken: z2.string().optional()
  }).optional()
});
var forgotPasswordValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address")
  })
});
var verifyOtpValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address"),
    otp: z2.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits")
  })
});
var resetPasswordValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address"),
    otp: z2.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits"),
    newPassword: z2.string().min(6, "New password must be at least 6 characters")
  })
});
var changePasswordValidationSchema = z2.object({
  body: z2.object({
    oldPassword: z2.string().optional(),
    currentPassword: z2.string().optional(),
    newPassword: z2.string().min(6, "New password must be at least 6 characters")
  }).refine((data) => !!(data.oldPassword || data.currentPassword), {
    message: "Old password (oldPassword or currentPassword) is required"
  })
});
var verifyEmailOtpValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address"),
    otp: z2.string().min(6, "OTP must be 6 digits").max(6, "OTP must be 6 digits")
  })
});
var resendEmailOtpValidationSchema = z2.object({
  body: z2.object({
    email: z2.string().email("Invalid email address")
  })
});
var AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  googleAuthValidationSchema,
  refreshTokenValidationSchema,
  forgotPasswordValidationSchema,
  verifyOtpValidationSchema,
  resetPasswordValidationSchema,
  changePasswordValidationSchema,
  verifyEmailOtpValidationSchema,
  resendEmailOtpValidationSchema
};
var auth_validation_default = AuthValidation;

// src/modules/auth/auth.route.ts
var router2 = Router2();
router2.post(
  "/register",
  validate_default(auth_validation_default.registerValidationSchema),
  auth_controller_default.register
);
router2.post(
  "/verify-email",
  validate_default(auth_validation_default.verifyEmailOtpValidationSchema),
  auth_controller_default.verifyEmailOtp
);
router2.post(
  "/resend-verification-otp",
  rateLimit_default({
    keyPrefix: "resend-verify-otp",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many OTP requests. Please wait 15 minutes."
  }),
  validate_default(auth_validation_default.resendEmailOtpValidationSchema),
  auth_controller_default.resendEmailOtp
);
router2.post(
  "/login",
  rateLimit_default({
    keyPrefix: "login",
    maxRequests: 10,
    windowSeconds: 60 * 15,
    message: "Too many login attempts. Please try again after 15 minutes."
  }),
  validate_default(auth_validation_default.loginValidationSchema),
  auth_controller_default.login
);
router2.post(
  "/google",
  validate_default(auth_validation_default.googleAuthValidationSchema),
  auth_controller_default.googleAuth
);
router2.post(
  "/refresh-token",
  validate_default(auth_validation_default.refreshTokenValidationSchema),
  auth_controller_default.refreshToken
);
router2.post("/logout", auth_controller_default.logout);
router2.post(
  "/send-otp",
  rateLimit_default({
    keyPrefix: "send-otp",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many OTP requests. Please wait 15 minutes."
  }),
  validate_default(auth_validation_default.forgotPasswordValidationSchema),
  auth_controller_default.forgotPassword
);
router2.post(
  "/forgot-password",
  rateLimit_default({
    keyPrefix: "forgot-password",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many password reset requests. Please wait 15 minutes."
  }),
  validate_default(auth_validation_default.forgotPasswordValidationSchema),
  auth_controller_default.forgotPassword
);
router2.post(
  "/verify-otp",
  validate_default(auth_validation_default.verifyOtpValidationSchema),
  auth_controller_default.verifyResetOtp
);
router2.post(
  "/reset-password",
  rateLimit_default({
    keyPrefix: "reset-password",
    maxRequests: 5,
    windowSeconds: 60 * 15,
    message: "Too many reset attempts. Please wait 15 minutes."
  }),
  validate_default(auth_validation_default.resetPasswordValidationSchema),
  auth_controller_default.resetPassword
);
router2.post(
  "/change-password",
  auth_default(),
  validate_default(auth_validation_default.changePasswordValidationSchema),
  auth_controller_default.changePassword
);
var AuthRoutes = router2;

// src/modules/bloodRequest/bloodRequest.route.ts
import { Router as Router3 } from "express";

// src/modules/bloodRequest/bloodRequest.controller.ts
import httpStatus11 from "http-status";

// src/modules/bloodRequest/bloodRequest.service.ts
import httpStatus10 from "http-status";
var createBloodRequest = async (userId, payload) => {
  const bloodRequest = await prisma_default.bloodRequest.create({
    data: {
      requesterId: userId,
      organizationId: payload.organizationId,
      patientName: payload.patientName,
      bloodGroup: payload.bloodGroup,
      units: payload.units,
      hospitalName: payload.hospitalName,
      district: payload.district,
      upazila: payload.upazila,
      contactPhone: payload.contactPhone,
      note: payload.note,
      urgency: payload.urgency || "NORMAL",
      neededBy: new Date(payload.neededBy),
      status: "OPEN"
    },
    include: {
      requester: {
        select: { id: true, name: true, phone: true, email: true }
      },
      organization: {
        select: { id: true, name: true, contactPhone: true }
      }
    }
  });
  try {
    const sixMonthsAgo = /* @__PURE__ */ new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const matchingDonors = await prisma_default.donorProfile.findMany({
      where: {
        bloodGroup: payload.bloodGroup,
        district: {
          contains: payload.district,
          mode: "insensitive"
        },
        isAvailable: true,
        user: {
          id: { not: userId },
          deletedAt: null,
          status: "ACTIVE"
        },
        OR: [
          { lastDonationDate: null },
          { lastDonationDate: { lte: sixMonthsAgo } }
        ]
      },
      select: {
        userId: true
      },
      take: 20
      // Notify top 20 matching donors
    });
    if (matchingDonors.length > 0) {
      await prisma_default.notification.createMany({
        data: matchingDonors.map((donor) => ({
          userId: donor.userId,
          requestId: bloodRequest.id,
          type: "NEW_MATCHING_REQUEST",
          title: `Urgent: ${payload.bloodGroup.replace("_", " ")} blood needed`,
          message: `${payload.units} unit(s) of ${payload.bloodGroup} needed at ${payload.hospitalName}, ${payload.district}.`
        }))
      });
    }
  } catch (error) {
    console.error("Failed to notify matching donors:", error);
  }
  return bloodRequest;
};
var getAllBloodRequests = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereClause = {
    deletedAt: null
  };
  if (query.status && query.status !== "ALL") {
    whereClause.status = query.status;
  } else if (!query.status) {
    whereClause.status = "OPEN";
  }
  if (query.bloodGroup) {
    whereClause.bloodGroup = query.bloodGroup;
  }
  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive"
    };
  }
  if (query.urgency) {
    whereClause.urgency = query.urgency;
  }
  if (query.organizationId) {
    whereClause.organizationId = query.organizationId;
  }
  const [requests, total] = await Promise.all([
    prisma_default.bloodRequest.findMany({
      where: whereClause,
      include: {
        requester: {
          select: { id: true, name: true, phone: true }
        },
        organization: {
          select: { id: true, name: true, district: true }
        },
        _count: {
          select: { responses: true, donations: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma_default.bloodRequest.count({ where: whereClause })
  ]);
  return {
    requests,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getMyBloodRequests = async (userId) => {
  const requests = await prisma_default.bloodRequest.findMany({
    where: {
      requesterId: userId,
      deletedAt: null
    },
    include: {
      responses: {
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
              donorProfile: true
            }
          }
        }
      },
      donations: true
    },
    orderBy: { createdAt: "desc" }
  });
  return requests;
};
var getBloodRequestById = async (id) => {
  const bloodRequest = await prisma_default.bloodRequest.findUnique({
    where: { id },
    include: {
      requester: {
        select: { id: true, name: true, phone: true, email: true }
      },
      organization: {
        select: { id: true, name: true, district: true, contactPhone: true }
      },
      responses: {
        include: {
          donor: {
            select: {
              id: true,
              name: true,
              phone: true,
              donorProfile: true
            }
          }
        }
      },
      donations: {
        include: {
          donor: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });
  if (!bloodRequest || bloodRequest.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  return bloodRequest;
};
var updateBloodRequest = async (requestId, userId, userRole, payload) => {
  const request = await prisma_default.bloodRequest.findUnique({
    where: { id: requestId }
  });
  if (!request || request.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";
  if (!isCreator && !isAdmin) {
    throw new AppError_default(
      httpStatus10.FORBIDDEN,
      "You do not have permission to edit this request"
    );
  }
  const updated = await prisma_default.bloodRequest.update({
    where: { id: requestId },
    data: {
      ...payload,
      neededBy: payload.neededBy ? new Date(payload.neededBy) : void 0
    }
  });
  return updated;
};
var deleteBloodRequest = async (requestId, userId, userRole) => {
  const request = await prisma_default.bloodRequest.findUnique({
    where: { id: requestId }
  });
  if (!request || request.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";
  if (!isCreator && !isAdmin) {
    throw new AppError_default(
      httpStatus10.FORBIDDEN,
      "You do not have permission to delete this request"
    );
  }
  await prisma_default.bloodRequest.update({
    where: { id: requestId },
    data: { deletedAt: /* @__PURE__ */ new Date(), status: "CANCELLED" }
  });
  return true;
};
var updateRequestStatus = async (requestId, userId, userRole, status) => {
  const request = await prisma_default.bloodRequest.findUnique({
    where: { id: requestId }
  });
  if (!request || request.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";
  if (!isCreator && !isAdmin) {
    throw new AppError_default(
      httpStatus10.FORBIDDEN,
      "Only the creator, associated organization, or Admin can update request status"
    );
  }
  const updated = await prisma_default.bloodRequest.update({
    where: { id: requestId },
    data: { status }
  });
  return updated;
};
var respondToRequest = async (requestId, donorId, payload) => {
  const request = await prisma_default.bloodRequest.findUnique({
    where: { id: requestId }
  });
  if (!request || request.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  if (request.requesterId === donorId) {
    throw new AppError_default(
      httpStatus10.BAD_REQUEST,
      "You cannot respond to your own blood request."
    );
  }
  if (["FULFILLED", "CANCELLED", "EXPIRED"].includes(request.status)) {
    throw new AppError_default(
      httpStatus10.BAD_REQUEST,
      `Cannot respond to a ${request.status.toLowerCase()} request.`
    );
  }
  if (payload.phone && payload.phone.trim()) {
    try {
      await prisma_default.user.update({
        where: { id: donorId },
        data: { phone: payload.phone.trim() }
      });
    } catch (err) {
      console.error("Failed to update donor phone number:", err);
    }
  }
  const existingResponse = await prisma_default.donorResponse.findUnique({
    where: {
      requestId_donorId: {
        requestId,
        donorId
      }
    }
  });
  if (existingResponse) {
    throw new AppError_default(
      httpStatus10.CONFLICT,
      "You have already responded to this request."
    );
  }
  const response = await prisma_default.donorResponse.create({
    data: {
      requestId,
      donorId,
      status: payload.status,
      message: payload.message
    },
    include: {
      donor: {
        select: { id: true, name: true, phone: true, email: true }
      }
    }
  });
  try {
    await prisma_default.notification.create({
      data: {
        userId: request.requesterId,
        requestId: request.id,
        type: "DONOR_RESPONDED",
        title: "A donor has responded to your request",
        message: `${response.donor.name} marked their status as ${payload.status} for your ${request.bloodGroup} request.`
      }
    });
  } catch (err) {
    console.error("Failed to notify requester:", err);
  }
  return response;
};
var getResponsesForRequest = async (requestId, userId, userRole) => {
  const request = await prisma_default.bloodRequest.findUnique({
    where: { id: requestId }
  });
  if (!request || request.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";
  if (!isCreator && !isAdmin) {
    throw new AppError_default(
      httpStatus10.FORBIDDEN,
      "You do not have permission to view responses for this request"
    );
  }
  const responses = await prisma_default.donorResponse.findMany({
    where: { requestId },
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          donorProfile: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return responses;
};
var confirmDonorResponse = async (requestId, donorOrResponseId, userId, userRole) => {
  const request = await prisma_default.bloodRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: { id: true, name: true, phone: true }
      }
    }
  });
  if (!request || request.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";
  if (!isCreator && !isAdmin) {
    throw new AppError_default(
      httpStatus10.FORBIDDEN,
      "Only the request creator or Admin can approve and confirm donor responses"
    );
  }
  const existingResponse = await prisma_default.donorResponse.findFirst({
    where: {
      requestId,
      OR: [
        { donorId: donorOrResponseId },
        { id: donorOrResponseId }
      ]
    }
  });
  if (!existingResponse) {
    throw new AppError_default(
      httpStatus10.NOT_FOUND,
      "Donor response not found for this request"
    );
  }
  if (existingResponse.status === "DONATED") {
    throw new AppError_default(
      httpStatus10.BAD_REQUEST,
      "Donation has already been completed for this donor"
    );
  }
  const updatedResponse = await prisma_default.donorResponse.update({
    where: {
      id: existingResponse.id
    },
    data: {
      status: "CONFIRMED"
    },
    include: {
      donor: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          donorProfile: true
        }
      }
    }
  });
  await prisma_default.bloodRequest.update({
    where: { id: requestId },
    data: {
      status: "FULFILLED",
      unitsFulfilled: request.units
    }
  });
  try {
    await prisma_default.notification.create({
      data: {
        userId: existingResponse.donorId,
        requestId: request.id,
        type: "RESPONSE_CONFIRMED",
        title: "Donation Offer Approved! \u{1FA78}",
        message: `${request.requester.name} has approved and confirmed your blood donation offer for ${request.hospitalName}. Please coordinate via emergency hotline: ${request.contactPhone}.`
      }
    });
  } catch (err) {
    console.error("Failed to notify donor of confirmed response:", err);
  }
  return updatedResponse;
};
var completeDonation = async (requestId, userId, userRole, payload) => {
  const request = await prisma_default.bloodRequest.findUnique({
    where: { id: requestId }
  });
  if (!request || request.deletedAt) {
    throw new AppError_default(httpStatus10.NOT_FOUND, "Blood request not found");
  }
  if (["CANCELLED", "EXPIRED"].includes(request.status)) {
    throw new AppError_default(
      httpStatus10.BAD_REQUEST,
      `Cannot complete donation on a ${request.status.toLowerCase()} request`
    );
  }
  const isCreator = request.requesterId === userId;
  const isAdmin = userRole === "ADMIN";
  if (!isCreator && !isAdmin) {
    throw new AppError_default(
      httpStatus10.FORBIDDEN,
      "Only the request creator or Admin can mark a donation as completed"
    );
  }
  const donationTime = payload.donatedAt ? new Date(payload.donatedAt) : /* @__PURE__ */ new Date();
  const donatedUnits = payload.units || 1;
  const newUnitsFulfilled = request.unitsFulfilled + donatedUnits;
  const nextStatus = newUnitsFulfilled >= request.units ? "FULFILLED" : "PARTIALLY_FULFILLED";
  const result = await prisma_default.$transaction(async (tx) => {
    const donation = await tx.donation.create({
      data: {
        requestId,
        donorId: payload.donorId,
        donatedAt: donationTime
      }
    });
    await tx.donorResponse.upsert({
      where: {
        requestId_donorId: {
          requestId,
          donorId: payload.donorId
        }
      },
      update: {
        status: "DONATED"
      },
      create: {
        requestId,
        donorId: payload.donorId,
        status: "DONATED"
      }
    });
    const updatedRequest = await tx.bloodRequest.update({
      where: { id: requestId },
      data: {
        unitsFulfilled: newUnitsFulfilled,
        status: nextStatus
      }
    });
    await tx.donorProfile.updateMany({
      where: { userId: payload.donorId },
      data: {
        lastDonationDate: donationTime,
        totalDonations: { increment: donatedUnits }
      }
    });
    await tx.notification.create({
      data: {
        userId: payload.donorId,
        requestId,
        type: "RESPONSE_CONFIRMED",
        title: "Donation Completed! \u{1F389}",
        message: `Your donation of ${donatedUnits} unit(s) for request #${requestId.slice(0, 8)} has been confirmed. Thank you for saving a life!`
      }
    });
    return { donation, updatedRequest };
  });
  await deleteCacheByPattern("donors:*");
  return result;
};
var BloodRequestService = {
  createBloodRequest,
  getAllBloodRequests,
  getMyBloodRequests,
  getBloodRequestById,
  updateBloodRequest,
  deleteBloodRequest,
  updateRequestStatus,
  respondToRequest,
  getResponsesForRequest,
  confirmDonorResponse,
  completeDonation
};
var bloodRequest_service_default = BloodRequestService;

// src/modules/bloodRequest/bloodRequest.controller.ts
var createBloodRequest2 = catchAsync_default(
  async (req, res) => {
    const userId = req.user.id;
    const result = await bloodRequest_service_default.createBloodRequest(userId, req.body);
    sendResponse_default(res, {
      statusCode: httpStatus11.CREATED,
      success: true,
      message: "Blood request created successfully",
      data: result
    });
  }
);
var getAllBloodRequests2 = catchAsync_default(
  async (req, res) => {
    const result = await bloodRequest_service_default.getAllBloodRequests(req.query);
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Blood requests fetched successfully",
      meta: result.meta,
      data: result.requests
    });
  }
);
var getMyBloodRequests2 = catchAsync_default(
  async (req, res) => {
    const userId = req.user.id;
    const result = await bloodRequest_service_default.getMyBloodRequests(userId);
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "My blood requests fetched successfully",
      data: result
    });
  }
);
var getBloodRequestById2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const result = await bloodRequest_service_default.getBloodRequestById(id);
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Blood request details fetched successfully",
      data: result
    });
  }
);
var updateBloodRequest2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await bloodRequest_service_default.updateBloodRequest(
      id,
      userId,
      userRole,
      req.body
    );
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Blood request updated successfully",
      data: result
    });
  }
);
var deleteBloodRequest2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    await bloodRequest_service_default.deleteBloodRequest(id, userId, userRole);
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Blood request deleted successfully",
      data: null
    });
  }
);
var updateRequestStatus2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await bloodRequest_service_default.updateRequestStatus(
      id,
      userId,
      userRole,
      req.body.status
    );
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Request status updated successfully",
      data: result
    });
  }
);
var respondToRequest2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const donorId = req.user.id;
    const result = await bloodRequest_service_default.respondToRequest(
      id,
      donorId,
      req.body
    );
    sendResponse_default(res, {
      statusCode: httpStatus11.CREATED,
      success: true,
      message: "Response submitted successfully",
      data: result
    });
  }
);
var getResponsesForRequest2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await bloodRequest_service_default.getResponsesForRequest(
      id,
      userId,
      userRole
    );
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Responses fetched successfully",
      data: result
    });
  }
);
var confirmResponse = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const donorId = req.params.donorId || req.body.donorId || req.body.responseId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await bloodRequest_service_default.confirmDonorResponse(
      id,
      donorId,
      userId,
      userRole
    );
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Donor response confirmed successfully",
      data: result
    });
  }
);
var completeDonation2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await bloodRequest_service_default.completeDonation(
      id,
      userId,
      userRole,
      req.body
    );
    sendResponse_default(res, {
      statusCode: httpStatus11.OK,
      success: true,
      message: "Donation completed successfully",
      data: result
    });
  }
);
var BloodRequestController = {
  createBloodRequest: createBloodRequest2,
  getAllBloodRequests: getAllBloodRequests2,
  getMyBloodRequests: getMyBloodRequests2,
  getBloodRequestById: getBloodRequestById2,
  updateBloodRequest: updateBloodRequest2,
  deleteBloodRequest: deleteBloodRequest2,
  updateRequestStatus: updateRequestStatus2,
  respondToRequest: respondToRequest2,
  getResponsesForRequest: getResponsesForRequest2,
  confirmResponse,
  completeDonation: completeDonation2
};
var bloodRequest_controller_default = BloodRequestController;

// src/modules/bloodRequest/bloodRequest.validation.ts
import { z as z3 } from "zod";
var bloodGroupEnum2 = z3.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE"
]);
var urgencyEnum = z3.enum(["NORMAL", "URGENT", "CRITICAL"]);
var requestStatusEnum = z3.enum([
  "OPEN",
  "PARTIALLY_FULFILLED",
  "FULFILLED",
  "CANCELLED",
  "EXPIRED"
]);
var createBloodRequestSchema = z3.object({
  body: z3.object({
    patientName: z3.string().optional(),
    bloodGroup: bloodGroupEnum2,
    units: z3.number().int().min(1, "At least 1 unit is required"),
    hospitalName: z3.string().min(2, "Hospital name is required"),
    district: z3.string().min(2, "District is required"),
    upazila: z3.string().optional(),
    contactPhone: z3.string().min(6, "Contact phone is required"),
    note: z3.string().optional(),
    urgency: urgencyEnum.optional(),
    neededBy: z3.string(),
    organizationId: z3.string().optional()
  })
});
var updateBloodRequestSchema = z3.object({
  body: z3.object({
    patientName: z3.string().optional(),
    bloodGroup: bloodGroupEnum2.optional(),
    units: z3.number().int().min(1).optional(),
    hospitalName: z3.string().min(2).optional(),
    district: z3.string().min(2).optional(),
    upazila: z3.string().optional(),
    contactPhone: z3.string().min(6).optional(),
    note: z3.string().optional(),
    urgency: urgencyEnum.optional(),
    neededBy: z3.string().optional(),
    organizationId: z3.string().optional()
  })
});
var updateRequestStatusSchema = z3.object({
  body: z3.object({
    status: requestStatusEnum
  })
});
var donorRespondSchema = z3.object({
  body: z3.object({
    status: z3.enum(["AVAILABLE", "UNABLE"]).default("AVAILABLE"),
    message: z3.string().optional(),
    phone: z3.string().optional()
  })
});
var completeDonationSchema = z3.object({
  body: z3.object({
    donorId: z3.string().min(1, "Donor ID is required"),
    units: z3.number().int().min(1).default(1),
    donatedAt: z3.string().optional()
  })
});
var BloodRequestValidation = {
  createBloodRequestSchema,
  updateBloodRequestSchema,
  updateRequestStatusSchema,
  donorRespondSchema,
  completeDonationSchema
};
var bloodRequest_validation_default = BloodRequestValidation;

// src/modules/bloodRequest/bloodRequest.route.ts
var router3 = Router3();
router3.post(
  "/",
  auth_default(),
  rateLimit_default({
    keyPrefix: "create_request",
    maxRequests: 20,
    windowSeconds: 60 * 60,
    message: "Too many blood requests created. Please try again later."
  }),
  validate_default(bloodRequest_validation_default.createBloodRequestSchema),
  bloodRequest_controller_default.createBloodRequest
);
router3.get("/", bloodRequest_controller_default.getAllBloodRequests);
router3.get("/my-requests", auth_default(), bloodRequest_controller_default.getMyBloodRequests);
router3.get("/:id", bloodRequest_controller_default.getBloodRequestById);
router3.patch(
  "/:id",
  auth_default(),
  validate_default(bloodRequest_validation_default.updateBloodRequestSchema),
  bloodRequest_controller_default.updateBloodRequest
);
router3.delete("/:id", auth_default(), bloodRequest_controller_default.deleteBloodRequest);
router3.post(
  "/:id/respond",
  auth_default(),
  validate_default(bloodRequest_validation_default.donorRespondSchema),
  bloodRequest_controller_default.respondToRequest
);
router3.get("/:id/responses", auth_default(), bloodRequest_controller_default.getResponsesForRequest);
router3.patch(
  "/:id/responses/:donorId/confirm",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.post(
  "/:id/responses/:donorId/confirm",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.patch(
  "/:id/responses/:donorId/approve",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.post(
  "/:id/responses/:donorId/approve",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.patch(
  "/:id/confirm-response",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.post(
  "/:id/confirm-response",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.patch(
  "/:id/confirm-response/:donorId",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.post(
  "/:id/confirm-response/:donorId",
  auth_default(),
  bloodRequest_controller_default.confirmResponse
);
router3.patch(
  "/:id/status",
  auth_default(),
  validate_default(bloodRequest_validation_default.updateRequestStatusSchema),
  bloodRequest_controller_default.updateRequestStatus
);
router3.post(
  "/:id/complete-donation",
  auth_default(),
  validate_default(bloodRequest_validation_default.completeDonationSchema),
  bloodRequest_controller_default.completeDonation
);
var BloodRequestRoutes = router3;

// src/modules/camp/camp.route.ts
import { Router as Router4 } from "express";

// src/modules/camp/camp.controller.ts
import httpStatus13 from "http-status";

// src/modules/camp/camp.service.ts
import httpStatus12 from "http-status";
var createCamp = async (userId, userRole, payload) => {
  const organization = await prisma_default.organization.findUnique({
    where: { id: payload.organizationId },
    include: {
      members: {
        where: { userId }
      }
    }
  });
  if (!organization) {
    throw new AppError_default(httpStatus12.NOT_FOUND, "Organization not found");
  }
  if (organization.verificationStatus !== "APPROVED" && userRole !== "ADMIN") {
    throw new AppError_default(
      httpStatus12.FORBIDDEN,
      "Only approved and verified organizations can organize donation camps"
    );
  }
  const isOwner = organization.ownerId === userId;
  const isMember = organization.members.length > 0;
  const isAdmin = userRole === "ADMIN";
  if (!isOwner && !isMember && !isAdmin) {
    throw new AppError_default(
      httpStatus12.FORBIDDEN,
      "You are not affiliated with this organization"
    );
  }
  const camp = await prisma_default.donationCamp.create({
    data: {
      organizationId: payload.organizationId,
      title: payload.title,
      description: payload.description,
      venue: payload.venue,
      district: payload.district,
      date: new Date(payload.date),
      status: "UPCOMING"
    },
    include: {
      organization: {
        select: { id: true, name: true, contactPhone: true }
      }
    }
  });
  return camp;
};
var getAllCamps = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereClause = {};
  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive"
    };
  }
  if (query.status) {
    whereClause.status = query.status;
  }
  if (query.organizationId) {
    whereClause.organizationId = query.organizationId;
  }
  const [camps, total] = await Promise.all([
    prisma_default.donationCamp.findMany({
      where: whereClause,
      include: {
        organization: {
          select: { id: true, name: true, district: true, contactPhone: true }
        },
        _count: {
          select: { registrations: true, donations: true }
        }
      },
      skip,
      take: limit,
      orderBy: { date: "asc" }
    }),
    prisma_default.donationCamp.count({ where: whereClause })
  ]);
  return {
    camps,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getCampById = async (id) => {
  const camp = await prisma_default.donationCamp.findUnique({
    where: { id },
    include: {
      organization: true,
      registrations: {
        include: {
          user: {
            select: { id: true, name: true, email: true, phone: true }
          }
        }
      },
      donations: {
        include: {
          donor: {
            select: { id: true, name: true }
          }
        }
      }
    }
  });
  if (!camp) {
    throw new AppError_default(httpStatus12.NOT_FOUND, "Donation camp not found");
  }
  return camp;
};
var registerForCamp = async (campId, userId) => {
  const camp = await prisma_default.donationCamp.findUnique({
    where: { id: campId }
  });
  if (!camp) {
    throw new AppError_default(httpStatus12.NOT_FOUND, "Donation camp not found");
  }
  if (camp.status === "COMPLETED" || camp.status === "CANCELLED") {
    throw new AppError_default(
      httpStatus12.BAD_REQUEST,
      `Cannot register for a ${camp.status.toLowerCase()} camp`
    );
  }
  const existing = await prisma_default.campRegistration.findUnique({
    where: {
      campId_userId: {
        campId,
        userId
      }
    }
  });
  if (existing) {
    throw new AppError_default(
      httpStatus12.CONFLICT,
      "You are already registered for this donation camp"
    );
  }
  const registration = await prisma_default.campRegistration.create({
    data: {
      campId,
      userId,
      attendance: "REGISTERED"
    },
    include: {
      camp: true
    }
  });
  try {
    await prisma_default.notification.create({
      data: {
        userId,
        type: "CAMP_UPDATE",
        title: "Camp Registration Confirmed",
        message: `You are registered for "${camp.title}" at ${camp.venue} on ${camp.date.toDateString()}.`
      }
    });
  } catch (err) {
    console.error("Failed to send camp notification:", err);
  }
  return registration;
};
var updateCampStatus = async (campId, userId, userRole, status) => {
  const camp = await prisma_default.donationCamp.findUnique({
    where: { id: campId },
    include: {
      organization: {
        include: { members: { where: { userId } } }
      }
    }
  });
  if (!camp) {
    throw new AppError_default(httpStatus12.NOT_FOUND, "Donation camp not found");
  }
  const isOwner = camp.organization.ownerId === userId;
  const isMember = camp.organization.members.length > 0;
  const isAdmin = userRole === "ADMIN";
  if (!isOwner && !isMember && !isAdmin) {
    throw new AppError_default(
      httpStatus12.FORBIDDEN,
      "You do not have permission to change this camp's status"
    );
  }
  const updatedCamp = await prisma_default.donationCamp.update({
    where: { id: campId },
    data: { status }
  });
  return updatedCamp;
};
var CampService = {
  createCamp,
  getAllCamps,
  getCampById,
  registerForCamp,
  updateCampStatus
};
var camp_service_default = CampService;

// src/modules/camp/camp.controller.ts
var createCamp2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;
  const result = await camp_service_default.createCamp(userId, userRole, req.body);
  sendResponse_default(res, {
    statusCode: httpStatus13.CREATED,
    success: true,
    message: "Donation camp created successfully",
    data: result
  });
});
var getAllCamps2 = catchAsync_default(async (req, res) => {
  const result = await camp_service_default.getAllCamps(req.query);
  sendResponse_default(res, {
    statusCode: httpStatus13.OK,
    success: true,
    message: "Donation camps fetched successfully",
    meta: result.meta,
    data: result.camps
  });
});
var getCampById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await camp_service_default.getCampById(id);
  sendResponse_default(res, {
    statusCode: httpStatus13.OK,
    success: true,
    message: "Donation camp details fetched successfully",
    data: result
  });
});
var registerForCamp2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await camp_service_default.registerForCamp(id, userId);
    sendResponse_default(res, {
      statusCode: httpStatus13.CREATED,
      success: true,
      message: "Successfully registered for donation camp",
      data: result
    });
  }
);
var updateCampStatus2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await camp_service_default.updateCampStatus(
      id,
      userId,
      userRole,
      req.body.status
    );
    sendResponse_default(res, {
      statusCode: httpStatus13.OK,
      success: true,
      message: "Camp status updated successfully",
      data: result
    });
  }
);
var CampController = {
  createCamp: createCamp2,
  getAllCamps: getAllCamps2,
  getCampById: getCampById2,
  registerForCamp: registerForCamp2,
  updateCampStatus: updateCampStatus2
};
var camp_controller_default = CampController;

// src/modules/camp/camp.validation.ts
import { z as z4 } from "zod";
var campStatusEnum = z4.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]);
var attendanceStatusEnum = z4.enum(["REGISTERED", "ATTENDED", "MISSED"]);
var createCampSchema = z4.object({
  body: z4.object({
    organizationId: z4.string().min(1, "Organization ID is required"),
    title: z4.string().min(3, "Camp title is required"),
    description: z4.string().optional(),
    venue: z4.string().min(3, "Venue is required"),
    district: z4.string().min(2, "District is required"),
    date: z4.string().min(1, "Date is required")
  })
});
var updateCampStatusSchema = z4.object({
  body: z4.object({
    status: campStatusEnum
  })
});
var updateAttendanceSchema = z4.object({
  body: z4.object({
    userId: z4.string().min(1, "User ID is required"),
    attendance: attendanceStatusEnum
  })
});
var CampValidation = {
  createCampSchema,
  updateCampStatusSchema,
  updateAttendanceSchema
};
var camp_validation_default = CampValidation;

// src/modules/camp/camp.route.ts
var router4 = Router4();
router4.post(
  "/",
  auth_default(),
  validate_default(camp_validation_default.createCampSchema),
  camp_controller_default.createCamp
);
router4.get("/", camp_controller_default.getAllCamps);
router4.get("/:id", camp_controller_default.getCampById);
router4.post("/:id/register", auth_default(), camp_controller_default.registerForCamp);
router4.patch(
  "/:id/status",
  auth_default(),
  validate_default(camp_validation_default.updateCampStatusSchema),
  camp_controller_default.updateCampStatus
);
var CampRoutes = router4;

// src/modules/donor/donor.route.ts
import { Router as Router5 } from "express";

// src/modules/user/user.controller.ts
import httpStatus15 from "http-status";

// src/modules/user/user.service.ts
import httpStatus14 from "http-status";
var getMyProfile = async (userId) => {
  const user = await prisma_default.user.findUnique({
    where: { id: userId },
    include: {
      donorProfile: true,
      ownedOrganizations: true,
      organizationMembers: {
        include: {
          organization: true
        }
      },
      _count: {
        select: {
          donations: true,
          requestsMade: true,
          donorResponses: true
        }
      }
    }
  });
  if (!user) {
    throw new AppError_default(httpStatus14.NOT_FOUND, "User profile not found");
  }
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword;
};
var updateMyProfile = async (userId, payload) => {
  const result = await prisma_default.$transaction(async (tx) => {
    const updatedUser = await tx.user.update({
      where: { id: userId },
      data: {
        name: payload.name,
        phone: payload.phone,
        avatar: payload.avatar
      }
    });
    if (payload.bloodGroup !== void 0 || payload.district !== void 0 || payload.upazila !== void 0 || payload.bio !== void 0 || payload.isAvailable !== void 0 || payload.lastDonationDate !== void 0) {
      const existingProfile = await tx.donorProfile.findUnique({
        where: { userId }
      });
      if (existingProfile) {
        await tx.donorProfile.update({
          where: { userId },
          data: {
            bloodGroup: payload.bloodGroup,
            district: payload.district,
            upazila: payload.upazila,
            bio: payload.bio,
            isAvailable: payload.isAvailable,
            lastDonationDate: payload.lastDonationDate ? new Date(payload.lastDonationDate) : void 0
          }
        });
      } else if (payload.bloodGroup && payload.district) {
        await tx.donorProfile.create({
          data: {
            userId,
            bloodGroup: payload.bloodGroup,
            district: payload.district,
            upazila: payload.upazila,
            bio: payload.bio,
            isAvailable: payload.isAvailable ?? true,
            lastDonationDate: payload.lastDonationDate ? new Date(payload.lastDonationDate) : void 0
          }
        });
      }
    }
    return tx.user.findUnique({
      where: { id: userId },
      include: {
        donorProfile: true
      }
    });
  });
  await deleteCacheByPattern("donors:*");
  if (!result) {
    throw new AppError_default(httpStatus14.NOT_FOUND, "User not found");
  }
  const { password, ...userWithoutPassword } = result;
  return userWithoutPassword;
};
var updateDonorAvailability = async (userId, payload) => {
  const existingProfile = await prisma_default.donorProfile.findUnique({
    where: { userId }
  });
  if (!existingProfile) {
    throw new AppError_default(
      httpStatus14.NOT_FOUND,
      "Donor profile not found. Please setup your donor profile first."
    );
  }
  const updatedProfile = await prisma_default.donorProfile.update({
    where: { userId },
    data: {
      isAvailable: payload.isAvailable,
      lastDonationDate: payload.lastDonationDate ? new Date(payload.lastDonationDate) : void 0
    }
  });
  await deleteCacheByPattern("donors:*");
  return updatedProfile;
};
var UserService = {
  getMyProfile,
  updateMyProfile,
  updateDonorAvailability
};
var user_service_default = UserService;

// src/modules/user/user.controller.ts
var getMyProfile2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await user_service_default.getMyProfile(userId);
  sendResponse_default(res, {
    statusCode: httpStatus15.OK,
    success: true,
    message: "User profile fetched successfully",
    data: result
  });
});
var updateMyProfile2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const payload = { ...req.body };
  if (req.file) {
    payload.avatar = `${config_default.backend_url}/uploads/avatars/${req.file.filename}`;
  }
  const result = await user_service_default.updateMyProfile(userId, payload);
  sendResponse_default(res, {
    statusCode: httpStatus15.OK,
    success: true,
    message: "User profile updated successfully",
    data: result
  });
});
var uploadAvatar = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  if (!req.file) {
    throw new AppError_default(
      httpStatus15.BAD_REQUEST,
      "Please provide an image file with key 'avatar'"
    );
  }
  const avatarUrl = `${config_default.backend_url}/uploads/avatars/${req.file.filename}`;
  const result = await user_service_default.updateMyProfile(userId, { avatar: avatarUrl });
  sendResponse_default(res, {
    statusCode: httpStatus15.OK,
    success: true,
    message: "HD profile picture uploaded successfully",
    data: {
      avatarUrl,
      user: result
    }
  });
});
var updateDonorAvailability2 = catchAsync_default(
  async (req, res) => {
    const userId = req.user.id;
    const result = await user_service_default.updateDonorAvailability(userId, req.body);
    sendResponse_default(res, {
      statusCode: httpStatus15.OK,
      success: true,
      message: "Donor availability updated successfully",
      data: result
    });
  }
);
var UserController = {
  getMyProfile: getMyProfile2,
  updateMyProfile: updateMyProfile2,
  uploadAvatar,
  updateDonorAvailability: updateDonorAvailability2
};
var user_controller_default = UserController;

// src/modules/user/user.validation.ts
import { z as z5 } from "zod";
var bloodGroupEnum3 = z5.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE"
]);
var updateUserProfileSchema = z5.object({
  body: z5.object({
    name: z5.string().min(2).optional(),
    phone: z5.string().optional(),
    avatar: z5.string().optional(),
    bloodGroup: bloodGroupEnum3.optional(),
    district: z5.string().optional(),
    upazila: z5.string().optional(),
    bio: z5.string().max(500).optional(),
    isAvailable: z5.union([
      z5.boolean(),
      z5.string().transform((val) => val === "true" || val === "1")
    ]).optional(),
    lastDonationDate: z5.union([z5.string(), z5.date()]).optional()
  })
});
var toggleDonorAvailabilitySchema = z5.object({
  body: z5.object({
    isAvailable: z5.union([
      z5.boolean(),
      z5.string().transform((val) => val === "true" || val === "1")
    ]),
    lastDonationDate: z5.union([z5.string(), z5.date()]).optional()
  })
});
var UserValidation = {
  updateUserProfileSchema,
  toggleDonorAvailabilitySchema
};
var user_validation_default = UserValidation;

// src/modules/donor/donor.controller.ts
import httpStatus17 from "http-status";

// src/modules/donor/donor.service.ts
import httpStatus16 from "http-status";
var getAllDonors = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const bgKey = query.bloodGroup || "all";
  const distKey = query.district?.toLowerCase().trim() || "all";
  const cacheKey = `donors:${bgKey}:${distKey}:${page}`;
  const cachedData = await getCache(cacheKey);
  if (cachedData) {
    return cachedData;
  }
  const whereClause = {
    user: {
      deletedAt: null,
      status: "ACTIVE"
    }
  };
  const sixMonthsAgo = /* @__PURE__ */ new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  whereClause.OR = [
    { lastDonationDate: null },
    { lastDonationDate: { lte: sixMonthsAgo } }
  ];
  if (query.bloodGroup) {
    whereClause.bloodGroup = query.bloodGroup;
  }
  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive"
    };
  }
  if (query.upazila) {
    whereClause.upazila = {
      contains: query.upazila,
      mode: "insensitive"
    };
  }
  if (query.isAvailable !== void 0) {
    whereClause.isAvailable = query.isAvailable;
  }
  const [donors, total] = await Promise.all([
    prisma_default.donorProfile.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true,
            isVerified: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: query.sortBy ? { [query.sortBy]: query.sortOrder || "desc" } : { isAvailable: "desc" }
    }),
    prisma_default.donorProfile.count({ where: whereClause })
  ]);
  const result = {
    donors,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
  await setCache(cacheKey, result, 600);
  return result;
};
var getDonorById = async (id) => {
  const donor = await prisma_default.donorProfile.findFirst({
    where: {
      OR: [{ id }, { userId: id }],
      user: {
        deletedAt: null,
        status: "ACTIVE"
      }
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
          reviewsReceived: {
            include: {
              reviewer: {
                select: { id: true, name: true, avatar: true }
              }
            }
          }
        }
      }
    }
  });
  if (!donor) {
    throw new AppError_default(httpStatus16.NOT_FOUND, "Donor profile not found");
  }
  const sixMonthsAgo = /* @__PURE__ */ new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  if (donor.lastDonationDate && donor.lastDonationDate > sixMonthsAgo) {
    throw new AppError_default(
      httpStatus16.FORBIDDEN,
      "This donor is currently within the 6-month recovery period and cannot donate blood at this time."
    );
  }
  return donor;
};
var DonorService = {
  getAllDonors,
  getDonorById
};
var donor_service_default = DonorService;

// src/modules/donor/donor.controller.ts
var getAllDonors2 = catchAsync_default(async (req, res) => {
  const result = await donor_service_default.getAllDonors(req.query);
  sendResponse_default(res, {
    statusCode: httpStatus17.OK,
    success: true,
    message: "Donors retrieved successfully",
    meta: result.meta,
    data: result.donors
  });
});
var getDonorById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const result = await donor_service_default.getDonorById(id);
  sendResponse_default(res, {
    statusCode: httpStatus17.OK,
    success: true,
    message: "Donor details retrieved successfully",
    data: result
  });
});
var DonorController = {
  getAllDonors: getAllDonors2,
  getDonorById: getDonorById2
};
var donor_controller_default = DonorController;

// src/modules/donor/donor.validation.ts
import { z as z6 } from "zod";
var bloodGroupEnum4 = z6.enum([
  "A_POSITIVE",
  "A_NEGATIVE",
  "B_POSITIVE",
  "B_NEGATIVE",
  "AB_POSITIVE",
  "AB_NEGATIVE",
  "O_POSITIVE",
  "O_NEGATIVE"
]);
var donorFilterValidationSchema = z6.object({
  query: z6.object({
    bloodGroup: bloodGroupEnum4.optional(),
    district: z6.string().optional(),
    upazila: z6.string().optional(),
    isAvailable: z6.string().optional().transform((val) => val === void 0 ? void 0 : val === "true"),
    page: z6.string().optional().transform((val) => val ? Number.parseInt(val, 10) : 1),
    limit: z6.string().optional().transform((val) => val ? Number.parseInt(val, 10) : 10),
    sortBy: z6.string().optional(),
    sortOrder: z6.enum(["asc", "desc"]).optional()
  })
});
var DonorValidation = {
  donorFilterValidationSchema
};
var donor_validation_default = DonorValidation;

// src/modules/donor/donor.route.ts
var router5 = Router5();
router5.patch(
  "/me/availability",
  auth_default(),
  validate_default(user_validation_default.toggleDonorAvailabilitySchema),
  user_controller_default.updateDonorAvailability
);
router5.get(
  "/",
  validate_default(donor_validation_default.donorFilterValidationSchema),
  donor_controller_default.getAllDonors
);
router5.get("/:id", donor_controller_default.getDonorById);
var DonorRoutes = router5;

// src/modules/notification/notification.route.ts
import { Router as Router6 } from "express";

// src/modules/notification/notification.controller.ts
import httpStatus19 from "http-status";

// src/modules/notification/notification.service.ts
import httpStatus18 from "http-status";
var getMyNotifications = async (userId, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 20;
  const skip = (page - 1) * limit;
  const whereClause = {
    userId
  };
  if (query.unreadOnly) {
    whereClause.isRead = false;
  }
  const [notifications, total, unreadCount] = await Promise.all([
    prisma_default.notification.findMany({
      where: whereClause,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma_default.notification.count({ where: whereClause }),
    prisma_default.notification.count({
      where: { userId, isRead: false }
    })
  ]);
  return {
    notifications,
    unreadCount,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var markNotificationAsRead = async (id, userId) => {
  const notification = await prisma_default.notification.findUnique({
    where: { id }
  });
  if (!notification) {
    throw new AppError_default(httpStatus18.NOT_FOUND, "Notification not found");
  }
  if (notification.userId !== userId) {
    throw new AppError_default(
      httpStatus18.FORBIDDEN,
      "You do not have access to this notification"
    );
  }
  const updated = await prisma_default.notification.update({
    where: { id },
    data: {
      isRead: true,
      readAt: /* @__PURE__ */ new Date()
    }
  });
  return updated;
};
var markAllNotificationsAsRead = async (userId) => {
  const result = await prisma_default.notification.updateMany({
    where: {
      userId,
      isRead: false
    },
    data: {
      isRead: true,
      readAt: /* @__PURE__ */ new Date()
    }
  });
  return result;
};
var NotificationService = {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
};
var notification_service_default = NotificationService;

// src/modules/notification/notification.controller.ts
var getMyNotifications2 = catchAsync_default(
  async (req, res) => {
    const userId = req.user.id;
    const result = await notification_service_default.getMyNotifications(userId, {
      page: req.query.page ? Number(req.query.page) : void 0,
      limit: req.query.limit ? Number(req.query.limit) : void 0,
      unreadOnly: req.query.unreadOnly === "true"
    });
    sendResponse_default(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "Notifications fetched successfully",
      meta: result.meta,
      data: {
        notifications: result.notifications,
        unreadCount: result.unreadCount
      }
    });
  }
);
var markNotificationAsRead2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const result = await notification_service_default.markNotificationAsRead(
      id,
      userId
    );
    sendResponse_default(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "Notification marked as read",
      data: result
    });
  }
);
var markAllNotificationsAsRead2 = catchAsync_default(
  async (req, res) => {
    const userId = req.user.id;
    const result = await notification_service_default.markAllNotificationsAsRead(userId);
    sendResponse_default(res, {
      statusCode: httpStatus19.OK,
      success: true,
      message: "All notifications marked as read",
      data: result
    });
  }
);
var NotificationController = {
  getMyNotifications: getMyNotifications2,
  markNotificationAsRead: markNotificationAsRead2,
  markAllNotificationsAsRead: markAllNotificationsAsRead2
};
var notification_controller_default = NotificationController;

// src/modules/notification/notification.route.ts
var router6 = Router6();
router6.get("/", auth_default(), notification_controller_default.getMyNotifications);
router6.patch("/read-all", auth_default(), notification_controller_default.markAllNotificationsAsRead);
router6.patch("/:id/read", auth_default(), notification_controller_default.markNotificationAsRead);
var NotificationRoutes = router6;

// src/modules/organization/organization.route.ts
import { Router as Router7 } from "express";

// src/modules/organization/organization.controller.ts
import httpStatus21 from "http-status";

// src/modules/organization/organization.service.ts
import httpStatus20 from "http-status";
var applyOrganization = async (userId, payload) => {
  const existingOrg = await prisma_default.organization.findFirst({
    where: { name: { equals: payload.name, mode: "insensitive" } }
  });
  if (existingOrg) {
    throw new AppError_default(
      httpStatus20.CONFLICT,
      "An organization with this name already exists"
    );
  }
  const organization = await prisma_default.$transaction(async (tx) => {
    const org = await tx.organization.create({
      data: {
        name: payload.name,
        type: payload.type || "HOSPITAL",
        address: payload.address,
        district: payload.district,
        upazila: payload.upazila,
        contactPhone: payload.contactPhone,
        email: payload.email,
        verificationStatus: "PENDING",
        ownerId: userId
      }
    });
    await tx.organizationMember.create({
      data: {
        organizationId: org.id,
        userId,
        roleInOrg: "ADMIN"
      }
    });
    await tx.auditLog.create({
      data: {
        actorId: userId,
        action: "ORGANIZATION_APPLICATION_SUBMITTED",
        targetType: "Organization",
        targetId: org.id,
        details: { name: org.name, type: org.type, district: org.district }
      }
    });
    return org;
  });
  return organization;
};
var getAllOrganizations = async (query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const whereClause = {};
  if (query.verificationStatus) {
    whereClause.verificationStatus = query.verificationStatus;
  }
  if (query.type) {
    whereClause.type = query.type;
  }
  if (query.district) {
    whereClause.district = {
      contains: query.district,
      mode: "insensitive"
    };
  }
  const [organizations, total] = await Promise.all([
    prisma_default.organization.findMany({
      where: whereClause,
      include: {
        owner: {
          select: { id: true, name: true, email: true }
        },
        _count: {
          select: { members: true, camps: true, coordinatedRequests: true }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma_default.organization.count({ where: whereClause })
  ]);
  return {
    organizations,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var getOrganizationById = async (id) => {
  const organization = await prisma_default.organization.findUnique({
    where: { id },
    include: {
      owner: {
        select: { id: true, name: true, email: true, phone: true }
      },
      members: {
        include: {
          user: {
            select: { id: true, name: true, email: true, avatar: true }
          }
        }
      },
      camps: {
        orderBy: { date: "desc" },
        take: 5
      },
      coordinatedRequests: {
        orderBy: { createdAt: "desc" },
        take: 5
      },
      _count: {
        select: { members: true, camps: true, coordinatedRequests: true }
      }
    }
  });
  if (!organization) {
    throw new AppError_default(httpStatus20.NOT_FOUND, "Organization not found");
  }
  return organization;
};
var updateOrganization = async (id, userId, userRole, payload) => {
  const organization = await prisma_default.organization.findUnique({
    where: { id },
    include: {
      members: {
        where: { userId, roleInOrg: "ADMIN" }
      }
    }
  });
  if (!organization) {
    throw new AppError_default(httpStatus20.NOT_FOUND, "Organization not found");
  }
  const isOwner = organization.ownerId === userId;
  const isOrgAdmin = organization.members.length > 0;
  const isSystemAdmin = userRole === "ADMIN";
  if (!isOwner && !isOrgAdmin && !isSystemAdmin) {
    throw new AppError_default(
      httpStatus20.FORBIDDEN,
      "You do not have permission to manage this organization"
    );
  }
  const updated = await prisma_default.organization.update({
    where: { id },
    data: payload
  });
  return updated;
};
var OrganizationService = {
  applyOrganization,
  getAllOrganizations,
  getOrganizationById,
  updateOrganization
};
var organization_service_default = OrganizationService;

// src/modules/organization/organization.controller.ts
var applyOrganization2 = catchAsync_default(
  async (req, res) => {
    const userId = req.user.id;
    const result = await organization_service_default.applyOrganization(userId, req.body);
    sendResponse_default(res, {
      statusCode: httpStatus21.CREATED,
      success: true,
      message: "Organization application submitted successfully. It will be reviewed by admin.",
      data: result
    });
  }
);
var getAllOrganizations2 = catchAsync_default(
  async (req, res) => {
    const result = await organization_service_default.getAllOrganizations(req.query);
    sendResponse_default(res, {
      statusCode: httpStatus21.OK,
      success: true,
      message: "Organizations fetched successfully",
      meta: result.meta,
      data: result.organizations
    });
  }
);
var getOrganizationById2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const result = await organization_service_default.getOrganizationById(id);
    sendResponse_default(res, {
      statusCode: httpStatus21.OK,
      success: true,
      message: "Organization details fetched successfully",
      data: result
    });
  }
);
var updateOrganization2 = catchAsync_default(
  async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const result = await organization_service_default.updateOrganization(
      id,
      userId,
      userRole,
      req.body
    );
    sendResponse_default(res, {
      statusCode: httpStatus21.OK,
      success: true,
      message: "Organization updated successfully",
      data: result
    });
  }
);
var OrganizationController = {
  applyOrganization: applyOrganization2,
  getAllOrganizations: getAllOrganizations2,
  getOrganizationById: getOrganizationById2,
  updateOrganization: updateOrganization2
};
var organization_controller_default = OrganizationController;

// src/modules/organization/organization.validation.ts
import { z as z7 } from "zod";
var orgTypeEnum = z7.enum(["HOSPITAL", "BLOOD_BANK", "VOLUNTEER_GROUP"]);
var applyOrganizationSchema = z7.object({
  body: z7.object({
    name: z7.string().min(2, "Organization name is required"),
    type: orgTypeEnum.default("HOSPITAL"),
    address: z7.string().min(3, "Address is required"),
    district: z7.string().min(2, "District is required"),
    upazila: z7.string().optional(),
    contactPhone: z7.string().min(6, "Contact phone is required"),
    email: z7.string().email("Invalid email").optional()
  })
});
var updateOrganizationSchema = z7.object({
  body: z7.object({
    name: z7.string().min(2).optional(),
    type: orgTypeEnum.optional(),
    address: z7.string().min(3).optional(),
    district: z7.string().min(2).optional(),
    upazila: z7.string().optional(),
    contactPhone: z7.string().min(6).optional(),
    email: z7.string().email().optional()
  })
});
var OrganizationValidation = {
  applyOrganizationSchema,
  updateOrganizationSchema
};
var organization_validation_default = OrganizationValidation;

// src/modules/organization/organization.route.ts
var router7 = Router7();
router7.post(
  "/",
  auth_default(),
  validate_default(organization_validation_default.applyOrganizationSchema),
  organization_controller_default.applyOrganization
);
router7.get("/", organization_controller_default.getAllOrganizations);
router7.get("/:id", organization_controller_default.getOrganizationById);
router7.patch(
  "/:id",
  auth_default(),
  validate_default(organization_validation_default.updateOrganizationSchema),
  organization_controller_default.updateOrganization
);
var OrganizationRoutes = router7;

// src/modules/payment/payment.route.ts
import { Router as Router8 } from "express";

// src/modules/payment/payment.controller.ts
import httpStatus23 from "http-status";

// src/modules/payment/payment.service.ts
import httpStatus22 from "http-status";

// src/modules/payment/bkash.service.ts
import axios from "axios";
var TOKEN_CACHE_KEY = "bkash:token:sandbox:v1";
var getBkashGrantToken = async () => {
  const cachedToken = await getCache(TOKEN_CACHE_KEY);
  if (cachedToken) {
    return cachedToken;
  }
  if (config_default.bkash.app_key === "sandbox_app_key" || !config_default.bkash.app_key) {
    const mockToken = `mock_bkash_id_token_${Date.now()}`;
    await setCache(TOKEN_CACHE_KEY, mockToken, 3500);
    return mockToken;
  }
  try {
    const response = await axios.post(
      `${config_default.bkash.base_url}/token/grant`,
      {
        app_key: config_default.bkash.app_key,
        app_secret: config_default.bkash.app_secret
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          username: config_default.bkash.username,
          password: config_default.bkash.password
        }
      }
    );
    if (response.data && response.data.id_token) {
      const expiresIn = response.data.expires_in || 3600;
      await setCache(TOKEN_CACHE_KEY, response.data.id_token, expiresIn - 100);
      return response.data.id_token;
    }
    throw new Error(response.data.statusMessage || "Failed to grant bKash token");
  } catch (error) {
    console.error("bKash token grant error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.statusMessage || error.message || "Failed to authenticate with bKash Developer Portal API"
    );
  }
};
var createBkashPaymentSession = async (payload) => {
  const token = await getBkashGrantToken();
  if (token.startsWith("mock_bkash_id_token_")) {
    const paymentID = `BKASH_MOCK_PID_${Date.now()}`;
    const bkashURL = `${config_default.frontend_url}/payment/bkash-mock?paymentId=${paymentID}&invoice=${payload.merchantInvoiceNumber}&amount=${payload.amount}`;
    return {
      statusCode: "0000",
      statusMessage: "Successful",
      paymentID,
      bkashURL,
      callbackURL: config_default.bkash.callback_url,
      successCallbackURL: config_default.bkash.callback_url,
      failureCallbackURL: config_default.bkash.callback_url,
      cancelledCallbackURL: config_default.bkash.callback_url,
      amount: payload.amount.toFixed(2),
      currency: "BDT",
      intent: "sale",
      paymentCreateTime: (/* @__PURE__ */ new Date()).toISOString(),
      transactionStatus: "Initiated",
      merchantInvoiceNumber: payload.merchantInvoiceNumber
    };
  }
  try {
    const response = await axios.post(
      `${config_default.bkash.base_url}/create`,
      {
        mode: "0011",
        payerReference: payload.payerReference || "01770618575",
        callbackURL: config_default.bkash.callback_url,
        amount: payload.amount.toFixed(2),
        currency: "BDT",
        intent: "sale",
        merchantInvoiceNumber: payload.merchantInvoiceNumber
      },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: token,
          "x-app-key": config_default.bkash.app_key
        }
      }
    );
    if (response.data && response.data.bkashURL) {
      return response.data;
    }
    if (response.data && response.data.statusCode && response.data.statusCode !== "0000") {
      throw new Error(
        `bKash Portal Error [${response.data.statusCode}]: ${response.data.statusMessage}`
      );
    }
    return response.data;
  } catch (error) {
    console.error("bKash create payment error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.statusMessage || error.message || "Failed to create bKash checkout session on Developer Portal"
    );
  }
};
var executeBkashPaymentSession = async (paymentID, expectedAmount) => {
  const token = await getBkashGrantToken();
  if (token.startsWith("mock_bkash_id_token_") || paymentID.startsWith("BKASH_MOCK_")) {
    const formattedAmount = expectedAmount ? Number(expectedAmount).toFixed(2) : "500.00";
    return {
      statusCode: "0000",
      statusMessage: "Successful",
      paymentID,
      trxID: `TRX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      amount: formattedAmount,
      transactionStatus: "Completed",
      paymentExecuteTime: (/* @__PURE__ */ new Date()).toISOString(),
      currency: "BDT",
      intent: "sale",
      merchantInvoiceNumber: `INV_${Date.now()}`,
      payerReference: "User Support",
      customerMsisdn: "01700000000"
    };
  }
  try {
    const response = await axios.post(
      `${config_default.bkash.base_url}/execute`,
      { paymentID },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: token,
          "x-app-key": config_default.bkash.app_key
        }
      }
    );
    if (response.data && (response.data.statusCode === "0000" || Boolean(response.data.trxID))) {
      return response.data;
    }
    if (response.data && response.data.statusCode === "2056") {
      throw new Error(
        "bKash Verification Incomplete: Please open the bkashURL in your browser, enter wallet number (01770618575), OTP (123456), and PIN (12121) to complete payment first."
      );
    }
    throw new Error(
      response.data?.statusMessage || `bKash execute failed with status code ${response.data?.statusCode}`
    );
  } catch (error) {
    console.error("bKash execute error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.statusMessage || error.message || "bKash execute payment failed"
    );
  }
};
var queryBkashPaymentSession = async (paymentID, expectedAmount) => {
  const token = await getBkashGrantToken();
  if (token.startsWith("mock_bkash_id_token_") || paymentID.startsWith("BKASH_MOCK_")) {
    const formattedAmount = expectedAmount ? Number(expectedAmount).toFixed(2) : "500.00";
    return {
      statusCode: "0000",
      statusMessage: "Successful",
      paymentID,
      amount: formattedAmount,
      trxID: `TRX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
      transactionStatus: "Completed"
    };
  }
  try {
    const response = await axios.post(
      `${config_default.bkash.base_url}/payment/status`,
      { paymentID },
      {
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          authorization: token,
          "x-app-key": config_default.bkash.app_key
        }
      }
    );
    if (response.data && (response.data.statusCode === "0000" || Boolean(response.data.trxID))) {
      return response.data;
    }
    throw new Error(
      response.data?.statusMessage || `bKash query failed with status code ${response.data?.statusCode}`
    );
  } catch (error) {
    console.error("bKash query error:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.statusMessage || error.message || "bKash query payment failed"
    );
  }
};
var BkashService = {
  getBkashGrantToken,
  createBkashPaymentSession,
  executeBkashPaymentSession,
  queryBkashPaymentSession
};
var bkash_service_default = BkashService;

// src/modules/payment/payment.service.ts
var createBkashPayment = async (userId, payload) => {
  const merchantInvoiceNumber = `BL_INV_${Date.now()}_${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
  const payment = await prisma_default.payment.create({
    data: {
      userId,
      amount: payload.amount,
      purpose: payload.purpose || "PLATFORM_SUPPORT",
      status: "PENDING",
      merchantInvoiceNumber,
      requestId: payload.requestId,
      payerReference: payload.payerReference
    }
  });
  await prisma_default.paymentEvent.create({
    data: {
      paymentId: payment.id,
      eventType: "CREATE",
      payload: {
        amount: payload.amount,
        merchantInvoiceNumber,
        purpose: payment.purpose
      }
    }
  });
  const bkashSession = await bkash_service_default.createBkashPaymentSession({
    amount: payload.amount,
    merchantInvoiceNumber,
    payerReference: payload.payerReference
  });
  await prisma_default.payment.update({
    where: { id: payment.id },
    data: {
      bkashPaymentId: bkashSession.paymentID
    }
  });
  return {
    paymentId: payment.id,
    bkashPaymentId: bkashSession.paymentID,
    bkashURL: bkashSession.bkashURL,
    merchantInvoiceNumber,
    amount: payload.amount
  };
};
var handleBkashCallback = async (paymentID, status) => {
  let currentPayment = await prisma_default.payment.findFirst({
    where: { bkashPaymentId: paymentID }
  });
  if (!currentPayment) {
    currentPayment = await prisma_default.payment.findFirst({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" }
    });
    if (!currentPayment) {
      throw new AppError_default(httpStatus22.NOT_FOUND, "Payment session not found");
    }
  }
  if (currentPayment.status === "PAID") {
    return {
      redirectUrl: `${config_default.frontend_url}/payment/success?paymentId=${currentPayment.id}&trxId=${currentPayment.trxId}&alreadyProcessed=true`,
      payment: currentPayment
    };
  }
  await prisma_default.paymentEvent.create({
    data: {
      paymentId: currentPayment.id,
      eventType: "CALLBACK",
      payload: { paymentID, status }
    }
  });
  if (status !== "success") {
    const finalStatus = status === "cancel" ? "CANCELLED" : "FAILED";
    await prisma_default.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: finalStatus,
        failureReason: `bKash reported status: ${status}`
      }
    });
    return {
      redirectUrl: `${config_default.frontend_url}/payment/failed?paymentId=${currentPayment.id}&status=${status}`,
      payment: currentPayment
    };
  }
  let executeResult;
  try {
    executeResult = await bkash_service_default.executeBkashPaymentSession(
      paymentID,
      Number(currentPayment.amount)
    );
  } catch (error) {
    await prisma_default.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: "FAILED",
        failureReason: error.message || "Execute API failed"
      }
    });
    return {
      redirectUrl: `${config_default.frontend_url}/payment/failed?paymentId=${currentPayment.id}&error=execute_failed`,
      payment: currentPayment
    };
  }
  const queryResult = await bkash_service_default.queryBkashPaymentSession(
    paymentID,
    Number(currentPayment.amount)
  );
  const trxId = executeResult.trxID || queryResult.trxID;
  const verifiedAmount = Number.parseFloat(
    queryResult.amount || executeResult.amount
  );
  const dbAmount = Number(currentPayment.amount);
  if (Math.abs(verifiedAmount - dbAmount) > 0.01) {
    await prisma_default.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: "FAILED",
        failureReason: `Amount mismatch: expected ${dbAmount}, received ${verifiedAmount}`
      }
    });
    return {
      redirectUrl: `${config_default.frontend_url}/payment/failed?paymentId=${currentPayment.id}&error=amount_mismatch`,
      payment: currentPayment
    };
  }
  const updatedPayment = await prisma_default.$transaction(async (tx) => {
    const paidPayment = await tx.payment.update({
      where: { id: currentPayment.id },
      data: {
        status: "PAID",
        trxId: trxId || `TRX_${Date.now()}`,
        paidAt: /* @__PURE__ */ new Date(),
        payerMobile: executeResult.customerMsisdn || queryResult.customerMsisdn
      }
    });
    await tx.paymentEvent.create({
      data: {
        paymentId: paidPayment.id,
        eventType: "VERIFIED",
        payload: {
          trxId,
          executeResult,
          queryResult
        }
      }
    });
    await tx.notification.create({
      data: {
        userId: paidPayment.userId,
        type: "PAYMENT_UPDATE",
        title: "Payment Received! \u{1F496}",
        message: `Thank you for your voluntary support of ${paidPayment.amount} BDT (TrxID: ${trxId}). Together we save lives!`
      }
    });
    return paidPayment;
  });
  return {
    redirectUrl: `${config_default.frontend_url}/payment/success?paymentId=${updatedPayment.id}&trxId=${updatedPayment.trxId}`,
    payment: updatedPayment
  };
};
var getPaymentById = async (id, userId, role) => {
  const payment = await prisma_default.payment.findUnique({
    where: { id },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      },
      events: {
        orderBy: { createdAt: "desc" }
      }
    }
  });
  if (!payment) {
    throw new AppError_default(httpStatus22.NOT_FOUND, "Payment not found");
  }
  if (payment.userId !== userId && role !== "ADMIN") {
    throw new AppError_default(
      httpStatus22.FORBIDDEN,
      "You do not have permission to view this payment"
    );
  }
  return payment;
};
var getMyPayments = async (userId, query) => {
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10;
  const skip = (page - 1) * limit;
  const [payments, total] = await Promise.all([
    prisma_default.payment.findMany({
      where: { userId },
      skip,
      take: limit,
      orderBy: { createdAt: "desc" }
    }),
    prisma_default.payment.count({ where: { userId } })
  ]);
  return {
    payments,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit)
    }
  };
};
var PaymentService = {
  createBkashPayment,
  handleBkashCallback,
  getPaymentById,
  getMyPayments
};
var payment_service_default = PaymentService;

// src/modules/payment/payment.controller.ts
var createBkashPayment2 = catchAsync_default(
  async (req, res) => {
    const userId = req.user.id;
    const result = await payment_service_default.createBkashPayment(userId, req.body);
    sendResponse_default(res, {
      statusCode: httpStatus23.CREATED,
      success: true,
      message: "bKash payment session initialized successfully",
      data: result
    });
  }
);
var handleBkashCallback2 = catchAsync_default(
  async (req, res) => {
    const paymentID = req.query.paymentID || req.query.paymentId;
    const status = req.query.status || "cancel";
    const result = await payment_service_default.handleBkashCallback(paymentID, status);
    if (req.query.format === "json" || req.headers.accept?.includes("application/json")) {
      return sendResponse_default(res, {
        statusCode: httpStatus23.OK,
        success: true,
        message: "bKash payment callback processed successfully",
        data: result
      });
    }
    res.redirect(result.redirectUrl);
  }
);
var getPaymentById2 = catchAsync_default(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const role = req.user.role;
  const result = await payment_service_default.getPaymentById(id, userId, role);
  sendResponse_default(res, {
    statusCode: httpStatus23.OK,
    success: true,
    message: "Payment details fetched successfully",
    data: result
  });
});
var getMyPayments2 = catchAsync_default(async (req, res) => {
  const userId = req.user.id;
  const result = await payment_service_default.getMyPayments(userId, {
    page: req.query.page ? Number(req.query.page) : void 0,
    limit: req.query.limit ? Number(req.query.limit) : void 0
  });
  sendResponse_default(res, {
    statusCode: httpStatus23.OK,
    success: true,
    message: "My payments fetched successfully",
    meta: result.meta,
    data: result.payments
  });
});
var PaymentController = {
  createBkashPayment: createBkashPayment2,
  handleBkashCallback: handleBkashCallback2,
  getPaymentById: getPaymentById2,
  getMyPayments: getMyPayments2
};
var payment_controller_default = PaymentController;

// src/modules/payment/payment.validation.ts
import { z as z8 } from "zod";
var paymentPurposeEnum = z8.enum(["PLATFORM_SUPPORT", "EMERGENCY_FUND"]);
var createPaymentSchema = z8.object({
  body: z8.object({
    amount: z8.number().min(10, "Minimum voluntary contribution is 10 BDT"),
    purpose: paymentPurposeEnum.default("PLATFORM_SUPPORT"),
    requestId: z8.string().optional(),
    payerReference: z8.string().optional()
  })
});
var callbackPaymentSchema = z8.object({
  query: z8.object({
    paymentID: z8.string().min(1, "paymentID is required"),
    status: z8.string().min(1, "status is required")
  })
});
var PaymentValidation = {
  createPaymentSchema,
  callbackPaymentSchema
};
var payment_validation_default = PaymentValidation;

// src/modules/payment/payment.route.ts
var router8 = Router8();
router8.post(
  "/bkash/create",
  auth_default(),
  rateLimit_default({
    keyPrefix: "payment_create",
    maxRequests: 10,
    windowSeconds: 60 * 15,
    message: "Too many payment attempts. Please wait a few minutes."
  }),
  validate_default(payment_validation_default.createPaymentSchema),
  payment_controller_default.createBkashPayment
);
router8.get("/bkash/callback", payment_controller_default.handleBkashCallback);
router8.get("/my", auth_default(), payment_controller_default.getMyPayments);
router8.get("/:id", auth_default(), payment_controller_default.getPaymentById);
var PaymentRoutes = router8;

// src/modules/user/user.route.ts
import { Router as Router9 } from "express";

// src/middlewares/upload.ts
import fs from "fs";
import path3 from "path";
import httpStatus24 from "http-status";
import multer from "multer";
var uploadDir = process.env.VERCEL ? path3.join("/tmp", "uploads", "avatars") : path3.join(process.cwd(), "uploads", "avatars");
try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn(
    `[Upload] Notice: Could not create upload directory (${err?.message || err})`
  );
}
var storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const ext = path3.extname(file.originalname).toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${uniqueSuffix}${ext}`);
  }
});
var fileFilter = (_req, file, cb) => {
  const allowedMimeTypes = [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif"
  ];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new AppError_default(
        httpStatus24.BAD_REQUEST,
        "Only HD image files (.jpg, .jpeg, .png, .webp, .gif) are allowed!"
      ),
      false
    );
  }
};
var uploadAvatar2 = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024
    // 15MB limit for high-definition / high-resolution photos
  }
});
var upload_default = uploadAvatar2;

// src/modules/user/user.route.ts
var router9 = Router9();
router9.get("/me", auth_default(), user_controller_default.getMyProfile);
router9.get("/profile", auth_default(), user_controller_default.getMyProfile);
router9.patch(
  "/me",
  auth_default(),
  upload_default.single("avatar"),
  validate_default(user_validation_default.updateUserProfileSchema),
  user_controller_default.updateMyProfile
);
router9.patch(
  "/profile",
  auth_default(),
  upload_default.single("avatar"),
  validate_default(user_validation_default.updateUserProfileSchema),
  user_controller_default.updateMyProfile
);
router9.post(
  "/avatar",
  auth_default(),
  upload_default.single("avatar"),
  user_controller_default.uploadAvatar
);
router9.post(
  "/me/avatar",
  auth_default(),
  upload_default.single("avatar"),
  user_controller_default.uploadAvatar
);
router9.patch(
  "/availability",
  auth_default(),
  validate_default(user_validation_default.toggleDonorAvailabilitySchema),
  user_controller_default.updateDonorAvailability
);
var UserRoutes = router9;

// src/routes/index.ts
var router10 = Router10();
var moduleRoutes = [
  {
    path: "/auth",
    route: AuthRoutes
  },
  {
    path: "/users",
    route: UserRoutes
  },
  {
    path: "/donors",
    route: DonorRoutes
  },
  {
    path: "/blood-requests",
    route: BloodRequestRoutes
  },
  {
    path: "/organizations",
    route: OrganizationRoutes
  },
  {
    path: "/camps",
    route: CampRoutes
  },
  {
    path: "/notifications",
    route: NotificationRoutes
  },
  {
    path: "/payments",
    route: PaymentRoutes
  },
  {
    path: "/admin",
    route: AdminRoutes
  }
];
for (const route of moduleRoutes) {
  router10.use(route.path, route.route);
}
var routes_default = router10;

// src/app.ts
var app = express();
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
  })
);
app.use(
  cors({
    origin: [config_default.frontend_url, "http://localhost:3000", "http://localhost:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
var uploadsPath = process.env.VERCEL ? path4.join("/tmp", "uploads") : path4.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));
app.get("/", (_req, res) => {
  res.status(httpStatus25.OK).json({
    success: true,
    message: "Welcome to BloodLink API - Empowering Blood Donors & Saving Lives",
    version: "1.0.0",
    docs: "/api/v1"
  });
});
app.get("/health", (_req, res) => {
  res.status(httpStatus25.OK).json({
    success: true,
    status: "healthy",
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.use("/api/v1", routes_default);
app.use("/api", routes_default);
app.use("/", routes_default);
app.use(notFound_default);
app.use(errorHandler_default);
var app_default = app;

// src/utils/cron.ts
import cron from "node-cron";
var expireOldBloodRequests = async () => {
  try {
    const now = /* @__PURE__ */ new Date();
    const expiredRequests = await prisma_default.bloodRequest.findMany({
      where: {
        status: { in: ["OPEN", "PARTIALLY_FULFILLED"] },
        neededBy: { lt: now },
        deletedAt: null
      },
      select: {
        id: true,
        requesterId: true,
        bloodGroup: true
      }
    });
    if (expiredRequests.length === 0) {
      return 0;
    }
    const requestIds = expiredRequests.map((r) => r.id);
    await prisma_default.bloodRequest.updateMany({
      where: {
        id: { in: requestIds }
      },
      data: {
        status: "EXPIRED"
      }
    });
    await prisma_default.notification.createMany({
      data: expiredRequests.map((req) => ({
        userId: req.requesterId,
        requestId: req.id,
        type: "REQUEST_STATUS_CHANGED",
        title: "Blood Request Expired",
        message: `Your blood request for ${req.bloodGroup} has expired as the needed date/time has passed.`
      }))
    });
    console.log(`[Cron] Marked ${expiredRequests.length} expired blood requests as EXPIRED.`);
    return expiredRequests.length;
  } catch (error) {
    console.error("[Cron] Error expiring old blood requests:", error);
    return 0;
  }
};
var initScheduledJobs = () => {
  cron.schedule("*/10 * * * *", async () => {
    console.log("[Cron] Running expired blood requests check...");
    await expireOldBloodRequests();
  });
  console.log("[Cron] Blood request expiration scheduler initialized.");
};
var cron_default = initScheduledJobs;

// src/utils/seed.ts
import bcrypt2 from "bcryptjs";
var seedSuperAdmin = async () => {
  try {
    const existingAdmin = await prisma_default.user.findFirst({
      where: {
        role: "ADMIN"
      }
    });
    if (existingAdmin) {
      console.log("Admin account already exists. Skipping admin seed.");
      return;
    }
    const hashedPassword = await bcrypt2.hash(
      config_default.admin.password,
      config_default.bcrypt_salt_rounds
    );
    const admin = await prisma_default.user.create({
      data: {
        name: config_default.admin.name,
        email: config_default.admin.email,
        password: hashedPassword,
        role: "ADMIN",
        status: "ACTIVE",
        isVerified: true
      }
    });
    await prisma_default.auditLog.create({
      data: {
        actorId: admin.id,
        action: "INITIAL_ADMIN_SEED",
        targetType: "User",
        targetId: admin.id,
        details: { email: admin.email, role: "ADMIN" }
      }
    });
    console.log(`Super Admin seeded successfully: ${admin.email}`);
  } catch (error) {
    console.error("Error seeding super admin:", error);
  }
};
var seed_default = seedSuperAdmin;

// src/server.ts
var server;
var main = async () => {
  try {
    await prisma_default.$connect();
    console.log("Connected to PostgreSQL database successfully.");
    await connectRedis();
    await verifySmtpConnection();
    await seed_default();
    cron_default();
    server = app_default.listen(config_default.port, () => {
      console.log(`BloodLink Server is running on port ${config_default.port}`);
      console.log(`Environment: ${config_default.env}`);
      console.log(`API Docs: http://localhost:${config_default.port}/api/v1`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma_default.$disconnect();
    process.exit(1);
  }
};
process.on("unhandledRejection", (error) => {
  console.error("Unhandled Rejection detected:", error);
  if (server) {
    server.close(() => {
      process.exit(1);
    });
  } else {
    process.exit(1);
  }
});
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception detected:", error);
  process.exit(1);
});
process.on("SIGTERM", async () => {
  console.log("SIGTERM received. Gracefully shutting down...");
  if (server) server.close();
  process.exit(0);
});
var server_default = app_default;
if (!process.env.VERCEL) {
  main();
} else {
  seed_default().catch(
    (err) => console.warn("Vercel initial admin seed notice:", err?.message || err)
  );
}
export {
  server_default as default
};
//# sourceMappingURL=server.js.map