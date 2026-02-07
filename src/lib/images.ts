/**
 * Image Resolver Helper
 * 
 * Uses import.meta.glob to index all images in src/assets/ and provides
 * a function to retrieve ImageMetadata for Astro's <Image> component.
 * 
 * Usage in JSON: use relative key like "films/example/thumb.jpg"
 * Usage in Astro: const image = getImage("films/example/thumb.jpg")
 */

// Index all images in src/assets/
// The eager: true option loads them synchronously
const images = import.meta.glob<{ default: ImageMetadata }>(
    '/src/assets/**/*.{jpg,jpeg,png,webp,avif}',
    { eager: true }
);

/**
 * Get ImageMetadata for an image key.
 * 
 * @param key - Relative path within src/assets/, e.g. "films/example/thumb.jpg"
 * @returns ImageMetadata for use with Astro's <Image> component, or undefined if not found
 */
export function getImage(key: string): ImageMetadata | undefined {
    // Normalize the key to match the glob pattern
    const fullPath = `/src/assets/${key}`;

    const imageModule = images[fullPath];

    if (!imageModule) {
        console.warn(`[Image Resolver] Image not found: ${key}`);
        console.warn(`[Image Resolver] Looked for: ${fullPath}`);
        console.warn(`[Image Resolver] Available images:`, Object.keys(images));
        return undefined;
    }

    return imageModule.default;
}

/**
 * Check if an image exists without logging warnings.
 * Useful for conditional rendering.
 */
export function hasImage(key: string): boolean {
    const fullPath = `/src/assets/${key}`;
    return fullPath in images;
}

/**
 * Get all available image keys.
 * Useful for debugging.
 */
export function getAllImageKeys(): string[] {
    return Object.keys(images).map(path =>
        path.replace('/src/assets/', '')
    );
}
