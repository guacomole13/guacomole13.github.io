
const GLITCH_CHARS = "01×+?¿1$#&@*LODESTAR";

/**
 * Ease-in-out quint function for smoother start/end animation timing
 * Returns 0-1 based on input 0-1
 */
function easeInOutCubic(t: number): number {
    return t < 0.5
        ? 16 * t * t * t * t * t
        : 1 - Math.pow(-2 * t + 2, 5) / 2;
}

/**
 * Scramble text from current to new value with glitch effect
 * Uses ease-in-out timing for smooth transitions
 * Interpolates text length for smooth grow/shrink between different length strings
 */
export function scrambleTo(
    element: HTMLElement,
    newText: string,
    options: {
        duration?: number;
        steps?: number;
        revealDelay?: number;
    } = {}
): Promise<void> {
    return new Promise((resolve) => {
        const currentText = element.textContent || "";
        const startLen = currentText.length;
        const endLen = newText.length;

        const duration = options.duration ?? 650; // ms
        const steps = options.steps ?? 18;
        const revealDelay = options.revealDelay ?? 0.15; // Wait 15% before any characters start locking

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
 * Creates a continuous wave glitch effect
 * Returns a cleanup/stop function
 */
export function createGlitchWave(
    element: HTMLElement,
    text: string,
    options: { duration?: number } = {}
): () => void {
    let active = true;
    let timeoutId: NodeJS.Timeout;

    const runWave = async () => {
        if (!active) return;

        // 1. Scramble IN (Text -> Random)
        // We simulate this by just setting start text to something scrambled? 
        // Or actually, let's just use scrambleTo to resolve FROM a scrambled state.

        // Manually set scrambled state first
        const len = text.length;
        let scrambled = "";
        for (let i = 0; i < len; i++) {
            if (text[i] === " ") scrambled += " ";
            else scrambled += GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)];
        }
        element.textContent = scrambled;

        // 2. Resolve (Random -> Text)
        // Ensure first letter glitches: revealDelay > 0 handles this in scrambleTo
        await scrambleTo(element, text, {
            duration: options.duration ?? 800,
            steps: 20,
            revealDelay: 0.2 // Significant delay to ensure start glitches
        });

        if (!active) return;

        // 3. Wait then repeat
        timeoutId = setTimeout(runWave, 2000);
    };

    runWave();

    return () => {
        active = false;
        clearTimeout(timeoutId);
        element.textContent = text; // Restore original
    };
}
