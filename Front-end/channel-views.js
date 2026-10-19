(() => {
  const el = document.getElementById("channelViews");
  if (!el) return;

  const formatTick = (count) => {
    if (count >= 1_000_000) {
      return `${(Math.random() * 9 + 1).toFixed(1).replace(".", ",")} M`;
    }
    if (count >= 1_000) {
      return `${(Math.random() * 9 + 1).toFixed(1).replace(".", ",")} K`;
    }
    return Math.floor(Math.random() * Math.max(count, 1)).toLocaleString("fr-FR");
  };

  const loadChannelViews = () => {
    fetch("https://baudo.fr/api/views")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (!data.success || !data.formatted) throw new Error(data.error || "Réponse invalide");
        const viewCount = Number(data.viewCount);
        if (!Number.isFinite(viewCount) || viewCount < 0) throw new Error("Nombre de vues invalide");

        el.title = `${viewCount.toLocaleString("fr-FR")} vues`;
        let ticks = 0;
        const interval = window.setInterval(() => {
          ticks += 1;
          if (ticks > 12) {
            window.clearInterval(interval);
            el.textContent = data.formatted;
            return;
          }
          el.textContent = formatTick(viewCount);
        }, 60);
      })
      .catch((err) => {
        console.error("Vues chaîne:", err);
        el.textContent = "5M+"; // valeur de secours si l'API est injoignable
      });
  };

  loadChannelViews();
})();
