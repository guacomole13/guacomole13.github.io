/**
 * First-Time Reveal System
 *
 * Elements with [data-reveal] fade in + translate when first entering viewport.
 * - Triggers once per element, never replays
 * - Respects prefers-reduced-motion
 * - Supports stagger via data-reveal-delay="100" (ms)
 */

export function initReveal(): void {
    // Skip if reduced motion is preferred
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        // Make all elements visible immediately
        document.querySelectorAll("[data-reveal]").forEach((el) => {
            el.classList.add("revealed");
        });
        return;
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const el = entry.target as HTMLElement;
                    const delay = parseInt(el.dataset.revealDelay || "0", 10);

                    setTimeout(() => {
                        el.classList.add("revealed");
                    }, delay);

                    // Unobserve - trigger once only
                    observer.unobserve(el);
                }
            });
        },
        {
            threshold: 0.1,
            rootMargin: "0px 0px -50px 0px",
        },
    );

    document.querySelectorAll("[data-reveal]").forEach((el) => {
        observer.observe(el);
    });
}

// Auto-initialize on DOM ready
if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initReveal);
    } else {
        initReveal();
    }

    // Re-initialize on Astro page transitions
    document.addEventListener("astro:page-load", initReveal);
}
