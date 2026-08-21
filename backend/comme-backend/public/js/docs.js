/* ============================================================
   Comme API Docs — Interactive Scripts
   ============================================================ */

// ── Clipboard Helpers ────────────────────────────────────────
function copyCode(btn, elementId) {
    const el = document.getElementById(elementId);
    if (!el) return;
    navigator.clipboard.writeText(el.innerText).then(() => {
        const orig = btn.innerText;
        btn.innerText = 'Copied!';
        btn.style.color = 'var(--brand-teal)';
        setTimeout(() => { btn.innerText = orig; btn.style.color = ''; }, 1800);
    });
}

function copyCurl(btn, method, path, body = null) {
    const baseUrl = window.location.origin;
    let cmd = `curl -X ${method} "${baseUrl}${path}" \\\n  -H "Accept: application/json"`;

    if (method !== 'GET' && method !== 'DELETE') {
        cmd += ` \\\n  -H "Content-Type: application/json"`;
    }
    cmd += ` \\\n  -H "Authorization: Bearer YOUR_TOKEN"`;

    if (body) {
        cmd += ` \\\n  -d '${JSON.stringify(body, null, 2)}'`;
    }

    navigator.clipboard.writeText(cmd).then(() => {
        const orig = btn.innerText;
        btn.innerText = 'cURL Copied!';
        btn.style.color = 'var(--brand-teal)';
        setTimeout(() => { btn.innerText = orig; btn.style.color = ''; }, 1800);
    });
}

// ── Drawer Toggle ────────────────────────────────────────────
function toggleDrawer(open = null) {
    const drawer = document.getElementById('docsDrawer');
    const overlay = document.getElementById('drawerOverlay');
    if (!drawer || !overlay) return;

    const shouldOpen = open !== null ? open : !drawer.classList.contains('active');
    if (shouldOpen) {
        drawer.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ── Theme Manager ────────────────────────────────────────────
function getSystemTheme() {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode) {
    const resolved = mode === 'system' ? getSystemTheme() : mode;
    document.documentElement.setAttribute('data-theme', resolved);

    // Update toggle button states
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === mode);
    });

    // Update theme-aware SVG icons (white for dark, black for light)
    const suffix = resolved === 'dark' ? 'white' : 'black';
    document.querySelectorAll('.icon-themed').forEach(img => {
        const src = img.getAttribute('src') || '';
        if (src.includes('-white.svg') || src.includes('-black.svg')) {
            img.setAttribute('src', src.replace(/-(white|black)\.svg/, `-${suffix}.svg`));
        }
    });
}

function setTheme(mode) {
    localStorage.setItem('comme-theme', mode);
    applyTheme(mode);
}

function initTheme() {
    const saved = localStorage.getItem('comme-theme') || 'dark';
    applyTheme(saved);

    // Listen for OS theme changes when in system mode
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
        if (localStorage.getItem('comme-theme') === 'system') {
            applyTheme('system');
        }
    });
}

// ── Active Nav Link Detection ────────────────────────────────
function updateActiveNavLink() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    const currentHash = window.location.hash.replace('#', '');
    const allLinks = document.querySelectorAll('.nav-page-link');

    // Remove all active states
    allLinks.forEach(link => link.classList.remove('active'));

    // If we're on a non-root page (e.g. /explore), highlight that page link
    if (currentPath !== '/' && currentPath !== '') {
        allLinks.forEach(link => {
            const linkPage = link.dataset.page || '';
            if (linkPage === currentPath && !link.dataset.hash) {
                link.classList.add('active');
                openParentGroup(link);
            }
        });
        return;
    }

    // On root page: find which section is currently visible (scroll spy)
    if (currentHash) {
        // Hash in URL — activate that link
        activateLinkByHash(currentHash);
    } else {
        // No hash — run scroll spy to find the closest visible section
        scrollSpyUpdate();
    }
}

