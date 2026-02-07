/**
 * Role Rotator with Glitch-Scramble Transitions
 *
 * Cycles through roles with scramble effect:
 * - FILM DIRECTOR → WRITER → CREATIVE DIRECTOR → ...
 * - Hold ~1400ms, scramble ~550ms
 * - Reduced motion: show first role only, no animation
 */

const GLITCH_CHARS = "01×+?¿1$#&@*LODESTAR";

/**
 * Ease-in-out cubic function for smooth animation timing
 * Returns 0-1 based on input 0-1
 */
function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Scramble text from current to new value with glitch effect
 * Uses ease-in-out timing for smooth transitions
 * Interpolates text length for smooth grow/shrink between different length strings
 */
function scrambleTo(
    element: HTMLElement,
    newText: string,
): Promise<void> {
    return new Promise((resolve) => {
        const currentText = element.textContent || "";
        const startLen = currentText.length;
        const endLen = newText.length;
        const duration = 650; // ms
        const steps = 18;
        const revealDelay = 0.15; // Wait 15% before any characters start locking
        let step = 0;

        const interval = setInterval(() => {
            step++;
            const linearProgress = step / steps;
            // Apply ease-in-out to the progress
            const easedProgress = easeInOutCubic(linearProgress);

            // Interpolate current display length between start and end
            const currentLen = Math.round(startLen + (endLen - startLen) * easedProgress);

            // Adjusted progress for reveal (after initial scramble delay)
            // This ensures all characters glitch at the start before any lock in
            const revealProgress = Math.max(0, (easedProgress - revealDelay) / (1 - revealDelay));

            let result = "";
            for (let i = 0; i < currentLen; i++) {
                const targetChar = newText[i] || "";
                // Lock characters left-to-right based on reveal progress
                // revealProgress starts at 0 (all glitch) and ends at 1 (all locked)
                const revealThreshold = endLen * revealProgress;

                if (i < revealThreshold && targetChar) {
                    result += targetChar;
                } else if (targetChar === " ") {
                    result += " "; // Preserve spaces
                } else {
                    // Show glitch character for positions not yet revealed
                    result +=
                        GLITCH_CHARS[
                        Math.floor(Math.random() * GLITCH_CHARS.length)
                        ];
                }
            }

            element.textContent = result.trim();

            if (step >= steps) {
                clearInterval(interval);
                element.textContent = newText;
                resolve();
            }
        }, duration / steps);
    });
}

/**
 * Initialize role rotator on an element
 */
export function initRoleRotator(
    element: HTMLElement,
    roles: string[],
): void {
    if (!element || roles.length === 0) return;

    // Reduced motion: show first role only, no animation
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        element.textContent = roles[0];
        return;
    }

    let currentIndex = 0;
    element.textContent = roles[0];

    async function cycle(): Promise<void> {
        // Hold current role
        await new Promise((r) => setTimeout(r, 1400));

        // Move to next role
        currentIndex = (currentIndex + 1) % roles.length;

        // Scramble transition
        await scrambleTo(element, roles[currentIndex]);

        // Continue loop
        cycle();
    }

    // Start cycling after initial delay
    setTimeout(cycle, 2000);
}
