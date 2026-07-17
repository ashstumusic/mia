((d) => {
    const $ = (s, c) => (c || d).querySelector(s);
    const $$ = (s, c) => (c || d).querySelectorAll(s);

    const nav = $('#nav');
    const hero = $('#hero');
    const navAnchors = $$('.nav-links a');
    const sections = [...navAnchors].map(a => $(a.hash));
    const toggle = $('.menu-toggle');
    const navLinks = $('.nav-links');
    const contactForm = $('#contact-form');
    const formStatus = $('#form-status');
    const scrollHint = $('.scroll-hint');
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

    let ticking = false, menuLock = false, submitting = false;

    // ─── SCROLL: nav glass + scroll-spy (single rAF-batched handler) ───
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            const sy = scrollY;
            nav.classList.toggle('scrolled', sy > 40);
            nav.classList.toggle('on-hero', sy < hero.offsetHeight - 80);
            if (scrollHint) scrollHint.style.opacity = sy > 100 ? '0' : '';
            const threshold = sy + 200;
            let active = -1;
            for (let i = sections.length - 1; i >= 0; i--) {
                if (sections[i] && sections[i].offsetTop <= threshold) { active = i; break; }
            }
            navAnchors.forEach((a, i) => a.classList.toggle('active', i === active));
            ticking = false;
        });
    }
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });

    // ─── MOBILE MENU (debounced toggle) ───
    toggle.addEventListener('click', (e) => {
        e.stopImmediatePropagation();
        if (menuLock) return;
        menuLock = true;
        setTimeout(() => menuLock = false, 350);
        const open = navLinks.classList.toggle('open');
        toggle.classList.toggle('active');
        toggle.setAttribute('aria-expanded', String(open));
    });
    navLinks.addEventListener('click', (e) => { if (e.target.closest('a')) closeMenu(); });
    d.addEventListener('click', (e) => {
        if (!menuLock && navLinks.classList.contains('open') && !navLinks.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });
    function closeMenu() {
        navLinks.classList.remove('open');
        toggle.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    }

    // ─── FADE-IN (single IntersectionObserver) ───
    const targets = $$('.section-header,.gallery-item,.about-text,.about-images,.statement-content,.cv-content,.ig-header,.ig-grid,.ig-follow,.contact-content,.footer-inner');
    if (reducedMotion) {
        targets.forEach(el => el.classList.add('visible'));
    } else {
        targets.forEach(el => el.classList.add('fade-in'));
        const obs = new IntersectionObserver((entries) => {
            entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); } });
        }, { threshold: 0.05, rootMargin: '0px 0px 50px 0px' });
        targets.forEach(el => obs.observe(el));
    }

    // ─── NAV NAME → TOP ───
    $('.nav-name').addEventListener('click', () => scrollTo({ top: 0, behavior: 'smooth' }));

    // ─── CONTACT FORM ───
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            if (submitting) return;
            submitting = true;
            const btn = $('.form-submit', contactForm);
            btn.disabled = true;
            btn.textContent = 'Sending...';
            formStatus.textContent = '';
            formStatus.className = 'form-status';
            fetch(contactForm.action, { method: 'POST', body: new FormData(contactForm), headers: { Accept: 'application/json' } })
                .then(r => { if (!r.ok) throw 0; formStatus.textContent = '✓ Message sent. Thank you!'; formStatus.className = 'form-status success'; contactForm.reset(); })
                .catch(() => { formStatus.textContent = '✗ Something went wrong. Please try again.'; formStatus.className = 'form-status error'; })
                .finally(() => { btn.disabled = false; btn.textContent = 'Submit'; submitting = false; });
        });
    }


})(document);
