import { pgTable, text, serial, integer, boolean, timestamp, jsonb, varchar } from "drizzle-orm/pg-core";
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

// --- Schemas ---

export const insertSmeProfileSchema = createInsertSchema(smeProfiles).omit({ 
  id: true, 
  userId: true, 
  subscriptionStatus: true, 
  subscriptionExpiry: true, 
  createdAt: true 
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

// --- Types ---

export type SmeProfile = typeof smeProfiles.$inferSelect;
export type InsertSmeProfile = z.infer<typeof insertSmeProfileSchema>;
export type Voucher = typeof vouchers.$inferSelect;
export type WebsiteDraft = typeof websiteDrafts.$inferSelect;
export type SocialPost = typeof socialPosts.$inferSelect;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;
