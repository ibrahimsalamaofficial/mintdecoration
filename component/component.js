// Header Buttons and Navigation
document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const root = document.documentElement;
    const bp = 992;

    const header = document.querySelector("header");
    const nav = document.querySelector("nav");
    const mobileNav = document.querySelector(".mobile-nav");
    const mainMenu = document.querySelector("nav .main-menu");
    const burger = document.querySelector(".mobile-nav .hamburger");
    const searchBtn = document.querySelector(".mobile-search");
    const searchBox = document.querySelector("header .search");

    const isMobile = () => innerWidth <= bp;
    const $all = (s, p = document) => [...p.querySelectorAll(s)];

    const lockBody = () => body.style.overflow = "hidden";

    const hasOpenPopup = () =>
        document.querySelector(".top-header .toggle-box:not([hidden]), .top-header .box:not([hidden])");

    const unlockBody = () => {
        if (!hasOpenPopup() && !document.querySelector("nav.nav-open")) {
            body.style.overflow = "";
        }
    };

    const setVars = () => {
        const h = header?.offsetHeight || 0;
        const bottom = header?.getBoundingClientRect().bottom || h;

        root.style.setProperty("--mobile-header-height", `${h}px`);
        root.style.setProperty("--mobile-menu-top", `${Math.max(h, bottom)}px`);
        root.style.setProperty("--mobile-nav-height", `${mobileNav?.offsetHeight || 0}px`);
    };

    const closeAllSubMenus = () => {
        $all(".sub-menu.active, .sub-sub-menu.active").forEach(m => {
            m.classList.remove("active");
            m.style.maxHeight = "";
        });

        $all(".main-link.active, .sub-link.active").forEach(l => {
            l.classList.remove("active");
        });
    };

    const closeNav = () => {
        if (!nav || !burger || !mainMenu) return;

        nav.classList.remove("nav-open");
        burger.classList.remove("active");
        mainMenu.classList.remove("active");
        closeAllSubMenus();
        unlockBody();
    };

    const closeAllPopups = (except = null) => {
        $all(".top-header .toggle-box, .top-header .box").forEach(box => {
            if (box !== except) {
                box.hidden = true;
                box.closest(".toggle")?.querySelector("button")?.setAttribute("aria-expanded", "false");
            }
        });
    };

    const openPopup = (toggle) => {
        const box = toggle.querySelector(".toggle-box, .box");
        if (!box) return;

        closeAllPopups(box);
        box.hidden = false;
        toggle.querySelector("button")?.setAttribute("aria-expanded", "true");
        closeNav();
        lockBody();
    };

    const closePopup = (toggle) => {
        const box = toggle.querySelector(".toggle-box, .box");
        if (!box) return;

        box.hidden = true;
        toggle.querySelector("button")?.setAttribute("aria-expanded", "false");
        unlockBody();
    };

    setVars();

    // Top Header Popups
    $all(".top-header .toggle").forEach(toggle => {
        const btn = toggle.querySelector("button");
        const box = toggle.querySelector(".toggle-box, .box");
        if (!btn || !box) return;

        btn.setAttribute("aria-expanded", "false");

        btn.addEventListener("click", e => {
            e.stopPropagation();
            box.hidden ? openPopup(toggle) : closePopup(toggle);
        });

        toggle.querySelector(".close")?.addEventListener("click", () => closePopup(toggle));

        box.addEventListener("click", e => {
            if (!e.target.closest(".innerbox")) closePopup(toggle);
        });
    });

    // Data Popup Triggers
    $all("[data-popup-trigger]").forEach(trigger => {
        trigger.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();

            const toggle = document.querySelector(`.top-header .toggle.${trigger.dataset.popupTrigger}`);
            if (toggle) openPopup(toggle);
        });
    });

    // Mobile Search
    searchBtn?.addEventListener("click", e => {
        e.stopPropagation();
        searchBox?.classList.toggle("active");
    });

    // Mobile Nav
    burger?.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();

        const isOpen = nav.classList.toggle("nav-open");
        burger.classList.toggle("active", isOpen);
        mainMenu.classList.toggle("active", isOpen);

        if (isOpen) {
            setVars();
            closeAllPopups();
            lockBody();
        } else {
            closeAllSubMenus();
            unlockBody();
        }
    });

    const refreshHeight = menu => {
        if (!menu || !isMobile() || !menu.classList.contains("active")) return;

        menu.style.maxHeight = "none";
        menu.style.maxHeight = `${menu.scrollHeight}px`;
    };

    const refreshParents = menu => {
        while (menu) {
            refreshHeight(menu);
            menu = menu.parentElement?.closest(".sub-menu, .sub-sub-menu");
        }
    };

    // Dropdowns Delegation
    nav?.addEventListener("click", e => {
        const link = e.target.closest(".main-li > .main-link, .sub-li > .sub-link");
        if (!link || !isMobile()) return;

        const li = link.parentElement;
        const menu = li.querySelector(":scope > .sub-menu, :scope > .sub-sub-menu");
        if (!menu) return;

        e.preventDefault();
        e.stopPropagation();

        $all(":scope > li", li.parentElement).forEach(sibling => {
            if (sibling === li) return;

            sibling.querySelector(":scope > .main-link, :scope > .sub-link")?.classList.remove("active");

            const siblingMenu = sibling.querySelector(":scope > .sub-menu, :scope > .sub-sub-menu");
            if (siblingMenu) {
                siblingMenu.classList.remove("active");
                siblingMenu.style.maxHeight = "";
            }

            $all(".active", sibling).forEach(el => el.classList.remove("active"));
            $all(".sub-menu, .sub-sub-menu", sibling).forEach(m => m.style.maxHeight = "");
        });

        const open = !menu.classList.contains("active");

        link.classList.toggle("active", open);
        menu.classList.toggle("active", open);

        if (open) {
            requestAnimationFrame(() => refreshParents(menu));
        } else {
            menu.style.maxHeight = "";
            refreshParents(li.parentElement.closest(".sub-menu, .sub-sub-menu"));
        }
    });

    // Outside Click
    document.addEventListener("click", e => {
        if (searchBox?.classList.contains("active") &&
            !searchBox.contains(e.target) &&
            !searchBtn?.contains(e.target)) {
            searchBox.classList.remove("active");
        }

        if (isMobile() && nav && burger &&
            !nav.contains(e.target) &&
            !burger.contains(e.target)) {
            closeNav();
        }
    });

});

