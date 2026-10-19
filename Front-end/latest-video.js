(() => {
  const API_URL = "https://baudo.fr/api/latest-video";

  const player = document.getElementById("latestVideoPlayer");
  const screen = player?.querySelector(".latest-video-screen");
  const bar = player?.querySelector(".latest-video-controls");
  if (!player || !screen || !bar) return;

  const svgNamespace = "http://www.w3.org/2000/svg";
  const createIcon = (className, paths) => {
    const svg = document.createElementNS(svgNamespace, "svg");
    svg.setAttribute("xmlns", svgNamespace);
    svg.setAttribute("fill", "currentColor");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("class", className);
    svg.setAttribute("aria-hidden", "true");

    paths.forEach((data) => {
      const path = document.createElementNS(svgNamespace, "path");
      path.setAttribute("d", data);
      svg.append(path);
    });

    return svg;
  };

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });

  function renderPlayer(video) {
    const iframe = document.createElement("iframe");
    iframe.className = "latest-video-iframe";
    iframe.src = video.embed;
    iframe.title = video.title;
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;

    screen.querySelector(".latest-video-placeholder")?.replaceWith(iframe);
  }

  function renderBar(video) {
    const titleArrow = createIcon("icon-title-arrow", [
      "M4 11v2h16v-2zm12 2v2h2v-2zm-2 2v2h2v-2zm-2 2v2h2v-2zm4-6V9h2v2z",
      "M14 15V7h2v8zm-2 2V5h2v12z"
    ]);
    const title = document.createElement("span");
    title.className = "latest-video-title";
    title.textContent = video.title;
    title.title = video.title;

    const titleGroup = document.createElement("div");
    titleGroup.className = "latest-video-title-group";
    titleGroup.append(titleArrow, title);

    const date = document.createElement("time");
    date.className = "latest-video-time";
    if (video.published) {
      date.dateTime = video.published;
      date.textContent = formatDate(video.published);
    }

    const link = document.createElement("a");
    link.className = "latest-video-link";
    link.href = video.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.append("YouTube ", createIcon("icon-youtube-cursor", [
      "M10 6H8v12h2v2H6V4h4v2Zm2 12h-2v-2h2v2Zm6-2h-6v-2h4v-2h2v4Zm-2-4h-2v-2h2v2Zm-2-2h-2V8h2v2Zm-2-2h-2V6h2v2Z"
    ]));

    const metaGroup = document.createElement("div");
    metaGroup.className = "latest-video-meta-group";
    metaGroup.append(date, link);
    bar.replaceChildren(titleGroup, metaGroup);
  }

  async function loadLatestVideo() {
    try {
      const res = await fetch(API_URL);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const video = await res.json();
      if (!video.success || !video.id) throw new Error("Réponse invalide");

      renderPlayer(video);
      renderBar(video);
      player.setAttribute("aria-label", `Dernière vidéo : ${video.title}`);
    } catch (err) {
      // En cas d'erreur, le placeholder d'origine reste affiché
      console.error("Dernière vidéo:", err);
    }
  }

  loadLatestVideo();
})();