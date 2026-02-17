import { z } from 'zod';
import { insertSmeProfileSchema, insertInvoiceSchema, smeProfiles, vouchers, websiteDrafts, socialPosts, invoices } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  // SME Profile
  sme: {
    get: {
      method: 'GET' as const,
      path: '/api/sme/profile' as const,
      responses: {
        200: z.custom<typeof smeProfiles.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/sme/profile' as const,
      input: insertSmeProfileSchema,
      responses: {
        201: z.custom<typeof smeProfiles.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    stats: {
      method: 'GET' as const,
      path: '/api/admin/stats' as const, // Admin only
      responses: {
        200: z.object({
          totalSmes: z.number(),
          activeSubscriptions: z.number(),
          redeemedVouchers: z.number(),
        }),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // Vouchers
  vouchers: {
    redeem: {
      method: 'POST' as const,
      path: '/api/vouchers/redeem' as const,
      input: z.object({ code: z.string() }),
      responses: {
        200: z.object({ message: z.string(), expiry: z.string() }),
        400: errorSchemas.validation, // Invalid or expired
        401: errorSchemas.unauthorized,
      },
    },
    generate: {
      method: 'POST' as const,
      path: '/api/admin/vouchers/generate' as const, // Admin only
      input: z.object({ count: z.number().min(1).max(100) }),
      responses: {
        201: z.array(z.string()), // Returns list of codes
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/admin/vouchers' as const, // Admin only
      responses: {
        200: z.array(z.custom<typeof vouchers.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // Website Builder
  website: {
    generate: {
      method: 'POST' as const,
      path: '/api/website/generate' as const,
      input: z.object({
        style: z.string(),
        // other fields inferred from profile
      }),
      responses: {
        201: z.custom<typeof websiteDrafts.$inferSelect>(),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/website/draft' as const,
      responses: {
        200: z.custom<typeof websiteDrafts.$inferSelect>(),
        404: errorSchemas.notFound,
        401: errorSchemas.unauthorized,
      },
    },
    publish: {
      method: 'POST' as const,
      path: '/api/website/publish' as const,
      input: z.object({ slug: z.string() }),
      responses: {
        200: z.object({ url: z.string() }),
        400: errorSchemas.validation,
        401: errorSchemas.unauthorized,
      },
    },
  },

  // Social Media
  social: {
    generate: {
      method: 'POST' as const,
      path: '/api/social/generate' as const,
      responses: {
        201: z.array(z.custom<typeof socialPosts.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/social/posts' as const,
      responses: {
        200: z.array(z.custom<typeof socialPosts.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },

  // Invoices
  invoices: {
    create: {
      method: 'POST' as const,
      path: '/api/invoices' as const,
      input: insertInvoiceSchema,
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
        401: errorSchemas.unauthorized,
      },
    },
    list: {
      method: 'GET' as const,
      path: '/api/invoices' as const,
      responses: {
        200: z.array(z.custom<typeof invoices.$inferSelect>()),
        401: errorSchemas.unauthorized,
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
