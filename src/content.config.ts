import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// ============================================================================
// FILM COLLECTION SCHEMA
// ============================================================================

const stillSchema = z.object({
    imageKey: z.string(),
    alt: z.string(),
    tile: z.enum(['1x1', '2x1', '1x2', '2x2']).optional(),
    focalPoint: z.object({
        x: z.number().min(0).max(1),
        y: z.number().min(0).max(1),
    }).optional(),
});

const creditSchema = z.object({
    role: z.string(),
    name: z.string(),
});

const filmSchema = z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(), // ISO date string: "2024-03-15"
    type: z.string(), // "Short Film", "Music Video", "Commercial", etc.
    youtubeId: z.string().optional(),
    instagramId: z.string().optional(),
    synopsis: z.string(),
    roles: z.array(z.string()),
    devices: z.array(z.string()).optional(), // Camera/equipment: "Sony FX3", "ARRI Alexa", etc.
    thumbnailKey: z.string(),
    previewMp4: z.string().optional(),
    duration: z.string().optional(),
    stills: z.array(stillSchema).optional(),
    credits: z.array(creditSchema).optional(),
    posterKey: z.string().optional(),
    homeFeaturedOrder: z.number().optional(),
    indexTile: z.enum(['small', 'wide', 'large']).optional(),
}).refine(data => data.youtubeId || data.instagramId, {
    message: "Film must have either a youtubeId or an instagramId",
    path: ["youtubeId"]
});

// ============================================================================
// WRITING COLLECTION SCHEMA
// ============================================================================

const writingSchema = z.object({
    title: z.string(),
    slug: z.string(),
    date: z.string(), // ISO date string
    externalUrl: z.string().url(),
    excerpt: z.string(),
    coverImageKey: z.string(),
    featuredOrder: z.number().optional(),
});

// ============================================================================
// SITE CONFIG SCHEMAS (home.json and info.json)
// ============================================================================

const socialLinkSchema = z.object({
    platform: z.enum(['instagram', 'youtube', 'linkedin']),
    url: z.string().url(),
});

const homeSchema = z.object({
    heroVideoPath: z.string(), // Path to MP4 in public/video/
    heroVideoPoster: z.string().optional(), // Fallback poster image key
    roles: z.array(z.string()), // ["FILM DIRECTOR", "WRITER", "CREATIVE DIRECTOR"]
    introParagraph: z.string(),
    email: z.string().email(),
    socialLinks: z.array(socialLinkSchema),
});

const platformSchema = z.object({
    label: z.string(),
    url: z.string().url(),
});

const infoSchema = z.object({
    artistImageKey: z.string(),
    artistImageAlt: z.string(),
    bio: z.string(),
    contact: z.object({
        email: z.string().email(),
        buttonLabel: z.string(),
        mailtoSubject: z.string().optional(),
    }),
    platforms: z.array(platformSchema),
});

// ============================================================================
// COLLECTION DEFINITIONS
// ============================================================================

const films = defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/films' }),
    schema: filmSchema,
});

const writing = defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/writing' }),
    schema: writingSchema,
});

const site = defineCollection({
    loader: glob({ pattern: '**/*.json', base: './src/content/site' }),
    schema: z.union([homeSchema, infoSchema]),
});

export const collections = { films, writing, site };

// ============================================================================
// EXPORTED TYPES
// ============================================================================

export type Film = z.infer<typeof filmSchema>;
export type Still = z.infer<typeof stillSchema>;
export type Credit = z.infer<typeof creditSchema>;
export type Writing = z.infer<typeof writingSchema>;
export type Home = z.infer<typeof homeSchema>;
export type Info = z.infer<typeof infoSchema>;
export type SocialLink = z.infer<typeof socialLinkSchema>;
export type Platform = z.infer<typeof platformSchema>;
