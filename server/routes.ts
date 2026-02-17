import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { registerChatRoutes } from "./replit_integrations/chat";
import { openai } from "./replit_integrations/image"; // Use OpenAI client from image integration (it's the same client)

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
    
  // Setup Auth
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Setup Chat/AI
  registerChatRoutes(app);

  // Seed Database
  await storage.seedDatabase();

  // --- API Routes ---

  const getUserId = (req: any) => (req.user as any)?.claims?.sub as string | undefined;

  const requireAuth = (req: any, res: any): string | undefined => {
    if (!req.isAuthenticated?.()) {
      res.status(401).json({ message: "Unauthorized" });
      return undefined;
    }
    const userId = getUserId(req);
    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return undefined;
    }
    return userId;
  };

  const requireAdmin = async (req: any, res: any): Promise<{ userId: string } | undefined> => {
    const userId = requireAuth(req, res);
    if (!userId) return undefined;

    const user = await storage.getUser(userId);
    const role = user?.role ?? "business";
    const email = (user?.email ?? "").toLowerCase();
    const legacyAdmin = email.includes("admin");
    if (role !== "admin" && role !== "superadmin" && !legacyAdmin) {
      res.status(401).json({ message: "Unauthorized" });
      return undefined;
    }
    return { userId };
  };

  // Get SME Profile (Current User)
  app.get(api.sme.get.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;
    
    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    
    res.json(profile);
  });

  // Create SME Profile
  app.post(api.sme.create.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    try {
        const input = api.sme.create.input.parse(req.body);
        const profile = await storage.createSmeProfile(userId, input);
        res.status(201).json(profile);
    } catch (err) {
        if (err instanceof z.ZodError) {
            return res.status(400).json({ message: err.errors[0].message });
        }
        throw err;
    }
  });
  
  // Admin Stats
  app.get(api.sme.stats.path, async (req, res) => {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      
      const stats = await storage.getStats();
      res.json(stats);
  });

  // Redeem Voucher
  app.post(api.vouchers.redeem.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });

    const { code } = req.body;
    const voucher = await storage.getVoucher(code);
    
    if (!voucher || voucher.status !== "active") {
        return res.status(400).json({ message: "Invalid or expired voucher code" });
    }
    
    await storage.redeemVoucher(code, profile.id);
    res.json({ message: "Voucher redeemed successfully", expiry: "6 months from today" });
  });

  // Generate Vouchers (Admin)
  app.post(api.vouchers.generate.path, async (req, res) => {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const count = req.body.count || 10;
      const codes = await storage.createVouchers(count);
      res.status(201).json(codes);
  });
  
  app.get(api.vouchers.list.path, async (req, res) => {
      const admin = await requireAdmin(req, res);
      if (!admin) return;
      const vouchers = await storage.getAllVouchers();
      res.json(vouchers);
  });

  // Website Builder - Generate Draft (AI)
  app.post(api.website.generate.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });
    
    const { style } = req.body;
    
    // AI Generation Logic
    let generatedContent;
    try {
        const prompt = `Generate a simple website content JSON for a small business.
        Business Name: ${profile.businessName}
        Industry: ${profile.industry}
        Services: ${profile.productsServices}
        Location: ${profile.location}
        Style: ${style}
        
        Return JSON format:
        {
            "hero": { "headline": "...", "subheadline": "..." },
            "about": "...",
            "services": ["...", "..."],
            "contact": { "email": "${profile.email}", "phone": "${profile.phone}" }
        }
        `;

        // Use Replit AI (OpenAI)
        const completion = await openai.chat.completions.create({
            model: "gpt-5.1",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });
        
        generatedContent = JSON.parse(completion.choices[0].message.content || "{}");
        
    } catch (e) {
        console.error("AI generation failed, using mock", e);
        // Fallback Mock
        generatedContent = {
            hero: { headline: `Welcome to ${profile.businessName}`, subheadline: "Quality services for you" },
            about: `We are a leading provider of ${profile.productsServices} in ${profile.location}.`,
            services: ["Service 1", "Service 2", "Service 3"],
            contact: { email: profile.email, phone: profile.phone }
        };
    }
    
    const draft = await storage.createWebsiteDraft(profile.id, generatedContent);
    res.status(201).json(draft);
  });
  
  app.get(api.website.get.path, async (req, res) => {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      
      const draft = await storage.getWebsiteDraft(profile.id);
      if (!draft) return res.status(404).json({ message: "Draft not found" });
      
      res.json(draft);
  });

  app.post(api.website.publish.path, async (req, res) => {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(400).json({ message: "Create a profile first" });
      
      const { slug } = req.body;
      const draft = await storage.updateWebsiteDraft(profile.id, { isPublished: true, slug });
      
      res.json({ url: `/site/${slug}` });
  });

  // Social Media Drafts
  app.post(api.social.generate.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });

    // AI Generation
    let posts = [];
    try {
        const prompt = `Generate 3 short social media posts for ${profile.businessName} (${profile.industry}).
        1 for Facebook, 1 for Instagram, 1 for LinkedIn.
        Return JSON array: [{ "platform": "Facebook", "content": "..." }, ...]`;
        
        const completion = await openai.chat.completions.create({
            model: "gpt-5.1",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });
        
        const result = JSON.parse(completion.choices[0].message.content || "{}");
        // Handle if result is wrapped in a key or is the array directly (gpt-json sometimes varies)
        const rawPosts = result.posts || result.data || result; 
        
        if (Array.isArray(rawPosts)) {
             posts = rawPosts.map((p: any) => ({ profileId: profile.id, platform: p.platform, content: p.content }));
        } else {
             throw new Error("Invalid AI response format");
        }

    } catch (e) {
        console.error("AI Generation failed", e);
        posts = [
            { profileId: profile.id, platform: "Facebook", content: `Check out ${profile.businessName} for all your ${profile.industry} needs!` },
            { profileId: profile.id, platform: "Instagram", content: `New services available at ${profile.businessName}. #SME #SouthAfrica` },
            { profileId: profile.id, platform: "LinkedIn", content: `${profile.businessName} is proud to serve the ${profile.location} community.` }
        ];
    }
    
    const createdPosts = await storage.createSocialPosts(posts);
    res.status(201).json(createdPosts);
  });
  
  app.get(api.social.list.path, async (req, res) => {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      
      const posts = await storage.getSocialPosts(profile.id);
      res.json(posts);
  });

  // Invoices
  app.post(api.invoices.create.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;
    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });
    
    const input = api.invoices.create.input.parse(req.body);
    const invoice = await storage.createInvoice(profile.id, input);
    res.status(201).json(invoice);
  });
  
  app.get(api.invoices.list.path, async (req, res) => {
      const userId = requireAuth(req, res);
      if (!userId) return;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      
      const invoices = await storage.getInvoices(profile.id);
      res.json(invoices);
  });

  // -------------------------
  // Job Tenders (Business)
  // -------------------------
  app.get(api.tenders.list.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const list = await storage.listTenders();
    res.json(list);
  });

  app.get(api.tenders.get.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const tenderId = Number(req.params.id);
    if (!Number.isFinite(tenderId)) return res.status(400).json({ message: "Invalid id" });

    const tender = await storage.getTender(tenderId);
    if (!tender) return res.status(404).json({ message: "Tender not found" });
    res.json(tender);
  });

  app.get(api.tenders.myBid.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const tenderId = Number(req.params.id);
    if (!Number.isFinite(tenderId)) return res.status(400).json({ message: "Invalid id" });

    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });

    const bid = await storage.getMyTenderBid(tenderId, profile.id);
    if (!bid) return res.status(404).json({ message: "Bid not found" });
    res.json(bid);
  });

  app.post(api.tenders.submitBid.path, async (req, res) => {
    const userId = requireAuth(req, res);
    if (!userId) return;

    const tenderId = Number(req.params.id);
    if (!Number.isFinite(tenderId)) return res.status(400).json({ message: "Invalid id" });

    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });

    const tender = await storage.getTender(tenderId);
    if (!tender) return res.status(404).json({ message: "Tender not found" });
    if (tender.status !== "open") return res.status(400).json({ message: "Tender is not open" });

    try {
      const input = api.tenders.submitBid.input.parse(req.body);
      const bid = await storage.upsertTenderBid(tenderId, profile.id, input);
      res.status(201).json(bid);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  // -------------------------
  // Job Tenders (Admin)
  // -------------------------
  app.get(api.adminTenders.list.path, async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const list = await storage.listTenders();
    res.json(list);
  });

  app.post(api.adminTenders.create.path, async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    try {
      const input = api.adminTenders.create.input.parse(req.body);
      const deadlineAt = input.deadlineAt === undefined ? undefined : input.deadlineAt ? new Date(input.deadlineAt) : null;
      const created = await storage.createTender(admin.userId, {
        ...input,
        deadlineAt,
      } as any);
      res.status(201).json(created);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.patch(api.adminTenders.update.path, async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const tenderId = Number(req.params.id);
    if (!Number.isFinite(tenderId)) return res.status(400).json({ message: "Invalid id" });

    const existing = await storage.getTender(tenderId);
    if (!existing) return res.status(404).json({ message: "Tender not found" });

    try {
      const input = api.adminTenders.update.input.parse(req.body);
      const deadlineAt = input.deadlineAt === undefined ? undefined : input.deadlineAt ? new Date(input.deadlineAt) : null;
      const updated = await storage.updateTender(tenderId, {
        ...input,
        deadlineAt,
      } as any);
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.get(api.adminTenders.bids.path, async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const tenderId = Number(req.params.id);
    if (!Number.isFinite(tenderId)) return res.status(400).json({ message: "Invalid id" });

    const tender = await storage.getTender(tenderId);
    if (!tender) return res.status(404).json({ message: "Tender not found" });

    const bids = await storage.listTenderBidsAdmin(tenderId);
    res.json(bids);
  });

  app.patch(api.adminTenders.updateBidStatus.path, async (req, res) => {
    const admin = await requireAdmin(req, res);
    if (!admin) return;

    const bidId = Number(req.params.id);
    if (!Number.isFinite(bidId)) return res.status(400).json({ message: "Invalid id" });

    try {
      const input = api.adminTenders.updateBidStatus.input.parse(req.body);
      const updated = await storage.updateTenderBidStatus(bidId, input.status);
      if (!updated) return res.status(404).json({ message: "Bid not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  return httpServer;
}
