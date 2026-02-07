/**
 * Mobile Header Hide/Show Script
 * 
 * Hides header on scroll down, shows on scroll up.
 * Uses hysteresis to prevent jitter.
 * Pauses while mobile menu is open.
 */

(function initMobileHeader() {
    const header = document.getElementById('mobile-header');
    if (!header) return;

    // Configuration
    const HIDE_THRESHOLD = 50;      // Pixels scrolled before hiding
    const HYSTERESIS = 10;          // Minimum direction change to toggle

    // State
    let lastScrollY = window.scrollY;
    let lastDirection: 'up' | 'down' | null = null;
    let accumulatedScroll = 0;
    let isMenuOpen = false;
    let ticking = false;

    // Listen for menu open/close events
    document.addEventListener('menu-opened', () => {
        isMenuOpen = true;
    });

    document.addEventListener('menu-closed', () => {
        isMenuOpen = false;
    });

    function updateHeader() {
        // Don't hide/show while menu is open
        if (isMenuOpen) {
            header?.classList.remove('hidden');
            return;
        }

        const currentScrollY = window.scrollY;
        const delta = currentScrollY - lastScrollY;

        // Determine scroll direction
        if (delta > 0) {
            // Scrolling down
            if (lastDirection === 'down') {
                accumulatedScroll += delta;
            } else {
                // Direction changed
                if (Math.abs(delta) > HYSTERESIS) {
                    lastDirection = 'down';
                    accumulatedScroll = delta;
                }
            }
        } else if (delta < 0) {
            // Scrolling up
            if (lastDirection === 'up') {
                accumulatedScroll += Math.abs(delta);
            } else {
                // Direction changed
                if (Math.abs(delta) > HYSTERESIS) {
                    lastDirection = 'up';
                    accumulatedScroll = Math.abs(delta);
                }
            }
        }

        // Apply visibility
        if (lastDirection === 'down' && accumulatedScroll > HIDE_THRESHOLD && currentScrollY > HIDE_THRESHOLD) {
            header?.classList.add('hidden');
        } else if (lastDirection === 'up') {
            header?.classList.remove('hidden');
        }

        // Always show at top of page
        if (currentScrollY < HIDE_THRESHOLD) {
            header?.classList.remove('hidden');
        }

        lastScrollY = currentScrollY;
        ticking = false;
    }

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(updateHeader);
            ticking = true;
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
})();
