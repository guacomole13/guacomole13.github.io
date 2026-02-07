/**
 * Video Preview Manager
 * 
 * Ensures only one hover preview video plays at a time across the entire page.
 * Uses a singleton pattern with CustomEvent-based broadcast for coordination.
 * 
 * How it works:
 * 1. When a video starts playing, it dispatches a 'hoverpreview:play' event
 * 2. All other HoverPreviewVideo instances listen for this event
 * 3. When they receive the event, they pause and reset if they're not the active one
 */

// The currently playing video element (singleton reference)
let currentlyPlaying: HTMLVideoElement | null = null;

/**
 * Sets the currently playing video and broadcasts to pause others.
 * Call this when a video starts playing on hover.
 * 
 * @param video - The video element that is now playing
 */
export function setCurrentlyPlaying(video: HTMLVideoElement): void {
    // If there's already a different video playing, pause it
    if (currentlyPlaying && currentlyPlaying !== video) {
        pauseAndReset(currentlyPlaying);
    }

    currentlyPlaying = video;

    // Broadcast to any other instances that might exist in iframes or separate modules
    document.dispatchEvent(new CustomEvent('hoverpreview:play', {
        detail: { videoId: video.dataset.previewId }
    }));
}

/**
 * Clears the currently playing reference.
 * Call this when a video stops (mouse leave).
 * 
 * @param video - The video element that stopped
 */
export function clearCurrentlyPlaying(video: HTMLVideoElement): void {
    if (currentlyPlaying === video) {
        currentlyPlaying = null;
    }
}

/**
 * Pauses a video and resets it to the beginning.
 * 
 * @param video - The video element to pause and reset
 */
export function pauseAndReset(video: HTMLVideoElement): void {
    video.pause();
    video.currentTime = 0;
}

/**
 * Checks if this video is the currently playing one.
 * 
 * @param video - The video element to check
 * @returns true if this video is currently playing
 */
export function isCurrentlyPlaying(video: HTMLVideoElement): boolean {
    return currentlyPlaying === video;
}

/**
 * Initializes global event listener for cross-component coordination.
 * This handles the case where multiple scripts might try to manage videos.
 */
export function initVideoPreviewManager(): void {
    // Listen for play events from other video instances
    document.addEventListener('hoverpreview:play', ((event: CustomEvent) => {
        const playingId = event.detail?.videoId;

        // If we have a currently playing video that's not the one that just started,
        // pause and reset it
        if (currentlyPlaying && currentlyPlaying.dataset.previewId !== playingId) {
            pauseAndReset(currentlyPlaying);
            currentlyPlaying = null;
        }
    }) as EventListener);
}

// Auto-initialize when this module is loaded
if (typeof document !== 'undefined') {
    // Only initialize once
    if (!(window as any).__videoPreviewManagerInitialized) {
        initVideoPreviewManager();
        (window as any).__videoPreviewManagerInitialized = true;
    }
}
