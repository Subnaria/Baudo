(() => {
  const links = document.getElementById("navLinks");
  const btn = document.getElementById("menuBtn");
  const baudoLogo = document.querySelector(".logo");
  const navLinks = links ? Array.from(links.querySelectorAll(".nav-link")) : [];
  const navSections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter((section) => section instanceof HTMLElement);

  const easterEggGifUrl = "img/Basic/Branding/baudo-easteregg.gif";
  let logoClickCount = 0;
  let logoClickTimer;
  let customCursor;
  let cursorLayerObserver;

  function placeCursorAboveOverlay() {
    if (!customCursor) return;
    if (customCursor.parentElement !== document.body) document.body.append(customCursor);
    if (typeof customCursor.showPopover === "function") {
      const isOpen = customCursor.matches(":popover-open");
      const hasOpenDialog = document.querySelector("dialog[open]") !== null;
      if (isOpen && hasOpenDialog) customCursor.hidePopover();
      if (!isOpen || hasOpenDialog) customCursor.showPopover();
    }
  }

  function prepareVideoIframes() {
    if (!document.body.classList.contains("easteregg-cursor-active")) return;
    document.querySelectorAll("#latestVideoPlayer iframe").forEach((iframe) => {
      if (iframe.style.pointerEvents !== "auto") iframe.style.pointerEvents = "none";
      if (!iframe.dataset.cursorEggLeaveListener) {
        iframe.addEventListener("pointerleave", restoreCursorAfterVideoInteraction);
        iframe.dataset.cursorEggLeaveListener = "true";
      }
    });
  }

  function syncCursorOverlay() {
    placeCursorAboveOverlay();
    prepareVideoIframes();
  }

  function moveCustomCursor(event) {
    if (!customCursor || (event.pointerType && event.pointerType !== "mouse")) return;
    customCursor.style.transform = `translate3d(${event.clientX - 48}px, ${event.clientY - 48}px, 0)`;
  }

  function enableVideoInteractionOnClick(event) {
    if (!document.body.classList.contains("easteregg-cursor-active")) return;

    const iframe = document.querySelector("#latestVideoPlayer iframe");
    if (!iframe) return;
    const bounds = iframe.getBoundingClientRect();
    if (event.clientX < bounds.left || event.clientX > bounds.right ||
        event.clientY < bounds.top || event.clientY > bounds.bottom) return;

    iframe.style.pointerEvents = "auto";
    document.body.classList.remove("easteregg-cursor-active");
    customCursor.style.visibility = "hidden";
  }

  function restoreCursorAfterVideoInteraction(event) {
    if (!customCursor) return;
    event.currentTarget.style.pointerEvents = "none";
    document.body.classList.add("easteregg-cursor-active");
    customCursor.style.visibility = "visible";
    moveCustomCursor(event);
  }

  function enablePcCursor(event) {
    if (!customCursor) {
      customCursor = document.createElement("img");
      customCursor.id = "easteregg-custom-cursor";
      customCursor.src = easterEggGifUrl;
      customCursor.alt = "";
      customCursor.setAttribute("aria-hidden", "true");
      customCursor.setAttribute("popover", "manual");
      document.body.append(customCursor);
      placeCursorAboveOverlay();

      window.addEventListener("pointermove", moveCustomCursor);
      window.addEventListener("pointerenter", moveCustomCursor);
      window.addEventListener("pointerleave", () => {
        customCursor.style.visibility = "hidden";
      });

      document.getElementById("latestVideoPlayer")?.addEventListener("click", enableVideoInteractionOnClick);
      cursorLayerObserver = new MutationObserver(syncCursorOverlay);
      cursorLayerObserver.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["open"],
        childList: true,
        subtree: true
      });
    }

    document.body.classList.add("easteregg-cursor-active");
    customCursor.style.visibility = "visible";
    placeCursorAboveOverlay();
    moveCustomCursor(event);
    prepareVideoIframes();
  }

  function triggerMobileAvalanche() {
    document.querySelector(".avalanche-container")?.remove();

    const container = document.createElement("div");
    container.className = "avalanche-container";
    container.setAttribute("aria-hidden", "true");

    for (let i = 0; i < 25; i += 1) {
      const gif = document.createElement("img");
      gif.src = easterEggGifUrl;
      gif.className = "avalanche-item";
      gif.alt = "";
      gif.style.left = `${Math.random() * 90}vw`;
      gif.style.animationDelay = `${Math.random() * 1.5}s`;
      gif.style.animationDuration = `${1.8 + Math.random() * 1.2}s`;
      gif.style.width = `${35 + Math.random() * 25}px`;
      container.append(gif);
    }

    document.body.append(container);
    window.setTimeout(() => container.remove(), 4500);
  }

  if (baudoLogo) {
    baudoLogo.addEventListener("click", (event) => {
      logoClickCount += 1;
      window.clearTimeout(logoClickTimer);
      logoClickTimer = window.setTimeout(() => {
        logoClickCount = 0;
      }, 3000);

      if (logoClickCount >= 10) {
        const isMobile = window.matchMedia("(pointer: coarse)").matches || window.innerWidth <= 768;
        if (isMobile) {
          triggerMobileAvalanche();
        } else {
          enablePcCursor(event);
        }

        logoClickCount = 0;
        window.clearTimeout(logoClickTimer);
      }
    });
  }


  const closeMenu = () => {
    if (!links || !btn) return;
    links.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
  };

  const setActiveNavLink = (sectionId) => {
    navLinks.forEach((link) => {
      link.classList.toggle("active", link.getAttribute("href") === `#${sectionId}`);
    });
  };

  if (navSections.length) {
    let navUpdateQueued = false;

    const updateActiveNavLink = () => {
      navUpdateQueued = false;

      const nav = document.getElementById("nav");
      const navHeight = nav?.getBoundingClientRect().height ?? 0;
      const activationLine = navHeight + Math.min(120, window.innerHeight * 0.12);
      let activeSection = navSections[0];

      for (const section of navSections) {
        if (section.getBoundingClientRect().top <= activationLine) {
          activeSection = section;
        } else {
          break;
        }
      }

      const pageBottom = document.documentElement.scrollHeight - 2;
      if (window.scrollY + window.innerHeight >= pageBottom) {
        activeSection = navSections[navSections.length - 1];
      }

      setActiveNavLink(activeSection.id);
    };

    const queueNavUpdate = () => {
      if (navUpdateQueued) return;
      navUpdateQueued = true;
      window.requestAnimationFrame(updateActiveNavLink);
    };

    window.addEventListener("scroll", queueNavUpdate, { passive: true });
    window.addEventListener("resize", queueNavUpdate);
    window.addEventListener("hashchange", queueNavUpdate);
    window.addEventListener("load", queueNavUpdate, { once: true });
    updateActiveNavLink();
  }

  if (btn && links) {
    btn.addEventListener("click", () => {
      const open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", String(open));
      document.body.classList.toggle("menu-open", open);
    });

    links.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });
  }

  const targets = document.querySelectorAll(
    ".section-heading, .social-grid, .games, .latest-video-layout, .contact-layout"
  );

  if ("IntersectionObserver" in window) {
    targets.forEach((el) => el.classList.add("reveal"));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    targets.forEach((el) => io.observe(el));
  }

  function formatSubscribers(count) {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1).replace(".", ",").replace(/,0$/, "")}K+`;
    }
    return count.toString();
  }

  async function updateSubCount() {
    const el = document.getElementById("subCount");
    if (!el) return;

    try {
      const res = await fetch("https://baudo.fr/api/subscribers", { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const count = Number(data.subscriberCount ?? 89200);
      if (!Number.isFinite(count) || count < 0) {
        throw new Error("Réponse API abonnés invalide");
      }

      let ticks = 0;
      const interval = window.setInterval(() => {
        el.textContent = `${Math.floor(Math.random() * 90) + 10}K+`;
        ticks += 1;
        if (ticks > 12) {
          window.clearInterval(interval);
          el.textContent = formatSubscribers(count);
        }
      }, 60);
    } catch (err) {
      console.error("Abonnés:", err);
      el.textContent = "81,5K+";
    }
  }

  updateSubCount();

  const gameChoices = Array.from(document.querySelectorAll("[data-game-choice]"));
  const gameDetail = document.getElementById("gameDetail");
  const gameDetailImage = document.getElementById("gameDetailImage");
  const gameDetailNumber = document.getElementById("gameDetailNumber");
  const gameDetailCategory = document.getElementById("gameDetailCategory");
  const gameDetailTitle = document.getElementById("gameDetailTitle");
  const gameDetailDescription = document.getElementById("gameDetailDescription");
  const gameBadgeText = document.getElementById("gameBadgeText");
  const gamePlatforms = document.getElementById("gamePlatforms");
  const gameRating = document.getElementById("gameRating");
  const gameRatingText = document.getElementById("gameRatingText");
  const gameDetailLink = document.getElementById("gameDetailLink");
  const gameDetailAction = document.getElementById("gameDetailAction");
  const gameVideoLink = document.getElementById("gameVideoLink");
  const storeModal = document.getElementById("storeModal");
  const storeModalTitle = document.getElementById("storeModalTitle");
  const storeModalClose = document.getElementById("storeModalClose");
  const appStoreLink = document.getElementById("appStoreLink");
  const googlePlayLink = document.getElementById("googlePlayLink");
  const appStoreIcon = document.getElementById("appStoreIcon");
  const googlePlayIcon = document.getElementById("googlePlayIcon");

  const appleIcon = '<svg class="modal-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M11 8h3v2h-3zm3-2h4v2h-4zm4 2h2v3h-2zm-2 3h2v4h-2zm2 4h2v5h-2zm-4 5h4v2h-4zm-3-2h3v2h-3zm-4 2h4v2H7zm-2-2h2v2H5zm-2-8h2v8H3zm2-2h2v2H5zm2-2h4v2H7zm5-3h2v2h-2zm2-2h2v2h-2z"/></svg>';
  const androidIcon = '<svg class="modal-icon" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12h2v6H2zm18 0h2v6h-2zM4 10h2v2H4zm4 2h2v4H8zm6 0h2v4h-2zm6-2h-2v2h2zM6 8h2v2H6zM4 6h2v2H4zM2 4h2v2H2zm16 4h-2v2h2zm2-2h-2v2h2zm2-2h-2v2h2zM8 6h8v2H8zM2 18h20v2H2z"/></svg>';
  const computerIcon = '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 18h18v-2h2v4H1v-4h2v2Zm2-4h14V6h2v10H3V6h2v8Zm14-8H5V4h14v2Z"/></svg>';
  const platformData = {
    apple: { label: "iOS", icon: appleIcon },
    mac: { label: "macOS", icon: appleIcon },
    android: { label: "Android", icon: androidIcon },
    pc: { label: "PC", icon: computerIcon },
    windows: { label: "Windows", icon: computerIcon },
    web: { label: "Web", icon: '<svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><use href="#icon-platform-web"></use></svg>' }
  };
  if (appStoreIcon) appStoreIcon.innerHTML = appleIcon;
  if (googlePlayIcon) googlePlayIcon.innerHTML = androidIcon;
  const gamePicker = document.querySelector(".game-picker");
  const galleryPrevious = document.getElementById("gameGalleryPrevious");
  const galleryNext = document.getElementById("gameGalleryNext");
  const featuredBadgeTexts = [
    "Une pépite !",
    "Banger !",
    "Gros coup de cœur !",
    "À tester absolument !",
    "Must-play !",
    "Chaud devant !"
  ];
  let previousBadgeIndex = -1;
  let changeTimer;

  function showGame(choice, animate = true) {
    gameChoices.forEach((item) => {
      const selected = item === choice;
      item.classList.toggle("is-active", selected);
      item.setAttribute("aria-pressed", String(selected));
    });

    gameDetailImage.src = choice.dataset.image;
    gameDetailImage.alt = `Bannière de ${choice.dataset.title}`;
    gameDetailNumber.textContent = choice.dataset.number;
    gameDetailCategory.textContent = choice.dataset.category;
    gameDetailTitle.textContent = choice.dataset.title;
    if (gameBadgeText) {
      let badgeIndex = Math.floor(Math.random() * featuredBadgeTexts.length);
      if (featuredBadgeTexts.length > 1 && badgeIndex === previousBadgeIndex) {
        badgeIndex = (badgeIndex + 1 + Math.floor(Math.random() * (featuredBadgeTexts.length - 1))) % featuredBadgeTexts.length;
      }
      previousBadgeIndex = badgeIndex;
      gameBadgeText.textContent = featuredBadgeTexts[badgeIndex];
    }
    gameDetailDescription.textContent = choice.dataset.description;
    if (gameRating && gameRatingText) {
      gameRating.hidden = !choice.dataset.rating;
      gameRatingText.textContent = choice.dataset.rating || "";
    }
    gameDetailLink.href = choice.dataset.link;
    gameDetailAction.textContent = choice.dataset.action;
    gameVideoLink.href = choice.dataset.video || "https://youtube.com/";
    document.documentElement.style.setProperty("--game-accent", choice.dataset.accent || "#57F5FF");

    const badges = choice.dataset.platforms.split(",").map((platform) => {
      const item = platformData[platform];
      if (!item) return null;
      const badge = document.createElement("span");
      badge.className = "platform-badge";
      badge.innerHTML = `${item.icon}<span>${item.label}</span>`;
      return badge;
    }).filter(Boolean);
    gamePlatforms.replaceChildren(...badges);

    window.clearTimeout(changeTimer);
    gameDetail.classList.remove("is-changing");
    if (animate) {
      void gameDetail.offsetWidth;
      gameDetail.classList.add("is-changing");
      changeTimer = window.setTimeout(() => gameDetail.classList.remove("is-changing"), 380);
    }
  }

  if (gameDetail && gameChoices.length) {
    showGame(gameChoices.find((choice) => choice.classList.contains("is-active")) || gameChoices[0], false);

    gameChoices.forEach((choice) => {
      choice.style.setProperty("--choice-accent", choice.dataset.accent || "#57F5FF");
      choice.addEventListener("click", () => {
        showGame(choice);
        if (window.matchMedia("(max-width: 720px)").matches) {
          gameDetail.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    });
    if (gameDetailLink && storeModal) {
      gameDetailLink.addEventListener("click", (event) => {
        const selected = gameChoices.find((choice) => choice.classList.contains("is-active"));
        const platforms = selected?.dataset.platforms.split(",") || [];
        if (!selected || !platforms.includes("apple") || !platforms.includes("android")) return;
        if (typeof storeModal.showModal !== "function") return;

        event.preventDefault();
        storeModalTitle.textContent = "Telecharger " + selected.dataset.title;
        appStoreLink.href = selected.dataset.ios;
        googlePlayLink.href = selected.dataset.android;
        storeModal.showModal();
      });
    }

    storeModalClose?.addEventListener("click", () => storeModal.close());
    storeModal?.addEventListener("click", (event) => {
      if (event.target === storeModal) storeModal.close();
    });
  }

  if (gamePicker && gameChoices.length) {
    const scrollGallery = (direction) => {
      const card = gameChoices[0];
      const gap = Number.parseFloat(getComputedStyle(gamePicker).gap) || 14;
      const behavior = window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
      gamePicker.scrollBy({ left: direction * (card.getBoundingClientRect().width + gap), behavior });
    };

    galleryPrevious?.addEventListener("click", () => scrollGallery(-1));
    galleryNext?.addEventListener("click", () => scrollGallery(1));

    let dragPointerId = null;
    let dragStartX = 0;
    let dragStartScrollLeft = 0;
    let lastPointerX = 0;
    let lastPointerTime = 0;
    let dragVelocity = 0;
    let didDrag = false;
    let suppressClick = false;
    let inertiaFrame = 0;

    const stopGalleryInertia = () => {
      if (inertiaFrame) window.cancelAnimationFrame(inertiaFrame);
      inertiaFrame = 0;
      gamePicker.classList.remove("is-inertial");
    };

    const settleGallerySnap = () => {
      const pickerRect = gamePicker.getBoundingClientRect();
      const currentScroll = gamePicker.scrollLeft;
      const maxScroll = Math.max(0, gamePicker.scrollWidth - gamePicker.clientWidth);
      const snapPadding = Number.parseFloat(getComputedStyle(gamePicker).scrollPaddingLeft) || 0;
      const snapTarget = gameChoices.reduce((closest, choice) => {
        const cardLeft = choice.getBoundingClientRect().left;
        const candidate = Math.max(0, Math.min(maxScroll,
          currentScroll + cardLeft - pickerRect.left - gamePicker.clientLeft - snapPadding
        ));
        return Math.abs(candidate - currentScroll) < Math.abs(closest - currentScroll) ? candidate : closest;
      }, Number.POSITIVE_INFINITY);

      const startScroll = gamePicker.scrollLeft;
      const distance = snapTarget - startScroll;
      const duration = window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 110
        : Math.min(260, Math.max(150, Math.abs(distance) * 0.7));
      let startTime = null;

      const settle = (now) => {
        if (startTime === null) startTime = now;
        const progress = Math.min((now - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        gamePicker.scrollLeft = startScroll + distance * eased;

        if (progress < 1) {
          inertiaFrame = window.requestAnimationFrame(settle);
        } else {
          gamePicker.scrollLeft = snapTarget;
          inertiaFrame = 0;
          gamePicker.classList.remove("is-inertial");
        }
      };

      if (Math.abs(distance) < 0.5) {
        inertiaFrame = 0;
        gamePicker.classList.remove("is-inertial");
      } else {
        inertiaFrame = window.requestAnimationFrame(settle);
      }
    };

    const startGalleryInertia = () => {
      gamePicker.classList.add("is-inertial");
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion || Math.abs(dragVelocity) < 0.04) {
        dragVelocity = 0;
        settleGallerySnap();
        return;
      }

      let previousFrameTime = performance.now();
      const coast = (now) => {
        const elapsed = Math.min(now - previousFrameTime, 32);
        previousFrameTime = now;
        gamePicker.scrollLeft += dragVelocity * elapsed;
        dragVelocity *= Math.pow(0.92, elapsed / 16.67);

        const maxScroll = gamePicker.scrollWidth - gamePicker.clientWidth;
        if (gamePicker.scrollLeft <= 0 || gamePicker.scrollLeft >= maxScroll) {
          dragVelocity = 0;
        }

        if (Math.abs(dragVelocity) > 0.025) {
          inertiaFrame = window.requestAnimationFrame(coast);
        } else {
          dragVelocity = 0;
          settleGallerySnap();
        }
      };

      inertiaFrame = window.requestAnimationFrame(coast);
    };
    gamePicker.addEventListener("pointerdown", (event) => {
      if (event.pointerType !== "mouse" || event.button !== 0) return;
      stopGalleryInertia();
      dragPointerId = event.pointerId;
      dragStartX = event.clientX;
      dragStartScrollLeft = gamePicker.scrollLeft;
      lastPointerX = event.clientX;
      lastPointerTime = performance.now();
      dragVelocity = 0;
      didDrag = false;
    });

    window.addEventListener("pointermove", (event) => {
      if (event.pointerId !== dragPointerId) return;
      const now = performance.now();
      const elapsed = Math.max(now - lastPointerTime, 1);
      const pointerDelta = event.clientX - lastPointerX;
      lastPointerX = event.clientX;
      lastPointerTime = now;

      const deltaX = event.clientX - dragStartX;
      if (!didDrag && Math.abs(deltaX) < 5) return;
      didDrag = true;
      gamePicker.classList.add("is-dragging");
      const instantVelocity = -pointerDelta / elapsed;
      dragVelocity = Math.max(-1.4, Math.min(1.4, dragVelocity * 0.55 + instantVelocity * 0.45));
      gamePicker.scrollLeft = dragStartScrollLeft - deltaX;
      event.preventDefault();
    }, { passive: false });

    const finishGalleryDrag = (event, allowInertia = true) => {
      if (event.pointerId !== dragPointerId) return;
      dragPointerId = null;
      gamePicker.classList.remove("is-dragging");
      if (didDrag) {
        suppressClick = true;
        window.setTimeout(() => { suppressClick = false; }, 0);
        if (allowInertia) startGalleryInertia();
        else dragVelocity = 0;
      }
      didDrag = false;
    };

    window.addEventListener("pointerup", finishGalleryDrag);
    window.addEventListener("pointercancel", (event) => finishGalleryDrag(event, false));    gamePicker.addEventListener("click", (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
    }, true);
    gamePicker.addEventListener("dragstart", (event) => event.preventDefault());
  }
})();
