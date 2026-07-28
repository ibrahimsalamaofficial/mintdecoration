// Products Page
document.addEventListener("DOMContentLoaded", () => {
    const page = document.querySelector(".products-page");
    if (!page) return;

    const filter = page.querySelector(".products-filter");
    const overlay = page.querySelector(".filter-overlay");
    const products = [...page.querySelectorAll(".products-results > .products > .product")];
    const count = page.querySelector(".results-count");
    const noResults = page.querySelector(".no-results");
    const grid = page.querySelector(".products-results > .products");
    const sort = page.querySelector(".sort");
    const sortDropdown = sort?.querySelector(".sort-dropdown");
    const sortTrigger = sort?.querySelector(".sort-trigger");
    const sortCurrent = sort?.querySelector(".sort-current");
    const sortOptions = [...(sort?.querySelectorAll(".sort-option") || [])];
    const from = page.querySelector("#price-from");
    const to = page.querySelector("#price-to");

    const closeFilter = () => {
        filter.classList.remove("active");
        overlay.classList.remove("active");
        document.body.style.overflow = "";
    };

    page.querySelector(".open-filter")?.addEventListener("click", () => {
        filter.classList.add("active");
        overlay.classList.add("active");
        document.body.style.overflow = "hidden";
    });
    page.querySelector(".close-filter")?.addEventListener("click", closeFilter);
    overlay?.addEventListener("click", closeFilter);

    page.querySelectorAll(".filter-title").forEach(button => {
        button.addEventListener("click", () => button.closest(".filter-group").classList.toggle("active"));
    });

    const selected = type => [...page.querySelectorAll(`[data-filter="${type}"]:checked`)].map(input => input.value);
    const applyFilters = () => {
        const categories = selected("category");
        const colors = selected("color");
        const minimum = Number(from.value) || 0;
        const maximum = Number(to.value) || Infinity;
        let visible = 0;

        products.forEach((product, index) => {
            const categoryText = product.querySelector(".category")?.textContent.trim() || "";
            const productCategory = index === 6 ? "hinges" :
                index === 7 ? "accessories" :
                index === 4 || index === 8 ? "door-hardware" : "handles";
            const productColors = [...product.querySelectorAll(".product-colors .color")]
                .flatMap(color => [...color.classList])
                .filter(color => ["gold", "black", "silver"].includes(color));
            const priceText = product.querySelector(".product-price")?.textContent || "0";
            const productPrice = Number((priceText.replace(/,/g, "").match(/\d+(\.\d+)?/) || ["0"])[0]);
            const match = (!categories.length || categories.includes(productCategory)) &&
                (!colors.length || colors.some(color => productColors.includes(color))) &&
                productPrice >= minimum &&
                productPrice <= maximum;
            product.hidden = !match;
            if (match) visible++;
        });

        count.textContent = visible;
        noResults.hidden = visible !== 0;
        grid.hidden = visible === 0;
    };

    page.querySelectorAll(".products-filter input").forEach(input => input.addEventListener("input", applyFilters));
    page.querySelector(".clear-filter")?.addEventListener("click", () => {
        page.querySelectorAll('.products-filter input[type="checkbox"]').forEach(input => input.checked = false);
        from.value = "";
        to.value = "";
        applyFilters();
    });

    const sortProducts = value => {
        [...products].sort((a, b) => {
            const price = product => Number(((product.querySelector(".product-price")?.textContent || "0").replace(/,/g, "").match(/\d+(\.\d+)?/) || ["0"])[0]);
            const name = product => product.querySelector(".product-name")?.textContent.trim() || "";
            if (value === "low") return price(a) - price(b);
            if (value === "high") return price(b) - price(a);
            if (value === "name") return name(a).localeCompare(name(b));
            return products.indexOf(a) - products.indexOf(b);
        }).forEach(product => grid.append(product));
    };

    const setSortOpen = open => {
        sortDropdown?.classList.toggle("open", open);
        sortTrigger?.setAttribute("aria-expanded", String(open));
    };

    const chooseSort = option => {
        sortOptions.forEach(item => {
            const selected = item === option;
            item.classList.toggle("active", selected);
            item.setAttribute("aria-selected", String(selected));
        });
        sortCurrent.textContent = option.textContent;
        setSortOpen(false);
        sortProducts(option.dataset.value);
    };

    sortTrigger?.addEventListener("click", () => setSortOpen(!sortDropdown.classList.contains("open")));
    sortTrigger?.addEventListener("keydown", event => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setSortOpen(!sortDropdown.classList.contains("open"));
        }
        if (event.key === "Escape") setSortOpen(false);
    });
    sortOptions.forEach(option => {
        option.addEventListener("click", () => chooseSort(option));
        option.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                chooseSort(option);
                sortTrigger.focus();
            }
        });
    });
    document.addEventListener("click", event => {
        if (sortDropdown && !sortDropdown.contains(event.target)) setSortOpen(false);
    });

    applyFilters();
});