function activateLinkByHash(hash) {
    const allLinks = document.querySelectorAll('.nav-page-link');
    allLinks.forEach(link => link.classList.remove('active'));

    allLinks.forEach(link => {
        if (link.dataset.hash === hash) {
            link.classList.add('active');
            openParentGroup(link);
        }
    });
}

function openParentGroup(link) {
    const group = link.closest('.nav-group');
    if (group) group.classList.add('open');
}

function scrollSpyUpdate() {
    const currentPath = window.location.pathname.replace(/\/$/, '') || '/';
    if (currentPath !== '/' && currentPath !== '') return;

    // Get all elements on the page that have IDs matching our nav links
    const navLinks = document.querySelectorAll('.nav-page-link[data-hash]');
    let activeHash = null;
    let closestDistance = Infinity;

    navLinks.forEach(link => {
        const hash = link.dataset.hash;
        if (!hash) return;
        const target = document.getElementById(hash);
        if (!target) return;

        const rect = target.getBoundingClientRect();
        const distance = Math.abs(rect.top - 100); // 100px offset from top

        // Find the section closest to the viewport top
        if (rect.top <= 150 && distance < closestDistance) {
            closestDistance = distance;
            activeHash = hash;
        }
    });

    // If nothing scrolled into view yet, default to the first section
    if (!activeHash) {
        const firstLink = document.querySelector('.nav-page-link[data-page="/"][data-hash]');
        if (firstLink) activeHash = firstLink.dataset.hash;
    }

    if (activeHash) {
        activateLinkByHash(activeHash);
    }
}

// ── DOM Ready ────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    // Init theme
    initTheme();

    const toggleBtn = document.getElementById('menuToggleBtn');
    const closeBtn = document.getElementById('drawerCloseBtn');
    const overlay = document.getElementById('drawerOverlay');
    const searchInput = document.getElementById('docsSearch');
    const drawerSearchInput = document.getElementById('drawerSearch');

    // Drawer open/close
    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDrawer(true);
        });
    }

    if (closeBtn) {
        closeBtn.addEventListener('click', () => toggleDrawer(false));
    }

    if (overlay) {
        overlay.addEventListener('click', () => toggleDrawer(false));
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') toggleDrawer(false);
        if (e.key === '/' && document.activeElement !== searchInput && document.activeElement !== drawerSearchInput) {
            e.preventDefault();
            searchInput?.focus();
        }
    });

    // Close drawer on nav link click
    document.querySelectorAll('.docs-drawer .nav-link').forEach(link => {
        link.addEventListener('click', () => toggleDrawer(false));
    });

    // Collapsible nav groups
    document.querySelectorAll('.nav-group-toggle').forEach(toggle => {
        toggle.addEventListener('click', () => {
            const group = toggle.closest('.nav-group');
            if (group) group.classList.toggle('open');
        });
    });

    // Header search → filter main content endpoint cards
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.endpoint-card').forEach(card => {
                card.style.display = card.innerText.toLowerCase().includes(query) ? '' : 'none';
            });
        });
    }

    // Drawer search → filter nav links
    if (drawerSearchInput) {
        drawerSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            document.querySelectorAll('.nav-group').forEach(group => {
                const links = group.querySelectorAll('.nav-link');
                let hasMatch = false;

                links.forEach(link => {
                    const match = !query || link.innerText.toLowerCase().includes(query);
                    link.style.display = match ? '' : 'none';
                    if (match) hasMatch = true;
                });

                group.style.display = hasMatch || !query ? '' : 'none';
                if (query && hasMatch) group.classList.add('open');
                else if (!query) group.classList.remove('open');
            });
        });
    }

    // Theme toggle buttons
    document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => setTheme(btn.dataset.theme));
    });

    // Active link detection — run on load
    updateActiveNavLink();

    // Scroll spy for active link on docs page
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
        if (!scrollTicking) {
            window.requestAnimationFrame(() => {
                scrollSpyUpdate();
                scrollTicking = false;
            });
            scrollTicking = true;
        }
    });

    // Update active link on hash change
    window.addEventListener('hashchange', () => {
        updateActiveNavLink();
    });
});
