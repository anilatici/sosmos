(function () {
  const header = document.querySelector(".site-header");
  const menuToggle = document.querySelector(".menu-toggle");
  const navMenu = document.querySelector(".nav-menu");
  const current = window.location.pathname.split("/").pop() || "index.html";
  const isHomePage = current === "index.html";
  const reviewsEndpoint = window.SOSMOS_REVIEWS_API_URL || "/api/google-reviews";

  const onScroll = () => {
    if (!header) return;
    header.classList.toggle("scrolled", !isHomePage || window.scrollY > 24);
  };

  onScroll();
  window.addEventListener("scroll", onScroll);

  if (menuToggle && navMenu) {
    menuToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("open");
      menuToggle.setAttribute("aria-expanded", String(isOpen));
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    navMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("open");
        menuToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === current) {
      link.classList.add("active");
      link.setAttribute("aria-current", "page");
    }
  });

  const revealItems = Array.from(document.querySelectorAll(".reveal"));
  revealItems.forEach((el, index) => {
    el.style.setProperty("--item-index", index);
  });

  if ("IntersectionObserver" in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );

    revealItems.forEach((el) => observer.observe(el));
  } else {
    revealItems.forEach((el) => el.classList.add("visible"));
  }

  const menuTabs = document.querySelectorAll(".menu-tab");
  menuTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      menuTabs.forEach((other) => other.classList.remove("active"));
      tab.classList.add("active");
    });
  });

  const filterButtons = document.querySelectorAll(".filter-btn");
  const galleryCards = document.querySelectorAll(".gallery-card[data-category]");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const filter = button.dataset.filter;
      filterButtons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      galleryCards.forEach((card) => {
        const categories = (card.dataset.category || "").split(" ");
        const show = filter === "all" || categories.includes(filter);
        card.style.display = show ? "block" : "none";
      });
    });
  });

  const lightbox = document.querySelector(".lightbox");
  if (lightbox && galleryCards.length) {
    const lightboxInner = lightbox.querySelector(".lightbox-image");
    const caption = lightbox.querySelector(".lightbox-caption");
    const prevBtn = lightbox.querySelector(".lightbox-prev");
    const nextBtn = lightbox.querySelector(".lightbox-next");
    const closeBtn = lightbox.querySelector(".lightbox-close");
    let index = 0;

    const visibleCards = () =>
      Array.from(galleryCards).filter((card) => card.style.display !== "none");

    const renderLightbox = () => {
      const cards = visibleCards();
      if (!cards.length) return;
      const card = cards[index];
      const source = card.querySelector("img, .img-placeholder");
      if (!source) return;
      const clone = source.cloneNode(true);
      if (clone.tagName && clone.tagName.toLowerCase() === "img") {
        clone.classList.remove("menu-image-main");
      }
      lightboxInner.innerHTML = "";
      lightboxInner.appendChild(clone);
      caption.textContent = card.dataset.caption || "Gallery image";
    };

    galleryCards.forEach((card) => {
      card.addEventListener("click", () => {
        const cards = visibleCards();
        index = Math.max(0, cards.indexOf(card));
        renderLightbox();
        lightbox.classList.add("open");
        lightbox.setAttribute("aria-hidden", "false");
      });
    });

    const step = (delta) => {
      const cards = visibleCards();
      if (!cards.length) return;
      index = (index + delta + cards.length) % cards.length;
      renderLightbox();
    };

    if (prevBtn) prevBtn.addEventListener("click", () => step(-1));
    if (nextBtn) nextBtn.addEventListener("click", () => step(1));

    const closeLightbox = () => {
      lightbox.classList.remove("open");
      lightbox.setAttribute("aria-hidden", "true");
    };

    if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
    lightbox.addEventListener("click", (event) => {
      if (event.target === lightbox) closeLightbox();
    });

    document.addEventListener("keydown", (event) => {
      if (!lightbox.classList.contains("open")) return;
      if (event.key === "Escape") closeLightbox();
      if (event.key === "ArrowLeft") step(-1);
      if (event.key === "ArrowRight") step(1);
    });
  }

  const hoursRows = document.querySelectorAll(".hours-table tbody tr[data-day]");
  if (hoursRows.length) {
    const today = new Date().getDay();
    hoursRows.forEach((row) => {
      if (Number(row.dataset.day) === today) {
        row.classList.add("today");
      }
    });
  }

  const contactForm = document.querySelector("#contactForm");
  if (contactForm) {
    const alert = document.querySelector(".success-alert");
    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      if (alert) {
        alert.style.display = "block";
        alert.setAttribute("role", "status");
      }
      contactForm.reset();
    });
  }

  const menuCardImages = document.querySelectorAll(".menu-grid .card > img");
  menuCardImages.forEach((img) => {
    if (img.closest(".menu-image-shell")) return;
    const parent = img.parentElement;
    if (!parent) return;

    const shell = document.createElement("div");
    shell.className = "menu-image-shell";
    shell.style.setProperty("--menu-bg-image", `url("${img.currentSrc || img.getAttribute("src") || ""}")`);

    const focus = img.style.getPropertyValue("--img-focus");
    if (focus) shell.style.setProperty("--img-focus", focus);

    img.classList.add("menu-image-main");
    parent.insertBefore(shell, img);
    shell.appendChild(img);
  });

  const starText = (rating) => {
    const clamped = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
    return "★".repeat(clamped) + "☆".repeat(5 - clamped);
  };

  const escapeHtml = (value) =>
    String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  let googleReviewsPromise;
  const getGoogleReviews = async () => {
    if (!googleReviewsPromise) {
      googleReviewsPromise = fetch(reviewsEndpoint, { headers: { Accept: "application/json" } })
        .then((response) => (response.ok ? response.json() : null))
        .catch(() => null);
    }
    return googleReviewsPromise;
  };

  const reviewGrid = document.querySelector("#reviewGrid");
  if (reviewGrid && current === "reviews.html") {
    const ratingSummaryText = document.querySelector("#ratingSummaryText");

    const buildReviewCard = (review) => {
      const authorName = review.authorName || "Google User";
      const avatar = authorName.charAt(0).toUpperCase();
      const rating = Number(review.rating) || 0;
      const text = review.text || "";
      const dateText = review.relativeTimeDescription || "";

      return `
        <article class="card review-card reveal visible">
          <div class="review-head">
            <div class="avatar">${escapeHtml(avatar)}</div>
            <span class="source-badge"><i class="fa-brands fa-google"></i> Google</span>
          </div>
          <div class="stars">${escapeHtml(starText(rating))}</div>
          <p>"${escapeHtml(text)}"</p>
          <small>${escapeHtml(authorName)}${dateText ? ` · ${escapeHtml(dateText)}` : ""}</small>
        </article>
      `;
    };

    const applyLiveReviews = async () => {
      try {
        const payload = await getGoogleReviews();
        if (!payload) return;
        const reviews = Array.isArray(payload.reviews) ? payload.reviews : [];
        if (!reviews.length) return;

        reviewGrid.innerHTML = reviews.map(buildReviewCard).join("");

        const rating = Number(payload.place?.rating);
        const total = Number(payload.place?.userRatingsTotal);
        if (ratingSummaryText && Number.isFinite(rating) && Number.isFinite(total)) {
          ratingSummaryText.textContent = `${rating.toFixed(1)}/5 based on ${total} Google reviews`;
        }
      } catch (_) {
        // Keep static fallback reviews when live fetch fails.
      }
    };

    applyLiveReviews();
  }

})();
