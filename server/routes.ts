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

  // Get SME Profile (Current User)
  app.get(api.sme.get.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    
    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(404).json({ message: "Profile not found" });
    
    res.json(profile);
  });

  // Create SME Profile
  app.post(api.sme.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;

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
      // Basic admin check - for MVP, anyone logged in with a specific email or just "admin" role if we had it.
      // For now, we'll just check if they are authenticated, or check against a hardcoded email if available in claims.
      if (!req.isAuthenticated()) return res.sendStatus(401);
      
      const stats = await storage.getStats();
      res.json(stats);
  });

  // Redeem Voucher
  app.post(api.vouchers.redeem.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
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
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const count = req.body.count || 10;
      const codes = await storage.createVouchers(count);
      res.status(201).json(codes);
  });
  
  app.get(api.vouchers.list.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const vouchers = await storage.getAllVouchers();
      res.json(vouchers);
  });

  // Website Builder - Generate Draft (AI)
  app.post(api.website.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
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
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const userId = (req.user as any).claims.sub;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      
      const draft = await storage.getWebsiteDraft(profile.id);
      if (!draft) return res.status(404).json({ message: "Draft not found" });
      
      res.json(draft);
  });

  app.post(api.website.publish.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const userId = (req.user as any).claims.sub;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(400).json({ message: "Create a profile first" });
      
      const { slug } = req.body;
      const draft = await storage.updateWebsiteDraft(profile.id, { isPublished: true, slug });
      
      res.json({ url: `/site/${slug}` });
  });

  // Social Media Drafts
  app.post(api.social.generate.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
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
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const userId = (req.user as any).claims.sub;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      
      const posts = await storage.getSocialPosts(profile.id);
      res.json(posts);
  });

  // Invoices
  app.post(api.invoices.create.path, async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    const userId = (req.user as any).claims.sub;
    const profile = await storage.getSmeProfile(userId);
    if (!profile) return res.status(400).json({ message: "Create a profile first" });
    
    const input = api.invoices.create.input.parse(req.body);
    const invoice = await storage.createInvoice(profile.id, input);
    res.status(201).json(invoice);
  });
  
  app.get(api.invoices.list.path, async (req, res) => {
      if (!req.isAuthenticated()) return res.sendStatus(401);
      const userId = (req.user as any).claims.sub;
      const profile = await storage.getSmeProfile(userId);
      if (!profile) return res.status(404).json({ message: "Profile not found" });
      
      const invoices = await storage.getInvoices(profile.id);
      res.json(invoices);
  });

  return httpServer;
}
