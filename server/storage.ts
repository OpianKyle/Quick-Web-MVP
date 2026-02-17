import { users, type User, type InsertUser, smeProfiles, type SmeProfile, type InsertSmeProfile, vouchers, type Voucher, websiteDrafts, type WebsiteDraft, socialPosts, type SocialPost, invoices, type Invoice, type InsertInvoice } from "@shared/schema";
import { db } from "./db";
import { eq, count, and } from "drizzle-orm";

export interface IStorage {
  // User (from Auth) - mostly handled by Auth module, but we might need helpers
  getUser(id: string): Promise<User | undefined>;
  
  // SME Profile
  getSmeProfile(userId: string): Promise<SmeProfile | undefined>;
  getSmeProfileById(id: number): Promise<SmeProfile | undefined>;
  createSmeProfile(userId: string, profile: InsertSmeProfile): Promise<SmeProfile>;
  updateSmeProfile(userId: string, updates: Partial<InsertSmeProfile>): Promise<SmeProfile>;
  
  // Vouchers
  createVouchers(count: number): Promise<string[]>;
  getVoucher(code: string): Promise<Voucher | undefined>;
  redeemVoucher(code: string, profileId: number): Promise<Voucher>;
  getAllVouchers(): Promise<Voucher[]>; // Admin
  
  // Website
  createWebsiteDraft(profileId: number, content: any, slug?: string): Promise<WebsiteDraft>;
  getWebsiteDraft(profileId: number): Promise<WebsiteDraft | undefined>;
  updateWebsiteDraft(profileId: number, updates: Partial<WebsiteDraft>): Promise<WebsiteDraft>;
  
  // Social
  createSocialPosts(posts: Omit<SocialPost, "id" | "createdAt">[]): Promise<SocialPost[]>;
  getSocialPosts(profileId: number): Promise<SocialPost[]>;
  
  // Invoices
  createInvoice(profileId: number, invoice: InsertInvoice): Promise<Invoice>;
  getInvoices(profileId: number): Promise<Invoice[]>;
  
  // Admin Stats
  getStats(): Promise<{ totalSmes: number; activeSubscriptions: number; redeemedVouchers: number }>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getSmeProfile(userId: string): Promise<SmeProfile | undefined> {
    const [profile] = await db.select().from(smeProfiles).where(eq(smeProfiles.userId, userId));
    return profile;
  }

  async getSmeProfileById(id: number): Promise<SmeProfile | undefined> {
    const [profile] = await db.select().from(smeProfiles).where(eq(smeProfiles.id, id));
    return profile;
  }

  async createSmeProfile(userId: string, profile: InsertSmeProfile): Promise<SmeProfile> {
    const [newProfile] = await db.insert(smeProfiles).values({ ...profile, userId }).returning();
    return newProfile;
  }

  async updateSmeProfile(userId: string, updates: Partial<InsertSmeProfile>): Promise<SmeProfile> {
    const [updated] = await db.update(smeProfiles).set(updates).where(eq(smeProfiles.userId, userId)).returning();
    return updated;
  }

  async createVouchers(count: number): Promise<string[]> {
    const codes = [];
    for (let i = 0; i < count; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    
    // Bulk insert would be better but simple loop for MVP
    const createdCodes = [];
    for (const code of codes) {
        const [voucher] = await db.insert(vouchers).values({ code }).returning();
        createdCodes.push(voucher.code);
    }
    return createdCodes;
  }

  async getVoucher(code: string): Promise<Voucher | undefined> {
    const [voucher] = await db.select().from(vouchers).where(eq(vouchers.code, code));
    return voucher;
  }

  async redeemVoucher(code: string, profileId: number): Promise<Voucher> {
    const [voucher] = await db.update(vouchers)
      .set({ status: "redeemed", redeemedAt: new Date(), redeemedByProfileId: profileId })
      .where(eq(vouchers.code, code))
      .returning();
      
    // Update SME subscription
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6);
    
    await db.update(smeProfiles)
      .set({ subscriptionStatus: "active", subscriptionExpiry: expiryDate })
      .where(eq(smeProfiles.id, profileId));
      
    return voucher;
  }

  async getAllVouchers(): Promise<Voucher[]> {
    return await db.select().from(vouchers);
  }

  async createWebsiteDraft(profileId: number, content: any, slug?: string): Promise<WebsiteDraft> {
    // Upsert draft
    const existing = await this.getWebsiteDraft(profileId);
    if (existing) {
        const [updated] = await db.update(websiteDrafts).set({ content, slug }).where(eq(websiteDrafts.id, existing.id)).returning();
        return updated;
    } else {
        const [draft] = await db.insert(websiteDrafts).values({ profileId, content, slug }).returning();
        return draft;
    }
  }

  async getWebsiteDraft(profileId: number): Promise<WebsiteDraft | undefined> {
    const [draft] = await db.select().from(websiteDrafts).where(eq(websiteDrafts.profileId, profileId));
    return draft;
  }

  async updateWebsiteDraft(profileId: number, updates: Partial<WebsiteDraft>): Promise<WebsiteDraft> {
    const [updated] = await db.update(websiteDrafts).set(updates).where(eq(websiteDrafts.profileId, profileId)).returning();
    return updated;
  }

  async createSocialPosts(posts: Omit<SocialPost, "id" | "createdAt">[]): Promise<SocialPost[]> {
    const created = await db.insert(socialPosts).values(posts).returning();
    return created;
  }

  async getSocialPosts(profileId: number): Promise<SocialPost[]> {
    return await db.select().from(socialPosts).where(eq(socialPosts.profileId, profileId));
  }

  async createInvoice(profileId: number, invoice: InsertInvoice): Promise<Invoice> {
    const [newInvoice] = await db.insert(invoices).values({ ...invoice, profileId }).returning();
    return newInvoice;
  }

  async getInvoices(profileId: number): Promise<Invoice[]> {
    return await db.select().from(invoices).where(eq(invoices.profileId, profileId));
  }
  
  async getStats(): Promise<{ totalSmes: number; activeSubscriptions: number; redeemedVouchers: number }> {
      const [totalSmesRes] = await db.select({ count: count() }).from(smeProfiles);
      const [activeSubsRes] = await db.select({ count: count() }).from(smeProfiles).where(eq(smeProfiles.subscriptionStatus, "active"));
      const [redeemedVouchersRes] = await db.select({ count: count() }).from(vouchers).where(eq(vouchers.status, "redeemed"));
      
      return {
          totalSmes: Number(totalSmesRes?.count || 0),
          activeSubscriptions: Number(activeSubsRes?.count || 0),
          redeemedVouchers: Number(redeemedVouchersRes?.count || 0),
      };
  }

  async seedDatabase(): Promise<void> {
    const existingVouchers = await this.getAllVouchers();
    if (existingVouchers.length === 0) {
      await this.createVouchers(10);
      console.log("Seeded 10 vouchers");
    }
  }
}

export const storage = new DatabaseStorage();
