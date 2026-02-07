/**
 * Mobile Menu Controller
 * 
 * Handles off-canvas menu interactions:
 * - Open/close state
 * - Body scroll lock
 * - Focus trap
 * - ESC key closes
 * - Return focus to hamburger on close
 * - Backdrop click closes
 * - Nav link click closes then navigates
 */

(function initMobileMenu() {
    const menuToggle = document.getElementById('menu-toggle') as HTMLButtonElement | null;
    const menuClose = document.getElementById('menu-close') as HTMLButtonElement | null;
    const menu = document.getElementById('mobile-menu');
    const backdrop = document.getElementById('mobile-backdrop');
    const navLinks = menu?.querySelectorAll('[data-nav-link]');

    if (!menuToggle || !menuClose || !menu || !backdrop) return;

    // State
    let isOpen = false;
    let previousActiveElement: HTMLElement | null = null;

    // Get all focusable elements in menu
    function getFocusableElements(): HTMLElement[] {
        const focusable = menu!.querySelectorAll<HTMLElement>(
            'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        return Array.from(focusable);
    }

    function openMenu() {
        if (isOpen) return;
        isOpen = true;

        // Store current focus
        previousActiveElement = document.activeElement as HTMLElement;

        // Update ARIA
        menuToggle!.setAttribute('aria-expanded', 'true');
        menu!.setAttribute('aria-hidden', 'false');

        // Show menu and backdrop
        menu!.classList.add('open');
        backdrop!.classList.add('open');

        // Lock body scroll
        document.documentElement.style.overflow = 'hidden';

        // Focus first focusable element (close button)
        requestAnimationFrame(() => {
            menuClose!.focus();
        });

        // Dispatch event for header script
        document.dispatchEvent(new CustomEvent('menu-opened'));
    }

    function closeMenu() {
        if (!isOpen) return;
        isOpen = false;

        // Update ARIA
        menuToggle!.setAttribute('aria-expanded', 'false');
        menu!.setAttribute('aria-hidden', 'true');

        // Hide menu and backdrop
        menu!.classList.remove('open');
        backdrop!.classList.remove('open');

        // Unlock body scroll
        document.documentElement.style.overflow = '';

        // Return focus to hamburger
        if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
            previousActiveElement.focus();
        }

        // Dispatch event for header script
        document.dispatchEvent(new CustomEvent('menu-closed'));
    }

    // Focus trap
    function handleTabKey(e: KeyboardEvent) {
        if (!isOpen) return;

        const focusable = getFocusableElements();
        if (focusable.length === 0) return;

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
            // Shift + Tab: going backwards
            if (document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            }
        } else {
            // Tab: going forwards
            if (document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        }
    }

    // Event listeners
    menuToggle.addEventListener('click', openMenu);
    menuClose.addEventListener('click', closeMenu);
    backdrop.addEventListener('click', closeMenu);

    // ESC key closes
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            closeMenu();
        }
        if (e.key === 'Tab' && isOpen) {
            handleTabKey(e);
        }
    });

    // Nav links: close menu then navigate
    navLinks?.forEach((link) => {
        link.addEventListener('click', (e) => {
            // Close menu (navigation happens after)
            closeMenu();
            // Let the default link behavior happen
        });
    });

    // Close on route change (Astro view transitions)
    document.addEventListener('astro:before-swap', closeMenu);
    document.addEventListener('astro:page-load', closeMenu);
})();
