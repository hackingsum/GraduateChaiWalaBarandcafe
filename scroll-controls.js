/* ============================================
   SCROLL CONTROLS - Purely Additive JS
   Add this AFTER your script.js
   ============================================ */

(function () {
    // Auto-scroll interval in milliseconds
    const AUTO_SCROLL_DELAY = 3000;

    // Items visible at one time (matches CSS)
    function getVisible() {
        if (window.innerWidth <= 520) return 1;
        if (window.innerWidth <= 900) return 2;
        return 4;
    }

    /**
     * Sets up horizontal scroll slider for a given grid element.
     * @param {HTMLElement} grid - The .menu-grid or .gallery-grid element
     * @param {string} label    - Used for aria-labels
     */
    function initSlider(grid, label) {
        if (!grid) return;

        // --- Build wrapper ---
        const wrapper = document.createElement('div');
        wrapper.className = 'scroll-wrapper';
        grid.parentNode.insertBefore(wrapper, grid);
        wrapper.appendChild(grid);

        // --- Buttons ---
        const prevBtn = document.createElement('button');
        prevBtn.className = 'sc-btn sc-btn-prev';
        prevBtn.innerHTML = '&#8592;';
        prevBtn.setAttribute('aria-label', `Previous ${label}`);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'sc-btn sc-btn-next';
        nextBtn.innerHTML = '&#8594;';
        nextBtn.setAttribute('aria-label', `Next ${label}`);

        wrapper.appendChild(prevBtn);
        wrapper.appendChild(nextBtn);

        // --- Dot indicators ---
        const dotsContainer = document.createElement('div');
        dotsContainer.className = 'sc-dots';
        wrapper.appendChild(dotsContainer);

        // State
        let currentIndex = 0;
        let autoTimer = null;
        let items = [];
        let totalPages = 0;

        function buildDots() {
            items = Array.from(grid.children);
            const visible = getVisible();
            totalPages = Math.ceil(items.length / visible);

            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalPages; i++) {
                const dot = document.createElement('button');
                dot.className = 'sc-dot' + (i === currentIndex ? ' active' : '');
                dot.setAttribute('aria-label', `Go to page ${i + 1}`);
                dot.addEventListener('click', () => goTo(i));
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            const dots = dotsContainer.querySelectorAll('.sc-dot');
            dots.forEach((d, i) => d.classList.toggle('active', i === currentIndex));
        }

        function getScrollAmount() {
            const visible = getVisible();
            // Width of one item + gap
            const firstItem = grid.children[0];
            if (!firstItem) return 300;
            const style = window.getComputedStyle(grid);
            const gap = parseFloat(style.gap) || parseFloat(style.columnGap) || 24;
            return (firstItem.offsetWidth + gap) * visible;
        }

        function goTo(page) {
            items = Array.from(grid.children);
            const visible = getVisible();
            totalPages = Math.ceil(items.length / visible);

            // Clamp
            if (page < 0) page = totalPages - 1;
            if (page >= totalPages) page = 0;
            currentIndex = page;

            const scrollAmt = getScrollAmount() * currentIndex;
            grid.scrollTo({ left: scrollAmt, behavior: 'smooth' });
            updateDots();
        }

        function next() { goTo(currentIndex + 1); }
        function prev() { goTo(currentIndex - 1); }

        function startAuto() {
            stopAuto();
            autoTimer = setInterval(next, AUTO_SCROLL_DELAY);
        }

        function stopAuto() {
            if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
        }

        // Events
        prevBtn.addEventListener('click', () => { prev(); stopAuto(); startAuto(); });
        nextBtn.addEventListener('click', () => { next(); stopAuto(); startAuto(); });

        // Pause on hover
        wrapper.addEventListener('mouseenter', stopAuto);
        wrapper.addEventListener('mouseleave', startAuto);

        // Touch / swipe support
        let touchStartX = 0;
        grid.addEventListener('touchstart', e => {
            touchStartX = e.touches[0].clientX;
            stopAuto();
        }, { passive: true });
        grid.addEventListener('touchend', e => {
            const diff = touchStartX - e.changedTouches[0].clientX;
            if (Math.abs(diff) > 50) {
                diff > 0 ? next() : prev();
            }
            startAuto();
        }, { passive: true });

        // Rebuild on resize
        window.addEventListener('resize', () => {
            buildDots();
            goTo(0);
        });

        // Init
        buildDots();
        startAuto();
    }

    // Wait for DOM ready
    document.addEventListener('DOMContentLoaded', function () {
        initSlider(document.querySelector('#menu .menu-grid'), 'menu item');
        initSlider(document.querySelector('#Gallery .gallery-grid'), 'gallery image');
    });
})();
