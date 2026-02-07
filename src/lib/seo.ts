/**
 * SEO Helper Module
 *
 * Provides types and utilities for generating consistent SEO tags
 * including OpenGraph, Twitter Cards, and JSON-LD structured data.
 */

// Site-wide constants
export const SITE_NAME = "Michael Omole";
export const SITE_URL = "https://michaelomole.com";
export const DEFAULT_OG_IMAGE = "/og-default.jpg"; // Fallback OG image

// =========================================
// Types
// =========================================

export interface OpenGraphProps {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: "website" | "article" | "video.movie";
}

export interface TwitterCardProps {
    title: string;
    description: string;
    image?: string;
    card?: "summary" | "summary_large_image";
}

export interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    openGraph?: Partial<OpenGraphProps>;
    twitter?: Partial<TwitterCardProps>;
    jsonLd?: object | object[];
}

// =========================================
// JSON-LD Schema Generators
// =========================================

/**
 * Generate Person schema for site-wide use
 */
export function generatePersonSchema() {
    return {
        "@context": "https://schema.org",
        "@type": "Person",
        name: "Michael Omole",
        url: SITE_URL,
        jobTitle: "Filmmaker & Creative Director",
        sameAs: [
            "https://www.instagram.com/omo.omole",
            "https://www.youtube.com/@omo.omole1",
        ],
    };
}

/**
 * Generate VideoObject schema for film pages
 */
export function generateVideoSchema(film: {
    title: string;
    slug: string;
    synopsis: string;
    date: string;
    youtubeId?: string;
    thumbnailUrl?: string;
    duration?: string;
}) {
    const schema: Record<string, unknown> = {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: film.title,
        description: film.synopsis,
        uploadDate: film.date,
        url: `${SITE_URL}/film/${film.slug}`,
    };

    if (film.thumbnailUrl) {
        schema.thumbnailUrl = film.thumbnailUrl;
    }

    if (film.youtubeId) {
        schema.embedUrl = `https://www.youtube-nocookie.com/embed/${film.youtubeId}`;
        schema.contentUrl = `https://www.youtube.com/watch?v=${film.youtubeId}`;
    }

    if (film.duration) {
        schema.duration = film.duration;
    }

    return schema;
}

/**
 * Generate CreativeWork schema for film pages (alternative to VideoObject)
 */
export function generateCreativeWorkSchema(film: {
    title: string;
    slug: string;
    synopsis: string;
    date: string;
    type: string;
}) {
    return {
        "@context": "https://schema.org",
        "@type": "CreativeWork",
        name: film.title,
        description: film.synopsis,
        dateCreated: film.date,
        url: `${SITE_URL}/film/${film.slug}`,
        creator: {
            "@type": "Person",
            name: "Michael Omole",
        },
        genre: film.type,
    };
}

/**
 * Get YouTube thumbnail URL from video ID
 */
export function getYouTubeThumbnail(
    youtubeId: string,
    quality: "default" | "mqdefault" | "hqdefault" | "maxresdefault" = "hqdefault"
): string {
    return `https://img.youtube.com/vi/${youtubeId}/${quality}.jpg`;
}
