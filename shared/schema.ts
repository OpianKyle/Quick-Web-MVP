import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar, uniqueIndex } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// --- Imported from Auth Integration (Do not remove) ---
import { users } from "./models/auth";
export * from "./models/auth";
// ------------------------------------------------------

// --- Imported from Chat Integration (Do not remove) ---
import { conversations, messages } from "./models/chat";
export * from "./models/chat";
// ------------------------------------------------------

// --- Application Specific Tables ---

// SME Profiles linked to Users
export const smeProfiles = pgTable("sme_profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().references(() => users.id),
  businessName: text("business_name").notNull(),
  ownerName: text("owner_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  location: text("location").notNull(),
  industry: text("industry").notNull(),
  productsServices: text("products_services").notNull(),
  registrationType: text("registration_type").notNull().default("registered"), // registered, registering, informal
  registrationNumber: text("registration_number"),
  taxNumber: text("tax_number"),
  beeLevel: text("bee_level"),
  csdNumber: text("csd_number"),
  complianceStatus: text("compliance_status").default("pending"), // pending, compliant, non-compliant
  popiaConsent: boolean("popia_consent").notNull().default(false),
  subscriptionStatus: text("subscription_status").default("inactive"), // inactive, active
  subscriptionExpiry: timestamp("subscription_expiry"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const smeProfilesRelations = relations(smeProfiles, ({ one, many }) => ({
  user: one(users, {
    fields: [smeProfiles.userId],
    references: [users.id],
  }),
  websiteDrafts: many(websiteDrafts),
  socialPosts: many(socialPosts),
  invoices: many(invoices),
  tenderBids: many(tenderBids),
}));

export const vouchers = pgTable("vouchers", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  status: text("status").notNull().default("active"), // active, redeemed
  createdAt: timestamp("created_at").defaultNow(),
  redeemedAt: timestamp("redeemed_at"),
  redeemedByProfileId: integer("redeemed_by_profile_id").references(() => smeProfiles.id),
});

export const websiteDrafts = pgTable("website_drafts", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => smeProfiles.id),
  content: jsonb("content").notNull(), // { hero: {}, about: {}, services: [], contact: {} }
  slug: text("slug").unique(),
  isPublished: boolean("is_published").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const websiteDraftsRelations = relations(websiteDrafts, ({ one }) => ({
  profile: one(smeProfiles, {
    fields: [websiteDrafts.profileId],
    references: [smeProfiles.id],
  }),
}));

export const socialPosts = pgTable("social_posts", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => smeProfiles.id),
  platform: text("platform").notNull(), // Facebook, Instagram, LinkedIn
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const socialPostsRelations = relations(socialPosts, ({ one }) => ({
  profile: one(smeProfiles, {
    fields: [socialPosts.profileId],
    references: [smeProfiles.id],
  }),
}));

export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull().references(() => smeProfiles.id),
  customerName: text("customer_name").notNull(),
  items: jsonb("items").notNull(), // [{ description, amount }]
  totalAmount: integer("total_amount").notNull(), // In cents
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoicesRelations = relations(invoices, ({ one }) => ({
  profile: one(smeProfiles, {
    fields: [invoices.profileId],
    references: [smeProfiles.id],
  }),
}));

// Job Tenders (posted by Admin/Superadmin)
export const tenders = pgTable("tenders", {
  id: serial("id").primaryKey(),
  createdByUserId: varchar("created_by_user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category"),
  location: text("location"),
  budgetCents: integer("budget_cents"),
  deadlineAt: timestamp("deadline_at"),
  status: text("status").notNull().default("open"), // open, closed, awarded, cancelled
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const tendersRelations = relations(tenders, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [tenders.createdByUserId],
    references: [users.id],
  }),
  bids: many(tenderBids),
}));

// Tender bids (submitted by registered businesses / SME profiles)
export const tenderBids = pgTable(
  "tender_bids",
  {
    id: serial("id").primaryKey(),
    tenderId: integer("tender_id").notNull().references(() => tenders.id),
    bidderProfileId: integer("bidder_profile_id").notNull().references(() => smeProfiles.id),
    amountCents: integer("amount_cents"),
    proposal: text("proposal").notNull(),
    status: text("status").notNull().default("submitted"), // submitted, shortlisted, accepted, rejected, withdrawn
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => ({
    tenderBidUnique: uniqueIndex("tender_bid_unique").on(table.tenderId, table.bidderProfileId),
  })
);

export const tenderBidsRelations = relations(tenderBids, ({ one }) => ({
  tender: one(tenders, {
    fields: [tenderBids.tenderId],
    references: [tenders.id],
  }),
  bidderProfile: one(smeProfiles, {
    fields: [tenderBids.bidderProfileId],
    references: [smeProfiles.id],
  }),
}));

// --- Schemas ---

export const insertSmeProfileSchema = createInsertSchema(smeProfiles).omit({ 
  id: true, 
  userId: true, 
  subscriptionStatus: true, 
  subscriptionExpiry: true, 
  createdAt: true 
}).extend({
  registrationType: z.enum(["registered", "registering", "informal"]).default("registered"),
  registrationNumber: z.string().optional(),
});

export const insertVoucherSchema = createInsertSchema(vouchers).omit({
  id: true,
  createdAt: true,
  redeemedAt: true,
  redeemedByProfileId: true,
  status: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  profileId: true,
  createdAt: true,
});

export const insertTenderSchema = createInsertSchema(tenders).omit({
  id: true,
  createdByUserId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

export const insertTenderBidSchema = createInsertSchema(tenderBids).omit({
  id: true,
  tenderId: true,
  bidderProfileId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
});

// --- Types ---

export type User = typeof users.$inferSelect;
export type UserRole = "business" | "admin" | "superadmin";

export type SmeProfile = typeof smeProfiles.$inferSelect;
export type InsertSmeProfile = z.infer<typeof insertSmeProfileSchema>;
export type Voucher = typeof vouchers.$inferSelect;
export type WebsiteDraft = typeof websiteDrafts.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type Tender = typeof tenders.$inferSelect;
export type InsertTender = z.infer<typeof insertTenderSchema>;
export type TenderBid = typeof tenderBids.$inferSelect;
export type InsertTenderBid = z.infer<typeof insertTenderBidSchema>;