// Hedaer Scroll Behavior
document.addEventListener("DOMContentLoaded", () => {
    const root = document.documentElement;
    const wrapper = document.querySelector(".header-wrapper");
    const topHeader = document.querySelector(".top-header");
    const header = document.querySelector("header");

    if (!wrapper || !topHeader) return;

    const breakpoint = 992;
    const scrollPoint = 100;
    const scrollThreshold = 6;

    let lastScroll = window.scrollY;
    let ticking = false;

    const isMobile = () => window.innerWidth <= breakpoint;

    const setHeaderVars = () => {
        const topHeaderHeight = topHeader.offsetHeight || 0;
        const headerHeight = header?.offsetHeight || 0;

        const hideHeight = isMobile()
            ? topHeaderHeight
            : topHeaderHeight + headerHeight;

        root.style.setProperty("--header-wrapper-top", `-${hideHeight}px`);
        root.style.setProperty("--header-wrapper-height", `${wrapper.offsetHeight}px`);
    };

    const handleHeaderScroll = () => {
        const currentScroll = window.scrollY;
        const diff = currentScroll - lastScroll;

        // قبل 100px الهيدر ظاهر دائمًا
        if (currentScroll <= scrollPoint) {
            wrapper.classList.remove("is-scrolled");
            lastScroll = currentScroll;
            ticking = false;
            return;
        }

        // تجاهل الحركات الصغيرة لمنع الـ Flickering
        if (Math.abs(diff) < scrollThreshold) {
            ticking = false;
            return;
        }

        // Scroll Down
        if (diff > 0) {
            wrapper.classList.add("is-scrolled");
        }
        // Scroll Up
        else {
            wrapper.classList.remove("is-scrolled");
        }

        lastScroll = currentScroll;
        ticking = false;
    };

    const updateHeader = () => {
        setHeaderVars();
        handleHeaderScroll();
    };

    updateHeader();

    window.addEventListener("scroll", () => {
        if (!ticking) {
            requestAnimationFrame(handleHeaderScroll);
            ticking = true;
        }
    }, { passive: true });

    window.addEventListener("resize", updateHeader);
});

// Language Switcher
document.addEventListener("DOMContentLoaded", () => {
    const langBox = document.querySelector(".language");

    if (!langBox) return;

    const confirmBtn = langBox.querySelector(".content button");

    confirmBtn.addEventListener("click", () => {
        const selectedLang = langBox.querySelector('input[name="lang"]:checked')?.value;

        if (!selectedLang) return;

        const path = window.location.pathname;

        // إزالة أول جزء (ar أو en)
        const pagePath = path.replace(/^\/(ar|en)/, "");

        // لو فتح الدومين مباشرة
        const finalPath = pagePath === "/" ? "/index.html" : pagePath;

        window.location.href = `/${selectedLang}${finalPath}`;
    });
});